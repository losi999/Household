import { IMongodbService } from '@household/shared/services/mongodb-service';
import { File } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IFileService {
  dumpFiles(): Promise<File.Document[]>;
  saveFile(doc: File.Document): Promise<File.Document>;
  getFileById(fileId: File.Id): Promise<File.Document>;
  // deleteFile(fileId: File.Id): Promise<unknown>;
  updateFile(fileId: File.Id, updateQuery: UpdateQuery<File.Document>): Promise<unknown>;
  // listFiles(): Promise<File.Document[]>;
  // listFilesByIds(fileIds: File.Id[]): Promise<File.Document[]>;
}

export const fileServiceFactory = (mongodbService: IMongodbService): IFileService => {
  const instance: IFileService = {
    dumpFiles: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.files.find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveFile: (doc) => {
      return mongodbService.files.create(doc);
    },
    getFileById: async (fileId) => {
      return !fileId ? undefined : mongodbService.files.findById(fileId)
        .lean()
        .exec();
    },
    // deleteFile: async (fileId) => {
    //   return mongodbService.inSession((session) => {
    //     return session.withTransaction(async () => {
    //       await mongodbService.files.deleteOne({
    //         _id: fileId,
    //       }, {
    //         session,
    //       })
    //         .exec();
    //       await mongodbService.transactions().deleteMany({
    //         $or: [
    //           {
    //             file: fileId,
    //           },
    //           {
    //             transferFile: fileId,
    //           },
    //         ],
    //       }, {
    //         session,
    //       })
    //         .exec();
    //     });
    //   });
    // },
    updateFile: (fileId, updateQuery) => {
      return mongodbService.files.findByIdAndUpdate(fileId, updateQuery,
        {
          returnDocument: 'after',
          runValidators: true,
        },
      );
    },
    // listFiles: () => {
    //   return mongodbService.inSession((session) => {
    //     return aggregateFileBalance(mongodbService.files.aggregate(null, {
    //       session,
    //     }))
    //       .collation({
    //         locale: 'hu',
    //       })
    //       .sort({
    //         name: 1,
    //       })
    //       .exec();
    //   });
    // },
    // listFilesByIds: (fileIds) => {
    //   return mongodbService.inSession((session) => {
    //     return mongodbService.files.find({
    //       _id: {
    //         $in: fileIds,
    //       },
    //     }, null, {
    //       session,
    //     })
    //       .lean()
    //       .exec();
    //   });
    // },
  };

  return instance;
};
