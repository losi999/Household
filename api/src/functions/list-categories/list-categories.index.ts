import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as handler } from '@household/api/functions/list-categories/list-categories.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listCategoriesServiceFactory } from '@household/api/functions/list-categories/list-categories.service';
import { categoryService } from '@household/shared/dependencies/services/category-service';

const listCategoriesService = listCategoriesServiceFactory(categoryService, categoryDocumentConverter);

export default cors(handler(listCategoriesService));
