import { Report, Transaction } from '@household/shared/types/types';
import { FilterQuery, PipelineStage, Types } from 'mongoose';

export interface IReportDocumentConverter {
  createFilterQuery(body: Report.Request): PipelineStage.Match;
}

export const reportDocumentConverterFactory = (): IReportDocumentConverter => {
  const instance: IReportDocumentConverter = {
    createFilterQuery: (body) => {
      const match: PipelineStage.Match = {
        $match: {
          $and: [
            {
              transactionType: {
                $ne: 'transfer',
              },
            },
            {
              $expr: {
                $ne: [
                  '$account',
                  '$payingAccount',
                ],
              },
            },
          ],
        },
      };

      const includedDateQueries: FilterQuery<Transaction.Document> = {
        $or: [],
      };

      const excludedDateQueries: FilterQuery<Transaction.Document>[] = [];

      body.forEach((filter) => {
        switch(filter.filterType) {
          case 'account':
          case 'recipient':
          case 'category':
          case 'product':
          case 'project':{
            match.$match.$and.push({
              [filter.filterType]: {
                [filter.include ? '$in' : '$nin']: filter.items.map(i => new Types.ObjectId(i)),
              },
            });
          } break;
          case 'issuedAt': {
            if(filter.include) {
              const query: FilterQuery<Transaction.Document> = {
                issuedAt: {},
              };
              if (filter.from) {
                query.issuedAt.$gte = new Date(filter.from);
              }

              if (filter.to) {
                query.issuedAt.$lte = new Date(filter.to);
              }

              includedDateQueries.$or.push(query);
            } else {
              const query: FilterQuery<Transaction.Document> = {
                $or: [],
              };

              if (filter.from) {
                query.$or.push({
                  issuedAt: {
                    $lt: new Date(filter.from),
                  },
                });
              }
              if(filter.to) {
                query.$or.push({
                  issuedAt: {
                    $gt: new Date(filter.to),
                  },
                });
              }

              excludedDateQueries.push(query);
            }
          } break;
        }
      });

      if (includedDateQueries.$or.length > 0) {
        match.$match.$and.push(includedDateQueries);
      }

      if (excludedDateQueries.length > 0) {
        match.$match.$and.push(...excludedDateQueries);
      }

      return match;
    },
  };

  return instance;
};
