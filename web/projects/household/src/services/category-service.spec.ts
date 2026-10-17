import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CategoryService } from './category-service';

describe('CategoryService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/category/v1/categories`;

  let service: CategoryService;
  let httpMock: HttpTestingController;

  const categoryId = testDataFactory.category.id();
  const category = testDataFactory.category.response();
  const request = testDataFactory.category.request();

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

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listCategories', () => {
    it('should send a GET request and return the list', () => {
      setup();

      const next = vi.fn();
      service.listCategories().subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      req.flush([category]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([category]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listCategories().subscribe({
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

  describe('createCategory', () => {
    it('should send a POST request with the body and return the id', () => {
      setup();

      const next = vi.fn();
      const response = {
        categoryId, 
      };
      service.createCategory(request).subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      req.flush(response);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(response);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createCategory(request).subscribe({
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

  describe('updateCategory', () => {
    it('should send a PUT request with the body to the category url', () => {
      setup();

      const next = vi.fn();
      service.updateCategory(categoryId, request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${categoryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCategory(categoryId, request).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${categoryId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteCategory', () => {
    it('should send a DELETE request to the category url', () => {
      setup();

      const next = vi.fn();
      service.deleteCategory(categoryId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${categoryId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteCategory(categoryId).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${categoryId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('mergeCategories', () => {
    const sourceIds = [
      testDataFactory.category.id(),
      testDataFactory.category.id(),
    ];

    it('should send a POST request with the source ids to the merge url', () => {
      setup();

      const next = vi.fn();
      service.mergeCategories(categoryId, sourceIds).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${categoryId}/merge`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(sourceIds);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.mergeCategories(categoryId, sourceIds).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${categoryId}/merge`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
