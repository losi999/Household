import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateCategoryService } from '@household/api/functions/create-category/create-category.service';
import { headerExpiresIn } from '@household/shared/constants';

export default (createCategory: ICreateCategoryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let categoryId: string;
    try {
      categoryId = await createCategory({
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
