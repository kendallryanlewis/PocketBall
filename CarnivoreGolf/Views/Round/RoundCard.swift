//
//  RoundCard.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/10/25.
//

import SwiftUI


struct RoundCard: View {
    let round: Round
    let isRecent: Bool
    var maxWidth: CGFloat? = nil
    var compact: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: compact ? 6 : 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(round.courseName)
                        .font(compact ? .subheadline : .headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                        .truncationMode(.tail)
                    Text(round.date, style: .date)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer(minLength: 8)
                VStack(alignment: .trailing, spacing: 2) {
                    if round.isCompleted {
                        Image(systemName: "checkmark.circle.fill")
                            .font(compact ? .callout : .title3)
                            .foregroundColor(.green)
                    } else {
                        Image(systemName: "clock.fill")
                            .font(compact ? .callout : .title3)
                            .foregroundColor(.orange)
                    }
                    Text(round.isCompleted ? "Done" : "Playing")
                        .font(.caption2)
                        .foregroundColor(round.isCompleted ? .green : .orange)
                }
            }
            
            if !compact {
                // Stats in a more compact layout
                VStack(spacing: 6) {
                    HStack(spacing: 12) {
                        HStack(spacing: 4) {
                            Image(systemName: "flag.fill")
                                .font(.caption2)
                            Text("\(round.holes)")
                                .font(.caption)
                        }
                        HStack(spacing: 4) {
                            Image(systemName: "person.2.fill")
                                .font(.caption2)
                            Text("\(round.players.count)")
                                .font(.caption)
                        }
                        HStack(spacing: 4) {
                            Image(systemName: "golf.teeingground")
                                .font(.caption2)
                            Text(round.roundType)
                                .font(.caption)
                                .lineLimit(1)
                                .truncationMode(.tail)
                        }
                        Spacer()
                        if round.isPrivate {
                            HStack(spacing: 4) {
                                Image(systemName: "lock.fill")
                                    .font(.caption2)
                                Text("Private")
                                    .font(.caption2)
                            }
                            .foregroundColor(.secondary)
                        }
                    }
                    .foregroundColor(.secondary)
                    
                    if !round.players.isEmpty && round.players.count <= 4 {
                        HStack(spacing: 4) {
                            Text("Players:")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            Text(round.players.joined(separator: ", "))
                                .font(.caption2)
                                .foregroundColor(.primary)
                                .lineLimit(1)
                                .truncationMode(.tail)
                            Spacer()
                        }
                    } else if round.players.count > 4 {
                        HStack(spacing: 4) {
                            Text("Players:")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            Text("\(round.players.prefix(2).joined(separator: ", ")) +\(round.players.count - 2) more")
                                .font(.caption2)
                                .foregroundColor(.primary)
                                .lineLimit(1)
                            Spacer()
                        }
                    }
                }
            } else {
                // Ultra compact version
                HStack(spacing: 8) {
                    Text("\(round.holes)h")
                    Text("•")
                    Text("\(round.players.count)p")
                    Text("•")
                    Text(round.roundType)
                        .lineLimit(1)
                        .truncationMode(.tail)
                    Spacer()
                }
                .font(.caption2)
                .foregroundColor(.secondary)
            }
        }
        .padding(compact ? 10 : 12)
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .frame(maxWidth: maxWidth)
    }
}

