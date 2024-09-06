import { productDocumentConverterFactory } from '@household/shared/converters/product-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';

export const productDocumentConverter = productDocumentConverterFactory(categoryDocumentConverter);
