//
//  DialogService.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 02..
//

import Foundation
import Combine
import SwiftUI

final class DialogService: ObservableObject{
  @Published public private(set) var title: String?
  @Published public private(set) var isOpened: Bool = false
  @Published public private(set) var content: AnyView?
  @Published public private(set) var actions: ((@escaping (Any?) -> Void) -> AnyView)?
  var onClosed: ((Any?) -> Void)?

  func open(
    @ViewBuilder content: () -> some View,
    onClosed: ((Any?) -> Void)? = nil
  ){
    isOpened = true
    let cont = content()
    self.content = AnyView(cont)
    self.onClosed = onClosed

    if let titled = cont as? Titled {
      self.title = titled.title
    }

    if let actionable = cont as? any Actionable {
      self.actions = actionable.actions
    }
  }

  func close(result: Any?) {
    isOpened = false
    self.onClosed?(result)
  }
}
