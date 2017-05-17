'use strict';

import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  userId: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
}, {
  collection: 'user',
  timestamps: true,
});

export default mongoose.model('user', schema);
