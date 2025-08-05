import { createDraftTransactionDocument, createDraftTransactionResponse, createFileDocument, createPaymentTransactionDocument, createPaymentTransactionResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId } from '@household/shared/common/utils';
import { advanceTo, clear } from 'jest-date-mock';
import { IDraftTransactionDocumentConverter, draftTransactionDocumentConverterFactory } from '@household/shared/converters/draft-transaction-document-converter';
import { createMockService, Mock, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';

describe('Draft transaction document converter', () => {
  let converter: IDraftTransactionDocumentConverter;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    mockTransactionDocumentConverter = createMockService('toResponseList');
    converter = draftTransactionDocumentConverterFactory(mockTransactionDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const amount = 12000;
  const description = 'bevásárlás';
  const issuedAt = new Date(2025, 1, 2, 3, 4, 5);
  const expiresIn = 3600;
  const fileDocument = createFileDocument();
  const potentialDuplicateDocument = createPaymentTransactionDocument();
  const potentialDuplicateResponse = createPaymentTransactionResponse();

  const queriedDocument = createDraftTransactionDocument({
    amount,
    description,
    potentialDuplicates: [potentialDuplicateDocument],
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create({
        body: {
          amount,
          description,
          issuedAt,
        },
        file: fileDocument,
      }, undefined);
      expect(result).toEqual(createDraftTransactionDocument({
        amount,
        description,
        issuedAt,
        file: fileDocument,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create({
        body: {
          amount,
          description,
          issuedAt,
        },
        file: fileDocument,
      }, expiresIn);
      expect(result).toEqual(createDraftTransactionDocument({
        amount,
        description,
        issuedAt,
        file: fileDocument,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([potentialDuplicateResponse]);
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createDraftTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount,
        issuedAt: now.toISOString(),
        potentialDuplicates: [potentialDuplicateResponse],
      }));
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [potentialDuplicateDocument]);
      expect.assertions(2);
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([potentialDuplicateResponse]);
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createDraftTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
          issuedAt: now.toISOString(),
          potentialDuplicates: [potentialDuplicateResponse],
        }),
      ]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [potentialDuplicateDocument]);
      expect.assertions(2);
    });
  });
});
