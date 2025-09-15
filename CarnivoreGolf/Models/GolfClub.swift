
import Foundation

// MARK: - Golf Club Model

enum GolfClub: String, CaseIterable, Codable {
    case driver = "Driver"
    case threeWood = "3 Wood"
    case fiveWood = "5 Wood"
    case sevenWood = "7 Wood"
    case twoIron = "2 Iron"
    case threeIron = "3 Iron"
    case fourIron = "4 Iron"
    case fiveIron = "5 Iron"
    case sixIron = "6 Iron"
    case sevenIron = "7 Iron"
    case eightIron = "8 Iron"
    case nineIron = "9 Iron"
    case pitchingWedge = "Pitching Wedge"
    case gapWedge = "Gap Wedge"
    case sandWedge = "Sand Wedge"
    case lobWedge = "Lob Wedge"
    case putter = "Putter"
    
    var displayName: String {
        return self.rawValue
    }
    
    var icon: String {
        switch self {
        case .driver, .threeWood, .fiveWood, .sevenWood:
            return "figure.golf"
        case .twoIron, .threeIron, .fourIron, .fiveIron, .sixIron, .sevenIron, .eightIron, .nineIron:
            return "figure.golf.circle"
        case .pitchingWedge, .gapWedge, .sandWedge, .lobWedge:
            return "triangle.fill"
        case .putter:
            return "circle.fill"
        }
    }
    
    var category: ClubCategory {
        switch self {
        case .driver, .threeWood, .fiveWood, .sevenWood:
            return .woods
        case .twoIron, .threeIron, .fourIron, .fiveIron, .sixIron, .sevenIron, .eightIron, .nineIron:
            return .irons
        case .pitchingWedge, .gapWedge, .sandWedge, .lobWedge:
            return .wedges
        case .putter:
            return .putter
        }
    }
}

enum ClubCategory: String, CaseIterable {
    case woods = "Woods"
    case irons = "Irons"
    case wedges = "Wedges"
    case putter = "Putter"
    
    var clubs: [GolfClub] {
        return GolfClub.allCases.filter { $0.category == self }
    }
}

// MARK: - Club Assignment Models

struct PlayerClubAssignment: Codable, Identifiable {
    let id = UUID()
    let playerName: String
    let holeNumber: Int
    let assignedClub: GolfClub
    let assignedAt: Date
    
    init(playerName: String, holeNumber: Int, assignedClub: GolfClub) {
        self.playerName = playerName
        self.holeNumber = holeNumber
        self.assignedClub = assignedClub
        self.assignedAt = Date()
    }
}

struct RoundClubAssignments: Codable, Identifiable {
    let id = UUID()
    let roundId: UUID
    let gameType: String
    let assignments: [PlayerClubAssignment]
    let createdAt: Date
    
    init(roundId: UUID, gameType: String, assignments: [PlayerClubAssignment]) {
        self.roundId = roundId
        self.gameType = gameType
        self.assignments = assignments
        self.createdAt = Date()
    }
}
