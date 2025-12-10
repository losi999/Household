//
//  KeyboardResponder.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 02..
//

import Foundation
import Combine
import SwiftUI

final class KeyboardResponder: ObservableObject {
  @Published var height: CGFloat = 0

  init() {
//    NotificationCenter.default.addObserver(
//      forName: UIResponder.keyboardWillShowNotification,
//      object: nil,
//      queue: .main
//    ) { notification in
//      self.height = (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect)?.height ?? 0
//    }
//
//    NotificationCenter.default.addObserver(
//      forName: UIResponder.keyboardWillHideNotification,
//      object: nil,
//      queue: .main
//    ) { _ in
//      self.height = 0
//    }
  }
}
