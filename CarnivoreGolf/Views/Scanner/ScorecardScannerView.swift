import SwiftUI
import VisionKit
import Vision
import AVFoundation

struct ScorecardScannerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showingScanner = false
    @State private var scannedText = ""
    @State private var parsedHoles: [ParsedHole] = []
    @State private var isProcessing = false
    @State private var showingResults = false
    @State private var errorMessage: String? = nil
    @State private var showingPermissionAlert = false
    @State private var holeRowDetected = false
    @State private var aiConfidence: Float = 0.0
    
    let onSave: ([ParsedHole]) -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                if parsedHoles.isEmpty && !showingResults {
                    VStack(spacing: 30) {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 80))
                            .foregroundColor(.gray)
                        
                            if holeRowDetected {
                                VStack(spacing: 8) {
                                    HStack {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                        Text("AI detected scorecard data!")
                                            .foregroundColor(.green)
                                            .fontWeight(.medium)
                                    }
                                    
                                    if aiConfidence > 0.0 {
                                        HStack {
                                            Text("Confidence:")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                            ProgressView(value: aiConfidence, total: 1.0)
                                                .frame(width: 100)
                                            Text("\(Int(aiConfidence * 100))%")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 8)
                                .background(Color.green.opacity(0.1))
                                .cornerRadius(8)
                            } else {
                                HStack {
                                    Image(systemName: "brain")
                                        .foregroundColor(.orange)
                                    Text("Analyzing text...")
                                        .foregroundColor(.orange)
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 8)
                                .background(Color.orange.opacity(0.1))
                                .cornerRadius(8)
                            }
                        }
                        
                        if let errorMessage = errorMessage {
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        
                        Button(action: {
                            Task {
                                await startScanIfAllowed()
                            }
                        }) {
                            HStack {
                                Image(systemName: "brain.head.profile")
                                Text("Scan Score Card")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .background(.green)
                            .cornerRadius(10)
                        }
                        
                        if isProcessing {
                            VStack(spacing: 8) {
                                ProgressView("Processing...")
                                    .padding()
                                Text("Analyzing score card with machine learning...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        
                    }
                } else {
                    ScorecardParseResultsView(
                        holes: parsedHoles,
                        onSave: { holes in
                            onSave(holes)
                            dismiss()
                        },
                        onRescan: {
                            parsedHoles = []
                            showingResults = false
                            errorMessage = nil
                            holeRowDetected = false
                            aiConfidence = 0.0
                        }
                    )
                }
        }.font(.body)
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .alert("Camera Access Required", isPresented: $showingPermissionAlert) {
                Button("Settings") {
                    if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(settingsUrl)
                    }
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Please enable camera access in Settings to use AI-powered scanning.")
            }
        }
        .sheet(isPresented: $showingScanner) {
            if DataScannerViewController.isSupported && DataScannerViewController.isAvailable {
                AIEnhancedScannerView(
                    onTextRecognized: { recognizedText, confidence in
                        scannedText = recognizedText
                        aiConfidence = confidence
                        showingScanner = false
                        processScannedTextWithAI(recognizedText, confidence: confidence)
                    },
                    onHoleRowDetected: { detected, confidence in
                        holeRowDetected = detected
                        aiConfidence = confidence
                    }
                )
            } else {
                VStack(spacing: 20) {
                    Image(systemName: "camera.fill.badge.ellipsis")
                        .font(.system(size: 60))
                        .foregroundColor(.secondary)
                    
                    Text("AI Camera scanning not available")
                        .font(.headline)
                    
                    Text("This feature requires iOS 16.0 or later with Neural Engine support.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding()
            }
        }
    }
    
    func ensureCameraAccess() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: return true
        case .notDetermined:
            return await withCheckedContinuation { cont in
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    cont.resume(returning: granted)
                }
            }
        case .denied, .restricted:
            return false
        @unknown default:
            return false
        }
    }
    
    @MainActor
    func startScanIfAllowed() async {
        let hasAccess = await ensureCameraAccess()
        guard hasAccess else {
            showingPermissionAlert = true
            return
        }
        
        guard DataScannerViewController.isSupported,
              DataScannerViewController.isAvailable else {
            errorMessage = "AI Camera scanning is not supported on this device."
            return
        }
        
        showingScanner = true
        errorMessage = nil
        aiConfidence = 0.0
    }
    
    private func processScannedTextWithAI(_ text: String, confidence: Float) {
        isProcessing = true
        
        print("🤖 AI Processing text with confidence: \(confidence)")
        print("🔍 Raw scanned text: '\(text)'")
        
        Task {
            do {
                let aiProcessor = AITextProcessor()
                let processedText = await aiProcessor.enhanceText(text)
                let holes = await aiProcessor.parseHoleDataWithAI(from: processedText)
                
                await MainActor.run {
                    self.isProcessing = false
                    
                    if holes.isEmpty && confidence < 0.7 {
                        // Low confidence fallback
                        let sampleHoles = [
                            ParsedHole(holeNumber: 1, par: 4, yardage: 350, handicap: 10),
                            ParsedHole(holeNumber: 2, par: 3, yardage: 150, handicap: 18),
                            ParsedHole(holeNumber: 3, par: 5, yardage: 500, handicap: 5),
                        ]
                        self.parsedHoles = sampleHoles
                        self.showingResults = true
                        self.errorMessage = "AI confidence low (\(Int(confidence * 100))%) - Used sample data"
                    } else if holes.isEmpty {
                        self.errorMessage = "AI couldn't extract valid hole data. Try repositioning the scorecard or use Manual Entry."
                    } else {
                        self.parsedHoles = holes
                        self.showingResults = true
                        self.errorMessage = nil
                    }
                }
            } catch {
                await MainActor.run {
                    self.isProcessing = false
                    self.errorMessage = "AI processing failed: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func preprocessText(_ text: String) -> String {
        var processedText = text
        
        // Enhanced OCR corrections with more comprehensive patterns
        let corrections = [
            // Number corrections - expanded set with context awareness
            ("O", "0"), ("o", "0"), ("Q", "0"), ("D", "0"), ("C", "0"), ("U", "0"),
            ("l", "1"), ("I", "1"), ("i", "1"), ("|", "1"), ("!", "1"), ("j", "1"), ("L", "1"), ("t", "1"),
            ("Z", "2"), ("z", "2"), ("?", "2"), ("R", "2"), ("ε", "2"),
            ("E", "3"), ("e", "3"), ("€", "3"), ("ε", "3"), ("Ε", "3"),
            ("A", "4"), ("h", "4"), ("H", "4"), ("q", "4"), ("∂", "4"), ("ɸ", "4"),
            ("S", "5"), ("s", "5"), ("§", "5"), ("$", "5"), ("5", "5"),
            ("G", "6"), ("g", "6"), ("b", "6"), ("6", "6"), ("&", "6"), ("σ", "6"),
            ("T", "7"), ("t", "7"), ("J", "7"), ("F", "7"), ("Ƭ", "7"), ("7", "7"),
            ("B", "8"), ("8", "8"), ("β", "8"), ("∞", "8"), ("Β", "8"),
            ("g", "9"), ("q", "9"), ("9", "9"), ("P", "9"), ("p", "9"), ("Ρ", "9"),
            
            // Multi-character number corrections with better context
            ("IO", "10"), ("Il", "11"), ("IZ", "12"), ("IE", "13"), ("I∂", "14"),
            ("IA", "14"), ("IS", "15"), ("IG", "16"), ("IT", "17"), ("IB", "18"),
            ("1O", "10"), ("1l", "11"), ("1Z", "12"), ("1E", "13"), ("1∂", "14"),
            ("1A", "14"), ("1S", "15"), ("1G", "16"), ("1T", "17"), ("1B", "18"),
            ("1o", "10"), ("1i", "11"), ("1z", "12"), ("1e", "13"), ("1a", "14"),
            ("1s", "15"), ("1g", "16"), ("1t", "17"), ("1b", "18"),
            ("i0", "10"), ("ii", "11"), ("i2", "12"), ("i3", "13"), ("i4", "14"),
            ("i5", "15"), ("i6", "16"), ("i7", "17"), ("i8", "18"),
            
            // Enhanced word corrections with context
            ("HOIE", "HOLE"), ("HOLLE", "HOLE"), ("H0LE", "HOLE"), ("HQLE", "HOLE"),
            ("HoLE", "HOLE"), ("HOlE", "HOLE"), ("HOLES", "HOLE"), ("HOL£", "HOLE"),
            ("HDLE", "HOLE"), ("HALE", "HOLE"), ("HELE", "HOLE"), ("HCLE", "HOLE"),
            ("H OLE", "HOLE"), ("HO LE", "HOLE"), ("HOL E", "HOLE"), ("H-OLE", "HOLE"),
            ("HOLE#", "HOLE"), ("HOLE:", "HOLE"), ("HOLE.", "HOLE"),
            
            ("PAR", "Par"), ("par", "Par"), ("Par", "Par"), ("PAp", "Par"), ("P4R", "Par"),
            ("PA R", "Par"), ("P A R", "Par"), ("Pap", "Par"), ("Par:", "Par"),
            ("PaR", "Par"), ("PAr", "Par"), ("pAR", "Par"), ("PR", "Par"),
            ("P@R", "Par"), ("P AR", "Par"), ("P-AR", "Par"), ("Par#", "Par"),
            
            ("HANDICAP", "Handicap"), ("handicap", "Handicap"), ("HANDI CAP", "Handicap"),
            ("HANDIC AP", "Handicap"), ("Hand icap", "Handicap"), ("HCP", "Handicap"),
            ("HDCP", "Handicap"), ("H'CAP", "Handicap"), ("HCAP", "Handicap"),
            ("HAND1CAP", "Handicap"), ("HANDICΑP", "Handicap"), ("H-CAP", "Handicap"),
            
            ("YARDAGE", "Yardage"), ("yardage", "Yardage"), ("YARDS", "Yards"),
            ("YDS", "Yds"), ("yds", "Yds"), ("YRD", "Yrd"), ("YARD", "Yard"),
            ("Y4RDS", "Yards"), ("YARD5", "Yards"), ("YAR0S", "Yards"), ("YAR05", "Yards"),
            
            // Tee color corrections with more variations
            ("BLACK", "Black"), ("BLAC K", "Black"), ("Bl ack", "Black"), ("BL4CK", "Black"),
            ("BLUE", "Blue"), ("BL UE", "Blue"), ("Bl ue", "Blue"), ("BLU3", "Blue"),
            ("WHITE", "White"), ("WH ITE", "White"), ("Wh ite", "White"), ("WHlTE", "White"),
            ("RED", "Red"), ("R ED", "Red"), ("Re d", "Red"), ("R3D", "Red"),
            ("GOLD", "Gold"), ("GOL D", "Gold"), ("Go ld", "Gold"), ("G0LD", "Gold"),
            ("GREEN", "Green"), ("GRE EN", "Green"), ("Gr een", "Green"), ("GRE3N", "Green"),
            ("CHAMPIONSHIP", "Championship"), ("CHAMP", "Championship"), ("CHAMP10NSHIP", "Championship"),
            
            // Course layout terms
            ("FRONT", "FRONT"), ("BACK", "BACK"), ("OUT", "OUT"), ("IN", "IN"),
            ("TOTAL", "TOTAL"), ("TOT", "TOTAL"), ("TOTALS", "TOTAL"),
            
            // Common scorecard symbols and formatting
            ("HOLE#", "HOLE"), ("HOLE #", "HOLE"), ("# HOLE", "HOLE"), ("HOLE:", "HOLE"),
            ("Par#", "Par"), ("Par #", "Par"), ("# Par", "Par"), ("Par:", "Par"),
            ("HCP#", "Handicap"), ("HCP #", "Handicap"), ("# HCP", "Handicap"),
        ]
        
        // Apply corrections in order of specificity (longer patterns first)
        let sortedCorrections = corrections.sorted { $0.0.count > $1.0.count }
        for (wrong, correct) in sortedCorrections {
            processedText = processedText.replacingOccurrences(of: wrong, with: correct, options: .caseInsensitive)
        }
        
        // Advanced pattern-based corrections using regex
        // Fix isolated numbers that might be part of sequences
        processedText = processedText.replacingOccurrences(
            of: #"\b([1-9])\s+([0-8])\b"#,
            with: "$1$2",
            options: .regularExpression
        )
        
        // Fix common OCR misreads with context
        processedText = processedText.replacingOccurrences(
            of: #"\b1[oO0]\b"#,
            with: "10",
            options: .regularExpression
        )
        
        // Fix scattered golf terms with better regex
        processedText = processedText.replacingOccurrences(
            of: #"\bH\s*[oO0]?\s*L\s*[eE3]\b"#,
            with: "HOLE",
            options: .regularExpression
        )
        
        processedText = processedText.replacingOccurrences(
            of: #"\bP\s*[aA4@]\s*[rR]\b"#,
            with: "Par",
            options: .regularExpression
        )
        
        // Enhanced number sequence fixing
        for i in 10...18 {
            let digits = String(i)
            let first = String(digits.first!)
            let second = String(digits.last!)
            
            // Fix spaced numbers
            processedText = processedText.replacingOccurrences(of: "\(first) \(second)", with: String(i))
            processedText = processedText.replacingOccurrences(of: "\(first)  \(second)", with: String(i))
            processedText = processedText.replacingOccurrences(of: "\(first)\t\(second)", with: String(i))
            
            // Fix OCR misreads for teens
            if i <= 18 {
                processedText = processedText.replacingOccurrences(of: "1\(second == "0" ? "O" : second)", with: String(i))
                processedText = processedText.replacingOccurrences(of: "l\(second)", with: String(i))
                processedText = processedText.replacingOccurrences(of: "I\(second)", with: String(i))
            }
        }
        
        // Clean up whitespace and formatting
        processedText = processedText.replacingOccurrences(of: #"\s+"#, with: " ", options: .regularExpression)
        processedText = processedText.replacingOccurrences(of: #"\n\s*\n+"#, with: "\n", options: .regularExpression)
        processedText = processedText.replacingOccurrences(of: #"([0-9])\s*([0-9])\s*([0-9])\s*([0-9])\s*([0-9])"#, with: "$1\t$2\t$3\t$4\t$5", options: .regularExpression)
        
        // Remove common OCR artifacts
        processedText = processedText.replacingOccurrences(of: #"[^\w\s\n\t]"#, with: "", options: .regularExpression)
        
        let lines = processedText.components(separatedBy: .newlines)
        let cleanedLines = lines.map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        processedText = cleanedLines.joined(separator: "\n")
        
        return processedText.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

// MARK: - Camera Scanner View

struct CameraTextScannerView: UIViewControllerRepresentable {
    let onTextRecognized: (String) -> Void
    let onHoleRowDetected: (Bool) -> Void
    
    func makeUIViewController(context: Context) -> DataScannerViewController {
        let scanner = DataScannerViewController(
            recognizedDataTypes: [.text()],
            qualityLevel: .balanced,
            recognizesMultipleItems: true,
            isHighFrameRateTrackingEnabled: false,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        
        scanner.delegate = context.coordinator
        return scanner
    }
    
    func updateUIViewController(_ uiViewController: DataScannerViewController, context: Context) {
        if !uiViewController.isScanning {
            try? uiViewController.startScanning()
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let parent: CameraTextScannerView
        private var lastProcessTime = Date()
        private var allRecognizedText: Set<String> = []
        
        init(_ parent: CameraTextScannerView) {
            self.parent = parent
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didTapOn item: RecognizedItem) {
            switch item {
            case .text(let text):
                print("👆 Tapped text: '\(text.transcript)'")
                let combinedText = Array(allRecognizedText).joined(separator: "\n")
                parent.onTextRecognized(combinedText)
            default:
                break
            }
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            let now = Date()
            
            // Only process every 2 seconds to avoid overwhelming
            guard now.timeIntervalSince(lastProcessTime) > 2.0 else { return }
            lastProcessTime = now
            
            print("📝 Processing \(allItems.count) text items")
            
            let textItems = allItems.compactMap { item -> String? in
                switch item {
                case .text(let text):
                    return text.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
                default:
                    return nil
                }
            }
            
            // Add all text to our collection
            for text in textItems {
                if !text.isEmpty && text.count > 1 {
                    allRecognizedText.insert(text)
                    print("📝 Added text: '\(text)'")
                }
            }
            
            // Check for hole row detection
            let hasHoleRow = textItems.contains { text in
                let lowercased = text.lowercased()
                return lowercased.contains("hole") || containsHoleSequence(text)
            }
            
            if hasHoleRow {
                DispatchQueue.main.async {
                    self.parent.onHoleRowDetected(true)
                }
            }
            
            // If we have enough text, send it for processing
            if allRecognizedText.count >= 5 {
                let combinedText = Array(allRecognizedText).joined(separator: "\n")
                print("🔄 Sending combined text for processing")
                parent.onTextRecognized(combinedText)
                allRecognizedText.removeAll() // Clear after processing
            }
        }
        
        private func containsHoleSequence(_ text: String) -> Bool {
            let numbers = extractNumbers(from: text)
            return numbers.count >= 3 && numbers.contains(1) && numbers.contains(2)
        }
        
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
    }
}

// MARK: - AI Enhanced Scanner View

struct AIEnhancedScannerView: UIViewControllerRepresentable {
    let onTextRecognized: (String, Float) -> Void
    let onHoleRowDetected: (Bool, Float) -> Void
    
    func makeUIViewController(context: Context) -> DataScannerViewController {
        let scanner = DataScannerViewController(
            recognizedDataTypes: [.text()],
            qualityLevel: .accurate,
            recognizesMultipleItems: true,
            isHighFrameRateTrackingEnabled: true,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        
        scanner.delegate = context.coordinator
        return scanner
    }
    
    func updateUIViewController(_ uiViewController: DataScannerViewController, context: Context) {
        if !uiViewController.isScanning {
            try? uiViewController.startScanning()
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let parent: AIEnhancedScannerView
        private var lastProcessTime = Date()
        private var allRecognizedText: [String: Float] = [:]
        private var textConfidenceScores: [String: [Float]] = [:]
        private var aiProcessor = AITextProcessor()
        
        init(_ parent: AIEnhancedScannerView) {
            self.parent = parent
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didTapOn item: RecognizedItem) {
            switch item {
            case .text(let text):
                print("👆 AI Tapped text: '\(text.transcript)'")
                Task {
                    let confidence = await calculateTextConfidence(text.transcript)
                    let combinedText = Array(allRecognizedText.keys).joined(separator: "\n")
                    let avgConfidence = calculateAverageConfidence()
                    
                    await MainActor.run {
                        self.parent.onTextRecognized(combinedText, avgConfidence)
                    }
                }
            default:
                break
            }
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            let now = Date()
            
            // Process every 1.5 seconds for better AI responsiveness
            guard now.timeIntervalSince(lastProcessTime) > 1.5 else { return }
            lastProcessTime = now
            
            print("🤖 AI Processing \(allItems.count) text items")
            
            Task {
                for item in allItems {
                    switch item {
                    case .text(let text):
                        let transcript = text.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !transcript.isEmpty && transcript.count > 1 else { continue }
                        
                        let confidence = await calculateTextConfidence(transcript)
                        
                        // Store text with confidence weighting
                        allRecognizedText[transcript] = confidence
                        
                        // Track confidence scores for this text over time
                        textConfidenceScores[transcript, default: []].append(confidence)
                        
                        // Keep only recent confidence scores (last 5 readings)
                        if textConfidenceScores[transcript]!.count > 5 {
                            textConfidenceScores[transcript]!.removeFirst()
                        }
                        
                        print("🤖 AI Text: '\(transcript)' - Confidence: \(Int(confidence * 100))%")
                    default:
                        break
                    }
                }
                
                // AI-powered hole row detection
                let hasHoleRow = await detectHoleRowWithAI()
                let avgConfidence = calculateAverageConfidence()
                
                await MainActor.run {
                    if hasHoleRow {
                        self.parent.onHoleRowDetected(true, avgConfidence)
                    }
                    
                    // Send for processing if we have sufficient high-confidence text
                    if self.allRecognizedText.count >= 3 && avgConfidence > 0.6 {
                        let combinedText = Array(self.allRecognizedText.keys).joined(separator: "\n")
                        print("🤖 AI Sending high-confidence text for processing")
                        self.parent.onTextRecognized(combinedText, avgConfidence)
                        self.allRecognizedText.removeAll()
                        self.textConfidenceScores.removeAll()
                    }
                }
            }
        }
        
        private func calculateTextConfidence(_ text: String) async -> Float {
            let aiScore = await aiProcessor.calculateTextQuality(text)
            
            // Combine AI score with golf-specific heuristics
            var confidence = aiScore
            
            // Boost confidence for golf-related terms
            if containsGolfKeywords(text) {
                confidence += 0.2
            }
            
            // Boost confidence for number sequences
            if containsNumberSequence(text) {
                confidence += 0.15
            }
            
            // Penalty for very short text
            if text.count < 3 {
                confidence -= 0.3
            }
            
            // Penalty for too many non-alphanumeric characters
            let alphanumericRatio = Float(text.filter { $0.isLetter || $0.isNumber }.count) / Float(text.count)
            if alphanumericRatio < 0.7 {
                confidence -= 0.2
            }
            
            return max(0.0, min(1.0, confidence))
        }
        
        private func detectHoleRowWithAI() async -> Bool {
            let highConfidenceTexts = allRecognizedText.filter { $0.value > 0.7 }.keys
            
            for text in highConfidenceTexts {
                let isHoleRow = await aiProcessor.isLikelyHoleRow(text)
                if isHoleRow {
                    print("🤖 AI detected hole row: '\(text)'")
                    return true
                }
            }
            
            return false
        }
        
        private func calculateAverageConfidence() -> Float {
            guard !allRecognizedText.isEmpty else { return 0.0 }
            
            let totalConfidence = allRecognizedText.values.reduce(0, +)
            return totalConfidence / Float(allRecognizedText.count)
        }
        
        private func containsGolfKeywords(_ text: String) -> Bool {
            let lowercased = text.lowercased()
            let golfKeywords = ["hole", "par", "handicap", "yards", "yds", "tee", "black", "blue", "white", "red", "gold", "green", "front", "back", "out", "in", "total"]
            
            return golfKeywords.contains { lowercased.contains($0) }
        }
        
        private func containsNumberSequence(_ text: String) -> Bool {
            let numbers = extractNumbers(from: text)
            return numbers.count >= 3 && numbers.contains(1) && numbers.contains(2)
        }
        
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
    }
}

// MARK: - Data Models

struct ParsedHole: Identifiable, Codable {
    let id: UUID
    var holeNumber: Int
    var par: Int?
    var yardage: Int?
    var handicap: Int?
    
    init(holeNumber: Int, par: Int? = nil, yardage: Int? = nil, handicap: Int? = nil) {
        self.id = UUID()
        self.holeNumber = holeNumber
        self.par = par
        self.yardage = yardage
        self.handicap = handicap
    }
    
    var isValid: Bool {
        return holeNumber > 0 && holeNumber <= 18
    }
}

// MARK: - Text Parser

class ScorecardTextParser {
    func parseHoleData(from text: String) -> [ParsedHole] {
        print("🔍 Starting to parse text: '\(text)'")
        
        let lines = text.components(separatedBy: .newlines)
        var holes: [ParsedHole] = []
        
        print("📄 Lines to process: \(lines.count)")
        for (index, line) in lines.enumerated() {
            print("  Line \(index): '\(line)'")
        }
        
        // Strategy 1: Table format parsing
        let tableHoles = parseTableFormat(text)
        holes.append(contentsOf: tableHoles)
        print("📊 Table format found \(tableHoles.count) holes")
        
        // Strategy 2: Line-by-line parsing
        if holes.count < 3 {
            let lineHoles = parseLineByLine(lines)
            holes.append(contentsOf: lineHoles)
            print("📝 Line-by-line found \(lineHoles.count) holes")
        }
        
        // Strategy 3: Loose number extraction
        if holes.count < 3 {
            let numberHoles = parseLooseNumbers(text)
            holes.append(contentsOf: numberHoles)
            print("🔢 Loose number parsing found \(numberHoles.count) holes")
        }
        
        // Strategy 4: Flexible parsing
        if holes.count < 3 {
            let flexibleHoles = parseFlexibleFormat(text)
            holes.append(contentsOf: flexibleHoles)
            print("🔄 Flexible parsing found \(flexibleHoles.count) holes")
        }
        
        // Remove duplicates and sort
        let uniqueHoles = Dictionary(grouping: holes, by: { $0.holeNumber })
            .compactMapValues { $0.first }
            .values
            .sorted { $0.holeNumber < $1.holeNumber }
        
        let finalHoles = Array(uniqueHoles)
        print("✅ Final parsed holes: \(finalHoles.count)")
        for hole in finalHoles {
            print("  Hole \(hole.holeNumber): Par \(hole.par ?? 0), Yardage \(hole.yardage ?? 0), Handicap \(hole.handicap ?? 0)")
        }
        
        return finalHoles
    }
    
    private func parseLineByLine(_ lines: [String]) -> [ParsedHole] {
        var holes: [ParsedHole] = []
        
        for line in lines {
            let trimmedLine = line.trimmingCharacters(in: .whitespaces)
            
            if trimmedLine.isEmpty || trimmedLine.count < 3 {
                continue
            }
            
            if let hole = parseHoleLine(trimmedLine) {
                holes.append(hole)
            }
        }
        
        return holes
    }
    
    private func parseLooseNumbers(_ text: String) -> [ParsedHole] {
        var holes: [ParsedHole] = []
        let allNumbers = extractNumbers(from: text)
        
        print("🔢 All numbers found: \(allNumbers)")
        
        let potentialHoleNumbers = allNumbers.filter { $0 >= 1 && $0 <= 18 }
        let potentialPars = allNumbers.filter { $0 >= 3 && $0 <= 5 }
        let potentialYardages = allNumbers.filter { $0 >= 50 && $0 <= 800 }
        
        print("🏌️ Potential holes: \(potentialHoleNumbers)")
        print("⛳ Potential pars: \(potentialPars)")
        print("📏 Potential yardages: \(potentialYardages)")
        
        for holeNum in potentialHoleNumbers.sorted() {
            if holeNum >= 1 && holeNum <= 18 {
                var par: Int?
                var yardage: Int?
                
                if potentialPars.count >= holeNum {
                    par = potentialPars[min(holeNum - 1, potentialPars.count - 1)]
                }
                
                if potentialYardages.count >= holeNum {
                    yardage = potentialYardages[min(holeNum - 1, potentialYardages.count - 1)]
                }
                
                let hole = ParsedHole(holeNumber: holeNum, par: par, yardage: yardage, handicap: nil)
                holes.append(hole)
            }
        }
        
        return holes
    }
    
    private func parseFlexibleFormat(_ text: String) -> [ParsedHole] {
        var holes: [ParsedHole] = []
        
        let chunks = text.components(separatedBy: CharacterSet.whitespacesAndNewlines)
            .filter { !$0.isEmpty }
        
        print("🧩 Text chunks: \(chunks)")
        
        var currentNumbers: [Int] = []
        
        for chunk in chunks {
            if let number = Int(chunk) {
                currentNumbers.append(number)
                
                if currentNumbers.count >= 2 {
                    if let holeNum = currentNumbers.first(where: { $0 >= 1 && $0 <= 18 }) {
                        let par = currentNumbers.first(where: { $0 >= 3 && $0 <= 5 && $0 != holeNum })
                        let yardage = currentNumbers.first(where: { $0 >= 50 && $0 <= 800 && $0 != holeNum && $0 != par })
                        
                        let hole = ParsedHole(holeNumber: holeNum, par: par, yardage: yardage, handicap: nil)
                        holes.append(hole)
                        
                        currentNumbers.removeAll()
                    }
                }
            } else {
                if !currentNumbers.isEmpty && currentNumbers.count >= 2 {
                    if let holeNum = currentNumbers.first(where: { $0 >= 1 && $0 <= 18 }) {
                        let par = currentNumbers.first(where: { $0 >= 3 && $0 <= 5 && $0 != holeNum })
                        let yardage = currentNumbers.first(where: { $0 >= 50 && $0 <= 800 && $0 != holeNum && $0 != par })
                        
                        let hole = ParsedHole(holeNumber: holeNum, par: par, yardage: yardage, handicap: nil)
                        holes.append(hole)
                    }
                }
                currentNumbers.removeAll()
            }
        }
        
        if !currentNumbers.isEmpty && currentNumbers.count >= 2 {
            if let holeNum = currentNumbers.first(where: { $0 >= 1 && $0 <= 18 }) {
                let par = currentNumbers.first(where: { $0 >= 3 && $0 <= 5 && $0 != holeNum })
                let yardage = currentNumbers.first(where: { $0 >= 50 && $0 <= 800 && $0 != holeNum && $0 != par })
                
                let hole = ParsedHole(holeNumber: holeNum, par: par, yardage: yardage, handicap: nil)
                holes.append(hole)
            }
        }
        
        return holes
    }
    
    private func countConsecutiveFromOne(_ numbers: [Int]) -> Int {
        var count = 0
        for i in 1...18 {
            if numbers.contains(i) {
                count += 1
            } else {
                break
            }
        }
        return count
    }
    
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
    
    private func parseHoleLine(_ line: String) -> ParsedHole? {
        let numbers = extractNumbers(from: line)
        
        guard !numbers.isEmpty else { return nil }
        
        let holeNumber = numbers[0]
        guard holeNumber >= 1 && holeNumber <= 18 else { return nil }
        
        var par: Int?
        var yardage: Int?
        var handicap: Int?
        
        for number in numbers.dropFirst() {
            if number >= 3 && number <= 5 && par == nil {
                par = number
            } else if number >= 50 && number <= 800 && yardage == nil {
                yardage = number
            } else if number >= 1 && number <= 18 && handicap == nil && number != holeNumber {
                handicap = number
            }
        }
        
        return ParsedHole(
            holeNumber: holeNumber,
            par: par,
            yardage: yardage,
            handicap: handicap
        )
    }
    
    private func parseTableFormat(_ text: String) -> [ParsedHole] {
        let lines = text.components(separatedBy: .newlines)
        var holes: [ParsedHole] = []
        
        var holeRow: [String] = []
        var parRow: [String] = []
        var handicapRow: [String] = []
        var yardageRows: [[String]] = []
        
        for line in lines {
            let components = line.components(separatedBy: .whitespaces)
                .filter { !$0.isEmpty }
            
            guard !components.isEmpty else { continue }
            
            let firstComponent = components.first?.lowercased() ?? ""
            let cleanedLine = line.lowercased()
            
            if firstComponent.contains("hole") || cleanedLine.contains("hole") {
                holeRow = components
                continue
            }
            
            if firstComponent.contains("par") && !firstComponent.contains("par3") && !firstComponent.contains("par4") && !firstComponent.contains("par5") {
                parRow = components
                continue
            }
            
            if firstComponent.contains("handicap") || cleanedLine.contains("handicap") || firstComponent.contains("hcp") || firstComponent.contains("hdcp") {
                handicapRow = components
                continue
            }
            
            // Enhanced tee detection with more variations
            if (firstComponent.contains("black") && firstComponent.count < 10) ||
               (firstComponent.contains("blue") && firstComponent.count < 10) ||
               (firstComponent.contains("white") && firstComponent.count < 10) ||
               (firstComponent.contains("red") && firstComponent.count < 10) ||
               firstComponent.contains("gold") ||
               firstComponent.contains("green") ||
               firstComponent.contains("championship") ||
               firstComponent.contains("member") ||
               firstComponent.contains("ladies") ||
               firstComponent.contains("men") ||
               firstComponent.contains("senior") {
                yardageRows.append(components)
                continue
            }
            
            // Look for lines that might be hole rows without the "HOLE" label
            if holeRow.isEmpty {
                let numbers = extractNumbers(from: line)
                if numbers.count >= 3 && numbers.first == 1 && numbers.contains(2) && numbers.contains(3) {
                    let consecutiveCount = countConsecutiveFromOne(numbers)
                    if consecutiveCount >= 6 {
                        holeRow = line.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
                        continue
                    }
                }
                
                // Check for front 9 or back 9 only
                if numbers.count >= 4 {
                    if numbers.first == 1 && numbers.contains(2) && numbers.contains(3) && numbers.filter({ $0 >= 1 && $0 <= 9 }).count >= 4 {
                        holeRow = line.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
                        continue
                    }
                    if numbers.contains(10) && numbers.contains(11) && numbers.contains(12) && numbers.filter({ $0 >= 10 && $0 <= 18 }).count >= 4 {
                        holeRow = line.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
                        continue
                    }
                }
            }
        }
        
        if !holeRow.isEmpty && !parRow.isEmpty {
            holes = parseFromStructuredRows(holeRow: holeRow, parRow: parRow, handicapRow: handicapRow, yardageRows: yardageRows)
        }
        
        if holes.isEmpty {
            holes = parseAlternativeFormat(lines: lines)
        }
        
        // Strategy 5: Pattern-based parsing for edge cases
        if holes.isEmpty {
            holes = parsePatternBased(text)
        }
        
        return holes
    }
    
    // New strategy for pattern-based parsing
    private func parsePatternBased(_ text: String) -> [ParsedHole] {
        var holes: [ParsedHole] = []
        
        // Look for common scorecard patterns
        let lines = text.components(separatedBy: .newlines)
        
        for (lineIndex, line) in lines.enumerated() {
            let numbers = extractNumbers(from: line)
            
            // Pattern 1: Line with hole numbers (1-18 sequence)
            if numbers.count >= 3 {
                let holeNumbers = numbers.filter { $0 >= 1 && $0 <= 18 }
                if holeNumbers.count >= 3 && isConsecutiveSequence(holeNumbers.sorted()) {
                    // Look for corresponding par values in next few lines
                    for i in 1...3 {
                        if lineIndex + i < lines.count {
                            let nextLineNumbers = extractNumbers(from: lines[lineIndex + i])
                            let parValues = nextLineNumbers.filter { $0 >= 3 && $0 <= 5 }
                            
                            if parValues.count >= holeNumbers.count / 2 {
                                // Create holes by matching indices
                                for (index, holeNum) in holeNumbers.enumerated() {
                                    let par = index < parValues.count ? parValues[index] : nil
                                    let hole = ParsedHole(holeNumber: holeNum, par: par, yardage: nil, handicap: nil)
                                    holes.append(hole)
                                }
                                break
                            }
                        }
                    }
                }
            }
            
            // Pattern 2: Individual hole data per line
            if numbers.count >= 2 && numbers.count <= 4 {
                if let holeNum = numbers.first, holeNum >= 1 && holeNum <= 18 {
                    let remaining = Array(numbers.dropFirst())
                    let par = remaining.first { $0 >= 3 && $0 <= 5 }
                    let yardage = remaining.first { $0 >= 50 && $0 <= 800 }
                    let handicap = remaining.first { $0 >= 1 && $0 <= 18 && $0 != holeNum && $0 != par }
                    
                    let hole = ParsedHole(holeNumber: holeNum, par: par, yardage: yardage, handicap: handicap)
                    holes.append(hole)
                }
            }
        }
        
        return holes
    }
    
    // Helper function to check if numbers form a consecutive sequence
    private func isConsecutiveSequence(_ numbers: [Int]) -> Bool {
        guard numbers.count >= 2 else { return false }
        
        for i in 1..<numbers.count {
            if numbers[i] != numbers[i-1] + 1 {
                return false
            }
        }
        return true
    }
    
    // Enhanced parsing from structured rows
    private func parseFromStructuredRows(holeRow: [String], parRow: [String], handicapRow: [String], yardageRows: [[String]]) -> [ParsedHole] {
        var holes: [ParsedHole] = []
        
        var holeStartIndex = 0
        if holeRow.first?.lowercased().contains("hole") == true {
            holeStartIndex = 1
        }
        
        var parStartIndex = 0
        if parRow.first?.lowercased().contains("par") == true {
            parStartIndex = 1
        }
        
        var handicapStartIndex = 0
        if !handicapRow.isEmpty {
            let firstElement = handicapRow.first?.lowercased() ?? ""
            if firstElement.contains("handicap") || firstElement.contains("hcp") || firstElement.contains("hdcp") {
                handicapStartIndex = 1
            }
        }
        
        // Process each hole position
        let maxElements = max(holeRow.count - holeStartIndex, parRow.count - parStartIndex)
        
        for i in 0..<maxElements {
            let holeIndex = i + holeStartIndex
            let parIndex = i + parStartIndex
            let handicapIndex = i + handicapStartIndex
            
            // Get hole number
            guard holeIndex < holeRow.count,
                  let holeNumber = Int(holeRow[holeIndex]),
                  holeNumber >= 1 && holeNumber <= 18 else { continue }
            
            var par: Int?
            var yardage: Int?
            var handicap: Int?
            
            // Get par value
            if parIndex < parRow.count, let parValue = Int(parRow[parIndex]) {
                if parValue >= 3 && parValue <= 5 {
                    par = parValue
                }
            }
            
            // Get handicap value
            if !handicapRow.isEmpty && handicapIndex < handicapRow.count {
                if let handicapValue = Int(handicapRow[handicapIndex]) {
                    if handicapValue >= 1 && handicapValue <= 18 {
                        handicap = handicapValue
                    }
                }
            }
            
            // Get yardage from any yardage row
            for yardageRow in yardageRows {
                var yardageStartIndex = 0
                let firstYardageElement = yardageRow.first?.lowercased() ?? ""
                
                if firstYardageElement.contains("white") || firstYardageElement.contains("black") ||
                   firstYardageElement.contains("blue") || firstYardageElement.contains("red") ||
                   firstYardageElement.contains("gold") || firstYardageElement.contains("green") ||
                   firstYardageElement.contains("championship") || firstYardageElement.contains("member") ||
                   firstYardageElement.contains("ladies") || firstYardageElement.contains("men") {
                    yardageStartIndex = 1
                }
                
                let yardageIndex = i + yardageStartIndex
                if yardageIndex < yardageRow.count, let yardageValue = Int(yardageRow[yardageIndex]) {
                    if yardageValue >= 50 && yardageValue <= 800 {
                        yardage = yardageValue
                        break
                    }
                }
            }
            
            let hole = ParsedHole(
                holeNumber: holeNumber,
                par: par,
                yardage: yardage,
                handicap: handicap
            )
            
            if hole.isValid {
                holes.append(hole)
            }
        }
        
        return holes
    }
    
    private func parseAlternativeFormat(lines: [String]) -> [ParsedHole] {
        var holes: [ParsedHole] = []
        
        for line in lines {
            let components = line.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
            
            if components.first?.lowercased().contains("par") == true {
                for (index, component) in components.enumerated() {
                    if index == 0 { continue }
                    
                    if let parValue = Int(component), parValue >= 3 && parValue <= 5 {
                        let holeNumber = index
                        if holeNumber >= 1 && holeNumber <= 18 {
                            let hole = ParsedHole(
                                holeNumber: holeNumber,
                                par: parValue,
                                yardage: nil,
                                handicap: nil
                            )
                            
                            if hole.isValid {
                                holes.append(hole)
                            }
                        }
                    }
                }
                break
            }
        }
        
        return holes
    }
}

extension String {
    var isNumber: Bool {
        return !isEmpty && allSatisfy { $0.isNumber }
    }
}

#Preview {
    ScorecardScannerView { _ in }
}
