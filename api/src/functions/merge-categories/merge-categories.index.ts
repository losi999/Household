import { default as handler } from '@household/api/functions/merge-categories/merge-categories.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { categoryId as pathParameters, idList as body } from '@household/shared/schemas/category';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeCategoriesServiceFactory } from '@household/api/functions/merge-categories/merge-categories.service';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const mergeCategoriesService = mergeCategoriesServiceFactory(categoryService);

export default index({
  handler: handler(mergeCategoriesService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
