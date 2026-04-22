import { IRecipientService } from '@household/shared/services/recipient-service';
import { recipientServiceFactory } from '@household/shared/services/recipient-service';
import { mongoDbService } from '@household/test/dependencies';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

const recipientService = recipientServiceFactory(mongoDbService);

export const test = baseTest.extend<Pick<IRecipientService, 'saveRecipient' | 'saveRecipients' | 'findRecipientById'>>({
  saveRecipient: async ({ logDbCall }, use) => {
    const saveRecipient: IRecipientService['saveRecipient'] = async (recipient) => {
      const result = await recipientService.saveRecipient(recipient);
      await logDbCall('saveRecipient', {
        recipient,
      }, result);
      return result;
    };

    await use(saveRecipient);
  },
  saveRecipients: async ({ logDbCall }, use) => {
    const saveRecipients: IRecipientService['saveRecipients'] = async (...recipients) => {
      const result = await recipientService.saveRecipients(...recipients);
      await logDbCall('saveRecipients', {
        recipients,
      }, result);
      return result;
    };

    await use(saveRecipients);
  },
  findRecipientById: async ({ logDbCall }, use) => {
    const findRecipientById: IRecipientService['findRecipientById'] = async (recipientId) => {
      const result = await recipientService.findRecipientById(recipientId);
      await logDbCall('findRecipientById', {
        recipientId,
      }, result);
      return result;
    };

    await use(findRecipientById);
  },
});
