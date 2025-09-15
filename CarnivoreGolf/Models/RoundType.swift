import Foundation
import SwiftUI

// MARK: - Round Type Model

enum RoundType: String, CaseIterable, Codable {
    case stroke = "Stroke"
    case match = "Match"
    case scramble = "Scramble"
    case skins = "Skins"
    case carnivore = "Carnivore"
    case randomize = "Randomize"
    case reverseMulligans = "Reverse Mulligans"
    // New games
    case alternateShot = "Alternate Shot"
    case bestBall = "Best Ball"
    case worstBall = "Worst Ball"
    case bingoBangoBongo = "Bingo Bango Bongo"
    case sticktalk = "Sticktalk"
    
    var displayName: String {
        return self.rawValue
    }
    
    var shortDescription: String {
        switch self {
        case .stroke:
            return "Lowest total score wins"
        case .match:
            return "Win holes to win the match"
        case .scramble:
            return "Team format - best shot each time"
        case .skins:
            return "Win money/points per hole"
        case .carnivore:
            return "Unique scoring system"
        case .randomize:
            return "Random hole assignments"
        case .reverseMulligans:
            return "Strategic mulligan usage"
        case .alternateShot:
            return "Teams alternate shots with one ball"
        case .bestBall:
            return "Best score per team counts"
        case .worstBall:
            return "Worst score per player counts"
        case .bingoBangoBongo:
            return "Points for firsts: green, close, hole"
        case .sticktalk:
            return "Randomize club for each shot"
        }
    }
    
    var detailedDescription: String {
        switch self {
        case .stroke:
            return """
            **Stroke Play** is the most common golf format where each player counts every stroke taken on every hole.
            
            **How to Play:**
            • Count every stroke for each hole
            • Add up all hole scores for your total
            • Lowest total score wins
            • Penalties are added to your score
            
            **Scoring:**
            • Birdie: 1 under par
            • Eagle: 2 under par
            • Par: Even with par
            • Bogey: 1 over par
            • Double Bogey: 2 over par
            
            **Strategy:** Consistency is key. Avoid big numbers and play safe when needed.
            """
        case .match:
            return """
            **Match Play** is a hole-by-hole competition where you win, lose, or tie each individual hole.
            
            **How to Play:**
            • Compare scores on each hole
            • Win a hole = +1 point
            • Lose a hole = -1 point  
            • Tie a hole = 0 points
            • Player with most holes won wins the match
            
            **Match Status:**
            • "2 Up" = Leading by 2 holes
            • "All Square" = Tied match
            • "Dormie" = Leading by number of holes remaining
            
            **Strategy:** Aggressive play can pay off since big scores only lose you one hole, not multiple strokes.
            """
        case .scramble:
            return """
            **Scramble** is a team format where all players hit from the location of the team's best shot.
            
            **How to Play:**
            • All team members tee off
            • Select the best drive
            • Everyone hits their next shot from that spot
            • Continue until the ball is holed
            • Usually 2-4 players per team
            
            **Team Strategy:**
            • Use each player's strengths
            • Conservative and aggressive shots both have value
            • One good shot helps the entire team
            
            **Variations:**
            • Texas Scramble: Must use each player's drive a certain number of times
            • Shamble: Team plays scramble off the tee, then individual play
            """
        case .skins:
            return """
            **Skins** is a betting game where money or points are won for each hole.
            
            **How to Play:**
            • Each hole has a predetermined value ("skin")
            • Lowest score on each hole wins the skin
            • If players tie, the skin carries over to the next hole
            • Carried skins accumulate value
            
            **Example:**
            • Hole 1: Player A wins (gets 1 skin)
            • Hole 2: Players tie (skin carries over)
            • Hole 3: Player B wins (gets 2 skins - current + carried)
            
            **Strategy:** Go for broke on carried holes with multiple skins at stake. Conservative play when leading.
            """
        case .carnivore:
            return """
            **Carnivore** is a unique scoring format that rewards aggressive play and attacking the pin.
            
            **How to Play:**
            • Standard stroke play scoring as base
            • Bonus points for aggressive shots that pay off
            • Penalty reductions for "carnivore" mentality
            • Rewards risk-taking over conservative play
            
            **Scoring Adjustments:**
            • Eagle or better: -1 additional stroke
            • Closest to pin (within 10 feet): -0.5 strokes
            • Birdie from 150+ yards: -0.5 strokes
            • Conservative bogey: +0.5 strokes (laying up when you could attack)
            
            **Philosophy:** Embrace the carnivorous mindset - hunt birdies and eagles rather than playing it safe.
            """
        case .randomize:
            return """
            **Randomize** creates unpredictable challenges by randomly assigning different scoring methods to holes.
            
            **How to Play:**
            • Each hole is randomly assigned a scoring method
            • Could be stroke play, match play, skins, etc.
            • Adds variety and unpredictability to the round
            • Keeps all players engaged throughout
            
            **Possible Hole Formats:**
            • Stroke Play: Normal scoring
            • Match Play: Win/lose/tie the hole
            • Skins: Winner takes all for that hole
            • Best Ball: Team format if playing with partners
            • Worst Ball: Most challenging hole format
            
            **Strategy:** Adaptability is key - be ready to switch strategies hole by hole.
            """
        case .reverseMulligans:
            return """
            **Reverse Mulligans** is a strategic format where mulligans are distributed and must be used wisely.
            
            **How to Play:**
            • Each player receives a set number of mulligans (usually 3-5)
            • Mulligans MUST be used during the round (can't save them all)
            • Other players decide when you must use a mulligan
            • Creates strategic decisions about when to force mulligans
            
            **Rules:**
            • Can't use mulligan on a good shot
            • Must be used on a genuinely bad shot
            • Group consensus on when mulligans are mandatory
            • Unused mulligans become penalty strokes
            
            **Strategy:** Save your "forcing" power for crucial moments. Use mulligans early to avoid end-of-round penalties.
            """
        case .alternateShot:
            return """
            **Alternate Shot** is a team game where teammates alternate shots with a single ball.
            
            **How to Play:**
            • Teams of two (or more)
            • One player tees off, partner hits the next shot, and so on
            • Alternate who tees off on each hole
            • Lowest team score wins
            
            **Strategy:** Consistency and teamwork are key. Plan who tees off on odd/even holes.
            """
        case .bestBall:
            return """
            **Best Ball** is a team game where each player plays their own ball, and the best score on each hole counts for the team.
            
            **How to Play:**
            • Each player plays their own ball
            • Record the lowest score per team for each hole
            • Team with the lowest total best-ball score wins
            
            **Strategy:** Take risks if your partner is in good position. Use each player's strengths.
            """
        case .worstBall:
            return """
            **Worst Ball** is a challenging format where each player plays two balls, and the worst score counts.
            
            **How to Play:**
            • Each player plays two balls per hole
            • Record the higher (worst) score for each hole
            • Lowest total of worst scores wins
            
            **Strategy:** Consistency is crucial. Avoid big mistakes, as both balls must be played out.
            """
        case .bingoBangoBongo:
            return """
            **Bingo Bango Bongo** is a points-based game rewarding firsts on each hole.
            
            **How to Play:**
            • First on the green (Bingo): 1 point
            • Closest to the pin once all are on (Bango): 1 point
            • First to hole out (Bongo): 1 point
            • Most points at the end wins
            
            **Strategy:** Play for position and speed, not just low score.
            """
        case .sticktalk:
            return """
            **Stick Talk** is a challenging format where players must use randomly assigned clubs for each shot.
            
            **How to Play:**
            • The app owner/group leader randomizes clubs in real-time
            • Players must use the assigned club for their shot
            • Adds unpredictability and forces creative shot-making
            • Can be applied to tee shots, approach shots, or all shots
            
            **Rules:**
            • Must use the club that's randomly selected
            • No substitutions or mulligans for bad club assignments
            • Putter is typically excluded from randomization around greens
            • Group decides when to randomize (every shot vs. just tee shots)
            
            **Strategy:** Adaptability is everything. Learn to hit creative shots with unusual club selections.
            """
        }
    }
    
