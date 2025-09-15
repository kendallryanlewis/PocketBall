//
//  EditCourseView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/9/25.
//

import SwiftUI

struct EditCourseView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var course: SavedCourseScorecard
    @State private var selectedTees: Set<TeeColor>
    
    let onSave: (SavedCourseScorecard) -> Void
    
    init(course: SavedCourseScorecard, onSave: @escaping (SavedCourseScorecard) -> Void) {
        self._course = State(initialValue: course)
        self._selectedTees = State(initialValue: Set(course.availableTees))
        self.onSave = onSave
    }
    
    var body: some View {
        
        NavigationView {
            ZStack{
                BackgroundView()
                Form {
                    Section(header: Text("Course Information")) {
                        TextField("Course Name", text: $course.courseName)
                        TextField("Location (Optional)", text: Binding(
                            get: { course.location ?? "" },
                            set: { course.location = $0.isEmpty ? nil : $0 }
                        ))
                    }
                    
                    Section(header: Text("Available Tees")) {
                        ForEach(TeeColor.allCases, id: \.self) { teeColor in
                            HStack {
                                Button(action: {
                                    if selectedTees.contains(teeColor) {
                                        selectedTees.remove(teeColor)
                                    } else {
                                        selectedTees.insert(teeColor)
                                    }
                                }) {
                                    HStack {
                                        Image(systemName: selectedTees.contains(teeColor) ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(selectedTees.contains(teeColor) ? .blue : .gray)
                                        
                                        Circle()
                                            .fill(Color(hex: teeColor.colorHex) ?? .gray)
                                            .frame(width: 20, height: 20)
                                        
                                        Text(teeColor.rawValue)
                                            .foregroundColor(.primary)
                                        
                                        Spacer()
                                    }
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                    }
                    
                    Section(header: Text("Holes")) {
                        NavigationLink(destination: HoleEditingView(holes: $course.holes, availableTees: Array(selectedTees))) {
                            HStack {
                                Text("Edit Holes")
                                Spacer()
                                Text("\(course.holes.count) holes")
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }.font(.body)
        }
    }
    
    private func saveCourse() {
        course.availableTees = Array(selectedTees)
        
        switch CourseManager.shared.saveCourse(course) {
        case .success:
            onSave(course)
            presentationMode.wrappedValue.dismiss()
        case .failure(let error):
            print("Failed to save course: \(error)")
        }
    }
}

#Preview {
    EditCourseView(
        course: SavedCourseScorecard(
            courseName: "Sample Course",
            location: "Sample Location",
            holes: [],
            availableTees: []
        ),
        onSave: { _ in }
    )
}
