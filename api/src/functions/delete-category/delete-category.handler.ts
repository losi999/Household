import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteCategoryService } from '@household/api/functions/delete-category/delete-category.service';
import { castPathParameters } from '@household/shared/common/utils';

export default (deleteCategory: IDeleteCategoryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { categoryId } = castPathParameters(event);

    try {
      await deleteCategory({
        categoryId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
