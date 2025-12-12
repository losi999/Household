//
//  KeychainService.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 29..
//

import Foundation
import KeychainAccess
import Combine

final class KeychainService {
    private let keychain = Keychain(service: "losi999.Hairdressing")
    
    init() {
        _idToken = try? keychain.get("idToken")
        _refreshToken = try? keychain.get("refreshToken")
    }
    
    private var _idToken: String?
    
    var idToken: String? {
        get { _idToken }
        set {
            _idToken = newValue
            guard newValue != nil else {
                try? keychain.remove("idToken")
                return
            }
            
            try? keychain.set(newValue!, key: "idToken")
        }
    }
    
    private var _refreshToken: String?
    
    var refreshToken: String? {
        get { _refreshToken }
        set {
            _refreshToken = newValue
            guard newValue != nil else {
                try? keychain.remove("refreshToken")
                return
            }
            
            try? keychain.set(newValue!, key: "refreshToken")
        }
    }
}
