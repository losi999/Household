import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { accountId } from '@household/shared/schemas/account';
import { productId } from '@household/shared/schemas/product';
import { recipientId } from '@household/shared/schemas/recipient';
import { projectId } from '@household/shared/schemas/project';
import { categoryId } from '@household/shared/schemas/category';

export const transactionId: ObjectSchema<Api.Transaction.TransactionId> = {
  type: 'object',
  additionalProperties: false,
  required: ['transactionId'],
  properties: {
    transactionId: {
      type: 'string',
      pattern: '^[a-f0-9]{24}$',
    },
  },
};

export const issuedAt: ObjectSchema<Api.Transaction.IssuedAt<string>> = {
  type: 'object',
  additionalProperties: false,
  required: ['issuedAt'],
  properties: {
    issuedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

const loanAccountId: ObjectSchema<Api.Transaction.LoanAccountId> = {
  type: 'object',
  additionalProperties: false,
  dependencies: {
    loanAccountId: {
      properties: {
        amount: {
          type: 'number',
          exclusiveMaximum: 0,
        },
      },
    },
  },
  required: ['loanAccountId'],
  properties: {
    loanAccountId: accountId.properties.accountId,
  },
};

export const amount: ObjectSchema<Api.Transaction.Amount> = {
  type: 'object',
  additionalProperties: false,
  required: ['amount'],
  properties: {
    amount: {
      type: 'number',
    },
  },
};

const negativeAmount: ObjectSchema<Api.Transaction.Amount> = {
  type: 'object',
  additionalProperties: false,
  required: ['amount'],
  properties: {
    amount: {
      type: 'number',
      exclusiveMaximum: 0,
    },
  },
};

const description: ObjectSchema<Api.Transaction.Description> = {
  type: 'object',
  additionalProperties: false,
  required: ['description'],
  properties: {
    description: {
      type: 'string',
      minLength: 1,
    },
  },
};

const inventory: ObjectSchema<Api.Transaction.Quantity & Api.Product.ProductId> = combine<Api.Transaction.Quantity & Api.Product.ProductId>([
  productId,
  {
    type: 'object',
    additionalProperties: false,
    dependencies: {
      quantity: ['productId'],
      productId: ['quantity'],
    },
    required: ['quantity'],
    properties: {
      quantity: {
        type: 'number',
        exclusiveMinimum: 0,
      },
    },
  },
]);

const invoice: ObjectSchema<Api.Transaction.InvoiceDate<string> & Api.Transaction.InvoiceNumber> = {
  type: 'object',
  required: [
    'billingStartDate',
    'billingEndDate',
    'invoiceNumber',
  ],
  dependencies: {
    invoiceNumber: [
      'billingEndDate',
      'billingStartDate',
    ],
    billingStartDate: ['billingEndDate'],
    billingEndDate: ['billingStartDate'],
  },
  properties: {
    billingStartDate: {
      type: 'string',
      format: 'date',
    },
    billingEndDate: {
      type: 'string',
      format: 'date',
      formatExclusiveMinimum: {
        $data: '1/billingStartDate',
      },
    },
    invoiceNumber: {
      type: 'string',
      minLength: 1,
    },
  },
};

const transferAccountId: ObjectSchema<Api.Transaction.TransferAccountId> = {
  type: 'object',
  additionalProperties: false,
  required: ['transferAccountId'],
  properties: {
    transferAccountId: accountId.properties.accountId,
  },
};

const transferAmount: ObjectSchema<Api.Transaction.TransferAmount> = {
  type: 'object',
  additionalProperties: false,
  required: ['transferAmount'],
  properties: {
    transferAmount: {
      type: 'number',
    },
  },
};

const splits: ObjectSchema<Pick<Requests.SplitTransaction, 'splits'>> = {
  type: 'object',
  required: ['splits'],
  properties: {
    splits: {
      type: 'array',
      minItems: 1,
      items: combine<Requests.SplitItem>([
        amount,
        description,
        categoryId,
        projectId,
        invoice,
        inventory,
      ], {
        required: ['amount'],
      }),
    },
  },
};

const loans: ObjectSchema<Pick<Requests.SplitTransaction, 'loans'>> = {
  type: 'object',
  required: ['loans'],
  properties: {
    loans: {
      type: 'array',
      minItems: 1,
      items: combine<Requests.LoanItem>([
        negativeAmount,
        description,
        categoryId,
        projectId,
        invoice,
        inventory,
        loanAccountId,
        transactionId,
      ], {
        required: [
          'amount',
          'loanAccountId',
        ],
      }),
    },
  },
};

// const isSettled: ObjectSchema<Api.Transaction.IsSettled> = {
//   type: 'object',
//   additionalProperties: false,
//   required: ['isSettled'],
//   properties: {
//     isSettled: {
//       type: 'boolean',
//     },
//   },
// };

// const base = combine<Api.Account.Base>([
//   name,
//   currency,
//   accountType,
//   owner,
// ]);

// export const leanResponse = combine<Responses.AccountLean>([
//   accountId,
//   isOpen,
//   base,
//   fullName,
// ]);

// export const response = combine<Responses.Account>([
//   leanResponse,
//   balance,
// ]);

// export const report = combine<Responses.AccountReport>([
//   accountId,
//   fullName,
//   currency,
// ]);

export const paymentRequest = combine<Requests.PaymentTransaction>([
  issuedAt,
  amount,
  invoice,
  inventory,
  description,
  loanAccountId,
  accountId,
  categoryId,
  projectId,
  recipientId,
], {
  required: [
    'amount',
    'issuedAt',
    'accountId',
  ],
});

export const transferRequest = combine<Requests.TransferTransaction>([
  issuedAt,
  amount,
  description,
  transferAccountId,
  transferAmount,
  accountId,
], {
  required: [
    'amount',
    'issuedAt',
    'accountId',
    'transferAccountId',
  ],
});

export const splitRequest: ObjectSchema<Requests.SplitTransaction> = {
  type: 'object',
  anyOf: [
    combine<Requests.SplitTransaction>([
      issuedAt,
      negativeAmount,
      description,
      accountId,
      recipientId,
      splits,
      loans,
    ], {
      required: [
        'amount',
        'issuedAt',
        'accountId',
        'splits',
      ],
    }),
    combine<Requests.SplitTransaction>([
      issuedAt,
      negativeAmount,
      description,
      accountId,
      recipientId,
      splits,
      loans,
    ], {
      required: [
        'amount',
        'issuedAt',
        'accountId',
        'loans',
      ],
    }),
  ],
};
