import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateCategoryService } from '@household/api/functions/update-category/update-category.service';
import { castPathParameters } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';

export default (updateCategory: IUpdateCategoryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { categoryId } = castPathParameters(event);

    try {
      await updateCategory({
        categoryId,
        body,
        expiresIn: Number(event.headers[headerExpiresIn]),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      categoryId,
    });
  };
};
