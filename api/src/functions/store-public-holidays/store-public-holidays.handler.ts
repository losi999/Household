import { IStorePublicHolidaysService } from '@household/api/functions/store-public-holidays/store-public-holidays.service';

export default (storePublicHolidays: IStorePublicHolidaysService): AWSLambda.Handler =>
  async () => {
    await storePublicHolidays();
  };
