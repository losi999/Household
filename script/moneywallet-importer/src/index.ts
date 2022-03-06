import { accountImporter } from '@household/moneywallet-importer/importers/account-importer';
import { categoryImporter } from '@household/moneywallet-importer/importers/category-importer';
import { projectImporter } from '@household/moneywallet-importer/importers/project-importer';
import { recipientImporter } from '@household/moneywallet-importer/importers/recipient-importer';
import { transactionImporter } from '@household/moneywallet-importer/importers/transaction-importer';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';


(async () => {
  try {
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
