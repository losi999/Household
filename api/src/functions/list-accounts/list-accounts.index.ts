import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as handler } from '@household/api/functions/list-accounts/list-accounts.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listAccountsServiceFactory } from '@household/api/functions/list-accounts/list-accounts.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { default as index } from '@household/api/handlers/index.handler';

const listAccountsService = listAccountsServiceFactory(accountService, accountDocumentConverter);

export default index({
  handler: handler(listAccountsService),
  before: [],
  after: [cors],
});
