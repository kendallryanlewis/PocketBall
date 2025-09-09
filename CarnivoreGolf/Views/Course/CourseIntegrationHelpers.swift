import SwiftUI

// MARK: - Integration Extensions for Existing Round Creation

extension RoundScoreData {
    // Initialize from a saved course
    init(roundId: UUID, players: [String], savedCourse: SavedCourseScorecard) {
        self.roundId = roundId
        self.par = savedCourse.holes.map { $0.par }
        self.lastUpdated = Date()
        
        // Initialize empty score data for each player
        var playerScores: [String: PlayerScoreData] = [:]
        for player in players {
            playerScores[player] = PlayerScoreData(holes: savedCourse.holes.count)
        }
        self.playerScores = playerScores
    }
}

// MARK: - Quick Course Selection View
// This can be integrated into your existing round creation flow

struct QuickCourseSelectionView: View {
    @State private var savedCourses: [SavedCourseScorecard] = []
    @State private var searchText = ""
    let onCourseSelected: (SavedCourseScorecard) -> Void
    let onCreateNew: () -> Void
    
    var filteredCourses: [SavedCourseScorecard] {
        if searchText.isEmpty {
            return savedCourses.prefix(5).map { $0 } // Show recent 5
        } else {
            return savedCourses.filter { course in
                course.courseName.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Select Course")
                .font(.headline)
            
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search courses...", text: $searchText)
            }
            .padding(8)
            .background(Color(.systemGray6))
            .cornerRadius(8)
            
            // Quick course list
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(filteredCourses) { course in
                        Button(action: {
                            onCourseSelected(course)
                        }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(course.courseName)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                        .foregroundColor(.primary)
                                    
                                    if let location = course.location {
                                        Text(location)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Text("Par \(course.totalPar) • \(course.holes.count) holes")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal, 12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    
                    // Create new course option
                    Button(action: onCreateNew) {
                        HStack {
                            Image(systemName: "plus.circle")
                                .foregroundColor(.blue)
                            Text("Create New Course")
                                .fontWeight(.medium)
                            Spacer()
                        }
                        .padding(.vertical, 8)
                        .padding(.horizontal, 12)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .frame(maxHeight: 200)
        }
        .onAppear {
            loadCourses()
        }
    }
    
    private func loadCourses() {
        switch CourseManager.shared.loadAllCourses() {
        case .success(let courses):
            savedCourses = courses
        case .failure(let error):
            print("Failed to load courses: \(error)")
        }
    }
}

// MARK: - Scanner Integration Extension
// This extends your existing scanner to save courses

extension ScorecardParseResultsView {
    func createSaveCourseButton(holes: [ParsedHole]) -> some View {
        Button("Save as Course Template") {
            // Create a course from parsed holes
            let courseName = "Scanned Course \(Date().formatted(date: .abbreviated, time: .omitted))"
            let savedCourse = CourseManager.shared.createCourseFromParsedHoles(
                holes,
                courseName: courseName
            )
            
            // Save the course
            switch CourseManager.shared.saveCourse(savedCourse) {
            case .success:
                print("Course saved successfully: \(courseName)")
            case .failure(let error):
                print("Failed to save course: \(error)")
            }
        }
        .font(.headline)
        .foregroundColor(.white)
        .padding()
        .background(Color.green)
        .cornerRadius(10)
    }
}

#Preview {
    QuickCourseSelectionView(
        onCourseSelected: { _ in },
        onCreateNew: { }
    )
}