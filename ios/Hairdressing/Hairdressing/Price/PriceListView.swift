//
//  PriceList.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct PriceListView: View {
  var prices: [Price.Response] = []

  var body: some View {
    List(prices) { price in
      PriceListItemView(price: price)
    }
    .scrollContentBackground(.hidden)
  }
}
