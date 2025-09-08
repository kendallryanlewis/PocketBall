import Foundation
import SwiftUI

class SettingsManager: ObservableObject {
    // Personal Info
    @Published var userName: String {
        didSet { UserDefaults.standard.set(userName, forKey: "userName") }
    }
    @Published var email: String {
        didSet { UserDefaults.standard.set(email, forKey: "userEmail") }
    }
    @Published var handicap: String {
        didSet { UserDefaults.standard.set(handicap, forKey: "userHandicap") }
    }
    @Published var homeClub: String {
        didSet { UserDefaults.standard.set(homeClub, forKey: "homeClub") }
    }

    // Club Distances & Visibility
    @Published var clubDistances: [String: String] {
        didSet { saveClubDistances() }
    }
    @Published var clubVisibility: [String: Bool] {
        didSet { saveClubVisibility() }
    }

    // App Preferences
    @Published var defaultRoundType: String {
        didSet { UserDefaults.standard.set(defaultRoundType, forKey: "defaultRoundType") }
    }
    @Published var defaultHoles: Int {
        didSet { UserDefaults.standard.set(defaultHoles, forKey: "defaultHoles") }
    }
    @Published var enableNotifications: Bool {
        didSet { UserDefaults.standard.set(enableNotifications, forKey: "enableNotifications") }
    }
    @Published var trackStatistics: Bool {
        didSet { UserDefaults.standard.set(trackStatistics, forKey: "trackStatistics") }
    }
    @Published var autoSaveRounds: Bool {
        didSet { UserDefaults.standard.set(autoSaveRounds, forKey: "autoSaveRounds") }
    }

    // Club names (order matters for UI)
    let allClubNames: [String] = [
        "Driver", "3 Wood", "5 Wood", "7 Wood",
        "2 Hybrid", "3 Hybrid", "4 Hybrid", "Hybrid",
        "3 Iron", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron",
        "PW", "GW", "SW", "LW", "Putter"
    ]

    init() {
        // Personal Info
        self.userName = UserDefaults.standard.string(forKey: "userName") ?? "Kendall"
        self.email = UserDefaults.standard.string(forKey: "userEmail") ?? ""
        self.handicap = UserDefaults.standard.string(forKey: "userHandicap") ?? ""
        self.homeClub = UserDefaults.standard.string(forKey: "homeClub") ?? ""

        // Club Distances
        var distances: [String: String] = [:]
        for club in allClubNames {
            let key = SettingsManager.keyForClubDistance(club)
            let defaultValue = Self.defaultDistance(for: club)
            distances[club] = UserDefaults.standard.string(forKey: key) ?? defaultValue
        }
        self.clubDistances = distances

        // Club Visibility
        var visibility: [String: Bool] = [:]
        for club in allClubNames {
            let key = SettingsManager.keyForClubVisible(club)
            let defaultValue = Self.defaultVisible(for: club)
            visibility[club] = UserDefaults.standard.object(forKey: key) == nil ? defaultValue : UserDefaults.standard.bool(forKey: key)
        }
        self.clubVisibility = visibility

        // App Preferences
        self.defaultRoundType = UserDefaults.standard.string(forKey: "defaultRoundType") ?? "Stroke"
        self.defaultHoles = UserDefaults.standard.integer(forKey: "defaultHoles") != 0 ? UserDefaults.standard.integer(forKey: "defaultHoles") : 18
        self.enableNotifications = UserDefaults.standard.bool(forKey: "enableNotifications")
        self.trackStatistics = UserDefaults.standard.bool(forKey: "trackStatistics")
        self.autoSaveRounds = UserDefaults.standard.bool(forKey: "autoSaveRounds")
    }

    // MARK: - Club Distance/Visibility Helpers
    private func saveClubDistances() {
        for (club, value) in clubDistances {
            UserDefaults.standard.set(value, forKey: Self.keyForClubDistance(club))
        }
    }
    private func saveClubVisibility() {
        for (club, value) in clubVisibility {
            UserDefaults.standard.set(value, forKey: Self.keyForClubVisible(club))
        }
    }
    static func keyForClubDistance(_ club: String) -> String {
        return club.replacingOccurrences(of: " ", with: "").lowercased() + "Distance"
    }
    static func keyForClubVisible(_ club: String) -> String {
        return club.replacingOccurrences(of: " ", with: "").lowercased() + "Visible"
    }
    static func defaultDistance(for club: String) -> String {
        switch club {
        case "Driver": return "250"
        case "3 Wood": return "230"
        case "5 Wood": return "210"
        case "7 Wood": return "190"
        case "2 Hybrid": return "210"
        case "3 Hybrid": return "200"
        case "4 Hybrid": return "190"
        case "Hybrid": return "180"
        case "3 Iron": return "200"
        case "4 Iron": return "190"
        case "5 Iron": return "175"
        case "6 Iron": return "160"
        case "7 Iron": return "145"
        case "8 Iron": return "130"
        case "9 Iron": return "115"
        case "PW": return "100"
        case "GW": return "90"
        case "SW": return "80"
        case "LW": return "60"
        case "Putter": return "3"
        default: return "0"
        }
    }
    static func defaultVisible(for club: String) -> Bool {
        switch club {
        case "Driver", "3 Wood", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron", "PW", "SW", "Putter":
            return true
        default:
            return false
        }
    }
    // Reset all club distances to default
    func resetClubDistances() {
        for club in allClubNames {
            clubDistances[club] = Self.defaultDistance(for: club)
        }
    }
}
