import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getRecipientId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';

export interface IRecipientDocumentConverter {
  create(body: Requests.Recipient, expiresIn: number, generateId?: boolean): Documents.Recipient;
  update(body: Requests.Recipient, expiresIn: number): DocumentUpdate<Documents.Recipient>;
  toResponse(doc: Documents.Recipient): Responses.Recipient;
  toReport(doc: Documents.Recipient): Responses.RecipientReport;
  toResponseList(docs: Documents.Recipient[]): Responses.Recipient[];
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
        update: {
          $set: {
            ...body,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
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
