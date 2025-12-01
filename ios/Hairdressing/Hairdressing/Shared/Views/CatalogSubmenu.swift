//
//  CatalogSubmenu.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 01..
//

import SwiftUI

enum CatalogSubmenuResult {
  case edit
  case merge
  case delete
}

struct CatalogSubmenu: View {
  var title: String
  var hideEdit: Bool = false
  var hideMerge: Bool = false
  var hideDelete: Bool = false

  let onDismiss: (CatalogSubmenuResult) -> Void

  var body: some View {
    VStack(alignment: .leading) {
      Text(title)
        .padding()

      if !hideEdit {
        Button(action: {
          onDismiss(.edit)
        }, label: {
          Label("Szerkesztés", systemImage: "pencil")
        }).padding(.vertical, 5)
      }

      if !hideMerge {
        Button(action: {
          onDismiss(.merge)
        }, label: {
          Label("Egyesítés", systemImage: "arrow.merge")
        }).padding(.vertical, 5)
      }
      
      if !hideDelete {
        Button(action: {
          onDismiss(.delete)
        }, label: {
          Label("Törlés", systemImage: "trash")
        }).padding(.vertical, 5)
      }
    }
    .padding()
  }
}
