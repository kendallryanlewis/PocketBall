import Foundation
import Vision
import NaturalLanguage

// MARK: - AI Text Processor

class AITextProcessor {
    
    private let textRecognizer = VNRecognizeTextRequest()
    private let languageRecognizer = NLLanguageRecognizer()
    
    init() {
        setupTextRecognizer()
    }
    
    private func setupTextRecognizer() {
        textRecognizer.recognitionLevel = .accurate
        textRecognizer.usesLanguageCorrection = true
        textRecognizer.automaticallyDetectsLanguage = true
        textRecognizer.minimumTextHeight = 0.05
        textRecognizer.customWords = [
            "HOLE", "Par", "Handicap", "Yards", "Yds", "Tee",
            "Black", "Blue", "White", "Red", "Gold", "Green",
            "Championship", "Front", "Back", "Out", "In", "Total"
        ]
    }
    
    // MARK: - AI Text Enhancement
    
    func enhanceText(_ text: String) async -> String {
        print("🤖 AI enhancing text: '\(text.prefix(50))...'")
        
        var enhancedText = text
        
        // Apply AI-powered OCR corrections
        enhancedText = await applyAICorrections(enhancedText)
        
        // Enhance with NLP context understanding
        enhancedText = await enhanceWithNLP(enhancedText)
        
        // Apply golf-specific intelligence
        enhancedText = await applyGolfContextAI(enhancedText)
        
        print("🤖 AI enhanced result: '\(enhancedText.prefix(50))...'")
        return enhancedText
    }
    
    // MARK: - AI Hole Data Parsing
    
    func parseHoleDataWithAI(from text: String) async -> [ParsedHole] {
        print("🤖 AI parsing hole data from: '\(text.prefix(100))...'")
        
        // Use multiple AI strategies in parallel
        async let tableStrategy = parseWithTableAI(text)
        async let patternStrategy = parseWithPatternAI(text)
        async let semanticStrategy = parseWithSemanticAI(text)
        async let contextStrategy = parseWithContextAI(text)
        
        let results = await [tableStrategy, patternStrategy, semanticStrategy, contextStrategy]
        
        // Combine and validate results with AI confidence scoring
        let combinedHoles = combineResultsWithAI(results)
        
        print("🤖 AI parsed \(combinedHoles.count) holes")
        return combinedHoles
    }
    
    // MARK: - AI Text Quality Assessment
    
    func calculateTextQuality(_ text: String) async -> Float {
        print("🤖 AI calculating text quality for: '\(text.prefix(30))...'")
        
        var qualityScore: Float = 0.5 // Base score
        
        // Language detection confidence
        languageRecognizer.processString(text)
        let languageHypotheses = languageRecognizer.languageHypotheses(withMaximum: 1)
        let languageConfidence = languageHypotheses.first?.value ?? 0.0
        qualityScore += Float(languageConfidence) * 0.2
        
        // Character recognition quality
        let characterQuality = await assessCharacterQuality(text)
        qualityScore += characterQuality * 0.3
        
        // Golf context relevance
        let golfRelevance = calculateGolfRelevance(text)
        qualityScore += golfRelevance * 0.3
        
        // Structural coherence
        let structuralScore = assessStructuralCoherence(text)
        qualityScore += structuralScore * 0.2
        
        let finalScore = max(0.0, min(1.0, qualityScore))
        print("🤖 AI text quality score: \(Int(finalScore * 100))%")
        return finalScore
    }
    
    // MARK: - AI Hole Row Detection
    
