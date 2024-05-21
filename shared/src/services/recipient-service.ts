import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Recipient } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IRecipientService {
  dumpRecipients(): Promise<Recipient.Document[]>;
  saveRecipient(doc: Recipient.Document): Promise<Recipient.Document>;
  getRecipientById(recipientId: Recipient.Id): Promise<Recipient.Document>;
  deleteRecipient(recipientId: Recipient.Id): Promise<unknown>;
  updateRecipient(recipientId: Recipient.Id, updateQuery: UpdateQuery<Recipient.Document>): Promise<unknown>;
  listRecipients(): Promise<Recipient.Document[]>;
  listRecipientsByIds(recipientIds: Recipient.Id[]): Promise<Recipient.Document[]>;
  mergeRecipients(ctx: {
    targetRecipientId: Recipient.Id;
    sourceRecipientIds: Recipient.Id[];
  }): Promise<unknown>;
}

export const recipientServiceFactory = (mongodbService: IMongodbService): IRecipientService => {

  const instance: IRecipientService = {
    dumpRecipients: () => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.recipients.find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveRecipient: async (doc) => {
      return mongodbService.recipients.create(doc);
    },
    getRecipientById: async (recipientId) => {
      return !recipientId ? undefined : mongodbService.recipients.findById(recipientId)
        .lean()
        .exec();
    },
    deleteRecipient: async (recipientId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.recipients.deleteOne({
            _id: recipientId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
            recipient: recipientId,
          }, {
            $unset: {
              recipient: 1,
            },
          }, {
            session,
          })
            .exec();
        });
      });
    },
    updateRecipient: async (recipientId, updateQuery) => {
      return mongodbService.recipients.findByIdAndUpdate(recipientId, updateQuery, {
        runValidators: true,
      });
    },
    listRecipients: () => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.recipients.find({}, null, {
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
    listRecipientsByIds: (recipientIds) => {
      return mongodbService.inSession(async (session) => {
        return mongodbService.recipients.find({
          _id: {
            $in: recipientIds,
          },
        }, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    mergeRecipients: ({ targetRecipientId, sourceRecipientIds }) => {
      console.log(sourceRecipientIds);
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
