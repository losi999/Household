import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';

export const settingKey: ObjectSchema<Api.Setting.SettingKey> = {
  type: 'object',
  additionalProperties: false,
  required: ['settingKey'],
  properties: {
    settingKey: {
      type: 'string',
      minLength: 1,
    },
  },
};

const value: ObjectSchema<Api.Setting.Value> = {
  type: 'object',
  additionalProperties: false,
  required: ['value'],
  properties: {
    // StrictSchema<T> distributes a primitive union into StringSchema | NumberSchema | BooleanSchema,
    // none of which alone models JSON Schema's multi-type array syntax needed here.
    value: {
      type: [
        'string',
        'number',
        'boolean',
      ],
      minLength: 1,
    } as unknown as StrictSchema<Api.Setting.Value['value']>,
  },
};

export const request = combine<Requests.Setting>([value]);

export const response = combine<Responses.Setting>([
  settingKey,
  value,
]);
