import { deferredTransactionDocumentConverterFactory } from '@household/shared/converters/deferred-transaction-document-converter';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';

export const deferredTransactionDocumentConverter = deferredTransactionDocumentConverterFactory(accountDocumentConverter, projectDocumentConverter, categoryDocumentConverter, recipientDocumentConverter, productDocumentConverter);
