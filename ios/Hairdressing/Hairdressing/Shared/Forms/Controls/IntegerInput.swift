//
//  IntegerInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 10..
//

import SwiftUI

struct IntegerInput: View, FormInput {
  let title: String
  @ObservedObject internal var formControl: FormControl<Int>

  @State private var textFieldValue: String

  var textValue: String {
    textFieldValue
  }

  init(title: String, formControl: FormControl<Int>) {
    self.title = title
    self.formControl = formControl
    self.textFieldValue = String(formControl.value)
  }
  
  var body: some View {
    TextField("", text: $textFieldValue)
      .onChange(of: textFieldValue) {_,newValue in
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
        
        if let number = Int(filtered) {
          formControl.value = number
          filtered = String(number)
        } else {
          formControl.value = 0
        }
        
        if filtered != newValue {
          DispatchQueue.main.async {
            self.textFieldValue = filtered
          }
        }
        
        formControl.validate()
      }
      .keyboardType(.numberPad)
      .textInputAutocapitalization(.never)
      .disableAutocorrection(true)
  }
}
