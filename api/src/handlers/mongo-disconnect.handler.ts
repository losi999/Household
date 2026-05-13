import { IMongodbService } from '@household/shared/services/mongodb-service';

export default (mongodbService: IMongodbService): <R>(response: R) => Promise<R> => {
  return async (response) => {
    await mongodbService.disconnect();
    return response;
  };
};
