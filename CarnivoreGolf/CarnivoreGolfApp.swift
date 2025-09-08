//
//  CarnivoreGolfApp.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/5/25.
//

import SwiftUI

@main
struct CarnivoreGolfApp: App {
    @StateObject var settings = SettingsManager()
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settings)
        }
    }
}
