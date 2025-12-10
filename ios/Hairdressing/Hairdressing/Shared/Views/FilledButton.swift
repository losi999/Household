//
//  MaterialButton.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 02..
//

import SwiftUI

enum ColorStyle {
  case primary
  case secondary
  case success
  case danger

  var colors: (background: Color, foreground: Color) {
    switch self {
    case .primary: return (.appPrimary, Color.white)
    case .secondary: return (.clear, Color.black)
    case .success: return (.appSuccess, Color.white)
    case .danger: return (.appDanger, Color.white)
    }
  }
}

struct FilledButton: View {
  @State private var isPressed = false
//  @State private var isDisabled = false

  let title: String
  var style: ColorStyle
  var icon: String? = nil
  let action: () -> Void

  var body: some View {
    Button(action: action, label: {
      Group {
        if let icon {
          Label(title, systemImage: icon)
        } else {
          Text(title)
        }
      }
      .fontWeight(.medium)
      .foregroundStyle(style.colors.foreground)
      .padding()
      .background(
        RoundedRectangle(cornerRadius: 8)
          .fill(style.colors.background)
      )
    })
    .scaleEffect(isPressed ? 0.97 : 1.0)
    .animation(.easeInOut(duration: 0.1), value: isPressed)
    .simultaneousGesture(
      DragGesture(minimumDistance: 0)
        .onChanged { _ in
          isPressed = true
        }
        .onEnded { _ in
          isPressed = false
        }
    )
  }
}

