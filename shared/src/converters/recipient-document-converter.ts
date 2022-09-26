import { addSeconds, getRecipientId } from '@household/shared/common/utils';
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
        _id: undefined,
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
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
