import { setAccountOwnerServiceFactory } from '@household/api/functions/set-account-owner/set-account-owner.service';
import { default as handler } from '@household/api/functions/post-deploy/post-deploy.handler';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const setAccountOwner = setAccountOwnerServiceFactory(mongodbService);

export default handler(setAccountOwner);
