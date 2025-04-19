import { Dictionary } from '@household/shared/types/common';
import { Account, Category, File, Internal, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { PopulateOptions, Types } from 'mongoose';

export const populate = (...populateOptions: (string | PopulateOptions)[]): PopulateOptions[] => {
  return populateOptions.map(p => {
    return typeof p === 'string' ? {
      path: p,
    } : p;
  });
};

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

export const toUndefined = (value: any) => {
  return value ? value : undefined;
};

export const createDate = (date: string): Date => {
  return date ? new Date(date) : undefined;
};

export const pushUnique = <T>(array: T[], item: T) => {
  if (item && !array.includes(item)) {
    array.push(item);
  }
};

export const parseStringToBoolean = (value: string): boolean => {
  return value === 'true' ? true : value === 'false' ? false : undefined;
};

export const generateMongoId = (): Types.ObjectId => new Types.ObjectId();
const getId = (doc: Internal.Id) => doc?._id?.toString() ?? doc?.toString();
export const getTransactionId = (doc: Transaction.Document | Transaction.RawReport | Types.ObjectId): Transaction.Id => getId(doc) as Transaction.Id;
export const getAccountId = (doc: Account.Document | Types.ObjectId): Account.Id => getId(doc) as Account.Id;
export const getProjectId = (doc: Project.Document | Types.ObjectId): Project.Id => getId(doc) as Project.Id;
export const getRecipientId = (doc: Recipient.Document | Types.ObjectId): Recipient.Id => getId(doc) as Recipient.Id;
export const getProductId = (doc: Product.Document | Types.ObjectId): Product.Id => getId(doc) as Product.Id;
export const getCategoryId = (doc: Category.Document | Types.ObjectId): Category.Id => getId(doc) as Category.Id;
export const getFileId = (doc: File.Document | Types.ObjectId): File.Id => getId(doc) as File.Id;
