import { addSeconds } from '@household/shared/common/utils';
import { Restrict } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';

export interface IAccountDocumentConverter {
  create(body: Account.Request, expiresIn: number): Account.Document;
  update(data: {
    document: Restrict<Account.Document, 'updatedAt'>;
    body: Account.Request
  }, expiresIn: number): Account.Document;
  toResponse(document: Account.Document): Account.Response;
  toResponseList(docs: Account.Document[]): Account.Response[];
}

export const accountDocumentConverterFactory = (): IAccountDocumentConverter => {
  const instance: IAccountDocumentConverter = {
    create: (body, expiresIn): Account.Document => {
      return {
        ...body,
        isOpen: true,
        balance: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ document, body }, expiresIn): Account.Document => {
      return {
        ...document,
        ...body,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (document): Account.Response => {
      return {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        accountId: document._id.toString() as Account.IdType,
      }
    },
    toResponseList: docs => docs.map(document => instance.toResponse(document)),
  };

  return instance;
};