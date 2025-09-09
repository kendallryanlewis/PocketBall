import SwiftUI

struct ScorecardParseResultsView: View {
    @State var holes: [ParsedHole]
    let onSave: ([ParsedHole]) -> Void
    let onRescan: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            VStack(spacing: 8) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.title2)
                    Text("Scorecard Scanned")
                        .font(.title2)
                        .fontWeight(.semibold)
                }
                
                Text("Review and edit the extracted hole information")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Results table
            ScrollView {
                LazyVStack(spacing: 12) {
                    // Table header
                    HStack {
                        Text("Hole")
                            .font(.headline)
                            .frame(width: 50, alignment: .center)
                        Text("Par")
                            .font(.headline)
                            .frame(width: 60, alignment: .center)
                        Text("Yardage")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .center)
                        Text("Handicap")
                            .font(.headline)
                            .frame(width: 80, alignment: .center)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                    
                    // Table rows
                    ForEach(holes.indices, id: \.self) { index in
                        HoleEditRow(hole: $holes[index])
                    }
                    
                    // Add hole button
                    Button(action: addNewHole) {
                        HStack {
                            Image(systemName: "plus.circle")
                            Text("Add Hole")
                        }
                        .font(.subheadline)
                        .foregroundColor(.blue)
                    }
                    .padding(.top, 8)
                }
            }
            
            // Action buttons
            VStack(spacing: 12) {
                // Save as Course button
                Button(action: { saveCourseFromScan() }) {
                    HStack {
                        Image(systemName: "doc.badge.plus")
                        Text("Save as Course Template")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.orange)
                    .cornerRadius(10)
                }
                
                HStack(spacing: 16) {
                    Button(action: onRescan) {
                        HStack {
                            Image(systemName: "camera")
                            Text("Rescan")
                        }
                        .font(.headline)
                        .foregroundColor(.blue)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(10)
                    }
                    
                    Button(action: { onSave(holes) }) {
                        HStack {
                            Image(systemName: "checkmark")
                            Text("Save")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.green)
                        .cornerRadius(10)
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding()
    }
    
    private func addNewHole() {
        let nextHoleNumber = (holes.map { $0.holeNumber }.max() ?? 0) + 1
        let newHole = ParsedHole(
            holeNumber: nextHoleNumber,
            par: 4,
            yardage: nil,
            handicap: nil
        )
        holes.append(newHole)
    }
    
    private func saveCourseFromScan() {
        // Create a course name with timestamp
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        let courseName = "Scanned Course - \(dateFormatter.string(from: Date()))"
        
        // Create course from parsed holes
        let savedCourse = CourseManager.shared.createCourseFromParsedHoles(
            holes,
            courseName: courseName
        )
        
        // Save the course
        switch CourseManager.shared.saveCourse(savedCourse) {
        case .success:
            print("✅ Course saved successfully: \(courseName)")
            // You could add a toast notification or alert here
        case .failure(let error):
            print("❌ Failed to save course: \(error)")
            // You could add an error alert here
        }
    }
}

struct HoleEditRow: View {
    @Binding var hole: ParsedHole
    
    var body: some View {
        HStack(spacing: 8) {
            // Hole number
            Text("\(hole.holeNumber)")
                .font(.subheadline)
                .fontWeight(.medium)
                .frame(width: 50, alignment: .center)
            
            // Par selector
            Menu {
                ForEach([3, 4, 5], id: \.self) { par in
                    Button("\(par)") {
                        hole.par = par
                    }
                }
            } label: {
                Text(hole.par.map { "\($0)" } ?? "–")
                    .font(.subheadline)
                    .foregroundColor(hole.par == nil ? .secondary : .primary)
                    .frame(width: 60, alignment: .center)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray5))
                    .cornerRadius(6)
            }
            
            // Yardage input
            YardageInputField(yardage: $hole.yardage)
                .frame(maxWidth: .infinity)
            
            // Handicap selector
            Menu {
                ForEach(1...18, id: \.self) { handicap in
                    Button("\(handicap)") {
                        hole.handicap = handicap
                    }
                }
                Button("None") {
                    hole.handicap = nil
                }
            } label: {
                Text(hole.handicap.map { "\($0)" } ?? "–")
                    .font(.subheadline)
                    .foregroundColor(hole.handicap == nil ? .secondary : .primary)
                    .frame(width: 80, alignment: .center)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray5))
                    .cornerRadius(6)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 4)
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
    }
}

struct YardageInputField: View {
    @Binding var yardage: Int?
    @State private var textValue: String = ""
    @FocusState private var isFocused: Bool
    
    var body: some View {
        TextField("Yardage", text: $textValue)
            .keyboardType(.numberPad)
            .multilineTextAlignment(.center)
            .font(.subheadline)
            .padding(.vertical, 8)
            .background(Color(.systemGray5))
            .cornerRadius(6)
            .focused($isFocused)
            .onAppear {
                if let yardage = yardage {
                    textValue = "\(yardage)"
                }
            }
            .onChange(of: textValue) { _, newValue in
                if let intValue = Int(newValue), intValue > 0 {
                    yardage = intValue
                } else if newValue.isEmpty {
                    yardage = nil
                }
            }
            .onChange(of: yardage) { _, newValue in
                if let newValue = newValue {
                    textValue = "\(newValue)"
                } else if textValue != "" {
                    textValue = ""
                }
            }
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") {
                        isFocused = false
                    }
                }
            }
    }
}

#Preview {
    ScorecardParseResultsView(
        holes: [
            ParsedHole(holeNumber: 1, par: 4, yardage: 380, handicap: 5),
            ParsedHole(holeNumber: 2, par: 3, yardage: 165, handicap: 17),
            ParsedHole(holeNumber: 3, par: 5, yardage: 520, handicap: 1)
        ],
        onSave: { holes in
            print("Saving: \(holes)")
        },
        onRescan: {
            print("Rescanning")
        }
    )
}
