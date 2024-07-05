import { faker } from '@faker-js/faker';
import { Transaction } from '@household/shared/types/types';

export const isLocalhost = () => {
  return Cypress.env('ENV') === 'localhost';
};

export const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;

export const expectRemainingProperties = (internal: object) => {
  Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf([
    '_id',
    'createdAt',
    'expiresAt',
    'updatedAt',
  ]));
};

export const expectEmptyObject = (obj: object, message: string) => {
  expect(obj, message).to.deep.equal({});
};

export const flattenSplitTransactionDocument = (document: Transaction.SplitDocument, ...splits: (Transaction.SplitDocumentItem | Transaction.DeferredDocument)[]): Transaction.ReportDocument[] => {
  const { _id, account, issuedAt, recipient, transactionType } = document;

  return splits.map(split => {
    return {
      _id,
      account: (split as Transaction.DeferredDocument).ownerAccount ?? account,
      issuedAt,
      recipient,
      transactionType,
      amount: split.amount,
      billingEndDate: split.billingEndDate,
      billingStartDate: split.billingStartDate,
      invoiceNumber: split.invoiceNumber,
      product: split.product,
      category: split.category,
      project: split.project,
      description: split.description,
      quantity: split.quantity,
      splitId: split._id.toString() as Transaction.Id,
    };
  });

};
