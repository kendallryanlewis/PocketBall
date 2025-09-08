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
    @Environment(\.dismiss) private var dismiss
    @State private var showHoleView = false
    @State private var roundScoreData: RoundScoreData
    @State private var refreshTrigger = false // Add refresh trigger
    @State private var isEditingPars = false // Add edit mode state
    @State private var tempParValues: [Int] = [] // Temporary par values for editing
    let goldColor = Color(red: 1.0, green: 0.84, blue: 0.50, opacity: 0.3) // Soft gold
    
    // Standard row height for consistent alignment
    private let standardRowHeight: CGFloat = 60
    
    // Dynamic data based on round holes
    var holes: [Int] { Array(1...round.holes) }
    
    // Get par from score data
    var par: [Int] { roundScoreData.par }
    
    // Get player scores from persistent data
    var playerScores: [[Int]] {
        return round.players.map { player in
            return roundScoreData.playerScores[player]?.scores ?? Array(repeating: 0, count: round.holes)
        }
    }
    
    // Initialize with persistent score data loading
    init(round: Round, currentUser: String, onBack: @escaping () -> Void) {
        self.round = round
        self.currentUser = currentUser
        self.onBack = onBack
        
        // Load existing score data or create new
        if let existingData = try? ScoreDataManager.shared.loadScoreData(for: round.id).get() {
            self._roundScoreData = State(initialValue: existingData)
            self._tempParValues = State(initialValue: existingData.par)
        } else {
            // Create new score data
            let newScoreData = RoundScoreData(roundId: round.id, players: round.players, holes: round.holes)
            self._roundScoreData = State(initialValue: newScoreData)
            self._tempParValues = State(initialValue: newScoreData.par)
        }
    }
    
    let playerAvatars = ["person.crop.circle.fill", "person.crop.circle", "person.crop.circle.badge.checkmark", "person.crop.circle.badge.xmark", "person.crop.circle.badge.exclam", "person.crop.circle.badge.questionmark", "person.crop.circle.badge.plus", "person.crop.circle.badge.minus"]
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                HStack{
                    VStack (alignment: .leading, spacing: 4) {
                        Button(action: { onBack() }) {
                            HStack{
                                Image(systemName: "chevron.left")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.primary)
                                Text("Scorecard")
                                    .font(.system(size: 34, weight: .thin, design: .default))
                                    .foregroundColor(.primary)
                                    .lineSpacing(0)
                                    .fixedSize(horizontal: false, vertical: true)
                                Spacer()
                                
                            }
                        }
                        Text(round.courseName)
                            .font(.system(size: 12, weight: .regular))
                            .foregroundColor(.primary.opacity(0.7))
                            .padding(.bottom, 16)
                    }
                    Spacer()
                }
                ScrollView{
                    scoreGrid
                    Spacer()
                }
                VStack (alignment: .center){
                    Button(action: {
                        if isEditingPars {
                            saveParChanges()
                        } else {
                            showHoleView.toggle()
                        }
                    }) {
                        Text(isEditingPars ? "Save Score card" : "View Holes")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(Color(UIColor.systemBackground))
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(isEditingPars ? Color.green : Color.gray)
                            .cornerRadius(4)
                    }.padding(.top, 30)
                        .foregroundColor(.primary)
                    Button(action: {
                        toggleEditMode()
                    }) {
                        HStack {
                            Text(isEditingPars ? "Editing" : "Edit Score card")
                                .font(.system(size: 12, weight: .medium))
                        }
                    }.padding(.top)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
        }
        .padding()
        .navigationBarBackButtonHidden(true)
        .popover(isPresented: $showHoleView) {
            HoleView(round: round, scores: playerScores, par: par)
                .frame(minWidth: 400, minHeight: 800) // Adjust as needed
        }
        .onAppear {
            refreshScoreData()
        }
        .onChange(of: showHoleView) {
            // When HoleView is dismissed (showHoleView becomes false), refresh the data
            if !showHoleView {
                refreshScoreData()
            }
        }
        .onChange(of: refreshTrigger) {
            // Force view refresh when data changes
        }
    }
    
    // Add helper function to refresh score data
    private func refreshScoreData() {
        if let updatedData = try? ScoreDataManager.shared.loadScoreData(for: round.id).get() {
            roundScoreData = updatedData
            // Toggle refresh trigger to force view update
            refreshTrigger.toggle()
        }
    }
    
    //Scoreboard grid view
    private var scoreGrid: some View {
        GeometryReader { geometry in
            HStack(spacing: 0) {
                // Scrollable content (everything except total column)
                ScrollView(.horizontal, showsIndicators: false) {
                    VStack(spacing: 0) {
                        headerRowWithoutTotal
                        parRowWithoutTotal
                        ForEach(Array(round.players.enumerated()), id: \.offset) { idx, player in
                            playerScoreRowWithoutTotal(idx: idx, player: player)
                        }
                    }
                }.frame(width: geometry.size.width - 80) // Leave space for TOT column
                
                // Fixed total column extending to bottom
                VStack(spacing: 0) {
                    totalColumnHeader
                    totalColumnPar
                    ForEach(Array(round.players.enumerated()), id: \.offset) { idx, player in
                        totalColumnPlayerScore(idx: idx, player: player)
                    }
                    Spacer() // This makes the TOT column extend to bottom
                }
                .frame(width: 72, height: geometry.size.height) // Set explicit width and extend to full height
                .background(Color(UIColor.systemBackground))
            }
        }
    }
    
    // Hole header row
    private var headerRowWithoutTotal: some View {
        HStack(spacing: 0) {
            // Use the same width as player cells for consistent alignment
            HStack {
                Text("Hole")
                    .foregroundColor(.primary.opacity(0.7))
                    .font(.system(size: 14, weight: .semibold))
                Spacer()
            }
            .padding(.horizontal, 20)
            
            ForEach(holes, id: \.self) { hole in
                cell(text: "#\(hole)", isHeader: true)
            }
        }
        .frame(height: standardRowHeight - 8)
        .background(Color.primary.opacity(0.04))
    }
    
    // Par row without total column
    private var parRowWithoutTotal: some View {
        HStack(spacing: 0) {
            // Use the same width as player cells for consistent alignment
            HStack {
                Text("PAR")
                    .foregroundColor(.primary.opacity(0.7))
                    .font(.system(size: 14, weight: .semibold))
                Spacer()
            }
            .frame(width: maxPlayerNameWidth, height: standardRowHeight)
            .padding(.horizontal, 20)
            
            ForEach(par.indices, id: \.self) { idx in
                if isEditingPars {
                    editableParCellInEditMode(holeIdx: idx, parValue: tempParValues[safe: idx] ?? 4)
                } else {
                    editableParCell(holeIdx: idx, parValue: par[idx])
                }
            }
        }
        .frame(height: standardRowHeight)
    }
    
    // Add editable par cell
    private func editableParCell(holeIdx: Int, parValue: Int) -> some View {
        HStack(spacing: 0) {
            Divider()
                .background(Color(.systemBackground).opacity(0.2))
                .frame(height: 32)
            
            ZStack(alignment: .center) {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.clear)
                
                Text("\(parValue)")
                    .foregroundColor(.primary.opacity(0.8))
                    .font(.system(size: 14, weight: .semibold))
            }
            .frame(width: 44, height: 44)
            .padding(.horizontal, 2)
            .padding(.vertical, 8)
            .contentShape(Rectangle())
            .onTapGesture {
                showParInput(holeIdx: holeIdx, currentPar: parValue)
            }
        }
    }
    
    // Add new editable par cell for edit mode
    private func editableParCellInEditMode(holeIdx: Int, parValue: Int) -> some View {
        HStack(spacing: 0) {
            Divider()
                .background(Color(.systemBackground).opacity(0.2))
                .frame(height: 32)
            
            ZStack(alignment: .center) {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.blue.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.blue, lineWidth: 2)
                    )
                
                VStack(spacing: 2) {
                    Button(action: { incrementTempPar(at: holeIdx) }) {
                        Image(systemName: "chevron.up")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.blue)
                    }
                    
                    Text("\(parValue)")
                        .foregroundColor(.primary)
                        .font(.system(size: 14, weight: .bold))
                    
                    Button(action: { decrementTempPar(at: holeIdx) }) {
                        Image(systemName: "chevron.down")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.blue)
                    }
                }
            }
            .frame(width: 44, height: 44)
            .padding(.horizontal, 2)
            .padding(.vertical, 8)
        }
    }
    
    // Function to handle par input
    private func showParInput(holeIdx: Int, currentPar: Int) {
        let alert = UIAlertController(title: "Edit Par", message: "Hole \(holeIdx + 1)", preferredStyle: .alert)
        
        alert.addTextField { textField in
            textField.placeholder = "Par (3, 4, or 5)"
            textField.keyboardType = .numberPad
            textField.text = "\(currentPar)"
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Save", style: .default) { _ in
            if let text = alert.textFields?.first?.text,
               let newPar = Int(text), newPar >= 3 && newPar <= 5 {
                // Update the persistent par data
                roundScoreData.par[holeIdx] = newPar
                roundScoreData.updateLastModified()
                ScoreDataManager.shared.saveScoreData(roundScoreData)
                refreshTrigger.toggle() // Force UI refresh
            }
        })
        
        // Present the alert
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(alert, animated: true)
        }
    }
    
    // Total column header
    private var totalColumnHeader: some View {
        ZStack {
            Color.primary.opacity(0.04) // Match header background
            cell(text: "TOT", width: 80, isHeader: true)
        }
        .frame(height: standardRowHeight)
    }
    
    // Total column par
    private var totalColumnPar: some View {
        cell(text: "\(par.reduce(0, +))", width: 80, isHeader: true, color: Color.clear)
            .frame(height: standardRowHeight)
    }
    
    private func playerScoreRowWithoutTotal(idx: Int, player: String) -> some View {
        let playerCellView = playerCell(idx: idx, name: player)
        let scoreCellsArray = (playerScores[safe: idx] ?? []).enumerated().map { (scoreIdx, score) in
            editableCell(
                playerIdx: idx,
                holeIdx: scoreIdx,
                score: score,
                isWinner: isWinner(idx: idx),
                highlight: isWinner(idx: idx) && score == (playerScores[safe: idx]?.min() ?? score),
                par: par[safe: scoreIdx] ?? 4
            )
        }
        let isCurrentUser = player == currentUser
        let isWinnerRow = isWinner(idx: idx)
        let evenColor = Color.primary.opacity(0.02)
        let oddColor = Color.clear
        let userHighlightColor = idx % 2 == 0 ? Color.blue.opacity(0.18) : Color.blue.opacity(0.28)
        let backgroundColor: Color = isWinnerRow ? goldColor : (isCurrentUser ? userHighlightColor : (idx % 2 == 0 ? evenColor : oddColor))
        
        return HStack(spacing: 0) {
            playerCellView
            ForEach(0..<scoreCellsArray.count, id: \.self) { i in
                scoreCellsArray[i]
            }
        }
        .frame(height: standardRowHeight)
        .background(backgroundColor)
    }
    
    // Total column player score
    private func totalColumnPlayerScore(idx: Int, player: String) -> some View {
        let isCurrentUser = player == currentUser
        let isWinnerRow = isWinner(idx: idx)
        let userHighlightColor = idx % 2 == 0 ? Color.blue.opacity(0.18) : Color.blue.opacity(0.28)
        let dark = Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 12/255, green: 14/255, blue: 18/255, alpha: 1.0)  // Dark mode
                : UIColor(red: 240/255, green: 240/255, blue: 245/255, alpha: 1.0)  // Light mode
        })
        let light = Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 18/255, green: 21/255, blue: 26/255, alpha: 1.0)  // Dark mode
                : UIColor(red: 248/255, green: 249/255, blue: 250/255, alpha: 1.0)  // Light mode
        })
        let bg = isWinnerRow ? goldColor : (isCurrentUser ? userHighlightColor : (idx % 2 == 0 ? dark : light))
        let totalScore = playerScores[safe: idx]?.reduce(0, +) ?? 0
        return cell(
            text: totalScore > 0 ? "\(totalScore)" : "",
            width: 80,
            isWinner: isWinner(idx: idx),
            color: isWinner(idx: idx) ? .clear : Color.clear,
            showTrophy: isWinner(idx: idx)
        )
        .frame(height: standardRowHeight)
        .background(bg)
    }
    
    private func playerCell(idx: Int, name: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: playerAvatars[safe: idx] ?? "person.crop.circle")
                .resizable()
                .scaledToFit()
                .frame(width: 32, height: 32)
                .clipShape(Circle())
                .overlay(Circle().stroke(Color.primary.opacity(0.2), lineWidth: 1))
            
            if isEditingPars {
                // Show edit mode styling for player names
                Text(name)
                    .foregroundColor(.blue)
                    .font(.system(size: 16, weight: .semibold))
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .layoutPriority(1)
            } else {
                // Normal mode styling
                Text(name)
                    .foregroundColor(.primary)
                    .font(.system(size: 16, weight: .medium))
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .layoutPriority(1)
            }
            
            Spacer()
            
            // Show edit indicator when in edit mode
            if isEditingPars {
                Image(systemName: "pencil.circle.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 16))
            }
        }
        .frame(width: maxPlayerNameWidth, height: standardRowHeight)
        .padding(.horizontal, 20)
        .background(isEditingPars ? Color.blue.opacity(0.1) : Color.clear)
        .cornerRadius(isEditingPars ? 8 : 0)
    }
    
    // Add computed property to calculate the maximum player name width
    private var maxPlayerNameWidth: CGFloat {
        let longestName = round.players.max { $0.count < $1.count } ?? ""
        // Estimate width: approximately 10 points per character + padding for avatar and spacing
        let estimatedWidth = CGFloat(longestName.count) * 10 + 32 + 8 + 40 // avatar + spacing + padding
        return max(estimatedWidth, 140) // Minimum width of 140 points
    }
    
    // Golf score types for indicators
    enum ScoreType {
        case holeinone      // Hole in one
        case albatross      // 3 under par
        case eagle          // 2 under par
        case birdie         // 1 under par
        case par            // Even par
        case bogey          // 1 over par
        case doublebogey    // 2 over par
        case triplebogey    // 3+ over par
    }
    
    // Determine score type based on score vs par
    private func getScoreType(score: Int, par: Int) -> ScoreType {
        let difference = score - par
        
        if par == 1 && score == 1 {
            return .holeinone
        }
        
        switch difference {
        case -3:
            return .albatross
        case -2:
            return .eagle
        case -1:
            return .birdie
        case 0:
            return .par
        case 1:
            return .bogey
        case 2:
            return .doublebogey
        case 3...:
            return .triplebogey
        default:
            return .par
        }
    }
    
    // Score indicator view
    @ViewBuilder
    private func scoreIndicator(score: Int, par: Int, scoreType: ScoreType) -> some View {
        let text = Text("\(score)")
            .foregroundColor(.primary)
            .font(.system(size: 16, weight: .medium))
        
        switch scoreType {
        case .holeinone:
            // Double circle for hole in one (ace)
            ZStack {
                Circle()
                    .stroke(Color.red, lineWidth: 2)
                    .frame(width: 32, height: 32)
                Circle()
                    .stroke(Color.red, lineWidth: 1)
                    .frame(width: 24, height: 24)
                text.foregroundColor(.red)
            }
            
        case .albatross:
            // Triple circle for albatross (3 under par)
            ZStack {
                Circle()
                    .stroke(Color.purple, lineWidth: 2)
                    .frame(width: 36, height: 36)
                Circle()
                    .stroke(Color.purple, lineWidth: 1.5)
                    .frame(width: 28, height: 28)
                Circle()
                    .stroke(Color.purple, lineWidth: 1)
                    .frame(width: 20, height: 20)
                text.foregroundColor(.purple)
            }
            
        case .eagle:
            // Double circle for eagle (2 under par)
            ZStack {
                Circle()
                    .stroke(Color.red, lineWidth: 2)
                    .frame(width: 32, height: 32)
                Circle()
                    .stroke(Color.red, lineWidth: 1)
                    .frame(width: 24, height: 24)
                text.foregroundColor(.red)
            }
            
        case .birdie:
            // Single circle for birdie (1 under par)
            ZStack {
                Circle()
                    .stroke(Color.blue, lineWidth: 2)
                    .frame(width: 30, height: 30)
                text.foregroundColor(.blue)
            }
            
        case .par:
            // No indicator for par (even)
            text
            
        case .bogey:
            // Single square for bogey (1 over par)
            ZStack {
                RoundedRectangle(cornerRadius: 2)
                    .stroke(Color.orange, lineWidth: 2)
                    .frame(width: 30, height: 30)
                text.foregroundColor(.orange)
            }
            
        case .doublebogey:
            // Double square for double bogey (2 over par)
            ZStack {
                RoundedRectangle(cornerRadius: 3)
                    .stroke(Color.red, lineWidth: 2)
                    .frame(width: 32, height: 32)
                RoundedRectangle(cornerRadius: 2)
                    .stroke(Color.red, lineWidth: 1)
                    .frame(width: 24, height: 24)
                text.foregroundColor(.red)
            }
            
        case .triplebogey:
            // Triple square for triple bogey or worse (3+ over par)
            ZStack {
                RoundedRectangle(cornerRadius: 4)
                    .stroke(Color.red, lineWidth: 2)
                    .frame(width: 36, height: 36)
                RoundedRectangle(cornerRadius: 3)
                    .stroke(Color.red, lineWidth: 1.5)
                    .frame(width: 28, height: 28)
                RoundedRectangle(cornerRadius: 2)
                    .stroke(Color.red, lineWidth: 1)
                    .frame(width: 20, height: 20)
                text.foregroundColor(.red)
            }
        }
    }

    // New editable cell for score entry
    private func editableCell(
        playerIdx: Int,
        holeIdx: Int,
        score: Int,
        isWinner: Bool = false,
        highlight: Bool = false,
        par: Int
    ) -> some View {
        HStack(spacing: 0) {
            Divider()
                .background(Color(.systemBackground).opacity(0.2))
                .frame(height: 32)
            
            ZStack(alignment: .center) {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.clear)
                
                if score > 0 {
                    let scoreType = getScoreType(score: score, par: par)
                    scoreIndicator(score: score, par: par, scoreType: scoreType)
                } else {
                    // Show empty state for score entry
                    Text("–")
                        .foregroundColor(.primary.opacity(0.3))
                        .font(.system(size: 16, weight: .medium))
                }
            }
            .frame(width: 44, height: 44)
            .padding(.horizontal, 2)
            .padding(.vertical, 8)
            .contentShape(Rectangle())
            .onTapGesture {
                // Show score picker or input when tapped
                showScoreInput(playerIdx: playerIdx, holeIdx: holeIdx, currentScore: score)
            }
        }
    }
    
    // Function to handle score input and update persistent data
    private func showScoreInput(playerIdx: Int, holeIdx: Int, currentScore: Int) {
        let playerName = round.players[playerIdx]
        let alert = UIAlertController(title: "Enter Score", message: "Hole \(holeIdx + 1) - Par \(par[holeIdx])", preferredStyle: .alert)
        
        alert.addTextField { textField in
            textField.placeholder = "Score"
            textField.keyboardType = .numberPad
            if currentScore > 0 {
                textField.text = "\(currentScore)"
            }
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Save", style: .default) { _ in
            if let text = alert.textFields?.first?.text,
               let newScore = Int(text), newScore > 0 {
                // Update the persistent score data
                roundScoreData.playerScores[playerName]?.scores[holeIdx] = newScore
                roundScoreData.updateLastModified()
                ScoreDataManager.shared.saveScoreData(roundScoreData)
            }
        })
        
        // Present the alert
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(alert, animated: true)
        }
    }
    
    private func cell(
        text: String,
        width: CGFloat = 44,
        isHeader: Bool = false,
        isWinner: Bool = false,
        highlight: Bool = false,
        color: Color = Color.clear,
        showTrophy: Bool = false,
        score: Int? = nil,
        par: Int? = nil
    ) -> some View {
        HStack(spacing: 0) {
            if !isHeader {
                Divider()
                    .background(Color(.systemBackground).opacity(0.2))
                    .frame(height: 32)
            }
            ZStack(alignment: .center) {
                if !isHeader {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(color)
                }
                
                // Show score indicator if score and par are provided
                if let score = score, let par = par, !isHeader {
                    let scoreType = getScoreType(score: score, par: par)
                    scoreIndicator(score: score, par: par, scoreType: scoreType)
                } else {
                    Text(text)
                        .foregroundColor(isHeader ? .primary.opacity(0.7) : .primary)
                        .font(.system(size: isHeader ? 14 : 16, weight: isHeader ? .semibold : .medium))
                }
                
                if showTrophy {
                    Image(systemName: "trophy.fill")
                        .foregroundColor(.yellow)
                        .offset(x: 25)
                }
            }
            .frame(width: width, height: isHeader ? standardRowHeight : 44)
            .padding(.horizontal, 2)
            .padding(.vertical, isHeader ? 0 : 8)
        }
    }
    
    private func isWinner(idx: Int) -> Bool {
        // Winner is the player with the lowest total (only count if they have scores)
        let totals = playerScores.map { scores in
            let total = scores.reduce(0, +)
            return total > 0 ? total : Int.max // Don't count players with no scores
        }
        if let minScore = totals.min(), minScore != Int.max, totals[safe: idx] == minScore {
            return true
        }
        return false
    }
    
    // Add helper functions for edit mode
    private func toggleEditMode() {
        if isEditingPars {
            // Cancel edit mode - reset temp values
            tempParValues = roundScoreData.par
            isEditingPars = false
        } else {
            // Enter edit mode
            tempParValues = roundScoreData.par
            isEditingPars = true
        }
    }
    
    private func saveParChanges() {
        // Save the temporary par values to persistent storage
        roundScoreData.par = tempParValues
        roundScoreData.updateLastModified()
        ScoreDataManager.shared.saveScoreData(roundScoreData)
        isEditingPars = false
        refreshTrigger.toggle()
    }
    
    private func incrementTempPar(at index: Int) {
        if tempParValues.indices.contains(index) {
            tempParValues[index] = min(5, tempParValues[index] + 1)
        }
    }
    
    private func decrementTempPar(at index: Int) {
        if tempParValues.indices.contains(index) {
            tempParValues[index] = max(3, tempParValues[index] - 1)
        }
    }
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
