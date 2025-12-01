//
//  CustomerHomeView.swift
//  Household
//
//  Created by Laszlo Losonczi on 2025. 11. 27..
//

import SwiftUI

struct PriceHomeView: View {
  @StateObject private var priceService = PriceService.shared

  @State private var prices: [Price.Response] = []

  @State private var showModal: Bool = false;

  func loadPrices() async {
    do {
      let result = try await priceService.listPrices()
      prices = result
    } catch {
      print(error)
    }
  }

  var body: some View {
    ZStack{
      PriceListView(prices: prices)
    }
    .sheet(isPresented: $showModal) {
      PriceDialogView() {
        showModal.toggle()
      }
      .presentationBackground(.appBackground)
      .presentationDetents([.medium])
      .interactiveDismissDisabled(true)
    }
    .onAppear{
      Task {
        await loadPrices()
      }
    }
    .appToolbar("Árlista", actionButtons: [
      ToolbarButton(action: {
        showModal.toggle()
      }, label: "plus"),
    ])

  }
}
#Preview {
  PriceHomeView()
}
