import Foundation

// MARK: - ParsedHole Model for Scanner Integration



// MARK: - Score Data Models

// Structure to hold complete hole information from course
struct HoleInfo: Codable, Equatable {
    let holeNumber: Int
    let par: Int
    let handicap: Int
    let yardages: [String: Int] // TeeColor -> yardage mapping
    
    init(from courseHole: CourseHole) {
        self.holeNumber = courseHole.holeNumber
        self.par = courseHole.par
        self.handicap = courseHole.handicap
        
        // Convert CourseHole yardages to dictionary
        var yardageMap: [String: Int] = [:]
        for (teeColor, yardage) in courseHole.yardages {
            yardageMap[teeColor.rawValue] = yardage
        }
        self.yardages = yardageMap
    }
    
    // Fallback initializer for default holes
    init(holeNumber: Int, par: Int = 4, handicap: Int = 1, yardages: [String: Int] = [:]) {
        self.holeNumber = holeNumber
        self.par = par
        self.handicap = handicap
        self.yardages = yardages
    }
}

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
    var par: [Int] // Par for each hole - kept for backward compatibility
    var holeInfo: [HoleInfo]? // Complete hole information including yardages
    var lastUpdated: Date
    
    init(roundId: UUID, players: [String], holes: Int) {
        self.roundId = roundId
        self.par = Array(repeating: 4, count: holes) // Default par 4 for all holes
        self.holeInfo = nil // Will be set when course data is available
        self.lastUpdated = Date()
        
        // Initialize empty score data for each player
        var playerScores: [String: PlayerScoreData] = [:]
        for player in players {
            playerScores[player] = PlayerScoreData(holes: holes)
        }
        self.playerScores = playerScores
    }
    
    // Convenience initializer with course hole data
    init(roundId: UUID, players: [String], courseHoles: [CourseHole]) {
        self.roundId = roundId
        self.par = courseHoles.map { $0.par }
        self.holeInfo = courseHoles.map { HoleInfo(from: $0) }
        self.lastUpdated = Date()
        
        // Initialize empty score data for each player
        var playerScores: [String: PlayerScoreData] = [:]
        for player in players {
            playerScores[player] = PlayerScoreData(holes: courseHoles.count)
        }
        self.playerScores = playerScores
    }
    
    mutating func updateLastModified() {
        self.lastUpdated = Date()
    }
    
    // Get par for a specific hole (1-based index)
    func getParForHole(_ holeNumber: Int) -> Int {
        if let holeInfo = holeInfo, holeNumber > 0, holeNumber <= holeInfo.count {
            return holeInfo[holeNumber - 1].par
        }
        return par[safe: holeNumber - 1] ?? 4
    }
    
    // Get yardage for a specific hole and tee color (1-based index)
    func getYardageForHole(_ holeNumber: Int, teeColor: String) -> Int? {
        guard let holeInfo = holeInfo, holeNumber > 0, holeNumber <= holeInfo.count else {
            return nil
        }
        return holeInfo[holeNumber - 1].yardages[teeColor]
    }
    
    // Get handicap for a specific hole (1-based index)
    func getHandicapForHole(_ holeNumber: Int) -> Int {
        if let holeInfo = holeInfo, holeNumber > 0, holeNumber <= holeInfo.count {
            return holeInfo[holeNumber - 1].handicap
        }
        return holeNumber // Default to hole number as handicap
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
        get {
            indices.contains(index) ? self[index] : nil
        }
        set {
            if let value = newValue, indices.contains(index) {
                self[index] = value
            }
        }
    }
}

// MARK: - Course Scorecard Models

enum TeeColor: String, CaseIterable, Codable {
    case black = "Black"
    case blue = "Blue"
    case white = "White"
    case yellow = "Yellow"
    case red = "Red"
    case gold = "Gold"
    case green = "Green"
    
    var colorHex: String {
        switch self {
        case .black: return "#000000"
        case .blue: return "#0066CC"
        case .white: return "#FFFFFF"
        case .yellow: return "#FFD700"
        case .red: return "#FF0000"
        case .gold: return "#FFD700"
        case .green: return "#008000"
        }
    }
}

struct CourseHole: Codable, Identifiable {
    let id = UUID()
    let holeNumber: Int
    let par: Int
    let handicap: Int
    var yardages: [TeeColor: Int] // Yardages for each tee color
    
    init(holeNumber: Int, par: Int, handicap: Int, yardages: [TeeColor: Int] = [:]) {
        self.holeNumber = holeNumber
        self.par = par
        self.handicap = handicap
        self.yardages = yardages
    }
    
    // Convenience methods
    func yardage(for teeColor: TeeColor) -> Int? {
        return yardages[teeColor]
    }
    
    mutating func setYardage(_ yardage: Int, for teeColor: TeeColor) {
        yardages[teeColor] = yardage
    }
}

struct SavedCourseScorecard: Codable, Identifiable {
    var id = UUID()
    var courseName: String
    var location: String?
    var holes: [CourseHole]
    var availableTees: [TeeColor]
    var courseRating: [TeeColor: Double]?
    var slopeRating: [TeeColor: Int]?
    let dateCreated: Date
    var lastUpdated: Date
    
