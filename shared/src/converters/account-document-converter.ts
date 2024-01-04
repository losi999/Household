import { generateMongoId } from '@household/shared/common/test-data-factory';
import { addSeconds, getAccountId } from '@household/shared/common/utils';
import { Restrict } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';

export interface IAccountDocumentConverter {
  create(body: Account.Request, expiresIn: number, generateId?: boolean): Account.Document;
  update(data: {
    document: Restrict<Account.Document, 'updatedAt'>;
    body: Account.Request
  }, expiresIn: number): Account.Document;
  toReport(document: Account.Document): Account.Report;
  toResponse(document: Account.Document): Account.Response;
  toResponseList(docs: Account.Document[]): Account.Response[];
}

export const accountDocumentConverterFactory = (): IAccountDocumentConverter => {
  const instance: IAccountDocumentConverter = {
    create: (body, expiresIn, generateId): Account.Document => {
      return {
        ...body,
        isOpen: true,
        balance: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ document: { _id, createdAt }, body }, expiresIn): Account.Document => {
      return {
        ...instance.create(body, expiresIn),
        _id,
        createdAt,
      };
    },
    toResponse: (document): Account.Response => {
      return {
        ...document,
        balance: document.balance ?? null,
        fullName: `${document.name} (${document.owner})`,
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
        accountId: getAccountId(document),
      };
    },
    toReport: (document): Account.Report => {
      return {
        accountId: getAccountId(document),
        currency: document.currency,
        name: document.name,
      };
    },
    toResponseList: docs => docs.map(document => instance.toResponse(document)),
  };

  return instance;
};
