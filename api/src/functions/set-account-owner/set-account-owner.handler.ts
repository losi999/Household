import { ISetAccountOwnerService } from '@household/api/functions/set-account-owner/set-account-owner.service';

export default (setAccountOwner: ISetAccountOwnerService): AWSLambda.Handler =>
  async () => {
    await setAccountOwner();
  };
