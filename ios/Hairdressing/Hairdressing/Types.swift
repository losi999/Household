//
//  Types.swift
//  Hairdressing
//
//  Created by Laszlo Losonczi on 2025. 11. 29..
//

import Foundation
import Combine

struct Auth {
    protocol IdToken {
        var idToken: String {get}
    }
    
    struct Login {
        struct Request: Codable {
            let email: String
            let password: String
        }
        
        struct Response: Codable, IdToken {
            let idToken: String
            let refreshToken: String
        }
    }
    
    struct RefreshToken {
        struct Request: Codable{
            let refreshToken: String
        }
        
        struct Response: Codable, IdToken {
            let idToken: String
        }
    }
}

struct Common {
    struct Error {
        struct Response: Codable, Swift.Error {
            let message: String
        }
    }
}

enum PriceUnitOfMeasurement: String, Codable, CaseIterable {
    case count = "db"
    case gram = "g"
    case hour = "óra"
}

struct Customer {
  typealias Id = String
  private protocol _CustomerId {
    var customerId: Id {get}
  }

  private protocol _Name {
    var name: String {get}
  }

  private protocol _IsGroup {
    var isGroup: Bool {get}
  }

  private protocol _Base : _Name, _IsGroup {
    var description: String? {get}
    var rating: Int {get}
  }

  struct CustomerId: Codable, _CustomerId {
    let customerId: Id
  }

  struct Request: Codable, _Base {
    var description: String?
    var rating: Int
    var name: String
    var isGroup: Bool
  }

  struct Response: Codable, Identifiable, _CustomerId, _Base {
    let customerId: Id
    var description: String?
    var rating: Int
    var name: String
    var isGroup: Bool

    var id: String {customerId}

  }
}

struct Price {
    typealias Id = String
    private protocol _PriceId {
        var priceId: Id {get}
    }
    
    private protocol _UnitOfMeasurement {
        var unitOfMeasurement: PriceUnitOfMeasurement {get}
    }
    
    private protocol _Base  {
        var name: String {get}
        var amount: Int {get}
    }
    
    struct PriceId: Codable, _PriceId {
        let priceId: Id
    }
    
    struct Request: Codable, _Base, _UnitOfMeasurement {
        let name: String
        let amount: Int
        let unitOfMeasurement: PriceUnitOfMeasurement
    }
    
    struct Response: Codable, Identifiable, _PriceId, _Base, _UnitOfMeasurement {
        let priceId: Id
        var name: String
        var amount: Int
        var unitOfMeasurement: PriceUnitOfMeasurement
        
        var id: String {priceId}
    }
}


