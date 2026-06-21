//
//  EnumPicker.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 10..
//

import SwiftUI

struct EnumPicker<T: CaseIterable & Hashable & RawRepresentable<String>>: View, FormInput {
  let title: String
  var items: [T]
  @ObservedObject internal var formControl: FormControl<T>

  var textValue: String {
    formControl.value.rawValue
  }

  init(
    title: String,
    formControl: FormControl<T>
  ) {
    self.title = title
    self.items = Array(T.allCases)
    self.formControl = formControl
  }

  var body: some View {
    Menu {
      Picker(title, selection: $formControl.value) {
        ForEach(items, id: \.self) { item in
          Text(item.rawValue).tag(item.rawValue)
        }
      }
      .onChange(of: formControl.value) {_,_ in
        formControl.validate()
      }
    } label: {
      HStack {
        Text(formControl.value.rawValue)
          .foregroundColor(.appText)
        Spacer()
        Image(systemName: "chevron.down")
          .foregroundColor(.gray)
      }
    }
  }
}
