import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { AccountService } from './account-service';

describe('AccountService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/account/v1/accounts`;

  let service: AccountService;
  let httpMock: HttpTestingController;

  const account = testDataFactory.account.response();
  const accountRequest = testDataFactory.account.request();

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

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listAccounts', () => {
    it('should send a GET request and return the accounts', () => {
      setup();

      const next = vi.fn();
      service.listAccounts().subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      req.flush([account]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([account]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listAccounts().subscribe({
        error,
      });

      httpMock.expectOne(baseUrl).flush('error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(500);
    });
  });

  describe('createAccount', () => {
    it('should send a POST request with the body and return the id', () => {
      setup();

      const next = vi.fn();
      const response = {
        accountId: account.accountId,
      };
      service.createAccount(accountRequest).subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(accountRequest);

      req.flush(response);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(response);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createAccount(accountRequest).subscribe({
        error,
      });

      httpMock.expectOne(baseUrl).flush('error', {
        status: 400,
        statusText: 'Bad Request',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(400);
    });
  });

  describe('updateAccount', () => {
    it('should send a PUT request with the body to the account url', () => {
      setup();

      const next = vi.fn();
      service.updateAccount(account.accountId, accountRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${account.accountId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(accountRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateAccount(account.accountId, accountRequest).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${account.accountId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteAccount', () => {
    it('should send a DELETE request to the account url', () => {
      setup();

      const next = vi.fn();
      service.deleteAccount(account.accountId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${account.accountId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteAccount(account.accountId).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${account.accountId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('openAccount', () => {
    it('should simulate a successful call, no request is sent', () => {
      setup();

      const next = vi.fn();
      const complete = vi.fn();
      service.openAccount(account.accountId).subscribe({
        next,
        complete,
      });

      httpMock.verify();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(undefined);
      expect(complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeAccount', () => {
    it('should simulate a successful call, no request is sent', () => {
      setup();

      const next = vi.fn();
      const complete = vi.fn();
      service.closeAccount(account.accountId).subscribe({
        next,
        complete,
      });

      httpMock.verify();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(undefined);
      expect(complete).toHaveBeenCalledTimes(1);
    });
  });
});