    func isLikelyHoleRow(_ text: String) async -> Bool {
        print("🤖 AI analyzing hole row likelihood: '\(text.prefix(50))...'")
        
        var confidence: Float = 0.0
        
        // Check for "HOLE" keyword with context
        if text.lowercased().contains("hole") {
            confidence += 0.4
            
            // Enhanced context analysis
            let numbersAfterHole = extractNumbersAfterKeyword(text, keyword: "hole")
            if numbersAfterHole.count >= 3 {
                confidence += 0.3
            }
        }
        
        // Analyze number sequence patterns with AI
        let numbers = extractNumbers(from: text)
        let sequenceConfidence = await analyzeNumberSequenceWithAI(numbers)
        confidence += sequenceConfidence * 0.3
        
        // Check for golf-specific patterns
        let golfPatternConfidence = await analyzeGolfPatterns(text)
        confidence += golfPatternConfidence * 0.2
        
        // Spatial layout analysis (if available)
        let layoutConfidence = analyzeTextLayout(text)
        confidence += layoutConfidence * 0.1
        
        let isHoleRow = confidence > 0.6
        print("🤖 AI hole row confidence: \(Int(confidence * 100))% - Result: \(isHoleRow)")
        return isHoleRow
    }
    
    // MARK: - Private AI Methods
    
    private func applyAICorrections(_ text: String) async -> String {
        var correctedText = text
        
        // AI-powered character correction based on context
        let corrections = await generateContextualCorrections(text)
        for (wrong, correct) in corrections {
            correctedText = correctedText.replacingOccurrences(of: wrong, with: correct, options: .caseInsensitive)
        }
        
        return correctedText
    }
    
    private func generateContextualCorrections(_ text: String) async -> [(String, String)] {
        // AI generates corrections based on surrounding context
        var corrections: [(String, String)] = []
        
        // Enhanced number corrections with context awareness
        let words = text.components(separatedBy: .whitespacesAndNewlines)
        for (index, word) in words.enumerated() {
            let context = getWordContext(words, index: index)
            
            if let correction = await generateCorrection(for: word, context: context) {
                corrections.append((word, correction))
            }
        }
        
        return corrections
    }
    
    private func generateCorrection(for word: String, context: [String]) async -> String? {
        // AI-powered correction based on golf context
        let golfTerms = ["hole", "par", "handicap", "yards", "tee"]
        let hasGolfContext = context.contains { golfTerms.contains($0.lowercased()) }
        
        if hasGolfContext {
            // Apply golf-specific corrections
            switch word.lowercased() {
            case "hoie", "hqle", "h0le": return "HOLE"
            case "pap", "p4r", "pr": return "Par"
            case "yds", "yrds", "y4rds": return "Yards"
            case "hcp", "hdcp", "h'cap": return "Handicap"
            default: break
            }
        }
        
        return nil
    }
    
    private func getWordContext(_ words: [String], index: Int) -> [String] {
        let start = max(0, index - 2)
        let end = min(words.count, index + 3)
        return Array(words[start..<end])
    }
    
    private func enhanceWithNLP(_ text: String) async -> String {
        // Use Natural Language Processing for context understanding
        let tagger = NLTagger(tagSchemes: [.nameType, .lexicalClass])
        tagger.string = text
        
        var enhancedText = text
        
        // Identify and enhance named entities
        tagger.enumerateTags(in: text.startIndex..<text.endIndex, unit: .word, scheme: .nameType) { tag, range in
            if let tag = tag {
                let word = String(text[range])
                if let enhancement = enhanceNamedEntity(word, tag: tag) {
                    enhancedText = enhancedText.replacingOccurrences(of: word, with: enhancement)
                }
            }
            return true
        }
        
        return enhancedText
    }
    
    private func enhanceNamedEntity(_ word: String, tag: NLTag) -> String? {
        // Enhance recognized entities based on golf context
        switch tag {
        case .personalName:
            // Could be course name or designer
            return word.capitalized
        case .placeName:
            // Could be course location
            return word.capitalized
        default:
            return nil
        }
    }
    
