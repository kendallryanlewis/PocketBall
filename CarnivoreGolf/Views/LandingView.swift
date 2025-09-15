//
//  LandingView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI

struct LandingView: View {
    @Environment(\.colorScheme) var colorScheme
    @State private var latestRound: Round? = RoundHistoryManager.shared.latestRound()
    @State private var showResume: Bool = false
    @State private var showTrophyRoom: Bool = false
    @State private var showNewRoundSheet: Bool = false
    @State private var showHome: Bool = false
    @State private var showRound: Bool = false
    @State private var showAboutSheet: Bool = false
    
    var body: some View {
        ZStack {
            BackgroundView()
            if showHome {
                HomeView()
                    .sheet(isPresented: $showRound) {
                        RoundView()
                    }
            } else {
                NavigationStack {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("CARNIVORE GOLF")
                            .font(.system(size: 13, weight: .medium, design: .default))
                            .foregroundColor(.green)
                            .textCase(.uppercase)
                            .kerning(3)
                            .padding(.bottom, 0)
                        // Main headline
                        Text("Pocket\nBall")
                            .font(.system(size: 80, weight: .ultraLight))
                            .foregroundColor(.primary)
                            .lineSpacing(0)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.bottom, 16)
                        Spacer()
                        // Bottom buttons
                        VStack(alignment: .leading, spacing: 30) {
                            // About text button
                            Button(action: { showAboutSheet = true }) {
                                Text("About")
                                    .font(.system(size: 30, weight: .light))
                                    .foregroundColor(.primary)
                            }
                            // Resume or Trophy Room text button
                            if latestRound != nil && latestRound?.isCompleted == false {
                                NavigationLink(destination: RoundView(), isActive: $showResume) {
                                    Text("Resume")
                                        .font(.system(size: 30, weight: .light))
                                        .foregroundColor(.primary)
                                }
                                .simultaneousGesture(TapGesture().onEnded { showResume = true })
                            } else {
                                NavigationLink(destination: TrophyRoomView(), isActive: $showTrophyRoom) {
                                    Text("Trophy Room")
                                        .font(.system(size: 30, weight: .light))
                                        .foregroundColor(.primary)
                                }
                                .simultaneousGesture(TapGesture().onEnded { showTrophyRoom = true })
                            }
                            // Get Started text button
                            Button(action: { showNewRoundSheet = true }) {
                                Text("Quick Start")
                                    .font(.system(size: 30, weight: .light))
                                    .foregroundColor(.primary)
                            }
                            // Home solid black button (full width)
                            NavigationLink(destination: HomeView()) {
                                Text("Get Started")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(Color(UIColor.systemBackground))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(colorScheme == .light ? Color.black : Color.white)
                                    .cornerRadius(8)
                            }
                            HStack(alignment: .center) {
                                let items = ["GOLF", "STATS", "ROUNDS", "MORE"]
                                ForEach(0..<items.count, id: \.self) { idx in
                                    Text(items[idx])
                                    if idx < items.count - 1 {
                                        Spacer()
                                        Text("•")
                                        Spacer()
                                    }
                                }
                            }
                            .font(.system(size: 10, weight: .medium, design: .default))
                            .foregroundColor(.primary)
                            .textCase(.uppercase)
                            .kerning(2)
                            .multilineTextAlignment(.center)
                        }
                        .padding(.top, 40)
                        .padding(.bottom, 40)
                    }
                    .padding().padding(.top, 60)
                    .padding(.horizontal, 28)
                    .onAppear {
                        latestRound = RoundHistoryManager.shared.latestRound()
                    }
                }
                .font(.system(size: 54, weight: .thin, design: .default))
                .sheet(isPresented: $showNewRoundSheet) {
                    NewRoundView(onStartRound: {
                        showNewRoundSheet = false
                        showHome = true
                        showRound = true
                    })
                }
                .sheet(isPresented: $showAboutSheet) {
                    EmptyView()
                }
            }
        }
    }
}

#Preview {
    LandingView()
}
