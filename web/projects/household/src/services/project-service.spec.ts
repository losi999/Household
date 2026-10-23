import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { ProjectService } from './project-service';

describe('ProjectService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/project/v1/projects`;

  let service: ProjectService;
  let httpMock: HttpTestingController;

  const projectId = testDataFactory.project.id();
  const project = testDataFactory.project.response();
  const request = testDataFactory.project.request();

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

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listProjects', () => {
    it('should send a GET request and return the list', () => {
      setup();

      const next = vi.fn();
      service.listProjects().subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      req.flush([project]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([project]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listProjects().subscribe({
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

  describe('createProject', () => {
    it('should send a POST request with the body and return the id', () => {
      setup();

      const next = vi.fn();
      const response = {
        projectId, 
      };
      service.createProject(request).subscribe(next);

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
      service.createProject(request).subscribe({
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

  describe('updateProject', () => {
    it('should send a PUT request with the body to the project url', () => {
      setup();

      const next = vi.fn();
      service.updateProject(projectId, request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${projectId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateProject(projectId, request).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${projectId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteProject', () => {
    it('should send a DELETE request to the project url', () => {
      setup();

      const next = vi.fn();
      service.deleteProject(projectId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${projectId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteProject(projectId).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${projectId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('mergeProjects', () => {
    const sourceIds = [
      testDataFactory.project.id(),
      testDataFactory.project.id(),
    ];

    it('should send a POST request with the source ids to the merge url', () => {
      setup();

      const next = vi.fn();
      service.mergeProjects(projectId, sourceIds).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${projectId}/merge`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(sourceIds);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.mergeProjects(projectId, sourceIds).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${projectId}/merge`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
