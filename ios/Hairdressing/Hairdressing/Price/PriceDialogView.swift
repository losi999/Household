//
//  PriceDialogView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI
import Combine

final class PriceDialogViewModel: ObservableObject {
  @Published var name: String
  @Published var amount: Int
  @Published var unitOfMeasurement: PriceUnitOfMeasurement

  init() {
    name = ""
    amount = 0
    unitOfMeasurement = .count
  }

  init(price: Price.Response) {
    name = price.name
    amount = price.amount
    unitOfMeasurement = price.unitOfMeasurement
  }
}

struct PriceDialogView: View, Actionable, Titled {

  var title: String
  @ObservedObject var model: PriceDialogViewModel

  func actions(onClosed: @escaping (Any?) -> Void) -> AnyView {
    AnyView(
      HStack {
        FilledButton(title: "Mentés", style: .primary) {
          onClosed(
            Price.Request(
              name: model.name,
              amount: model.amount,
              unitOfMeasurement: model.unitOfMeasurement
            )
          )
        }
        FilledButton(title: "Mégse", style: .secondary) {
          onClosed(nil)
        }
      }
    )
  }

  var body: some View {
    VStack(alignment: .leading) {
      BorderedInput(
        title: "Név",
        value: $model.name,
        type: .text,
        validators: [.required, .minLength(3)]
      )
      BorderedInput(
        title: "Ár",
        value: $model.amount,
        validators: [.required, .exclusiveMin(0)]
      )
    }
    .frame(width: 400)
  }
}

#Preview {
  PriceDialogView(title: "Új", model: PriceDialogViewModel())
}
