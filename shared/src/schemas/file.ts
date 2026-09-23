import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { MONGO_ID_PATTERN } from '@household/shared/constants';

export const fileId: ObjectSchema<Api.File.FileId> = {
  type: 'object',
  additionalProperties: false,
  required: ['fileId'],
  properties: {
    fileId: {
      type: 'string',
      pattern: MONGO_ID_PATTERN,
    },
  },
};

const fileType: ObjectSchema<Api.File.FileType> = {
  type: 'object',
  additionalProperties: false,
  required: ['fileType'],
  properties: {
    fileType: {
      type: 'string',
      enum: Object.values(Enum.FileType),
    },
  },
};

const timezone: ObjectSchema<Api.File.Timezone> = {
  type: 'object',
  additionalProperties: false,
  required: ['timezone'],
  properties: {
    timezone: {
      type: 'string',
      minLength: 1,
    },
  },
};

const url: ObjectSchema<Api.File.Url> = {
  type: 'object',
  additionalProperties: false,
  required: ['url'],
  properties: {
    url: {
      type: 'string',
      minLength: 1,
    },
  },
};

const draftCount: ObjectSchema<Api.File.DraftCount> = {
  type: 'object',
  additionalProperties: false,
  required: ['draftCount'],
  properties: {
    draftCount: {
      type: 'number',
    },
  },
};

const uploadedAt: ObjectSchema<Api.File.UploadedAt> = {
  type: 'object',
  additionalProperties: false,
  required: ['uploadedAt'],
  properties: {
    uploadedAt: {
      type: 'string',
    },
  },
};

const base = combine<Api.File.Base>([
  fileType,
  timezone,
]);

export const request = combine<Requests.File>([base]);

export const response = combine<Responses.File>([
  fileId,
  fileType,
  draftCount,
  uploadedAt,
]);

export const responseList: StrictSchema<Responses.File[]> = {
  type: 'array',
  items: response,
};

export const uploadUrl = combine<Responses.FileUploadUrl>([
  fileId,
  url,
]);
