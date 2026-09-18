import { httpErrors } from '@household/api/common/error-handlers';
import { ISettingDocumentConverter } from '@household/shared/converters/setting-document-converter';
import { ISettingService } from '@household/shared/services/setting-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateSettingService {
  (ctx: Requests.Setting
  & Api.Setting.SettingKey
  & {
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateSettingServiceFactory = (
  settingService: ISettingService,
  settingDocumentConverter: ISettingDocumentConverter,
): IUpdateSettingService => {
  return async ({ settingKey, value, expiresIn }) => {
    const update = settingDocumentConverter.update({
      value,
    }, expiresIn);

    return settingService.updateSetting(settingKey, update).catch(httpErrors.setting.update({
      settingKey,
      update,
    }));
  };
};
