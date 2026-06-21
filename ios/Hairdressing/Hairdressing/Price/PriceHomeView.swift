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
          PriceDialogView(title: "Új", form: PriceDialogForm())
        }
        onClosed: {result in
          if let request = result as? Price.Request {
            Task {
              do {
                try await priceService.createPrice(body: request)
              } catch {
                print("ERROR", error)
              }
            }
          }
        }
      }, label: "plus"),
    ])

  }
}
#Preview {
  PriceHomeView()
}
