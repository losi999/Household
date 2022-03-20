import { config } from 'dotenv';
import { accountImporter } from '@household/moneywallet-importer/importers/account-importer';
import { categoryImporter } from '@household/moneywallet-importer/importers/category-importer';
import { projectImporter } from '@household/moneywallet-importer/importers/project-importer';
import { recipientImporter } from '@household/moneywallet-importer/importers/recipient-importer';
import { transactionImporter } from '@household/moneywallet-importer/importers/transaction-importer';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory();

    const projects = await projectImporter(mongodbService)();
    const accounts = await accountImporter(mongodbService)();
    const recipients = await recipientImporter(mongodbService)();
    const categories = await categoryImporter(mongodbService)();
    await transactionImporter(mongodbService)({
      accounts,
      categories,
      recipients,
      projects,
    })

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }

})();
