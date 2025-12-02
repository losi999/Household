//
//  ClearableInput.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import SwiftUI

enum ClearableInputType {
    case text
    case number
    case email
    case password
}

struct ClearableInput : View {
    let title: String
    let type: ClearableInputType
  
    @Binding var text: String
    @FocusState var isTyping: Bool

    var body: some View {
        ZStack(alignment: .leading) {
            Group {
                if (type == .password) {
                    SecureField("", text: $text)
                } else {
                    TextField("", text: $text)
                }
            }
            .padding(.leading)
            .padding(.trailing, 30)
            .textInputAutocapitalization(.never)
            .disableAutocorrection(true)
            .foregroundColor(.appText)
            .keyboardType(.emailAddress)
            .frame(height: 55).focused($isTyping)
            .background(isTyping ? .blue : .appText, in: RoundedRectangle(cornerRadius: 14).stroke(lineWidth: 2))
            HStack {
                Text(title)
                    .padding(.horizontal, 5)
                    .background(.appBackground.opacity(isTyping || !text.isEmpty ? 1 : 0))
                    .foregroundStyle(isTyping ? .blue : .appText)
                    .padding(.leading).offset(y: isTyping || !text.isEmpty ? -27 : 0)
                Spacer()
                if !text.isEmpty {
                    Button(action: {
                        text = ""
                    }, label: {
                        Image(systemName: "multiply.circle.fill").foregroundStyle(.gray)
                    })
                    .offset(x: -10)
                }
            }
        }
        //        .animation(.linear(duration: 2), value: isTyping)
        
    }
}
