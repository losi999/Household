import { transferTransactionDocumentConverterFactory } from '@household/shared/converters/transfer-transaction-document-converter';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';

export const transferTransactionDocumentConverter = transferTransactionDocumentConverterFactory(accountDocumentConverter, deferredTransactionDocumentConverter);
