import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Setting } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ISettingService {
  updateSetting(key: Setting.Id, updateQuery: UpdateQuery<Setting.Document>): Promise<unknown>;
  listSettings(): Promise<Setting.Document[]>;
  getSettingByKey(settingKey: Setting.Id): Promise<Setting.Document>;
}

export const settingServiceFactory = (mongodbService: IMongodbService): ISettingService => {
  const instance: ISettingService = {
    updateSetting: (settingKey, updateQuery) => {
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
    getSettingByKey: (settingKey) => {
      return mongodbService.inSession((session) => {
        return mongodbService.settings.findOne({
          settingKey,
        })
          .session(session)
          .exec();
      });
    },
  };

  return instance;
};
