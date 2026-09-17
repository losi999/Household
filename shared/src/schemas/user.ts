import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import * as Enum from '@household/shared/enums';
import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';

export const email: ObjectSchema<Api.User.Email> = {
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
};

export const group: ObjectSchema<Api.User.Group> = {
  type: 'object',
  additionalProperties: false,
  required: ['group'],
  properties: {
    group: {
      type: 'string',
      enum: Object.values(Enum.UserType),
    },
  },
};

export const emailGroup = combine<Api.User.Email & Api.User.Group>([
  email,
  group,
]);

export const request = combine<Requests.User>([email]);

const status: ObjectSchema<Api.User.Status> = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: Object.values(UserStatusType),
    },
  },
};

const groups: ObjectSchema<Api.User.Groups> = {
  type: 'object',
  additionalProperties: false,
  required: ['groups'],
  properties: {
    groups: {
      type: 'array',
      items: group.properties.group,
    },
  },
};

export const response = combine<Responses.User>([
  email,
  status,
  groups,
]);

export const responseList: StrictSchema<Responses.User[]> = {
  type: 'array',
  items: response,
};
