import { settingDocumentConverter } from '@household/shared/dependencies/converters/setting-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
import { DocumentUpdate } from '@household/shared/types/common';
import { SettingKey } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const settingDataFactory = (() => {
  const createSettingUpdate: DataFactoryFunction<Requests.Setting, DocumentUpdate<Documents.Setting>> = (req) => {
    return settingDocumentConverter.update(testDataFactory.setting.request(req), Number(process.env.EXPIRES_IN));
  };

  const createSettingDocument = (settingKey: SettingKey, req: Requests.Setting): Documents.Setting => {
    return {
      settingKey,
      ...req,
      expiresAt: undefined,
    };
  };

  return {
    key: testDataFactory.setting.key,
    request: testDataFactory.setting.request,
    document: createSettingDocument,
    update: createSettingUpdate,
  };
})();
