//
//  ClearableInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import SwiftUI
import Combine

enum TextInputType {
  case text
  case email
  case password
  case integer
  case double
}

struct BorderedInput : View {
  let title: String
  var type: TextInputType

  @State private var textFieldValue: String
  @Binding private var stringValue: String
  @Binding private var integerValue: Int
  @Binding private var doubleValue: Double
  private var formControl: any Validatable

  init(title: String, formControl: Binding<FormControl<String>>, type: TextInputType) {
    self.title = title
    self.type = type
    self._stringValue = formControl.value
    self._integerValue = .constant(0)
    self._doubleValue = .constant(0)
    self.textFieldValue = formControl.wrappedValue.value
    self.formControl = formControl.wrappedValue
  }

  init(title: String, formControl: Binding<FormControl<Int>>) {
    self.title = title
    self.type = .integer
    self._integerValue = formControl.value
    self._stringValue = .constant("")
    self._doubleValue = .constant(0)
    self.textFieldValue = String(formControl.wrappedValue.value)
    self.formControl = formControl.wrappedValue
  }

  init(title: String, formControl: Binding<FormControl<Double>>) {
    self.title = title
    self.type = .double
    self._doubleValue = formControl.value
    self._stringValue = .constant("")
    self._integerValue = .constant(0)
    self.textFieldValue = formControl.wrappedValue.value.formatted(.number)
    self.formControl = formControl.wrappedValue
  }

  var keyboardType: UIKeyboardType {
    switch type {
    case .email:
        .emailAddress
    case .integer:
        .numberPad
    case .double:
        .numbersAndPunctuation
    default:
        .default
    }
  }

  @FocusState var isTyping: Bool

  private var highlightColor: Color {
    if !formControl.isValid && formControl.isTouched {
      return .red
    }

    if isTyping {
      return  .blue
    }

    return .appText
  }

  private func updateBinding(with newValue: String) {
    switch type {
    case .integer:
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

      let number = Int(filtered) ?? 0
      filtered = String(number)

      if filtered != newValue {
        DispatchQueue.main.async {
          self.textFieldValue = filtered
        }
      }

      integerValue = number
    case .double:
      var filtered = ""
      var hasDecimals = false

      for (index, char) in newValue.enumerated() {
        if char.isNumber {
          filtered.append(char)
          continue
        }

        if !hasDecimals && [",", "."].contains(char) {
          hasDecimals = true
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
          self.textFieldValue = filtered
        }
      }
      
      let number = Double(filtered.replacingOccurrences(of: ",", with: ".")) ?? 0

      doubleValue = number
    default:
      stringValue = newValue
    }
  }

  var body: some View {
    VStack(alignment: .leading) {
      Group {
        switch type {
        case .password:
          SecureField("", text: $textFieldValue)
        default:
          TextField("", text: $textFieldValue)
        }
      }
      .onChange(of: textFieldValue) { _, newValue in
        updateBinding(with: newValue)
        formControl.validate(name: title)
      }
      .keyboardType(keyboardType)
      .padding(.leading)
      .padding(.trailing)
      .textInputAutocapitalization(.never)
      .disableAutocorrection(true)
      .foregroundColor(.appText)
      .frame(height: 55)
      .focused($isTyping)
      .background(highlightColor, in: RoundedRectangle(cornerRadius: 14).stroke(lineWidth: 2))
      .overlay(alignment: .leading) {
        Text("\(title)\(formControl.isRequired ? "*" : "")")
          .padding(.leading)
          .foregroundStyle(highlightColor)
          .offset(y: isTyping || !textFieldValue.isEmpty ? -18 : 0)
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
      .padding(2)
      .animation(.linear(duration: 0.1), value: isTyping)
      .onChange(of: isTyping) {_, newValue in
        if !newValue {
          formControl.touch(name: title)
        }
      }
    }
  }
}

#Preview {
  PreviewWrapper()
}

private struct PreviewWrapper: View {
  @State private var text1: String = "sampledjkhsa ldkjhsalk djsakldj asdjk hsjkldh aslkjdh kjsahdjkl sahdkljsahDLkJ SAHKDJL HSAJKLD HASLkJDHAS LKjHDSALKj DHLK ékldj aékslj lkésjd éklsaj"
  @State private var text2: String = ""

  var body: some View {
    //    BorderedInput(title: "Név", type: .text, text: $text1)
    //    BorderedInput(title: "Név", type: .text, text: $text2)
  }
}
