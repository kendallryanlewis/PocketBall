import SwiftUI

struct CreateCourseView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
    @State private var savedCourses: [SavedCourseScorecard] = []
    @State private var showingCreateNew = false
    @State private var showingScanCard = false
    @State private var searchText = ""
    @State private var showDeleteAlert = false
    @State private var courseToDelete: SavedCourseScorecard?
    @State private var selectedCourse: SavedCourseScorecard?
    @State private var courseForEditing: SavedCourseScorecard?
    @State private var showingCourseDetail = false
    @State private var isLoading = false
    
    var filteredCourses: [SavedCourseScorecard] {
        if searchText.isEmpty {
            return savedCourses
        } else {
            return savedCourses.filter { course in
                course.courseName.localizedCaseInsensitiveContains(searchText) ||
                course.location?.localizedCaseInsensitiveContains(searchText) == true
            }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack {
                Button(action: { dismiss() }) {
                    GenericHeader(title:"Courses", iconName: "chevron.left")
                }
                    
                // Tab Picker
                Picker("View", selection: $selectedTab) {
                    Text("Manage Courses").tag(0)
                    Text("Create New").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                
                if selectedTab == 0 {
                    manageCourses
                } else {
                    createNewOptions
                }
            }
            .padding(.horizontal, 40)
            .navigationBarHidden(true)
            .navigationBarBackButtonHidden(true)
        }.navigationBarBackButtonHidden(true)
        .onAppear {
            Task {
                await loadCourses()
            }
        }
        .refreshable {
            await loadCourses()
        }
        .sheet(item: $selectedCourse) { course in
            CourseDetailView(course: course) { updatedCourse in
                updateCourse(updatedCourse)
            }
        }
        .sheet(isPresented: $showingCreateNew) {
            CourseEditorView(course: courseForEditing) { _ in
                Task {
                    await loadCourses()
                }
            }
        }
        .sheet(isPresented: $showingScanCard) {
            ScorecardScannerView { parsedHoles in
                handleScannedCourse(parsedHoles)
            }
        }
        .alert("Delete Course", isPresented: $showDeleteAlert, presenting: courseToDelete) { course in
            Button("Delete", role: .destructive) { deleteCourse(course) }
            Button("Cancel", role: .cancel) { }
        } message: { course in
            Text("Are you sure you want to delete '\(course.courseName)'? This action cannot be undone.")
        }
    }
    
    // MARK: - Views
    
    private var manageCourses: some View {
        VStack {
            searchBar
            
            if filteredCourses.isEmpty {
                emptyStateView
            } else {
                courseListView
            }
        }.padding(.top)
    }
    
    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField("Search courses...", text: $searchText)
                .textFieldStyle(RoundedBorderTextFieldStyle())
        }
        .font(.body)
    }
    
    @ViewBuilder
    private var emptyStateView: some View {
        if savedCourses.isEmpty {
            EmptyStateView(
                icon: "building.columns",
                title: "No Courses Created",
                subtitle: "Create your first course to get started",
                buttonTitle: "Create Course"
            ) {
                selectedTab = 1
            }
        } else {
            EmptyStateView(
                icon: "magnifyingglass",
                title: "No courses found",
                subtitle: "Try a different search term",
                buttonTitle: nil
            ) { }
        }
    }
    
    private var courseListView: some View {
        Group {
            if isLoading {
                ProgressView("Loading courses...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List {
                    ForEach(filteredCourses) { course in
                        CourseRowView(course: course) { tappedCourse in
                            // Reset first to ensure state change is detected
                            self.selectedCourse = nil
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                                self.selectedCourse = tappedCourse
                            }
                        } onEdit: {
                            // Edit existing course
                            courseForEditing = course
                            showingCreateNew = true
                        } onDelete: {
                            courseToDelete = course
                            showDeleteAlert = true
                        }
                    }
                    .onDelete(perform: deleteCourses)
                }
                .listStyle(PlainListStyle())
            }
        }
    }
    
    private var createNewOptions: some View {
        VStack(spacing: 24) {
            headerSection
            
            VStack(spacing: 16) {
                CreateOptionCard(
                    icon: "pencil.circle.fill",
                    iconColor: .blue,
                    title: "Create Manually",
                    subtitle: "Design your course hole by hole with custom pars, handicaps, and yardages"
                ) {
                    selectedCourse = nil // Ensure we're creating a new course
                    showingCreateNew = true
                }
                
                CreateOptionCard(
                    icon: "camera.fill",
                    iconColor: .green,
                    title: "Scan Scorecard",
                    subtitle: "Use your camera to scan an existing scorecard and create a course from it"
                ) {
                    showingScanCard = true
                }
            }
            
            Spacer()
        }
    }
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Text("Create a New Course")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Choose how you'd like to create your course")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 40)
    }
    
    // MARK: - Functions
    
    @MainActor
    private func loadCourses() async {
        isLoading = true
        
        // Add a small delay to ensure proper UI update
        try? await Task.sleep(nanoseconds: 50_000_000) // 50ms
        
        switch CourseManager.shared.loadAllCourses() {
        case .success(let courses):
            self.savedCourses = courses
        case .failure(let error):
            print("Failed to load courses: \(error)")
            self.savedCourses = []
        }
        
        isLoading = false
    }
    
    private func deleteCourse(_ course: SavedCourseScorecard) {
        _ = CourseManager.shared.deleteCourse(by: course.id)
        Task {
            await loadCourses()
        }
    }
    
    private func deleteCourses(offsets: IndexSet) {
        for index in offsets {
            let course = filteredCourses[index]
            _ = CourseManager.shared.deleteCourse(by: course.id)
        }
        Task {
            await loadCourses()
        }
    }
    
    private func updateCourse(_ updatedCourse: SavedCourseScorecard) {
        Task {
            // Save the updated course to storage (CourseManager likely handles create/update via saveCourse)
            let result = CourseManager.shared.saveCourse(updatedCourse)
            
            await MainActor.run {
                switch result {
                case .success:
                    // Update local state on successful save
                    if let index = savedCourses.firstIndex(where: { $0.id == updatedCourse.id }) {
                        savedCourses[index] = updatedCourse
                    }
                    print("Course updated successfully")
                case .failure(let error):
                    print("Failed to update course: \(error)")
                    // Reload courses to ensure UI is in sync
                    Task {
                        await loadCourses()
                    }
                }
            }
        }
    }
    
    private func handleScannedCourse(_ parsedHoles: [ParsedHole]) {
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        let courseName = "Scanned Course - \(dateFormatter.string(from: Date()))"
        let course = CourseManager.shared.createCourseFromParsedHoles(parsedHoles, courseName: courseName)
        _ = CourseManager.shared.saveCourse(course)
        Task {
            await loadCourses()
        }
    }
}

