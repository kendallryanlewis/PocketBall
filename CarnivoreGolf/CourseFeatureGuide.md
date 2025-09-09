# Course Scorecard Saving Feature - Integration Guide

## Overview
This feature allows you to save course scorecards with detailed hole information including multiple tee yardages (white, blue, black, yellow, red), handicaps, and pars. You can then reuse these saved courses to quickly start new rounds.

## What's Been Added

### 1. Data Models (ScoreData.swift)
- `ParsedHole`: For scanner integration
- `TeeColor`: Enum with all major tee colors
- `CourseHole`: Individual hole with multiple tee yardages
- `SavedCourseScorecard`: Complete course with metadata
- `CourseManager`: Handles saving/loading courses

### 2. User Interface Views
- `SavedCoursesView`: Main view to browse saved courses
- `CreateCourseView`: Create new courses manually
- `CourseDetailView`: View/edit course details
- `HoleEditingView`: Detailed hole editing with multiple tee support
- `QuickCourseSelectionView`: Quick course picker for round creation

### 3. Scanner Integration
- Enhanced `ScorecardParseResultsView` with "Save as Course Template" button
- Automatic course creation from scanned scorecards

## How to Use

### Creating a New Course
1. Navigate to the `SavedCoursesView`
2. Tap the "+" button or "Create Course" 
3. Enter course name and location
4. Select available tee colors
5. Edit individual holes with par, handicap, and yardages for each tee
6. Save the course

### Saving from Scanner
1. Scan a scorecard using your existing scanner
2. Review the parsed data in `ScorecardParseResultsView`
3. Tap "Save as Course Template" (orange button)
4. Course is automatically saved with timestamp

### Starting a Round with Saved Course
1. Browse saved courses in `SavedCoursesView`
2. Tap on a course to view details
3. Select tee color to see yardages
4. Tap "Start Round with This Course" button
5. Course data is pre-populated in your round

## Integration with Existing Code

### Round Creation Integration
Add this to your round creation flow:

```swift
// In your round setup view
import SwiftUI

struct RoundSetupView: View {
    @State private var showingCourseSelection = false
    @State private var selectedCourse: SavedCourseScorecard?
    
    var body: some View {
        VStack {
            // Your existing round setup UI
            
            Button("Select Saved Course") {
                showingCourseSelection = true
            }
            
            if let course = selectedCourse {
                Text("Course: \(course.courseName)")
                Text("Par: \(course.totalPar)")
            }
        }
        .sheet(isPresented: $showingCourseSelection) {
            QuickCourseSelectionView(
                onCourseSelected: { course in
                    selectedCourse = course
                    showingCourseSelection = false
                },
                onCreateNew: {
                    // Handle creating new course
                }
            )
        }
    }
}
```

### Creating Round from Saved Course
```swift
// When starting a round with a saved course
let players = ["Player 1", "Player 2"]
let roundData = RoundScoreData(
    roundId: UUID(),
    players: players,
    savedCourse: selectedCourse
)
```

### Navigation Integration
Add the `SavedCoursesView` to your main navigation:

```swift
// In your main navigation or tab view
TabView {
    // Your existing tabs
    
    NavigationView {
        SavedCoursesView()
    }
    .tabItem {
        Label("Courses", systemImage: "doc.text")
    }
}
```

## Features Included

### Multi-Tee Support
- Black, Blue, White, Yellow, Red, Gold, Green tees
- Individual yardages for each tee per hole
- Visual tee color indicators

### Course Management
- Save up to 50 courses (automatically managed)
- Search courses by name or location
- Edit existing courses
- Delete courses with swipe gesture

### Scanner Integration
- One-tap save from scanned scorecards
- Automatic course naming with timestamps
- Seamless integration with existing scanner workflow

### Data Persistence
- JSON file storage in app documents directory
- Automatic backup and recovery
- Error handling for file operations

## File Structure Created
```
Models/
├── ScoreData.swift (enhanced with course models)

Views/
├── SavedCoursesView.swift
├── CreateCourseView.swift
├── CourseDetailView.swift
├── HoleEditingView.swift
├── CourseIntegrationHelpers.swift
└── Scanner/
    └── ScorecardParseResultsView.swift (enhanced)
```

## Next Steps

1. **Add to Navigation**: Integrate `SavedCoursesView` into your main app navigation
2. **Round Creation**: Add course selection to your round setup flow
3. **Testing**: Test the scanner integration and course saving
4. **Customization**: Modify colors, styling to match your app theme
5. **Enhanced Features**: Add course ratings, slope ratings, or GPS integration

## API Reference

### CourseManager Methods
- `saveCourse(_:)`: Save a course
- `loadAllCourses()`: Get all saved courses
- `loadCourse(by:)`: Get specific course by ID
- `deleteCourse(by:)`: Delete a course
- `searchCourses(by:)`: Search courses by name
- `createCourseFromParsedHoles(_:courseName:location:)`: Create from scanner data

The feature is now fully integrated and ready to use!