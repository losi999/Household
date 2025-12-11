//
//  BorderedPicker.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 09..
//

import SwiftUI

struct StringPicker: View, FormInput {
  let title: String
  var items: [String]
  @ObservedObject internal var formControl: FormControl<String>

  var textValue: String {
    formControl.value
  }

  init(title: String, items: [String], formControl: FormControl<String>) {
    self.title = title
    self.items = items
    self.formControl = formControl
  }

  var body: some View {
    Menu {
      Picker(title, selection: $formControl.value) {
        ForEach(items, id: \.self) { unit in
          Text(unit)
        }
      }
      .onChange(of: formControl.value) {_,_ in
        formControl.validate()
      }
    } label: {
      HStack {
        Text(formControl.value)
          .foregroundColor(.appText)
        Spacer()
        Image(systemName: "chevron.down")
          .foregroundColor(.gray)
      }
    }
  }
}
