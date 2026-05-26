import AVFoundation
import UIKit

/// A full-screen QR / barcode scanner presented modally.
/// When a code is found (or the user cancels) `onResult` is called on the main thread
/// and the controller dismisses itself.
@MainActor
final class QRScannerViewController: UIViewController {

    var onResult: ((String?) -> Void)?

    // MARK: - AV

    private let session = AVCaptureSession()
    private var previewLayer: AVCaptureVideoPreviewLayer?

    // MARK: - UI

    private let closeButton: UIButton = {
        let b = UIButton(type: .system)
        b.setImage(UIImage(systemName: "xmark.circle.fill"), for: .normal)
        b.tintColor = .white
        b.translatesAutoresizingMaskIntoConstraints = false
        b.contentVerticalAlignment = .fill
        b.contentHorizontalAlignment = .fill
        return b
    }()

    private let hintLabel: UILabel = {
        let l = UILabel()
        l.text = "Point the camera at a QR code"
        l.textColor = UIColor.white.withAlphaComponent(0.85)
        l.font = .systemFont(ofSize: 14, weight: .medium)
        l.textAlignment = .center
        l.translatesAutoresizingMaskIntoConstraints = false
        return l
    }()

    // Finder overlay
    private let finderView: UIView = {
        let v = UIView()
        v.layer.borderColor = UIColor.white.cgColor
        v.layer.borderWidth = 2
        v.layer.cornerRadius = 12
        v.translatesAutoresizingMaskIntoConstraints = false
        return v
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        setupCamera()
        setupUI()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if !session.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.session.startRunning()
            }
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if session.isRunning {
            session.stopRunning()
        }
    }

    // MARK: - Setup

    private func setupCamera() {
        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else {
            // No camera — cancel immediately
            DispatchQueue.main.async { [weak self] in
                self?.finish(with: nil)
            }
            return
        }

        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard session.canAddOutput(output) else {
            DispatchQueue.main.async { [weak self] in
                self?.finish(with: nil)
            }
            return
        }

        session.addOutput(output)
        output.setMetadataObjectsDelegate(self, queue: .main)
        output.metadataObjectTypes = [.qr]

        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.videoGravity = .resizeAspectFill
        preview.frame = view.bounds
        view.layer.insertSublayer(preview, at: 0)
        previewLayer = preview
    }

    private func setupUI() {
        view.addSubview(finderView)
        view.addSubview(hintLabel)
        view.addSubview(closeButton)

        closeButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)

        NSLayoutConstraint.activate([
            // Finder box — centred, square, 65% width
            finderView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            finderView.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -30),
            finderView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.65),
            finderView.heightAnchor.constraint(equalTo: finderView.widthAnchor),

            // Hint below finder
            hintLabel.topAnchor.constraint(equalTo: finderView.bottomAnchor, constant: 20),
            hintLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            hintLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            // Close button — top-right
            closeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            closeButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            closeButton.widthAnchor.constraint(equalToConstant: 36),
            closeButton.heightAnchor.constraint(equalToConstant: 36),
        ])
    }

    // MARK: - Actions

    @objc private func cancelTapped() {
        finish(with: nil)
    }

    private func finish(with value: String?) {
        session.stopRunning()
        dismiss(animated: true) { [weak self] in
            self?.onResult?(value)
        }
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate

extension QRScannerViewController: AVCaptureMetadataOutputObjectsDelegate {
    nonisolated func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        guard let obj = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let value = obj.stringValue else { return }
        Task { @MainActor [weak self] in
            self?.finish(with: value)
        }
    }
}
