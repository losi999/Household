//
//  FormControl.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 08..
//

import Foundation
import Combine
import SwiftUI

protocol FormInput<Value> : View {
  associatedtype Value
  var formControl: FormControl<Value> { get }
  var title: String { get }
  var textValue: String { get }
}


protocol Validatable : ObservableObject {
  var validators: [Validator] { get }
  func validate()

  func touch()

  var errors: [String] {get}

  var isRequired: Bool {get}
  var isTouched: Bool {get}
  var isValid: Bool {get}
}

final class FormControl<Value>: Validatable {
  @Published var value: Value
  var validators: [Validator]

  private var cancellables = Set<AnyCancellable>()

  init(_ initialValue: Value, validators: [Validator] = []) {
    self.value = initialValue
    self.validators = validators
    self.isTouched = false
    self.isValid = true
    self.errors = []
  }

  @Published private(set) var errors: [String] = []

  @Published private(set) var isTouched: Bool
  @Published private(set) var isValid: Bool
  var isRequired: Bool {
    validators.contains{v in
      v is Validators.Required
    }
  }

  func touch() {
    isTouched = true
    validate()
  }

  func validate() {
    errors = []
    validators.forEach {validator in
      if let error = validator.validate(value: value) {
        errors.append(error)
      }
    }

    isValid = errors.count == 0
  }
}

