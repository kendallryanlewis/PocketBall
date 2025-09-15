//
//  ScorecardView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI

struct ScorecardView: View {
    let round: Round
    let currentUser: String
    let onBack: () -> Void
    
    @State private var roundScoreData: RoundScoreData
    @State private var refreshTrigger = false
    @State private var selectedHole: SelectedHole? = nil
    @State private var selectedHoleAndPlayer: SelectedHoleAndPlayer? = nil
    
    private let standardRowHeight: CGFloat = 55
    private let cellWidth: CGFloat = 50
    private let totalColumnWidth: CGFloat = 70
    
    var holes: [Int] { Array(1...round.holes) }
    var par: [Int] { roundScoreData.par }
    
    var playerScores: [[Int]] {
        return round.players.map { player in
            return roundScoreData.playerScores[player]?.scores ?? Array(repeating: 0, count: round.holes)
        }
    }
    
    private var roundTypeEnum: RoundType {
        RoundType.from(string: round.roundType)
    }
    
    init(round: Round, currentUser: String, onBack: @escaping () -> Void) {
        self.round = round
        self.currentUser = currentUser
        self.onBack = onBack
        
        // Initialize score data
        if let existingData = try? ScoreDataManager.shared.loadScoreData(for: round.id).get() {
            self._roundScoreData = State(initialValue: existingData)
        } else {
            // Create new score data if none exists - provide default courseHoles if needed
            let newData = RoundScoreData(roundId: round.id, players: round.players, courseHoles: [])
            self._roundScoreData = State(initialValue: newData)
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerSection
            
            // Score Grid
            ScrollView {
                scoreGrid
                    .padding(.top, 16)
            }
        }
        .background(Color(UIColor.systemGroupedBackground))
        .navigationBarBackButtonHidden(true)
        .cornerRadius(4)
        .onAppear {
            refreshScoreData()
        }
        .sheet(item: $selectedHole) { selected in
            HoleView(
                round: round,
                scores: playerScores,
                par: par,
                initialHole: selected.id,
                onScoresChanged: { updatedScoreData in
                    roundScoreData = updatedScoreData
                    refreshTrigger.toggle()
                }
            )
        }
        .sheet(item: $selectedHoleAndPlayer) { selected in
            HoleView(
                round: round,
                scores: playerScores,
                par: par,
                initialHole: selected.hole,
                initialPlayerIndex: selected.playerIndex,
                onScoresChanged: { updatedScoreData in
                    roundScoreData = updatedScoreData
                    refreshTrigger.toggle()
                }
            )
        }
    }
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            // Back button and title
            HStack {
                Button(action: onBack) {
                    GenericHeader(title: "Scorecard", iconName: "chevron.left")
                }
                Spacer()
            }
            
