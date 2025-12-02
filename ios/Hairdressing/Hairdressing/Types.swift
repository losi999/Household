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
        let name: String
        let amount: Int
        let unitOfMeasurement: PriceUnitOfMeasurement
        
        var id: String {priceId}
    }
}


