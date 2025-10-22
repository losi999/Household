import { SettingKey } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Setting } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ISettingService {
  updateSetting(key: SettingKey, updateQuery: UpdateQuery<Setting.Document>): Promise<unknown>;
  listSettings(): Promise<Setting.Document[]>;
  listSettingsByKeys(settingKeys: SettingKey[]): Promise<Setting.Document[]>;
  getSettingByKey(settingKey: SettingKey): Promise<Setting.Document>;
}

export const settingServiceFactory = (mongodbService: IMongodbService): ISettingService => {
  const instance: ISettingService = {
    updateSetting: (settingKey, updateQuery) => {
      return mongodbService.inSession((session) => {
        return mongodbService.settings.findOneAndUpdate({
          settingKey,
        }, updateQuery,
        {
          upsert: true,
          runValidators: true,
          session,
        },
        );
      });
    },
    listSettings: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.settings.find()
          .session(session);
          
      });
    },
    listSettingsByKeys: async (settingKeys) => {
      if(!settingKeys?.length) {
        return [];
      }

      return mongodbService.inSession((session) => {
        return mongodbService.settings.find({
          settingKey: {
            $in: settingKeys,
          },
        })
          .session(session);          
      });
    },
    getSettingByKey: (settingKey) => {
      if(settingKey) {
        return mongodbService.inSession((session) => {
          return mongodbService.settings.findOne({
            settingKey,
          })
            .session(session);   
        });
      }
    },
  };

  return instance;
};
