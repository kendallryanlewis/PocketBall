import SwiftUI

struct CourseDetailView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var course: SavedCourseScorecard
    @State private var showingEditMode = false
    @State private var selectedTeeColor: TeeColor = .white
    
    let onUpdate: (SavedCourseScorecard) -> Void
    
    init(course: SavedCourseScorecard, onUpdate: @escaping (SavedCourseScorecard) -> Void) {
        self._course = State(initialValue: course)
        self.onUpdate = onUpdate
        
        // Break down the expression to help the compiler
        let availableTees = course.availableTees
        let firstTee = availableTees.first
        let selectedTee = firstTee ?? .white
        self._selectedTeeColor = State(initialValue: selectedTee)
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // Course Header - break this into a separate computed property
                courseHeaderView
                
                // Tee Selection
                if course.availableTees.count > 1 {
                    teeSelectionView
                }
                
                // Holes List
                holesListView
                
                // Start Round Button
                startRoundButton
            }
            .navigationTitle("Course Details")
            .navigationBarItems(
                leading: Button("Close") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Edit") {
                    showingEditMode = true
                }
            )
            .sheet(isPresented: $showingEditMode) {
                EditCourseView(course: course) { updatedCourse in
                    course = updatedCourse
                    onUpdate(updatedCourse)
                }
            }
        }
    }
    
    // MARK: - View Components
    
    private var courseHeaderView: some View {
        VStack(spacing: 12) {
            Text(course.courseName)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            if let location = course.location {
                Text(location)
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            
            courseStatsView
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private var courseStatsView: some View {
        HStack(spacing: 20) {
            VStack {
                Text("\(course.totalPar)")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Par")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            VStack {
                Text("\(course.holes.count)")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Holes")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            VStack {
                let totalYardage = course.totalYardage(for: selectedTeeColor)
                Text("\(totalYardage)")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Yards")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private var teeSelectionView: some View {
        Picker("Tee Color", selection: $selectedTeeColor) {
            ForEach(course.availableTees, id: \.self) { teeColor in
                HStack {
                    let teeColorHex = teeColor.colorHex
                    let fillColor = Color(hex: teeColorHex) ?? .gray
                    Circle()
                        .fill(fillColor)
                        .frame(width: 12, height: 12)
                    Text(teeColor.rawValue)
                }
                .tag(teeColor)
            }
        }
        .pickerStyle(SegmentedPickerStyle())
        .padding(.horizontal)
    }
    
    private var holesListView: some View {
        List {
            Section(header: Text("Front 9")) {
                ForEach(course.frontNine) { hole in
                    HoleRowView(hole: hole, teeColor: selectedTeeColor)
                }
            }
            
            if !course.backNine.isEmpty {
                Section(header: Text("Back 9")) {
                    ForEach(course.backNine) { hole in
                        HoleRowView(hole: hole, teeColor: selectedTeeColor)
                    }
                }
            }
        }
    }
    
    private var startRoundButton: some View {
        Button(action: startRound) {
            HStack {
                Image(systemName: "play.fill")
                Text("Start Round with This Course")
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.green)
            .cornerRadius(12)
        }
        .padding(.horizontal)
        .padding(.bottom)
    }
    
    private func startRound() {
        // TODO: Integrate with your existing round creation flow
        // This would typically navigate to your round setup view
        // and pre-populate it with the course data
        print("Starting round with course: \(course.courseName)")
        presentationMode.wrappedValue.dismiss()
    }
}

struct HoleRowView: View {
    let hole: CourseHole
    let teeColor: TeeColor
    
    var body: some View {
        HStack {
            // Hole Number
            Text("\(hole.holeNumber)")
                .font(.headline)
                .foregroundColor(.white)
                .frame(width: 30, height: 30)
                .background(Color.blue)
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Hole \(hole.holeNumber)")
                    .font(.headline)
                
                HStack {
                    Text("Par \(hole.par)")
                        .font(.caption)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                    
                    Text("HCP \(hole.handicap)")
                        .font(.caption)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(4)
                }
            }
            
            Spacer()
            
            // Yardage
            if let yardage = hole.yardage(for: teeColor) {
                VStack(alignment: .trailing) {
                    Text("\(yardage)")
                        .font(.headline)
                        .fontWeight(.semibold)
                    Text("yards")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            } else {
                Text("N/A")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    CourseDetailView(course: SavedCourseScorecard(courseName: "Sample Course", location: "Sample Location")) { _ in }
}
