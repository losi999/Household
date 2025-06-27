import { createDraftTransactionDocument, createDraftTransactionResponse, createFileDocument } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId } from '@household/shared/common/utils';
import { advanceTo, clear } from 'jest-date-mock';
import { IDraftTransactionDocumentConverter, draftTransactionDocumentConverterFactory } from '@household/shared/converters/draft-transaction-document-converter';
import { Transaction } from '../types/types';

describe('Draft transaction document converter', () => {
  let converter: IDraftTransactionDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = draftTransactionDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const amount = 12000;
  const description = 'bevásárlás';
  const issuedAt = new Date(2025, 1, 2, 3, 4, 5);
  const expiresIn = 3600;
  const fileDocument = createFileDocument();
  const potentialDuplicates: Transaction.Id[] = [];

  const queriedDocument = createDraftTransactionDocument({
    amount,
    description,
    potentialDuplicates,
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
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createDraftTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount,
        issuedAt: now.toISOString(),
        potentialDuplicates,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {

      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createDraftTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
          issuedAt: now.toISOString(),
          potentialDuplicates,
        }),
      ]);
    });
  });
});
