//
//  CarnivoreGolfApp.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/5/25.
//

import SwiftUI
import UIKit

@main
struct CarnivoreGolfApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Pre-warm WKWebView's helper processes (WebContent, GPU, Networking)
        // before the first SwiftUI frame renders, eliminating the 3-second cold start.
        Task { @MainActor in
            WebViewPrewarmer.shared.start()
        }
        return true
    }
}
