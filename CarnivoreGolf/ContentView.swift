//
//  ContentView.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/6/25.
//

import SwiftUI

struct ContentView: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var webOpacity: Double = 0
    @State private var showSplash: Bool = true
    /// Set by Angular's ThemeService via the `setTheme` bridge message.
    /// nil = not yet received, fall back to system colorScheme.
    @State private var angularTheme: String? = nil

    private var bgColor: Color {
        let dark: Bool
        if let t = angularTheme {
            dark = (t == "dark")
        } else {
            dark = (colorScheme == .dark)
        }
        return dark
            ? Color(red: 0.098, green: 0.098, blue: 0.106)  // #19191B
            : Color(red: 0.933, green: 0.949, blue: 0.933)  // #EEF2EE
    }

    var body: some View {
        ZStack {
            bgColor
                .ignoresSafeArea()
                .animation(.easeInOut(duration: 0.25), value: angularTheme)

            WebView(onLoaded: {
                withAnimation(.easeIn(duration: 0.3)) {
                    webOpacity = 1
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    withAnimation(.easeOut(duration: 0.4)) {
                        showSplash = false
                    }
                }
            })
            .ignoresSafeArea(edges: .bottom)
            .opacity(webOpacity)

            if showSplash {
                SplashView()
                    .transition(.opacity)
                    .zIndex(10)
            }
        }
        .onReceive(
            NotificationCenter.default.publisher(for: .angularThemeChanged)
        ) { note in
            if let theme = note.userInfo?["theme"] as? String {
                withAnimation(.easeInOut(duration: 0.25)) {
                    angularTheme = theme
                }
            }
        }
    }
}

#Preview {
    ContentView()
}

