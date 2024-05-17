import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Project } from '@household/shared/types/types';

export interface IProjectService {
  dumpProjects(): Promise<Project.Document[]>;
  saveProject(doc: Project.Document): Promise<Project.Document>;
  getProjectById(projectId: Project.Id): Promise<Project.Document>;
  deleteProject(projectId: Project.Id): Promise<unknown>;
  updateProject(doc: Project.Document): Promise<unknown>;
  listProjects(): Promise<Project.Document[]>;
  listProjectsByIds(projectIds: Project.Id[]): Promise<Project.Document[]>;
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
    getProjectById: async (projectId) => {
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
        });
      });
    },
    updateProject: (doc) => {
      return mongodbService.projects.replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
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
    listProjectsByIds: (projectIds) => {
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
        });
      });
    },
  };
};
