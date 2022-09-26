import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Project } from '@household/shared/types/types';

export interface IProjectService {
  dumpProjects(): Promise<Project.Document[]>;
  saveProject(doc: Project.Document): Promise<Project.Document>;
  getProjectById(projectId: Project.IdType): Promise<Project.Document>;
  deleteProject(projectId: Project.IdType): Promise<unknown>;
  updateProject(doc: Project.Document): Promise<unknown>;
  listProjects(): Promise<Project.Document[]>;
  listProjectsByIds(projectIds: Project.IdType[]): Promise<Project.Document[]>;
}

export const projectServiceFactory = (mongodbService: IMongodbService): IProjectService => {
  return {
    dumpProjects: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.projects().find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveProject: (doc) => {
      return mongodbService.projects().create(doc);
    },
    getProjectById: async (projectId) => {
      return !projectId ? undefined : mongodbService.projects().findById(projectId)
        .lean()
        .exec();
    },
    deleteProject: async (projectId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.projects().deleteOne({
            _id: projectId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions().updateMany({
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
          await mongodbService.transactions().updateMany({
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
      return mongodbService.projects().replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
    },
    listProjects: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.projects().find({}, null, {
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
        return mongodbService.projects().find({
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
  };
};
