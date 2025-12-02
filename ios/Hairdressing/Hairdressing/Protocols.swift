//
//  Protocols.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 02..
//

import Foundation
import SwiftUI

protocol Actionable {
  func actions(onClosed: @escaping (Any?) -> Void) -> AnyView
}

protocol Titled {
  var title: String {get set}
}
