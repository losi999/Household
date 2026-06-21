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
        IconTextButton(
          label: "Szerkesztés",
          icon: "pencil",
          style: .compact,
          color: .secondary,
        ) {
          onDismiss(.edit)
        }
      }

      if !hideMerge {
        IconTextButton(label: "Egyesítés", icon: "arrow.merge", style: .compact) {
          onDismiss(.merge)
        }
      }
      
      if !hideDelete {
        IconTextButton(
          label: "Törlés",
          icon: "trash",
          style: .compact,
          color: .danger
        ) {
          onDismiss(.delete)
        }
      }
    }
    .padding()
  }
}
