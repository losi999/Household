import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';

export interface IRecipientService {
  saveRecipient(doc: Recipient.Document): Promise<Recipient.Document>;
  saveRecipients(...docs: Recipient.Document[]): Promise<unknown>;
  findRecipientById(recipientId: Recipient.Id): Promise<Recipient.Document>;
  deleteRecipient(recipientId: Recipient.Id): Promise<unknown>;
  updateRecipient(recipientId: Recipient.Id, updateQuery: DocumentUpdate<Recipient.Document>): Promise<unknown>;
  listRecipients(): Promise<Recipient.Document[]>;
  findRecipientsByIds(recipientIds: Recipient.Id[]): Promise<Recipient.Document[]>;
  mergeRecipients(ctx: {
    targetRecipientId: Recipient.Id;
    sourceRecipientIds: Recipient.Id[];
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