    private func applyGolfContextAI(_ text: String) async -> String {
        var contextEnhancedText = text
        
        // AI recognizes golf-specific patterns and structures
        let golfPatterns = [
            (pattern: #"\b([1-9]|1[0-8])\s+(3|4|5)\s+([1-9]|1[0-8])\s+(\d{2,3})\b"#,
             replacement: "Hole $1 Par $2 Handicap $3 Yards $4"),
            (pattern: #"\b(front|back|out|in)\s*nine\b"#,
             replacement: "$1 nine"),
            (pattern: #"\b(championship|member|ladies|senior)\s+(tee|tees)\b"#,
             replacement: "$1 $2")
        ]
        
        for (pattern, replacement) in golfPatterns {
            contextEnhancedText = contextEnhancedText.replacingOccurrences(
                of: pattern,
                with: replacement,
                options: [.regularExpression, .caseInsensitive]
            )
        }
        
        return contextEnhancedText
    }
    
    private func parseWithTableAI(_ text: String) async -> [ParsedHole] {
        print("🤖 AI table parsing...")
        // AI-enhanced table structure recognition
        let lines = text.components(separatedBy: .newlines)
        
        // Use AI to identify table headers and data rows
        let tableStructure = await analyzeTableStructure(lines)
        return parseTableStructure(tableStructure)
    }
    
    private func parseWithPatternAI(_ text: String) async -> [ParsedHole] {
        print("🤖 AI pattern parsing...")
        // AI pattern recognition for various scorecard layouts
        let patterns = await identifyGolfPatterns(text)
        return extractHolesFromPatterns(patterns)
    }
    
    private func parseWithSemanticAI(_ text: String) async -> [ParsedHole] {
        print("🤖 AI semantic parsing...")
        // Semantic understanding of golf terminology and relationships
        let semanticTokens = await performSemanticAnalysis(text)
        return buildHolesFromSemantics(semanticTokens)
    }
    
    private func parseWithContextAI(_ text: String) async -> [ParsedHole] {
        print("🤖 AI context parsing...")
        // Context-aware parsing using golf domain knowledge
        let contextualData = await extractContextualData(text)
        return assembleHolesFromContext(contextualData)
    }
    
    private func combineResultsWithAI(_ results: [[ParsedHole]]) -> [ParsedHole] {
        print("🤖 AI combining results from \(results.count) strategies...")
        
        // AI-powered result combination with confidence weighting
        var combinedHoles: [Int: ParsedHole] = [:]
        var holeConfidence: [Int: Float] = [:]
        
        for (strategyIndex, holes) in results.enumerated() {
            let strategyWeight = getStrategyWeight(strategyIndex)
            
            for hole in holes {
                let currentConfidence = holeConfidence[hole.holeNumber] ?? 0.0
                let newConfidence = currentConfidence + strategyWeight
                
                if newConfidence > currentConfidence {
                    combinedHoles[hole.holeNumber] = hole
                    holeConfidence[hole.holeNumber] = newConfidence
                }
            }
        }
        
        return Array(combinedHoles.values).sorted { $0.holeNumber < $1.holeNumber }
    }
    
    private func getStrategyWeight(_ strategyIndex: Int) -> Float {
        // AI assigns weights based on strategy effectiveness
        switch strategyIndex {
        case 0: return 0.4 // Table parsing - most reliable
        case 1: return 0.3 // Pattern parsing - good for structured data
        case 2: return 0.2 // Semantic parsing - context aware
        case 3: return 0.1 // Context parsing - supplementary
        default: return 0.1
        }
    }
    
    // MARK: - AI Analysis Methods
    
    private func assessCharacterQuality(_ text: String) async -> Float {
        // AI assesses OCR character recognition quality
        let alphanumericRatio = Float(text.filter { $0.isLetter || $0.isNumber }.count) / Float(max(1, text.count))
        let whitespaceRatio = Float(text.filter { $0.isWhitespace }.count) / Float(max(1, text.count))
        
        // Optimal ratios for scorecard text
        let alphanumericScore = min(1.0, alphanumericRatio / 0.8)
        let whitespaceScore = whitespaceRatio > 0.1 && whitespaceRatio < 0.4 ? 1.0 : 0.5
        
        return (alphanumericScore + Float(whitespaceScore)) / 2.0
    }
    
