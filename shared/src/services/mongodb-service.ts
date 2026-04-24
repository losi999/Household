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

type CollectionModels = {
  [K in keyof CollectionMapping]: Model<CollectionMapping[K]>;
};

type ModelFunction<C extends keyof CollectionModels> = <R>(callback: (model: CollectionModels[C], session: ClientSession) => Promise<R>) => Promise<R>;

export type IMongodbService = {
  [collection in keyof CollectionMapping]: ModelFunction<collection>
} & {
  inTransaction<T>(callback: (models: CollectionModels, session: ClientSession) => Promise<T>): Promise<T>;
  syncIndexes(): Promise<unknown>;
  dump(): Promise<{[K in keyof CollectionMapping]: CollectionMapping[K][]}>;
};

let connection: Connection;
set('debug', !process.env.ENV ? (collectionName, methodName, ...methodArgs) => {
  const safeArgs = methodArgs.map(({ session, ...arg }) => {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      console.debug('Could not serialize argument for mongoose debug log', arg);
      return '[unserializable]';
    }
  });

  console.debug(`mongoose: ${collectionName}.${methodName}`, ...safeArgs);
} : false);

export const mongodbServiceFactory = async (mongodbConnectionString: string): Promise<IMongodbService> => {
  const connectDb = async () => {
    if (!connection || connection.readyState === 0) {
      connection = createConnection(mongodbConnectionString, {
        autoIndex: false,
        connectTimeoutMS: 480000,
        serverSelectionTimeoutMS: 480000,
      });
    }
  };

  await connectDb();

  const models = (): CollectionModels => ({
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
  });

  const getModel = <C extends keyof CollectionMapping>(collection: C): ModelFunction<C> => async (callback) => {
    await connectDb();
    const session = await connection.startSession();
    const result = await callback(models()[collection], session);
    await session.endSession();
    return result;
  };

  const instance: IMongodbService = {
    inTransaction: async (callback) => {
      await connectDb();
      const session = await connection.startSession();
      const result = await session.withTransaction(async () => {
        return callback(models(), session);
      });
      session.endSession();
      return result;
    },
    syncIndexes: () => connection.syncIndexes(),
    dump: async () => {
      await connectDb();
      const session = await connection.startSession();
      const result = {
        accounts: await models().accounts.find({}).session(session)
          .lean(),
        recipients: await models().recipients.find({}).session(session)
          .lean(),
        projects: await models().projects.find({}).session(session)
          .lean(),
        transactions: await models().transactions.find({}).session(session)
          .lean(),
        categories: await models().categories.find({}).session(session)
          .lean(),
        products: await models().products.find({}).session(session)
          .lean(),
        files: await models().files.find({}).session(session)
          .lean(),
        settings: await models().settings.find({}).session(session)
          .lean(),
        customers: await models().customers.find({}).session(session)
          .lean(),
        prices: await models().prices.find({}).session(session)
          .lean(),
        calendarEntries: await models().calendarEntries.find({}).session(session)
          .lean(),
        calendarDays: await models().calendarDays.find({}).session(session)
          .lean(),
      };
      session.endSession();
      return result;
    },
    recipients: getModel('recipients'),
    projects: getModel('projects'),
    transactions: getModel('transactions'),
    accounts: getModel('accounts'),
    categories: getModel('categories'),
    products: getModel('products'),
    files: getModel('files'),
    settings: getModel('settings'),
    customers: getModel('customers'),
    prices: getModel('prices'),
    calendarEntries: getModel('calendarEntries'),
    calendarDays: getModel('calendarDays'),
  };

  return instance;
};
