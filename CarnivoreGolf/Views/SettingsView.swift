//
//  SettingsView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/7/25.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var settings: SettingsManager
    // UI
    @State private var showClearDataAlert = false
    @State private var showResetClubsAlert = false
    @State private var showSaveAlert = false
    @State private var isEditing: Bool = false
    @Environment(\.dismiss) private var dismiss
    
    let roundTypes = ["Stroke", "Match", "Scramble", "Carnivore", "Randomize", "Reverse Mulligans"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header matching LandingView style
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Button(action: { dismiss() }) {
                        HStack(spacing: 8) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.primary)
                            Text("Settings")
                                .font(.system(size: 54, weight: .thin, design: .default))
                                .foregroundColor(.primary)
                        }
                        .padding(.vertical, 16) // Add vertical padding
                    }
                    Spacer()
                    Button(isEditing ? "Done" : "Edit") {
                        isEditing.toggle()
                    }
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(isEditing ? .green : .primary)
                }
                Text("PERSONAL   •   CLUBS   •   PREFERENCES   •   DATA")
                    .font(.system(size: 8, weight: .medium, design: .default))
                    .foregroundColor(.primary)
                    .textCase(.uppercase)
                    .kerning(2)
                    .padding(.bottom, 4)
                Text("Customize your golf experience and club preferences.")
                    .font(.system(size: 15, weight: .regular, design: .default))
                    .foregroundColor(.secondary)
                    .padding(.bottom, 12)
            }
            .padding(.horizontal, 28)
            .padding(.top, 20)
            
            Spacer()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Personal Information Section
                    VStack(alignment: .leading, spacing: 16) {
                        SectionHeader(title: "Personal Information")
                        VStack(alignment: .leading, spacing: 20) {
                            // Profile Avatar (centered)
                            HStack {
                                Spacer()
                                ZStack {
                                    Circle()
                                        .fill(Color(.systemGray5))
                                        .frame(width: 72, height: 72)
                                    Text(getInitials(from: settings.userName))
                                        .font(.system(size: 32, weight: .bold))
                                        .foregroundColor(.primary)
                                }
                                Spacer()
                            }
                            if isEditing {
                                Button(action: {}) {
                                    Text("Edit Photo")
                                        .font(.caption)
                                        .foregroundColor(.blue)
                                }
                            }
                            Divider()
                            VStack(alignment: .leading, spacing: 16) {
                                PersonalInfoRow(label: "Name", value: $settings.userName, isEditing: isEditing, placeholder: "Enter your name")
                                PersonalInfoRow(label: "Email", value: $settings.email, isEditing: isEditing, placeholder: "Enter your email")
                                PersonalInfoRow(label: "Handicap", value: $settings.handicap, isEditing: isEditing, placeholder: "Enter your handicap")
                                PersonalInfoRow(label: "Home Club", value: $settings.homeClub, isEditing: isEditing, placeholder: "Enter your home club")
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemBackground))
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color(.systemGray4), lineWidth: 0.5)
                        )
                        .padding(.horizontal, 28)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // Club Distances Section
                    VStack(alignment: .leading, spacing: 16) {
                        SectionHeader(title: "Club Distances (yards)")
                        VStack(spacing: 12) {
                            ForEach(settings.allClubNames, id: \.self) { club in
                                if settings.clubVisibility[club] ?? false || isEditing {
                                    ClubDistanceRowWithVisibility(
                                        club: club,
                                        distance: Binding(
                                            get: { settings.clubDistances[club] ?? "" },
                                            set: { settings.clubDistances[club] = $0 }
                                        ),
                                        visible: Binding(
                                            get: { settings.clubVisibility[club] ?? false },
                                            set: { settings.clubVisibility[club] = $0 }
                                        ),
                                        isEditing: isEditing
                                    )
                                }
                            }
                            if isEditing {
                                Button("Reset") {
                                    showResetClubsAlert = true
                                }
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.orange)
                                .frame(maxWidth: .infinity, alignment: .center)
                                .padding(.top, 8)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .padding(.horizontal, 28)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    // App Preferences Section
                    VStack(alignment: .leading, spacing: 16) {
                        SectionHeader(title: "App Preferences")
                        VStack(alignment: .leading, spacing: 16) {
                            if isEditing {
                                VStack(alignment: .leading, spacing: 12) {
                                    HStack(alignment: .center) {
                                        Text("Default Round Type")
                                            .font(.subheadline)
                                            .fontWeight(.medium)
                                        Picker("Round Type", selection: $settings.defaultRoundType) {
                                            ForEach(roundTypes, id: \.self) { type in
                                                Text(type).tag(type)
                                            }
                                        }
                                        .pickerStyle(MenuPickerStyle())
                                    }
                                    Divider()
                                    HStack(alignment: .center) {
                                        Text("Default Holes")
                                            .font(.subheadline)
                                            .fontWeight(.medium)
                                        Stepper(value: $settings.defaultHoles, in: 1...18) {
                                            Text("\(settings.defaultHoles)")
                                                .font(.subheadline)
                                                .fontWeight(.semibold)
                                        }
                                    }
                                    Divider()
                                    SettingsToggle(title: "Enable Notifications", isOn: $settings.enableNotifications)
                                    SettingsToggle(title: "Track Statistics", isOn: $settings.trackStatistics)
                                    SettingsToggle(title: "Auto-Save Rounds", isOn: $settings.autoSaveRounds)
                                }
                            } else {
                                SettingsReadOnlyField(title: "Default Round Type", value: settings.defaultRoundType)
                                SettingsReadOnlyField(title: "Default Holes", value: String(settings.defaultHoles))
                                SettingsReadOnlyField(title: "Enable Notifications", value: settings.enableNotifications ? "On" : "Off")
                                SettingsReadOnlyField(title: "Track Statistics", value: settings.trackStatistics ? "On" : "Off")
                                SettingsReadOnlyField(title: "Auto-Save Rounds", value: settings.autoSaveRounds ? "On" : "Off")
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .padding(.horizontal, 28)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // Data Management Section
                    VStack(alignment: .leading, spacing: 16) {
                        SectionHeader(title: "Data Management")
                        VStack(spacing: 12) {
                            Button(action: { showClearDataAlert = true }) {
                                HStack {
                                    Image(systemName: "trash")
                                    Text("Clear All Round Data")
                                }
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.red)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 28)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // Bottom buttons in VStack (LandingView style)
                    if isEditing {
                        VStack(alignment: .leading, spacing: 20) {
                            Button(action: { showSaveAlert = true }) {
                                Text("Save Settings")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.green)
                                    .padding(.vertical, 8)
                            }
                            Button(action: { dismiss() }) {
                                Text("Done")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(Color.black)
                                    .cornerRadius(8)
                            }
                        }
                        .padding(.horizontal, 28)
                        .padding(.top, 40)
                    }
                }
            }
        }
        .background(Color(.systemBackground))
        .navigationBarBackButtonHidden(true)
        .alert("Clear All Data?", isPresented: $showClearDataAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Clear", role: .destructive) {
                let _ = RoundHistoryManager.shared.clearRounds()
            }
        } message: {
            Text("This will permanently delete all your round data. This action cannot be undone.")
        }
        .alert("Reset Club Distances?", isPresented: $showResetClubsAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Reset", role: .destructive) {
                settings.resetClubDistances()
            }
        } message: {
            Text("This will reset all club distances to default values.")
        }
        .alert("Settings Saved", isPresented: $showSaveAlert) {
            Button("OK") { }
        } message: {
            Text("Your settings have been saved successfully.")
        }
    }
}