    init(courseName: String, location: String? = nil, holes: [CourseHole] = [], availableTees: [TeeColor] = []) {
        self.id = UUID()
        self.courseName = courseName
        self.location = location
        self.holes = holes.isEmpty ? Self.defaultHoles() : holes
        self.availableTees = availableTees.isEmpty ? [.white, .blue, .red] : availableTees
        self.courseRating = [:]
        self.slopeRating = [:]
        self.dateCreated = Date()
        self.lastUpdated = Date()
    }
    
    mutating func updateLastModified() {
        self.lastUpdated = Date()
    }
    
    // Create default 18 holes with par 4
    private static func defaultHoles() -> [CourseHole] {
        return (1...18).map { holeNumber in
            CourseHole(holeNumber: holeNumber, par: 4, handicap: holeNumber)
        }
    }
    
    // Calculate total par for the course
    var totalPar: Int {
        return holes.reduce(0) { $0 + $1.par }
    }
    
    // Get front 9 holes
    var frontNine: [CourseHole] {
        return Array(holes.prefix(9))
    }
    
    // Get back 9 holes
    var backNine: [CourseHole] {
        return holes.count >= 18 ? Array(holes.suffix(9)) : []
    }
    
    // Calculate total yardage for a specific tee
    func totalYardage(for teeColor: TeeColor) -> Int {
        return holes.compactMap { $0.yardage(for: teeColor) }.reduce(0, +)
    }
}

// MARK: - Course Scorecard Manager

class CourseManager {
    static let shared = CourseManager()
    private let fileName = "saved_courses.json"
    private var fileURL: URL? {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.appendingPathComponent(fileName)
    }
    private init() {}
    
    // Save a course scorecard
    @discardableResult
    func saveCourse(_ course: SavedCourseScorecard) -> Result<Void, Error> {
        var savedCourses = (try? loadAllCourses().get()) ?? []
        
        // Remove existing course if it exists (update scenario)
        savedCourses.removeAll { $0.id == course.id }
        
        // Add the course
        var updatedCourse = course
        updatedCourse.updateLastModified()
        savedCourses.insert(updatedCourse, at: 0)
        
        // Keep only the most recent 50 courses
        if savedCourses.count > 50 {
            savedCourses = Array(savedCourses.prefix(50))
        }
        
        return saveCourses(savedCourses)
    }
    
    // Load a specific course by ID
    func loadCourse(by id: UUID) -> Result<SavedCourseScorecard?, Error> {
        let allCourses = (try? loadAllCourses().get()) ?? []
        let course = allCourses.first { $0.id == id }
        return .success(course)
    }
    
    // Load all saved courses
    func loadAllCourses() -> Result<[SavedCourseScorecard], Error> {
        guard let url = fileURL else {
            return .failure(NSError(domain: "FileURL", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not get file URL"]))
        }
        
        do {
            let data = try Data(contentsOf: url)
            let courses = try JSONDecoder().decode([SavedCourseScorecard].self, from: data)
            return .success(courses.sorted { $0.lastUpdated > $1.lastUpdated })
        } catch {
            if (error as NSError).code == NSFileReadNoSuchFileError {
                return .success([])
            }
            return .failure(error)
        }
    }
    
    // Delete a course
    @discardableResult
    func deleteCourse(by id: UUID) -> Result<Void, Error> {
        var savedCourses = (try? loadAllCourses().get()) ?? []
        savedCourses.removeAll { $0.id == id }
        return saveCourses(savedCourses)
    }
    
    // Search courses by name
    func searchCourses(by name: String) -> Result<[SavedCourseScorecard], Error> {
        let allCourses = (try? loadAllCourses().get()) ?? []
        let filteredCourses = allCourses.filter {
            $0.courseName.localizedCaseInsensitiveContains(name) ||
            $0.location?.localizedCaseInsensitiveContains(name) == true
        }
        return .success(filteredCourses)
    }
    
    // Create course from parsed holes (integration with your scanner)
    func createCourseFromParsedHoles(_ parsedHoles: [ParsedHole], courseName: String, location: String? = nil) -> SavedCourseScorecard {
        let courseHoles = parsedHoles.map { parsedHole in
            var yardages: [TeeColor: Int] = [:]
            if let yardage = parsedHole.yardage {
                yardages[.white] = yardage // Default to white tees
            }
            
            return CourseHole(
                holeNumber: parsedHole.holeNumber,
                par: parsedHole.par ?? 4,
                handicap: parsedHole.holeNumber,
                yardages: yardages
            )
        }
        
        return SavedCourseScorecard(
            courseName: courseName,
            location: location,
            holes: courseHoles,
            availableTees: [.white, .blue, .red]
        )
    }
    
    private func saveCourses(_ courses: [SavedCourseScorecard]) -> Result<Void, Error> {
        do {
            let data = try JSONEncoder().encode(courses)
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
