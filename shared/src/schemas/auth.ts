import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema } from '@household/shared/types/schema';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import * as Enum from '@household/shared/enums';
import { email } from '@household/shared/schemas/user';

const password: ObjectSchema<Api.Auth.Password> = {
  type: 'object',
  additionalProperties: false,
  required: ['password'],
  properties: {
    password: {
      type: 'string',
      minLength: 6,
    },
  },
};

const temporaryPassword: ObjectSchema<Api.Auth.TemporaryPassword> = {
  type: 'object',
  additionalProperties: false,
  required: ['temporaryPassword'],
  properties: {
    temporaryPassword: {
      type: 'string',
      minLength: 6,
    },
  },
};

const confirmationCode: ObjectSchema<Api.Auth.ConfirmationCode> = {
  type: 'object',
  additionalProperties: false,
  required: ['confirmationCode'],
  properties: {
    confirmationCode: {
      type: 'string',
      minLength: 6,
      maxLength: 6,
    },
  },
};

const refreshToken: ObjectSchema<Api.Auth.RefreshToken> = {
  type: 'object',
  additionalProperties: false,
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string',
      minLength: 1,
    },
  },
};

const requiredUserType: ObjectSchema<Api.Auth.RequiredUserType> = {
  type: 'object',
  additionalProperties: false,
  required: ['requiredUserType'],
  properties: {
    requiredUserType: {
      type: 'string',
      enum: Object.values(Enum.UserType),
    },
  },
};

export const loginRequest = combine<Requests.Login>([
  email,
  password,
  requiredUserType,
], {
  optional: ['requiredUserType'],
});

export const forgotPasswordRequest = combine<Requests.ForgotPassword>([email]);

export const confirmForgotPasswordRequest = combine<Requests.ConfirmForgotPassword>([
  password,
  confirmationCode,
]);

export const confirmUserRequest = combine<Requests.ConfirmUser>([
  password,
  temporaryPassword,
]);

export const refreshTokenRequest = combine<Requests.RefreshToken>([refreshToken]);

const idToken: ObjectSchema<Api.Auth.IdToken> = {
  type: 'object',
  additionalProperties: false,
  required: ['idToken'],
  properties: {
    idToken: {
      type: 'string',
    },
  },
};

export const loginResponse = combine<Responses.Login>([
  idToken,
  refreshToken,
]);

export const refreshTokenResponse = combine<Responses.RefreshToken>([idToken]);
