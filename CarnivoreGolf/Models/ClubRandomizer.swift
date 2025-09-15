import Foundation
import SwiftUI

// MARK: - Club Randomizer Manager

class ClubRandomizer: ObservableObject {
    static let shared = ClubRandomizer()
    
    @Published var currentAssignments: [UUID: RoundClubAssignments] = [:]
    
    private init() {
        loadAssignments()
    }
    
    // MARK: - Pre-randomize clubs for "Randomize" game type
    func preRandomizeClubsForRound(_ round: Round) -> RoundClubAssignments {
        var assignments: [PlayerClubAssignment] = []
        // Load all courses and find the one matching the round's courseName
        let coursesResult = CourseManager.shared.loadAllCourses()
        guard case .success(let courses) = coursesResult else {
            print("Error: Could not load courses.")
            return RoundClubAssignments(roundId: round.id, gameType: "Randomize", assignments: [])
        }
        guard let course = courses.first(where: { $0.courseName == round.courseName }) else {
            print("Error: Course not found for name \(round.courseName)")
            return RoundClubAssignments(roundId: round.id, gameType: "Randomize", assignments: [])
        }
        let holes = course.holes
        guard holes.count >= 18 else {
            print("Error: Course does not have 18 holes. Found \(holes.count) holes.")
            return RoundClubAssignments(roundId: round.id, gameType: "Randomize", assignments: [])
        }
        // For each player and each hole, assign a random club
        for playerName in round.players {
            for holeNumber in 1...18 {
                let isPar3 = holes[holeNumber-1].par == 3
                let randomClub = getRandomClub(excludingPutter: !isPar3)
                let assignment = PlayerClubAssignment(
                    playerName: playerName,
                    holeNumber: holeNumber,
                    assignedClub: randomClub
                )
                assignments.append(assignment)
            }
        }
        let roundAssignments = RoundClubAssignments(
            roundId: round.id,
            gameType: "Randomize",
            assignments: assignments
        )
        currentAssignments[round.id] = roundAssignments
        saveAssignments()
        return roundAssignments
    }
    
    // MARK: - Get random club for "Stick Talk" game type
    func getRandomClubForPlayer(playerName: String, holeNumber: Int, roundId: UUID) -> GolfClub {
        let randomClub = getRandomClub(excludingPutter: false)
        
        // Create assignment record for Stick Talk
        let assignment = PlayerClubAssignment(
            playerName: playerName,
            holeNumber: holeNumber,
            assignedClub: randomClub
        )
        
        // Update or create assignments for this round
        if let roundAssignments = currentAssignments[roundId] {
            // Make a mutable copy of the assignments array
            var updatedAssignments = roundAssignments.assignments
            // Remove any existing assignment for this player/hole
            updatedAssignments.removeAll {
                $0.playerName == playerName && $0.holeNumber == holeNumber
            }
            // Add new assignment
            updatedAssignments.append(assignment)
            currentAssignments[roundId] = RoundClubAssignments(
                roundId: roundId,
                gameType: "Stick Talk",
                assignments: updatedAssignments
            )
        } else {
            // Create new assignments
            currentAssignments[roundId] = RoundClubAssignments(
                roundId: roundId,
                gameType: "Stick Talk",
                assignments: [assignment]
            )
        }
        
        saveAssignments()
        return randomClub
    }
    
    // MARK: - Get assigned club for a player/hole
    func getAssignedClub(for playerName: String, holeNumber: Int, roundId: UUID) -> GolfClub? {
        guard let roundAssignments = currentAssignments[roundId] else { return nil }
        
        return roundAssignments.assignments.first {
            $0.playerName == playerName && $0.holeNumber == holeNumber
        }?.assignedClub
    }
    
    // MARK: - Get all assignments for a round
    func getAssignments(for roundId: UUID) -> RoundClubAssignments? {
        return currentAssignments[roundId]
    }
    
    // MARK: - Private helper methods
    private func getRandomClub(excludingPutter: Bool) -> GolfClub {
        var availableClubs = GolfClub.allCases
        
        if excludingPutter {
            availableClubs = availableClubs.filter { $0 != .putter }
        }
        
        return availableClubs.randomElement() ?? .sevenIron
    }
    
    private func getRandomClubByCategory(category: ClubCategory) -> GolfClub {
        let clubsInCategory = category.clubs
        return clubsInCategory.randomElement() ?? .sevenIron
    }
    
    // MARK: - Smart club selection based on hole characteristics
    func getSmartRandomClub(for hole: CourseHole) -> GolfClub {
        let par = hole.par
        
        switch par {
        case 3:
            // Par 3: Favor irons and wedges, sometimes woods
            let categories: [ClubCategory] = [.irons, .irons, .wedges, .woods]
            let randomCategory = categories.randomElement() ?? .irons
            return getRandomClubByCategory(category: randomCategory)
            
        case 4:
            // Par 4: Mix of all clubs except putter for tee shots
            let categories: [ClubCategory] = [.woods, .irons, .irons, .wedges]
            let randomCategory = categories.randomElement() ?? .irons
            return getRandomClubByCategory(category: randomCategory)
            
        case 5:
            // Par 5: Favor woods and longer clubs
            let categories: [ClubCategory] = [.woods, .woods, .irons, .wedges]
            let randomCategory = categories.randomElement() ?? .woods
            return getRandomClubByCategory(category: randomCategory)
            
        default:
            return getRandomClub(excludingPutter: true)
        }
    }
    
    // MARK: - Persistence
    private func saveAssignments() {
        do {
            let data = try JSONEncoder().encode(currentAssignments)
            UserDefaults.standard.set(data, forKey: "ClubAssignments")
        } catch {
            print("Failed to save club assignments: \(error)")
        }
    }
    
    private func loadAssignments() {
        guard let data = UserDefaults.standard.data(forKey: "ClubAssignments") else { return }
        
        do {
            currentAssignments = try JSONDecoder().decode([UUID: RoundClubAssignments].self, from: data)
        } catch {
            print("Failed to load club assignments: \(error)")
            currentAssignments = [:]
        }
    }
    
    // MARK: - Cleanup
    func clearAssignments(for roundId: UUID) {
        currentAssignments.removeValue(forKey: roundId)
        saveAssignments()
    }
}
