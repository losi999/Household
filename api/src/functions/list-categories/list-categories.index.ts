import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as handler } from '@household/api/functions/list-categories/list-categories.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listCategoriesServiceFactory } from '@household/api/functions/list-categories/list-categories.service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listCategoriesService = listCategoriesServiceFactory(categoryService, categoryDocumentConverter);

export default index({
  handler: handler(listCategoriesService),
  before: [authorizer(UserType.Editor, UserType.Viewer)],
  after: [cors],
});
