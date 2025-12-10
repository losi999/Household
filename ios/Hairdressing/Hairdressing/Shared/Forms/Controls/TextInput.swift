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

struct TextInput: View {
  let title: String
  var type: TextInputType
  @ObservedObject private var formControl: FormControl<String>
  
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
    .formField(
      title: title,
      formControl: formControl,
      textFieldValue: formControl.value
    )
  }
}
