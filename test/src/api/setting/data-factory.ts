import { settingDocumentConverter } from '@household/shared/dependencies/converters/setting-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { DocumentUpdate } from '@household/shared/types/common';
import { SettingKey } from '@household/shared/enums';

export const settingDataFactory = (() => {
  const createSettingRequest: DataFactoryFunction<Setting.Request> = (req) => {
    return {
      value: faker.string.uuid(),
      ...req,
    };
  };

  const createSettingUpdate: DataFactoryFunction<Setting.Request, DocumentUpdate<Setting.Document>> = (req) => {
    return settingDocumentConverter.update(createSettingRequest(req), Number(process.env.EXPIRES_IN));
  };

  const createSettingDocument = (settingKey: SettingKey, req: Setting.Request): Setting.Document => {
    return {
      settingKey,
      ...req,
      expiresAt: undefined,
    };
  };

  return {
    key: (key?: string) => (key ?? faker.string.uuid()) as SettingKey,
    request: createSettingRequest,
    document: createSettingDocument,
    update: createSettingUpdate,
  };
})();
