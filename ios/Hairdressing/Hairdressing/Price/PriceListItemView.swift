//
//  PriceListItemView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct PriceListItemView: View {
  var price: Price.Response

  var amountSuffix: String {
    price.unitOfMeasurement == .db ? "" : " / \(price.unitOfMeasurement.rawValue)"
  }

  @State var showMenu: Bool = false
  @State var showDeleteConfirmation: Bool = false

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
          print("editing", price.priceId)
        default:
          break
        }
      }
      .foregroundStyle(.appText)
      .background(.appBackground)
    }
    .alert(
      "Törölni akarod ezt a tételt az árlistából",
      isPresented: $showDeleteConfirmation,
      actions: {
        Button("Igen", role: .destructive) {
          print("deleting", price.priceId)
        }
        Button("Nem", role: .cancel) {}
          .foregroundStyle(.white)
      }, message: {
        Text(price.name)
      }
    )
  }
}
