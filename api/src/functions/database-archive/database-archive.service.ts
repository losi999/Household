import { IDatabaseService } from '@household/shared/services/database-service';
import { IStorageService } from '@household/shared/services/storage-service';

export interface IDatabaseArchiveService {
  (): Promise<void>;
}

export const databaseArchiveServiceFactory = (databaseService: IDatabaseService, storageService: IStorageService): IDatabaseArchiveService =>
  async () => {
    const [accounts, projects, categories, recipients, transactions] = await Promise.all([
      databaseService.dumpAccounts(),
      databaseService.dumpProjects(),
      databaseService.dumpCategories(),
      databaseService.dumpRecipients(),
      databaseService.dumpTransactions(),
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
