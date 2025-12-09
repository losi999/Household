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

  func createPrice(body: Price.Request) async throws -> Void {
    let result = try await httpClient.post("/price/v1/prices", body: body, responseType: Price.PriceId.self);

    prices.append(
        Price
          .Response(
            priceId: result.priceId,
            name: body.name,
            amount: body.amount,
            unitOfMeasurement: body.unitOfMeasurement
          )
    )
    prices.sort(using: KeyPathComparator(\.name))
  }

  func updatePrice(priceId: Price.Id, body: Price.Request) async throws -> Void {
    let result = try await httpClient.put("/price/v1/prices/\(priceId)", body: body, responseType: Price.PriceId.self);

    if let index =  prices.firstIndex(where: {price in
      price.priceId == result.priceId
    }) {
      prices[index].name = body.name
      prices[index].amount = body.amount
      prices[index].unitOfMeasurement = body.unitOfMeasurement
    }

    prices.sort(using: KeyPathComparator(\.name))
  }

  func deletePrice(priceId: Price.Id) async throws {
    try await httpClient.delete("/price/v1/prices/\(priceId)");

    prices.removeAll{
      $0.priceId == priceId
    }
  }
}
