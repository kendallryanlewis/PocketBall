import AuthenticationServices
import OSLog

private let log = Logger(subsystem: "KNDL.CarnivoreGolf", category: "AppleAuth")

// MARK: - Value type returned to Angular

struct AppleUserInfo: Codable {
    let userId: String
    let displayName: String
    let email: String?
    let firstName: String?
    let lastName: String?
}

// MARK: - Handler

/// Wraps ASAuthorizationAppleIDProvider so WebBridge can trigger
/// Sign In with Apple and return the result to the Angular layer.
@MainActor
final class AppleAuthHandler: NSObject,
    ASAuthorizationControllerDelegate,
    ASAuthorizationControllerPresentationContextProviding
{
    private var completion: ((Result<AppleUserInfo, Error>) -> Void)?
    private weak var window: UIWindow?

    /// Returns the persisted Apple user ID if the credential is still valid.
    static func checkCredentialState(
        userId: String,
        completion: @escaping (ASAuthorizationAppleIDProvider.CredentialState) -> Void
    ) {
        ASAuthorizationAppleIDProvider().getCredentialState(forUserID: userId) { state, _ in
            DispatchQueue.main.async { completion(state) }
        }
    }

    /// Initiates the Sign In with Apple flow.
    func signIn(
        from window: UIWindow?,
        completion: @escaping (Result<AppleUserInfo, Error>) -> Void
    ) {
        self.window = window
        self.completion = completion

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    // MARK: ASAuthorizationControllerPresentationContextProviding

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        window ?? UIWindow()
    }

    // MARK: ASAuthorizationControllerDelegate

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard let cred = authorization.credential as? ASAuthorizationAppleIDCredential else {
            completion?(.failure(AppleAuthError.badCredential))
            return
        }

        let first = cred.fullName?.givenName
        let last  = cred.fullName?.familyName
        var display: String
        if let f = first, !f.isEmpty {
            display = [f, last].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " ")
        } else {
            display = "Golfer"
        }

        let info = AppleUserInfo(
            userId: cred.user,
            displayName: display,
            email: cred.email,
            firstName: first,
            lastName: last
        )
        completion?(.success(info))
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        // Ignore user cancellation silently.
        if let e = error as? ASAuthorizationError, e.code == .canceled {
            completion?(.failure(AppleAuthError.canceled))
        } else {
            completion?(.failure(error))
        }
    }
}

enum AppleAuthError: LocalizedError {
    case badCredential, canceled
    var errorDescription: String? {
        switch self {
        case .badCredential: return "Apple credential was invalid."
        case .canceled:      return "Sign-in was canceled."
        }
    }
}
