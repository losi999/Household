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
    startSession(): Promise<ClientSession>;
};

const createModel = <T extends keyof CollectionMapping>(collectionName: T, schema: Schema<CollectionMapping[T]>): Model<CollectionMapping[T]> => {
    return model(collectionName, schema);
};

export const mongodbServiceFactory = (): IMongodbService => {
    connect('mongodb+srv://admin:admin@household.4xisa.mongodb.net/household-LOCAL?retryWrites=true&w=majority', {
        autoIndex: true
    });

    return {
        startSession: () => startSession(),
        recipients: createModel('recipients', recipientSchema),
        projects: createModel('projects', projectSchema),
        transactions: createModel('transactions', transactionSchema),
        accounts: createModel('accounts', accountSchema),
        categories: createModel('categories', categorySchema),
    };
};