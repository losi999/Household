import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as account } from '@household/test/api/schemas/account-response';
import { default as category } from '@household/test/api/schemas/category-response';
import { default as project } from '@household/test/api/schemas/project-response';
import { default as product } from '@household/test/api/schemas/product-response';
import { default as recipient } from '@household/test/api/schemas/recipient-response';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as productId } from '@household/shared/schemas/product-id';
import { default as invoice } from '@household/shared/schemas/partials/transaction-invoice';
import { default as quantity } from '@household/shared/schemas/partials/transaction-quantity';

const schema: StrictJSONSchema7<Transaction.PaymentResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...transactionId.required,
    ...base.required,
    ...issuedAt.required,
    'account',
    'transactionType',
  ],
  dependentRequired: {
    ...invoice.dependentRequired,
    quantity: ['product'],
    product: ['quantity'],
  },
  properties: {
    ...transactionId.properties,
    ...base.properties,
    ...issuedAt.properties,
    transactionType: {
      type: 'string',
      const: 'payment',
    },
    ...quantity.properties,
    product,
    ...invoice.properties,
    account,
    recipient,
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
  },
};

export default schema;
