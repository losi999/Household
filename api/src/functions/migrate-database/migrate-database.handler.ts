import { IMigrateDatabaseService } from '@household/api/functions/migrate-database/migrate-database.service';

export default (migrateDatabase: IMigrateDatabaseService): AWSLambda.Handler =>
  async () => {
    await migrateDatabase();
  };
