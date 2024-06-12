import { transferTransactionDocumentConverterFactory } from '@household/shared/converters/transfer-transaction-document-converter';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';

export const transferTransactionDocumentConverter = transferTransactionDocumentConverterFactory(accountDocumentConverter);
