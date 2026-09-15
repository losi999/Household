import { settingDocumentConverter } from '@household/shared/dependencies/converters/setting-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
import { faker } from '@faker-js/faker';
import { DocumentUpdate } from '@household/shared/types/common';
import { SettingKey } from '@household/shared/enums';

export const settingDataFactory = (() => {
  const createSettingRequest: DataFactoryFunction<Requests.Setting> = (req) => {
    return {
      value: faker.string.uuid(),
      ...req,
    };
  };

  const createSettingUpdate: DataFactoryFunction<Requests.Setting, DocumentUpdate<Documents.Setting>> = (req) => {
    return settingDocumentConverter.update(createSettingRequest(req), Number(process.env.EXPIRES_IN));
  };

  const createSettingDocument = (settingKey: SettingKey, req: Requests.Setting): Documents.Setting => {
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
