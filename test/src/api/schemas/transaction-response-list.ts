
import { default as transactionPayment } from '@household/test/api/schemas/transaction-payment-response';
import { default as transactionSplit } from '@household/test/api/schemas/transaction-split-response';
import { default as transactionTransfer } from '@household/test/api/schemas/transaction-transfer-response';
import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  type: 'array',
  items: {
    oneOf: [
      transactionPayment,
      transactionSplit,
      transactionTransfer,
    ],
  },
};

export default schema;
