import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerService } from './customer-service';

describe('CustomerService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/customer/v1/customers`;

  let service: CustomerService;
  let httpMock: HttpTestingController;

  const customerId = testDataFactory.customer.id();
  const otherCustomerId = testDataFactory.customer.id();
  const customer = testDataFactory.customer.response();
  const request = testDataFactory.customer.request();
  const jobRequest = testDataFactory.customer.job.request();
  const jobName = 'Hajvágás';
  const works = [testDataFactory.calendar.entry.response.workBase()];

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

    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listCustomers', () => {
    it('should send a GET request to the url', () => {
      setup();

      const next = vi.fn();
      service.listCustomers().subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');

      req.flush([customer]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([customer]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listCustomers().subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('createCustomer', () => {
    it('should send a POST request to the url', () => {
      setup();

      const next = vi.fn();
      service.createCustomer(request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      req.flush({
        customerId, 
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        customerId, 
      });
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createCustomer(request).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('getCustomerById', () => {
    it('should send a GET request to the url', () => {
      setup();

      const next = vi.fn();
      service.getCustomerById(customerId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}`);
      expect(req.request.method).toBe('GET');

      req.flush(customer);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(customer);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.getCustomerById(customerId).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('updateCustomer', () => {
    it('should send a PUT request to the url', () => {
      setup();

      const next = vi.fn();
      service.updateCustomer(customerId, request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCustomer(customerId, request).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteCustomer', () => {
    it('should send a DELETE request to the url', () => {
      setup();

      const next = vi.fn();
      service.deleteCustomer(customerId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteCustomer(customerId).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('createCustomerJob', () => {
    it('should send a POST request to the url', () => {
      setup();

      const next = vi.fn();
      service.createCustomerJob(customerId, jobRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}/jobs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jobRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createCustomerJob(customerId, jobRequest).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}/jobs`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('updateCustomerJob', () => {
    it('should send a PUT request to the url', () => {
      setup();

      const next = vi.fn();
      service.updateCustomerJob(customerId, jobName, jobRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}/jobs/${jobName}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(jobRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCustomerJob(customerId, jobName, jobRequest).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}/jobs/${jobName}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteCustomerJob', () => {
    it('should send a DELETE request to the url', () => {
      setup();

      const next = vi.fn();
      service.deleteCustomerJob(customerId, jobName).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}/jobs/${jobName}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteCustomerJob(customerId, jobName).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}/jobs/${jobName}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('listCustomerWorks', () => {
    it('should send a GET request to the url', () => {
      setup();

      const next = vi.fn();
      service.listCustomerWorks(customerId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${customerId}/works`);
      expect(req.request.method).toBe('GET');

      req.flush(works);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(works);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listCustomerWorks(customerId).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${customerId}/works`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('updateCustomerBlacklist', () => {
    it('should send a PUT request to the url', () => {
      setup();

      const next = vi.fn();
      service.updateCustomerBlacklist([
        customerId,
        otherCustomerId,
      ]).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/blacklist`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual([
        customerId,
        otherCustomerId,
      ]);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCustomerBlacklist([
        customerId,
        otherCustomerId,
      ]).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/blacklist`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteCustomerBlacklist', () => {
    it('should send a DELETE request to the url', () => {
      setup();

      const next = vi.fn();
      service.deleteCustomerBlacklist([
        customerId,
        otherCustomerId,
      ]).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/blacklist`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual([
        customerId,
        otherCustomerId,
      ]);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteCustomerBlacklist([
        customerId,
        otherCustomerId,
      ]).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/blacklist`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