// MARK: - Supporting Views

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String
    let buttonTitle: String?
    let action: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if let buttonTitle = buttonTitle {
                Button(buttonTitle, action: action)
                    .buttonStyle(.borderedProminent)
                    .font(.body)
                    .tint(.green)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct CreateOptionCard: View {
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: icon)
                            .font(.title2)
                            .foregroundColor(iconColor)
                        Text(title)
                            .font(.headline)
                            .foregroundColor(.primary)
                    }
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
                    .font(.body)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct CourseRowView: View {
    let course: SavedCourseScorecard
    let onTap: (SavedCourseScorecard) -> Void
    let onEdit: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        Button(action: { onTap(course) }) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack{
                        VStack(alignment: .leading){
                            Text(course.courseName)
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            if let location = course.location {
                                Text(location)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        Spacer()
                        VStack{
                            Text(course.lastUpdated, style: .date)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Spacer()
                        }
                    }
                    
                    HStack{
                        HStack {
                            CourseInfoBadge(text: "Par \(course.totalPar)", color: .blue)
                            CourseInfoBadge(text: "\(course.holes.count) holes", color: .green)
                            
                            if !course.availableTees.isEmpty {
                                CourseInfoBadge(text: "\(course.availableTees.count) tees", color: .orange)
                            }
                            Spacer()
                            Menu {
                                Button("Edit", action: onEdit)
                                Button("Delete", role: .destructive, action: onDelete)
                            } label: {
                                Image(systemName: "ellipsis")
                                    .font(.title3)
                                    .foregroundColor(.secondary)
                                    .padding(8)
                            }
                        }
                        Spacer()
                        
                    }
                    
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct CourseInfoBadge: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(color.opacity(0.1))
            .cornerRadius(4)
    }
}

#Preview {
    CreateCourseView()
}
