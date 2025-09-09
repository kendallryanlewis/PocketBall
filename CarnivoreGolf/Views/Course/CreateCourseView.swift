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
    @State private var showingCourseDetail = false
    
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
                // Tab Picker
                Picker("View", selection: $selectedTab) {
                    Text("Manage Courses").tag(0)
                    Text("Create New").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                if selectedTab == 0 {
                    manageCourses
                } else {
                    createNewOptions
                }
            }
            .navigationTitle("Course Manager")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .onAppear { loadCourses() }
        .sheet(isPresented: $showingCreateNew) {
            CourseEditorView(course: nil) { _ in loadCourses() }
        }
        .sheet(isPresented: $showingScanCard) {
            ScorecardScannerView { parsedHoles in
                handleScannedCourse(parsedHoles)
            }
        }
        .sheet(isPresented: $showingCourseDetail) {
            if let course = selectedCourse {
                CourseDetailView(course: course) { updatedCourse in
                    updateCourse(updatedCourse)
                }
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
        }
    }
    
    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField("Search courses...", text: $searchText)
                .textFieldStyle(RoundedBorderTextFieldStyle())
        }
        .padding(.horizontal)
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
        List {
            ForEach(filteredCourses) { course in
                CourseRowView(course: course) { selectedCourse in
                    self.selectedCourse = selectedCourse
                    showingCourseDetail = true
                } onEdit: {
                    // Edit existing course
                    selectedCourse = course
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
            .padding(.horizontal)
            
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
    
    private func loadCourses() {
        switch CourseManager.shared.loadAllCourses() {
        case .success(let courses):
            savedCourses = courses
        case .failure(let error):
            print("Failed to load courses: \(error)")
            savedCourses = []
        }
    }
    
    private func deleteCourse(_ course: SavedCourseScorecard) {
        _ = CourseManager.shared.deleteCourse(by: course.id)
        loadCourses()
    }
    
    private func deleteCourses(offsets: IndexSet) {
        for index in offsets {
            let course = filteredCourses[index]
            _ = CourseManager.shared.deleteCourse(by: course.id)
        }
        loadCourses()
    }
    
    private func updateCourse(_ updatedCourse: SavedCourseScorecard) {
        if let index = savedCourses.firstIndex(where: { $0.id == updatedCourse.id }) {
            savedCourses[index] = updatedCourse
        }
    }
    
    private func handleScannedCourse(_ parsedHoles: [ParsedHole]) {
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        let courseName = "Scanned Course - \(dateFormatter.string(from: Date()))"
        let course = CourseManager.shared.createCourseFromParsedHoles(parsedHoles, courseName: courseName)
        _ = CourseManager.shared.saveCourse(course)
        loadCourses()
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
                    Text(course.courseName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    if let location = course.location {
                        Text(location)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        CourseInfoBadge(text: "Par \(course.totalPar)", color: .blue)
                        CourseInfoBadge(text: "\(course.holes.count) holes", color: .green)
                        
                        if !course.availableTees.isEmpty {
                            CourseInfoBadge(text: "\(course.availableTees.count) tees", color: .orange)
                        }
                        
                        Spacer()
                        
                        Text(course.lastUpdated, style: .date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
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

// MARK: - Course Editor

struct CourseEditorView: View {
    @Environment(\.dismiss) private var dismiss
    let course: SavedCourseScorecard?
    let onSave: (SavedCourseScorecard) -> Void
    
    @State private var courseName = ""
    @State private var location = ""
    @State private var holes: [CourseHole] = []
    @State private var availableTees: Set<TeeColor> = [.white, .blue, .red]
    
    var body: some View {
        NavigationView {
            VStack {
                courseInfoSection
                holesSection
            }
            .navigationTitle(course == nil ? "New Course" : "Edit Course")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") { saveCourse() }
                        .disabled(courseName.isEmpty || holes.isEmpty)
                }
            }
        }
        .onAppear { loadCourseData() }
    }
    
    private var courseInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Course Information")
                    .font(.headline)
                
                TextField("Course Name", text: $courseName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                TextField("Location (Optional)", text: $location)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Available Tees")
                    .font(.headline)
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                    ForEach(TeeColor.allCases, id: \.self) { tee in
                        TeeSelectionButton(
                            tee: tee,
                            isSelected: availableTees.contains(tee)
                        ) {
                            toggleTee(tee)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private var holesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Holes")
                    .font(.headline)
                Spacer()
                Button("Add Hole") { addHole() }
                    .buttonStyle(.borderedProminent)
            }
            .padding(.horizontal)
            
            if holes.isEmpty {
                EmptyHolesView { addFirstHole() }
            } else {
                List {
                    ForEach(holes.indices, id: \.self) { index in
                        HoleEditorRow(hole: $holes[index], availableTees: Array(availableTees))
                    }
                    .onDelete(perform: deleteHole)
                }
                .listStyle(PlainListStyle())
            }
        }
    }
    
    // MARK: - Helper Functions
    
    private func loadCourseData() {
        if let course = course {
            courseName = course.courseName
            location = course.location ?? ""
            holes = course.holes
            availableTees = Set(course.availableTees)
        } else {
            holes = (1...18).map { CourseHole(holeNumber: $0, par: 4, handicap: $0) }
        }
    }
    
    private func toggleTee(_ tee: TeeColor) {
        if availableTees.contains(tee) {
            availableTees.remove(tee)
        } else {
            availableTees.insert(tee)
        }
    }
    
    private func addHole() {
        let newHole = CourseHole(holeNumber: holes.count + 1, par: 4, handicap: holes.count + 1)
        holes.append(newHole)
    }
    
    private func addFirstHole() {
        let newHole = CourseHole(holeNumber: 1, par: 4, handicap: 1)
        holes.append(newHole)
    }
    
    private func saveCourse() {
        let savedCourse = SavedCourseScorecard(
            courseName: courseName,
            location: location.isEmpty ? nil : location,
            holes: holes,
            availableTees: Array(availableTees)
        )
        
        _ = CourseManager.shared.saveCourse(savedCourse)
        onSave(savedCourse)
        dismiss()
    }
    
    private func deleteHole(at offsets: IndexSet) {
        holes.remove(atOffsets: offsets)
        // Renumber holes
        for (index, _) in holes.enumerated() {
            holes[index] = CourseHole(
                holeNumber: index + 1,
                par: holes[index].par,
                handicap: holes[index].handicap,
                yardages: holes[index].yardages
            )
        }
    }
}

// MARK: - Helper Views for Course Editor

struct TeeSelectionButton: View {
    let tee: TeeColor
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(tee.rawValue)
                .font(.caption)
                .padding(8)
                .background(isSelected ? Color.blue : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(8)
        }
    }
}

struct EmptyHolesView: View {
    let action: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "flag")
                .font(.system(size: 40))
                .foregroundColor(.secondary)
            Text("No holes added yet")
                .font(.headline)
                .foregroundColor(.secondary)
            Button("Add First Hole", action: action)
                .buttonStyle(.borderedProminent)
        }
        .frame(maxHeight: .infinity)
    }
}

struct HoleEditorRow: View {
    @Binding var hole: CourseHole
    let availableTees: [TeeColor]
    @State private var showingYardageEditor = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Hole \(hole.holeNumber)")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
                Button("Edit Yardages") {
                    showingYardageEditor = true
                }
                .font(.caption)
                .buttonStyle(.bordered)
            }
            
            HStack(spacing: 16) {
                VStack(alignment: .leading) {
                    Text("Par")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Menu {
                        ForEach([3, 4, 5], id: \.self) { par in
                            Button("\(par)") {
                                hole = CourseHole(
                                    holeNumber: hole.holeNumber,
                                    par: par,
                                    handicap: hole.handicap,
                                    yardages: hole.yardages
                                )
                            }
                        }
                    } label: {
                        Text("\(hole.par)")
                            .padding(8)
                            .background(Color(.systemGray5))
                            .cornerRadius(6)
                    }
                }
                
                VStack(alignment: .leading) {
                    Text("Handicap")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Menu {
                        ForEach(1...18, id: \.self) { handicap in
                            Button("\(handicap)") {
                                hole = CourseHole(
                                    holeNumber: hole.holeNumber,
                                    par: hole.par,
                                    handicap: handicap,
                                    yardages: hole.yardages
                                )
                            }
                        }
                    } label: {
                        Text("\(hole.handicap)")
                            .padding(8)
                            .background(Color(.systemGray5))
                            .cornerRadius(6)
                    }
                }
                
                Spacer()
            }
            
            // Yardage preview
            if !hole.yardages.isEmpty {
                HStack {
                    ForEach(availableTees.prefix(3), id: \.self) { tee in
                        if let yardage = hole.yardages[tee] {
                            VStack {
                                Text(tee.rawValue)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                Text("\(yardage)")
                                    .font(.caption)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                    if hole.yardages.count > 3 {
                        Text("+\(hole.yardages.count - 3) more")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
        .sheet(isPresented: $showingYardageEditor) {
            YardageEditorView(hole: $hole, availableTees: availableTees)
        }
    }
}

struct YardageEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var hole: CourseHole
    let availableTees: [TeeColor]
    @State private var yardages: [TeeColor: String] = [:]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Hole \(hole.holeNumber) Yardages")) {
                    ForEach(availableTees, id: \.self) { tee in
                        HStack {
                            Text(tee.rawValue)
                                .fontWeight(.medium)
                            Spacer()
                            TextField("Yards", text: Binding(
                                get: { yardages[tee] ?? "" },
                                set: { yardages[tee] = $0 }
                            ))
                            .keyboardType(.numberPad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 100)
                        }
                    }
                }
            }
            .navigationTitle("Edit Yardages")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveYardages()
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            loadYardages()
        }
    }
    
    private func loadYardages() {
        for tee in availableTees {
            if let yardage = hole.yardages[tee] {
                yardages[tee] = "\(yardage)"
            }
        }
    }
    
    private func saveYardages() {
        var newYardages: [TeeColor: Int] = [:]
        for (tee, yardageString) in yardages {
            if let yardage = Int(yardageString), yardage > 0 {
                newYardages[tee] = yardage
            }
        }
        
        hole = CourseHole(
            holeNumber: hole.holeNumber,
            par: hole.par,
            handicap: hole.handicap,
            yardages: newYardages
        )
    }
}

#Preview {
    CreateCourseView()
}
