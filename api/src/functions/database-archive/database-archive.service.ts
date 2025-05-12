import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { ITransactionService } from '@household/shared/services/transaction-service';

export interface IDatabaseArchiveService {
  (): Promise<void>;
}

export const databaseArchiveServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  transactionService: ITransactionService,
  productService: IProductService,
  storageService: IStorageService): IDatabaseArchiveService =>
  async () => {
    const [
      accounts,
      projects,
      categories,
      recipients,
      transactions,
      products,
    ] = await Promise.all([
      accountService.dumpAccounts(),
      projectService.dumpProjects(),
      categoryService.dumpCategories(),
      recipientService.dumpRecipients(),
      transactionService.dumpTransactions(),
      productService.dumpProducts(),
    ]);
    const folderName = new Date().toISOString();

    await Promise.all([
      storageService.writeFile('accounts.json', JSON.stringify(accounts), folderName),
      storageService.writeFile('projects.json', JSON.stringify(projects), folderName),
      storageService.writeFile('categories.json', JSON.stringify(categories), folderName),
      storageService.writeFile('recipients.json', JSON.stringify(recipients), folderName),
      storageService.writeFile('transactions.json', JSON.stringify(transactions), folderName),
      storageService.writeFile('products.json', JSON.stringify(products), folderName),
    ]);
  };
