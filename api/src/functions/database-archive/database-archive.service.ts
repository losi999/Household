import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
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
  storageService: IStorageService): IDatabaseArchiveService =>
  async () => {
    const [
      accounts,
      projects,
      categories,
      recipients,
      transactions,
    ] = await Promise.all([
      accountService.dumpAccounts(),
      projectService.dumpProjects(),
      categoryService.dumpCategories(),
      recipientService.dumpRecipients(),
      transactionService.dumpTransactions(),
    ]);
    const folderName = new Date().toISOString();

    await Promise.all([
      storageService.writeFile(process.env.DATABASE_ARCHIVE_BUCKET, 'accounts.json', accounts, folderName),
      storageService.writeFile(process.env.DATABASE_ARCHIVE_BUCKET, 'projects.json', projects, folderName),
      storageService.writeFile(process.env.DATABASE_ARCHIVE_BUCKET, 'categories.json', categories, folderName),
      storageService.writeFile(process.env.DATABASE_ARCHIVE_BUCKET, 'recipients.json', recipients, folderName),
      storageService.writeFile(process.env.DATABASE_ARCHIVE_BUCKET, 'transactions.json', transactions, folderName),
    ]);
  };
