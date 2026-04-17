import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getAccountId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';

export interface IAccountDocumentConverter {
  create(body: Account.Request, expiresIn: number, generateId?: boolean): Account.Document;
  update(body: Account.Request, expiresIn: number): DocumentUpdate<Account.Document>;
  toReport(document: Account.Document): Account.Report;
  toResponse(document: Account.Document): Account.Response;
  toResponseList(docs: Account.Document[]): Account.Response[];
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
    update: (body, expiresIn): DocumentUpdate<Account.Document> => {
      return {
        update: {
          $set: {
            ...body,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
        },
      };
    },
    toResponse: ({ balance, accountType, currency, owner, name, isOpen, _id }) => {
      return {
        accountType,
        currency,
        owner,
        name,
        isOpen,
        fullName: `${name} (${owner})`,
        accountId: getAccountId(_id),
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
