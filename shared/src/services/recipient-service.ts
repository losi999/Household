import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Recipient } from '@household/shared/types/types';

export interface IRecipientService {
  dumpRecipients(): Promise<Recipient.Document[]>;
  saveRecipient(doc: Recipient.Document): Promise<Recipient.Document>;
  getRecipientById(recipientId: Recipient.IdType): Promise<Recipient.Document>;
  deleteRecipient(recipientId: Recipient.IdType): Promise<unknown>;
  updateRecipient(doc: Recipient.Document): Promise<unknown>;
  listRecipients(): Promise<Recipient.Document[]>;
}

export const recipientServiceFactory = (mongodbService: IMongodbService): IRecipientService => {

  const instance: IRecipientService = {
    dumpRecipients: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.recipients().find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveRecipient: (doc) => {
      return mongodbService.recipients().create(doc);
    },
    getRecipientById: async (recipientId) => {
      return !recipientId ? undefined : mongodbService.recipients().findById(recipientId)
        .lean()
        .exec();
    },
    deleteRecipient: async (recipientId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.recipients().deleteOne({
            _id: recipientId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions().updateMany({
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
    updateRecipient: (doc) => {
      return mongodbService.recipients().replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
    },
    listRecipients: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.recipients().find({}, null, {
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
  };

  return instance;
};
