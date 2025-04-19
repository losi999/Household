import { default as schema } from '@household/shared/schemas/transaction-split-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createLoanRequestItem, createProductId, createProjectId, createRecipientId, createSplitRequestItem as createSplitRequestItem, createSplitTransactionRequest, createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Split transaction schema', () => {
  const tester = jsonSchemaTesterFactory<Transaction.SplitRequest>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createSplitTransactionRequest(), 'without splits.loanAccountId');

    tester.validateSuccess(createSplitTransactionRequest({
      description: undefined,
    }), 'without description');

    tester.validateSuccess(createSplitTransactionRequest({
      recipientId: undefined,
    }), 'without recipientId');

    tester.validateSuccess(createSplitTransactionRequest({
      loans: [
        createLoanRequestItem({
          loanAccountId: createAccountId(),
          amount: -100,
          isSettled: false,
        }),
      ],
    }), 'with splits.loanAccountId');

    tester.validateSuccess(createSplitTransactionRequest({
      splits: [
        createSplitRequestItem({
          categoryId: undefined,
        }),
      ],
    }), 'without splits.categoryId');

    tester.validateSuccess(createSplitTransactionRequest({
      splits: [
        createSplitRequestItem({
          projectId: undefined,
        }),
      ],
    }), 'without splits.projectId');

    tester.validateSuccess(createSplitTransactionRequest({
      splits: [
        createSplitRequestItem({
          description: undefined,
        }),
      ],
    }), 'without splits.description');

    tester.validateSuccess(createSplitTransactionRequest({
      splits: [
        createSplitRequestItem({
          quantity: undefined,
          productId: undefined,
        }),
      ],
    }), 'without splits.inventory');

    tester.validateSuccess(createSplitTransactionRequest({
      splits: [
        createSplitRequestItem({
          invoiceNumber: undefined,
          billingEndDate: undefined,
          billingStartDate: undefined,
        }),
      ],
    }), 'without splits.invoice');

    tester.validateSuccess(createSplitTransactionRequest({
      splits: [
        createSplitRequestItem({
          invoiceNumber: undefined,
        }),
      ],
    }), 'without splits.invoiceNumber');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createSplitTransactionRequest(),
        extra: 1,
      } as any, 'data');

      describe('misses both splits and loans', () => {
        tester.required(createSplitTransactionRequest({
          splits: undefined,
          loans: undefined,
        }), 'splits', '(splits)');

        tester.required(createSplitTransactionRequest({
          splits: undefined,
          loans: undefined,
        }), 'loans', '(loans)');
      });
    });

    describe('if data.amount', () => {
      tester.required(createSplitTransactionRequest({
        amount: undefined,
      }), 'amount');

      tester.type(createSplitTransactionRequest({
        amount: '1' as any,
      }), 'amount', 'number');

      tester.exclusiveMaximum(createSplitTransactionRequest({
        amount: 100,
      }), 'amount', 0);
    });

    describe('if data.description', () => {
      tester.type(createSplitTransactionRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createSplitTransactionRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.issuedAt', () => {
      tester.required(createSplitTransactionRequest({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.type(createSplitTransactionRequest({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.format(createSplitTransactionRequest({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.required(createSplitTransactionRequest({
        accountId: undefined,
      }), 'accountId');

      tester.type(createSplitTransactionRequest({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.pattern(createSplitTransactionRequest({
        accountId: createAccountId('not-valid'),
      }), 'accountId');
    });

    describe('if data.recipientId', () => {
      tester.type(createSplitTransactionRequest({
        recipientId: 1 as any,
      }), 'recipientId', 'string');

      tester.pattern(createSplitTransactionRequest({
        recipientId: createRecipientId('not-valid'),
      }), 'recipientId');
    });

    describe('if data.splits', () => {
      tester.minItems(createSplitTransactionRequest({
        splits: [],
      }), 'splits', 1);

      tester.additionalProperties(createSplitTransactionRequest({
        splits: [
          {
            ...createSplitRequestItem(),
            extra: 1,
          } as any,
        ],
      }), 'splits/0');
    });

    describe('if data.splits.amount', () => {
      tester.required(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            amount: '1' as any,
          }),
        ],
      }), 'splits/0/amount', 'number');
    });

    describe('if data.splits.description', () => {
      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            description: 1 as any,
          }),
        ],
      }), 'splits/0/description', 'string');

      tester.minLength(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            description: '',
          }),
        ],
      }), 'splits/0/description', 1);
    });

    describe('if data.splits.quantity', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            productId: undefined,
          }),
        ],
      }), 'quantity', 'productId');

      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: '1' as any,
          }),
        ],
      }), 'splits/0/quantity', 'number');

      tester.exclusiveMinimum(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: 0,
          }),
        ],
      }), 'splits/0/quantity', 0);
    });

    describe('if data.splits.productId', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: undefined,
          }),
        ],
      }), 'productId', 'quantity');

      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            productId: 1 as any,
          }),
        ],
      }), 'splits/0/productId', 'string');

      tester.pattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            productId: createProductId('not-valid'),
          }),
        ],
      }), 'splits/0/productId');
    });

    describe('if data.splits.invoiceNumber', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: undefined,
            billingStartDate: undefined,
          }),
        ],
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            invoiceNumber: 1 as any,
          }),
        ],
      }), 'splits/0/invoiceNumber', 'string');

      tester.minLength(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            invoiceNumber: '',
          }),
        ],
      }), 'splits/0/invoiceNumber', 1);
    });

    describe('if data.splits[0].billingEndDate', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingStartDate: undefined,
          }),
        ],
      }), 'billingEndDate', 'billingStartDate');

      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: 1 as any,
          }),
        ],
      }), 'splits/0/billingEndDate', 'string');

      tester.format(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: 'not-date',
          }),
        ],
      }), 'splits/0/billingEndDate', 'date');

      tester.formatExclusiveMinimum(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: '2022-01-01',
            billingStartDate: '2022-12-31',
          }),
        ],
      }), 'splits/0/billingEndDate');
    });

    describe('if data.splits[0].billingStartDate', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: undefined,
          }),
        ],
      }), 'billingStartDate', 'billingEndDate');

      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingStartDate: 1 as any,
          }),
        ],
      }), 'splits/0/billingStartDate', 'string');

      tester.format(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingStartDate: 'not-date',
          }),
        ],
      }), 'splits/0/billingStartDate', 'date');
    });

    describe('if data.splits[0].categoryId', () => {
      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            categoryId: 1 as any,
          }),
        ],
      }), 'splits/0/categoryId', 'string');

      tester.pattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            categoryId: createCategoryId('not-valid'),
          }),
        ],
      }), 'splits/0/categoryId');
    });

    describe('if data.splits[0].projectId', () => {
      tester.type(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            projectId: 1 as any,
          }),
        ],
      }), 'splits/0/projectId', 'string');

      tester.pattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            projectId: createProjectId('not-valid'),
          }),
        ],
      }), 'splits/0/projectId');
    });

    describe('if data.loans', () => {
      tester.minItems(createSplitTransactionRequest({
        loans: [],
      }), 'loans', 1);

      tester.additionalProperties(createSplitTransactionRequest({
        loans: [
          {
            ...createLoanRequestItem(),
            extra: 1,
          } as any,
        ],
      }), 'loans/0');
    });

    describe('if data.loans.amount', () => {
      tester.required(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            amount: '1' as any,
          }),
        ],
      }), 'loans/0/amount', 'number');

      tester.exclusiveMaximum(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            amount: 1,
            loanAccountId: createAccountId(),
            isSettled: false,
          }),
        ],
      }), 'loans/0/amount', 0);
    });

    describe('if data.loans.description', () => {
      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            description: 1 as any,
          }),
        ],
      }), 'loans/0/description', 'string');

      tester.minLength(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            description: '',
          }),
        ],
      }), 'loans/0/description', 1);
    });

    describe('if data.loans.quantity', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            productId: undefined,
          }),
        ],
      }), 'quantity', 'productId');

      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            quantity: '1' as any,
          }),
        ],
      }), 'loans/0/quantity', 'number');

      tester.exclusiveMinimum(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            quantity: 0,
          }),
        ],
      }), 'loans/0/quantity', 0);
    });

    describe('if data.loans.productId', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            quantity: undefined,
          }),
        ],
      }), 'productId', 'quantity');

      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            productId: 1 as any,
          }),
        ],
      }), 'loans/0/productId', 'string');

      tester.pattern(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            productId: createProductId('not-valid'),
          }),
        ],
      }), 'loans/0/productId');
    });

    describe('if data.loans.invoiceNumber', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingEndDate: undefined,
            billingStartDate: undefined,
          }),
        ],
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            invoiceNumber: 1 as any,
          }),
        ],
      }), 'loans/0/invoiceNumber', 'string');

      tester.minLength(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            invoiceNumber: '',
          }),
        ],
      }), 'loans/0/invoiceNumber', 1);
    });

    describe('if data.loans[0].billingEndDate', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingStartDate: undefined,
          }),
        ],
      }), 'billingEndDate', 'billingStartDate');

      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingEndDate: 1 as any,
          }),
        ],
      }), 'loans/0/billingEndDate', 'string');

      tester.format(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingEndDate: 'not-date',
          }),
        ],
      }), 'loans/0/billingEndDate', 'date');

      tester.formatExclusiveMinimum(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingEndDate: '2022-01-01',
            billingStartDate: '2022-12-31',
          }),
        ],
      }), 'loans/0/billingEndDate');
    });

    describe('if data.loans[0].billingStartDate', () => {
      tester.dependentRequired(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingEndDate: undefined,
          }),
        ],
      }), 'billingStartDate', 'billingEndDate');

      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingStartDate: 1 as any,
          }),
        ],
      }), 'loans/0/billingStartDate', 'string');

      tester.format(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            billingStartDate: 'not-date',
          }),
        ],
      }), 'loans/0/billingStartDate', 'date');
    });

    describe('if data.loans[0].categoryId', () => {
      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            categoryId: 1 as any,
          }),
        ],
      }), 'loans/0/categoryId', 'string');

      tester.pattern(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            categoryId: createCategoryId('not-valid'),
          }),
        ],
      }), 'loans/0/categoryId');
    });

    describe('if data.loans[0].projectId', () => {
      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            projectId: 1 as any,
          }),
        ],
      }), 'loans/0/projectId', 'string');

      tester.pattern(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            projectId: createProjectId('not-valid'),
          }),
        ],
      }), 'loans/0/projectId');
    });

    describe('if data.loans[0].loanAccountId', () => {
      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            loanAccountId: 1 as any,
          }),
        ],
      }), 'loans/0/loanAccountId', 'string');

      tester.pattern(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            loanAccountId: createAccountId('not-valid'),
          }),
        ],
      }), 'loans/0/loanAccountId');
    });

    describe('if data.loans[0].transactionId', () => {
      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            transactionId: 1 as any,
          }),
        ],
      }), 'loans/0/transactionId', 'string');

      tester.pattern(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            transactionId: createTransactionId('not-valid'),
          }),
        ],
      }), 'loans/0/transactionId');
    });

    describe('if data.loans[0].isSettled', () => {
      tester.type(createSplitTransactionRequest({
        loans: [
          createLoanRequestItem({
            isSettled: 1 as any,
          }),
        ],
      }), 'loans/0/isSettled', 'boolean');
    });
  });
});
