import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { ProductService } from './product-service';

describe('ProductService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/product/v1/products`;

  let service: ProductService;
  let httpMock: HttpTestingController;

  const productTree = testDataFactory.product.tree();
  const productId = testDataFactory.product.id();
  const productRequest = testDataFactory.product.request.generic();

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

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listProducts', () => {
    it('should send a GET request and return the product tree', () => {
      setup();

      const next = vi.fn();
      service.listProducts().subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      req.flush([productTree]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([productTree]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listProducts().subscribe({
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

  describe('createProduct', () => {
    it('should send a POST request with the body and return the id', () => {
      setup();

      const next = vi.fn();
      const response = {
        productId,
      };
      service.createProduct(productRequest).subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(productRequest);

      req.flush(response);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(response);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createProduct(productRequest).subscribe({
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

  describe('updateProduct', () => {
    it('should send a PUT request with the body to the product url', () => {
      setup();

      const next = vi.fn();
      service.updateProduct(productId, productRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${productId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(productRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateProduct(productId, productRequest).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${productId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteProduct', () => {
    it('should send a DELETE request to the product url', () => {
      setup();

      const next = vi.fn();
      service.deleteProduct(productId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${productId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteProduct(productId).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${productId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('mergeProducts', () => {
    const sourceIds = [
      testDataFactory.product.id(),
      testDataFactory.product.id(),
    ];

    it('should send a POST request with the source ids to the merge url', () => {
      setup();

      const next = vi.fn();
      service.mergeProducts(productId, sourceIds).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${productId}/merge`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(sourceIds);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.mergeProducts(productId, sourceIds).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${productId}/merge`).flush('error', {
        status: 400,
        statusText: 'Bad Request',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(400);
    });
  });
});
