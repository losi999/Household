import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { default as handler } from '@household/api/functions/list-transactions/list-transactions.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listTransactionsServiceFactory } from '@household/api/functions/list-transactions/list-transactions.service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';

const listTransactionsService = listTransactionsServiceFactory(transactionService, transactionDocumentConverter);

export default cors(handler(listTransactionsService));
