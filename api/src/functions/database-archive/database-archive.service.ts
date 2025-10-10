import { entries } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { IStorageService } from '@household/shared/services/storage-service';

export interface IDatabaseArchiveService {
  (): Promise<unknown>;
}

export const databaseArchiveServiceFactory = (
  mongodbService: IMongodbService,
  storageService: IStorageService): IDatabaseArchiveService =>
  async () => {
    const dump = await mongodbService.dump();
    const folderName = new Date().toISOString();

    return Promise.all(entries(dump).map(([
      collectionName,
      data,
    ]) => {
      return storageService.writeFile(`${collectionName}.json`, JSON.stringify(data), folderName);
    }));
  };