            // Course info
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(round.courseName)
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("\(round.date.formatted(date: .abbreviated, time: .omitted))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Round type badge
                HStack(spacing: 8) {
                    Image(systemName: roundTypeEnum.icon)
                        .font(.system(size: 16))
                        .foregroundColor(roundTypeEnum.color)
                    
                    Text(roundTypeEnum.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(roundTypeEnum.color.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(UIColor.systemBackground))
    }
    
    private var scoreGrid: some View {
        HStack(spacing: 0) {
            playerNamesColumn
            scrollableScoreColumns
            totalColumn
        }
        .background(Color(UIColor.systemBackground))
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private var playerNamesColumn: some View {
        VStack(spacing: 0) {
            // Header
            Text("Hole")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .frame(width: playerNameColumnWidth, height: standardRowHeight * 0.7, alignment: .leading)
                .padding(.leading)
            // Par label
            Text("Par")
                .font(.subheadline)
                .fontWeight(.medium)
                .frame(width: playerNameColumnWidth, height: standardRowHeight, alignment: .leading)
                .padding(.leading)
                .foregroundColor(.black)
            // Player names
            ForEach(Array(round.players.enumerated()), id: \.offset) { idx, player in
                Text(player)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .frame(width: playerNameColumnWidth, height: standardRowHeight, alignment: .leading)
                    .padding(.leading)
                    .lineLimit(1)
            }
        }
    }
    
    private var scrollableScoreColumns: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            VStack(spacing: 0) {
                holeNumbersRow
                parValuesRow
                playerScoreRows
            }
        }
    }
    
    private var holeNumbersRow: some View {
        HStack(spacing: 0) {
            ForEach(holes, id: \.self) { hole in
                VStack(spacing: 2) {
                    Button(action: { selectedHole = SelectedHole(id: hole) }) {
                        Text("\(hole)")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)
                            .frame(width: cellWidth, height: standardRowHeight - 18)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .frame(width: cellWidth, height: standardRowHeight * 0.7)
            }
        }
    }
    
    private var parValuesRow: some View {
        HStack(spacing: 0) {
            ForEach(par.indices, id: \.self) { idx in
                Text("\(par[idx])")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .frame(width: cellWidth, height: standardRowHeight)
            }
        }
    }
    
    private var playerScoreRows: some View {
        ForEach(Array(round.players.enumerated()), id: \.offset) { idx, player in
            playerScoreRow(playerIndex: idx, player: player)
        }
    }
    
    private func playerScoreRow(playerIndex: Int, player: String) -> some View {
        HStack(spacing: 0) {
            let playerScoresForIdx = playerScores[safe: playerIndex] ?? []
            ForEach(0..<holes.count, id: \.self) { holeIdx in
                scoreCellView(
                    playerIndex: playerIndex,
                    holeIndex: holeIdx,
                    score: playerScoresForIdx[safe: holeIdx] ?? 0,
                    holePar: par[safe: holeIdx] ?? 4
                )
            }
        }
    }
    
    private func scoreCellView(playerIndex: Int, holeIndex: Int, score: Int, holePar: Int) -> some View {
        let isSelected = (selectedHoleAndPlayer?.hole == holeIndex + 1 && selectedHoleAndPlayer?.playerIndex == playerIndex)
        
        return Button(action: {
            selectedHoleAndPlayer = SelectedHoleAndPlayer(hole: holeIndex + 1, playerIndex: playerIndex)
        }) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(score > 0 ? scoreBackgroundColor(score: score, par: holePar) : Color.gray.opacity(0.08))
                    .overlay(
                        isSelected ?
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.accentColor, lineWidth: 3) :
                            nil
                    )
                Text(score > 0 ? "\(score)" : "+")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(score > 0 ? scoreTextColor(score: score, par: holePar) : Color.blue)
                    .opacity(score > 0 ? 1.0 : 0.7)
            }
            .frame(width: cellWidth - 4, height: standardRowHeight - 8)
        }
        .buttonStyle(PlainButtonStyle())
        .frame(width: cellWidth, height: standardRowHeight)
    }
    
    private var totalColumn: some View {
        VStack(spacing: 0) {
            // Header
            Text("Total")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .frame(width: totalColumnWidth, height: standardRowHeight * 0.7)
            // Par total
            Text("\(par.reduce(0, +))")
                .font(.subheadline)
                .fontWeight(.semibold)
                .frame(width: totalColumnWidth, height: standardRowHeight)
            // Player totals
            ForEach(Array(round.players.enumerated()), id: \.offset) { idx, _ in
                let totalScore = playerScores[safe: idx]?.reduce(0, +) ?? 0
                Text(totalScore > 0 ? "\(totalScore)" : "")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .frame(width: totalColumnWidth, height: standardRowHeight)
            }
        }
    }

    private var playerNameColumnWidth: CGFloat {
        let longestName = round.players.max { $0.count < $1.count } ?? ""
        let estimatedWidth = CGFloat(longestName.count) * 8 + 32
        return max(estimatedWidth, 100)
    }
    
    private func scoreBackgroundColor(score: Int, par: Int) -> Color {
        guard score > 0 else { return Color.clear }
        
        switch score - par {
        case ...(-2): return Color.yellow.opacity(0.3) // Eagle or better
        case -1: return Color.green.opacity(0.3) // Birdie
        case 0: return Color.blue.opacity(0.1) // Par
        case 1: return Color.orange.opacity(0.3) // Bogey
        default: return Color.red.opacity(0.3) // Double bogey or worse
        }
    }
    
    private func scoreTextColor(score: Int, par: Int) -> Color {
        guard score > 0 else { return Color.primary.opacity(0.3) }
        
        switch score - par {
        case ...(-1): return Color.primary
        case 0: return Color.primary
        default: return Color.primary
        }
    }
    
    private func getCurrentScore(player: String, hole: Int) -> Int {
        let playerIndex = round.players.firstIndex(of: player) ?? 0
        return playerScores[safe: playerIndex]?[safe: hole - 1] ?? 0
    }
    
    private func updateScore(player: String, hole: Int, score: Int) {
        // Update the score data directly
        if var playerScore = roundScoreData.playerScores[player] {
            // Ensure the scores array is large enough
            while playerScore.scores.count < hole {
                playerScore.scores.append(0)
            }
            playerScore.scores[hole - 1] = score
            roundScoreData.playerScores[player] = playerScore
        } else {
            // Create new player score record using the correct type
            var newPlayerScore = PlayerScoreData(holes: round.holes)
            if hole <= newPlayerScore.scores.count {
                newPlayerScore.scores[hole - 1] = score
            }
            roundScoreData.playerScores[player] = newPlayerScore
        }
        // Save to persistent storage
        let result = ScoreDataManager.shared.saveScoreData(roundScoreData)
        switch result {
        case .success:
            refreshTrigger.toggle()
        case .failure(let error):
            print("Failed to save score: \(error)")
        }
    }
    
    private func refreshScoreData() {
        if let updatedData = try? ScoreDataManager.shared.loadScoreData(for: round.id).get() {
            roundScoreData = updatedData
            refreshTrigger.toggle()
        }
    }
}

struct SelectedHole: Identifiable {
    let id: Int
}

struct SelectedHoleAndPlayer: Identifiable {
    let hole: Int
    let playerIndex: Int
    var id: String { "\(hole)-\(playerIndex)" }
}

#Preview {
    ScorecardView(round: Round(
        courseName: "Pebble Beach",
        date: Date(),
        numberOfPlayers: 8,
        isPrivate: false,
        holes: 9,
        roundPlayers: 8,
        roundType: "Stroke Play",
        players: ["Bob", "David", "Diana"],
        isCompleted: false
    ), currentUser: "Bob", onBack: { }) // Pass the current user's name here
}
