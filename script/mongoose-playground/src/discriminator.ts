'use strict';

import mongoose, { Types } from 'mongoose';

mongoose.set('debug', true);

const { Schema } = mongoose;

(async () => {
  await mongoose.connect('mongodb+srv://admin:mx7BZHulpdRfCkwB@household.4xisa.mongodb.net/household-localhost?retryWrites=true&w=majority', {});

  // await mongoose.connection.dropDatabase();

  const baseSchema = new Schema({}, {
    discriminatorKey: 'type',
  });
  const baseModel = mongoose.model('thing', baseSchema);

  const aSchema = new Schema(
    {
      aThing: {
        type: Number,
        required: true,
      },
    },
    {},
  );
  const aModel = baseModel.discriminator('A', aSchema);

  const bSchema = new Schema(
    {
      bThing: {
        type: String,
        required: true,
      },
    },
    {},
  );
  const bModel = baseModel.discriminator('B', bSchema);

  // Model is created as a type A
  const doc = await baseModel.create({
    type: 'A',
    aThing: 1,
    bThing: 'a',
  });
  const doc2 = await baseModel.create({
    type: 'B',
    aThing: 1,
    bThing: 'a',
  });

  await baseModel.findOneAndReplace({
    _id: new Types.ObjectId(doc._id.toString()),
  }, {
    _id: undefined,
    type: 'B',
    bThing: 'two',
  }, {
    runValidators: true,
    overwriteDiscriminatorKey: true,
  });

  // await baseModel.findByIdAndUpdate(
  //   doc._id,
  //   {
  //     $set: {
  //       type: 'B',
  //       bThing: 'two',
  //     },
  //     $unset: {
  //       aThing: 1,
  //     },
  //   },
  //   {
  //     runValidators: true,
  //     overwriteDiscriminatorKey: true,
  //     new: true,
  //   },
  // );

  // const res = await baseModel.findone(
  //   {
  //     _id: doc._id,
  //   },
  //   {
  //     type: 'B',
  //     aThing: 5,
  //     bThing: 'twoa',
  //     cThing: true,
  //   },
  //   {
  //     // explain: true,
  //     // runValidators: true,
  //     overwriteDiscriminatorKey: true,
  //   },
  // );

  // console.log(res);
})();
