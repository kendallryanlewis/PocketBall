//
//  LandingView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI

struct LandingView: View {
    @State private var latestRound: Round? = RoundHistoryManager.shared.latestRound()
    @State private var showResume: Bool = false
    @State private var showTrophyRoom: Bool = false
    @State private var showNewRoundSheet: Bool = false
    @State private var showHome: Bool = false
    @State private var showRound: Bool = false
    var body: some View {
        ZStack {
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
                            .font(.system(size: 54, weight: .thin, design: .default))
                            .foregroundColor(.primary)
                            .lineSpacing(0)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.bottom, 16)
                        // Subheadline
                        Text("GOLF   •   STATS   •   ROUNDS   •   MORE")
                            .font(.system(size: 10, weight: .medium, design: .default))
                            .foregroundColor(.primary)
                            .textCase(.uppercase)
                            .kerning(2)
                            .padding(.bottom, 4)
                        Spacer()
                        // Bottom buttons
                        VStack(alignment: .leading, spacing: 10) {
                            // About text button
                            Button(action: { showNewRoundSheet = true }) {
                                Text("About")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.primary)
                                    .padding(.vertical, 8)
                            }
                            // Resume or Trophy Room text button
                            if latestRound != nil && latestRound?.isCompleted == false {
                                NavigationLink(destination: RoundView(), isActive: $showResume) {
                                    Text("Resume")
                                        .font(.system(size: 18, weight: .medium))
                                        .foregroundColor(.primary)
                                        .padding(.vertical, 8)
                                }
                                .simultaneousGesture(TapGesture().onEnded { showResume = true })
                            } else {
                                NavigationLink(destination: TrophyRoomView(), isActive: $showTrophyRoom) {
                                    Text("Trophy Room")
                                        .font(.system(size: 18, weight: .medium))
                                        .foregroundColor(.primary)
                                        .padding(.vertical, 8)
                                }
                                .simultaneousGesture(TapGesture().onEnded { showTrophyRoom = true })
                            }
                            // Get Started text button
                            Button(action: { showNewRoundSheet = true }) {
                                Text("Quick Start")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.green)
                                    .padding(.vertical, 8)
                            }
                            // Home solid black button (full width)
                            NavigationLink(destination: HomeView()) {
                                Text("Get Started")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(Color.black)
                                    .cornerRadius(8)
                            }
                            .padding(.top, 20)
                            
                        // Supporting text
                        Text("Your pocket companion for golf. Start your next round now.")
                            .font(.system(size: 15, weight: .regular, design: .default))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.bottom, 12)
                        }
                        .padding(.top, 40)
                        .padding(.bottom, 40)
                    }
                    .background(Color(.systemBackground))
                    .padding().padding(.top, 60)
                    .padding(.horizontal, 28)
                    .onAppear {
                        latestRound = RoundHistoryManager.shared.latestRound()
                    }
                }
                .sheet(isPresented: $showNewRoundSheet) {
                    NewRoundView(onStartRound: {
                        showNewRoundSheet = false
                        showHome = true
                        showRound = true
                    })
                }
            }
        }
    }
}

#Preview {
    LandingView()
}
