import { createAccountDocument, createAccountResponse, createTransferTransactionDocument, createTransferTransactionRequest, createTransferTransactionResponse, createDeferredTransactionDocument } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, toDictionary, getAccountId } from '@household/shared/common/utils';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { createMockService, Mock, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { Transaction } from '@household/shared/types/types';
import { ITransferTransactionDocumentConverter, transferTransactionDocumentConverterFactory } from '@household/shared/converters/transfer-transaction-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';

describe('Transfer transaction document converter', () => {
  let converter: ITransferTransactionDocumentConverter;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;
  let mockDeferredTransactionDocumentConverter: Mock<IDeferredTransactionDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');
    mockDeferredTransactionDocumentConverter = createMockService('toResponse');

    advanceTo(now);
    converter = transferTransactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockDeferredTransactionDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const amount = 12000;
  const transferAmount = -12;
  const description = 'bevásárlás';
  const expiresIn = 3600;

  const account = createAccountDocument();

  const accountResponse = createAccountResponse();

  const transferAccountName = 'transfer account';
  const transferAccount = createAccountDocument({
    name: transferAccountName,
  });
  const transferAccountResponse = createAccountResponse({
    name: transferAccountName,
  });

  let body: Transaction.TransferRequest;

  const queriedDocument = createTransferTransactionDocument({
    account,
    transferAccount,
    amount,
    transferAmount,
    description,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(() => {
    body = createTransferTransactionRequest({
      amount,
      transferAmount,
      description,
      issuedAt: now.toISOString(),
    });
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create({
        body,
        account,
        transferAccount,
        transactions: undefined,
      }, undefined);
      expect(result).toEqual(createTransferTransactionDocument({
        account,
        transferAccount,
        transferAmount,
        amount,
        description,
        issuedAt: now,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return document with payments', () => {
      const deferredTransaction = createDeferredTransactionDocument();
      const paymentAmount = -10;
      body = createTransferTransactionRequest({
        ...body,
        payments: [
          {
            amount: paymentAmount,
            transactionId: getTransactionId(deferredTransaction),
          },
        ],
      });
      const result = converter.create({
        body,
        account,
        transferAccount,
        transactions: toDictionary([deferredTransaction], '_id'),
      }, undefined);
      expect(result).toEqual(createTransferTransactionDocument({
        account,
        transferAccount,
        transferAmount,
        amount,
        description,
        issuedAt: now,
        expiresAt: undefined,
        _id: undefined,
        payments: [
          {
            amount: paymentAmount,
            transaction: deferredTransaction,
          },
        ],
      }));
    });

    it('should return document if transferAmount is missing', () => {
      const result = converter.create({
        body: {
          ...body,
          transferAmount: undefined,
        },
        account,
        transferAccount,
        transactions: undefined,
      }, undefined);
      expect(result).toEqual(createTransferTransactionDocument({
        account,
        transferAccount,
        transferAmount: amount * -1,
        amount,
        description,
        issuedAt: now,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create({
        body,
        account,
        transferAccount,
        transactions: undefined,
      }, expiresIn);
      expect(result).toEqual(createTransferTransactionDocument({
        account,
        transferAccount,
        amount,
        transferAmount,
        description,
        issuedAt: now,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

  });

  describe('toResponse', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);

      const result = converter.toResponse(queriedDocument, getAccountId(account));
      expect(result).toEqual(createTransferTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount,
        transferAmount,
        issuedAt: now.toISOString(),
        account: accountResponse,
        transferAccount: transferAccountResponse,

      }));
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, account);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, transferAccount);
      expect.assertions(3);
    });

    it('should return response with inverted accounts', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);

      const result = converter.toResponse(queriedDocument, getAccountId(transferAccount));
      expect(result).toEqual(createTransferTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount: transferAmount,
        transferAmount: amount,
        issuedAt: now.toISOString(),
        account: transferAccountResponse,
        transferAccount: accountResponse,

      }));
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, transferAccount);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, account);
      expect.assertions(3);
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);

      const result = converter.toResponseList([queriedDocument], getAccountId(account));
      expect(result).toEqual([
        createTransferTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
          transferAmount,
          issuedAt: now.toISOString(),
          account: accountResponse,
          transferAccount: transferAccountResponse,
        }),
      ]);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, account);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, transferAccount);
      expect.assertions(3);
    });
  });
});
