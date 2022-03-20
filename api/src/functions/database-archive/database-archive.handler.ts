import { IDatabaseArchiveService } from '@household/api/functions/database-archive/database-archive.service';


export default (databaseArchive: IDatabaseArchiveService): AWSLambda.ScheduledHandler =>
  async () => {
    await databaseArchive();
  };
