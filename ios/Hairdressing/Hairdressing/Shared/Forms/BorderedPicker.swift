//
//  BorderedPicker.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 09..
//

import SwiftUI

protocol PickerOption: Hashable {
  var displayValue: String { get }
}

extension String: PickerOption {
  var displayValue: String { self }
}

extension RawRepresentable where RawValue == String, Self: Hashable {
  var displayValue: String { rawValue }
}

struct BorderedPicker<T: PickerOption>: View {
  let title: String
  var items: [T]
  @ObservedObject private var formControl: FormControl<T>

  init(title: String, items: [T], formControl: Binding<FormControl<T>>) {
    self.title = title
    self.items = items
    self.formControl = formControl.wrappedValue
  }

  @FocusState var isTyping: Bool

  private var highlightColor: Color {
    if !formControl.isValid && formControl.isTouched {
      return .red
    }

    if isTyping {
      return .blue
    }

    return .appText
  }

  var body: some View {
    Menu {
      Picker(title, selection: $formControl.value) {
        ForEach(items, id: \.self) { unit in
          Text(unit.displayValue)
        }
      }
    } label: {
      HStack {
        Text(formControl.value.displayValue)
          .foregroundColor(.primary)
        Spacer()
        Image(systemName: "chevron.down")
          .foregroundColor(.gray)
      }
    }
    .padding(.leading)
    .padding(.trailing)
    .foregroundColor(.appText)
    .frame(height: 55)
    .focused($isTyping)
    .background(highlightColor, in: RoundedRectangle(cornerRadius: 14).stroke(lineWidth: 2))
    .overlay(alignment: .leading) {
      Text("\(title)\(formControl.isRequired ? "*" : "")")
        .padding(.leading)
        .foregroundStyle(highlightColor)
        .offset(y: -18)
        .font( .footnote)
      //          .onTapGesture {
      //            isTyping = true
      //          }
    }
    .contentShape(Rectangle())
  }
}
