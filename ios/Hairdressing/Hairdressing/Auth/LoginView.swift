//
//  HomeView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import SwiftUI

struct LoginView: View {
    @State var email: String = ""
    @State var password: String = ""
    @StateObject private var authService = AuthService.shared
    
    func onLogin() async {
        do {
            try await authService.login(body: .init(email: email, password: password))
        } catch let error as Common.Error.Response {
            print("Login failed: \(error.message)")
        } catch {
            print("Unexpected error: \(error)")
        }
    }
    
    @State private var isPressed = false
    @State private var isDisabled = false
    
    var body: some View {
        VStack{
            ClearableInput(title: "Felhasználónév", type: .email, text: $email)
            ClearableInput(title: "Jelszó", type: .password, text: $password)
            Button {
                Task {
                    isDisabled = true
                    await onLogin()
                    isDisabled = false
                }
            } label: {
                Text("Bejelentkezés")
                    .fontWeight(.medium)
                    .foregroundStyle(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(.appPrimary)
                    )
            }
            .disabled(isDisabled)
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
        .frame(width: 400)
        .appToolbar("Bejelentkezés")
    }
}
#Preview {
    LoginView()
}
