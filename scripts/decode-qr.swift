import AppKit
import Foundation
import Vision

struct DecodeResult: Codable {
    let path: String
    let payloads: [String]
    let error: String?
}

func decode(path: String) -> DecodeResult {
    guard let image = NSImage(contentsOfFile: path) else {
        return DecodeResult(path: path, payloads: [], error: "Unable to load image")
    }

    var imageRect = CGRect(origin: .zero, size: image.size)
    guard let cgImage = image.cgImage(forProposedRect: &imageRect, context: nil, hints: nil) else {
        return DecodeResult(path: path, payloads: [], error: "Unable to create CGImage")
    }

    let request = VNDetectBarcodesRequest()
    request.symbologies = [.qr]

    do {
        try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
        let payloads = (request.results ?? []).compactMap(\.payloadStringValue)
        return DecodeResult(path: path, payloads: payloads, error: nil)
    } catch {
        return DecodeResult(path: path, payloads: [], error: error.localizedDescription)
    }
}

let paths = Array(CommandLine.arguments.dropFirst())
let results = paths.map(decode)
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]

do {
    let data = try encoder.encode(results)
    print(String(decoding: data, as: UTF8.self))
} catch {
    FileHandle.standardError.write(Data("Failed to encode results: \(error)\n".utf8))
    exit(1)
}
