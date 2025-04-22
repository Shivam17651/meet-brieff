// Meet Brief Extension - Content Script
// This script runs on Google Meet pages

let extensionEnabled = false;
let meetingStarted = false;
let transcriptData = [];
let meetingParticipants = [];
let meetingSummary = null;
let currentSettings = {
  summarizeLevel: 'brief',
  autoSummarize: true,
  saveHistory: true
};

// Initialize content script
function initialize() {
  console.log('Meet Brief: Content script initialized');
  loadSettings();
  setupObservers();
  checkMeetingStatus();
  
  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'stateChanged') {
      extensionEnabled = message.enabled;
      console.log('Meet Brief: Extension state changed to', extensionEnabled);
      updateContentUI();
      
      if (extensionEnabled && meetingStarted) {
        startCapturingMeeting();
      } else if (!extensionEnabled && meetingStarted) {
        stopCapturingMeeting();
      }
      
      sendResponse({status: 'success'});
    } else if (message.action === 'getTranscript') {
      sendResponse({transcript: transcriptData});
    } else if (message.action === 'getSummary') {
      if (meetingSummary) {
        sendResponse({summary: meetingSummary});
      } else {
        generateSummary().then(summary => {
          sendResponse({summary: summary});
        });
        return true; // Keep the channel open for async response
      }
    }
  });
}

// Load extension settings from storage
function loadSettings() {
  chrome.storage.sync.get(['enabled', 'settings'], function(data) {
    extensionEnabled = data.enabled !== undefined ? data.enabled : false;
    
    if (data.settings) {
      currentSettings = {
        summarizeLevel: data.settings.summarizeLevel || 'brief',
        autoSummarize: data.settings.autoSummarize !== undefined ? 
                       data.settings.autoSummarize : true,
        saveHistory: data.settings.saveHistory !== undefined ? 
                     data.settings.saveHistory : true
      };
    }
    
    console.log('Meet Brief: Settings loaded', {extensionEnabled, currentSettings});
    updateContentUI();
  });
}

