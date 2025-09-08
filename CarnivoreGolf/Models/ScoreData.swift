import Foundation

// MARK: - Score Data Models

struct PlayerScoreData: Codable, Equatable {
    var scores: [Int]
    var putts: [Int]
    var sandShots: [Int]
    var penalties: [Int]
    var fairways: [Bool?]
    var gir: [Bool?] // Green in Regulation
    
    init(holes: Int) {
        self.scores = Array(repeating: 0, count: holes) // Start with empty scores (0)
        self.putts = Array(repeating: 0, count: holes) // Start with empty putts (0)
        self.sandShots = Array(repeating: 0, count: holes)
        self.penalties = Array(repeating: 0, count: holes)
        self.fairways = Array(repeating: nil, count: holes)
        self.gir = Array(repeating: nil, count: holes)
    }
}

struct RoundScoreData: Codable, Equatable {
    let roundId: UUID
    var playerScores: [String: PlayerScoreData] // Player name -> their score data
    var par: [Int] // Par for each hole
    var lastUpdated: Date
    
    init(roundId: UUID, players: [String], holes: Int) {
        self.roundId = roundId
        self.par = Array(repeating: 4, count: holes) // Default par 4 for all holes
        self.lastUpdated = Date()
        
        // Initialize empty score data for each player
        var playerScores: [String: PlayerScoreData] = [:]
        for player in players {
            playerScores[player] = PlayerScoreData(holes: holes)
        }
        self.playerScores = playerScores
    }
    
    mutating func updateLastModified() {
        self.lastUpdated = Date()
    }
}

// MARK: - Score Data Manager

class ScoreDataManager {
    static let shared = ScoreDataManager()
    private let fileName = "score_data.json"
    private var fileURL: URL? {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.appendingPathComponent(fileName)
    }
    private init() {}
    
    @discardableResult
    func saveScoreData(_ scoreData: RoundScoreData) -> Result<Void, Error> {
        var allScoreData = (try? loadAllScoreData().get()) ?? []
        
        // Remove existing data for this round if it exists
        allScoreData.removeAll { $0.roundId == scoreData.roundId }
        
        // Add the updated data
        allScoreData.insert(scoreData, at: 0)
        
        // Keep only the most recent 100 rounds
        if allScoreData.count > 100 {
            allScoreData = Array(allScoreData.prefix(100))
        }
        
        do {
            let data = try JSONEncoder().encode(allScoreData)
            if let url = fileURL {
                try data.write(to: url)
                return .success(())
            } else {
                return .failure(NSError(domain: "FileURL", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not get file URL"]))
            }
        } catch {
            return .failure(error)
        }
    }
    
    func loadScoreData(for roundId: UUID) -> Result<RoundScoreData?, Error> {
        let allScoreData = (try? loadAllScoreData().get()) ?? []
        let scoreData = allScoreData.first { $0.roundId == roundId }
        return .success(scoreData)
    }
    
    func loadAllScoreData() -> Result<[RoundScoreData], Error> {
        guard let url = fileURL else {
            return .failure(NSError(domain: "FileURL", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not get file URL"]))
        }
        do {
            let data = try Data(contentsOf: url)
            let scoreData = try JSONDecoder().decode([RoundScoreData].self, from: data)
            return .success(scoreData)
        } catch {
            if (error as NSError).code == NSFileReadNoSuchFileError {
                return .success([])
            }
            return .failure(error)
        }
    }
    
    func deleteScoreData(for roundId: UUID) -> Result<Void, Error> {
        var allScoreData = (try? loadAllScoreData().get()) ?? []
        allScoreData.removeAll { $0.roundId == roundId }
        
        do {
            let data = try JSONEncoder().encode(allScoreData)
            if let url = fileURL {
                try data.write(to: url)
                return .success(())
            } else {
                return .failure(NSError(domain: "FileURL", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not get file URL"]))
            }
        } catch {
            return .failure(error)
        }
    }
}

// MARK: - Array Extensions for Safe Access

extension Array {
    subscript(safe index: Index) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}
