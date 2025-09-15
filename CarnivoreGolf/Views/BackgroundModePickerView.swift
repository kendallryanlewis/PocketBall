import SwiftUI

struct BackgroundModePickerView: View {
    @StateObject private var settings = SettingsManager()
    var body: some View {
        Picker("Background Mode", selection: $settings.backgroundMode) {
            ForEach(BackgroundMode.allCases) { mode in
                Text(mode.displayName).tag(mode)
            }
        }
        .pickerStyle(SegmentedPickerStyle())
        .padding()
    }
}

#Preview {
    BackgroundModePickerView()
}