    private func calculateGolfRelevance(_ text: String) -> Float {
        let golfKeywords = ["hole", "par", "handicap", "yards", "yds", "tee", "black", "blue", "white", "red", "gold", "green", "front", "back", "out", "in", "total", "championship"]
        let lowercased = text.lowercased()
        
        let keywordCount = golfKeywords.reduce(0) { count, keyword in
            return count + (lowercased.contains(keyword) ? 1 : 0)
        }
        
        let numbers = extractNumbers(from: text)
        let golfNumbers = numbers.filter { ($0 >= 1 && $0 <= 18) || ($0 >= 3 && $0 <= 5) || ($0 >= 50 && $0 <= 800) }
        
        let keywordScore = Float(keywordCount) / Float(max(1, golfKeywords.count))
        let numberScore = Float(golfNumbers.count) / Float(max(1, numbers.count))
        
        return (keywordScore + numberScore) / 2.0
    }
    
    private func assessStructuralCoherence(_ text: String) -> Float {
        // AI assesses how well-structured the text appears
        let lines = text.components(separatedBy: .newlines).filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
        
        if lines.isEmpty { return 0.0 }
        
        // Check for consistent line structure
        let wordCounts = lines.map { $0.components(separatedBy: .whitespaces).filter { !$0.isEmpty }.count }
        let averageWords = Float(wordCounts.reduce(0, +)) / Float(lines.count)
        let variance = wordCounts.map { Float($0) - averageWords }.map { $0 * $0 }.reduce(0, +) / Float(lines.count)
        
        // Lower variance indicates more consistent structure
        let consistencyScore = max(0.0, 1.0 - variance / 100.0)
        
        return consistencyScore
    }
    
    private func analyzeNumberSequenceWithAI(_ numbers: [Int]) async -> Float {
        guard numbers.count >= 3 else { return 0.0 }
        
        // AI analyzes number patterns for hole sequences
        let holeNumbers = numbers.filter { $0 >= 1 && $0 <= 18 }
        let parNumbers = numbers.filter { $0 >= 3 && $0 <= 5 }
        let yardageNumbers = numbers.filter { $0 >= 50 && $0 <= 800 }
        
        var confidence: Float = 0.0
        
        // Check for sequential hole numbers
        if holeNumbers.count >= 3 {
            let sorted = holeNumbers.sorted()
            let isSequential = zip(sorted, sorted.dropFirst()).allSatisfy { $1 == $0 + 1 }
            if isSequential {
                confidence += 0.5
            } else if sorted.first == 1 && sorted.contains(2) && sorted.contains(3) {
                confidence += 0.3
            }
        }
        
        // Check for reasonable par distribution
        if parNumbers.count >= 3 {
            let parDistribution = [3, 4, 5].map { par in parNumbers.filter { $0 == par }.count }
            if parDistribution.allSatisfy({ $0 > 0 }) {
                confidence += 0.3
            }
        }
        
        // Check for reasonable yardage values
        if yardageNumbers.count >= 2 {
            confidence += 0.2
        }
        
        return min(1.0, confidence)
    }
    
    private func analyzeGolfPatterns(_ text: String) async -> Float {
        // AI recognizes golf-specific text patterns
        let golfPatterns = [
            #"\bhole\s+\d+"#,
            #"\bpar\s+[345]"#,
            #"\b\d{2,3}\s+yard"#,
            #"\bhandicap\s+\d+"#,
            #"\b(front|back)\s+nine\b"#,
            #"\b(white|black|blue|red|gold)\s+tee"#
        ]
        
        var patternCount = 0
        let lowercased = text.lowercased()
        
        for pattern in golfPatterns {
            if lowercased.range(of: pattern, options: .regularExpression) != nil {
                patternCount += 1
            }
        }
        
        return Float(patternCount) / Float(golfPatterns.count)
    }
    
