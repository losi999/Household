import { DataFactoryFunction } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { createId } from '@household/test/api/utils';

export const recipientDataFactory = (() => {
  const createRecipientRequest: DataFactoryFunction<Recipient.Request> = (req) => {
    return {
      name: `${faker.company.name()} ${faker.string.uuid()}`,
      ...req,
    };
  };

  const createRecipientDocument: DataFactoryFunction<Recipient.Request, Recipient.Document> = (req) => {
    return recipientDocumentConverter.create(createRecipientRequest(req), Cypress.env('EXPIRES_IN'), true);
  };
  return {
    request: createRecipientRequest,
    document: createRecipientDocument,
    id: (createId<Recipient.Id>),
  };
})();
