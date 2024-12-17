// import { config } from 'dotenv';
// import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
// import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
// import { writeFileSync } from 'fs';
// import { Category, Product } from '@household/shared/types/types';
// import { getCategoryId, getProductId } from '@household/shared/common/utils';

// (async () => {
//   try {
//     config();
//     const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

//     const transactions = await mongodbService.transactions.find({
//       $or: [
//         {
//           inventory: {
//             $exists: true,
//           },
//         },
//         {
//           'splits.inventory': {
//             $exists: true,
//           },
//         },
//       ],
//     })
//       .populate('category')
//       .populate('recipient')
//       .populate('splits.category')
//       .lean();

//     const counter = {
//       total: transactions.length,
//       products: 0,
//       payment: 0,
//       split: 0,
//       transfer: 0,
//     };

//     const products: Product.Document[] = [];
//     const categories: {
//       [categoryId: Category.IdType]: Product.IdType[]
//     } = {};

//     transactions.forEach((transaction) => {
//       if (transaction.transactionType === 'payment') {
//         counter.payment += 1;
//         counter.products += 1;
//         const product = productDocumentConverter.create({
//           brand: (transaction.inventory as any).brand ?? transaction.recipient?.name ?? '¯\\_(ツ)_/¯',
//           measurement: (transaction.inventory as any).measurement ?? 1,
//           unitOfMeasurement: (transaction.inventory as any).unitOfMeasurement ?? 'db',
//         }, undefined, true);
//         products.push(product);
//         if(!categories[getCategoryId(transaction.category)]) {
//           categories[getCategoryId(transaction.category)] = [];
//         }

//         categories[getCategoryId(transaction.category)].push(getProductId(product));

//         transaction.inventory = {
//           quantity: transaction.inventory.quantity,
//           product,
//         };
//       }

//       if (transaction.transactionType === 'split') {
//         counter.split += 1;
//         transaction.splits.forEach((split) => {
//           if (split.inventory) {
//             counter.products += 1;
//             const product = productDocumentConverter.create({
//               brand: (split.inventory as any).brand ?? transaction.recipient?.name ?? '¯\\_(ツ)_/¯',
//               measurement: (split.inventory as any).measurement ?? 1,
//               unitOfMeasurement: (split.inventory as any).unitOfMeasurement ?? 'db',
//             }, undefined, true);
//             products.push(product);

//             if(!categories[getCategoryId(split.category)]) {
//               categories[getCategoryId(split.category)] = [];
//             }

//             categories[getCategoryId(split.category)].push(getProductId(product));

//             split.inventory = {
//               quantity: split.inventory.quantity,
//               product,
//             };
//           }
//         });
//       }

//       if(transaction.transactionType === 'transfer') {
//         counter.transfer += 1;
//       }
//     });

//     console.log('TOTAL', counter.payment + counter.split === counter.total);
//     console.log('PRODUCTS TOTAL', counter.products === products.length);
//     console.log('NO TRANSFER', counter.transfer === 0);

//     writeFileSync('products.json', JSON.stringify(products, null, 2));
//     writeFileSync('categories.json', JSON.stringify(categories, null, 2));
//     writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));

//     await mongodbService.inSession((session) => {
//       return session.withTransaction(async () => {
//         await Promise.all(products.map(p => new (mongodbService.products())(p).save({
//           session,
//         })));

//         await Promise.all(Object.keys(categories).map((categoryId: Category.IdType) => {
//           return mongodbService.categories().updateOne({
//             _id: categoryId,
//           }, {
//             $push: {
//               products: [...categories[categoryId]],
//             },
//           }, {
//             session,
//           });
//         }));

//         await Promise.all(transactions.map(transaction => {
//           if (transaction.transactionType === 'payment') {
//             return mongodbService.transactions().updateOne({
//               _id: transaction._id,
//             }, {
//               inventory: {
//                 quantity: transaction.inventory.quantity,
//                 product: transaction.inventory.product._id,
//               },
//             }, {
//               session,
//             });
//           }

//           if (transaction.transactionType === 'split') {
//             return mongodbService.transactions().updateOne({
//               _id: transaction._id,
//             }, {
//               splits: transaction.splits.map(s => {
//                 return {
//                   ...s,
//                   inventory: s.inventory ? {
//                     quantity: s.inventory.quantity,
//                     product: s.inventory.product._id,
//                   } : undefined,
//                 };
//               }),
//             }, {
//               session,
//             });
//           }
//         }));
//       });
//     });

//   } catch (error) {
//     console.log('ERR', error);
//   } finally {
//     console.log('Finally');
//     process.exit();
//   }

// })();
