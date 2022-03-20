import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/list-transactions/list-transactions.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listTransactionsServiceFactory } from '@household/api/functions/list-transactions/list-transactions.service';

const listTransactionsService = listTransactionsServiceFactory(databaseService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(handler(listTransactionsService)));
