import Vision
import UIKit

// MARK: - Public types

struct ScorecardParseResult: Codable {
    let courseName: String
    let holes: [ScorecardHole]
}

struct ScorecardHole: Codable {
    let number: Int
    let par: Int
    let handicap: Int
    let yardage: Int
}

// MARK: - Parser

enum ScorecardOCRParser {

    // MARK: Entry point (synchronous — run on a background thread)

    static func parse(cgImage: CGImage) -> ScorecardParseResult? {
        let observations = performOCR(cgImage)
        guard !observations.isEmpty else { return nil }

        let rows = groupRows(observations)
        guard let holeRowIdx = findHoleRow(rows) else { return nil }

        // Collect hole numbers (1…18) in left-to-right order
        var holeNums = ints(rows[holeRowIdx]).filter { $0 >= 1 && $0 <= 18 }

        // Handle split front/back layout: if we only found 1-9, check the next
        // numeric-dense row for 10-18 and merge.
        if holeNums.count == 9 && holeNums.sorted().first == 1 {
            for row in rows.dropFirst(holeRowIdx + 1).prefix(3) {
                let next = ints(row).filter { $0 >= 10 && $0 <= 18 }
                if next.count >= 9 {
                    holeNums += next
                    break
                }
            }
        }

        let count = min(holeNums.count, 18)
        guard count >= 9 else { return nil }

        var parRow:  [Int] = []
        var hdcpRow: [Int] = []
        var yardRow: [Int] = []

        for row in rows.dropFirst(holeRowIdx + 1) {
            let vals = Array(ints(row).prefix(count))
            guard vals.count >= max(4, count / 3) else { continue }

            if parRow.isEmpty  && vals.allSatisfy({ $0 >= 3 && $0 <= 5 }) {
                parRow = vals
            }
            if hdcpRow.isEmpty
                && vals.allSatisfy({ $0 >= 1 && $0 <= 18 })
                && Set(vals).count == vals.count {
                hdcpRow = vals
            }
            if yardRow.isEmpty && vals.allSatisfy({ $0 >= 80 && $0 <= 700 }) {
                yardRow = vals
            }
            if !parRow.isEmpty && !hdcpRow.isEmpty && !yardRow.isEmpty { break }
        }

        let courseName = findCourseName(rows, beforeIdx: holeRowIdx)

        let holes = (0..<count).map { i -> ScorecardHole in
            ScorecardHole(
                number:   holeNums[i],
                par:      i < parRow.count  ? parRow[i]  : 4,
                handicap: i < hdcpRow.count ? hdcpRow[i] : (i + 1),
                yardage:  i < yardRow.count ? yardRow[i] : 0
            )
        }

        return ScorecardParseResult(courseName: courseName, holes: holes)
    }

    // MARK: - OCR

    private static func performOCR(_ cgImage: CGImage) -> [VNRecognizedTextObservation] {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = false
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try? handler.perform([request])
        return request.results ?? []
    }

    // MARK: - Row grouping

    private struct Cell {
        let text: String
        let x: CGFloat
    }

    private static func groupRows(_ obs: [VNRecognizedTextObservation]) -> [[Cell]] {
        // VN coordinate system: Y=0 at bottom, so descending Y = top→bottom visually
        let sorted = obs.sorted { $0.boundingBox.midY > $1.boundingBox.midY }
        var rows: [[Cell]] = []
        var cur:  [Cell]   = []
        var curY: CGFloat  = -1

        for o in sorted {
            guard let top = o.topCandidates(1).first else { continue }
            let y = o.boundingBox.midY
            if curY < 0 || abs(y - curY) > 0.025 {
                if !cur.isEmpty { rows.append(cur.sorted { $0.x < $1.x }) }
                cur  = []
                curY = y
            }
            cur.append(Cell(text: top.string, x: o.boundingBox.midX))
        }
        if !cur.isEmpty { rows.append(cur.sorted { $0.x < $1.x }) }
        return rows
    }

    // MARK: - Helpers

    private static func ints(_ row: [Cell]) -> [Int] {
        row.compactMap { Int($0.text.trimmingCharacters(in: .whitespaces)) }
    }

    /// A hole-number row contains at least 9 integers from 1…18 that start at 1.
    private static func findHoleRow(_ rows: [[Cell]]) -> Int? {
        for (i, row) in rows.enumerated() {
            let vals = ints(row)
            let in1to18 = vals.filter { $0 >= 1 && $0 <= 18 }
            guard in1to18.count >= 9 else { continue }
            let s = in1to18.sorted()
            if s.first == 1 { return i }
        }
        return nil
    }

    /// Return the longest text-only line above the hole-number row as the course name.
    private static func findCourseName(_ rows: [[Cell]], beforeIdx: Int) -> String {
        rows.prefix(beforeIdx)
            .map { $0.map(\.text).joined(separator: " ") }
            .filter { $0.contains(where: \.isLetter) }
            .max(by: { $0.count < $1.count }) ?? "Scanned Course"
    }
}
