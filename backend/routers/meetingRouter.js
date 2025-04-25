// routes/meetingRouter.js
const express = require('express');
const router = express.Router();
const Meeting = require('../models/meetingModel');
const Summary = require('../models/summaryModel');
const User = require('../models/userModel');
const axios = require('axios');
const auth = require('../middleware/auth'); // Authentication middleware

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Get all meetings (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const meetings = await Meeting.find({ organizer: req.user.id })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .select('-transcript.raw'); // Exclude large transcript data
    
    const total = await Meeting.countDocuments({ organizer: req.user.id });
    
    res.json({
      meetings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get a specific meeting by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user has permission to access this meeting
    if (meeting.organizer.toString() !== req.user.id && 
        !meeting.participants.some(p => p.email === req.user.email)) {
      return res.status(403).json({ error: 'Not authorized to access this meeting' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting details' });
  }
});

// Create a new meeting
router.post('/', auth, async (req, res) => {
  try {
    const { title, meetId, startTime, participants } = req.body;
    
    // Validate required fields
    if (!title || !meetId || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newMeeting = new Meeting({
      title,
      meetId,
      organizer: req.user.id,
      startTime: new Date(startTime),
      participants: participants || [],
      transcript: {
        raw: '',
        segments: []
      }
    });
    
    const savedMeeting = await newMeeting.save();
    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Update meeting details
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, endTime, participants, tags } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user has permission to update this meeting
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this meeting' });
    }
    
    // Update fields if provided
    if (title) meeting.title = title;
    if (endTime) meeting.endTime = new Date(endTime);
    if (participants) meeting.participants = participants;
    if (tags) meeting.tags = tags;
    
    // If meeting has ended, update status
    if (endTime && !meeting.endTime) {
      meeting.status = 'completed';
    }
    
    const updatedMeeting = await meeting.save();
    res.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user has permission to delete this meeting
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this meeting' });
    }
    
    // Delete meeting and its associated summaries
    await Summary.deleteMany({ meetingId: meeting._id });
    await meeting.remove();
    
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// Upload transcript for a meeting
router.post('/:id/transcript', auth, async (req, res) => {
  try {
    const { transcript, segments } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user has permission to update this meeting
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this meeting' });
    }
    
    // Update transcript
    meeting.transcript.raw = transcript;
    
    // If transcript segments are provided, add them
    if (segments && Array.isArray(segments)) {
      meeting.transcript.segments = segments;
    }
    
    const updatedMeeting = await meeting.save();
    res.json({
      message: 'Transcript uploaded successfully',
      meetingId: updatedMeeting._id
    });
  } catch (error) {
    console.error('Error uploading transcript:', error);
    res.status(500).json({ error: 'Failed to upload transcript' });
  }
});

// Generate summary for a meeting
router.post('/:id/summarize', auth, async (req, res) => {
  try {
    const { summaryLength = 'medium' } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if there's a transcript to summarize
    if (!meeting.transcript.raw || meeting.transcript.raw.trim().length === 0) {
      return res.status(400).json({ error: 'No transcript available to summarize' });
    }
    
    // Generate summary using Gemini API
    const summary = await generateSummary(meeting.transcript.raw, summaryLength);
    
    // Extract key points, action items, and decisions
    const keyPoints = extractKeyPoints(summary);
    const actionItems = extractActionItems(summary);
    const decisions = extractDecisions(summary);
    
    // Create new summary document
    const newSummary = new Summary({
      meetingId: meeting._id,
      content: summary,
      keyPoints,
      decisions,
      actionItems: actionItems.map(item => ({ description: item })),
      summaryType: summaryLength,
      createdBy: req.user.id
    });
    
    const savedSummary = await newSummary.save();
    
    // Update meeting with summary information
    meeting.summary = {
      text: summary,
      keyPoints,
      decisions,
      actionItems: actionItems.map(item => ({ description: item })),
      generatedAt: new Date(),
      summaryType: summaryLength
    };
    
    await meeting.save();
    
    res.json({
      summary: savedSummary,
      message: 'Summary generated successfully'
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Get all summaries for a meeting
router.get('/:id/summaries', auth, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const summaries = await Summary.find({ meetingId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// Function to generate summary using Gemini API
async function generateSummary(transcript, summaryLength) {
  // Determine the prompt based on summaryLength
  let prompt = "";
  switch(summaryLength) {
    case "short":
      prompt = "Please provide a concise summary (3-5 bullet points) of the key points from this meeting transcript:";
      break;
    case "medium":
      prompt = "Please summarize this meeting transcript, including key points, decisions made, and action items:";
      break;
    case "long":
      prompt = "Please provide a detailed summary of this meeting transcript, including context, key points, decisions made, action items, and any follow-up tasks:";
      break;
    default:
      prompt = "Please summarize this meeting transcript:";
  }

  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${prompt}\n\n${transcript}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };
  
  const response = await axios.post(
    `${apiUrl}?key=${GEMINI_API_KEY}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}

// Helper function to extract key points from summary
function extractKeyPoints(summary) {
  // Simple extraction based on bullet points and numbered lists
  const keyPointsRegex = /(?:^|\n)[-*•]?\s*(.+?)(?=\n|$)/g;
  const matches = [...summary.matchAll(keyPointsRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1].trim()).filter(point => point.length > 10);
  }
  
  // If no bullet points found, split by sentences and take the first few
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, Math.min(5, sentences.length));
}

// Helper function to extract action items from summary
function extractActionItems(summary) {
  // Look for phrases like "Action item:", "Action:", "Todo:", etc.
  const actionItemsRegex = /(?:action items?|actions?|todo|task|follow-up|followup)[:\-]?\s*([^.!?\n]+[.!?]?)/gi;
  const matches = [...summary.matchAll(actionItemsRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1].trim());
  }
  
  return [];
}

// Helper function to extract decisions from summary
function extractDecisions(summary) {
  // Look for phrases like "Decision:", "Decided:", "The team agreed:", etc.
  const decisionsRegex = /(?:decisions?|decided|agreed|conclusion)[:\-]?\s*([^.!?\n]+[.!?]?)/gi;
  const matches = [...summary.matchAll(decisionsRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1].trim());
  }
  
  return [];
}

module.exports = router;