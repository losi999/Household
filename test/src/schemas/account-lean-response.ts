import { request, accountId } from '@household/shared/schemas/account';
import { ObjectSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';

const schema: ObjectSchema<Responses.AccountLean> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...accountId.required,
    ...request.required,
    'isOpen',
    'fullName',
  ],
  properties: {
    ...accountId.properties,
    ...request.properties,
    isOpen: {
      type: 'boolean',
    },
    fullName: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
