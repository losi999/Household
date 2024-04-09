import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { ICreateUploadUrlService } from '@household/api/functions/create-upload-url/create-upload-url.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';
import { File } from '@household/shared/types/types';

export default (createUploadUrlService: ICreateUploadUrlService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const body = JSON.parse(event.body);
    let response: {
      url: string;
    } & File.FileId;

    try {
      response = await createUploadUrlService({
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(response);
  };
