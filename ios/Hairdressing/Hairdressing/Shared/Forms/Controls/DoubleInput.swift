//
//  DoubleInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 10..
//

import SwiftUI

struct DoubleInput: View {
  let title: String
  @ObservedObject private var formControl: FormControl<Double>
  
  @State private var textFieldValue: String
  
  init(title: String, formControl: FormControl<Double>) {
    self.title = title
    self.formControl = formControl
    self.textFieldValue = String(formControl.value)
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
    TextField("", text: $textFieldValue)
      .onChange(of: textFieldValue) {_,newValue in
        var filtered = ""
        var hasDecimals = false
        var hasLeadingZero = false
        
        for (index, char) in newValue.enumerated() {
          if index == 0 && char == "-" {
            filtered.append(char)
            continue
          }
          
          if !hasLeadingZero && !hasDecimals && char == "0" {
            filtered.append(char)
            hasLeadingZero = true
            continue
          }
          
          if !hasLeadingZero && char.isNumber {
            filtered.append(char)
            continue
          }
          
          if !hasDecimals && [",", "."].contains(char) {
            hasDecimals = true
            hasLeadingZero = false
            filtered.append(char)
            continue
          }
        }
        
        if let number = Double(filtered.replacingOccurrences(of: ",", with: ".")) {
          formControl.value = number
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
      .keyboardType(.numbersAndPunctuation)
      .textInputAutocapitalization(.never)
      .disableAutocorrection(true)
      .formField(
        title: title,
        formControl: formControl,
        textFieldValue: textFieldValue
      )
  }
}
