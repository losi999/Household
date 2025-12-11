//
//  HairdressingApp.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 27..
//

import SwiftUI
import Combine

@main
struct HairdressingApp: App {
  @StateObject private var authService: AuthService
  @StateObject private var priceService: PriceService
  @StateObject private var customerService: CustomerService
  @StateObject private var dialogService: DialogService

  init () {
    let keychainService = KeychainService()
    let httpClient = HttpClient(keychainService: keychainService)

    _authService = StateObject(wrappedValue: AuthService(httpClient: httpClient, keychainService: keychainService))
    _priceService = StateObject(wrappedValue: PriceService(httpClient: httpClient))
    _dialogService = StateObject(wrappedValue: DialogService())
    _customerService = StateObject(wrappedValue: CustomerService(httpClient: httpClient))
  }

  var body: some Scene {
    WindowGroup {
      NavigationStack {
        ZStack {
          Color(.appBackground)
          Group {

            if authService.isLoggedIn {
              CustomerHomeView()
            } else {
              LoginView()
            }
          }
        }
      }
      .overlay(alignment: .center) {
        Dialog()
      }
      .environmentObject(authService)
      .environmentObject(priceService)
      .environmentObject(customerService)
      .environmentObject(dialogService)
    }
  }
}
