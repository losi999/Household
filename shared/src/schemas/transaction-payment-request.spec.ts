import { paymentRequest } from '@household/shared/schemas/transaction';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Requests } from '@household/shared/types/requests';

describe('Payment transaction schema', () => {

  const tester = schemaTesterFactory<Requests.PaymentTransaction>(paymentRequest);

  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.transaction.request.payment(), 'without loanAccountId');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      loanAccountId: testDataFactory.account.id(),
      amount: -100,
    }), 'with loanAccountId');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      description: undefined,
    }), 'without description');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      categoryId: undefined,
    }), 'without categoryId');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      recipientId: undefined,
    }), 'without recipientId');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      projectId: undefined,
    }), 'without projectId');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      quantity: undefined,
      productId: undefined,
    }), 'without inventory');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      invoiceNumber: undefined,
      billingEndDate: undefined,
      billingStartDate: undefined,
    }), 'without invoice');

    tester.validateSuccess(testDataFactory.transaction.request.payment({
      invoiceNumber: undefined,
    }), 'without invoiceNumber');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.transaction.request.payment(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.required(testDataFactory.transaction.request.payment({
        amount: undefined,
      }), 'amount');

      tester.type(testDataFactory.transaction.request.payment({
        amount: '1' as any,
      }), 'amount', 'number');

      tester.exclusiveMaximum(testDataFactory.transaction.request.payment({
        loanAccountId: testDataFactory.account.id(),
        amount: 100,
      }), 'amount', 0, 'if loanAccountId is set');
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.transaction.request.payment({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.transaction.request.payment({
        description: '',
      }), 'description', 1);
    });

    describe('if data.quantity', () => {
      tester.dependentRequired(testDataFactory.transaction.request.payment({
        productId: undefined,
      }), 'quantity', 'productId');

      tester.type(testDataFactory.transaction.request.payment({
        quantity: '1' as any,
      }), 'quantity', 'number');

      tester.exclusiveMinimum(testDataFactory.transaction.request.payment({
        quantity: 0,
      }), 'quantity', 0);
    });

    describe('if data.productId', () => {
      tester.dependentRequired(testDataFactory.transaction.request.payment({
        quantity: undefined,
      }), 'productId', 'quantity');

      tester.type(testDataFactory.transaction.request.payment({
        productId: 1 as any,
      }), 'productId', 'string');

      tester.pattern(testDataFactory.transaction.request.payment({
        productId: testDataFactory.product.id('not-valid'),
      }), 'productId');
    });

    describe('if data.invoiceNumber', () => {
      tester.dependentRequired(testDataFactory.transaction.request.payment({
        billingEndDate: undefined,
        billingStartDate: undefined,
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.type(testDataFactory.transaction.request.payment({
        invoiceNumber: 1 as any,
      }), 'invoiceNumber', 'string');

      tester.minLength(testDataFactory.transaction.request.payment({
        invoiceNumber: '',
      }), 'invoiceNumber', 1);
    });

    describe('if data.billingEndDate', () => {
      tester.dependentRequired(testDataFactory.transaction.request.payment({
        billingStartDate: undefined,
      }), 'billingEndDate', 'billingStartDate');

      tester.type(testDataFactory.transaction.request.payment({
        billingEndDate: 1 as any,
      }), 'billingEndDate', 'string');

      tester.format(testDataFactory.transaction.request.payment({
        billingEndDate: 'not-date',
      }), 'billingEndDate', 'date');

      tester.formatExclusiveMinimum(testDataFactory.transaction.request.payment({
        billingEndDate: '2022-01-01',
        billingStartDate: '2022-12-31',
      }), 'billingEndDate');
    });

    describe('if data.billingStartDate', () => {
      tester.dependentRequired(testDataFactory.transaction.request.payment({
        billingEndDate: undefined,
      }), 'billingStartDate', 'billingEndDate');

      tester.type(testDataFactory.transaction.request.payment({
        billingStartDate: 1 as any,
      }), 'billingStartDate', 'string');

      tester.format(testDataFactory.transaction.request.payment({
        billingStartDate: 'not-date',
      }), 'billingStartDate', 'date');

    });

    describe('if data.issuedAt', () => {
      tester.required(testDataFactory.transaction.request.payment({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.type(testDataFactory.transaction.request.payment({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.format(testDataFactory.transaction.request.payment({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.required(testDataFactory.transaction.request.payment({
        accountId: undefined,
      }), 'accountId');

      tester.type(testDataFactory.transaction.request.payment({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.pattern(testDataFactory.transaction.request.payment({
        accountId: testDataFactory.account.id('not-valid'),
      }), 'accountId');
    });

    describe('if data.categoryId', () => {
      tester.type(testDataFactory.transaction.request.payment({
        categoryId: 1 as any,
      }), 'categoryId', 'string');

      tester.pattern(testDataFactory.transaction.request.payment({
        categoryId: testDataFactory.category.id('not-valid'),
      }), 'categoryId');
    });

    describe('if data.recipientId', () => {
      tester.type(testDataFactory.transaction.request.payment({
        recipientId: 1 as any,
      }), 'recipientId', 'string');

      tester.pattern(testDataFactory.transaction.request.payment({
        recipientId: testDataFactory.recipient.id('not-valid'),
      }), 'recipientId');
    });

    describe('if data.projectId', () => {
      tester.type(testDataFactory.transaction.request.payment({
        projectId: 1 as any,
      }), 'projectId', 'string');

      tester.pattern(testDataFactory.transaction.request.payment({
        projectId: testDataFactory.project.id('not-valid'),
      }), 'projectId');
    });

    describe('if data.loanAccountId', () => {
      tester.type(testDataFactory.transaction.request.payment({
        loanAccountId: 1 as any,
      }), 'loanAccountId', 'string');

      tester.pattern(testDataFactory.transaction.request.payment({
        loanAccountId: testDataFactory.account.id('not-valid'),
      }), 'loanAccountId');
    });
  });
});
