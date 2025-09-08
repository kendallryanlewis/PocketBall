//
//  RoundView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI

struct RoundView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.presentationMode) private var presentationMode
    @State private var round: Round? = nil
    let roundTypes = ["Stroke", "Match", "Scramble"]
    
    // Add initializer for preview purposes
    init(round: Round? = nil) {
        if let round = round {
            _round = State(initialValue: round)
        }
    }
    
    var body: some View {
        ZStack {
            Color(UIColor.systemBackground).ignoresSafeArea().ignoresSafeArea()
            VStack(spacing: 0) {
                if let round = round {
                    RoundSubView(round: round).padding()
                } else {
                    Text("No round data found.")
                        .font(.title2)
                        .foregroundColor(.secondary)
                        .padding()
                }
            }.padding()
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            round = RoundHistoryManager.shared.latestRound()
        }
    }
}
