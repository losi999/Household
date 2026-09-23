import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';

export interface IRecipientService {
  saveRecipient(doc: Documents.Recipient): Promise<Documents.Recipient>;
  saveRecipients(...docs: Documents.Recipient[]): Promise<unknown>;
  findRecipientById(recipientId: Api.Recipient.Id): Promise<Documents.Recipient>;
  deleteRecipient(recipientId: Api.Recipient.Id): Promise<unknown>;
  updateRecipient(recipientId: Api.Recipient.Id, updateQuery: DocumentUpdate<Documents.Recipient>): Promise<unknown>;
  listRecipients(): Promise<Documents.Recipient[]>;
  findRecipientsByIds(recipientIds: Api.Recipient.Id[]): Promise<Documents.Recipient[]>;
  mergeRecipients(ctx: {
    targetRecipientId: Api.Recipient.Id;
    sourceRecipientIds: Api.Recipient.Id[];
  }): Promise<unknown>;
}

export const recipientServiceFactory = (mongodbService: IMongodbService): IRecipientService => {

  const instance: IRecipientService = {
    saveRecipient: async (doc) => {
      const [recipient] = await mongodbService.recipients((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return recipient;
    },
    saveRecipients: (...docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.recipients.insertMany(docs, {
          session,
        });
      });
    },
    findRecipientById: async (recipientId) => {
      if (recipientId) {
        return mongodbService.recipients((model, session) => {
          return model.findById(recipientId)
            .session(session) 
            .lean();
        });
      }
        
    },
    deleteRecipient: async (recipientId) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.recipients.deleteOne({
          _id: recipientId,
        }, {
          session,
        });
          
        await models.transactions.updateMany({
          recipient: recipientId,
        }, {
          $unset: {
            recipient: 1,
          },
        }, {
          session,
        });
      });
    },
    updateRecipient: async (recipientId, { update }) => {
      return mongodbService.recipients((model, session) => {
        return model.findByIdAndUpdate(recipientId, update, {
          runValidators: true,
          session,
        });
      });
    },
    listRecipients: () => {
      return mongodbService.recipients((model, session) => {
        return model.find({}).session(session)
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean();
      });
    },
    findRecipientsByIds: async (recipientIds) => {
      if(!recipientIds?.length) {
        return [];
      }

      return mongodbService.recipients((model, session) => {
        return model.find({
          _id: {
            $in: recipientIds,
          },
        }).session(session)
          .lean();
      });
    },
    mergeRecipients: ({ targetRecipientId, sourceRecipientIds }) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.recipients.deleteMany({
          _id: {
            $in: sourceRecipientIds,
          },
        }, {
          session,
        });

        await models.transactions.updateMany({
          recipient: {
            $in: sourceRecipientIds,
          },
        }, {
          $set: {
            recipient: targetRecipientId,
          },
        }, {
          runValidators: true,
          session,
        });
      });
    },
  };

  return instance;
};
