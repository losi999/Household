import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/utils';

export const recipientDataFactory = (() => {
  const createRecipientRequest: DataFactoryFunction<Recipient.Request> = (req) => {
    return {
      name: `${faker.company.name()} ${faker.string.uuid()}`,
      ...req,
    };
  };

  const createRecipientDocument: DataFactoryFunction<Recipient.Request, Recipient.Document> = (req) => {
    return recipientDocumentConverter.create(createRecipientRequest(req), Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: (createId<Recipient.Id>),
    request: createRecipientRequest,
    document: createRecipientDocument,
  };
})();
