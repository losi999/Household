//
//  HomeView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import SwiftUI
import Combine

final class LoginForm: FormGroup {
  @Published var email: FormControl<String>
  @Published var password: FormControl<String>

  override init() {
    email = FormControl(
      "",
      validators: [Validators.Required(), Validators.Email()]
    )
    password = FormControl(
      "",
      validators: [Validators.Required()]
    )

    super.init()

    registerControl(email)
    registerControl(password)
  }
}

struct LoginView: View {
  @EnvironmentObject private var authService: AuthService

  @StateObject var form: LoginForm = LoginForm()

  func onLogin() async {
    form.submit()

    if form.isValid {
      do {
        try await authService.login(
          body: Auth.Login.Request(
            email: form.email.value,
            password: form.password.value
          )
        )
      } catch let error as Common.Error.Response {
        print("Login failed: \(error.message)")
      } catch {
        print("Unexpected error: \(error)")
      }
    }
  }

  @State private var isDisabled = false

  var body: some View {
    VStack{
      FormField {
        TextInput(
          title: "Felhasználónév",
          formControl: form.email,
          type: .email
        )
      }
      FormField {
        TextInput(title: "Jelszó", formControl: form.password, type: .password)
      }
      FilledButton(title: "Bejelentkezés", style: .primary)
      {
        Task {
          isDisabled = true
          await onLogin()
          isDisabled = false
        }
      }
    }
    .frame(width: 400)
    .appToolbar("Bejelentkezés")
  }
}

#Preview {
  LoginView()
}
