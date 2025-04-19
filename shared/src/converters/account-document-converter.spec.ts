import { createAccountDocument, createAccountReport, createAccountRequest, createAccountResponse, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { addSeconds, getAccountId } from '@household/shared/common/utils';
import { accountDocumentConverterFactory, IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { AccountType } from '@household/shared/enums';
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
  const owner = 'owner1';
  const currency = 'Ft';
  const accountType = AccountType.Cash;
  const expiresIn = 3600;
  const balance = 12000;
  const isOpen = false;

  const body = createAccountRequest({
    accountType,
    currency,
    name,
    owner,
  });
  const queriedDocument = createAccountDocument({
    name,
    currency,
    accountType,
    balance,

    isOpen,
    owner,
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
        owner,
        isOpen: true,
        balance: undefined,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createAccountDocument({
        accountType,
        currency,
        name,
        owner,
        isOpen: true,
        balance: undefined,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        $set: {
          ...body,
          expiresAt: addSeconds(expiresIn, now),
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createAccountResponse({
        accountId: getAccountId(queriedDocument),
        accountType,
        balance,
        currency,
        isOpen,
        name,
        owner,
      }));
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const result = converter.toReport(queriedDocument);
      expect(result).toEqual(createAccountReport({
        accountId: getAccountId(queriedDocument),
        currency,
        fullName: `${name} (${owner})`,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createAccountResponse({
          accountId: getAccountId(queriedDocument),
          accountType,
          balance,
          currency,
          isOpen,
          name,
          owner,
        }),
      ]);
    });
  });
});
