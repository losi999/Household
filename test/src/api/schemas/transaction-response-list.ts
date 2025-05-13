
import { default as paymentTransactionSchema } from '@household/test/api/schemas/transaction-payment-response';
import { default as splitTransactionSchema } from '@household/test/api/schemas/transaction-split-response';
import { default as deferredTransactionSchema } from '@household/test/api/schemas/transaction-deferred-response';
import { default as reimbursementTransactionSchema } from '@household/test/api/schemas/transaction-reimbursement-response';
import { default as transferTransactionSchema } from '@household/test/api/schemas/transaction-transfer-response';
import { default as draftTransactionSchema } from '@household/test/api/schemas/transaction-draft-response';
import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  type: 'array',
  items: {
    oneOf: [
      splitTransactionSchema,
      paymentTransactionSchema,
      deferredTransactionSchema,
      reimbursementTransactionSchema,
      transferTransactionSchema,
      draftTransactionSchema,
    ],
  },
};

export default schema;
