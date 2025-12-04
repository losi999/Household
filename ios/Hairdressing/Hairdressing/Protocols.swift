//
//  Protocols.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 02..
//

import Foundation
import SwiftUI
import Combine

protocol Actionable {
  func actions(onClosed: @escaping (Any?) -> Void) -> AnyView
  
  associatedtype Model: ObservableObject
  var model: Model {get}
}

protocol Titled {
  var title: String {get set}
}
