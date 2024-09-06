import { createConnection, set } from 'mongoose';
import type { Connection, Model, ClientSession } from 'mongoose';
import { projectSchema } from '@household/shared/mongodb-schemas/project.schema';
import { accountSchema } from '@household/shared/mongodb-schemas/account.schema';
import { recipientSchema } from '@household/shared/mongodb-schemas/recipient.schema';
import { categorySchema } from '@household/shared/mongodb-schemas/category.schema';
import { productSchema } from '@household/shared/mongodb-schemas/product.schema';
import { transactionSchema } from '@household/shared/mongodb-schemas/transaction.schema';
import { Recipient, Project, Account, Category, Transaction, Product, File } from '@household/shared/types/types';
import { fileSchema } from '@household/shared/mongodb-schemas/file.schema';
console.log('mongodb service 1');

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

let connection: Connection;
console.log('mongodb service 2');
set('debug', (!process.env.ENV || process.env.ENV === 'LOCAL') ? {
  color: false,
  shell: true,
} : false);

export const mongodbServiceFactory = (mongodbConnectionString: string): IMongodbService => {
  console.log('factory', connection?.readyState);
  if (!connection || connection.readyState === 0) {
    console.log('pre create connnect');
    connection = createConnection(mongodbConnectionString, {
      autoIndex: true,
      connectTimeoutMS: 480000,
      serverSelectionTimeoutMS: 480000,
    });
    connection.on('connecting', (args) => {
      console.log('connecting', args);
    });
    connection.on('connected', (args) => {
      console.log('connected', args);
    });
    connection.on('open', (args) => {
      console.log('open', args);
    });
    connection.on('disconnecting', (args) => {
      console.log('disconnecting', args);
    });
    connection.on('disconnected', (args) => {
      console.log('disconnected', args);
    });
    connection.on('close', (args) => {
      console.log('close', args);
    });
    connection.on('reconnected', (args) => {
      console.log('reconnected', args);
    });
    connection.on('error', (args) => {
      console.log('error', args);
    });
    connection.on('fullsetup', (args) => {
      console.log('fullsetup', args);
    });
    connection.on('all', (args) => {
      console.log('all', args);
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
    recipients: connection.model('recipients', recipientSchema),
    projects: connection.model('projects', projectSchema),
    transactions: connection.model('transactions', transactionSchema),
    accounts: connection.model('accounts', accountSchema),
    categories: connection.model('categories', categorySchema),
    products: connection.model('products', productSchema),
    files: connection.model('files', fileSchema),
  };
};
