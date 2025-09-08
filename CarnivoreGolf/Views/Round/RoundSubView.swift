//
//  RoundSubView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI


struct RoundSubView: View {
    @State private var round: Round
    @AppStorage("currentUserName") private var currentUserName: String = ""
    @Environment(\.dismiss) private var dismiss
    @State private var showScorecard = false
    @State private var showEditRound = false // Add state for showing edit view
    @State private var roundScoreData: RoundScoreData?
    
    // Remove the inline editing states since we'll use NewRoundView
    // @State private var isEditingDetails = false
    // @State private var editedCourseName: String = ""
    // @State private var editedRoundType: String = ""
    
    private let roundTypes = ["Stroke Play", "Match Play", "Best Ball", "Scramble", "Skins", "Stableford"]

    // Add initializer to accept round parameter
    init(round: Round) {
        self._round = State(initialValue: round)
    }

    var body: some View {
        ZStack {
            if showScorecard {
                ScorecardView(round: round, currentUser: currentUserName, onBack: { showScorecard = false })
            } else if showEditRound {
                NewRoundView(existingRound: round) {
                    // Reload the round data after editing
                    if let updatedRound = RoundHistoryManager.shared.getRound(by: round.id) {
                        round = updatedRound
                    }
                    showEditRound = false
                }
            } else {
                Color(.systemBackground).ignoresSafeArea()
                VStack {
                    headerView
                    Divider()
                        .background(.primary)
                    roundResultsView
                    Spacer()
                    bottomButtonsView
                }.padding()
            }
        }
        .onAppear {
            loadScoreData()
        }
    }
    
    // Add function to load score data
    private func loadScoreData() {
        if let scoreData = try? ScoreDataManager.shared.loadScoreData(for: round.id).get() {
            roundScoreData = scoreData
        }
    }
    
    // Add function to get player total score
    private func getPlayerTotalScore(_ player: String) -> Int {
        guard let scoreData = roundScoreData else { return 0 }
        let scores = scoreData.playerScores[player]?.scores ?? []
        let total = scores.reduce(0, +)
        return total > 0 ? total : 0
    }
    
    // Add computed property to get sorted players by score
    private var sortedPlayers: [(String, Int)] {
        let playersWithScores = round.players.map { player in
            (player, getPlayerTotalScore(player))
        }
        return playersWithScores.sorted { first, second in
            if first.1 == 0 && second.1 == 0 {
                return false // Keep original order if both have no scores
            } else if first.1 == 0 {
                return false // Players with no scores go to the end
            } else if second.1 == 0 {
                return true // Players with scores go first
            }
            return first.1 < second.1 // Lower scores first
        }
    }

    private var headerView: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Type: \(round.roundType)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(round.courseName)
                    .font(.system(size: 34, weight: .thin, design: .default))
                    .foregroundColor(.primary)
                    .lineSpacing(0)
                    .fixedSize(horizontal: false, vertical: true)
                Text(round.date, style: .date)
                    .foregroundColor(.secondary)
                    .font(.footnote)
            }
            
            Button(action: {
                showEditRound = true
            }) {
                Text("Edit Round Details")
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
            }
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(Color(UIColor.systemBackground))
            .background(Color.gray)
            .cornerRadius(6)
            .padding(.bottom, 16)
            
            statsRow
                .padding(.vertical, 18)
        }
        .padding(.bottom, 12)
    }
    
    private var statsRow: some View {
        HStack(spacing: 16) {
            statItem(title: "Holes", value: "\(round.holes)")
            statItem(title: "Players", value: "\(round.players.count)")
            statItem(title: "Round Type", value: round.roundType)
        }
    }

    private func statItem(title: String, value: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(.primary.opacity(0.1))
            VStack(spacing: 2) {
                Text(value)
                    .font(.subheadline).fontWeight(.bold)
                    .foregroundColor(.primary)
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 10)
            .padding(.horizontal, 4)
        }
        .frame(maxWidth: .infinity, minHeight: 44, maxHeight: 44)
    }
    
    private var roundResultsView: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Round Results")
                .font(.headline)
                .foregroundColor(.primary)
                .padding(.horizontal)
                .padding(.vertical, 18)
            ScrollView{
                VStack(spacing: 0) {
                    ForEach(Array(sortedPlayers.enumerated()), id: \.offset) { idx, playerData in
                        roundResultRow(idx: idx, player: playerData.0, score: playerData.1)
                    }
                }
            }
            .padding(.bottom, 8)
        }
    }
    
    private func roundResultRow(idx: Int, player: String, score: Int) -> some View {
        HStack(spacing: 12) {
            Text("\(idx + 1)")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.primary)
                .frame(width: 28)
            // Avatar placeholder
            Circle()
                .fill(Color(.systemGray4))
                .frame(width: 36, height: 36)
                .overlay(
                    Text(player.prefix(2).uppercased())
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.primary)
                )
            Text(player)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.primary)
            if idx == 0 && score > 0 {
                Image(systemName: "crown.fill")
                    .font(.system(size: 14)).font(.headline)
                    .foregroundColor(Color.yellow)
                    .padding(.leading, 2)
            }
            Spacer()
            Rectangle()
                .fill(.primary.opacity(0.2))
                .padding(.vertical, 8)
                .frame(width: 1)
            // Show actual total score or dash if no score
            Text(score > 0 ? "\(score)" : "–")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.primary)
                .frame(width: 40, alignment: .trailing)
        }
        .padding()
        .background(idx % 2 == 0 ? Color(.secondarySystemBackground) : Color(.systemBackground))
    }
    
    private var bottomButtonsView: some View {
        VStack(spacing: 16) {
            Button(action: { showScorecard = true }) {
                Text("View Scorecard")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(Color(UIColor.systemBackground))
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray)
                    .cornerRadius(10)
            }
            Button(action: { dismiss() }) {
                Text("Back")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.green)
                    .frame(maxWidth: .infinity)
                    .cornerRadius(10)
            }
        }
        .padding(.top, 8)
    }
}


#Preview {
    @Previewable @AppStorage("currentUserName") var currentUserName: String = "Bob Davidson"
    let sampleRound = Round(
        courseName: "The Hyarta Golf Country Club",
        date: Date(timeIntervalSince1970: 1646352000),
        numberOfPlayers: 4,
        isPrivate: true,
        holes: 18,
        roundPlayers: 4,
        roundType: "Stroke Play",
        players: ["Mike Alles", "Bob Davidson", "James Handsome", "Jon Romono", "James Handsome", "Jon Romono"],
        isCompleted: false
    )
    return RoundSubView(round: sampleRound)
        .environment(\.colorScheme, .dark)
}
