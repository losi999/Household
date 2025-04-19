
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListFilesService } from '@household/api/functions/list-files/list-files.service';
import { File } from '@household/shared/types/types';

export default (listFiles: IListFilesService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let files: File.Response[];
    try {
      files = await listFiles();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(files);
  };
};
