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

struct BorderedInput : View {
  let title: String
  let type: TextInputType?
  var keyboardType: UIKeyboardType = .default

//  @Binding var text: String
//  @Binding var number: Double
  @Binding var value: Any
  @FocusState var isTyping: Bool

//  init(title: String, type: TextInputType, text: Binding<String>) {
//    self.title = title
//    self._text = text
//    self.type = type
//    self._number = .constant(0)
//  }
//
//  init(title: String, number: Binding<Double>) {
//    self.title = title
//    self._number = number
//    self.type = nil
//    self._text = .constant("")
//  }

  var body: some View {
    Group {
//      switch type {
//      case nil:
//      TextField("", value: $value, format: .)
//      case .password:
//        SecureField("", text: $text)
//      default:
//        TextField("", text: $text)
//      }
//      if let type = self.type {
//        if type == .password {
//          SecureField("", text: $text)
//            .keyboardType(keyboardType)
//        } else {
//          TextField("", text: $text)
//            .keyboardType(keyboardType)
//        }
//      } else {
//        TextField("", text: $number, format:.number)
//          .keyboardType(.numberPad)
//      }
    }
//    .padding(.leading)
//    .padding(.trailing)
//    .textInputAutocapitalization(.never)
//    .disableAutocorrection(true)
//    .foregroundColor(.appText)
//    .frame(height: 55)
//    .focused($isTyping)
//    .background(isTyping ? .blue : .appText, in: RoundedRectangle(cornerRadius: 14).stroke(lineWidth: 2))
//    .overlay(alignment: .leading) {
//      Text(title)
//        .padding(.leading)
//        .foregroundStyle(isTyping ? .blue : .appText)
//        .offset(y: isTyping || !text.isEmpty ? -18 : 0)
//        .font(isTyping || !text.isEmpty ? .footnote : .callout)
//        .onTapGesture {
//          isTyping = true
//        }
//    }
//    .padding(2)
//    .animation(.linear(duration: 0.1), value: isTyping)
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
