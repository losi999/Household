import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getAccountId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';

export interface IAccountDocumentConverter {
  create(body: Requests.Account, expiresIn: number, generateId?: boolean): Documents.Account;
  update(body: Requests.Account, expiresIn: number): DocumentUpdate<Documents.Account>;
  toReport(document: Documents.Account): Account.Report;
  toResponse(document: Documents.Account): Responses.Account;
  toResponseList(docs: Documents.Account[]): Responses.Account[];
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
    update: (body, expiresIn): DocumentUpdate<Documents.Account> => {
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
