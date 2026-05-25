import WebKit

/// Kicks off WKWebView's three helper processes (WebContent, GPU, Networking)
/// as early as possible so they are ready by the time ContentView appears.
///
/// Call `WebViewPrewarmer.shared.start()` from AppDelegate's
/// `application(_:didFinishLaunchingWithOptions:)`.
@MainActor
final class WebViewPrewarmer {
    static let shared = WebViewPrewarmer()

    /// Shared across the pre-warmer AND the real WebView so the pre-warmed
    /// WebContent process is actually reused instead of spawning a second one.
    static let sharedProcessPool = WKProcessPool()

    private var webView: WKWebView?

    private init() {}

    func start() {
        guard webView == nil else { return }

        let config = WKWebViewConfiguration()
        // Share the process pool so the real WebView reuses the pre-warmed process.
        config.processPool = WebViewPrewarmer.sharedProcessPool
        config.allowsInlineMediaPlayback = true

        // Register the bundle scheme so the Angular app can fully load.
        config.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: BundleSchemeHandler.scheme)

        // Swallow all nativeBridge messages from Angular's bootstrap code so the
        // pre-warmer doesn't crash before a real handler is wired up.
        config.userContentController.add(NullMessageHandler(), name: "nativeBridge")

        // Load a blank page — just enough to spawn the helper processes without
        // running Angular (which would call nativeBridge with no handler and can
        // cause the WebContent process to hang or become unresponsive).
        let wv = WKWebView(frame: CGRect(x: 0, y: 0, width: 1, height: 1), configuration: config)
        wv.isHidden = true
        wv.loadHTMLString("<!DOCTYPE html><html><body></body></html>", baseURL: nil)
        webView = wv
    }
}

/// Silently discards all WKScriptMessages — used by the pre-warmer to
/// absorb any bridge calls before a real handler exists.
private final class NullMessageHandler: NSObject, WKScriptMessageHandler {
    func userContentController(_ controller: WKUserContentController,
                               didReceive message: WKScriptMessage) { /* intentionally empty */ }
}
