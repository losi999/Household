//
//  CustomerService.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 12. 11..
//

import Foundation
import Combine

final class CustomerService: ObservableObject {
  private let httpClient: HttpClient

  init (httpClient: HttpClient) {
    self.httpClient = httpClient
  }

  @Published var customers: [Customer.Response] = []

  func listCustomers() async throws -> Void {
    let result = try await httpClient.get("/customer/v1/customers", responseType: [Customer.Response].self)
    customers = result
  }
}
