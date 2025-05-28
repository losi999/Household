import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getAccountId } from '@household/shared/common/utils';
import { Account } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IAccountDocumentConverter {
  create(body: Account.Request, expiresIn: number, generateId?: boolean): Account.Document;
  update(body: Account.Request, expiresIn: number): UpdateQuery<Account.Document>;
  toReport(document: Account.Document): Account.Report;
  toLeanResponse(document: Account.Document): Account.LeanResponse;
  toResponse(document: Account.AggregatedDocument): Account.Response;
  toResponseList(docs: Account.AggregatedDocument[]): Account.Response[];
}

export const accountDocumentConverterFactory = (): IAccountDocumentConverter => {
  const instance: IAccountDocumentConverter = {
    create: (body, expiresIn, generateId) => {
      return {
        ...body,
        isOpen: true,
        balance: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn): UpdateQuery<Account.Document> => {
      return {
        $set: {
          ...body,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };
    },
    toLeanResponse: ({ accountType, currency, owner, name, isOpen, _id }) => {
      return {
        accountType,
        currency,
        owner,
        name,
        isOpen,
        fullName: `${name} (${owner})`,
        accountId: getAccountId(_id),
      };
    },
    toResponse: ({ balance, ...doc }) => {
      return {
        ...instance.toLeanResponse(doc),
        balance,
      };
    },
    toReport: (document) => {
      return {
        accountId: getAccountId(document),
        currency: document.currency,
        fullName: `${document.name} (${document.owner})`,
      };
    },
    toResponseList: docs => docs.map(document => instance.toResponse(document)),
  };

  return instance;
};
