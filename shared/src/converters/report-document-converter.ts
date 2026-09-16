import { Report } from '@household/shared/types/types';
import { PipelineStage, Types } from 'mongoose';
import { Filter, FilterOperators } from 'mongodb';
import { Documents } from '@household/shared/types/documents';

export interface IReportDocumentConverter {
  createFilterQuery(body: Report.Request): PipelineStage.Match;
}

export const reportDocumentConverterFactory = (): IReportDocumentConverter => {
  const instance: IReportDocumentConverter = {
    createFilterQuery: (body) => {
      const match: PipelineStage.Match = {
        $match: {
          $and: [],
        },
      };

      const includedDateQueries: Filter<Documents.Transaction> = {
        $or: [],
      };

      const excludedDateQueries: Filter<Documents.Transaction>[] = [];

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
              const query: Filter<Documents.Transaction> = {
                issuedAt: {},
              };
              if (filter.from) {
                (query.issuedAt as FilterOperators<Date>).$gte = new Date(filter.from);
              }

              if (filter.to) {
                (query.issuedAt as FilterOperators<Date>).$lte = new Date(filter.to);
              }

              includedDateQueries.$or.push(query);
            } else {
              const query: Filter<Documents.Transaction> = {
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
        match.$match.$and.push(includedDateQueries as any);
      }

      if (excludedDateQueries.length > 0) {
        match.$match.$and.push(...excludedDateQueries as any);
      }

      return match;
    },
  };

  return instance;
};
