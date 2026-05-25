import WebKit
import OSLog
import UIKit
import AuthenticationServices
import CoreLocation

private let log = Logger(subsystem: "KNDL.CarnivoreGolf", category: "WebBridge")

/// Handles bidirectional communication between the Angular web layer and Swift.
///
/// **Angular → Swift:** call `window.webkit.messageHandlers.nativeBridge.postMessage({ action, payload })`
/// **Swift → Angular:** call `webView.evaluateJavaScript("window.dispatchEvent(...)")`
///
/// To add a new native action:
///   1. Handle it in the `switch` inside `handle(action:payload:)`.
///   2. Dispatch results back with `webView?.evaluateJavaScript(js)`.
@MainActor
final class WebBridge: NSObject,
    WKScriptMessageHandler,
    WKNavigationDelegate,
    WKUIDelegate {

    weak var webView: WKWebView?
    private let onLoaded: (() -> Void)?
    private var appleAuthHandler: AppleAuthHandler?
    private var locationManager: CLLocationManager?

    // MARK: - Lifecycle

    init(onLoaded: (() -> Void)? = nil) {
        self.onLoaded = onLoaded
        super.init()
        setupLocationManager()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow(_:)),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide(_:)),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "nativeBridge",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String
        else {
            log.warning("Malformed bridge message received")
            return
        }

        log.debug("Bridge received action: \(action)")
        handle(action: action, payload: body["payload"])
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        log.info("WebView loaded: \(webView.url?.absoluteString ?? "unknown")")
        onLoaded?()
    }

    func webView(
        _ webView: WKWebView,
        didFail navigation: WKNavigation!,
        withError error: Error
    ) {
        log.error("WebView navigation failed: \(error.localizedDescription)")
    }

    func webView(
        _ webView: WKWebView,
        didFailProvisionalNavigation navigation: WKNavigation!,
        withError error: Error
    ) {
        log.error("WebView provisional navigation failed: \(error.localizedDescription)")
    }

    // MARK: - WKUIDelegate

    /// Automatically grant geolocation access so `navigator.geolocation` works
    /// inside the WKWebView without any native permission prompt.
    func webView(
        _ webView: WKWebView,
        requestGeolocationPermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        decisionHandler: @escaping @MainActor (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }

    // MARK: - Location

    private func setupLocationManager() {
        let manager = CLLocationManager()
        manager.delegate = self
        locationManager = manager
    }

    private func locationStatusString() -> String {
        switch locationManager?.authorizationStatus ?? .notDetermined {
        case .authorizedWhenInUse, .authorizedAlways: return "granted"
        case .denied, .restricted:                    return "denied"
        case .notDetermined:                          return "notDetermined"
        @unknown default:                             return "notDetermined"
        }
    }

    private func sendLocationStatus() {
        let status = locationStatusString()
        let js = "window.dispatchEvent(new CustomEvent('locationPermission', { detail: { status: '\(status)' } }))"
        webView?.evaluateJavaScript(js)
        log.debug("Sent locationPermission: \(status)")
    }

    // MARK: - Keyboard notifications

    @objc private func keyboardWillShow(_ notification: Notification) {
        guard let info = notification.userInfo,
              let frame = info[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect,
              let duration = info[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double
        else { return }
        let height = frame.height
        let js = "window.dispatchEvent(new CustomEvent('keyboardWillShow', { detail: { height: \(height), duration: \(duration) } }))"
        webView?.evaluateJavaScript(js)
    }

    @objc private func keyboardWillHide(_ notification: Notification) {
        guard let info = notification.userInfo,
              let duration = info[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double
        else { return }
        let js = "window.dispatchEvent(new CustomEvent('keyboardWillHide', { detail: { duration: \(duration) } }))"
        webView?.evaluateJavaScript(js)
    }

    // MARK: - Action dispatch

    private func handle(action: String, payload: Any?) {
        switch action {
        case "getLocationPermission":
            sendLocationStatus()
        case "requestLocationPermission":
            if locationManager?.authorizationStatus == .notDetermined {
                locationManager?.requestWhenInUseAuthorization()
            } else {
                sendLocationStatus()
            }
        case "signInWithApple":
            handleAppleSignIn()
        case "checkAppleCredential":
            if let p = payload as? [String: Any], let userId = p["userId"] as? String {
                checkAppleCredential(userId: userId)
            }
        case "setTheme":
            if let p = payload as? [String: Any], let theme = p["resolved"] as? String {
                NotificationCenter.default.post(
                    name: .angularThemeChanged,
                    object: nil,
                    userInfo: ["theme": theme]
                )
            }
        case "analytics":
            // Forward analytics events to the native logger.
            // Swap this body for any analytics SDK call (Firebase, Amplitude, etc.)
            if let p = payload as? [String: Any] {
                let event = p["event"] as? String ?? "unknown"
                var params = p
                params.removeValue(forKey: "event")
                let paramsStr = params.isEmpty ? "" : " \(params)"
                log.info("[Analytics] \(event)\(paramsStr)")
            }
        case "scanScorecard":
            handleScanScorecard(payload: payload)
        case "log":
            if let p = payload as? [String: Any] {
                let msg = p["message"] as? String ?? ""
                switch p["level"] as? String {
                case "warn":  log.warning("[JS] \(msg)")
                case "error": log.error("[JS] \(msg)")
                case "info":  log.info("[JS] \(msg)")
                case "debug": log.debug("[JS] \(msg)")
                default:      log.notice("[JS] \(msg)")
                }
            }
        default:
            log.warning("Unhandled bridge action: \(action)")
        }
    }

    // MARK: - Scorecard Scanning

    private func handleScanScorecard(payload: Any?) {
        guard
            let p       = payload as? [String: Any],
            let base64  = p["imageData"] as? String,
            let imgData = Data(base64Encoded: base64),
            let cgImage = UIImage(data: imgData)?.cgImage
        else {
            dispatchScanResult(nil)
            return
        }

        Task.detached(priority: .userInitiated) { [weak self] in
            let result = ScorecardOCRParser.parse(cgImage: cgImage)
            await MainActor.run { self?.dispatchScanResult(result) }
        }
    }

    private func dispatchScanResult(_ result: ScorecardParseResult?) {
        let detail: String
        if let result,
           let data = try? JSONEncoder().encode(result),
           let str  = String(data: data, encoding: .utf8) {
            detail = str
        } else {
            detail = "null"
        }
        webView?.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('scorecardScanResult', { detail: \(detail) }))"
        )
    }

    // MARK: - Apple Sign In

    private func handleAppleSignIn() {
        let handler = AppleAuthHandler()
        appleAuthHandler = handler
        let window = webView?.window

        handler.signIn(from: window) { [weak self] result in
            guard let self else { return }
            switch result {
            case .success(let info):
                guard let data = try? JSONEncoder().encode(info),
                      let json = String(data: data, encoding: .utf8) else { return }
                let js = "window.dispatchEvent(new CustomEvent('appleAuthResult', { detail: \(json) }))"
                self.webView?.evaluateJavaScript(js)
            case .failure(let error):
                if case AppleAuthError.canceled = error { return }
                let js = "window.dispatchEvent(new CustomEvent('appleAuthError', { detail: { message: \"\(error.localizedDescription)\" } }))"
                self.webView?.evaluateJavaScript(js)
            }
            self.appleAuthHandler = nil
        }
    }

    // MARK: - Theme

    // Notification name is declared in an extension below.

    // MARK: - Apple Credential

    private func checkAppleCredential(userId: String) {
        AppleAuthHandler.checkCredentialState(userId: userId) { [weak self] state in
            let stateStr: String
            switch state {
            case .authorized:    stateStr = "authorized"
            case .revoked:       stateStr = "revoked"
            case .notFound:      stateStr = "notFound"
            default:             stateStr = "unknown"
            }
            let js = "window.dispatchEvent(new CustomEvent('appleCredentialState', { detail: { state: \"\(stateStr)\" } }))"
            self?.webView?.evaluateJavaScript(js)
        }
    }
}

// MARK: - CLLocationManagerDelegate

extension WebBridge: CLLocationManagerDelegate {
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor [weak self] in
            self?.sendLocationStatus()
        }
    }
}

// MARK: - Notification names

extension Notification.Name {
    static let angularThemeChanged = Notification.Name("angularThemeChanged")
}