    var color: Color {
        switch self {
        case .stroke:
            return .blue
        case .match:
            return .red
        case .scramble:
            return .green
        case .skins:
            return .orange
        case .carnivore:
            return .purple
        case .randomize:
            return .yellow
        case .reverseMulligans:
            return .pink
        case .alternateShot:
            return .teal
        case .bestBall:
            return .mint
        case .worstBall:
            return .brown
        case .bingoBangoBongo:
            return .cyan
        case .sticktalk:
            return .indigo
        }
    }
    
    var icon: String {
        switch self {
        case .stroke:
            return "chart.line.uptrend.xyaxis"
        case .match:
            return "person.2.fill"
        case .scramble:
            return "person.3.fill"
        case .skins:
            return "dollarsign.circle.fill"
        case .carnivore:
            return "flame.fill"
        case .randomize:
            return "shuffle"
        case .reverseMulligans:
            return "arrow.triangle.2.circlepath"
        case .alternateShot:
            return "arrow.left.arrow.right.circle.fill"
        case .bestBall:
            return "star.circle.fill"
        case .worstBall:
            return "exclamationmark.circle.fill"
        case .bingoBangoBongo:
            return "flag.circle.fill"
        case .sticktalk:
            return "golfclub.fill"
        }
    }
    
    var scoringIndicator: String {
        switch self {
        case .stroke:
            return "Total strokes"
        case .match:
            return "Holes won"
        case .scramble:
            return "Team score"
        case .skins:
            return "Skins won"
        case .carnivore:
            return "Carnivore score"
        case .randomize:
            return "Variable scoring"
        case .reverseMulligans:
            return "Stroke + mulligans"
        case .alternateShot:
            return "Team alternate shots"
        case .bestBall:
            return "Best team score"
        case .worstBall:
            return "Worst score counts"
        case .bingoBangoBongo:
            return "Points for firsts"
        case .sticktalk:
            return "Random club shots"
        }
    }
}

// MARK: - Round Type Helper Functions

extension RoundType {
    static func from(string: String) -> RoundType {
        return RoundType(rawValue: string) ?? .stroke
    }
    
    func scoreIndicator(for score: Int, par: Int) -> (text: String, color: Color) {
        switch self {
        case .stroke, .carnivore, .reverseMulligans:
            // Standard stroke play indicators
            let difference = score - par
            
            switch difference {
            case ..<(-2):
                return ("🦅", .blue) // Eagle or better
            case -2:
                return ("🦅", .blue) // Eagle
            case -1:
                return ("🐦", .green) // Birdie
            case 0:
                return ("📍", .primary) // Par
            case 1:
                return ("+1", .orange) // Bogey
            case 2:
                return ("+2", .red) // Double
            default:
                return ("+\(difference)", .red) // Triple or worse
            }
        case .match:
            // Match play: just show win/lose/tie
            return ("vs", .blue)
        case .scramble:
            // Team scoring
            return ("👥", .green)
        case .skins:
            // Skins format
            return ("💰", .orange)
        case .randomize:
            // Variable format
            return ("🎲", .yellow)
        case .alternateShot:
            return ("🔄", .teal)
        case .bestBall:
            return ("⭐️", .mint)
        case .worstBall:
            return ("❗️", .brown)
        case .bingoBangoBongo:
            return ("🏁", .cyan)
        case .sticktalk:
            return ("🎲", .yellow)
        }
    }
}
