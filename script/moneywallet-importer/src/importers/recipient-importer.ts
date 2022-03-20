import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Recipient } from '@household/shared/types/types';
import data from '@household/moneywallet-importer/data/Receiver.json'
import { Types } from 'mongoose';

export const recipientImporter = (mongodbService: IMongodbService) => {
  return async () => {
    const legacyIds: { [legacyId: string]: Types.ObjectId } = {}

    const recipients = data.filter(x => !!x.Name).map<Recipient.Document>((r) => {
      const id = new Types.ObjectId();

      legacyIds[r.ReceiverID.toLowerCase()] = id;

      return {
        _id: id,
        name: r.Name,
        expiresAt: undefined,
      };
    });

    await mongodbService.recipients.insertMany(recipients);

    return legacyIds;
  };
};
