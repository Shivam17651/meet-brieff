// services/transcriptService.js
const axios = require('axios');

// Function to generate summary using Gemini API
async function generateSummary(transcript, summaryLength = 'medium') {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }
    
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

    const startTime = Date.now();
    
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
    
    try {
        const response = await axios.post(
            `${apiUrl}?key=${GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const processingTime = Date.now() - startTime;
        
        return {
            content: response.data.candidates[0].content.parts[0].text,
            processingTime,
            aiMetadata: {
                modelUsed: 'gemini-pro',
                processingTime
            }
        };
    } catch (error) {
        console.error('Error calling Gemini API:', error.response?.data || error.message);
        throw new Error('Failed to generate summary from AI service');
    }
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
        return matches.map(match => match[1].trim()).map(description => ({ description }));
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

module.exports = {
    generateSummary,
    extractKeyPoints,
    extractActionItems,
    extractDecisions
};