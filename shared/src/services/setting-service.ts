import { DocumentUpdate } from '@household/shared/types/common';
import { SettingKey } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Setting } from '@household/shared/types/types';

export interface ISettingService {
  updateSetting(key: SettingKey, updateQuery: DocumentUpdate<Setting.Document>): Promise<unknown>;
  listSettings(): Promise<Setting.Document[]>;
  listSettingsByKeys(...settingKeys: SettingKey[]): Promise<Setting.Document[]>;
  getSettingByKey<V extends string | number | boolean>(settingKey: SettingKey): Promise<Setting.Document<V>>;
}

export const settingServiceFactory = (mongodbService: IMongodbService): ISettingService => {
  const instance: ISettingService = {
    updateSetting: (settingKey, { update }) => {
      return mongodbService.settings((model, session) => {
        return model.findOneAndUpdate({
          settingKey,
        }, update,
        {
          upsert: true,
          runValidators: true,
          session,
        },
        );
      });
    },
    listSettings: () => {
      return mongodbService.settings((model, session) => {
        return model.find()
          .session(session);
      });
    },
    listSettingsByKeys: async (...settingKeys) => {
      if(!settingKeys?.length) {
        return [];
      }

      return mongodbService.settings((model, session) => {
        return model.find({
          settingKey: {
            $in: settingKeys,
          },
        })
          .session(session);          
      });
    },
    getSettingByKey: <V extends string | number | boolean>(settingKey: SettingKey) => {
      if(settingKey) {
        return mongodbService.settings(async (model, session) => {
          const ret = await model.findOne({
            settingKey,
          })
            .session(session)
            .lean();   

          return ret as unknown as Setting.Document<V>;
        });
      }
    },
  };

  return instance;
};
