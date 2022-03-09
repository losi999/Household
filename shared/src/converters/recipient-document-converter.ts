import { addSeconds } from '@household/shared/common/utils';
import { Restrict } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';

export interface IRecipientDocumentConverter {
  create(body: Recipient.Request, expiresIn: number): Recipient.Document;
  update(data: { document: Restrict<Recipient.Document, 'updatedAt'>; body: Recipient.Request }, expiresIn: number): Recipient.Document;
  toResponse(doc: Recipient.Document): Recipient.Response;
  toResponseList(docs: Recipient.Document[]): Recipient.Response[];
}

export const recipientDocumentConverterFactory = (): IRecipientDocumentConverter => {
  const instance: IRecipientDocumentConverter = {
    create: (body, expiresIn): Recipient.Document => {
      return {
        ...body,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ document, body }, expiresIn): Recipient.Document => {
      return {
        ...document,
        ...body,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc): Recipient.Response => {
      return {
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        recipientId: doc._id.toString() as Recipient.IdType,
      }
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};