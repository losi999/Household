import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/utils';

export const recipientDataFactory = (() => {
  const createRecipientRequest: DataFactoryFunction<Requests.Recipient> = (req) => {
    return {
      name: `${faker.company.name()} ${faker.string.uuid()}`,
      ...req,
    };
  };

  const createRecipientDocument: DataFactoryFunction<Requests.Recipient, Documents.Recipient> = (req) => {
    return recipientDocumentConverter.create(createRecipientRequest(req), Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: (createId<Api.Recipient.Id>),
    request: createRecipientRequest,
    document: createRecipientDocument,
  };
})();
