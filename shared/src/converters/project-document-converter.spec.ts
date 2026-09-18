import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getProjectId } from '@household/shared/common/utils';
import { projectDocumentConverterFactory, IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { Requests } from '@household/shared/types/requests';

describe('Project document converter', () => {
  let converter: IProjectDocumentConverter;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date());
    converter = projectDocumentConverterFactory();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.project.request();

      const { name, description } = body;

      const result = converter.create(body, undefined);
      expect(result).toEqual(testDataFactory.project.document({
        description,
        name,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.project.request();

      const { name, description } = body;

      const result = converter.create(body, expiresIn);
      expect(result).toEqual(testDataFactory.project.document({
        description,
        name,
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const body = testDataFactory.project.request();

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

    it('should unset description', () => {
      const body = testDataFactory.project.request();

      const modifiedBody: Requests.Project = {
        ...body,
        description: undefined,
      };
      const result = converter.update(modifiedBody, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...modifiedBody,
            expiresAt: addSeconds(expiresIn),
          },
          $unset: {
            description: true,
          },
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const doc = testDataFactory.project.document();

      const { name, description } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.project.response({
        projectId: getProjectId(doc),
        description,
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = testDataFactory.project.document();

      const { name, description } = doc;
      
      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        testDataFactory.project.response({
          projectId: getProjectId(doc),
          description,
          name,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const doc = testDataFactory.project.document();

      const { name } = doc;
      
      const result = converter.toReport(doc);
      expect(result).toEqual(testDataFactory.project.report({
        projectId: getProjectId(doc),
        name,
      }));
    });
  });
});
