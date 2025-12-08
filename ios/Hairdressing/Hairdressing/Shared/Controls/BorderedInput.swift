//
//  ClearableInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import SwiftUI

enum TextInputType {
  case text
  case email
  case password
  case integer
  case double
}

enum Validator : Equatable{
  case required
  case exclusiveMin(Int)
  case min(Int)
  case exclusiveMax(Int)
  case max(Int)
  case minLength(Int)
  case maxLength(Int)
  case pattern(String)
}

struct BorderedInput : View {
  let title: String
  var type: TextInputType
  var validators: [Validator] = []

  @State private var textFieldValue: String
  @Binding private var stringValue: String
  @Binding private var integerValue: Int
  @Binding private var doubleValue: Double

  init(
    title: String,
    value: Binding<String>,
    type: TextInputType, validators: [Validator] = []
  ) {
    self.title = title
    self.type = type
    self.validators = validators
    self._stringValue = value
    self._integerValue = .constant(0)
    self._doubleValue = .constant(0)
    self.textFieldValue = value.wrappedValue
  }

  init(title: String, value: Binding<Int>, validators: [Validator] = []) {
    self.title = title
    self.type = .integer
    self.validators = validators
    self._integerValue = value
    self._stringValue = .constant("")
    self._doubleValue = .constant(0)
    self.textFieldValue = String(value.wrappedValue)
  }

  init(title: String, value: Binding<Double>, validators: [Validator] = []) {
    self.title = title
    self.type = .double
    self.validators = validators
    self._doubleValue = value
    self._stringValue = .constant("")
    self._integerValue = .constant(0)
    self.textFieldValue = value.wrappedValue.formatted(.number)
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

  private var isRequired: Bool {
    validators.contains(.required)
  }

  private var errors: [String] {
    var errors: [String] = []
    if isTouched {
      if isRequired && textFieldValue.isEmpty {
        errors.append("required")
      }
    }

    return errors
  }

  @State private var isTouched: Bool = false
  private var isInvalid: Bool {
    errors.count > 0
  }

  private var highlightColor: Color {
    if isInvalid && isTouched {
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
            .onChange(of: textFieldValue) { _, newValue in
              updateBinding(with: newValue)
            }
        }
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
        Text("\(title)\(isRequired ? "*" : "")")
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
          isTouched = true
        }
      }
      ForEach(errors, id: \.self) {error in
        Text(error)
          .foregroundStyle(.red)
          .font(.footnote)
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
