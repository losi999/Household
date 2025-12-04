//
//  PriceListItemView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct PriceListItemView: View {
  @EnvironmentObject private var priceService: PriceService
  @EnvironmentObject private var dialogService: DialogService

  var price: Price.Response

  var amountSuffix: String {
    price.unitOfMeasurement == .count ? "" : " / \(price.unitOfMeasurement.rawValue)"
  }

  @State var showMenu: Bool = false
  @State var showDeleteConfirmation: Bool = false

  func onDeletePrice(priceId: Price.Id) async throws {
    try await priceService.deletePrice(priceId: priceId)
  }

  var body: some View {
    VStack(alignment: .leading) {
      Text(price.name)
        .font(.headline)
      Text("\(price.amount) Ft\(amountSuffix)")
        .font(.subheadline)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .foregroundStyle(.black)
    .listRowInsets(EdgeInsets())
    .listRowBackground(Color.appBackground)
    .contentShape(Rectangle())
    .padding(.vertical, 8)
    .onTapGesture {
      showMenu.toggle()
    }
    .popover(isPresented: $showMenu) {
      CatalogSubmenu(title: price.name, hideMerge: true) {result in
        showMenu.toggle()
        switch result {
        case .delete:
          showDeleteConfirmation = true
        case .edit:
          dialogService.open() {
            PriceDialogView(title: "Szerkesztés", model: PriceDialogViewModel(price: price))
          }
        default:
          break
        }
      }
      .presentationCompactAdaptation(.popover)
      .foregroundStyle(.appText)
      .background(.appBackground)
    }
    .alert(
      "Törölni akarod ezt a tételt az árlistából",
      isPresented: $showDeleteConfirmation,
      actions: {
        Button("Igen", role: .destructive) {
          Task {
            try await onDeletePrice(priceId: price.priceId)
          }
        }
        Button("Nem", role: .cancel) {}
      }, message: {
        Text(price.name)
      }
    )
  }
}
