import { categoryDocumentConverterFactory } from '@household/shared/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';

export const categoryDocumentConverter = categoryDocumentConverterFactory(productDocumentConverter);
