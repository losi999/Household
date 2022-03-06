import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetCategoryService } from '@household/api/functions/get-category/get-category.service';
import { castPathParameters } from '@household/shared/common/utils';
import { Category } from '@household/shared/types/types';

export default (getCategory: IGetCategoryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { categoryId } = castPathParameters(event);

    let category: Category.Response;
    try {
      category = await getCategory({
        categoryId
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(category);
  };
};
