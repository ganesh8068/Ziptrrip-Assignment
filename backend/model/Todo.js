const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const TodoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  completed: { type: Boolean, default: false },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  category: { type: String, default: 'General', trim: true },
  dueDate: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  subtasks: [SubtaskSchema]
}, {
  timestamps: false,
  versionKey: false
});

module.exports = mongoose.model('Todo', TodoSchema);
