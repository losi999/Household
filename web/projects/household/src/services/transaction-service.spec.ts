import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { TransactionService } from './transaction-service';

describe('TransactionService', () => {
  const apiUrl = 'http://api.url';

  let service: TransactionService;
  let httpMock: HttpTestingController;

  const accountId = testDataFactory.account.id();
  const pagination = {
    pageNumber: 2,
    pageSize: 25,
  };
  const url = `${apiUrl}/transaction/v1/accounts/${accountId}/transactions?pageNumber=2&pageSize=25`;
  const transactions = [
    testDataFactory.transaction.response.payment(),
    testDataFactory.transaction.response.transfer(),
  ];

  const setup = () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_URL,
          useValue: apiUrl,
        },
      ],
    });

    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listTransactionsByAccount', () => {
    it('should send a GET request with the pagination and return the transactions', () => {
      setup();

      const next = vi.fn();
      service.listTransactionsByAccount(accountId, pagination).subscribe(next);

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');

      req.flush(transactions);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(transactions);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listTransactionsByAccount(accountId, pagination).subscribe({
        error,
      });

      httpMock.expectOne(url).flush('error', {
        status: 500,
        statusText: 'Server Error',
      });

      expect(error).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTransaction', () => {
    const transactionId = testDataFactory.transaction.id();
    const deleteUrl = `${apiUrl}/transaction/v1/transactions/${transactionId}`;

    it('should send a DELETE request', () => {
      setup();

      const next = vi.fn();
      service.deleteTransaction(transactionId).subscribe(next);

      const req = httpMock.expectOne(deleteUrl);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteTransaction(transactionId).subscribe({
        error,
      });

      httpMock.expectOne(deleteUrl).flush('error', {
        status: 500,
        statusText: 'Server Error',
      });

      expect(error).toHaveBeenCalledTimes(1);
    });
  });
});
