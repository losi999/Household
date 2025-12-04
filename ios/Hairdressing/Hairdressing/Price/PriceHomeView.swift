//
//  CustomerHomeView.swift
//  Household
//
//  Created by Laszlo Losonczi on 2025. 11. 27..
//

import SwiftUI

struct PriceHomeView: View {
  @EnvironmentObject private var priceService: PriceService
  @EnvironmentObject private var dialogService: DialogService

  func loadPrices() async {
    do {
      try await priceService.listPrices()
    } catch {
      print(error)
    }
  }

  var body: some View {
    ZStack{
      PriceListView(prices: priceService.prices)
    }
    .onAppear{
      Task {
        await loadPrices()
      }
    }
    .appToolbar("Árlista", actionButtons: [
      ToolbarButton(action: {
        dialogService.open() {
          PriceDialogView(title: "Új", model: PriceDialogViewModel())
        }
        onClosed: {result in
          if let result {
            print("price home", result)
          } else {
            print("print home", "no result")
          }
        }
      }, label: "plus"),
    ])

  }
}
#Preview {
  PriceHomeView()
}
