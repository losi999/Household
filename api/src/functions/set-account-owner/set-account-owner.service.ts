import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface ISetAccountOwnerService {
  (): Promise<void>;
}

export const setAccountOwnerServiceFactory = (mongodbService: IMongodbService): ISetAccountOwnerService =>
  async () => {
    await mongodbService.accounts().updateMany({
      owner: {
        $exists: false,
      },
    }, {
      owner: 'default',
    });
  };
