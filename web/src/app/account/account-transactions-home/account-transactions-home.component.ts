import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss']
})
export class AccountTransactionsHomeComponent implements OnInit {
  transactions: Transaction.Response[];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // this.transactions = this.activatedRoute.snapshot.data.transactions;
    this.transactions = [
      {
        _id: undefined,
        expiresAt: undefined,
        "transactionType": "payment",
        "description": "NFL Game pass df sdf ds",
        "amount": 353,
        "issuedAt": "2022-02-13T11:56:00.000Z",
        "category": {
          "name": "Vásárlás",
          "fullName": "Vásárlás sd sadssafsdfsd ",
          "createdAt": "2022-03-08T00:34:31.594Z",
          "updatedAt": "2022-03-08T00:34:31.594Z",
          "categoryId": "6226a4975ba602915aca8318",
          "children": [],
        } as unknown as Category.Response,
        "account": {
          "name": "Bankszámla",
          "currency": "Ft",
          "isOpen": true,
          "accountType": "bankAccount",
          "createdAt": "2022-03-08T00:34:30.877Z",
          "updatedAt": "2022-03-08T00:34:30.877Z",
          "accountId": "6226a4965ba602915aca8271"
        } as unknown as Account.Response,
        "createdAt": "2022-03-08T00:34:32.746Z",
        "updatedAt": "2022-03-08T00:34:32.746Z",
        "transactionId": "6226a4986051628d2279f867" as any,
        recipient: {
          "name": "Spardsd sad asd asdsfdsfds",
          "createdAt": "2022-03-08T00:34:31.461Z",
          "updatedAt": "2022-03-08T00:34:31.461Z",
          "recipientId": "6226a4975ba602915aca8281"
        } as unknown as Recipient.Response,
        project: {
          "name": "Malmö 2020 sadsa dsa dsa dsfds",
          "description": "",
          "createdAt": "2022-03-08T00:34:29.326Z",
          "updatedAt": "2022-03-08T00:34:29.326Z",
          "projectId": "6226a4955ba602915aca826d"
        } as unknown as Project.Response
      },
      {
        _id: undefined,
        expiresAt: undefined,
        "transactionType": "split",
        "description": "qwre",
        "amount": -2371,
        "issuedAt": "2022-01-15T13:16:00.000Z",
        "splits": [
          {
            "amount": -107,
            "description": "fdsfsd",
            "category": {
              "name": "Hagyma",
              "fullName": "Bevásárlás:Hagyma",
              "createdAt": "2022-03-08T00:34:31.592Z",
              "updatedAt": "2022-03-08T00:34:31.592Z",
              "categoryId": "6226a4975ba602915aca82b5",
              "parentCategoryId": "6226a4975ba602915aca8290",
              "children": []
            } as unknown as Category.Response,
            project: {
              "name": "Malmö 2020",
              "description": "",
              "createdAt": "2022-03-08T00:34:29.326Z",
              "updatedAt": "2022-03-08T00:34:29.326Z",
              "projectId": "6226a4955ba602915aca826d"
            } as unknown as Project.Response
          },
          {
            "amount": -369,
            "description": "hgfhgfhfg",
            "category": {
              "name": "Gabonapehely",
              "fullName": "Bevásárlás:Gabonapehely",
              "createdAt": "2022-03-08T00:34:31.592Z",
              "updatedAt": "2022-03-08T00:34:31.592Z",
              "categoryId": "6226a4975ba602915aca82c0",
              "parentCategoryId": "6226a4975ba602915aca8290",
              "children": []
            } as unknown as Category.Response,
            project: {
              "name": "Malmö 2020",
              "description": "",
              "createdAt": "2022-03-08T00:34:29.326Z",
              "updatedAt": "2022-03-08T00:34:29.326Z",
              "projectId": "6226a4955ba602915aca826d"
            } as unknown as Project.Response
          },
          {
            "amount": -898,
            "description": "hghewrter",
            "category": {
              "name": "Mák",
              "fullName": "Bevásárlás:Mák",
              "createdAt": "2022-03-08T00:34:31.593Z",
              "updatedAt": "2022-03-08T00:34:31.593Z",
              "categoryId": "6226a4975ba602915aca82f5",
              "parentCategoryId": "6226a4975ba602915aca8290",
              "children": []
            } as unknown as Category.Response,
            project: {
              "name": "Malmö 2020",
              "description": "",
              "createdAt": "2022-03-08T00:34:29.326Z",
              "updatedAt": "2022-03-08T00:34:29.326Z",
              "projectId": "6226a4955ba602915aca826d"
            } as unknown as Project.Response
          },
          {
            "amount": -369,
            "description": "hgfdhfg",
            "category": {
              "name": "Fonott kalács",
              "fullName": "Bevásárlás:Fonott kalács",
              "createdAt": "2022-03-08T00:34:31.592Z",
              "updatedAt": "2022-03-08T00:34:31.592Z",
              "categoryId": "6226a4975ba602915aca82b6",
              "parentCategoryId": "6226a4975ba602915aca8290",
              "children": []
            } as unknown as Category.Response,
            project: {
              "name": "Malmö 2020",
              "description": "",
              "createdAt": "2022-03-08T00:34:29.326Z",
              "updatedAt": "2022-03-08T00:34:29.326Z",
              "projectId": "6226a4955ba602915aca826d"
            } as unknown as Project.Response
          },
          {
            "amount": -259,
            "description": "gfhrefgh",
            "category": {
              "name": "Kenyér",
              "fullName": "Bevásárlás:Kenyér",
              "createdAt": "2022-03-08T00:34:31.592Z",
              "updatedAt": "2022-03-08T00:34:31.592Z",
              "categoryId": "6226a4975ba602915aca82bc",
              "parentCategoryId": "6226a4975ba602915aca8290",
              "children": []
            } as unknown as Category.Response,
            project: {
              "name": "Malmö 2020",
              "description": "",
              "createdAt": "2022-03-08T00:34:29.326Z",
              "updatedAt": "2022-03-08T00:34:29.326Z",
              "projectId": "6226a4955ba602915aca826d"
            } as unknown as Project.Response
          },
          {
            "amount": -369,
            "description": "hgfhdfg",
            "category": {
              "name": "Csoki",
              "fullName": "Bevásárlás:Csoki",
              "createdAt": "2022-03-08T00:34:31.593Z",
              "updatedAt": "2022-03-08T00:34:31.593Z",
              "categoryId": "6226a4975ba602915aca82d7",
              "parentCategoryId": "6226a4975ba602915aca8290",
              "children": []
            } as unknown as Category.Response,
            project: {
              "name": "Malmö 2020",
              "description": "",
              "createdAt": "2022-03-08T00:34:29.326Z",
              "updatedAt": "2022-03-08T00:34:29.326Z",
              "projectId": "6226a4955ba602915aca826d"
            } as unknown as Project.Response
          }
        ],
        "account": {
          "name": "Bankszámla",
          "currency": "Ft",
          "isOpen": true,
          "accountType": "bankAccount",
          "createdAt": "2022-03-08T00:34:30.877Z",
          "updatedAt": "2022-03-08T00:34:30.877Z",
          "accountId": "6226a4965ba602915aca8271"
        } as unknown as Account.Response,
        "recipient": {
          "name": "Penny",
          "createdAt": "2022-03-08T00:34:31.461Z",
          "updatedAt": "2022-03-08T00:34:31.461Z",
          "recipientId": "6226a4975ba602915aca8282"
        } as unknown as Recipient.Response,
        "createdAt": "2022-03-08T00:34:34.304Z",
        "updatedAt": "2022-03-08T00:34:34.304Z",
        "transactionId": "6226a49a6051628d2279fb3c" as any
      },
      {
        _id: undefined,
        expiresAt: undefined,
        "transactionType": "transfer",
        "description": "IKEA",
        "amount": 5428500,
        "issuedAt": "2021-01-17T20:42:00.000Z",
        "transferAccount": {
          "name": "Anya",
          "currency": "Ft",
          "isOpen": true,
          "accountType": "loan",
          "createdAt": "2022-03-08T00:34:30.877Z",
          "updatedAt": "2022-03-08T00:34:30.877Z",
          "accountId": "6226a4965ba602915aca8276"
        } as unknown as Account.Response,
        "account": {
          "name": "Bankszámla",
          "currency": "Ft",
          "isOpen": true,
          "accountType": "bankAccount",
          "createdAt": "2022-03-08T00:34:30.877Z",
          "updatedAt": "2022-03-08T00:34:30.877Z",
          "accountId": "6226a4965ba602915aca8271"
        } as unknown as Account.Response,
        "createdAt": "2022-03-08T00:34:34.753Z",
        "updatedAt": "2022-03-08T00:34:34.753Z",
        "transactionId": "6226a49a6051628d2279fd50" as any
      }
    ]
  }

}
