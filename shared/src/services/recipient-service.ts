import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Recipient } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IRecipientService {
  saveRecipient(doc: Recipient.Document): Promise<Recipient.Document>;
  saveRecipients(docs: Recipient.Document[]): Promise<unknown>;
  findRecipientById(recipientId: Recipient.Id): Promise<Recipient.Document>;
  deleteRecipient(recipientId: Recipient.Id): Promise<unknown>;
  updateRecipient(recipientId: Recipient.Id, updateQuery: UpdateQuery<Recipient.Document>): Promise<unknown>;
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
      const [recipient] = await mongodbService.inSession((session) => {
        return mongodbService.recipients.create([doc], {
          session,
        });
      });
      
      return recipient;
    },
    saveRecipients: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.recipients.insertMany(docs, {
            session,
          });
        });
      });
    },
    findRecipientById: async (recipientId) => {
      if (recipientId) {
        return mongodbService.inSession((session) => {
          return mongodbService.recipients.findById(recipientId)
            .session(session) 
            .lean();
        });
      }
        
    },
    deleteRecipient: async (recipientId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.recipients.deleteOne({
            _id: recipientId,
          }, {
            session,
          });
            
          await mongodbService.transactions.updateMany({
            recipient: recipientId,
          }, {
            $unset: {
              recipient: 1,
            },
          }, {
            session,
          });
            
        });
      });
    },
    updateRecipient: async (recipientId, updateQuery) => {
      return mongodbService.inSession((session) => {
        return mongodbService.recipients.findByIdAndUpdate(recipientId, updateQuery, {
          runValidators: true,
          session,
        });
      });
    },
    listRecipients: () => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.recipients.find({}).session(session)
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

      return mongodbService.inSession(async (session) => {
        return mongodbService.recipients.find({
          _id: {
            $in: recipientIds,
          },
        }).session(session)
          .lean();
          
      });
    },
    mergeRecipients: ({ targetRecipientId, sourceRecipientIds }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.recipients.deleteMany({
            _id: {
              $in: sourceRecipientIds,
            },
          }, {
            session,
          });

          await mongodbService.transactions.updateMany({
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
      });
    },
  };

  return instance;
};
