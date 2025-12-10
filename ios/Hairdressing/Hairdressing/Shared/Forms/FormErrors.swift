//
//  FormErrors.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 09..
//

import SwiftUI
import Combine

struct FormErrors<T: Validatable>: ViewModifier {
  @ObservedObject var formControl: T

  func body(content: Content) -> some View {
    VStack(alignment: .leading) {
      content
      if formControl.isTouched {
        ForEach(formControl.errors, id: \.self) {error in
          Text(error)
            .foregroundStyle(.red)
            .font(.footnote)
        }
      }
    }
  }
}

extension View {
  func formErrors<T: Validatable>(formControl: T) -> some View {
    self.modifier(FormErrors(formControl: formControl))
  }
}
