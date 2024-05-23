import { config } from 'dotenv';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { Account } from '@household/shared/types/types';
import { writeFileSync } from 'fs';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const balanceByYear: {[year: number]: {
      [currency: string]: number
    }} = {};

    for (let year = 2014; year <= 2023; year += 1) {
      const accounts = await mongodbService.accounts.aggregate<Account.Document>()
        .lookup({
          from: 'transactions',
          localField: '_id',
          foreignField: 'account',
          as: 'regular',
          pipeline: [
            {
              $match: {
                issuedAt: {
                  $lte: new Date(year, 11, 31),
                },
              },
            },
          ],
        })
        .lookup({
          from: 'transactions',
          localField: '_id',
          foreignField: 'transferAccount',
          as: 'inverted',
          pipeline: [
            {
              $match: {
                issuedAt: {
                  $lte: new Date(year, 11, 31),
                },
              },
            },
          ],
        })
        .addFields({
          balance: {
            $sum: [
              {
                $sum: '$regular.amount',
              },
              {
                $sum: '$inverted.transferAmount',
              },
            ],
          },
        })
        .project({
          regular: false,
          inverted: false,
        })
        .collation({
          locale: 'hu',
        })
        .sort({
          name: 1,
        });

      balanceByYear[year] = {};

      accounts.forEach(a => {
        if (a.name.includes('Juci')) {
          return;
        }

        let currency: string;
        switch(a.currency) {
          case 'Ft': currency = 'HUF'; break;
          case '$': currency = 'USD';break;
          case '€': currency = 'EUR';break;
          case 'zł': currency = 'PLN';break;
        }

        if (!balanceByYear[year][currency]) {
          balanceByYear[year][currency] = 0;
        }

        balanceByYear[year][currency] += a.balance;
      });
    }

    writeFileSync('balanceByYear.json', JSON.stringify(balanceByYear, null, 2), {
      encoding: 'utf-8',
    });

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }

})();
