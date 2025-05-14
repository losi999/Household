import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as handler } from '@household/api/functions/get-category/get-category.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getCategoryServiceFactory } from '@household/api/functions/get-category/get-category.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/category-id';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const getCategoryService = getCategoryServiceFactory(categoryService, categoryDocumentConverter);

export default index({
  handler: handler(getCategoryService),
  before: [
    authorizer(UserType.Editor, UserType.Viewer),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
