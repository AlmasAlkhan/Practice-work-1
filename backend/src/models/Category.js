const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, default: '#6366f1' },
    description: { type: String, trim: true, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
