import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/list-accounts/list-accounts.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listAccountsServiceFactory } from '@household/api/functions/list-accounts/list-accounts.service';

const listAccountsService = listAccountsServiceFactory(databaseService, accountDocumentConverter);

export default cors(/*authorizer('admin')*/(handler(listAccountsService)));
