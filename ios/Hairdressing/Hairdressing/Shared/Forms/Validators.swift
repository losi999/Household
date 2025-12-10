//
//  Validators.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 09..
//

import Foundation

protocol Validator {
  var message: String {get}
  func validate(value: Any) -> String?
}

struct Validators {
  struct Required: Validator {
    var message: String = "Kötelező"

    func validate(value: Any) -> String? {
      if let stringValue = value as? String, stringValue.isEmpty {
        return message
      }

      return nil
    }
  }

  struct MinLength: Validator {
    var message: String {
      messageBuilder?(minLength) ?? "Minimum \(minLength) karakter szükséges"
    }
    var minLength: Int
    var messageBuilder: ((Int) -> String)?

    func validate(value: Any) -> String? {
      if let stringValue = value as? String, stringValue.count < minLength {
        return message
      }
      return nil
    }

  }

  struct MaxLength: Validator {
    var message: String {
      messageBuilder?(maxLength) ?? "Maximum \(maxLength) karakter lehetséges"
    }
    var maxLength: Int
    var messageBuilder: ((Int) -> String)?

    func validate(value: Any) -> String? {
      if let stringValue = value as? String, stringValue.count > maxLength {
        return message
      }
      return nil
    }
  }

  struct Min: Validator {
    var message: String {
      messageBuilder?(min) ?? "Legalább \(min) szükséges"
    }
    var min: Int
    var messageBuilder: ((Int) -> String)?

    func validate(value: Any) -> String? {
      if let numberValue = (value as? Double) ?? (value as? Int).map(Double.init), numberValue < Double(min) {
        return message
      }
      return nil
    }
  }

  struct Max: Validator {
    var message: String {
      messageBuilder?(max) ?? "Legfeljebb \(max) lehetséges"
    }
    var max: Int
    var messageBuilder: ((Int) -> String)?

    func validate(value: Any) -> String? {
      if let numberValue = (value as? Double) ?? (value as? Int).map(Double.init), numberValue > Double(max) {
        return message
      }
      return nil
    }
  }

  struct ExclusiveMin: Validator {
    var message: String {
      messageBuilder?(min) ?? "Nagyobb, mint \(min) szükséges"
    }
    var min: Int
    var messageBuilder: ((Int) -> String)?

    func validate(value: Any) -> String? {
      if let numberValue = (value as? Double) ?? (value as? Int).map(Double.init), numberValue <= Double(min) {
        return message
      }
      return nil
    }
  }

  struct ExclusiveMax: Validator {
    var message: String {
      messageBuilder?(max) ?? "Kisebb, mint \(max) szükséges"
    }
    var max: Int
    var messageBuilder: ((Int) -> String)?

    func validate(value: Any) -> String? {
      if let numberValue = (value as? Double) ?? (value as? Int).map(Double.init), numberValue >= Double(max) {
        return message
      }
      return nil
    }
  }

  struct Email: Validator {
    let pattern: Regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/.ignoresCase()
    var message: String {
      "Email szükséges"
    }

    func validate(value: Any) -> String? {
      if let email = value as? String, !email.contains(pattern) {
        return message
      }

      return nil
    }
  }
}
