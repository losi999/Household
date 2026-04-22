import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IRecipientService, 'saveRecipient' | 'saveRecipients' | 'findRecipientById'>>({
  saveRecipient: async ({ logServiceCall }, use) => {
    const saveRecipient: IRecipientService['saveRecipient'] = async (recipient) => {
      const result = await recipientService.saveRecipient(recipient);
      await logServiceCall('saveRecipient', {
        recipient,
      }, result);
      return result;
    };

    await use(saveRecipient);
  },
  saveRecipients: async ({ logServiceCall }, use) => {
    const saveRecipients: IRecipientService['saveRecipients'] = async (...recipients) => {
      const result = await recipientService.saveRecipients(...recipients);
      await logServiceCall('saveRecipients', {
        recipients,
      }, result);
      return result;
    };

    await use(saveRecipients);
  },
  findRecipientById: async ({ logServiceCall }, use) => {
    const findRecipientById: IRecipientService['findRecipientById'] = async (recipientId) => {
      const result = await recipientService.findRecipientById(recipientId);
      await logServiceCall('findRecipientById', {
        recipientId,
      }, result);
      return result;
    };

    await use(findRecipientById);
  },
});
