//
//  IntegerInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 04..
//

import SwiftUI

struct IntegerInput: View {
  let title: String
  @Binding var value: Int
  var validators: [Validator] = []

  @State private var text: String = "";

    var body: some View {
      TextInput(title: title, text: $text, validators: validators)
        .keyboardType(.numberPad)
        .onChange(of: text) { _, newValue in
          var filtered = ""

          for (index, char) in newValue.enumerated() {
            if char.isNumber {
              filtered.append(char)
              continue
            }

            if index == 0 && char == "-" {
              filtered.append(char)
              continue
            }
          }

          if filtered != newValue {
            DispatchQueue.main.async {
              self.text = filtered
            }
          }
          value = Int(filtered) ?? 0
        }
    }
}
