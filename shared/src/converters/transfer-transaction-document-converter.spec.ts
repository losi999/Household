import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, getAccountId, createDate } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { createMockService, MockService, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { ITransferTransactionDocumentConverter, transferTransactionDocumentConverterFactory } from '@household/shared/converters/transfer-transaction-document-converter';

describe('Transfer transaction document converter', () => {
  let converter: ITransferTransactionDocumentConverter;
  let mockAccountDocumentConverter: MockService<IAccountDocumentConverter>;

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponseLean');

    vi.useFakeTimers().setSystemTime(new Date());
    converter = transferTransactionDocumentConverterFactory(mockAccountDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  const account = testDataFactory.account.document();

  const accountResponse = testDataFactory.account.response();

  const transferAccount = testDataFactory.account.document();

  const transferAccountResponse = testDataFactory.account.response();

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.transaction.request.transfer();

      const { amount, issuedAt, transferAmount, description } = body;

      const result = converter.create({
        body,
        account,
        transferAccount,
      }, undefined);
      expect(result).toEqual(testDataFactory.transaction.document.transfer({
        account,
        transferAccount,
        transferAmount,
        amount,
        description,
        issuedAt: createDate(issuedAt),
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return document if transferAmount is missing', () => {
      const body = testDataFactory.transaction.request.transfer({
        transferAmount: undefined,
      });

      const { amount, issuedAt, description } = body;
      const result = converter.create({
        body: {
          ...body,
          transferAmount: undefined,
        },
        account,
        transferAccount,
      }, undefined);
      expect(result).toEqual(testDataFactory.transaction.document.transfer({
        account,
        transferAccount,
        transferAmount: amount * -1,
        amount,
        description,
        issuedAt: createDate(issuedAt),
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.transaction.request.transfer();

      const { amount, issuedAt, transferAmount, description } = body;

      const result = converter.create({
        body,
        account,
        transferAccount,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.transaction.document.transfer({
        account,
        transferAccount,
        amount,
        transferAmount,
        description,
        issuedAt: createDate(issuedAt),
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
      }));
    });

  });

  describe('toResponse', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponseLean.mockReturnValueOnce(accountResponse);
      mockAccountDocumentConverter.functions.toResponseLean.mockReturnValueOnce(transferAccountResponse);

      const doc = testDataFactory.transaction.document.transfer({
        account,
        transferAccount,
      });

      const { amount, issuedAt, transferAmount, description } = doc;

      const result = converter.toResponse(doc, getAccountId(account));
      expect(result).toEqual(testDataFactory.transaction.response.transfer({
        transactionId: getTransactionId(doc),
        description,
        amount,
        transferAmount,
        issuedAt: issuedAt.toISOString(),
        account: accountResponse,
        transferAccount: transferAccountResponse,

      }));
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponseLean, 1, account);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponseLean, 2, transferAccount);
      expect.assertions(3);
    });

    it('should return response with inverted accounts', () => {
      mockAccountDocumentConverter.functions.toResponseLean.mockReturnValueOnce(transferAccountResponse);
      mockAccountDocumentConverter.functions.toResponseLean.mockReturnValueOnce(accountResponse);

      const doc = testDataFactory.transaction.document.transfer({
        account,
        transferAccount,
      });

      const { amount, issuedAt, transferAmount, description } = doc;

      const result = converter.toResponse(doc, getAccountId(transferAccount));
      expect(result).toEqual(testDataFactory.transaction.response.transfer({
        transactionId: getTransactionId(doc),
        description,
        amount: transferAmount,
        transferAmount: amount,
        issuedAt: issuedAt.toISOString(),
        account: transferAccountResponse,
        transferAccount: accountResponse,

      }));
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponseLean, 1, transferAccount);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponseLean, 2, account);
      expect.assertions(3);
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponseLean.mockReturnValueOnce(accountResponse);
      mockAccountDocumentConverter.functions.toResponseLean.mockReturnValueOnce(transferAccountResponse);

      const doc = testDataFactory.transaction.document.transfer({
        account,
        transferAccount,
      });

      const { amount, issuedAt, transferAmount, description } = doc;

      const result = converter.toResponseList([doc], getAccountId(account));
      expect(result).toEqual([
        testDataFactory.transaction.response.transfer({
          transactionId: getTransactionId(doc),
          description,
          amount,
          transferAmount,
          issuedAt: issuedAt.toISOString(),
          account: accountResponse,
          transferAccount: transferAccountResponse,
        }),
      ]);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponseLean, 1, account);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponseLean, 2, transferAccount);
      expect.assertions(3);
    });
  });
});
