import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Setting } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ISettingService {
  updateSetting(key: Setting.SettingKey, updateQuery: UpdateQuery<Setting.Document>): Promise<unknown>;
  listSettings(): Promise<Setting.Document[]>;
}

export const settingServiceFactory = (mongodbService: IMongodbService): ISettingService => {
  const instance: ISettingService = {
    updateSetting: ({ settingKey }, updateQuery) => {
      return mongodbService.settings.findOneAndUpdate({
        settingKey,
      }, updateQuery,
      {
        upsert: true,
        runValidators: true,
      },
      );
    },
    listSettings: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.settings.find()
          .session(session)
          .exec();
      });
    },
  };

  return instance;
};
