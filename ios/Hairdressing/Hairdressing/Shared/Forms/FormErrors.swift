//
//  FormErrors.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 09..
//

import SwiftUI

struct FormErrors<T: Validatable>: View {
  @ObservedObject var formControl: T

  var body: some View {
    if formControl.isTouched {
      ForEach(formControl.errors, id: \.self) {error in
        Text(error)
          .foregroundStyle(.red)
          .font(.footnote)
      }
    }
  }
}
