import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';

export interface IProjectService {
  saveProject(doc: Documents.Project): Promise<Documents.Project>;
  saveProjects(...docs: Documents.Project[]): Promise<unknown>;
  findProjectById(projectId: Api.Project.Id): Promise<Documents.Project>;
  deleteProject(projectId: Api.Project.Id): Promise<unknown>;
  updateProject(projectId: Api.Project.Id, updateQuery: DocumentUpdate<Documents.Project>): Promise<unknown>;
  listProjects(): Promise<Documents.Project[]>;
  findProjectsByIds(projectIds: Api.Project.Id[]): Promise<Documents.Project[]>;
  mergeProjects(ctx: {
    targetProjectId: Api.Project.Id;
    sourceProjectIds: Api.Project.Id[];
  }): Promise<unknown>;
}

export const projectServiceFactory = (mongodbService: IMongodbService): IProjectService => {
  return {
    saveProject: async (doc) => {
      const [project] = await mongodbService.projects((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return project;
    },
    saveProjects: (...docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.projects.insertMany(docs, {
          session,
        });
      });
    },
    findProjectById: async (projectId) => {
      if (projectId) {
        return mongodbService.projects((model, session) => {
          return model.findById(projectId)
            .session(session)
            .lean();
        });
      }        
    },
    deleteProject: async (projectId) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.projects.deleteOne({
          _id: projectId,
        }, {
          session,
        });
            
        await models.transactions.updateMany({
          project: projectId,
        }, {
          $unset: {
            project: 1,
          },
        }, {
          runValidators: true,
          session,
        });
            
        await models.transactions.updateMany({
          'splits.project': projectId,
        }, {

          $unset: {
            'splits.$[element].project': 1,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.project': projectId,
            },
          ],
        });
            
        await models.transactions.updateMany({
          'deferredSplits.project': projectId,
        }, {

          $unset: {
            'deferredSplits.$[element].project': 1,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.project': projectId,
            },
          ],
        });
            
      });
    },
    updateProject: async (projectId, { update }) => {
      return mongodbService.projects((model, session) => {
        return model.findByIdAndUpdate(projectId, update, {
          runValidators: true,
          session,
        });
      });
    },
    listProjects: () => {
      return mongodbService.projects((model, session) => {
        return model.find({})
          .session(session)
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean();
      });
    },
    findProjectsByIds: async (projectIds) => {
      if(!projectIds?.length) {
        return [];
      }

      return mongodbService.projects((model, session) => {
        return model.find({
          _id: {
            $in: projectIds,
          },
        }).session(session)
          .lean();
          
      });
    },
    mergeProjects: ({ targetProjectId, sourceProjectIds }) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.projects.deleteMany({
          _id: {
            $in: sourceProjectIds,
          },
        }, {
          session,
        });

        await models.transactions.updateMany({
          project: {
            $in: sourceProjectIds,
          },
        }, {
          $set: {
            project: targetProjectId,
          },
        }, {
          runValidators: true,
          session,
        });

        await models.transactions.updateMany({
          'splits.project': {
            $in: sourceProjectIds,
          },
        }, {
          $set: {
            'splits.$[element].project': targetProjectId,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.project': {
                $in: sourceProjectIds,
              },
            },
          ],
        });
        await models.transactions.updateMany({
          'deferredSplits.project': {
            $in: sourceProjectIds,
          },
        }, {
          $set: {
            'deferredSplits.$[element].project': targetProjectId,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.project': {
                $in: sourceProjectIds,
              },
            },
          ],
        });
      });
    },
  };
};
