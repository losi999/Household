
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCategoriesService } from '@household/api/functions/list-categories/list-categories.service';
import { Category } from '@household/shared/types/types';

export default (listCategories: IListCategoriesService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let categories: Category.Response[];
    try {
      categories = await listCategories();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(categories);
  };
};
