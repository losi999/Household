//
//  PriceDialogView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI
import Combine

final class PriceDialogForm: FormGroup {
  @Published var name: FormControl<String>
  @Published var amount: FormControl<Int>
  @Published var unitOfMeasurement: FormControl<PriceUnitOfMeasurement>

  private var cancellables = Set<AnyCancellable>()

  init(price: Price.Response? = nil) {
    name = FormControl(
      price?.name ?? "",
      validators: [Validators.Required()])
    amount = FormControl(
      price?.amount ?? 0,
      validators: [Validators.Required(), Validators.ExclusiveMin(min: 0)]
    )
    unitOfMeasurement = FormControl(
      price?.unitOfMeasurement ?? .count,
      validators: [Validators.Required()]
    )

    super.init()

    registerControl(name)
    registerControl(amount)
    registerControl(unitOfMeasurement)
  }
}

struct PriceDialogView: View, Actionable, Titled {

  var title: String
  @ObservedObject var form: PriceDialogForm

  func actions(onClosed: @escaping (Any?) -> Void) -> AnyView {
    AnyView(
      HStack {
        FilledButton(title: "Mentés", style: .primary) {
          form.submit()

          if form.isValid {
            onClosed(
              Price.Request(
                name: form.name.value,
                amount: form.amount.value,
                unitOfMeasurement: form.unitOfMeasurement.value
              )
            )
          }
        }
        FilledButton(title: "Mégse", style: .secondary) {
          onClosed(nil)
        }
      }
    )
  }

  var body: some View {
    VStack(alignment: .leading) {
      TextInput(
        title: "Név",
        formControl: form.name,
        type: .text,
      )
      .formErrors(formControl: form.name)
      IntegerInput(
        title: "Ár",
        formControl: form.amount,
      )
      .formErrors(formControl: form.amount)
      EnumPicker(
        title: "Mértékegység",
        formControl: form.unitOfMeasurement
      )
      .formErrors(formControl: form.unitOfMeasurement)
    }
    .frame(width: 400)
  }
}

#Preview {
  PriceDialogView(title: "Új", form: PriceDialogForm())
}
