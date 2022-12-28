import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IMergeCategoriesService } from '@household/api/functions/merge-categories/merge-categories.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (mergeCategories: IMergeCategoriesService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { categoryId } = castPathParameters(event);

    try {
      await mergeCategories({
        categoryId,
        body,
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
