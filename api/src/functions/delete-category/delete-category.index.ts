import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/delete-category/delete-category.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { deleteCategoryServiceFactory } from '@household/api/functions/delete-category/delete-category.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/category-id';

const deleteCategoryService = deleteCategoryServiceFactory(databaseService);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
})(handler(deleteCategoryService))));
