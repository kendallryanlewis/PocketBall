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
    var onStartRound: (() -> Void)? = nil
    let roundTypes = ["Stroke", "Match", "Scramble", "Skins", "Carnivore", "Randomize", "Reverse Mulligans"]
    
    // Validation for enabling Start/Save button
    var canStartRound: Bool {
        !courseName.trimmingCharacters(in: .whitespaces).isEmpty &&
        !players.isEmpty &&
        players.allSatisfy { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
    }
    
    // Populate state from existing round if editing
    init(existingRound: Round? = nil, onStartRound: (() -> Void)? = nil) {
        self.existingRound = existingRound
        self.onStartRound = onStartRound
        if let round = existingRound {
            _courseName = State(initialValue: round.courseName)
            _date = State(initialValue: round.date)
            _numberOfPlayers = State(initialValue: round.numberOfPlayers)
            _isPrivate = State(initialValue: round.isPrivate)
            _holes = State(initialValue: round.holes)
            _roundPlayers = State(initialValue: round.roundPlayers)
            _roundType = State(initialValue: round.roundType)
            _players = State(initialValue: round.players)
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Scrollable content
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    // Course name input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("COURSE NAME")
                            .font(.system(size: 13, weight: .medium, design: .default))
                            .foregroundColor(.secondary)
                            .textCase(.uppercase)
                            .kerning(2)
                        TextField("Enter course name", text: $courseName)
                            .font(.system(size: 20, weight: .regular, design: .default))
                            .foregroundColor(.primary)
                            .padding(.bottom, 8)
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.secondary.opacity(0.2))
                    }
                    .padding(.horizontal, 28)
                    .padding(.top, 32)
                    .padding(.bottom, 32)
                    
                    // Round details section - redesigned without icons
                    VStack(alignment: .leading, spacing: 24) {
                        Text("ROUND DETAILS")
                            .font(.system(size: 13, weight: .medium, design: .default))
                            .foregroundColor(.secondary)
                            .textCase(.uppercase)
                            .kerning(2)
                        
                        // Clean grid layout
                        VStack(spacing: 20) {
                            // First row: Date and Players
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
                                // Third row: Private toggle
                                HStack {
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Private")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.primary)
                                        Toggle("", isOn: $isPrivate)
                                            .labelsHidden()
                                            .toggleStyle(SwitchToggleStyle(tint: .green))
                                    }
                                    Spacer()
                                }
                            }
                            
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.secondary.opacity(0.1))
                            
                            // Second row: Holes and Round Type
                            HStack(spacing: 24) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Round Type")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.primary)
                                    Picker("Round Type", selection: $roundType) {
                                        ForEach(roundTypes, id: \.self) { type in
                                            Text(type)
                                        }
                                    }
                                    .pickerStyle(MenuPickerStyle())
                                    .labelsHidden()
                                }
                                Spacer()
                            }
                        }
                        .padding(20)
                        .background(Color(.systemGray6))
                        .cornerRadius(4)
                    }
                    .padding(.horizontal, 28)
                    .padding(.bottom, 32)
                    
                    // Players section
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("PLAYERS")
                                .font(.system(size: 13, weight: .medium, design: .default))
                                .foregroundColor(.secondary)
                                .textCase(.uppercase)
                                .kerning(2)
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
                    .padding(.horizontal, 28)
                }
                .padding(.bottom, 100) // Adequate space for Start Round button
            }
            
            // Fixed Start Round button
            VStack {
                Divider()
                    .background(Color.secondary.opacity(0.2))
                Button(action: {
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
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(canStartRound ? Color.primary : Color.gray.opacity(0.4))
                        .cornerRadius(4)
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 16)
                .disabled(!canStartRound)
                .alert(isPresented: $showSaveError) {
                    Alert(title: Text("Save Failed"), message: Text(saveErrorMessage), dismissButton: .default(Text("OK")))
                }
                
                Button(action: { dismiss() }) {
                    Text("Back")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.green)
                        .frame(maxWidth: .infinity)
                        .cornerRadius(10)
                }
            }
            .background(Color(.systemBackground))
        }
        .background(Color(.systemBackground))
        .navigationBarBackButtonHidden(true)
    }
}

#Preview {
    NewRoundView()
}
