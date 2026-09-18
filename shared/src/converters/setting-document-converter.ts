import { addSeconds } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface ISettingDocumentConverter {
  update(req: Requests.Setting, expiresIn: number): DocumentUpdate<Documents.Setting>;
  toResponse(document: Documents.Setting): Responses.Setting;
  toResponseList(documents: Documents.Setting[]): Responses.Setting[]
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
