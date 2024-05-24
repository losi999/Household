import { Report, Transaction } from '@household/shared/types/types';
import { FilterQuery, PipelineStage, Types } from 'mongoose';

export interface IReportDocumentConverter {
  createFilterQuery(body: Report.Request): [PipelineStage.Match, PipelineStage.Match];
}

export const reportDocumentConverterFactory = (): IReportDocumentConverter => {
  const instance: IReportDocumentConverter = {
    createFilterQuery: (body) => {
      const firstMatch: PipelineStage.Match = {
        $match: {
          $and: [
            {
              transactionType: {
                $ne: 'transfer',
              },
            },
          ],
        },
      };
      const secondMatch: PipelineStage.Match = {
        $match: {
          $and: [],
        },
      };

      const dateQueries: FilterQuery<Transaction.Document> = {
        $or: [],
      };

      body.forEach((filter) => {
        switch(filter.filterType) {
          case 'account':
          case 'recipient': {
            firstMatch.$match.$and.push({
              [filter.filterType]: {
                [filter.exclude ? '$nin' : '$in']: filter.items.map(i => new Types.ObjectId(i)),
              },
            });
          } break;
          case 'category':
          case 'product':
          case 'project': {
            secondMatch.$match.$and.push({
              [filter.filterType]: {
                [filter.exclude ? '$nin' : '$in']: filter.items.map(i => new Types.ObjectId(i)),
              },
            });
          } break;
          case 'issuedAt': {
            const query: FilterQuery<Transaction.Document> = {
              issuedAt: {},
            };
            if (filter.from) {
              query.issuedAt[filter.exclude ? '$lt' : '$gte'] = new Date(filter.from);
            }

            if (filter.to) {
              query.issuedAt[filter.exclude ? '$gt' : '$lte'] = new Date(filter.to);
            }

            dateQueries.$or.push(query);
          } break;
        }
      });

      if (dateQueries.$or.length > 0) {
        firstMatch.$match.$and.push(dateQueries);
      }

      return [
        firstMatch,
        secondMatch,
      ];
    },
  };

  return instance;
};
