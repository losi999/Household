//
//  IconTextButton.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 01..
//

import SwiftUI

enum ButtonColor {
  case primary
  case secondary
  case success
  case danger

  var text: Color {
    switch self {
    case .primary: .appPrimary
    case .secondary: .appText
    case .success: .appSuccess
    case .danger: .appDanger
    }
  }

  var fill: Color {
    switch self {
    case .primary: .appPrimary
    case .secondary: .appSecondary
    case .success: .appSuccess
    case .danger: .appDanger
    }
  }

  var accentText: Color {
    switch self {
    case .primary: Color.white
    case .secondary: .appText
    case .success: Color.white
    case .danger: Color.white
    }
  }
}

enum ButtonStyle {
  case flat
  case filled
  case outlined
  case compact
}

struct IconTextButton: View {
  @State private var isPressed = false

  let label: String?
  let icon: String?
  let style: ButtonStyle
  let color: ButtonColor
  let action: () -> Void

  init(
    label: String,
    style: ButtonStyle = .flat,
    color: ButtonColor = .primary,
    action: @escaping () -> Void
  ) {
    self.label = label
    self.icon = nil
    self.action = action
    self.style = style
    self.color = color
  }

  init(
    icon: String,
    style: ButtonStyle = .flat,
    color: ButtonColor = .primary,
    action: @escaping () -> Void
  ) {
    self.label = nil
    self.icon = icon
    self.action = action
    self.style = style
    self.color = color
  }

  init(
    label: String,
    icon: String,
    style: ButtonStyle = .flat,
    color: ButtonColor = .primary,
    action: @escaping () -> Void
  ) {
    self.label = label
    self.icon = icon
    self.action = action
    self.style = style
    self.color = color
  }

  var body: some View {
    Button(
      action: action,
      label: {
        HStack {
          if let icon {
            Image(systemName: icon)
              .frame(width: 20, height: 20)
          }
          if let label {
            Text(label)
          }
        }
        .padding(style == .compact ? 0 : 16)
        .foregroundStyle(
          style == .filled ? color.accentText : color.text
        )
        .background(
          Group {
            switch style {
            case .flat, .compact:
              Color.clear
            case .filled:
              if label == nil {
                Circle().fill(color.fill)
              } else {
                RoundedRectangle(cornerRadius: 10).fill(color.fill)
              }
            case .outlined:
              if label == nil {
                Circle().stroke(color.text, lineWidth: 1)
              } else {
                RoundedRectangle(cornerRadius: 10).stroke(color.text, lineWidth: 1)
              }
            }
          }
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
