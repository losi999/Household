import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';

export const accountId: ObjectSchema<Api.Account.AccountId> = {
  type: 'object',
  additionalProperties: false,
  required: ['accountId'],
  properties: {
    accountId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
  },
};

const isOpen: ObjectSchema<Api.Account.IsOpen> = {
  type: 'object',
  additionalProperties: false,
  required: ['isOpen'],
  properties: {
    isOpen: {
      type: 'boolean',
    },
  },
};

const name: ObjectSchema<Api.Account.Name> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

const currency: ObjectSchema<Api.Account.Currency> = {
  type: 'object',
  additionalProperties: false,
  required: ['currency'],
  properties: {
    currency: {
      type: 'string',
      minLength: 1,
    },
  },
};

const accountType: ObjectSchema<Api.Account.AccountType> = {
  type: 'object',
  additionalProperties: false,
  required: ['accountType'],
  properties: {
    accountType: {
      type: 'string',
      enum: Object.values(Enum.AccountType),
    },
  },
};

const owner: ObjectSchema<Api.Account.Owner> = {
  type: 'object',
  additionalProperties: false,
  required: ['owner'],
  properties: {
    owner: {
      type: 'string',
      minLength: 1,
    },
  },
};

const fullName: ObjectSchema<Api.Account.FullName> = {
  type: 'object',
  additionalProperties: false,
  required: ['fullName'],
  properties: {
    fullName: {
      type: 'string',
      minLength: 1,
    },
  },
};

const balance: ObjectSchema<Api.Account.Balance> = {
  type: 'object',
  additionalProperties: false,
  required: ['balance'],
  properties: {
    balance: {
      type: 'number',
    },
  },
};

const base = combine<Api.Account.Base>([
  name,
  currency,
  accountType,
  owner,
]);

export const leanResponse = combine<Responses.AccountLean>([
  accountId,
  isOpen,
  base,
  fullName,
]);

export const response = combine<Responses.Account>([
  leanResponse,
  balance,
]);

// export const report = combine<Api.Account.Report>([accountId, fullName, currency]);

export const request = combine<Requests.Account>([base]);
