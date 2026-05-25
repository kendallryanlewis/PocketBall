import SwiftUI
import WebKit

/// `UIViewRepresentable` wrapper around `WKWebView`.
///
/// Serves the Angular bundle via `BundleSchemeHandler` under the custom
/// `app://` scheme, which avoids WKWebView's `file://` sandbox restrictions
/// on physical iOS devices.
@MainActor
struct WebView: UIViewRepresentable {
    /// Called once on the first successful navigation, used to dismiss the
    /// native splash overlay in `ContentView`.
    var onLoaded: (() -> Void)? = nil

    func makeCoordinator() -> WebBridge {
        WebBridge(onLoaded: onLoaded)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        // Reuse the pre-warmed process pool so the WebContent process is already
        // running when this view appears — eliminates the cold-start delay.
        config.processPool = WebViewPrewarmer.sharedProcessPool
        config.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: BundleSchemeHandler.scheme)
        config.userContentController.add(context.coordinator, name: "nativeBridge")

        // Intercept console.log/warn/error/info/debug and forward to Xcode via the bridge.
        let consoleScript = WKUserScript(source: """
        (function() {
            const levels = ['log', 'warn', 'error', 'info', 'debug'];
            levels.forEach(function(level) {
                const original = console[level].bind(console);
                console[level] = function() {
                    original.apply(console, arguments);
                    try {
                        const msg = Array.from(arguments).map(function(a) {
                            if (a === null) return 'null';
                            if (a === undefined) return 'undefined';
                            if (a instanceof Error) return a.stack || a.message;
                            if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return String(a); } }
                            return String(a);
                        }).join(' ');
                        window.webkit.messageHandlers.nativeBridge.postMessage({ action: 'log', payload: { level: level, message: msg } });
                    } catch(e) {}
                };
            });
        })();
        """, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        config.userContentController.addUserScript(consoleScript)

        // Prevent media elements from triggering full-screen interruptions.
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        // Disable link-preview long-press — eliminates the ~300 ms timer WKWebView
        // starts on every touch near an <a> element.
        webView.allowsLinkPreview = false
        context.coordinator.webView = webView

        // Angular manages all scrollable areas via CSS overflow — disabling the
        // WKWebView's own root scroll removes dual-scroll conflicts.
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.scrollView.decelerationRate = .normal

        // Deliver touches to web content immediately, eliminating touch latency.
        webView.scrollView.delaysContentTouches = false
        webView.scrollView.panGestureRecognizer.delaysTouchesBegan = false

        #if DEBUG
        webView.isInspectable = true
        #endif

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // Only load once; navigation within Angular manages further routing.
        guard webView.url == nil else { return }
        webView.load(URLRequest(url: BundleSchemeHandler.startURL))
    }
}
