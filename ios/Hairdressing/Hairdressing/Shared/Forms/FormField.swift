//
//  FormField.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 10..
//

import SwiftUI

struct FormField<T>: ViewModifier {
  let title: String
  @ObservedObject var formControl: FormControl<T>
  var textFieldValue: String

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

  func body(content: Content) -> some View {
    content
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
          .offset(
            y: isTyping || !textFieldValue.isEmpty ? -18 : 0
          )
          .font(
            isTyping || !textFieldValue.isEmpty ? .footnote : .callout
          )
          .onTapGesture {
            isTyping = true
          }
      }
      .contentShape(Rectangle())
      .onTapGesture {
        isTyping = true
      }
      .animation(.linear(duration: 0.1), value: isTyping)
      .onChange(of: isTyping) {_, newValue in
        if !newValue {
          formControl.touch()
        }
      }
  }
}

extension View {
  func formField<T>(title: String, formControl: FormControl<T>, textFieldValue: String ) -> some View {
    self.modifier(
      FormField(
        title: title,
        formControl: formControl,
        textFieldValue: textFieldValue
      )
    )
  }
}
