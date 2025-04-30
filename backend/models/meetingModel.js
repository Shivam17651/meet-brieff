// models/meetingModel.js
const { Schema, model } = require("../connection");

// Schema for individual meeting participants
const participantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['host', 'participant', 'guest'],
    default: 'participant'
  },
  joinTime: {
    type: Date
  },
  leaveTime: {
    type: Date
  },
  speakingTime: {
    type: Number,
    default: 0 // Total seconds spoken
  }
});

// Schema for transcript segments (individual captions)
const transcriptSegmentSchema = new Schema({
  speakerName: {
    type: String,
    required: true
  },
  speakerId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Schema for action items identified in the meeting
const actionItemSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
});

// Main schema for meeting data
const meetingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  meetId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // Duration in seconds
  },
  participants: [participantSchema],
  transcript: {
    raw: {
      type: String, // Full raw transcript text
      required: true
    },
    segments: [transcriptSegmentSchema]
  },
  summary: {
    text: {
      type: String
    },
    keyPoints: [{
      type: String
    }],
    actionItems: [actionItemSchema],
    decisions: [{
      type: String
    }],
    topics: [{
      name: String,
      duration: Number, // Time spent on this topic in seconds
      participants: [String] // Names of people who spoke on this topic
    }],
    generatedAt: {
      type: Date,
      default: Date.now
    },
    summaryType: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
meetingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate duration if startTime and endTime exist
  if (this.startTime && this.endTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  
  next();
});

module.exports = model('meetings', meetingSchema);