import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';

export interface IFileService {
  saveFile(doc: Documents.File): Promise<Documents.File>;
  findFileById(fileId: Api.File.Id): Promise<Documents.File>;
  deleteFile(fileId: Api.File.Id): Promise<unknown>;
  updateFile(fileId: Api.File.Id, updateQuery: DocumentUpdate<Documents.File>): Promise<unknown>;
  listFiles(): Promise<Documents.File[]>;
}

export const fileServiceFactory = (mongodbService: IMongodbService): IFileService => {
  const instance: IFileService = {
    saveFile: async(doc) => {
      const [file] = await mongodbService.files((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return file;
    },
    findFileById: async (fileId) => {
      if (fileId) {
        return mongodbService.files((model, session) => {
          return model.findById(fileId)
            .session(session)
            .lean();
        });
      }        
    },
    deleteFile: async (fileId) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.files.findByIdAndDelete(fileId, {
          session,
        });

        await models.transactions.deleteMany({
          file: fileId,
        }, {
          session,
        });
      });
    },
    updateFile: (fileId, { update }) => {
      return mongodbService.files((model, session) => {
        return model.findByIdAndUpdate(fileId, update,
          {
            returnDocument: 'after',
            runValidators: true,
            session,
          },
        );
      });
    },
    listFiles: () => {
      return mongodbService.files((model, session) => {
        return model.aggregate()
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
