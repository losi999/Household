import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { addSeconds } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import { Types, startSession } from 'mongoose';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    // const req: Transaction.PaymentRequest = {
    //   accountId: '62c6b8968dcfa650900c4fb3' as Account.Id,
    //   amount: 100,
    //   category: {
    //     name: 'catnew',
    //     categoryType: 'inventory',
    //     parentCategoryId: undefined,
    //   },
    //   description: 'desc',
    //   inventory: {
    //     quantity: 123,
    //     product: {
    //       brand: 'tesco',
    //       measurement: 100,
    //       unitOfMeasurement: 'g',
    //     },
    //   },
    //   issuedAt: new Date().toISOString(),
    //   project: {
    //     name: 'proj123',
    //     description: 'desc32432',
    //   },
    //   recipient: {
    //     name: 'reci1234342',
    //   },
    //   invoice: undefined,
    // };

    // const account = await mongodbService.accounts().findById(req.accountId);
    // console.log('acc', account);

    // const expiresAt = addSeconds(60);

    // await mongodbService.inSession((session) => {
    //   return session.withTransaction(async () => {
    //     console.log('withTransaction');
    //     const productDocument: Product.Document = {
    //       ...req.inventory.product as Product.Request,
    //       _id: undefined,
    //       expiresAt,
    //       fullName: 'fsdds',
    //     };

    //     const [product] = await mongodbService.products().create([productDocument], {
    //       session,
    //     });

    //     console.log('product saved');

    //     const categoryDocument: Category.Document = {
    //       ...req.category as Category.Request,
    //       expiresAt,
    //       _id: undefined,
    //       fullName: 'asqweqw',
    //       products: [product],
    //       parentCategory: undefined,
    //       parentCategoryId: undefined,
    //     };
    //     const [category] = await mongodbService.categories().create([categoryDocument], {
    //       session,
    //     });

    //     console.log('category saved');

    //     const recipientDocument: Recipient.Document = {
    //       ...req.recipient as Recipient.Request,
    //       expiresAt,
    //       _id: undefined,
    //     };

    //     const [recipient] = await mongodbService.recipients().create([recipientDocument], {
    //       session,
    //     });

    //     console.log('recipient saved');

    //     const projectDocument: Project.Document = {
    //       ...req.project as Project.Request,
    //       _id: undefined,
    //       expiresAt,
    //     };

    //     const [project] = await mongodbService.projects().create([projectDocument], {
    //       session,
    //     });

    //     console.log('project saved');

    //     const transactionDocument: Transaction.PaymentDocument = {
    //       ...req,
    //       _id: undefined,
    //       expiresAt,
    //       issuedAt: new Date(req.issuedAt),
    //       transactionType: 'payment',
    //       account,
    //       project,
    //       category,
    //       recipient,
    //       inventory: {
    //         ...req.inventory,
    //         product,
    //       },
    //       accountId: undefined,
    //       invoice: undefined,
    //     };

    //     const [transaction] = await mongodbService.transactions().create([transactionDocument], {
    //       session,
    //     });

    //     console.log('transaction saved', transaction);

    // });
    // });

    // const res = await mongodbService.transactions().create(req);
    // console.log(res);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
