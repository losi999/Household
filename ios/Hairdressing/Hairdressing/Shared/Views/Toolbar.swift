//
//  Toolbar.swift
//  Household
//
//  Created by Laszlo Losonczi on 2025. 11. 27..
//

import SwiftUI
struct ToolbarButton {
    var action: () -> Void
    var label: String
}

struct AppToolbar: ViewModifier {
    @StateObject private var authService = AuthService.shared
    var title: String
    var actionButtons: [ToolbarButton] = []
    
    func body(content: Content) -> some View {
        content.toolbarBackground(.appPrimary, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar{
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    ForEach(Array(actionButtons.enumerated()), id: \.offset) { index, button in
                        Button(action: button.action) {
                            Image(systemName: button.label)
                        }
                    }
                }
                if authService.isLoggedIn {
                    ToolbarItem(placement: .navigationBarLeading, content: {
                        Menu(content: {
                            NavigationLink("Vendégek", destination: CustomerHomeView())
                            NavigationLink("Naptár", destination: CalendarHomeView())
                            NavigationLink("Árlista", destination: PriceHomeView())
                            Divider()
                            Button("Kijelentkezés") {
                                authService.logout()
                            }
                        }, label: {Image(systemName: "line.horizontal.3").foregroundColor(.white)})
                    })
                }
            }
    }
}

extension View {
    func appToolbar(_ title: String, actionButtons: [ToolbarButton] = []) -> some View {
        self.modifier(AppToolbar(title: title, actionButtons: actionButtons))
    }
}
