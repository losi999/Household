import { default as handler } from '@household/api/functions/update-category/update-category.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateCategoryServiceFactory } from '@household/api/functions/update-category/update-category.service';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as pathParameters } from '@household/shared/schemas/category-id';
import { default as body } from '@household/shared/schemas/category-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateCategoryService = updateCategoryServiceFactory(categoryService, categoryDocumentConverter);

export default index({
  handler: handler(updateCategoryService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
