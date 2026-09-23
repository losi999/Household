import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getAccountId } from '@household/shared/common/utils';
import { accountDocumentConverterFactory, IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';

describe('Account document converter', () => {
  let converter: IAccountDocumentConverter;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date());
    converter = accountDocumentConverterFactory();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.account.request();

      const { accountType, currency, name, owner } = body;

      const result = converter.create(body, undefined);
      expect(result).toEqual(testDataFactory.account.document({
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
      const body = testDataFactory.account.request();

      const { accountType, currency, name, owner } = body;

      const result = converter.create(body, expiresIn);
      expect(result).toEqual(testDataFactory.account.document({
        accountType,
        currency,
        name,
        owner,
        isOpen: true,
        balance: undefined,
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const body = testDataFactory.account.request();

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn),
          },
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const doc = testDataFactory.account.document();

      const { accountType, currency, name, owner, balance, isOpen } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.account.response({
        accountId: getAccountId(doc),
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
      const doc = testDataFactory.account.document();

      const { currency, name, owner } = doc;

      const result = converter.toReport(doc);
      expect(result).toEqual(testDataFactory.account.report({
        accountId: getAccountId(doc),
        currency,
        fullName: `${name} (${owner})`,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = testDataFactory.account.document();

      const { accountType, currency, name, owner, balance, isOpen } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        testDataFactory.account.response({
          accountId: getAccountId(doc),
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
