import SwiftUI

struct HoleEditingView: View {
    @Binding var holes: [CourseHole]
    let availableTees: [TeeColor]
    @State private var selectedHoleIndex = 0
    
    var body: some View {
        VStack {
            // Hole selector
            Picker("Hole", selection: $selectedHoleIndex) {
                ForEach(holes.indices, id: \.self) { index in
                    Text("Hole \(holes[index].holeNumber)")
                        .tag(index)
                }
            }
            .pickerStyle(WheelPickerStyle())
            .frame(height: 100)
            
            // Current hole editor
            if selectedHoleIndex < holes.count {
                Form {
                    Section(header: Text("Hole \(holes[selectedHoleIndex].holeNumber) Details")) {
                        HStack {
                            Text("Par:")
                            Spacer()
                            Picker("Par", selection: Binding(
                                get: { holes[selectedHoleIndex].par },
                                set: { newPar in
                                    holes[selectedHoleIndex] = CourseHole(
                                        holeNumber: holes[selectedHoleIndex].holeNumber,
                                        par: newPar,
                                        handicap: holes[selectedHoleIndex].handicap,
                                        yardages: holes[selectedHoleIndex].yardages
                                    )
                                }
                            )) {
                                ForEach(3...6, id: \.self) { par in
                                    Text("\(par)").tag(par)
                                }
                            }
                            .pickerStyle(SegmentedPickerStyle())
                        }
                        
                        HStack {
                            Text("Handicap:")
                            Spacer()
                            Picker("Handicap", selection: Binding(
                                get: { holes[selectedHoleIndex].handicap },
                                set: { newHandicap in
                                    holes[selectedHoleIndex] = CourseHole(
                                        holeNumber: holes[selectedHoleIndex].holeNumber,
                                        par: holes[selectedHoleIndex].par,
                                        handicap: newHandicap,
                                        yardages: holes[selectedHoleIndex].yardages
                                    )
                                }
                            )) {
                                ForEach(1...18, id: \.self) { handicap in
                                    Text("\(handicap)").tag(handicap)
                                }
                            }
                            .pickerStyle(WheelPickerStyle())
                            .frame(height: 80)
                        }
                    }
                    
                    Section(header: Text("Yardages by Tee")) {
                        ForEach(availableTees, id: \.self) { teeColor in
                            HStack {
                                Circle()
                                    .fill(Color(hex: teeColor.colorHex) ?? .gray)
                                    .frame(width: 20, height: 20)
                                
                                Text(teeColor.rawValue)
                                    .frame(width: 60, alignment: .leading)
                                
                                TextField("Yards", value: Binding(
                                    get: { holes[selectedHoleIndex].yardage(for: teeColor) ?? 0 },
                                    set: { newYardage in
                                        holes[selectedHoleIndex].setYardage(newYardage, for: teeColor)
                                    }
                                ), format: .number)
                                .keyboardType(.numberPad)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                        }
                    }
                }
            }
            
            Spacer()
        }
        .navigationTitle("Edit Holes")
    }
}

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
            .navigationTitle("Edit Course")
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Save") {
                    saveCourse()
                }
                .disabled(course.courseName.isEmpty)
            )
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
    HoleEditingView(holes: .constant([
        CourseHole(holeNumber: 1, par: 4, handicap: 1),
        CourseHole(holeNumber: 2, par: 3, handicap: 2)
    ]), availableTees: [.white, .blue, .red])
}