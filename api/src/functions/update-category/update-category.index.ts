import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/update-category/update-category.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { updateCategoryServiceFactory } from '@household/api/functions/update-category/update-category.service';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as pathParameters } from '@household/shared/schemas/category-id';
import { default as body } from '@household/shared/schemas/category';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';

const updateCategoryService = updateCategoryServiceFactory(databaseService, categoryDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateCategoryService))));
