import { generateMongoId } from '@household/shared/common/test-data-factory';
import { addSeconds, getRecipientId } from '@household/shared/common/utils';
import { Restrict } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';

export interface IRecipientDocumentConverter {
  create(body: Recipient.Request, expiresIn: number, generateId?: boolean): Recipient.Document;
  update(data: { document: Restrict<Recipient.Document, 'updatedAt'>; body: Recipient.Request }, expiresIn: number): Recipient.Document;
  toResponse(doc: Recipient.Document): Recipient.Response;
  toReport(doc: Recipient.Document): Recipient.Report;
  toResponseList(docs: Recipient.Document[]): Recipient.Response[];
}

export const recipientDocumentConverterFactory = (): IRecipientDocumentConverter => {
  const instance: IRecipientDocumentConverter = {
    create: (body, expiresIn, generateId): Recipient.Document => {
      return {
        ...body,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ document: { _id, createdAt }, body }, expiresIn): Recipient.Document => {
      return {
        ...instance.create(body, expiresIn),
        _id,
        createdAt,
      };
    },
    toResponse: (doc): Recipient.Response => {
      return {
        ...doc,
        recipientId: getRecipientId(doc),
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
      };
    },
    toReport: (doc): Recipient.Report => {
      return doc ? {
        recipientId: getRecipientId(doc),
        name: doc.name,
      } : undefined;
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
