import { IStorePublicHolidaysService } from '@household/api/functions/store-public-holidays/store-public-holidays.service';

export default (storePunlicHolidays: IStorePublicHolidaysService): AWSLambda.Handler =>
  async () => {
    await storePunlicHolidays();
  };
