//
//  ApiClient.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 29..
//

import Foundation

actor TokenRefreshActor {
  private var isRefreshing = false
  private var waiters: [CheckedContinuation<Void, Never>] = []

  func beginRefresh() async {
    if isRefreshing {
      // Wait for the ongoing refresh
      await withCheckedContinuation { continuation in
        waiters.append(continuation)
      }
      return
    }

    // Mark as refreshing
    isRefreshing = true
  }

  func finishRefresh() {
    isRefreshing = false

    // Release all waiters
    waiters.forEach { $0.resume() }
    waiters.removeAll()
  }
}

final class HttpClient {
  private let keychainService: KeychainService
  
  init(keychainService: KeychainService) {
    self.keychainService = keychainService
  }

  private let tokenGate = TokenRefreshActor()

  private func executeRequest(path: String, method: String, body: Codable? = nil) async throws -> Data {
    var components = URLComponents()
    components.scheme = "https"
    components.host = Bundle.main.object(forInfoDictionaryKey: "API_DOMAIN") as? String ?? ""
    components.path = path

    var request = URLRequest(url: components.url!)

    request.httpMethod = method

    if let body {
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try JSONEncoder().encode(body)
    }

    if let idToken = keychainService.idToken {
      request.setValue(idToken, forHTTPHeaderField: "Authorization")
    }

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
      throw Common.Error.Response(message: "Unexpected error")
    }

    guard 200..<300 ~= httpResponse.statusCode else {
      let errorResponse = try JSONDecoder().decode(Common.Error.Response.self, from: data)

      guard httpResponse.statusCode == 401 else {
        throw errorResponse
      }

      guard errorResponse.message == "The incoming token has expired" else {
        keychainService.idToken = nil
        keychainService.refreshToken = nil
        throw errorResponse
      }

      await tokenGate.beginRefresh()

      if let newToken = keychainService.idToken,
         newToken != request.value(forHTTPHeaderField: "Authorization") {

        await tokenGate.finishRefresh()
        return try await executeRequest(path: path, method: method, body: body)
      }

      let refreshData = try await executeRequest(path: "/user/v1/refreshToken", method: "POST", body: Auth.RefreshToken.Request(refreshToken: keychainService.refreshToken!))
      let resp = try parseResponse(data: refreshData, responseType: Auth.RefreshToken.Response.self)

      keychainService.idToken = resp.idToken

      await tokenGate.finishRefresh()

      return try await executeRequest(path: path, method: method, body:body)
    }

    return data;
  }

  private func parseResponse<T: Codable>(data: Data, responseType: T.Type) throws -> T {
    return try JSONDecoder().decode(responseType, from: data)
  }

  func get <T: Codable>(_ path: String, responseType: T.Type) async throws -> T {
    let data = try await executeRequest(path: path, method: "GET")

    return try parseResponse(data: data, responseType: responseType)
  }

  func post(_ path: String, body: Codable) async throws {
    _ = try await executeRequest(path: path, method: "POST", body: body)
  }

  func post <T: Codable>(_ path: String, body: Codable, responseType: T.Type) async throws -> T {
    let data = try await executeRequest(path: path, method: "POST", body: body)

    return try parseResponse(data: data, responseType: responseType)
  }

  func put (_ path: String, body: Codable) async throws {
    _ = try await executeRequest(path: path, method: "PUT", body: body)
  }

  func put <T: Codable>(_ path: String, body: Codable, responseType: T.Type) async throws -> T {
    let data = try await executeRequest(path: path, method: "PUT", body: body)

    return try parseResponse(data: data, responseType: responseType)
  }

  func delete (_ path: String) async throws {
    _ = try await executeRequest(path: path, method: "DELETE")
  }
}
