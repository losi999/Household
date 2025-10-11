import { PaymentType } from '@household/shared/enums';
import { default as amount } from '@household/shared/schemas/partials/transaction-amount';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Calendar.Entry.PaymentRequest> = {
  type: 'object',
  additionalProperties: false,
  required: ['paymentType'],
  properties: {
    paymentType: {
      type: 'string',
      enum: Object.values(PaymentType),
    },
    ...amount.properties,
  },
  if: {
    properties: {
      paymentType: {
        const: PaymentType.Cash,
      },
    },
  },
  then: {
    required: [...amount.required],
  },
};

export default schema;
