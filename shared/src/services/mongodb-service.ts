import { ClientSession, connect, model, startSession } from 'mongoose';
import type { Model, Schema } from 'mongoose';
import { projectSchema } from '@household/shared/mongodb-schemas/project.schema';
import { accountSchema } from '@household/shared/mongodb-schemas/account.schema';
import { recipientSchema } from '@household/shared/mongodb-schemas/recipient.schema';
import { categorySchema } from '@household/shared/mongodb-schemas/category.schema';
import { transactionSchema } from '@household/shared/mongodb-schemas/transaction.schema';
import { Recipient, Project, Account, Category, Transaction } from '@household/shared/types/types';

type CollectionMapping = {
    recipients: Recipient.Document;
    projects: Project.Document;
    transactions: Transaction.Document;
    accounts: Account.Document;
    categories: Category.Document;
};

export type IMongodbService = {
    [collection in keyof CollectionMapping]: Model<CollectionMapping[collection]>;
} & {
    inSession<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>
};

const createModel = <T extends keyof CollectionMapping>(collectionName: T, schema: Schema<CollectionMapping[T]>): Model<CollectionMapping[T]> => {
    return model(collectionName, schema);
};

export const mongodbServiceFactory = (): IMongodbService => {
    connect(process.env.MONGODB_CONNECTION_STRING, {
        autoIndex: true
    });


    return {
        inSession: async (fn) => {
            const session = await startSession();
            const result = await fn(session);
            await session.endSession();
            return result;
        },
        recipients: createModel('recipients', recipientSchema),
        projects: createModel('projects', projectSchema),
        transactions: createModel('transactions', transactionSchema),
        accounts: createModel('accounts', accountSchema),
        categories: createModel('categories', categorySchema),
    };
};