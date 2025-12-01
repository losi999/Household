//
//  PriceDialogView.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 30..
//

import SwiftUI

struct PriceDialogView: View {
    let onClose: () -> Void
    
    var body: some View {
        VStack {
            Text("Price dialog")
                .foregroundStyle(.accent)
            Button("close") {
                onClose()
//                showPopover1.toggle()
            }
        }
    }
}

#Preview {
    PriceDialogView() {}
}