    private func analyzeTextLayout(_ text: String) -> Float {
        // Analyze spatial layout characteristics
        let lines = text.components(separatedBy: .newlines)
        
        // Check for table-like structure
        let nonEmptyLines = lines.filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
        if nonEmptyLines.count < 2 { return 0.0 }
        
        // Analyze column alignment
        let columnCounts = nonEmptyLines.map { $0.components(separatedBy: .whitespaces).filter { !$0.isEmpty }.count }
        let maxColumns = columnCounts.max() ?? 0
        let minColumns = columnCounts.min() ?? 0
        
        // More consistent column counts suggest better structure
        let columnConsistency = maxColumns > 0 ? Float(minColumns) / Float(maxColumns) : 0.0
        
        return columnConsistency
    }
    
    // MARK: - Helper Methods
    
    private func extractNumbers(from text: String) -> [Int] {
        let regex = try! NSRegularExpression(pattern: "\\d+", options: [])
        let matches = regex.matches(in: text, options: [], range: NSRange(location: 0, length: text.utf16.count))
        
        return matches.compactMap { match in
            if let range = Range(match.range, in: text) {
                return Int(text[range])
            }
            return nil
        }
    }
    
    private func extractNumbersAfterKeyword(_ text: String, keyword: String) -> [Int] {
        let lowercased = text.lowercased()
        guard let keywordRange = lowercased.range(of: keyword.lowercased()) else { return [] }
        
        let afterKeyword = String(text[keywordRange.upperBound...])
        return extractNumbers(from: afterKeyword)
    }
    
    // MARK: - Placeholder AI Methods (to be implemented based on specific needs)
    
    private func analyzeTableStructure(_ lines: [String]) async -> TableStructure {
        // AI table structure analysis
        return TableStructure(headers: [], dataRows: [])
    }
    
    private func parseTableStructure(_ structure: TableStructure) -> [ParsedHole] {
        // Parse holes from identified table structure
        return []
    }
    
    private func identifyGolfPatterns(_ text: String) async -> [GolfPattern] {
        // AI pattern identification
        return []
    }
    
    private func extractHolesFromPatterns(_ patterns: [GolfPattern]) -> [ParsedHole] {
        // Extract holes from identified patterns
        return []
    }
    
    private func performSemanticAnalysis(_ text: String) async -> [SemanticToken] {
        // Semantic analysis of golf text
        return []
    }
    
    private func buildHolesFromSemantics(_ tokens: [SemanticToken]) -> [ParsedHole] {
        // Build holes from semantic understanding
        return []
    }
    
    private func extractContextualData(_ text: String) async -> ContextualData {
        // Extract contextual golf data
        return ContextualData()
    }
    
    private func assembleHolesFromContext(_ data: ContextualData) -> [ParsedHole] {
        // Assemble holes from contextual data
        return []
    }
}

// MARK: - AI Data Structures

struct TableStructure {
    let headers: [String]
    let dataRows: [[String]]
}

struct GolfPattern {
    let type: PatternType
    let data: [String]
    let confidence: Float
}

enum PatternType {
    case holeSequence
    case parRow
    case yardageRow
    case handicapRow
}

struct SemanticToken {
    let text: String
    let type: TokenType
    let confidence: Float
}

enum TokenType {
    case holeNumber
    case parValue
    case yardage
    case handicap
    case label
}

struct ContextualData {
    let holeData: [HoleContext]
    let metadata: [String: Any]
    
    init(holeData: [HoleContext] = [], metadata: [String: Any] = [:]) {
        self.holeData = holeData
        self.metadata = metadata
    }
}

struct HoleContext {
    let number: Int?
    let par: Int?
    let yardage: Int?
    let handicap: Int?
    let confidence: Float
}
