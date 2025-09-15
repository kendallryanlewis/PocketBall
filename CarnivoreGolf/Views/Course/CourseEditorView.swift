//
//  CourseEditorView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/9/25.
//

import SwiftUI

struct CourseEditorView: View {
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.dismiss) private var dismiss
    let course: SavedCourseScorecard?
    let onSave: (SavedCourseScorecard) -> Void
    
    @State private var courseName = ""
    @State private var location = ""
    @State private var holes: [CourseHole] = []
    @State private var availableTees: Set<TeeColor> = [.white, .blue, .red]
    
    // Add this initializer to CourseEditorView
    init(course: SavedCourseScorecard?, onSave: @escaping (SavedCourseScorecard) -> Void) {
        self.course = course
        self.onSave = onSave
        _courseName = State(initialValue: course?.courseName ?? "")
        _location = State(initialValue: course?.location ?? "")
        _holes = State(initialValue: course?.holes ?? (1...18).map { CourseHole(holeNumber: $0, par: 4, handicap: $0) })
        _availableTees = State(initialValue: Set(course?.availableTees ?? [.white, .blue, .red]))
    }
    
    var body: some View {
        NavigationView {
            ZStack{
                BackgroundView()
                VStack {
                    GenericHeader(title: course == nil ? "Create Course" : (course?.courseName ?? "Edit Course"), iconName: "")
                    CreateManualCourse(courseName: $courseName, location: $location, availableTees: $availableTees, toggleTee: toggleTee)
                    holesSection
                    Button("Save") { saveCourse() }
                        .disabled(courseName.isEmpty || holes.isEmpty)
                        .font(.body)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(Color(UIColor.systemBackground))
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(colorScheme == .light ? Color.black : Color.white)
                        .cornerRadius(8)
                }.padding(.top)
                    .padding(.horizontal, 40)
                    .padding(.bottom, 40)
            }
            .font(.body)
        }
        .onAppear { loadCourseData() }
    }
    
    private var holesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Holes")
                    .font(.headline)
                Spacer()
                if(holes.count < 18){
                    Button("Add Hole") { addHole() }
                        .buttonStyle(.borderedProminent)
                        .font(.caption)
                        .tint(.gray)
                }
            }
            
            if holes.isEmpty {
                EmptyHolesView { addFirstHole() }
            } else {
                ScrollView(.vertical, showsIndicators: false) {
                    ForEach(holes.indices, id: \.self) { index in
                        HoleEditorRow(hole: $holes[index], availableTees: Array(availableTees))
                    }
                    .onDelete(perform: deleteHole)
                }
                .listStyle(PlainListStyle())
            }
        }.padding(.top, 40)
    }
    
    // MARK: - Helper Functions
    
    private func loadCourseData() {
        // Only load default data if no course is provided
        if course == nil {
            holes = (1...18).map { CourseHole(holeNumber: $0, par: 4, handicap: $0) }
        }
        // Course data is already loaded in the initializer, no need to reload it
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

struct CreateManualCourse: View {
    @Binding var courseName: String
    @Binding var location: String
    @Binding var availableTees: Set<TeeColor>
    let toggleTee: (TeeColor) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Course Information")
                    .font(.headline)
                TextField("Course Name", text: $courseName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                TextField("Location (Optional)", text: $location)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Available Tees")
                    .font(.headline)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(TeeColor.allCases, id: \.self) { tee in
                            TeeSelectionButton(
                                tee: tee,
                                isSelected: availableTees.contains(tee)
                            ) {
                                toggleTee(tee)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .font(.body)
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
        .padding(.bottom)
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

struct TeeSelectionButton: View {
    let tee: TeeColor
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(tee.rawValue)
                .font(.caption)
                .padding(8)
                .background(isSelected ? Color.green : Color(.systemGray5))
                .foregroundColor(.white)
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


/*#Preview {
    struct PreviewWrapper: View {
        @State var courseName = "Sample Course"
        @State var location = "Sample Location"
        @State var availableTees: Set<TeeColor> = [.blue, .white]

        func toggleTee(_ tee: TeeColor) {
            if availableTees.contains(tee) {
                availableTees.remove(tee)
            } else {
                availableTees.insert(tee)
            }
        }

        var body: some View {
            CreateManualCourse(
                courseName: $courseName,
                location: $location,
                availableTees: $availableTees,
                toggleTee: toggleTee
            )
        }
    }

    return PreviewWrapper()
}*/

#Preview {
    CourseEditorView(
        course: nil,
        onSave: { _ in }
    )
}
