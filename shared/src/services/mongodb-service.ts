import { createConnection, set } from 'mongoose';
import type { Connection, Model, Schema, ClientSession } from 'mongoose';
import { projectSchema } from '@household/shared/mongodb-schemas/project.schema';
import { accountSchema } from '@household/shared/mongodb-schemas/account.schema';
import { recipientSchema } from '@household/shared/mongodb-schemas/recipient.schema';
import { categorySchema } from '@household/shared/mongodb-schemas/category.schema';
import { productSchema } from '@household/shared/mongodb-schemas/product.schema';
import { transactionSchema } from '@household/shared/mongodb-schemas/transaction.schema';
import { Recipient, Project, Account, Category, Transaction, Product, File } from '@household/shared/types/types';
import { fileSchema } from '@household/shared/mongodb-schemas/file.schema';

type CollectionMapping = {
  recipients: Recipient.Document;
  projects: Project.Document;
  transactions: Transaction.Document;
  accounts: Account.Document;
  categories: Category.Document;
  products: Product.Document;
  files: File.Document;
};

export type IMongodbService = {
  [collection in keyof CollectionMapping]: Model<CollectionMapping[collection]>;
} & {
  inSession<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>;
};

const createModel = <T extends keyof CollectionMapping>(collectionName: T, schema: Schema<CollectionMapping[T]>): Model<CollectionMapping[T]> => {
  const m = connection.model<CollectionMapping[T]>(collectionName, schema);
  m.syncIndexes();
  return m;
};

let connection: Connection;
set('debug', true);

export const mongodbServiceFactory = (mongodbConnectionString: string): IMongodbService => {
  console.log('factory', connection?.readyState);
  if (!connection || connection.readyState === 0) {
    console.log('pre create connnect');
    connection = createConnection(mongodbConnectionString, {
      autoIndex: true,
    });
    console.log('post create connect', connection?.readyState);
  }

  return {
    inSession: async (fn) => {
      const session = await connection.startSession();
      const result = await fn(session);
      await session.endSession();
      return result;
    },
    recipients: createModel('recipients', recipientSchema),
    projects: createModel('projects', projectSchema),
    transactions: createModel('transactions', transactionSchema),
    accounts: createModel('accounts', accountSchema),
    categories: createModel('categories', categorySchema),
    products: createModel('products', productSchema),
    files: createModel('files', fileSchema),
  };
};
