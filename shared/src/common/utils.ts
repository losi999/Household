import { Dictionary } from '@household/shared/types/common';
import { Account, Category, Internal, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

export const addSeconds = (seconds: number, dateFrom?: Date): Date => {
  if (dateFrom) {
    return new Date(dateFrom.getTime() + seconds * 1000);
  }
  return new Date(Date.now() + seconds * 1000);
};

export const toDictionary = <P>(docs: P[], key: keyof P): Dictionary<P> => {
  return docs.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue[key].toString()]: currentValue,
    };
  }, {});
};

const getId = (doc: Internal.Id) => doc?._id.toString();
export const getTransactionId = (doc: Transaction.Document): Transaction.Id => getId(doc) as Transaction.Id;
export const getAccountId = (doc: Account.Document): Account.Id => getId(doc) as Account.Id;
export const getProjectId = (doc: Project.Document): Project.Id => getId(doc) as Project.Id;
export const getRecipientId = (doc: Recipient.Document): Recipient.Id => getId(doc) as Recipient.Id;
export const getProductId = (doc: Product.Document): Product.Id => getId(doc) as Product.Id;
export const getCategoryId = (doc: Category.Document): Category.Id => getId(doc) as Category.Id;
