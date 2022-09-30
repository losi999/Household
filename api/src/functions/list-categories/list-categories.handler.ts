
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCategoriesService } from '@household/api/functions/list-categories/list-categories.service';
import { Category } from '@household/shared/types/types';

export default (listCategories: IListCategoriesService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    let categories: Category.Response[];
    const { categoryType } = (event.queryStringParameters ?? {}) as Category.CategoryType;
    try {
      categories = await listCategories({
        categoryType,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(categories);
  };
};
