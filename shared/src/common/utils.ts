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
export const getTransactionId = (doc: Transaction.Document): Transaction.IdType => getId(doc) as Transaction.IdType;
export const getAccountId = (doc: Account.Document): Account.IdType => getId(doc) as Account.IdType;
export const getProjectId = (doc: Project.Document): Project.IdType => getId(doc) as Project.IdType;
export const getRecipientId = (doc: Recipient.Document): Recipient.IdType => getId(doc) as Recipient.IdType;
export const getProductId = (doc: Product.Document): Product.IdType => getId(doc) as Product.IdType;
export const getCategoryId = (doc: Category.Document): Category.IdType => getId(doc) as Category.IdType;
