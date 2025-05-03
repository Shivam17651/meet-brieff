// models/summaryModel.js
const { Schema, model } = require("../connection");

const summarySchema = new Schema({
  meetingId: {
    type: Schema.Types.ObjectId,
    ref: 'meetings',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String
  }],
  decisions: [{
    type: String
  }],
  actionItems: [{
    description: String,
    assignedTo: String,
    dueDate: Date
  }],
  summaryType: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium'
  },
  aiMetadata: {
    modelUsed: {
      type: String,
      default: 'gemini-pro'
    },
    processingTime: Number, // Time taken to process transcript in ms
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
});

module.exports = model('summaries', summarySchema);