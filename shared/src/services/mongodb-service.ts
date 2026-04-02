import { createConnection, set } from 'mongoose';
import type { Connection, Model, ClientSession } from 'mongoose';
import { projectSchema } from '@household/shared/mongodb-schemas/project.schema';
import { accountSchema } from '@household/shared/mongodb-schemas/account.schema';
import { recipientSchema } from '@household/shared/mongodb-schemas/recipient.schema';
import { categorySchema } from '@household/shared/mongodb-schemas/category.schema';
import { productSchema } from '@household/shared/mongodb-schemas/product.schema';
import { transactionSchema } from '@household/shared/mongodb-schemas/transaction.schema';
import { Recipient, Project, Account, Category, Transaction, Product, File, Setting, Customer, Price, Calendar } from '@household/shared/types/types';
import { fileSchema } from '@household/shared/mongodb-schemas/file.schema';
import { settingSchema } from '@household/shared/mongodb-schemas/setting.schema';
import { customerSchema } from '@household/shared/mongodb-schemas/customer.schema';
import { priceSchema } from '@household/shared/mongodb-schemas/price.schema';
import { calendarEntrySchema } from '@household/shared/mongodb-schemas/calendar-entry.schema';
import { calendarDaySchema } from '@household/shared/mongodb-schemas/calendar-day.schema';
console.log('mongodb service 1');

type CollectionMapping = {
  recipients: Recipient.Document;
  projects: Project.Document;
  transactions: Transaction.Document;
  accounts: Account.Document;
  categories: Category.Document;
  products: Product.Document;
  files: File.Document;
  settings: Setting.Document;
  customers: Customer.Document;
  prices: Price.Document;
  calendarEntries: Calendar.Entry.Document;
  calendarDays: Calendar.Day.Document;
};

export type IMongodbService = {
  [collection in keyof CollectionMapping]: Model<CollectionMapping[collection]>;
} & {
  inSession<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>;
  syncIndexes(): Promise<unknown>;
  dump(): Promise<{[K in keyof CollectionMapping]: CollectionMapping[K][]}>
};

let connection: Connection;
console.log('mongodb service 2');
set('debug', (!process.env.ENV || process.env.ENV === 'LOCAL') ? (collectionName, methodName, ...methodArgs) => {
  const safeArgs = methodArgs.map(({ session, ...arg }) => {
    try {
      return JSON.stringify(arg);
    } catch {
      console.debug('Could not serialize argument for mongoose debug log', arg);
      return '[unserializable]';
    }
  });

  console.debug(`mongoose: ${collectionName}.${methodName}`, ...safeArgs);
} : false);

export const mongodbServiceFactory = (mongodbConnectionString: string): IMongodbService => {
  console.log('factory', connection?.readyState);
  if (!connection || connection.readyState === 0) {
    console.log('pre create connnect');
    connection = createConnection(mongodbConnectionString, {
      autoIndex: false,
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

  const instance: IMongodbService = {
    inSession: async (fn) => {
      const session = await connection.startSession();
      const result = await fn(session);
      await session.endSession();
      return result;
    },
    syncIndexes: () => connection.syncIndexes(),
    dump: async () => {
      return instance.inSession(async(session) => {
        return {
          accounts: await instance.accounts.find({}).session(session)
            .lean(),
          recipients: await instance.recipients.find({}).session(session)
            .lean(),
          projects: await instance.projects.find({}).session(session)
            .lean(),
          transactions: await instance.transactions.find({}).session(session)
            .lean(),
          categories: await instance.categories.find({}).session(session)
            .lean(),
          products: await instance.products.find({}).session(session)
            .lean(),
          files: await instance.files.find({}).session(session)
            .lean(),
          settings: await instance.settings.find({}).session(session)
            .lean(),
          customers: await instance.customers.find({}).session(session)
            .lean(),
          prices: await instance.prices.find({}).session(session)
            .lean(),
          calendarEntries: await instance.calendarEntries.find({}).session(session)
            .lean(),
          calendarDays: await instance.calendarDays.find({}).session(session)
            .lean(),
        };
      });
    },
    recipients: connection.model('recipients', recipientSchema),
    projects: connection.model('projects', projectSchema),
    transactions: connection.model('transactions', transactionSchema),
    accounts: connection.model('accounts', accountSchema),
    categories: connection.model('categories', categorySchema),
    products: connection.model('products', productSchema),
    files: connection.model('files', fileSchema),
    settings: connection.model('settings', settingSchema),
    customers: connection.model('customers', customerSchema),
    prices: connection.model('prices', priceSchema),
    calendarEntries: connection.model('calendarEntries', calendarEntrySchema),
    calendarDays: connection.model('calendarDays', calendarDaySchema),
    
  };

  return instance;
};
