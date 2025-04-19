import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteFileService } from '@household/api/functions/delete-file/delete-file.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteFile: IDeleteFileService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { fileId } = castPathParameters(event);

    try {
      await deleteFile({
        fileId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
