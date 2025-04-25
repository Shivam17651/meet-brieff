// routers/transcriptRouter.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Meeting = require('../models/meetingModel');
const Summary = require('../models/summaryModel');
const transcriptService = require('../services/transcriptService');

// Process a transcript without saving to a meeting (standalone service)
router.post('/process', async (req, res) => {
    try {
        const { transcript, summaryLength = 'medium' } = req.body;
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'No transcript provided' });
        }
        
        const startTime = Date.now();
        
        // Generate summary
        const summaryResult = await transcriptService.generateSummary(transcript, summaryLength);
        const summary = summaryResult.content;
        
        // Extract key points, action items, and decisions
        const keyPoints = transcriptService.extractKeyPoints(summary);
        const actionItems = transcriptService.extractActionItems(summary);
        const decisions = transcriptService.extractDecisions(summary);
        
        const processingTime = Date.now() - startTime;
        
        return res.json({
            success: true,
            summary,
            keyPoints,
            actionItems,
            decisions,
            metadata: {
                timestamp: new Date(),
                characterCount: summary.length,
                processingTime,
                summaryType: summaryLength
            }
        });
    } catch (error) {
        console.error('Error processing transcript:', error);
        return res.status(500).json({
            error: 'Failed to process transcript',
            details: error.message
        });
    }
});

// Process a transcript and associate it with an existing meeting
router.post('/meeting/:meetingId', auth, async (req, res) => {
    try {
        const { transcript, summaryLength = 'medium' } = req.body;
        const { meetingId } = req.params;
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'No transcript provided' });
        }
        
        // Find the meeting
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        // Check if user has permission to update this meeting
        if (meeting.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this meeting' });
        }
        
        // Update transcript in meeting
        meeting.transcript.raw = transcript;
        
        // Generate summary
        const summaryResult = await transcriptService.generateSummary(transcript, summaryLength);
        const summary = summaryResult.content;
        
        // Extract key points, action items, and decisions
        const keyPoints = transcriptService.extractKeyPoints(summary);
        const actionItems = transcriptService.extractActionItems(summary);
        const decisions = transcriptService.extractDecisions(summary);
        
        // Update meeting with summary information
        meeting.summary = {
            text: summary,
            keyPoints,
            actionItems,
            decisions,
            generatedAt: new Date(),
            summaryType: summaryLength
        };
        
        // Save the updated meeting
        await meeting.save();
        
        // Create a new summary record
        const newSummary = new Summary({
            meetingId: meeting._id,
            content: summary,
            keyPoints,
            decisions,
            actionItems,
            summaryType: summaryLength,
            aiMetadata: summaryResult.aiMetadata,
            createdBy: req.user._id
        });
        
        await newSummary.save();
        
        return res.json({
            success: true,
            meetingId: meeting._id,
            summary: newSummary,
            meeting: {
                title: meeting.title,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                participants: meeting.participants
            }
        });
    } catch (error) {
        console.error('Error processing meeting transcript:', error);
        return res.status(500).json({
            error: 'Failed to process meeting transcript',
            details: error.message
        });
    }
});

module.exports = router;