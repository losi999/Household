import { IMongodbService } from '@household/shared/services/mongodb-service';
import { File } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IFileService {
  saveFile(doc: File.Document): Promise<File.Document>;
  findFileById(fileId: File.Id): Promise<File.Document>;
  deleteFile(fileId: File.Id): Promise<unknown>;
  updateFile(fileId: File.Id, updateQuery: UpdateQuery<File.Document>): Promise<unknown>;
  listFiles(): Promise<File.Document[]>;
}

export const fileServiceFactory = (mongodbService: IMongodbService): IFileService => {
  const instance: IFileService = {
    saveFile: async(doc) => {
      const [file] = await mongodbService.inSession((session) => {
        return mongodbService.files.create([doc], {
          session,
        });
      });
      
      return file;
    },
    findFileById: async (fileId) => {
      if (fileId) {
        return mongodbService.inSession((session) => {
          return mongodbService.files.findById(fileId)
            .session(session)
            .lean();
        });
      }        
    },
    deleteFile: async (fileId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.files.findByIdAndDelete(fileId, {
            session,
          });

          await mongodbService.transactions.deleteMany({
            file: fileId,
          }, {
            session,
          });
        });
      });
    },
    updateFile: (fileId, updateQuery) => {
      return mongodbService.inSession((session) => {
        return mongodbService.files.findByIdAndUpdate(fileId, updateQuery,
          {
            returnDocument: 'after',
            runValidators: true,
            session,
          },
        );
      });
    },
    listFiles: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.files.aggregate()
          .lookup({
            from: 'transactions',
            localField: '_id',
            foreignField: 'file',
            as: 'relatedTransactions',
          })
          .addFields({
            draftCount: {
              $size: '$relatedTransactions',
            },
          })
          .project({
            relatedTransactions: 0,
          })
          .sort({
            createdAt: -1,
          })
          .session(session);
          
      });
    },
  };

  return instance;
};
