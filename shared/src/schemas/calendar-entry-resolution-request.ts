import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { default as amount } from '@household/shared/schemas/partials/transaction-amount';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const paidRequest: StrictJSONSchema7<Calendar.Entry.PaidResolutionRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'amount',
    'status',
  ],
  properties: {
    status: {
      type: 'string',
      const: CalendarEntryResolutionStatus.Paid,
    },
    ...amount.properties,
    delay: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
  },
};

const pendingTransferRequest: StrictJSONSchema7<Calendar.Entry.PendingTransferResolutionRequest> = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      const: CalendarEntryResolutionStatus.PendingTransfer,
    },
    delay: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
  },
};

const noShowRequest: StrictJSONSchema7<Calendar.Entry.NoShowResolutionRequest> = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      const: CalendarEntryResolutionStatus.NoShow,
    },
  },
};

const schema: StrictJSONSchema7<Calendar.Entry.ResolutionRequest> = {
  type: 'object',
  oneOf: [
    paidRequest,
    pendingTransferRequest,
    noShowRequest,
  ],
};

export default schema;
