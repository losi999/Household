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

struct TextInput : View {
  let title: String
  @Binding var text: String
  var type: TextInputType? = nil
  var validators: [Validator] = []

  var keyboardType: UIKeyboardType {
    switch type {
    case .email:
        .emailAddress
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
      if isRequired && text.isEmpty {
        errors.append("required")
      }
    }

    return errors
  }

  @State private var isTouched: Bool = false
  private var isInvalid: Bool {
    errors.count > 0
  }

  private var selectionColor: Color {
    if isInvalid && isTouched {
      return .red
    }

    if isTyping {
      return  .blue
    }

    return .appText
  }

  var body: some View {
    Group {
      switch type {
      case .password:
        SecureField("", text: $text)
      default:
        TextField("", text: $text)
      }
    }
    .padding(.leading)
    .padding(.trailing)
    .textInputAutocapitalization(.never)
    .disableAutocorrection(true)
    .foregroundColor(.appText)
    .frame(height: 55)
    .focused($isTyping)
    .background(selectionColor, in: RoundedRectangle(cornerRadius: 14).stroke(lineWidth: 2))
    .overlay(alignment: .leading) {
      Text("\(title)\(isRequired ? "*" : "")")
        .padding(.leading)
        .foregroundStyle(selectionColor)
        .offset(y: isTyping || !text.isEmpty ? -18 : 0)
        .font(isTyping || !text.isEmpty ? .footnote : .callout)
        .onTapGesture {
          isTyping = true
        }
    }
    .padding(2)
    .animation(.linear(duration: 0.1), value: isTyping)
    .onChange(of: isTyping) {_, newValue in
      if !newValue {
        isTouched = true
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
