import Foundation

struct Round: Codable, Identifiable, Equatable {
    let id: UUID
    let courseName: String
    let date: Date
    let numberOfPlayers: Int
    let isPrivate: Bool
    let holes: Int
    let roundPlayers: Int
    let roundType: String
    let players: [String]
    var isCompleted: Bool = false
    
    init(courseName: String, date: Date, numberOfPlayers: Int, isPrivate: Bool, holes: Int, roundPlayers: Int, roundType: String, players: [String], isCompleted: Bool = false) {
        self.id = UUID()
        self.courseName = courseName
        self.date = date
        self.numberOfPlayers = numberOfPlayers
        self.isPrivate = isPrivate
        self.holes = holes
        self.roundPlayers = roundPlayers
        self.roundType = roundType
        self.players = players
        self.isCompleted = isCompleted
    }
    
    // Add init that preserves existing ID for updates
    init(id: UUID, courseName: String, date: Date, numberOfPlayers: Int, isPrivate: Bool, holes: Int, roundPlayers: Int, roundType: String, players: [String], isCompleted: Bool = false) {
        self.id = id
        self.courseName = courseName
        self.date = date
        self.numberOfPlayers = numberOfPlayers
        self.isPrivate = isPrivate
        self.holes = holes
        self.roundPlayers = roundPlayers
        self.roundType = roundType
        self.players = players
        self.isCompleted = isCompleted
    }
}

class RoundHistoryManager {
    static let shared = RoundHistoryManager()
    private let fileName = "round_history.json"
    private var fileURL: URL? {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.appendingPathComponent(fileName)
    }
    private init() {}
    
    @discardableResult
    func saveRound(_ round: Round) -> Result<Void, Error> {
        var rounds = (try? loadRounds().get()) ?? []
        rounds.insert(round, at: 0)
        if rounds.count > 100 {
            rounds = Array(rounds.prefix(100))
        }
        do {
            let data = try JSONEncoder().encode(rounds)
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
    
    func loadRounds() -> Result<[Round], Error> {
        guard let url = fileURL else {
            return .failure(NSError(domain: "FileURL", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not get file URL"]))
        }
        do {
            let data = try Data(contentsOf: url)
            let rounds = try JSONDecoder().decode([Round].self, from: data)
            return .success(rounds)
        } catch {
            if (error as NSError).code == NSFileReadNoSuchFileError {
                return .success([])
            }
            return .failure(error)
        }
    }
    
    func latestRound() -> Round? {
        return (try? loadRounds().get())?.first
    }
    
    func clearRounds() -> Result<Void, Error> {
        guard let url = fileURL else {
            return .failure(NSError(domain: "FileURL", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not get file URL"]))
        }
        do {
            if FileManager.default.fileExists(atPath: url.path) {
                try FileManager.default.removeItem(at: url)
            }
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func markLatestRoundCompleted() -> Result<Void, Error> {
        var rounds = (try? loadRounds().get()) ?? []
        guard !rounds.isEmpty else { return .success(()) }
        rounds[0].isCompleted = true
        do {
            let data = try JSONEncoder().encode(rounds)
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
    
    @discardableResult
    func updateRound(_ round: Round) -> Result<Void, Error> {
        var rounds = (try? loadRounds().get()) ?? []
        
        // Find and replace the round with the same ID
        if let index = rounds.firstIndex(where: { $0.id == round.id }) {
            rounds[index] = round
        } else {
            // If round not found, add it as new
            rounds.insert(round, at: 0)
        }
        
        if rounds.count > 100 {
            rounds = Array(rounds.prefix(100))
        }
        
        do {
            let data = try JSONEncoder().encode(rounds)
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
    
    // Add method to get a specific round by ID
    func getRound(by id: UUID) -> Round? {
        let rounds = (try? loadRounds().get()) ?? []
        return rounds.first { $0.id == id }
    }
}
