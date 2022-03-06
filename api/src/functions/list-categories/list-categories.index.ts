import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/list-categories/list-categories.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listCategoriesServiceFactory } from '@household/api/functions/list-categories/list-categories.service';

const listCategoriesService = listCategoriesServiceFactory(databaseService, categoryDocumentConverter);

export default cors(/*authorizer('admin')*/(handler(listCategoriesService)));
