import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as account } from '@household/test/api/schemas/account-response';
import { default as category } from '@household/test/api/schemas/category-response';
import { default as recipient } from '@household/test/api/schemas/recipient-response';
import { default as project } from '@household/test/api/schemas/project-response';
import { default as product } from '@household/test/api/schemas/product-response';
import { default as quantity } from '@household/shared/schemas/partials/transaction-quantity';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Report[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [
      ...transactionId.required,
      ...base.required,
      ...issuedAt.required,
      'account',
    ],
    properties: {
      ...transactionId.properties,
      ...base.properties,
      ...issuedAt.properties,
      account: {
        type: 'object',
        additionalProperties: false,
        required: [
          'accountId',
          'currency',
          'fullName',
        ],
        properties: {
          accountId: account.properties.accountId,
          currency: account.properties.currency,
          fullName: account.properties.fullName,
        },
      },
      category: {
        type: 'object',
        additionalProperties: false,
        required: [
          'categoryId',
          'fullName',
        ],
        properties: {
          categoryId: category.properties.categoryId,
          fullName: category.properties.fullName,
        },
      },
      project: {
        type: 'object',
        additionalProperties: false,
        required: [
          'projectId',
          'name',
        ],
        properties: {
          projectId: project.properties.projectId,
          name: project.properties.name,
        },
      },
      recipient: {
        type: 'object',
        additionalProperties: false,
        required: [
          'recipientId',
          'name',
        ],
        properties: {
          recipientId: recipient.properties.recipientId,
          name: recipient.properties.name,
        },
      },
      product: {
        type: 'object',
        additionalProperties: false,
        required: [
          'productId',
          'quantity',
          'fullName',
        ],
        properties: {
          productId: product.properties.productId,
          fullName: product.properties.fullName,
          ...quantity.properties,
        },
      },
    },
  },
};

export default schema;
