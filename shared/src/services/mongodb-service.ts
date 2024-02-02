import { ClientSession, connect, model, startSession, connection } from 'mongoose';
import type { Model, Schema } from 'mongoose';
import { projectSchema } from '@household/shared/mongodb-schemas/project.schema';
import { accountSchema } from '@household/shared/mongodb-schemas/account.schema';
import { recipientSchema } from '@household/shared/mongodb-schemas/recipient.schema';
import { categorySchema } from '@household/shared/mongodb-schemas/category.schema';
import { productSchema } from '@household/shared/mongodb-schemas/product.schema';
import { transactionSchema } from '@household/shared/mongodb-schemas/transaction.schema';
import { Recipient, Project, Account, Category, Transaction, Product } from '@household/shared/types/types';

type CollectionMapping = {
  recipients: Recipient.Document;
  projects: Project.Document;
  transactions: Transaction.Document;
  accounts: Account.Document;
  categories: Category.Document;
  products: Product.Document;
};

export type IMongodbService = {
  [collection in keyof CollectionMapping]: () => Model<CollectionMapping[collection]>;
} & {
  inSession<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>
};

const createModel = <T extends keyof CollectionMapping>(collectionName: T, schema: Schema<CollectionMapping[T]>): Model<CollectionMapping[T]> => {
  const m = model<CollectionMapping[T]>(collectionName, schema);
  m.syncIndexes();
  return m;
};

export const mongodbServiceFactory = (mongodbConnectionString: string): IMongodbService => {
  const connectDb = () => {
    if (!connection || connection.readyState === 0) {
      connect(mongodbConnectionString, {
        autoIndex: true,
      });
    }
  };

  const models: {
    [collection in keyof CollectionMapping]: Model<CollectionMapping[collection]>;
  } = {
    recipients: createModel('recipients', recipientSchema),
    projects: createModel('projects', projectSchema),
    transactions: createModel('transactions', transactionSchema),
    accounts: createModel('accounts', accountSchema),
    categories: createModel('categories', categorySchema),
    products: createModel('products', productSchema),
  };

  return {
    inSession: async (fn) => {
      connectDb();
      const session = await startSession();
      const result = await fn(session);
      await session.endSession();
      return result;
    },
    recipients: () => {
      connectDb();
      return models.recipients;
    },
    projects: () => {
      connectDb();
      return models.projects;
    },
    transactions: () => {
      connectDb();
      return models.transactions;
    },
    accounts: () => {
      connectDb();
      return models.accounts;
    },
    categories: () => {
      connectDb();
      return models.categories;
    },
    products: () => {
      connectDb();
      return models.products;
    },
  };
};
