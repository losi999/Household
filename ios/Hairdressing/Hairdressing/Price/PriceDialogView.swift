//
//  PriceDialogView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct PriceDialogView: View, Actionable, Titled {
  @State var name: String = ""
  @State var amount: Int = 0
  @State var unitOfMeasurement: PriceUnitOfMeasurement = .count

  var title: String

  func actions(onClosed: @escaping (Any?) -> Void) -> AnyView {
    AnyView(
      HStack {
        FilledButton(title: "Mentés", style: .primary) {
          onClosed("request object")
        }
        FilledButton(title: "Mégse", style: .secondary) {
          onClosed(nil) 
        }
      }
    )
  }

  var body: some View {
    VStack(alignment: .leading) {
      ClearableInput(title:"Név", type: .text, text: $name)
        .padding()
    }
    .background(.red)
    .frame(width: 400)
  }
}

#Preview {
  PriceDialogView(title: "Új")
}