struct SectionHeader: View {
    let title: String
    
    var body: some View {
        Text(title)
            .font(.system(size: 17, weight: .bold, design: .default))
            .foregroundColor(.primary)
            .padding(.top, 8)
            .padding(.leading, 24)
            .padding(.bottom, 2)
            .padding(.horizontal, 2)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct SettingsTextField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.primary)
            TextField(placeholder, text: $text)
                .textFieldStyle(RoundedBorderTextFieldStyle())
        }
    }
}

struct SettingsReadOnlyField: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.primary)
            Text(value)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
}

struct ClubDistanceRowWithVisibility: View {
    let club: String
    @Binding var distance: String
    @Binding var visible: Bool
    let isEditing: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            // Visibility toggle (edit mode only)
            if isEditing {
                Button(action: { visible.toggle() }) {
                    Image(systemName: visible ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(visible ? .green : .secondary)
                        .font(.system(size: 22, weight: .medium))
                }
                .buttonStyle(PlainButtonStyle())
            }
            
            // Club name
            Text(club)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.primary)
                .frame(minWidth: 80, alignment: .leading)
                .opacity(visible ? 1.0 : 0.6)
            
            Spacer()
            
            // Distance display/input
            if visible || isEditing {
                HStack(spacing: 8) {
                    if isEditing {
                        TextField("0", text: $distance)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.center)
                            .font(.system(size: 16, weight: .semibold))
                            .frame(width: 60, height: 36)
                            .background(Color(.systemGray5))
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                    } else {
                        Text(distance)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.primary)
                            .frame(width: 60, alignment: .center)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color(.systemGray6))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(Color(.systemGray4), lineWidth: 0.5)
                                    )
                            )
                    }
                    
                    Text("yds")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                        .frame(width: 30, alignment: .leading)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(visible ? Color(.systemBackground) : Color(.systemGray6))
                .shadow(color: Color.black.opacity(visible ? 0.05 : 0.02), radius: 2, x: 0, y: 1)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    visible ? Color(.systemGray4) : Color(.systemGray5),
                    lineWidth: visible ? 1 : 0.5
                )
        )
        .opacity((!visible && !isEditing) ? 0.5 : 1.0)
        .animation(.easeInOut(duration: 0.2), value: visible)
        .animation(.easeInOut(duration: 0.2), value: isEditing)
    }
}

struct SettingsToggle: View {
    let title: String
    @Binding var isOn: Bool
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
            Spacer()
            Toggle("", isOn: $isOn)
                .toggleStyle(SwitchToggleStyle(tint: .green))
        }
    }
}

private func getInitials(from name: String) -> String {
    let comps = name.split(separator: " ")
    if comps.count >= 2 {
        return String(comps[0].prefix(1) + comps[1].prefix(1)).uppercased()
    } else if let first = comps.first {
        return String(first.prefix(2)).uppercased()
    }
    return "?"
}

struct PersonalInfoRow: View {
    let label: String
    @Binding var value: String
    let isEditing: Bool
    let placeholder: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
            if isEditing {
                TextField(placeholder, text: $value)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.subheadline)
                    .frame(maxWidth: .infinity)
            } else {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color(.systemGray6))
                    Text(value)
                        .font(.subheadline)
                        .foregroundColor(.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.vertical, 6)
                        .padding(.horizontal, 10)
                }
                .frame(maxWidth: .infinity, minHeight: 32, alignment: .leading)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    SettingsView().environmentObject(SettingsManager())
}
