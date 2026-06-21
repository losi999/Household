//
//  FormField2.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 11..
//

import SwiftUI

struct FormField<Value, Content: FormInput<Value>>: View {
  @ObservedObject var formControl: FormControl<Value>
  let content: Content

  init(@ViewBuilder content: () -> Content) {
    let cont = content()
    self.content = cont
    self.formControl = cont.formControl
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
    VStack(alignment: .leading) {
      content
        .padding(.leading)
        .padding(.trailing)
        .foregroundColor(.appText)
        .frame(height: 55)
        .focused($isTyping)
        .background(highlightColor, in: RoundedRectangle(cornerRadius: 14).stroke(lineWidth: 2))
        .overlay(alignment: .leading) {
          Text("\(content.title)\(formControl.isRequired ? "*" : "")")
            .padding(.leading)
            .foregroundStyle(highlightColor)
            .offset(
              y: isTyping || !content.textValue.isEmpty ? -18 : 0
            )
            .font(
              isTyping || !content.textValue.isEmpty ? .footnote : .callout
            )
            .onTapGesture {
              isTyping = true
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
          isTyping = true
        }
        .onChange(of: isTyping) {_, newValue in
          if !newValue {
            formControl.touch()
          }
        }
      FormErrors(formControl: formControl)
    }
  }
}
