//
//  AuthService.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import Foundation
import KeychainAccess
import Combine

final class AuthService: ObservableObject {
    private let httpClient = HttpClient.shared
    private let keychainService = KeychainService.shared
    
    static let shared = AuthService()
    
    init() {
        self.idToken = keychainService.idToken
    }
    
    @Published var idToken: String? = nil
    
    var isLoggedIn: Bool {
        idToken != nil
    }
    
    func login(body: Auth.Login.Request) async throws {
        let result = try await httpClient.post("/user/v1/login", body: body, responseType: Auth.Login.Response.self)
        
        keychainService.idToken = result.idToken
        keychainService.refreshToken = result.refreshToken
        DispatchQueue.main.async {
            self.idToken = result.idToken
        }
    }
    
    func refreshToken() async throws {
        let result:Auth.RefreshToken.Response = try await httpClient.post("/user/v1/refreshToken", body: Auth.RefreshToken.Request(refreshToken: keychainService.refreshToken!), responseType: Auth.RefreshToken.Response.self)
        
        keychainService.idToken = result.idToken
    }
    
    func logout() {
        keychainService.idToken = nil
        keychainService.refreshToken = nil
        DispatchQueue.main.async {
            self.idToken = nil
        }
    }
}
