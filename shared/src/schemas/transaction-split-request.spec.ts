import { splitRequest } from '@household/shared/schemas/transaction';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Requests } from '@household/shared/types/requests';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Split transaction schema', () => {
  const tester = schemaTesterFactory<Requests.SplitTransaction>(splitRequest);

  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: undefined,
    }), 'without splits');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: undefined,
    }), 'with loans');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      description: undefined,
    }), 'without description');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      recipientId: undefined,
    }), 'without recipientId');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: [
        {
          categoryId: undefined,
        },
      ],
    }), 'without splits.categoryId');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: [
        {
          projectId: undefined,
        },
      ],
    }), 'without splits.projectId');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: [
        {
          description: undefined,
        },
      ],
    }), 'without splits.description');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: [
        {
          quantity: undefined,
          productId: undefined,
        },
      ],
    }), 'without splits.inventory');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: [
        {
          invoiceNumber: undefined,
          billingEndDate: undefined,
          billingStartDate: undefined,
        },
      ],
    }), 'without splits.invoice');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      splits: [
        {
          invoiceNumber: undefined,
        },
      ],
    }), 'without splits.invoiceNumber');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: [
        {
          categoryId: undefined,
        },
      ],
    }), 'without loans.categoryId');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: [
        {
          projectId: undefined,
        },
      ],
    }), 'without loans.projectId');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: [
        {
          description: undefined,
        },
      ],
    }), 'without loans.description');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: [
        {
          quantity: undefined,
          productId: undefined,
        },
      ],
    }), 'without loans.inventory');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: [
        {
          invoiceNumber: undefined,
          billingEndDate: undefined,
          billingStartDate: undefined,
        },
      ],
    }), 'without loans.invoice');

    tester.validateSuccess(testDataFactory.transaction.request.split({
      loans: [
        {
          invoiceNumber: undefined,
        },
      ],
    }), 'without loans.invoiceNumber');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.transaction.request.split(),
        extra: 1,
      } as any, 'data');

      describe('misses both splits and loans', () => {
        tester.required(testDataFactory.transaction.request.split({
          splits: undefined,
          loans: undefined,
        }), 'splits', '(splits)');

        tester.required(testDataFactory.transaction.request.split({
          splits: undefined,
          loans: undefined,
        }), 'loans', '(loans)');
      });
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.transaction.request.split({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.transaction.request.split({
        description: '',
      }), 'description', 1);
    });

    describe('if data.issuedAt', () => {
      tester.required(testDataFactory.transaction.request.split({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.type(testDataFactory.transaction.request.split({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.format(testDataFactory.transaction.request.split({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.required(testDataFactory.transaction.request.split({
        accountId: undefined,
      }), 'accountId');

      tester.type(testDataFactory.transaction.request.split({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        accountId: testDataFactory.account.id('not-valid'),
      }), 'accountId');
    });

    describe('if data.recipientId', () => {
      tester.type(testDataFactory.transaction.request.split({
        recipientId: 1 as any,
      }), 'recipientId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        recipientId: testDataFactory.recipient.id('not-valid'),
      }), 'recipientId');
    });

    describe('if data.splits', () => {
      tester.minItems(testDataFactory.transaction.request.split({
        splits: [],
      }), 'splits', 1);

      tester.additionalProperties(testDataFactory.transaction.request.split({
        splits: [
          {
            extra: 1,
          } as any,
        ],
      }), 'splits/0');
    });

    describe('if data.splits.amount', () => {
      tester.required(testDataFactory.transaction.request.split({
        splits: [
          {
            amount: undefined,
          },
        ],
      }), 'amount');

      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            amount: '1' as any,
          },
        ],
      }), 'splits/0/amount', 'number');
    });

    describe('if data.splits.description', () => {
      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            description: 1 as any,
          },
        ],
      }), 'splits/0/description', 'string');

      tester.minLength(testDataFactory.transaction.request.split({
        splits: [
          {
            description: '',
          },
        ],
      }), 'splits/0/description', 1);
    });

    describe('if data.splits.quantity', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        splits: [
          {
            productId: undefined,
          },
        ],
      }), 'quantity', 'productId');

      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            quantity: '1' as any,
          },
        ],
      }), 'splits/0/quantity', 'number');

      tester.exclusiveMinimum(testDataFactory.transaction.request.split({
        splits: [
          {
            quantity: 0,
          },
        ],
      }), 'splits/0/quantity', 0);
    });

    describe('if data.splits.productId', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        splits: [
          {
            quantity: undefined,
          },
        ],
      }), 'productId', 'quantity');

      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            productId: 1 as any,
          },
        ],
      }), 'splits/0/productId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        splits: [
          {
            productId: testDataFactory.product.id('not-valid'),
          },
        ],
      }), 'splits/0/productId');
    });

    describe('if data.splits.invoiceNumber', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        splits: [
          {
            billingEndDate: undefined,
            billingStartDate: undefined,
          },
        ],
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            invoiceNumber: 1 as any,
          },
        ],
      }), 'splits/0/invoiceNumber', 'string');

      tester.minLength(testDataFactory.transaction.request.split({
        splits: [
          {
            invoiceNumber: '',
          },
        ],
      }), 'splits/0/invoiceNumber', 1);
    });

    describe('if data.splits[0].billingEndDate', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        splits: [
          {
            billingStartDate: undefined,
          },
        ],
      }), 'billingEndDate', 'billingStartDate');

      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            billingEndDate: 1 as any,
          },
        ],
      }), 'splits/0/billingEndDate', 'string');

      tester.format(testDataFactory.transaction.request.split({
        splits: [
          {
            billingEndDate: 'not-date',
          },
        ],
      }), 'splits/0/billingEndDate', 'date');

      tester.formatExclusiveMinimum(testDataFactory.transaction.request.split({
        splits: [
          {
            billingEndDate: '2022-01-01',
            billingStartDate: '2022-12-31',
          },
        ],
      }), 'splits/0/billingEndDate');
    });

    describe('if data.splits[0].billingStartDate', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        splits: [
          {
            billingEndDate: undefined,
          },
        ],
      }), 'billingStartDate', 'billingEndDate');

      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            billingStartDate: 1 as any,
          },
        ],
      }), 'splits/0/billingStartDate', 'string');

      tester.format(testDataFactory.transaction.request.split({
        splits: [
          {
            billingStartDate: 'not-date',
          },
        ],
      }), 'splits/0/billingStartDate', 'date');
    });

    describe('if data.splits[0].categoryId', () => {
      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            categoryId: 1 as any,
          },
        ],
      }), 'splits/0/categoryId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        splits: [
          {
            categoryId: testDataFactory.category.id('not-valid'),
          },
        ],
      }), 'splits/0/categoryId');
    });

    describe('if data.splits[0].projectId', () => {
      tester.type(testDataFactory.transaction.request.split({
        splits: [
          {
            projectId: 1 as any,
          },
        ],
      }), 'splits/0/projectId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        splits: [
          {
            projectId: testDataFactory.project.id('not-valid'),
          },
        ],
      }), 'splits/0/projectId');
    });

    describe('if data.loans', () => {
      tester.minItems(testDataFactory.transaction.request.split({
        loans: [],
      }), 'loans', 1);

      tester.additionalProperties(testDataFactory.transaction.request.split({
        loans: [
          {
            extra: 1,
          } as any,
        ],
      }), 'loans/0');
    });

    describe('if data.loans.amount', () => {
      tester.required(testDataFactory.transaction.request.split({
        loans: [
          {
            amount: undefined,
          },
        ],
      }), 'amount');

      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            amount: '1' as any,
          },
        ],
      }), 'loans/0/amount', 'number');

      tester.exclusiveMaximum(testDataFactory.transaction.request.split({
        loans: [
          {
            amount: 1,
            loanAccountId: testDataFactory.account.id(),
          },
        ],
      }), 'loans/0/amount', 0);
    });

    describe('if data.loans.description', () => {
      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            description: 1 as any,
          },
        ],
      }), 'loans/0/description', 'string');

      tester.minLength(testDataFactory.transaction.request.split({
        loans: [
          {
            description: '',
          },
        ],
      }), 'loans/0/description', 1);
    });

    describe('if data.loans.quantity', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        loans: [
          {
            productId: undefined,
          },
        ],
      }), 'quantity', 'productId');

      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            quantity: '1' as any,
          },
        ],
      }), 'loans/0/quantity', 'number');

      tester.exclusiveMinimum(testDataFactory.transaction.request.split({
        loans: [
          {
            quantity: 0,
          },
        ],
      }), 'loans/0/quantity', 0);
    });

    describe('if data.loans.productId', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        loans: [
          {
            quantity: undefined,
          },
        ],
      }), 'productId', 'quantity');

      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            productId: 1 as any,
          },
        ],
      }), 'loans/0/productId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        loans: [
          {
            productId: testDataFactory.product.id('not-valid'),
          },
        ],
      }), 'loans/0/productId');
    });

    describe('if data.loans.invoiceNumber', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        loans: [
          {
            billingEndDate: undefined,
            billingStartDate: undefined,
          },
        ],
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            invoiceNumber: 1 as any,
          },
        ],
      }), 'loans/0/invoiceNumber', 'string');

      tester.minLength(testDataFactory.transaction.request.split({
        loans: [
          {
            invoiceNumber: '',
          },
        ],
      }), 'loans/0/invoiceNumber', 1);
    });

    describe('if data.loans[0].billingEndDate', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        loans: [
          {
            billingStartDate: undefined,
          },
        ],
      }), 'billingEndDate', 'billingStartDate');

      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            billingEndDate: 1 as any,
          },
        ],
      }), 'loans/0/billingEndDate', 'string');

      tester.format(testDataFactory.transaction.request.split({
        loans: [
          {
            billingEndDate: 'not-date',
          },
        ],
      }), 'loans/0/billingEndDate', 'date');

      tester.formatExclusiveMinimum(testDataFactory.transaction.request.split({
        loans: [
          {
            billingEndDate: '2022-01-01',
            billingStartDate: '2022-12-31',
          },
        ],
      }), 'loans/0/billingEndDate');
    });

    describe('if data.loans[0].billingStartDate', () => {
      tester.dependentRequired(testDataFactory.transaction.request.split({
        loans: [
          {
            billingEndDate: undefined,
          },
        ],
      }), 'billingStartDate', 'billingEndDate');

      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            billingStartDate: 1 as any,
          },
        ],
      }), 'loans/0/billingStartDate', 'string');

      tester.format(testDataFactory.transaction.request.split({
        loans: [
          {
            billingStartDate: 'not-date',
          },
        ],
      }), 'loans/0/billingStartDate', 'date');
    });

    describe('if data.loans[0].categoryId', () => {
      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            categoryId: 1 as any,
          },
        ],
      }), 'loans/0/categoryId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        loans: [
          {
            categoryId: testDataFactory.category.id('not-valid'),
          },
        ],
      }), 'loans/0/categoryId');
    });

    describe('if data.loans[0].projectId', () => {
      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            projectId: 1 as any,
          },
        ],
      }), 'loans/0/projectId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        loans: [
          {
            projectId: testDataFactory.project.id('not-valid'),
          },
        ],
      }), 'loans/0/projectId');
    });

    describe('if data.loans[0].loanAccountId', () => {
      tester.required(testDataFactory.transaction.request.split({
        loans: [
          {
            loanAccountId: undefined,
          },
        ],
      }), 'loanAccountId');
      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            loanAccountId: 1 as any,
          },
        ],
      }), 'loans/0/loanAccountId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        loans: [
          {
            loanAccountId: testDataFactory.account.id('not-valid'),
          },
        ],
      }), 'loans/0/loanAccountId');
    });

    describe('if data.loans[0].transactionId', () => {
      tester.type(testDataFactory.transaction.request.split({
        loans: [
          {
            transactionId: 1 as any,
          },
        ],
      }), 'loans/0/transactionId', 'string');

      tester.pattern(testDataFactory.transaction.request.split({
        loans: [
          {
            transactionId: testDataFactory.transaction.id('not-valid'),
          },
        ],
      }), 'loans/0/transactionId');
    });
  });
});
