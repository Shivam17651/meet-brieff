require('dotenv').config();


const gemini_api_key = process.env.GEMINI_API_KEY

// API endpoint to receive transcript and return summary
app.post('/api/summarize', async (req, res) => {
    try {
      const { transcript, summaryLength = 'medium' } = req.body;
  
      if (!transcript || transcript.trim().length === 0) {
        return res.status(400).json({ error: 'No transcript provided' });
      }
  
      if (!gemini_api_key) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }
  
      // Generate the summary
      const summary = await generateSummary(transcript, summaryLength);
      
      // Return the summary
      return res.json({ 
        success: true, 
        summary,
        timestamp: new Date(),
        characterCount: summary.length
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      return res.status(500).json({ 
        error: 'Failed to generate summary', 
        details: error.message 
      });
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
      `${apiUrl}?key=${gemini_api_key}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  }
  
  // Optional endpoint to save summaries to a database
  app.post('/api/save-summary', async (req, res) => {
    // This would connect to your database to save the summary
    // Implementation depends on your database choice
    try {
      const { meetingId, summary, transcript, metadata } = req.body;
      
      // Example database save operation (commented out)
      // await db.collection('meeting_summaries').insertOne({
      //   meetingId,
      //   summary,
      //   transcript,
      //   metadata,
      //   createdAt: new Date()
      // });
      
      return res.json({ success: true, message: 'Summary saved successfully' });
    } catch (error) {
      console.error('Error saving summary:', error);
      return res.status(500).json({ error: 'Failed to save summary' });
    }
  });