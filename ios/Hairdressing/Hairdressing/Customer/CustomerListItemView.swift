//
//  PriceListItemView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct CustomerListItemView: View {
  @EnvironmentObject private var customerService: CustomerService
  @EnvironmentObject private var dialogService: DialogService

  var customer: Customer.Response


  @State var showMenu: Bool = false
  @State var showDeleteConfirmation: Bool = false

//  func onDeletePrice(priceId: Price.Id) async throws {
//    try await priceService.deletePrice(priceId: priceId)
//  }

  var body: some View {
    VStack(alignment: .leading) {
      Text(customer.name)
        .font(.headline)
//      Text("\(price.amount) Ft\(amountSuffix)")
//        .font(.subheadline)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .foregroundStyle(.black)
    .listRowInsets(EdgeInsets())
    .listRowBackground(Color.appBackground)
    .contentShape(Rectangle())
    .padding(.vertical, 8)
  }
}
