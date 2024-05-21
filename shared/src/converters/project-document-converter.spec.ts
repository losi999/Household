import { createDocumentUpdate, createProjectDocument, createProjectReport, createProjectRequest, createProjectResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getProjectId } from '@household/shared/common/utils';
import { projectDocumentConverterFactory, IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Project document converter', () => {
  let converter: IProjectDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = projectDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const name = 'Nyaralás';
  const description = '2022';
  const expiresIn = 3600;

  const body = createProjectRequest({
    description,
    name,
  });
  const queriedDocument = createProjectDocument({
    name,
    description,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createProjectDocument({
        description,
        name,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createProjectDocument({
        description,
        name,
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
      expect(result).toEqual(createProjectResponse({
        projectId: getProjectId(queriedDocument),
        description,
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createProjectResponse({
          projectId: getProjectId(queriedDocument),
          description,
          name,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const result = converter.toReport(queriedDocument);
      expect(result).toEqual(createProjectReport({
        projectId: getProjectId(queriedDocument),
        name,
      }));
    });
  });
});
