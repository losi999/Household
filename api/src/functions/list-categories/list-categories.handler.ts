
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCategoriesService } from '@household/api/functions/list-categories/list-categories.service';
import { Responses } from '@household/shared/types/responses';

export default (listCategories: IListCategoriesService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let categories: Responses.Category[];

    try {
      categories = await listCategories();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(categories);
  };
};
