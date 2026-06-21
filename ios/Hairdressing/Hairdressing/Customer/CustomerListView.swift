//
//  PriceList.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct CustomerListView: View {
  var customers: [Customer.Response] = []

  var body: some View {
    List(customers) { customer in
      CustomerListItemView(customer: customer)
    }
    .scrollContentBackground(.hidden)
  }
}
