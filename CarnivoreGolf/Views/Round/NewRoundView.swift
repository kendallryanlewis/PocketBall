import SwiftUI
import Foundation

struct NewRoundView: View {
    @Environment(\.dismiss) private var dismiss
    // Add optional round and editing flag
    var existingRound: Round? = nil
    var isEditing: Bool { existingRound != nil }
    // Use @StateObject for editing initialization
    @State private var courseName: String = ""
    @State private var date: Date = Date()
    @State private var numberOfPlayers: Int = 1
    @State private var isPrivate: Bool = false
    @State private var holes: Int = 18
    @State private var roundPlayers: Int = 1
    @State private var roundType: String = "Stroke"
    @State private var players: [String] = []
    @State private var showSaveError: Bool = false
    @State private var saveErrorMessage: String = ""
    @State private var showRoundTypeDescription: Bool = false // Add state for showing description
    
    // Course selection states
    @State private var existingCourses: [SavedCourseScorecard] = []
    @State private var showCourseSelection = false
    @State private var hasSelectedCourse = false // Track if course was selected from list
    @State private var selectedCourse: SavedCourseScorecard? = nil // Store selected course data
    @State private var showNoCourseOptions = false // Show popover when no courses exist
    @State private var showCreateCourse = false // Show create course view
    
    var onStartRound: (() -> Void)? = nil
    let roundTypes = [
        "Stroke", "Match", "Scramble", "Skins", "Carnivore", "Randomize club", "Reverse Mulligans",
        "Alternate Shot", "Best Ball", "Worst Ball", "Bingo Bango Bongo", "Stick Talk"
    ]
    
    // Add computed property for current round type
    private var currentRoundType: RoundType {
        return RoundType.from(string: roundType)
    }

