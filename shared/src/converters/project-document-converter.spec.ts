import { createProjectDocument, createProjectId, createProjectRequest, createProjectResponse } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { projectDocumentConverterFactory, IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { Types } from 'mongoose';
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
  const projectId = new Types.ObjectId();

  const body = createProjectRequest({
    description,
    name,
  });
  const queriedDocument = createProjectDocument({
    name,
    description,
    _id: projectId,
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
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createProjectDocument({
        description,
        name,
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
      expect(result).toEqual(createProjectDocument({
        _id: projectId,
        description,
        name,
        createdAt: now,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createProjectResponse({
        projectId: createProjectId(projectId),
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
          projectId: createProjectId(projectId),
          description,
          name,
        }),
      ]);
    });
  });
});
