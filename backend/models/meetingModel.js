const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
  speakerId: {type: Schema.Types.ObjectId,ref: 'user'},
  text: {type: String,required: true},
  timestamp: {type: Date,default: Date.now}
});

// Schema for action items identified in the meeting
const actionItemSchema = new Schema({
  description: {type: String,required: true},
  assignedTo: [{type: Schema.Types.ObjectId,ref: 'user'}],
  dueDate: {type: Date},
  status: {type: String,enum: ['pending', 'in-progress', 'completed', 'cancelled'],default: 'pending'},
  priority: {type: String,enum: ['low', 'medium', 'high', 'urgent'],default: 'medium'}
});

// Main schema for meeting data
const meetingSchema = new Schema({
  title: {type: String,required: true,trim: true},
  date: {meetId: {type: String,required: true,index: true,unique: true}},
  organizer: {type: Schema.Types.ObjectId,ref: 'user'},
  startTime: {type: Date,default: Date.now},
  participants: [{type: String,trim: true}],
  rawCaptions: [{speaker: String,text: String,timestamp: Date}],
  summary: {type: String,trim: true},
  notes: {type: String,trim: true},
  tags: [{type: String,trim: true}]
})

module.exports = model('Meeting', MeetingSchema);