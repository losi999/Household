
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListFilesService } from '@household/api/functions/list-files/list-files.service';
import { Responses } from '@household/shared/types/responses';

export default (listFiles: IListFilesService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let files: Responses.File[];
    try {
      files = await listFiles();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(files);
  };
};
