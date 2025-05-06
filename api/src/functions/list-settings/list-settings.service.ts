import { httpErrors } from '@household/api/common/error-handlers';
import { ISettingDocumentConverter } from '@household/shared/converters/setting-document-converter';
import { ISettingService } from '@household/shared/services/setting-service';
import { Setting } from '@household/shared/types/types';

export interface IListSettingsService {
  (): Promise<Setting.Response[]>;
}

export const listSettingsServiceFactory = (
  settingService: ISettingService,
  settingDocumentConverter: ISettingDocumentConverter): IListSettingsService => {
  return async () => {

    const documents = await settingService.listSettings().catch(httpErrors.setting.list());

    return settingDocumentConverter.toResponseList(documents);
  };
};
