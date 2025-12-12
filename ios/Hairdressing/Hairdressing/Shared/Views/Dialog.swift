//
//  Dialog.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 01..
//

import SwiftUI

struct Dialog: View {
  @EnvironmentObject private var dialogService: DialogService

  @State private var offset: CGFloat = 1000
  let duration: Double = 0.25

  private func onClose(result: Any? = nil) {
    withAnimation(.spring(duration: duration)) {
      offset = 1000
    }
    dialogService.close(result: result)
  }

  var body: some View {
    ZStack{
      if dialogService.isOpened {
        Color(.black)
          .opacity(0.5)
          .onTapGesture {
            onClose()
          }
        VStack(alignment: .leading) {
          if let title = dialogService.title {
            Text(title)
              .foregroundStyle(.appText)
              .font(.title)
              .padding()
          }
          if let content = dialogService.content {
            ScrollView {
              content
            }.padding()
          }
          Group {
            if let actions = dialogService.actions {
              AnyView(actions(onClose))
            } else {
              HStack{
                IconTextButton(label: "Igen", style: .filled) {
                  onClose(result: true)
                }
                IconTextButton(label: "Nem", color: .danger) {
                  onClose(result: false)
                }
              }
            }
          }
          .padding()
        }
        .frame(maxWidth: .infinity, maxHeight: UIScreen.main.bounds.height - 60)
        .fixedSize(horizontal: true, vertical: true)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(radius: 20)
        .offset(x: 0, y: offset)
        .padding(30)
        .onAppear {
          withAnimation(.spring(duration: duration)) {
            offset = 0
          }
        }
      }
    }
    .ignoresSafeArea()
    .animation(.easeInOut(duration: duration), value: dialogService.isOpened)
  }
}
