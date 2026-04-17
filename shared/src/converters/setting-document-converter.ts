import { addSeconds } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';

export interface ISettingDocumentConverter {
  update(req: Setting.Request, expiresIn: number): DocumentUpdate<Setting.Document>;
  toResponse(document: Setting.Document): Setting.Response;
  toResponseList(documents: Setting.Document[]): Setting.Response[]
}

export const settingDocumentConverterFactory = (): ISettingDocumentConverter => {
  const instance: ISettingDocumentConverter = {
    update: ({ value }, expiresIn) => {
      return {
        update: {
          $set: {
            value,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
        },
      };
    },
    toResponse: ({ settingKey, value }) => ({
      settingKey,
      value,
    }),
    toResponseList: (documents) => documents.map(d => instance.toResponse(d)),
  };

  return instance;
};
