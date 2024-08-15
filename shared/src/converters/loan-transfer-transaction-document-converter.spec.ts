import { createAccountDocument, createAccountResponse, createTransferTransactionRequest, createLoanTransferTransactionResponse, createLoanTransferTransactionDocument } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, getAccountId } from '@household/shared/common/utils';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { createMockService, Mock, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { Transaction } from '@household/shared/types/types';
import { ILoanTransferTransactionDocumentConverter, loanTransferTransactionDocumentConverterFactory } from '@household/shared/converters/loan-transfer-transaction-document-converter';

describe('Loan transfer transaction document converter', () => {
  let converter: ILoanTransferTransactionDocumentConverter;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');

    advanceTo(now);
    converter = loanTransferTransactionDocumentConverterFactory(mockAccountDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const amount = 12000;
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

  const queriedDocument = createLoanTransferTransactionDocument({
    account,
    transferAccount,
    amount,
    description,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(() => {
    body = createTransferTransactionRequest({
      amount,
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
      }, undefined);
      expect(result).toEqual(createLoanTransferTransactionDocument({
        account,
        transferAccount,
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
      }, expiresIn);
      expect(result).toEqual(createLoanTransferTransactionDocument({
        account,
        transferAccount,
        amount,
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
      expect(result).toEqual(createLoanTransferTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount,
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
      expect(result).toEqual(createLoanTransferTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount,
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
        createLoanTransferTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
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
