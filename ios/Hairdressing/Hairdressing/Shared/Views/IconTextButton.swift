//
//  IconTextButton.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 01..
//

import SwiftUI

struct IconTextButton: View {
  let label: String
  let icon: String
  let action: () -> Void

  var body: some View {
    Button(action:action, label: {
      Label(label, systemImage: icon)
        .frame(maxWidth: .infinity, alignment: .leading)
    })
    .padding(.vertical, 5)
  }
}
