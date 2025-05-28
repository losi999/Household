import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Project } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IProjectService {
  dumpProjects(): Promise<Project.Document[]>;
  saveProject(doc: Project.Document): Promise<Project.Document>;
  saveProjects(docs: Project.Document[]): Promise<unknown>;
  findProjectById(projectId: Project.Id): Promise<Project.Document>;
  deleteProject(projectId: Project.Id): Promise<unknown>;
  updateProject(projectId: Project.Id, updateQuery: UpdateQuery<Project.Document>): Promise<unknown>;
  listProjects(): Promise<Project.Document[]>;
  findProjectsByIds(projectIds: Project.Id[]): Promise<Project.Document[]>;
  mergeProjects(ctx: {
    targetProjectId: Project.Id;
    sourceProjectIds: Project.Id[];
  }): Promise<unknown>;
}

export const projectServiceFactory = (mongodbService: IMongodbService): IProjectService => {
  return {
    dumpProjects: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.projects.find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveProject: (doc) => {
      return mongodbService.projects.create(doc);
    },
    saveProjects: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.projects.insertMany(docs, {
            session,
          });
        });
      });
    },
    findProjectById: async (projectId) => {
      return !projectId ? undefined : mongodbService.projects.findById(projectId)
        .lean()
        .exec();
    },
    deleteProject: async (projectId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.projects.deleteOne({
            _id: projectId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
            project: projectId,
          }, {
            $unset: {
              project: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
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
          })
            .exec();
          await mongodbService.transactions.updateMany({
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
          })
            .exec();
        });
      });
    },
    updateProject: async (projectId, updateQuery) => {
      return mongodbService.projects.findByIdAndUpdate(projectId, updateQuery, {
        runValidators: true,
      });
    },
    listProjects: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.projects.find({}, null, {
          session,
        })
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean()
          .exec();
      });
    },
    findProjectsByIds: (projectIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.projects.find({
          _id: {
            $in: projectIds,
          },
        }, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    mergeProjects: ({ targetProjectId, sourceProjectIds }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.projects.deleteMany({
            _id: {
              $in: sourceProjectIds,
            },
          }, {
            session,
          });

          await mongodbService.transactions.updateMany({
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

          await mongodbService.transactions.updateMany({
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
          await mongodbService.transactions.updateMany({
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
      });
    },
  };
};
