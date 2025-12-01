//
//  HairdressingApp.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 27..
//

import SwiftUI

@main
struct HairdressingApp: App {
    @StateObject private var authService = AuthService.shared
    
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                ZStack {
                    Color(.appBackground).ignoresSafeArea()
                    if authService.isLoggedIn {
                        PriceHomeView()
                    } else {
                        LoginView()
                    }
                }
            }
        }
    }
}
