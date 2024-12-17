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
    create: ({ name }, expiresIn, generateId) => {
      return {
        name,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      return {
        $set: {
          ...body,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };
    },
    toResponse: ({ name, _id }) => {
      return {
        name,
        recipientId: getRecipientId(_id),
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
      };
    },
    toReport: (doc) => {
      return doc ? {
        recipientId: getRecipientId(doc),
        name: doc.name,
      } : undefined;
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
