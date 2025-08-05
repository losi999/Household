import { draftTransactionDocumentConverterFactory } from '@household/shared/converters/draft-transaction-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';

export const draftTransactionDocumentConverter = draftTransactionDocumentConverterFactory(transactionDocumentConverter);
