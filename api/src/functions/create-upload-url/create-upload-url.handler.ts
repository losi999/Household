import { createdResponse, errorResponse } from '@household/api/common/response-factory';
import { ICreateUploadUrlService } from '@household/api/functions/create-upload-url/create-upload-url.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';
import { Responses } from '@household/shared/types/responses';

export default (createUploadUrlService: ICreateUploadUrlService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const body = JSON.parse(event.body);
    let response: Responses.FileUploadUrl;

    try {
      response = await createUploadUrlService({
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse(response);
  };
