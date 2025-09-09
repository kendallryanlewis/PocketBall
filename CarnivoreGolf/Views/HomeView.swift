//
//  HomeView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/6/25.
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var settings: SettingsManager
    @State private var latestRound: Round? = (try? RoundHistoryManager.shared.loadRounds().get())?.first
    @State private var recentRounds: [Round] = (try? RoundHistoryManager.shared.loadRounds().get()) ?? []
    @State private var showRoundView = false
    @State private var navigateToRoundView = false
    @State private var showSettings = false
    @State private var showClearAlert = false
    @State private var showClearError = false
    @State private var clearErrorMessage = ""
    @State private var showClearSuccess = false
    @State private var selectedRoundForScorecard: Round?
    @State private var showScorecardPopover = false
    @State private var showScanSuccessAlert = false // Add success alert state
    @State private var scannedHoleCount = 0 // Track scanned holes
    
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 24) {
                // App Branding Header (LandingView style)
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("CARNIVORE GOLF")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.green)
                            .textCase(.uppercase)
                            .kerning(2)
                            .padding(.bottom, 4)
                        Text("PocketBall")
                            .font(.system(size: 54, weight: .thin, design: .default))
                            .foregroundColor(.primary)
                            .padding(.bottom, 2)
                        Text("Your golf stats and rounds at a glance.")
                            .font(.system(size: 15, weight: .regular, design: .default))
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Button(action: { showSettings = true }) {
                        Image(systemName: "gearshape.fill")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.primary)
                            .padding(8)
                    }
                    .background(Color(.systemGray6))
                    .clipShape(Circle())
                    .shadow(color: Color.black.opacity(0.04), radius: 2, x: 0, y: 1)
                    .padding(.top, 8)
                    .padding(.trailing, 4)
                }
                .padding(.horizontal)
                .padding(.top, 20)
                // NavigationLink for settings
                NavigationLink(destination: SettingsView()
                    .environmentObject(settings), isActive: $showSettings) { EmptyView() }.hidden()
                
                ScrollView (showsIndicators: false) {
                    // Quick Actions Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Quick Actions")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .padding(.horizontal)
                        
                        if let round = latestRound, !round.isCompleted {
                            // Resume Round Card
                            Button(action: { navigateToRoundView = true }) {
                                VStack(alignment: .leading, spacing: 12) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Resume Round")
                                                .font(.headline)
                                                .fontWeight(.semibold)
                                                .foregroundColor(.white)
                                            Text(round.courseName)
                                                .font(.subheadline)
                                                .foregroundColor(.white.opacity(0.8))
                                        }
                                        Spacer()
                                        Image(systemName: "play.circle.fill")
                                            .font(.title)
                                            .foregroundColor(.white)
                                    }
                                    
                                    HStack {
                                        Text("\(round.holes) holes")
                                        Text("•")
                                        Text("\(round.players.count) players")
                                        Text("•")
                                        Text(round.roundType)
                                        Spacer()
                                    }
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.7))
                                }
                                .padding()
                                .background(Color.green)
                                .cornerRadius(12)
                            }
                            .padding(.horizontal)
                            // NavigationLink for full page navigation
                            NavigationLink(destination: RoundView(), isActive: $navigateToRoundView) {
                                EmptyView()
                            }
                            .hidden()
                        }
                        
                        // Other Quick Actions
                        HStack(spacing: 12) {
                            NavigationLink(destination: NewRoundView()) {
                                QuickActionCard(
                                    icon: "plus.circle.fill",
                                    title: "New Round",
                                    subtitle: "Start playing",
                                    color: .green
                                )
                            }
                            
                            NavigationLink(destination: CreateCourseView()) {
                                QuickActionCard(
                                    icon: "building.columns.fill",
                                    title: "Create Course",
                                    subtitle: "Design & manage",
                                    color: .blue
                                )
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Recent Rounds Section
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("Recent Rounds")
                                .font(.headline)
                                .fontWeight(.semibold)
                            Spacer()
                            if recentRounds.count > 3 {
                                Button("View All") {
                                    // Navigate to rounds history
                                }
                                .font(.subheadline)
                                .foregroundColor(.green)
                            }
                        }
                        .padding(.horizontal)
                        
                        if recentRounds.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "golf.teeingground")
                                    .font(.system(size: 40))
                                    .foregroundColor(.secondary)
                                Text("No rounds played yet")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                                Text("Start your first round to see it here!")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                
                                NavigationLink(destination: NewRoundView()) {
                                    HStack {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.title2)
                                        Text("Start New Round")
                                            .font(.headline)
                                            .fontWeight(.semibold)
                                    }
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 12)
                                    .background(Color.green)
                                    .cornerRadius(25)
                                }
                                .padding(.top, 8)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                            .padding(.horizontal)
                        } else {
                            ForEach(Array(recentRounds.prefix(3).enumerated()), id: \.element.id) { index, round in
                                Button(action: {
                                    selectedRoundForScorecard = round
                                    showScorecardPopover = true
                                }) {
                                    RoundCard(round: round, isRecent: true)
                                        .padding(.horizontal)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                    }
                    
                    // Golf Tips Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Today's Tip")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .padding(.horizontal)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "lightbulb.fill")
                                    .font(.title2)
                                    .foregroundColor(.yellow)
                                Text("Pro Tip")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                            
                            Text("Keep your head still during the swing. A steady head position helps maintain balance and improves contact with the ball.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .padding(.horizontal)
                    }
                    
                    // Add Clear All Rounds button
                    HStack {
                        Spacer()
                        Button(action: { showClearAlert = true }) {
                            Label("Clear All Rounds", systemImage: "trash")
                                .font(.subheadline)
                                .foregroundColor(.red)
                                .padding(8)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                        }
                        .alert(isPresented: $showClearAlert) {
                            Alert(
                                title: Text("Clear All Rounds?"),
                                message: Text("This will permanently delete all saved rounds. Are you sure?"),
                                primaryButton: .destructive(Text("Clear")) {
                                    let result = RoundHistoryManager.shared.clearRounds()
                                    switch result {
                                    case .success:
                                        latestRound = nil
                                        recentRounds = []
                                        showClearSuccess = true
                                    case .failure(let error):
                                        clearErrorMessage = error.localizedDescription
                                        showClearError = true
                                    }
                                },
                                secondaryButton: .cancel()
                            )
                        }
                        .alert(isPresented: $showClearError) {
                            Alert(title: Text("Error"), message: Text(clearErrorMessage), dismissButton: .default(Text("OK")))
                        }
                        .alert(isPresented: $showClearSuccess) {
                            Alert(title: Text("Rounds Cleared"), message: Text("All rounds have been deleted."), dismissButton: .default(Text("OK")))
                        }
                        Spacer()
                    }
                    
                    Spacer(minLength: 100)
                }
            }
            .refreshable {
                latestRound = (try? RoundHistoryManager.shared.loadRounds().get())?.first
                recentRounds = (try? RoundHistoryManager.shared.loadRounds().get()) ?? []
            }
            .onAppear {
                latestRound = (try? RoundHistoryManager.shared.loadRounds().get())?.first
                recentRounds = (try? RoundHistoryManager.shared.loadRounds().get()) ?? []
            }
            .navigationBarBackButtonHidden(true)
            .navigationBarHidden(true)
            .padding(28)
        }
        .navigationBarBackButtonHidden(true)
        .popover(isPresented: $showScorecardPopover) {
            if let selectedRound = selectedRoundForScorecard {
                ScorecardView(
                    round: selectedRound,
                    currentUser: selectedRound.players.first ?? "Player",
                    onBack: {
                        showScorecardPopover = false
                    }
                )
                .frame(minWidth: 600, minHeight: 400)
            }
        }
        .alert(isPresented: $showScanSuccessAlert) {
            Alert(
                title: Text("Scorecard Scanned"),
                message: Text("Successfully imported \(scannedHoleCount) holes with par information"),
                dismissButton: .default(Text("OK"))
            )
        }
    }
    
    // Add function to handle scanned scorecard data
    private func handleScannedScorecard(_ parsedHoles: [ParsedHole]) {
        scannedHoleCount = parsedHoles.count
        showScanSuccessAlert = true
        
        // For now, just show success. In the future, you could:
        // 1. Create a new round with the scanned data
        // 2. Update an existing round's par values
        // 3. Save the course layout for future use
        
        print("Scanned \(parsedHoles.count) holes:")
        for hole in parsedHoles {
            print("Hole \(hole.holeNumber): Par \(hole.par ?? 0), \(hole.yardage ?? 0) yards")
        }
    }
}

struct QuickActionCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)
            
            VStack(spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 100) // Ensure fixed height
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct RoundCard: View {
    let round: Round
    let isRecent: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(round.courseName)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    Text(round.date, style: .date)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    if round.isCompleted {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                    } else {
                        Image(systemName: "clock.fill")
                            .font(.title2)
                            .foregroundColor(.orange)
                    }
                    Text(round.isCompleted ? "Completed" : "In Progress")
                        .font(.caption)
                        .foregroundColor(round.isCompleted ? .green : .orange)
                }
            }
            
            HStack {
                Label("\(round.holes)", systemImage: "flag.fill")
                Label("\(round.players.count)", systemImage: "person.2.fill")
                Label(round.roundType, systemImage: "golf.teeingground")
                Spacer()
                if round.isPrivate {
                    Label("Private", systemImage: "lock.fill")
                        .foregroundColor(.secondary)
                }
            }
            .font(.caption)
            .foregroundColor(.secondary)
            
            if !round.players.isEmpty {
                HStack {
                    Text("Players:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(round.players.joined(separator: ", "))
                        .font(.caption)
                        .foregroundColor(.primary)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

#Preview {
    HomeView().environmentObject(SettingsManager())
}
