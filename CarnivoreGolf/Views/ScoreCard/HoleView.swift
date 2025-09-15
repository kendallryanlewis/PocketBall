//
//  HoleView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI

// PreferenceKey to track scroll offset
struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct HoleView: View {
    let round: Round
    let scores: [[Int]]
    let par: [Int]
    @Environment(\.dismiss) private var dismiss
    @State private var currentHole: Int
    @State private var currentPlayerIndex = 0
    @State private var roundScoreData: RoundScoreData
    @State private var scrollOffset: CGFloat = 0
    @Environment(\.colorScheme) var colorScheme
    
    let onScoresChanged: ((RoundScoreData) -> Void)?

    // Add club randomization state
    @StateObject private var clubRandomizer = ClubRandomizer.shared
    @State private var selectedClub: GolfClub? = nil
    @State private var showClubRandomizer = false
    
    // Initialize with proper score data loading
    init(round: Round, scores: [[Int]], par: [Int], initialHole: Int? = nil, initialPlayerIndex: Int? = nil, onScoresChanged: ((RoundScoreData) -> Void)? = nil) {
        self.round = round
        self.scores = scores
        self.par = par
        self.onScoresChanged = onScoresChanged
        // Set initial hole and player
        _currentHole = State(initialValue: initialHole ?? 1)
        _currentPlayerIndex = State(initialValue: initialPlayerIndex ?? 0)
        // Load existing score data or create new
        if let existingData = try? ScoreDataManager.shared.loadScoreData(for: round.id).get() {
            self._roundScoreData = State(initialValue: existingData)
        } else {
            // Create new score data
            let newScoreData = RoundScoreData(roundId: round.id, players: round.players, holes: round.holes)
            self._roundScoreData = State(initialValue: newScoreData)
        }
    }
    
    // Computed property for round type
    private var roundTypeEnum: RoundType {
        RoundType.from(string: round.roundType)
    }
    
    private var currentPlayer: String {
        round.players.indices.contains(currentPlayerIndex) ? round.players[currentPlayerIndex] : ""
    }
    
    private var currentPar: Int {
        roundScoreData.par.indices.contains(currentHole - 1) ? roundScoreData.par[currentHole - 1] : 4
    }

    var body: some View {
        ZStack {
            BackgroundView().ignoresSafeArea()
            VStack(spacing: 0) {
                // --- ROUND TYPE INDICATOR ---
                VStack() {
                    Text(roundTypeEnum.displayName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    HStack(spacing: 5) {
                        Image(systemName: roundTypeEnum.icon)
                            .font(.system(size: 10))
                            .foregroundColor(roundTypeEnum.color)
                            .frame(width: 20, height: 20)
                            .background(roundTypeEnum.color.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                        Text(roundTypeEnum.shortDescription)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.bottom, 8)
                .padding(.top, 40)
                // --- END ROUND TYPE INDICATOR ---
                headerView.padding()
                    .shadow(color: Color.black.opacity(scrollOffset > 2 ? 0.18 : 0), radius: 8, y: 4)
                Divider().background(Color.white.opacity(0.1))
                ScrollView {
                    GeometryReader { geo in
                        Color.clear
                            .preference(key: ScrollOffsetPreferenceKey.self, value: geo.frame(in: .named("scrollView")).minY)
                    }
                    .frame(height: 0)
                    mainContentView
                }.padding(.bottom)
                .coordinateSpace(name: "scrollView")
                .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
                    scrollOffset = -value
                }
                bottomNavigation
            }
        }.font(.body)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onAppear {
            initializeScores()
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 8) {
            HStack {
                Spacer()
                VStack(spacing: 2) {
                    Text("Hole #\(currentHole)")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    HStack(spacing: 4) {
                        Text("PAR")
                            .font(.caption)
                            .foregroundColor(.primary.opacity(0.7))
                        Button(action: { showParEditDialog() }) {
                            Text("\(currentPar)")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color.primary.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                }
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            
            // Custom styled hole selector
            let totalHoles = round.holes
            let start = max(1, currentHole - 2)
            let end = min(totalHoles, currentHole + 2)
            HStack(spacing: 0) {
                ForEach(start...end, id: \.self) { hole in
                    let offset = abs(hole - currentHole)
                    let isSelected = hole == currentHole
                    let (fontSize, opacity, color, scale): (CGFloat, Double, Color, CGFloat) = {
                        switch offset {
                        case 0:
                            // Center hole: green, largest, full opacity
                            return (32, 1.0, .green, 1.8)
                        case 1:
                            // Adjacent holes: white, 0.5 opacity, medium size
                            return (22, 0.3, (colorScheme == .dark ? Color.white : Color.black), 1.6)
                        case 2:
                            // Two away: white, 0.2 opacity, small size
                            return (16, 0.1, (colorScheme == .dark ? Color.white : Color.black), 1.6)
                        default:
                            // Should not appear, but fallback
                            return (16, 0.0, (colorScheme == .dark ? Color.white : Color.black), 1.6)
                        }
                    }()
                    Button(action: { currentHole = hole }) {
                        Text("\(hole)")
                            .font(.system(size: fontSize, weight: .bold))
                            .foregroundColor(color)
                            .opacity(opacity)
                            .scaleEffect(scale)
                            .frame(maxWidth: .infinity)
                            .contentShape(Rectangle())
                            .animation(.easeInOut(duration: 0.2), value: isSelected)
                    }
                    .disabled(isSelected)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
        }.background(colorScheme == .dark ? Color.white.opacity(0.1) : Color.black.opacity(0.1)).cornerRadius(4
        )
    }
    
    // Add function to show par edit dialog
    private func showParEditDialog() {
        let alert = UIAlertController(title: "Edit Par", message: "Hole \(currentHole)", preferredStyle: .alert)
        alert.addTextField { textField in
            textField.placeholder = "Par (3, 4, or 5)"
            textField.keyboardType = .numberPad
            textField.text = "\(currentPar)"
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Save", style: .default) { _ in
            if let text = alert.textFields?.first?.text,
               let newPar = Int(text), newPar >= 3 && newPar <= 5 {
                roundScoreData.par[currentHole - 1] = newPar
                roundScoreData.updateLastModified()
                ScoreDataManager.shared.saveScoreData(roundScoreData)
                onScoresChanged?(roundScoreData)
            }
        })
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(alert, animated: true)
        }
    }

    private var mainContentView: some View {
        VStack(spacing: 20) {
            playerSelector
            // Show user detail card for selected player
            UserDetailCard(
                name: currentPlayer,
                score: getCurrentScore() - currentPar,
                stat1: 19.7, // Replace with real stat if available
                stat2: 13,   // Replace with real stat if available
                isCurrentUser: currentPlayerIndex == 0 // Adjust logic if needed
            )
            scoringDetails
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }
    
    private var playerSelector: some View {
        VStack(spacing: 12) {
            HStack {
                ForEach(Array(round.players.enumerated()), id: \.offset) { index, player in
                    Button(action: { currentPlayerIndex = index }) {
                        VStack(spacing: 4) {
                            Circle()
                                .fill(Color.gray.opacity(0.3))
                                .frame(width: 50, height: 50)
                                .overlay(
                                    Text(player.prefix(2).uppercased())
                                        .font(.caption)
                                        .fontWeight(.bold)
                                        .foregroundColor(colorScheme == .dark ? .white : .black)
                                )
                            if index == currentPlayerIndex {
                                Circle()
                                    .fill(.green)
                                    .frame(width: 6, height: 6)
                            } else {
                                Circle()
                                    .fill(.clear)
                                    .frame(width: 6, height: 6)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private var scoringDetails: some View {
        VStack(spacing: 16) {
            // Add club randomization section for specific game types
            if roundTypeEnum == .randomize || roundTypeEnum == .sticktalk {
                clubRandomizationSection
            }
            scoringRow(title: "Score", value: getCurrentScore(), binding: scoreBinding())
            scoringRow(title: "Putts", value: getCurrentPutts(), binding: puttsBinding())
            scoringRow(title: "Sand Shots", value: getCurrentSandShots(), binding: sandShotsBinding())
            scoringRow(title: "Penalties", value: getCurrentPenalties(), binding: penaltiesBinding())
            booleanRow(title: "Fairway", value: getCurrentFairway(), binding: fairwayBinding())
            booleanRow(title: "GIR", value: getCurrentGIR(), binding: girBinding())
        }
    }
    
    // MARK: - Bindings for current player/hole
    private func scoreBinding() -> Binding<Int> {
        Binding<Int>(
            get: { roundScoreData.playerScores[currentPlayer]?.scores[safe: currentHole - 1] ?? 0 },
            set: { newValue in
                if roundScoreData.playerScores[currentPlayer] == nil {
                    roundScoreData.playerScores[currentPlayer] = PlayerScoreData(holes: round.holes)
                }
                roundScoreData.playerScores[currentPlayer]?.scores[safe: currentHole - 1] = newValue
                saveScoreData()
                onScoresChanged?(roundScoreData)
            }
        )
    }
    private func puttsBinding() -> Binding<Int> {
        Binding<Int>(
            get: { roundScoreData.playerScores[currentPlayer]?.putts[safe: currentHole - 1] ?? 0 },
            set: { newValue in
                if roundScoreData.playerScores[currentPlayer] == nil {
                    roundScoreData.playerScores[currentPlayer] = PlayerScoreData(holes: round.holes)
                }
                roundScoreData.playerScores[currentPlayer]?.putts[safe: currentHole - 1] = newValue
                saveScoreData()
                onScoresChanged?(roundScoreData)
            }
        )
    }
    private func sandShotsBinding() -> Binding<Int> {
        Binding<Int>(
            get: { roundScoreData.playerScores[currentPlayer]?.sandShots[safe: currentHole - 1] ?? 0 },
            set: { newValue in
                if roundScoreData.playerScores[currentPlayer] == nil {
                    roundScoreData.playerScores[currentPlayer] = PlayerScoreData(holes: round.holes)
                }
                roundScoreData.playerScores[currentPlayer]?.sandShots[safe: currentHole - 1] = newValue
                saveScoreData()
                onScoresChanged?(roundScoreData)
            }
        )
    }
    private func penaltiesBinding() -> Binding<Int> {
        Binding<Int>(
            get: { roundScoreData.playerScores[currentPlayer]?.penalties[safe: currentHole - 1] ?? 0 },
            set: { newValue in
                if roundScoreData.playerScores[currentPlayer] == nil {
                    roundScoreData.playerScores[currentPlayer] = PlayerScoreData(holes: round.holes)
                }
                roundScoreData.playerScores[currentPlayer]?.penalties[safe: currentHole - 1] = newValue
                saveScoreData()
                onScoresChanged?(roundScoreData)
            }
        )
    }
    private func fairwayBinding() -> Binding<Bool?> {
        Binding<Bool?>(
            get: { roundScoreData.playerScores[currentPlayer]?.fairways[safe: currentHole - 1] ?? nil },
            set: { newValue in
                if roundScoreData.playerScores[currentPlayer] == nil {
                    roundScoreData.playerScores[currentPlayer] = PlayerScoreData(holes: round.holes)
                }
                roundScoreData.playerScores[currentPlayer]?.fairways[safe: currentHole - 1] = newValue
                saveScoreData()
                onScoresChanged?(roundScoreData)
            }
        )
    }
    private func girBinding() -> Binding<Bool?> {
        Binding<Bool?>(
            get: { roundScoreData.playerScores[currentPlayer]?.gir[safe: currentHole - 1] ?? nil },
            set: { newValue in
                if roundScoreData.playerScores[currentPlayer] == nil {
                    roundScoreData.playerScores[currentPlayer] = PlayerScoreData(holes: round.holes)
                }
                roundScoreData.playerScores[currentPlayer]?.gir[safe: currentHole - 1] = newValue
                saveScoreData()
                onScoresChanged?(roundScoreData)
            }
        )
    }

    private var clubRandomizationSection: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: roundTypeEnum.icon)
                    .font(.system(size: 20))
                    .foregroundColor(roundTypeEnum.color)
                Text(roundTypeEnum == .randomize ? "Assigned Club" : "Club Randomizer")
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
            }
            
            if roundTypeEnum == .randomize {
                // For "Randomize" game type: show pre-assigned club
                randomizeClubDisplay
            } else if roundTypeEnum == .sticktalk {
                // For "Stick Talk" game type: show randomizer button
                stickTalkRandomizer
            }
        }
        .padding()
        .background(roundTypeEnum.color.opacity(0.1))
        .cornerRadius(12)
    }
    
    private var randomizeClubDisplay: some View {
        VStack(spacing: 8) {
            if let assignedClub = clubRandomizer.getAssignedClub(for: currentPlayer, holeNumber: currentHole, roundId: round.id) {
                HStack {
                    Image(systemName: assignedClub.icon)
                        .font(.system(size: 24))
                        .foregroundColor(.orange)
                    Text(assignedClub.displayName)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    Spacer()
                }
                .padding()
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            } else {
                Text("No club assigned for this hole")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .italic()
            }
        }
    }
    
    private var stickTalkRandomizer: some View {
        VStack(spacing: 12) {
            if let selectedClub = selectedClub {
                // Show selected club
                HStack {
                    Image(systemName: selectedClub.icon)
                        .font(.system(size: 24))
                        .foregroundColor(.blue)
                    VStack(alignment: .leading) {
                        Text(selectedClub.displayName)
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        Text("Use this club for your shot")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Button(action: { clearSelectedClub() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.red)
                    }
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            }
            
            // Randomize button
            Button(action: { randomizeClubForCurrentPlayer() }) {
                HStack {
                    Image(systemName: "shuffle")
                        .font(.system(size: 16, weight: .semibold))
                    Text(selectedClub == nil ? "Randomize Club" : "Get New Club")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.vertical, 12)
                .padding(.horizontal, 20)
                .background(Color.blue)
                .cornerRadius(8)
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
    
    // MARK: - Club Randomization Helper Methods
    
    private func randomizeClubForCurrentPlayer() {
        let randomClub = clubRandomizer.getRandomClubForPlayer(
            playerName: currentPlayer,
            holeNumber: currentHole,
            roundId: round.id
        )
        
        withAnimation(.easeInOut(duration: 0.3)) {
            selectedClub = randomClub
        }
    }
    
    private func clearSelectedClub() {
        withAnimation(.easeInOut(duration: 0.3)) {
            selectedClub = nil
        }
    }
    
    // Update the onAppear method to handle club assignments
    private func initializeScores() {
        // Score data is now managed by roundScoreData, no additional initialization needed
        saveScoreData()
        
        // Initialize club assignments for "Randomize" game type
        if roundTypeEnum == .randomize && clubRandomizer.getAssignments(for: round.id) == nil {
            // Pre-randomize clubs for all players and holes
            let _ = clubRandomizer.preRandomizeClubsForRound(round)
        }
        
        // Load existing club assignment for current player/hole if it exists
        if roundTypeEnum == .sticktalk {
            selectedClub = clubRandomizer.getAssignedClub(for: currentPlayer, holeNumber: currentHole, roundId: round.id)
        }
    }
    
    private func getCurrentScore() -> Int {
        return roundScoreData.playerScores[currentPlayer]?.scores[safe: currentHole - 1] ?? 0
    }
    
    private func getCurrentPutts() -> Int {
        return roundScoreData.playerScores[currentPlayer]?.putts[safe: currentHole - 1] ?? 0
    }
    
    private func getCurrentSandShots() -> Int {
        return roundScoreData.playerScores[currentPlayer]?.sandShots[safe: currentHole - 1] ?? 0
    }
    
    private func getCurrentPenalties() -> Int {
        return roundScoreData.playerScores[currentPlayer]?.penalties[safe: currentHole - 1] ?? 0
    }
    
    private func getCurrentFairway() -> Bool? {
        return roundScoreData.playerScores[currentPlayer]?.fairways[safe: currentHole - 1] ?? nil
    }
    
    private func getCurrentGIR() -> Bool? {
        return roundScoreData.playerScores[currentPlayer]?.gir[safe: currentHole - 1] ?? nil
    }
    
    private func setScore(_ score: Int) {
        if roundScoreData.playerScores[currentPlayer] != nil {
            roundScoreData.playerScores[currentPlayer]?.scores[currentHole - 1] = score
            saveScoreData()
        }
    }
    
    private func setFairway(_ value: Bool?) {
        if roundScoreData.playerScores[currentPlayer] != nil {
            roundScoreData.playerScores[currentPlayer]?.fairways[currentHole - 1] = value
            saveScoreData()
        }
    }
    
    private func setGIR(_ value: Bool?) {
        if roundScoreData.playerScores[currentPlayer] != nil {
            roundScoreData.playerScores[currentPlayer]?.gir[currentHole - 1] = value
            saveScoreData()
        }
    }
    
    private func incrementValue(for type: String) {
        guard roundScoreData.playerScores[currentPlayer] != nil else { return }
        
        switch type {
        case "Score":
            let current = roundScoreData.playerScores[currentPlayer]?.scores[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.scores[currentHole - 1] = current + 1
        case "Putts":
            let current = roundScoreData.playerScores[currentPlayer]?.putts[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.putts[currentHole - 1] = current + 1
        case "Sand Shots":
            let current = roundScoreData.playerScores[currentPlayer]?.sandShots[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.sandShots[currentHole - 1] = current + 1
        case "Penalties":
            let current = roundScoreData.playerScores[currentPlayer]?.penalties[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.penalties[currentHole - 1] = current + 1
        default:
            break
        }
        saveScoreData()
    }
    
    private func decrementValue(for type: String) {
        guard roundScoreData.playerScores[currentPlayer] != nil else { return }
        
        switch type {
        case "Score":
            let current = roundScoreData.playerScores[currentPlayer]?.scores[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.scores[currentHole - 1] = max(1, current - 1)
        case "Putts":
            let current = roundScoreData.playerScores[currentPlayer]?.putts[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.putts[currentHole - 1] = max(0, current - 1)
        case "Sand Shots":
            let current = roundScoreData.playerScores[currentPlayer]?.sandShots[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.sandShots[currentHole - 1] = max(0, current - 1)
        case "Penalties":
            let current = roundScoreData.playerScores[currentPlayer]?.penalties[currentHole - 1] ?? 0
            roundScoreData.playerScores[currentPlayer]?.penalties[currentHole - 1] = max(0, current - 1)
        default:
            break
        }
        saveScoreData()
    }
    
    private func saveScoreData() {
        roundScoreData.updateLastModified()
        ScoreDataManager.shared.saveScoreData(roundScoreData)
    }
    
    private func nextHole() {
        if currentHole < round.holes {
            currentHole += 1
        }
    }
    
    private func previousHole() {
        if currentHole > 1 {
            currentHole -= 1
        }
    }
    
    private func scoringRow(title: String, value: Int, binding: Binding<Int>) -> some View {
        HStack {
            Text(title)
                .font(.body)
                .foregroundColor(.primary)
                .frame(width: 100, alignment: .leading)
            Spacer()
            Button(action: { binding.wrappedValue = max(0, binding.wrappedValue - 1) }) {
                Image(systemName: "minus")
                    .foregroundColor(.primary)
                    .frame(width: 30, height: 30)
                    .background(Color.primary.opacity(0.1))
                    .cornerRadius(4)
            }
            Text("\(binding.wrappedValue)")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.green)
                .frame(width: 40)
            Button(action: { binding.wrappedValue += 1 }) {
                Image(systemName: "plus")
                    .foregroundColor(.primary)
                    .frame(width: 30, height: 30)
                    .background(Color.primary.opacity(0.1))
                    .cornerRadius(4)
            }
        }.padding(.bottom)
    }
    private func booleanRow(title: String, value: Bool?, binding: Binding<Bool?>) -> some View {
        HStack {
            Text(title)
                .font(.body)
                .foregroundColor(.primary)
                .frame(width: 100, alignment: .leading)
            Spacer()
            HStack(spacing: 13) {
                Button(action: { binding.wrappedValue = false }) {
                    Image(systemName: value == false ? "xmark" : "xmark")
                        .foregroundColor(value == false ? .primary : Color(UIColor.systemBackground).opacity(0.7))
                        .frame(width: 30, height: 30)
                        .background(value == false ? Color.green : Color.primary.opacity(0.1))
                        .cornerRadius(4)
                }
                Button(action: { binding.wrappedValue = true }) {
                    Image(systemName: value == true ? "checkmark" : "checkmark")
                        .foregroundColor(value == true ? .primary : Color(UIColor.systemBackground).opacity(0.7))
                        .frame(width: 30, height: 30)
                        .background(value == true ? Color.green : Color.primary.opacity(0.1))
                        .cornerRadius(4)
                }
                Button(action: { binding.wrappedValue = nil }) {
                    Image(systemName: "arrow.right")
                        .foregroundColor(value == nil ? .primary : Color(UIColor.systemBackground).opacity(0.7))
                        .frame(width: 30, height: 30)
                        .background(value == nil ? Color.green : Color.primary.opacity(0.1))
                        .cornerRadius(4)
                }
            }
        }.padding(.bottom)
    }
    
    private var bottomNavigation: some View {
        return HStack(spacing: 0) {
            // Previous Arrow
            Button(action: { previousHole() }) {
                Image(systemName: "arrow.left")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 15, height: 15)
                    .foregroundColor(.black)
            }
            .frame(width:100)
            .frame(maxHeight: .infinity)
            .background(.green)

            // Scorecard Button
            Button(action: { dismiss() }) {
                VStack(spacing: 4) {
                    Text("Scorecard")
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                }
                .font(.caption)
                .frame(maxWidth: .infinity, maxHeight: 50)
            }
            .background(colorScheme == .dark ? Color.white.opacity(0.1) : Color.black.opacity(0.1))

            // Next Arrow
            Button(action: { nextHole() }) {
                Image(systemName: "arrow.right")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 15, height: 15)
                    .foregroundColor(.black)
            }
            .frame(width: 100)
            .frame(maxHeight: .infinity)
            .background(.green)
        }
        .frame(height: 50)
        .cornerRadius(4).padding()
    }
}

// User detail card for selected player
struct UserDetailCard: View {
    let name: String
    let score: Int
    let stat1: Double
    let stat2: Int
    let isCurrentUser: Bool
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 6) {
                Text(name)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                HStack(spacing: 8) {
                    Text(String(format: "%.1f", stat1))
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color(red: 210/255, green: 233/255, blue: 90/255))
                        .clipShape(Capsule())
                    Text("\(stat2)")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.yellow)
                        .clipShape(Capsule())
                    if isCurrentUser {
                        Text("You")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.gray.opacity(0.7))
                            .clipShape(Capsule())
                    }
                }
            }
            Spacer()
            Text(score > 0 ? "+\(score)" : "\(score)")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.primary)
                .padding(.top, 2)
        }
        .padding()
        .background(colorScheme == .dark ? Color.white.opacity(0.1) : Color.black.opacity(0.1))
        .cornerRadius(4)
    }
}

#Preview {
    let players = ["Bob Davidson", "David", "Diana", "James"]
    let holes = 18
    let scores = Array(repeating: Array(repeating: 4, count: holes), count: players.count)
    let par = Array(repeating: 4, count: holes)
    return HoleView(
        round: Round(
            courseName: "Pebble Beach",
            date: Date(),
            numberOfPlayers: players.count,
            isPrivate: false,
            holes: holes,
            roundPlayers: players.count,
            roundType: "Stroke Play",
            players: players,
            isCompleted: false
        ),
        scores: scores,
        par: par
    )
}
