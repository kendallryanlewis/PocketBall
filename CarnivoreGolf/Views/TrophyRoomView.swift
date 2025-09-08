import SwiftUI

struct TrophyRoomView: View {
    var body: some View {
        VStack {
            Text("Trophy Room")
                .font(.largeTitle)
                .padding()
            Text("Your completed rounds and achievements will appear here.")
                .foregroundColor(.secondary)
                .padding()
            Spacer()
        }
        .navigationTitle("Trophy Room")
    }
}

#Preview {
    TrophyRoomView()
}
