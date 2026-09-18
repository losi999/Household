import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetCategoryService } from '@household/api/functions/get-category/get-category.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Responses } from '@household/shared/types/responses';

export default (getCategory: IGetCategoryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { categoryId } = castPathParameters(event);

    let category: Responses.Category;
    try {
      category = await getCategory({
        categoryId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(category);
  };
};
