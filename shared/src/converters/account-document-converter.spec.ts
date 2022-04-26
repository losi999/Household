import { createAccountDocument, createAccountId, createAccountRequest, createAccountResponse } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { accountDocumentConverterFactory, IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { advanceTo, clear } from 'jest-date-mock';

describe('Account document converter', () => {
  let converter: IAccountDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = accountDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const name = 'Pénztárca';
  const currency = 'Ft';
  const accountType: Account.AccountType = 'cash';
  const expiresIn = 3600;
  const accountId = new Types.ObjectId();
  const balance = 12000;
  const isOpen = false;

  const body = createAccountRequest({
    accountType,
    currency,
    name,
  });
  const queriedDocument = createAccountDocument({
    name,
    currency,
    accountType,
    balance,
    isOpen,
    _id: accountId,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createAccountDocument({
        accountType,
        currency,
        name,
        isOpen: true,
        balance: undefined,
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createAccountDocument({
        accountType,
        currency,
        name,
        isOpen: true,
        balance: undefined,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });

  });

  describe('update', () => {
    const { updatedAt, ...document } = queriedDocument;
    it('should update document', () => {
      const result = converter.update({
        body,
        document,
      }, expiresIn);
      expect(result).toEqual(createAccountDocument({
        _id: accountId,
        accountType,
        currency,
        name,
        isOpen: true,
        balance: undefined,
        createdAt: now,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createAccountResponse({
        accountId: createAccountId(accountId.toString()),
        accountType,
        balance,
        currency,
        isOpen,
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createAccountResponse({
          accountId: createAccountId(accountId.toString()),
          accountType,
          balance,
          currency,
          isOpen,
          name,
        }),
      ]);
    });
  });
});
