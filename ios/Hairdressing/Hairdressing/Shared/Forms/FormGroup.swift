//
//  FormGroup.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 09..
//

import Foundation
import Combine

class FormGroup : ObservableObject {
  private var cancellables = Set<AnyCancellable>()

  private var controls: [any Validatable] = []

  var isValid: Bool {
    controls.allSatisfy{control in
      return control.isValid
    }
  }
  
  func submit() {
    touchAll()
    // TODO form level validation
  }

  private  func touchAll() {
    controls.forEach{control in
      control.touch(name: "")
    }
  }

  internal func registerControl<T>(_ formControl: FormControl<T>) {
    formControl.objectWillChange.sink { [weak self] _ in
      self?.objectWillChange.send()
    }
    .store(in: &cancellables)

    controls.append(formControl)
  }
}
