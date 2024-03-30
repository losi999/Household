import { okResponse } from '@household/api/common/response-factory';
import { ICreateUploadUrlService } from '@household/api/functions/create-upload-url/create-upload-url.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (createUploadUrlService: ICreateUploadUrlService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    console.log(JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body);

    const response = await createUploadUrlService({
      body,
      expiresIn: Number(getExpiresInHeader(event)),
    });

    return okResponse(response);
  };
