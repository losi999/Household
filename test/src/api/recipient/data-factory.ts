import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const recipientDataFactory = (() => {
  const createRecipientDocument: DataFactoryFunction<Requests.Recipient, Documents.Recipient> = (req) => {
    return recipientDocumentConverter.create(testDataFactory.recipient.request(req), Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: testDataFactory.recipient.id,
    request: testDataFactory.recipient.request,
    document: createRecipientDocument,
  };
})();
