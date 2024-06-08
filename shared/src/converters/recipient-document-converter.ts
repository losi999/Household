import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getRecipientId } from '@household/shared/common/utils';
import { Recipient } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IRecipientDocumentConverter {
  create(body: Recipient.Request, expiresIn: number, generateId?: boolean): Recipient.Document;
  update(body: Recipient.Request, expiresIn: number): UpdateQuery<Recipient.Document>;
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
    update: (body, expiresIn): UpdateQuery<Recipient.Document> => {
      return {
        $set: {
          ...body,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
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
