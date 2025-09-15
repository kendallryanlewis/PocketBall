import SwiftUI

struct BackgroundView: View {
    @StateObject private var settings = SettingsManager()
    @Environment(\.colorScheme) private var colorScheme
    
    private var backgroundGradient: LinearGradient {
        switch settings.backgroundMode {
        case .light:
            return LinearGradient(
                gradient: Gradient(colors: [Color.white, Color(white: 0.97)]),
                startPoint: .top, endPoint: .bottom)
        case .dark:
            return LinearGradient(
                gradient: Gradient(colors: [Color(white: 0.15), Color(white: 0.15)]),
                startPoint: .top, endPoint: .bottom)
        case .system:
            if colorScheme == .dark {
                return LinearGradient(
                    gradient: Gradient(colors: [Color(white: 0.15), Color(white: 0.13)]),
                    startPoint: .top, endPoint: .bottom)
            } else {
                return LinearGradient(
                    gradient: Gradient(colors: [Color.white, Color(white: 0.97)]),
                    startPoint: .top, endPoint: .bottom)
            }
        }
    }
    
    var body: some View {
        backgroundGradient.ignoresSafeArea()
    }
}

#Preview {
    EditCourseView(
        course: SavedCourseScorecard(
            courseName: "Sample Course",
            location: "Sample Location",
            holes: [],
            availableTees: []
        ),
        onSave: { _ in }
    )
}
