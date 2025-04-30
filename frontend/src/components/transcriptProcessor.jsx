// components/TranscriptProcessor.jsx
'use client';

import { useState, useRef } from 'react';
import { processTranscript, generateSummary, saveTranscriptAndSummary } from '@/lib/transcriptProcessor';

export default function TranscriptProcessor() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [apiKey, setApiKey] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const processedTranscript = processTranscript(text);
      setTranscript(processedTranscript);
    } catch (err) {
      setError(`Error processing transcript: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = (e) => {
    try {
      const processedTranscript = processTranscript(e.target.value);
      setTranscript(processedTranscript);
    } catch (err) {
      setError(`Error processing transcript: ${err.message}`);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) {
      setError('Please upload or enter a transcript first');
      return;
    }

    if (!apiKey) {
      setError('Please enter your Google Generative AI API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const options = { summaryLength };
      const summaryResult = await generateSummary(transcript, apiKey, options);
      setSummary(summaryResult);
    } catch (err) {
      setError(`Error generating summary: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!transcript || !summary) {
      setError('Please generate a summary first');
      return;
    }

    if (!meetingTitle) {
      setError('Please enter a meeting title');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get authentication token from your app's state management
      const token = localStorage.getItem('authToken'); // Example, use your actual auth method
      
      const meetingData = {
        title: meetingTitle,
        meetId: `meet-${Date.now()}`, // Generate a unique ID
        startTime: new Date().toISOString(),
        transcript: {
          raw: transcript.fullText,
          segments: transcript.segments
        },
        summary: {
          text: summary.summary,
          keyPoints: summary.keyPoints,
          actionItems: summary.actionItems.map(item => ({ description: item })),
          decisions: summary.decisions,
          summaryType: summaryLength
        }
      };

      const result = await saveTranscriptAndSummary(
        meetingData, 
        '/api/meetings', // Your API endpoint
        token
      );

      alert('Meeting transcript and summary saved successfully!');
    } catch (err) {
      setError(`Error saving data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Google Meet Transcript Processor</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Google Generative AI API Key</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
        />
        <p className="text-xs text-gray-500 mt-1">
          Your API key is used locally and not stored on our servers
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Meeting Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Enter meeting title"
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload Transcript</h2>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <div className="flex items-center">
            <label className="mr-2">Summary Length:</label>
            <select
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              className="border rounded p-2"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>
        
        <textarea
          className="w-full p-3 border rounded h-64 font-mono"
          placeholder="Or paste your transcript here..."
          onChange={handleTextInput}
        ></textarea>
      </div>
      
      {transcript && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Transcript Details:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Speakers: {transcript.speakers.join(', ')}</li>
            <li>Segments: {transcript.segments.length}</li>
            <li>Text Length: {transcript.fullText.length} characters</li>
          </ul>
        </div>
      )}
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleGenerateSummary}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          disabled={isLoading || !transcript}
        >
          {isLoading ? 'Processing...' : 'Generate Summary'}
        </button>
        
        {summary && (
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            disabled={isLoading}
          >
            Save Meeting
          </button>
        )}
      </div>
      
      {summary && (
        <div className="border rounded p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Meeting Summary</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Summary:</h3>
            <div className="whitespace-pre-line text-gray-700">
              {summary.summary}
            </div>
          </div>
          
          {summary.keyPoints.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Points:</h3>
              <ul className="list-disc pl-5">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="mb-1">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.actionItems.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Action Items:</h3>
              <ul className="list-disc pl-5">
                {summary.actionItems.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.decisions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Decisions:</h3>
              <ul className="list-disc pl-5">
                {summary.decisions.map((decision, i) => (
                  <li key={i} className="mb-1">{decision}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}