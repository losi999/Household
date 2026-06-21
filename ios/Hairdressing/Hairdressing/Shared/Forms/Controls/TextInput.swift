//
//  TextInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 10..
//

import SwiftUI

enum TextInputType {
  case text
  case email
  case password
}

struct TextInput: View, FormInput {
  let title: String
  var type: TextInputType
  @ObservedObject internal var formControl: FormControl<String>

  var textValue: String {
    formControl.value
  }


  init(title: String, formControl: FormControl<String>, type: TextInputType) {
    self.title = title
    self.formControl = formControl
    self.type = type
  }

  var keyboardType: UIKeyboardType {
    switch type {
    case .email:
        .emailAddress
    default:
        .default
    }
  }

  var body: some View {
    Group {
      if type == .password {
        SecureField("", text: $formControl.value)
      } else {
        TextField("", text: $formControl.value)
      }
    }
    .onChange(of: formControl.value) {_,_ in
      formControl.validate()
    }
    .keyboardType(keyboardType)
    .textInputAutocapitalization(.never)
    .disableAutocorrection(true)
  }
}
