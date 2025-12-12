//
//  CustomerHomeView.swift
//  Household
//
//  Created by Laszlo Losonczi on 2025. 11. 27..
//

import SwiftUI

struct CustomerHomeView: View {
  @EnvironmentObject private var customerService: CustomerService
  @EnvironmentObject private var dialogService: DialogService

  func loadCustomers() async {
    do {
      try await customerService.listCustomers()
    } catch {
      print(error)
    }
  }

  var body: some View {
    VStack {
      CustomerListView(customers: customerService.customers)
    }
    .padding()
    .onAppear{
      Task {
        await loadCustomers()
      }
    }
    .appToolbar("Vendégek")
  }
}

