import { createCategoryServiceFactory } from '@household/api/functions/create-category/create-category.service';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as handler } from '@household/api/functions/create-category/create-category.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/category';
import { categoryService } from '@household/shared/dependencies/services/category-service';

const createCategoryService = createCategoryServiceFactory(categoryService, categoryDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  body,
})(handler(createCategoryService))));