// Setup mutation observers to detect meeting UI changes
function setupObservers() {
  // Main observer for the Google Meet interface
  const bodyObserver = new MutationObserver(mutations => {
    checkMeetingStatus();
  });
  
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Check if a meeting is in progress
function checkMeetingStatus() {
  // Look for indicators that a meeting is active
  const meetingControls = document.querySelector('[data-meeting-title]') || 
                         document.querySelector('.VfPpkd-kBDsod') || 
                         document.querySelector('[data-meeting-code]');
  
  const newMeetingStarted = !!meetingControls;
  
  // If meeting status changed
  if (newMeetingStarted !== meetingStarted) {
    meetingStarted = newMeetingStarted;
    
    if (meetingStarted) {
      console.log('Meet Brief: Meeting detected');
      
      if (extensionEnabled) {
        startCapturingMeeting();
      }
    } else {
      console.log('Meet Brief: Meeting ended');
      stopCapturingMeeting();
      
      if (extensionEnabled && currentSettings.autoSummarize) {
        generateSummary().then(summary => {
          showSummaryUI(summary);
        });
      }
    }
  }
}

// Start capturing meeting data
function startCapturingMeeting() {
  if (!extensionEnabled || !meetingStarted) return;
  
  console.log('Meet Brief: Started capturing meeting');
  
  // Reset data
  transcriptData = [];
  meetingParticipants = [];
  meetingSummary = null;
  
  // Create and inject the Meet Brief UI if not already present
  if (!document.getElementById('meet-brief-container')) {
    createMeetBriefUI();
  }
  
  // Start capturing captions if they're available
  setupCaptionObserver();
  
  // Track participants
  trackParticipants();
}

// Stop capturing meeting data
function stopCapturingMeeting() {
  console.log('Meet Brief: Stopped capturing meeting');
  
  // Stop any active observers
  if (window.captionObserver) {
    window.captionObserver.disconnect();
    window.captionObserver = null;
  }
  
  // Save transcript data if setting is enabled
  if (currentSettings.saveHistory && transcriptData.length > 0) {
    saveMeetingData();
  }
}

// Setup observer for capturing closed captions
function setupCaptionObserver() {
  // Find the captions container - element selectors may need to be updated
  // if Google Meet changes their UI
  const captionsContainer = document.querySelector('.a4cQT') || 
                           document.querySelector('[data-live-caption]');
  
  if (!captionsContainer) {
    console.log('Meet Brief: No captions container found');
    // Try again in a moment as the UI might still be loading
    setTimeout(setupCaptionObserver, 2000);
    return;
  }
  
  // Create observer to watch for caption changes
  window.captionObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        // Process new caption text
        for (const node of mutation.addedNodes) {
          if (node.textContent && node.textContent.trim()) {
            processCaption(node);
          }
        }
      }
    });
  });
  
  window.captionObserver.observe(captionsContainer, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Process a new caption
function processCaption(captionNode) {
  // Extract the speaker name and text
  let speakerName = 'Unknown';
  let captionText = captionNode.textContent.trim();
  
  // Try to find the speaker name - format may vary based on Meet UI
  const speakerElement = captionNode.querySelector('.zs7s8d') || 
                        captionNode.previousElementSibling;
  
  if (speakerElement && speakerElement.textContent) {
    speakerName = speakerElement.textContent.trim();
  }
  
  // Add to transcript data
  transcriptData.push({
    timestamp: new Date().toISOString(),
    speaker: speakerName,
    text: captionText
  });
  
  // Update the live Brief panel if it exists
  updateLiveBrief();
}

// Track meeting participants
function trackParticipants() {
  // Find participants list - element selectors may need to be updated
  // if Google Meet changes their UI
  const participantsList = document.querySelector('[aria-label="Participants"]') || 
                          document.querySelector('.NzPR9b');
  
  if (!participantsList) {
    // Try again in a moment
    setTimeout(trackParticipants, 3000);
    return;
  }
  
  const participantElements = participantsList.querySelectorAll('[data-participant-id]');
  
  // Extract participant names
  meetingParticipants = Array.from(participantElements).map(el => {
    const nameElement = el.querySelector('.ZjFb7c') || el;
    return nameElement.textContent.trim();
  });
}

// Create the Meet Brief UI
function createMeetBriefUI() {
  const container = document.createElement('div');
  container.id = 'meet-brief-container';
  container.className = 'meet-brief-container';
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'meet-brief-toggle';
  toggleButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
      <path d="M7 12H17V14H7V12Z" fill="currentColor"/>
      <path d="M7 7H17V9H7V7Z" fill="currentColor"/>
      <path d="M7 17H14V15H7V17Z" fill="currentColor"/>
    </svg>
    <span>Meet Brief</span>
  `;
  
  toggleButton.addEventListener('click', toggleBriefPanel);
  
  // Create panel container (initially hidden)
  const panel = document.createElement('div');
  panel.className = 'meet-brief-panel';
  panel.style.display = 'none';
  panel.innerHTML = `
    <div class="meet-brief-header">
      <h3>Meet Brief</h3>
      <button class="meet-brief-close">×</button>
    </div>
    <div class="meet-brief-content">
      <div class="meet-brief-live-panel">
        <p>Capturing meeting in progress...</p>
        <div class="meet-brief-live-transcript"></div>
      </div>
    </div>
  `;
  
  // Add close button functionality
  panel.querySelector('.meet-brief-close').addEventListener('click', () => {
    panel.style.display = 'none';
  });
  
  // Add to container and inject into the page
  container.appendChild(toggleButton);
  container.appendChild(panel);
  document.body.appendChild(container);
}

// Toggle the brief panel visibility
function toggleBriefPanel() {
  const panel = document.querySelector('.meet-brief-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}

// Update the live brief panel with current transcript
function updateLiveBrief() {
  const liveTranscript = document.querySelector('.meet-brief-live-transcript');
  if (!liveTranscript) return;
  
  // Only show the last 10 entries to keep it manageable
  const recentEntries = transcriptData.slice(-10);
  
  liveTranscript.innerHTML = recentEntries.map(entry => `
    <div class="transcript-entry">
      <strong>${entry.speaker}:</strong> ${entry.text}
    </div>
  `).join('');
  
  // Scroll to bottom
  liveTranscript.scrollTop = liveTranscript.scrollHeight;
}

// Generate a summary of the meeting
async function generateSummary() {
  if (transcriptData.length === 0) {
    return "No transcript data available to summarize.";
  }
  
  // In a real extension, you might send this data to a server for processing
  // or use a local summarization algorithm
  
  // For this demo, we'll create a simple summary based on the transcript
  const speakers = new Set();
  let wordCount = 0;
  
  transcriptData.forEach(entry => {
    speakers.add(entry.speaker);
    wordCount += entry.text.split(/\s+/).length;
  });
  
  const meetingTitle = document.querySelector('[data-meeting-title]')?.textContent || 'Google Meet';
  const meetingDate = new Date().toLocaleDateString();
  
  // Create a basic summary
  const summary = {
    title: meetingTitle,
    date: meetingDate,
    duration: `${Math.floor(transcriptData.length / 6)} minutes (estimated)`,
    participants: Array.from(speakers),
    totalParticipants: meetingParticipants.length,
    transcriptWordCount: wordCount,
    keyPoints: [
      "This is a simplified demo summary.",
      "In a real extension, you would implement NLP techniques to extract key points.",
      "The summary detail would vary based on the user's selected summary level."
    ]
  };
  
  // Save summary for later use
  meetingSummary = summary;
  
  return summary;
}

// Save meeting data to chrome storage
function saveMeetingData() {
  if (!currentSettings.saveHistory || transcriptData.length === 0) return;
  
  const meetingTitle = document.querySelector('[data-meeting-title]')?.textContent || 'Google Meet';
  const meetingDate = new Date().toISOString();
  const meetingId = `meeting-${Date.now()}`;
  
  const meetingData = {
    id: meetingId,
    title: meetingTitle,
    date: meetingDate,
    transcript: transcriptData,
    participants: meetingParticipants
  };
  
  // Get existing meetings or create empty array
  chrome.storage.local.get(['meetings'], function(data) {
    const meetings = data.meetings || [];
    meetings.push(meetingData);
    
    // Save updated meetings array
    chrome.storage.local.set({meetings: meetings}, function() {
      console.log('Meet Brief: Meeting data saved', meetingId);
    });
  });
}

// Show summary UI after meeting ends
function showSummaryUI(summary) {
  // Create a modal to display the summary
  const modal = document.createElement('div');
  modal.className = 'meet-brief-summary-modal';
  
  // Format summary content
  let summaryContent = `
    <h2>${summary.title}</h2>
    <p><strong>Date:</strong> ${summary.date}</p>
    <p><strong>Duration:</strong> ${summary.duration}</p>
    <p><strong>Participants:</strong> ${summary.participants.join(', ')} (${summary.totalParticipants} total)</p>
    
    <h3>Key Points</h3>
    <ul>
      ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
    </ul>
  `;
  
  // Add options based on settings
  modal.innerHTML = `
    <div class="meet-brief-summary-content">
      <div class="meet-brief-summary-header">
        <h1>Meet Brief Summary</h1>
        <button class="meet-brief-summary-close">×</button>
      </div>
      <div class="meet-brief-summary-body">
        ${summaryContent}
      </div>
      <div class="meet-brief-summary-footer">
        <button class="meet-brief-copy-btn">Copy Summary</button>
        <button class="meet-brief-download-btn">Download Transcript</button>
      </div>
    </div>
  `;
  
  // Add event listeners
  modal.querySelector('.meet-brief-summary-close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('.meet-brief-copy-btn').addEventListener('click', () => {
    // Create a text version of the summary
    const textSummary = `
      ${summary.title}
      Date: ${summary.date}
      Duration: ${summary.duration}
      Participants: ${summary.participants.join(', ')} (${summary.totalParticipants} total)
      
      Key Points:
      ${summary.keyPoints.map(point => `- ${point}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(textSummary.trim())
      .then(() => {
        const copyBtn = modal.querySelector('.meet-brief-copy-btn');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Summary';
        }, 2000);
      });
  });
  
  modal.querySelector('.meet-brief-download-btn').addEventListener('click', () => {
    // Create a text version of the transcript
    let transcriptText = `# ${summary.title}\nDate: ${summary.date}\n\n## Transcript:\n\n`;
    
    transcriptData.forEach(entry => {
      transcriptText += `${entry.speaker}: ${entry.text}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([transcriptText], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  // Add to document
  document.body.appendChild(modal);
}

// Update content UI based on extension state
function updateContentUI() {
  const container = document.getElementById('meet-brief-container');
  
  if (container) {
    if (extensionEnabled) {
      container.classList.add('enabled');
      container.classList.remove('disabled');
    } else {
      container.classList.add('disabled');
      container.classList.remove('enabled');
    }
  }
}

// Initialize when the document is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}