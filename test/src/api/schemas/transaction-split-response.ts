import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as account } from '@household/test/api/schemas/account-response';
import { default as category } from '@household/test/api/schemas/category-response';
import { default as project } from '@household/test/api/schemas/project-response';
import { default as recipient } from '@household/test/api/schemas/recipient-response';
import { default as amount } from '@household/shared/schemas/partials/transaction-amount';
import { default as description } from '@household/shared/schemas/partials/transaction-description';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as product } from '@household/test/api/schemas/product-response';
import { default as productId } from '@household/shared/schemas/product-id';
import { default as invoice } from '@household/shared/schemas/partials/transaction-invoice';
import { default as quantity } from '@household/shared/schemas/partials/transaction-quantity';

const schema: StrictJSONSchema7<Transaction.SplitResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...transactionId.required,
    ...amount.required,
    ...issuedAt.required,
    'account',
    'transactionType',
  ],
  properties: {
    ...transactionId.properties,
    ...amount.properties,
    ...description.properties,
    ...issuedAt.properties,
    transactionType: {
      type: 'string',
      const: 'split',
    },
    account,
    recipient,
    splits: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [...amount.required],
        dependentRequired: {
          ...invoice.dependentRequired,
          quantity: ['product'],
          product: ['quantity'],
        },
        properties: {
          ...amount.properties,
          ...description.properties,
          category: {
            ...category,
            properties: {
              ...category.properties,
              products: {
                type: 'array',
                items: productId,
              },
            },
          },
          project,
          ...invoice.properties,
          ...quantity.properties,
          product,
        },
      },
    },
    deferredSplits: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          ...amount.required,
          ...transactionId.required,
          'transactionType',
          'payingAccount',
          'ownerAccount',
        ],
        properties: {
          ...transactionId.properties,
          transactionType: {
            type: 'string',
            const: 'deferred',
          },
          payingAccount: account,
          ownerAccount: account,
          ...amount.properties,
          ...description.properties,
          category: {
            ...category,
            properties: {
              ...category.properties,
              products: {
                type: 'array',
                items: productId,
              },
            },
          },
          project,
          ...invoice.properties,
          ...quantity.properties,
          product,
          remainingAmount: {
            type: 'number',
          },
          isSettled: {
            type: 'boolean',
          },
        },
      },
    },
  },
};

export default schema;
