import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const accountDataFactory = (() => {
  const createAccountDocument: DataFactoryFunction<Requests.Account, Documents.Account> = (req) => {
    return accountDocumentConverter.create(testDataFactory.account.request(req), Number(process.env.EXPIRES_IN), true);
  };
  return {
    id: testDataFactory.account.id,
    request: testDataFactory.account.request,
    document: createAccountDocument,
  };
})();
