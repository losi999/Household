import { httpErrors } from '@household/api/common/error-handlers';
import { ISettingDocumentConverter } from '@household/shared/converters/setting-document-converter';
import { ISettingService } from '@household/shared/services/setting-service';
import { Setting } from '@household/shared/types/types';

export interface IUpdateSettingService {
  (ctx: Setting.Request
  & Setting.SettingKey
  & {
    expiresIn: number;
  }): Promise<void>;
}

export const updateSettingServiceFactory = (
  settingService: ISettingService,
  settingDocumentConverter: ISettingDocumentConverter,
): IUpdateSettingService => {
  return async ({ settingKey, value, expiresIn }) => {
    const update = settingDocumentConverter.update({
      value,
    }, expiresIn);

    await settingService.updateSetting({
      settingKey,
    }, update).catch(httpErrors.setting.update({
      settingKey,
      update,
    }));
  };
};
