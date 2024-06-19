import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { paymentTransactionDocumentConverter } from '@household/shared/dependencies/converters/payment-transaction-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';

export const paymentTransactionDataFactory = (() => {
  const createPaymentTransactionRequest: DataFactoryFunction<Transaction.PaymentRequest> = (req) => {
    const billingEndDate = faker.date.recent();
    return {
      amount: faker.number.float({
        min: -10000,
        max: 10000,
      }),
      billingEndDate: billingEndDate.toISOString(),
      billingStartDate: faker.date.recent({
        refDate: billingEndDate,
        days: 90,
      }).toISOString(),
      invoiceNumber: faker.finance.accountNumber(),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      issuedAt: faker.date.recent().toISOString(),
      quantity: faker.number.float({
        max: 20,
      }),
      productId: undefined,
      projectId: undefined,
      accountId: undefined,
      categoryId: undefined,
      loanAccountId: undefined,
      recipientId: undefined,
      ...req,
    };
  };

  const createPaymentTransactionDocument = (ctx: {
    body?: Partial<Transaction.PaymentRequest>;
    account: Account.Document;
    category?: Category.Document;
    product?: Product.Document;
    project?: Project.Document;
    recipient?: Recipient.Document;
  }): Transaction.PaymentDocument => {
    if (ctx.account.accountType === 'loan') {
      throw 'Account cannot be loan in payment transaction';
    }

    return paymentTransactionDocumentConverter.create({
      body: createPaymentTransactionRequest({
        ...ctx.body,
        accountId: getAccountId(ctx.account),
        categoryId: getCategoryId(ctx.category),
        productId: getProductId(ctx.product),
        projectId: getProjectId(ctx.project),
        recipientId: getRecipientId(ctx.recipient),
      }),
      account: ctx.account,
      category: ctx.category,
      product: ctx.product,
      project: ctx.project,
      recipient: ctx.recipient,
    }, Cypress.env('EXPIRES_IN'), true);
  };

  return {
    request: createPaymentTransactionRequest,
    document: createPaymentTransactionDocument,
    id: (createId<Transaction.Id>),
  };
})();
