import { settingDocumentConverter } from '@household/shared/dependencies/converters/setting-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { UpdateQuery } from 'mongoose';

export const settingDataFactory = (() => {
  const createSettingRequest: DataFactoryFunction<Setting.Request> = (req) => {
    return {
      value: faker.string.uuid(),
      ...req,
    };
  };

  const createSettingUpdate: DataFactoryFunction<Setting.Request, UpdateQuery<Setting.Document>> = (req) => {
    return settingDocumentConverter.update(createSettingRequest(req), Cypress.env('EXPIRES_IN'));
  };

  const createSettingDocument = (settingKey: Setting.Id, req: Setting.Request): Setting.Document => {
    return {
      settingKey,
      ...req,
      expiresAt: undefined,
    };
  };

  return {
    key: (key?: string) => (key ?? faker.string.uuid()) as Setting.Id,
    request: createSettingRequest,
    document: createSettingDocument,
    update: createSettingUpdate,
  };
})();
