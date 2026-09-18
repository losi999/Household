import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { accountId, response as accountResponse, report as accountReport } from '@household/shared/schemas/account';
import { productId, response as productResponse, report as productReport } from '@household/shared/schemas/product';
import { recipientId, response as recipientResponse, report as recipientReport } from '@household/shared/schemas/recipient';
import { projectId, response as projectResponse, report as projectReport } from '@household/shared/schemas/project';
import { categoryId, response as categoryResponse, report as categoryReport } from '@household/shared/schemas/category';

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

const quantity: ObjectSchema<Api.Transaction.Quantity> = {
  type: 'object',
  required: ['quantity'],
  properties: {
    quantity: {
      type: 'number',
      exclusiveMinimum: 0,
    },
  },
};

const inventoryRequest: ObjectSchema<Api.Transaction.Quantity & Api.Product.ProductId> = combine<Api.Transaction.Quantity & Api.Product.ProductId>([
  productId,
  quantity,
  {
    type: 'object',
    additionalProperties: false,
    dependencies: {
      quantity: ['productId'],
      productId: ['quantity'],
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
        inventoryRequest,
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
        inventoryRequest,
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

export const paymentRequest = combine<Requests.PaymentTransaction>([
  issuedAt,
  amount,
  invoice,
  inventoryRequest,
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
      description,
      accountId,
      recipientId,
      splits,
      loans,
    ], {
      required: [
        'issuedAt',
        'accountId',
        'splits',
      ],
    }),
    combine<Requests.SplitTransaction>([
      issuedAt,
      description,
      accountId,
      recipientId,
      splits,
      loans,
    ], {
      required: [
        'issuedAt',
        'accountId',
        'loans',
      ],
    }),
  ],
};

export const paymentResponse = combine<Responses.PaymentTransaction>([
  transactionId,
  amount,
  description,
  issuedAt,
  invoice,  
  quantity,
  {
    type: 'object',
    properties: {
      account: accountResponse,
      category: categoryResponse,
      recipient: recipientResponse,
      project: projectResponse,
      product: productResponse,
      transactionType: {
        type: 'string',
        enum: [Enum.TransactionType.Payment],
      },
    },
  },
], {
  required: [
    'amount',
    'account',
    'issuedAt',
    'transactionId',
    'transactionType',
  ],
});

export const deferredResponse = combine<Responses.DeferredTransaction>([
  transactionId,
  negativeAmount,
  issuedAt,
  description,
  invoice,
  quantity,
  {
    type: 'object',
    properties: {
      transactionType: {
        type: 'string',
        enum: [Enum.TransactionType.Deferred],
      },
      category: categoryResponse,
      project: projectResponse,
      product: productResponse,
      recipient: recipientResponse,
      payingAccount: accountResponse,
      ownerAccount: accountResponse,
    },
  },
], {
  required: [
    'amount',
    'transactionId',
    'issuedAt',
    'transactionType',
    'payingAccount',
    'ownerAccount',
  ],
});

export const reimbursementResponse = combine<Responses.ReimbursementTransaction>([
  transactionId,
  negativeAmount,
  issuedAt,
  description,
  invoice,
  quantity,
  {
    type: 'object',
    properties: {
      transactionType: {
        type: 'string',
        enum: [Enum.TransactionType.Reimbursement],
      },
      category: categoryResponse,
      project: projectResponse,
      product: productResponse,
      recipient: recipientResponse,
      payingAccount: accountResponse,
      ownerAccount: accountResponse,
    },
  },
], {
  required: [
    'amount',
    'transactionId',
    'issuedAt',
    'transactionType',
    'payingAccount',
    'ownerAccount',
  ],
});

export const transferResponse = combine<Responses.TransferTransaction>([
  transactionId,
  amount,
  description,
  issuedAt,
  transferAmount,
  {
    type: 'object',
    properties: {
      account: accountResponse,
      transferAccount: accountResponse,
      transactionType: {
        type: 'string',
        enum: [Enum.TransactionType.Transfer],
      },
    },
  },
], {
  required: [
    'amount',
    'account',
    'issuedAt',
    'transactionId',
    'transactionType',
    'transferAccount',
    'transferAmount',
  ],
});

export const splitResponse = combine<Responses.SplitTransaction>([
  transactionId, 
  negativeAmount,
  description,
  issuedAt,
  {
    type: 'object',
    properties: {
      account: accountResponse,
      recipient: recipientResponse,
      transactionType: {
        type: 'string',
        enum: [Enum.TransactionType.Split],
      },
      splits: {
        type: 'array',
        minItems: 1,
        items: combine<Responses.SplitItem>([
          amount,
          description,
          invoice,
          quantity,
          {
            type: 'object',
            properties: {
              category: categoryResponse,
              project: projectResponse,
              product: productResponse,
            },
          },
        ], {
          required: ['amount'],
        }),
      },
      deferredSplits: {
        type: 'array',
        minItems: 1,
        items: deferredResponse,
      },
    },
  },
], {
  required: [
    'transactionId',
    'amount',
    'issuedAt',
    'account',
    'transactionType',
  ],
});

export const response: StrictSchema<Responses.Transaction> = {
  type: 'object',
  oneOf: [
    paymentResponse,
    transferResponse,
    splitResponse,
    deferredResponse,
    reimbursementResponse,
  ],
};

export const responseList: StrictSchema<Responses.Transaction[]> = {
  type: 'array',
  items: response,
};

export const draftResponse = combine<Responses.DraftTransaction>([
  transactionId,
  amount,
  issuedAt,
  description,
  {
    type: 'object',
    properties: {
      transactionType: {
        type: 'string',
        enum: [Enum.TransactionType.Draft],
      },
      potentialDuplicates: responseList,
    },
  },
], {
  optional: ['description'],
});

export const report = combine<Responses.TransactionReport>([
  transactionId,
  amount,
  issuedAt,
  description,
  invoice,
  quantity,
  {
    type: 'object',
    properties: {
      account: accountReport,
      category: categoryReport,
      recipient: recipientReport,
      project: projectReport,
      product: productReport,
    },
  },
], {
  required: [
    'transactionId',
    'amount',
    'issuedAt',
    'account',
  ],
});

export const reportList: StrictSchema<Responses.TransactionReport[]> = {
  type: 'array',
  items: report,
};