    // Validation for enabling Start/Save button
    var canStartRound: Bool {
        !courseName.trimmingCharacters(in: .whitespaces).isEmpty &&
        !players.isEmpty &&
        players.allSatisfy { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
    }
    
    // Populate state from existing round if editing
    init(existingRound: Round? = nil, onStartRound: (() -> Void)? = nil, prefilledCourse: SavedCourseScorecard? = nil) {
        self.existingRound = existingRound
        self.onStartRound = onStartRound
        self.selectedCourse = prefilledCourse
        
        if let round = existingRound {
            _courseName = State(initialValue: round.courseName)
            _date = State(initialValue: round.date)
            _numberOfPlayers = State(initialValue: round.numberOfPlayers)
            _isPrivate = State(initialValue: round.isPrivate)
            _holes = State(initialValue: round.holes)
            _roundPlayers = State(initialValue: round.roundPlayers)
            _roundType = State(initialValue: round.roundType)
            _players = State(initialValue: round.players.isEmpty ? [""] : round.players)
        } else if let course = prefilledCourse {
            // Pre-populate with course data
            _courseName = State(initialValue: course.courseName)
            _holes = State(initialValue: course.holes.count)
            _hasSelectedCourse = State(initialValue: true)
            _players = State(initialValue: [""])
        } else {
            // Initialize with one empty player for new rounds
            _players = State(initialValue: [""])
        }
    }
    
    var body: some View {
        ZStack{
            BackgroundView()
            VStack(spacing: 0) {
                Button(action: { dismiss() }) {
                    GenericHeader(title: isEditing ? "Edit Round" : "New Round", iconName: "chevron.left")
                }
                // Scrollable content
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 0) {
                        courseNameSection
                        roundDetailsSection
                        playersSection
                    }
                }
                
                // Fixed Start Round button
                VStack {
                    Divider()
                        .background(Color.secondary.opacity(0.2))
                    Button(action: {
                        // Print all selected course data if available
                        if let course = selectedCourse {
                            print("Selected Course Data:")
                            if let jsonData = try? JSONEncoder().encode(course),
                               let jsonString = String(data: jsonData, encoding: .utf8) {
                                print("Course JSON:", jsonString)
                            } else {
                                print("Course (debug):")
                                debugPrint(course)
                            }
                        } else {
                            print("No course selected for this round.")
                        }
                        
                        let round: Round
                        if isEditing, let existingRound = existingRound {
                            // Preserve the existing round's ID when updating
                            round = Round(
                                id: existingRound.id,
                                courseName: courseName,
                                date: date,
                                numberOfPlayers: numberOfPlayers,
                                isPrivate: isPrivate,
                                holes: holes,
                                roundPlayers: roundPlayers,
                                roundType: roundType,
                                players: players,
                                isCompleted: existingRound.isCompleted
                            )
                        } else {
                            // Create new round with new ID
                            round = Round(
                                courseName: courseName,
                                date: date,
                                numberOfPlayers: numberOfPlayers,
                                isPrivate: isPrivate,
                                holes: holes,
                                roundPlayers: roundPlayers,
                                roundType: roundType,
                                players: players
                            )
                        }
                        
                        if isEditing {
                            let result = RoundHistoryManager.shared.updateRound(round)
                            switch result {
                            case .success:
                                onStartRound?()
                                dismiss()
                            case .failure(let error):
                                saveErrorMessage = error.localizedDescription
                                showSaveError = true
                            }
                        } else {
                            let result = RoundHistoryManager.shared.saveRound(round)
                            switch result {
                            case .success:
                                // Create scorecard data with course par values if course is selected
                                createScorecardWithCourseData(for: round)
                                onStartRound?()
                                dismiss()
                            case .failure(let error):
                                saveErrorMessage = error.localizedDescription
                                showSaveError = true
                            }
                        }
                    }) {
                        Text(isEditing ? "SAVE CHANGES" : "START ROUND")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(canStartRound ? .secondary : .white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(canStartRound ? Color.primary : Color.gray.opacity(0.4))
                            .cornerRadius(4)
                    }
                    .padding(.vertical, 16)
                    .disabled(!canStartRound)
                    .alert(isPresented: $showSaveError) {
                        Alert(title: Text("Save Failed"), message: Text(saveErrorMessage), dismissButton: .default(Text("OK")))
                    }
                }
            }.padding(40)
            .navigationBarBackButtonHidden(true)
        }
        .onAppear {
            loadExistingCourses()
        }
        .sheet(isPresented: $showRoundTypeDescription) {
            RoundTypeDescriptionView(roundType: currentRoundType)
        }
        .sheet(isPresented: $showCourseSelection) {
            NavigationView {
                if existingCourses.isEmpty {
                    VStack {
                        Text("No saved courses found.")
                            .foregroundColor(.secondary)
                            .padding()
                        Spacer()
                    }
                    .navigationTitle("Select Course")
                    .navigationBarTitleDisplayMode(.inline)
                } else {
                    List(existingCourses, id: \.id) { course in
                        Button(action: {
                            courseName = course.courseName
                            hasSelectedCourse = true
                            selectedCourse = course // Store the selected course data
                            holes = course.holes.count // Update holes count
                            showCourseSelection = false
                        }) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(course.courseName)
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                if let location = course.location {
                                    Text(location)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                HStack {
                                    Text("Par \(course.totalPar)")
                                        .font(.caption)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.blue.opacity(0.1))
                                        .cornerRadius(4)
                                    Text("\(course.holes.count) holes")
                                        .font(.caption)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.green.opacity(0.1))
                                        .cornerRadius(4)
                                    Spacer()
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    .navigationBarTitleDisplayMode(.inline)
                }
            }
        }
        .sheet(isPresented: $showCreateCourse) {
            // Add CreateCourseView here when available
            NavigationView {
                VStack {
                    Text("Create Course")
                        .font(.title)
                        .padding()
                    Text("Course creation view would go here")
                        .foregroundColor(.secondary)
                    Spacer()
                    Button("Cancel") {
                        showCreateCourse = false
                    }
                    .padding()
                }
                .navigationTitle("New Course")
                .navigationBarTitleDisplayMode(.inline)
            }
        }
    }
    
    // MARK: - Extracted Sections
    private var courseNameSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            GenericTitle(title: "COURSE NAME")
            HStack {
                TextField("Enter course name", text: $courseName)
                    .font(.system(size: 20, weight: .regular, design: .default))
                    .foregroundColor(hasSelectedCourse ? .secondary : .primary)
                    .disabled(hasSelectedCourse)
                if hasSelectedCourse {
                    Button("Clear") {
                        courseName = ""
                        hasSelectedCourse = false
                        selectedCourse = nil
                        holes = 18
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.red)
                } else {
                    Button("Select") {
                        loadExistingCourses()
                        if existingCourses.isEmpty {
                            showNoCourseOptions = true
                        } else {
                            showCourseSelection = true
                        }
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.green)
                    .popover(isPresented: $showNoCourseOptions) {
                        VStack(spacing: 16) {
                            Text("No Courses Available")
                                .font(.headline)
                                .foregroundColor(.primary)
                            Text("You don't have any saved courses. Would you like to:")
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                            VStack(spacing: 12) {
                                Button(action: {
                                    showNoCourseOptions = false
                                    showCreateCourse = true
                                }) {
                                    Text("Create New Course")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 40)
                                        .background(Color.green)
                                        .cornerRadius(8)
                                }
                                Button(action: {
                                    showNoCourseOptions = false
                                    useDefaultCourse()
                                }) {
                                    Text("Use Default 18-Hole Course")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.green)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 40)
                                        .background(Color.clear)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 8)
                                                .stroke(Color.green, lineWidth: 1)
                                        )
                                }
                                Button(action: {
                                    showNoCourseOptions = false
                                }) {
                                    Text("Cancel")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(20)
                        .frame(width: 300)
                    }
                }
            }
            .padding(.bottom, 8)
            Rectangle()
                .frame(height: 1)
                .foregroundColor(.secondary.opacity(0.2))
        }
        .padding(.top, 32)
        .padding(.bottom, 32)
    }

    private var roundDetailsSection: some View {
        VStack(alignment: .leading, spacing: 24) {
            GenericTitle(title: "ROUND DETAILS")
            VStack(spacing: 20) {
                HStack(spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Date")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.primary)
                        DatePicker("", selection: $date, displayedComponents: .date)
                            .labelsHidden()
                            .datePickerStyle(.compact)
                    }
                    Spacer()
                    HStack {
                        Spacer()
                        VStack(alignment: .center, spacing: 8) {
                            Text("Private")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                            Toggle("", isOn: $isPrivate)
                                .labelsHidden()
                                .toggleStyle(SwitchToggleStyle(tint: .green))
                        }
                    }
                }
            }
            .padding(20)
            .background(Color(.systemGray6))
            .cornerRadius(4)
            GenericTitle(title: "Round Type")
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    VStack(spacing: 24) {
                        HStack() {
                            Picker("Round Type", selection: $roundType) {
                                ForEach(roundTypes, id: \.self) { type in
                                    Text(type)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                            .labelsHidden()
                            .tint(.green)
                            Spacer()
                            Button(action: {
                                showRoundTypeDescription = true
                            }) {
                                Image(systemName: "info.circle")
                                    .font(.system(size: 20))
                                    .foregroundColor(.blue)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    HStack(spacing: 8) {
                        Image(systemName: currentRoundType.icon)
                            .foregroundColor(currentRoundType.color)
                        Text(currentRoundType.shortDescription)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    .padding(.top, 4)
                }
            }
            .padding(20)
            .background(Color(.systemGray6))
            .cornerRadius(4)
        }
        .padding(.bottom, 32)
    }

    private var playersSection: some View {
        VStack(spacing: 16) {
            HStack {
                GenericTitle(title: "PLAYERS")
                Spacer()
                Button(action: {
                    players.append("")
                }) {
                    Text("ADD PLAYER")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.green)
                        .textCase(.uppercase)
                        .kerning(1)
                }
                .buttonStyle(PlainButtonStyle())
            }
            ForEach(players.indices, id: \.self) { idx in
                HStack {
                    TextField("Player name", text: $players[idx])
                        .font(.system(size: 16, weight: .regular))
                        .foregroundColor(.primary)
                    Spacer()
                    Button(action: { players.remove(at: idx) }) {
                        Image(systemName: "minus.circle")
                            .font(.system(size: 18))
                            .foregroundColor(.red.opacity(0.7))
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(.bottom, 4)
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.secondary.opacity(0.1))
            }
        }
    }
    
    private func loadExistingCourses() {
        DispatchQueue.main.async {
            switch CourseManager.shared.loadAllCourses() {
            case .success(let courses):
                self.existingCourses = courses
            case .failure(let error):
                print("Failed to load courses: \(error)")
                self.existingCourses = []
            }
        }
    }
    
    private func createScorecardWithCourseData(for round: Round) {
        // Only create scorecard data if we have a selected course with hole data
        guard let course = selectedCourse else {
            print("No course data available for scorecard creation")
            return
        }
        
        // Create the scorecard data with complete course hole information
        let roundScoreData = RoundScoreData(roundId: round.id, players: round.players, courseHoles: course.holes)
        
        // Save the scorecard data
        let result = ScoreDataManager.shared.saveScoreData(roundScoreData)
        switch result {
        case .success:
            if let holeInfo = roundScoreData.holeInfo {
                print("Hole info count: \(holeInfo.count)")
                // Print first few holes for verification
                for (index, hole) in holeInfo.prefix(3).enumerated() {
                    print("Hole \(hole.holeNumber): Par \(hole.par), Handicap \(hole.handicap), Yardages: \(hole.yardages)")
                }
            }
        case .failure(let error):
            print("Failed to create scorecard with course data: \(error)")
        }
    }
    
    private func useDefaultCourse() {
        // Create a default 18-hole course with standard par values
        courseName = "Default Course"
        hasSelectedCourse = false // Allow user to edit the name
        selectedCourse = nil // No specific course data
        holes = 18
        print("Using default 18-hole course")
    }
}

#Preview {
    NewRoundView()
}
