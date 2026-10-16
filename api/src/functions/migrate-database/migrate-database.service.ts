import { populate } from '@household/shared/common/mongoose-utils';
import { getCategoryId } from '@household/shared/common/utils';
import { AccountType, CategoryType, ProductType, TransactionType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { AnyBulkWriteOperation, Types } from 'mongoose';

export interface IMigrateDatabaseService {
  (): Promise<void>;
}

export const migrateDatabaseServiceFactory = (mongodbService: IMongodbService, storageService: IStorageService): IMigrateDatabaseService => {
  const dumpData = async (title: string) => {
    const categories = await mongodbService.categories((model, session) => {
      return model.find().session(session)
        .lean();
    });

    const products = await mongodbService.products((model, session) => {
      return model.find().session(session)
        .lean();
    });

    const combined = [
      ...categories,
      ...products,
    ].toSorted((a, b) => a._id.toString().localeCompare(b._id.toString()));

    await storageService.writeFile(`${title}-category-product-list.json`, JSON.stringify(combined, null, 2), 'products-migration');

    const unaffectedTransactions = await mongodbService.transactions((model, session) => {
      return model.find({ 
        transactionType: {
          $in: [
            TransactionType.Transfer,
            TransactionType.Draft,
          ],
        },
      }, {}, {
        session,
        lean: true,
      });
    });
    await storageService.writeFile(`${title}-unaffected-transactions.json`, JSON.stringify(unaffectedTransactions, null, 2), 'products-migration');

    const transactions = await mongodbService.transactions((model, session) => {
      return model.find({
        transactionType: {
          $in: [
            TransactionType.Payment,
            TransactionType.Deferred,
            TransactionType.Reimbursement,
            TransactionType.Split,
            TransactionType.Loan,
          ],
        },
      }, {}, {
        session,
        lean: true,
        populate: populate('account', 'transferAccount', 'payingAccount', 'ownerAccount', 'category', 'product', 'splits.category', 'splits.product', 'deferredSplits.category', 'deferredSplits.product', 'deferredSplits.payingAccount', 'deferredSplits.ownerAccount', 'loans.category', 'loans.product', 'loans.payingAccount', 'loans.ownerAccount'),
        sort: {
          _id: 1,
        },
      });
    });
    await storageService.writeFile(`${title}-transactions.json`, JSON.stringify(transactions, null, 2), 'products-migration');
  };

  const migrateProducts = async () => {
    const inventoryCategory = await mongodbService.categories((model, session) => {
      return model.findOne({
        categoryType: CategoryType.Inventory,
        ancestors: [],
      }).session(session);
    });

    await mongodbService.products((model) => {
      return model.cleanIndexes();
    });

    const inventoryCategoryId = getCategoryId(inventoryCategory);
    console.log('DEFAULT INVENTORY CATEGORY ID', inventoryCategoryId);

    const childCategories = await mongodbService.categories((model, session) => {
      return model.find({
        ancestors: inventoryCategoryId,
      })
        .session(session)
        .lean();
    });

    console.log('number of categories to migrate to generic products', childCategories.length);

    const categoriesToDelete = childCategories.map(c => c._id.toString());

    const genericProducts = childCategories.map<Documents.GenericProduct>((c) => {
      return {
        _id: c._id,
        expiresAt: undefined,
        name: c.name,
        productType: ProductType.Generic,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    const oldProductDocuments = (await mongodbService.products((model, session) => {
      return model.find({
        productType: {
          $exists: false,
        },
      }).session(session)
        .lean();
    })) as unknown as (Documents.Id & Api.Product.UnitOfMeasurement & Api.Product.Measurement & Api.Product.FullName & {
      createdAt?: Date;
      updatedAt?: Date;
      brand: string;
      category: Types.ObjectId;
    })[];

    console.log('old products to migrate to specific products', JSON.stringify(oldProductDocuments, null, 2));

    const specificProductUpdates = oldProductDocuments.map<AnyBulkWriteOperation<Documents.SpecificProduct>>((p) => {
      return {
        updateOne: {
          filter: {
            _id: p._id,
          },
          update: {
            $set: {
              name: p.brand,
              productType: ProductType.Specific,
              genericProduct: genericProducts.find(c => c._id.toString() === p.category.toString()),
            },
            $unset: {
              fullName: 1,
              brand: 1,
              category: 1,
            },
          },
        },
      };
    });

    console.log('old products updated to specific', JSON.stringify(specificProductUpdates, null, 2));

    const transactions = await mongodbService.transactions((model, session) => {
      return model.find({
        $or: [
          {
            category: {
              $in: categoriesToDelete,
            },
          },
          {
            'splits.category': {
              $in: categoriesToDelete,
            },
          },
          {
            'deferredSplits.category': {
              $in: categoriesToDelete,
            },
          },
        ],
      }, undefined, {
        session,
        strict: false,
      });
    });

    console.log('transactions found to migrate', JSON.stringify(transactions, null, 2));

    const transactionUpdates = transactions.map<AnyBulkWriteOperation< Documents.Transaction>>((t) => {
      if (t.transactionType === TransactionType.Payment || t.transactionType === TransactionType.Deferred || t.transactionType === TransactionType.Reimbursement) {
        if (t.product) {
          return {
            updateOne: {
              filter: {
                _id: t._id,
              },
              update: {
                $set: {
                  category: inventoryCategoryId,
                },
              },
            },
          };    
        }

        return {
          updateOne: {
            filter: {
              _id: t._id,
            },
            update: {
              $set: {
                category: inventoryCategoryId,
                product: t.category,
              },
            },
          },
        };
      }

      if (t.transactionType === TransactionType.Split) {
        const update: any = {
          $set: {},
        };
        t.splits?.forEach((split, index) => {
          if (categoriesToDelete.includes(getCategoryId(split.category))) {
            if (split.product) {
              update.$set[`splits.${index}.category`] = inventoryCategoryId;
            } else {
              update.$set[`splits.${index}.category`] = inventoryCategoryId;
              update.$set[`splits.${index}.product`] = split.category;
            }
          }
        });

        t.deferredSplits?.forEach((split, index) => {
          if (categoriesToDelete.includes(getCategoryId(split.category))) {
            if (split.product) {
              update.$set[`deferredSplits.${index}.category`] = inventoryCategoryId;
            } else {
              update.$set[`deferredSplits.${index}.category`] = inventoryCategoryId;
              update.$set[`deferredSplits.${index}.product`] = split.category;
            }
          }
        });

        return {
          updateOne: {
            filter: {
              _id: t._id,
            },
            update,
          },
        };
      }

      throw 'Unexpected transaction type';
    });

    console.log('transaction updated', JSON.stringify(transactionUpdates, null, 2));

    await mongodbService.inTransaction(async ({ categories, products, transactions }, session) => {
      const res1 = await products.insertMany(genericProducts, {
        session,
      });

      console.log(res1);

      const res2 = await products.bulkWrite(specificProductUpdates, {
        session,
        strict: false,
      });

      console.log(res2);

      const res3 = await categories.deleteMany({
        _id: {
          $in: categoriesToDelete,
        },
      }, {
        session,
      });

      console.log(res3);

      const res4 = await transactions.bulkWrite(transactionUpdates, {
        session,
        strict: false,
      });

      console.log(res4);
    });
  };

  const migrateLoanTransactions = async () => {
    const deferredTransactions = await mongodbService.transactions((model, session) => {
      return model.find({
        transactionType: 'deferred',
      }, {}, {
        session,
        populate: populate('payingAccount', 'ownerAccount'),
      }).lean();
    });

    console.log('deferred transactions', JSON.stringify(deferredTransactions, null, 2));

    const deferredTransactionUpdates = deferredTransactions.map<AnyBulkWriteOperation<Documents.Transaction>>((t) => {
      if (t.transactionType !== TransactionType.Deferred) {
        return undefined;
      }

      if (t.payingAccount.accountType === AccountType.Loan) {
        console.log(t._id);
        throw 'PAYING ACCOUNT CANNOT BE LOAN';
      }

      if (t.ownerAccount.accountType !== AccountType.Loan) {
        return {
          updateOne: {
            filter: {
              _id: t._id,
            },
            update: {
              $set: {
                transactionType: TransactionType.Payment,
                account: t.payingAccount,
              },
              $unset: {
                payingAccount: 1,
                ownerAccount: 1,
                isSettled: 1,
              },
            },
          },
        };
      }

      if (t.ownerAccount.accountType === AccountType.Loan) {
        return {
          updateOne: {
            filter: {
              _id: t._id,
            },
            update: {
              $set: {
                transactionType: TransactionType.Loan,
              },
              $unset: {
                isSettled: 1,
              },
            },
          },
        };
      }

      throw 'UNEXPECTED TRANSACTION';
    });

    console.log('deferred updated', JSON.stringify(deferredTransactionUpdates, null, 2));

    const deferredSplitTransactions = await mongodbService.transactions((model, session) => {
      return model.find({
        deferredSplits: {
          $exists: true,
          $ne: [],
        },
      }, {}, {
        session,
        populate: populate('deferredSplits.payingAccount', 'deferredSplits.ownerAccount'),
      }).lean();
    });

    console.log('deferred splits', JSON.stringify(deferredSplitTransactions, null, 2));

    const deferredSplitUpdates = deferredSplitTransactions.reduce<AnyBulkWriteOperation<Documents.Transaction>[]>((accumulator, currentValue) => {
      if (currentValue.transactionType !== TransactionType.Split) {
        return accumulator;
      }

      const splitsToConvert = currentValue.deferredSplits.filter((split) => {
        if (split.payingAccount.accountType === AccountType.Loan) {
          console.log(currentValue._id, split._id);
          throw 'deferred split paying account cannot be loan';
        }

        return split.ownerAccount.accountType !== AccountType.Loan;
      });

      if (splitsToConvert.length === 0) {
        return accumulator;
      }

      return [
        ...accumulator,
        {
          updateOne: {
            filter: {
              _id: currentValue._id,
            },
            update: {
              $pull: {
                deferredSplits: {
                  _id: {
                    $in: splitsToConvert.map(s => s ._id),
                  },
                },
              },
              $push: {
                splits: {
                  $each: splitsToConvert.map(s => {
                    delete (s as any).isSettled;
                    const { _id, payingAccount, ownerAccount, transactionType, issuedAt, expiresAt, createdAt, updatedAt, recipient, ...regularSplit } = s;

                    return regularSplit;
                  }),
                },
              },
            },
          },
        },
      ];
    }, []);

    console.log('deferred splits updates', JSON.stringify(deferredSplitUpdates, null, 2));

    await mongodbService.inTransaction(async({ transactions }, session) => {
      const res1 = await transactions.bulkWrite([
        ...deferredTransactionUpdates,
        ...deferredSplitUpdates,
        {
          updateMany: {
            filter: {
              transactionType: TransactionType.Split,
              deferredSplits: {
                $exists: true,
              },
            },
            update: {
              $set: {
                'deferredSplits.$[].transactionType': TransactionType.Loan,
              },
              $unset: {
                'deferredSplits.$[].isSettled': true,
              },
            },
          },
        },
        {
          updateMany: {
            filter: {
              transactionType: TransactionType.Reimbursement,
            },
            update: {
              transactionType: TransactionType.Loan,
            },
          },
        },
        {
          updateMany: {
            filter: {
              deferredSplits: {
                $exists: true,
              },
            },
            update: {
              $rename: {
                deferredSplits: 'loans',
              },
            },
          },
        },
      ], {
        session,
        strict: false,
      });

      console.log(res1);
    });
  };

  return async () => {
    await dumpData('BEFORE');
    await migrateProducts();
    await migrateLoanTransactions();
    await dumpData('AFTER');
  };
};
