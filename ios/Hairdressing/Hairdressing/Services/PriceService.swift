//
//  PriceService.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 28..
//

import Foundation
import Combine

final class PriceService: ObservableObject {
  private let httpClient: HttpClient

  init (httpClient: HttpClient) {
    self.httpClient = httpClient
  }

  @Published var prices: [Price.Response] = []

  func listPrices() async throws -> Void {
    let result = try await httpClient.get("/price/v1/prices", responseType: [Price.Response].self)
    prices = result
  }

  func createPrice(body: Price.Request) async throws -> Price.PriceId {
    return try await httpClient.post("/price/v1/prices", body: body, responseType: Price.PriceId.self);
  }

  func updatePrice(priceId: Price.Id, body: Price.Request) async throws -> Price.PriceId {
    return try await httpClient.put("/price/v1/prices/\(priceId)", body: body, responseType: Price.PriceId.self);
  }

  func deletePrice(priceId: Price.Id) async throws {
    try await httpClient.delete("/price/v1/prices/\(priceId)");

    prices.removeAll{
      $0.priceId == priceId
    }
  }
}
