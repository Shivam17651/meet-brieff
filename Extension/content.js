// content.js - Optimized version
let captionData = [];
let isRecording = false;
let lastProcessedText = '';
let captionObserver = null;
let capturedCaptions = [];
let sidebarInjected = false;
let backendUrl = 'http://localhost:3000';
let authToken = null;
let userData = null;
let isLoggedIn = false;
let captionProcessTimer = null;

// Initialize extension when content script loads
function initializeExtension() {
  if (window.location.hostname !== 'meet.google.com') return;
  
  chrome.storage.sync.get(['backendUrl', 'authToken', 'userData', 'isLoggedIn'], (result) => {
    backendUrl = result.backendUrl || backendUrl;
    authToken = result.authToken || null;
    userData = result.userData || null;
    isLoggedIn = result.isLoggedIn || false;
    
    injectSidebar();
    setTimeout(setupCaptionObserver, 2000);
  });
}

// Only initialize if we're on Google Meet
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeExtension();
} else {
  document.addEventListener('DOMContentLoaded', initializeExtension);
}

// Inject sidebar UI
function injectSidebar() {
  if (sidebarInjected) return;
  
  try {
    // Add CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = chrome.runtime.getURL('sidebar.css');
    document.head.appendChild(cssLink);
    
    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'caption-saver-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '300px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.boxShadow = '-2px 0 5px rgba(0,0,0,0.2)';
    sidebar.style.zIndex = '9999';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.transition = 'transform 0.3s ease-in-out';
    sidebar.style.transform = 'translateX(300px)';
    
    // Create sidebar HTML
    sidebar.innerHTML = `
      <div style="padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 16px;">Google Meet Caption Saver</h2>
        <div>
          <button id="sidebar-settings" style="background: none; border: none; cursor: pointer; margin-right: 5px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button id="sidebar-toggle" style="background: none; border: none; cursor: pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      <div style="padding: 15px; display: flex; flex-direction: column; height: 100%;">
        <div id="auth-status-container" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div id="auth-status">Not logged in</div>
          <div id="auth-buttons">
            <button id="login-button" style="padding: 5px 10px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 5px;">Login</button>
            <button id="signup-button" style="padding: 5px 10px; background-color: #34a853; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Sign Up</button>
          </div>
          <div id="profile-button" style="display: none;">
            <button id="view-profile" style="padding: 5px 10px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">My Profile</button>
          </div>
        </div>
        <button id="sidebar-record-button" style="padding: 8px 12px; margin-bottom: 10px; width: 100%; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Start Recording Captions
        </button>
        <button id="sidebar-export-button" style="padding: 8px 12px; margin-bottom: 10px; width: 100%; background-color: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Export Saved Captions
        </button>
        <button id="sidebar-summarize-button" style="padding: 8px 12px; margin-bottom: 10px; width: 100%; background-color: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Summarize with AI
        </button>
        <button id="sidebar-save-meeting-button" style="padding: 8px 12px; margin-bottom: 15px; width: 100%; background-color: #F9A825; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;">
          Save Meeting to Account
        </button>
        <div id="sidebar-status" style="margin-bottom: 10px;">Not recording</div>
        <div style="border-top: 1px solid #ddd; padding-top: 10px; flex: 1; display: flex; flex-direction: column;">
          <h3 style="font-size: 14px; margin-top: 0;">Live Captions</h3>
          <div id="sidebar-captions-list" style="flex: 1; overflow-y: auto;">
            <p class="no-captions">No captions yet. Start recording to capture captions.</p>
          </div>
        </div>
        <div id="summary-container" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; display: none;">
          <h3 style="font-size: 14px; margin-top: 0;">AI Summary</h3>
          <div id="summary-content" style="max-height: 200px; overflow-y: auto; padding: 8px; background-color: #f5f5f5; border-radius: 4px;">
            No summary available yet.
          </div>
        </div>
      </div>
    `;
    
    // Add settings modal
    const settingsModal = document.createElement('div');
    settingsModal.id = 'settings-modal';
    settingsModal.style.display = 'none';
    settingsModal.style.position = 'fixed';
    settingsModal.style.zIndex = '10000';
    settingsModal.style.left = '0';
    settingsModal.style.top = '0';
    settingsModal.style.width = '100%';
    settingsModal.style.height = '100%';
    settingsModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    settingsModal.innerHTML = `
      <div style="position: relative; background-color: white; margin: 15% auto; padding: 20px; width: 400px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <button id="close-settings" style="position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer;">×</button>
        <h3 style="margin-top: 0;">Settings</h3>
        <div style="margin-bottom: 15px;">
          <label for="backend-url" style="display: block; margin-bottom: 5px;">Backend Server URL:</label>
          <input id="backend-url" type="text" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${backendUrl}">
        </div>
        <button id="save-settings" style="padding: 8px 16px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">Save Settings</button>
      </div>
    `;
    
    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'caption-saver-toggle';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.zIndex = '9998';
    toggleButton.style.backgroundColor = '#1a73e8';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.width = '48px';
    toggleButton.style.height = '48px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toggleButton.innerHTML = `
      <svg width="36px" height="36px" viewBox="0 0 400.00 400.00" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(14,14), scale(0.93)"><rect x="0" y="0" width="400.00" height="400.00" rx="200" fill="#00ccaa" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="3.2"></g><g id="SVGRepo_iconCarrier"> <path d="M97.8357 54.6682C177.199 59.5311 213.038 52.9891 238.043 52.9891C261.298 52.9891 272.24 129.465 262.683 152.048C253.672 173.341 100.331 174.196 93.1919 165.763C84.9363 156.008 89.7095 115.275 89.7095 101.301" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M98.3318 190.694C-10.6597 291.485 121.25 273.498 148.233 295.083" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M98.3301 190.694C99.7917 213.702 101.164 265.697 100.263 272.898" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M208.308 136.239C208.308 131.959 208.308 127.678 208.308 123.396" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M177.299 137.271C177.035 133.883 177.3 126.121 177.3 123.396" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M203.398 241.72C352.097 239.921 374.881 226.73 312.524 341.851" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M285.55 345.448C196.81 341.85 136.851 374.229 178.223 264.504" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M180.018 345.448C160.77 331.385 139.302 320.213 120.658 304.675" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M218.395 190.156C219.024 205.562 219.594 220.898 219.594 236.324" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M218.395 190.156C225.896 202.037 232.97 209.77 241.777 230.327" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M80.1174 119.041C75.5996 120.222 71.0489 119.99 66.4414 120.41" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M59.5935 109.469C59.6539 117.756 59.5918 125.915 58.9102 134.086" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M277.741 115.622C281.155 115.268 284.589 114.823 287.997 114.255" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M291.412 104.682C292.382 110.109 292.095 115.612 292.095 121.093" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M225.768 116.466C203.362 113.993 181.657 115.175 160.124 118.568" stroke="#000000" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;
    
    // Download link element (hidden)
    const downloadLink = document.createElement('a');
    downloadLink.id = 'sidebar-download-link';
    downloadLink.style.display = 'none';
    
    // Add elements to document
    document.body.appendChild(sidebar);
    document.body.appendChild(settingsModal);
    document.body.appendChild(toggleButton);
    document.body.appendChild(downloadLink);
    
    // Set up event listeners
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('caption-saver-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-record-button').addEventListener('click', toggleRecording);
    document.getElementById('sidebar-export-button').addEventListener('click', exportCaptions);
    document.getElementById('sidebar-summarize-button').addEventListener('click', summarizeCaptions);
    document.getElementById('sidebar-settings').addEventListener('click', toggleSettings);
    document.getElementById('close-settings').addEventListener('click', toggleSettings);
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('login-button').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'openLoginPage' }));
    document.getElementById('signup-button').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'openSignupPage' }));
    document.getElementById('view-profile').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'openProfilePage' }));
    document.getElementById('sidebar-save-meeting-button').addEventListener('click', saveMeetingToAccount);
    
    updateAuthDisplay();
    loadSavedCaptions();
    sidebarInjected = true;
    
    // Show sidebar after injection
    setTimeout(toggleSidebar, 1000);
  } catch (error) {
    console.error('Error injecting sidebar:', error);
  }
}

// Auth display update
function updateAuthDisplay() {
  chrome.storage.sync.get(['authToken', 'userData', 'isLoggedIn'], (result) => {
    const authStatus = document.getElementById('auth-status');
    const authButtons = document.getElementById('auth-buttons');
    const profileButton = document.getElementById('profile-button');
    const saveMeetingButton = document.getElementById('sidebar-save-meeting-button');
    
    if (result.isLoggedIn && result.authToken && result.userData) {
      authToken = result.authToken;
      userData = result.userData;
      isLoggedIn = true;
      
      authStatus.textContent = `Logged in as: ${result.userData.username}`;
      authButtons.style.display = 'none';
      profileButton.style.display = 'block';
      
      const summaryContainer = document.getElementById('summary-container');
      if (summaryContainer && summaryContainer.style.display !== 'none') {
        saveMeetingButton.style.display = 'block';
      }
    } else {
      authStatus.textContent = 'Not logged in';
      authButtons.style.display = 'block';
      profileButton.style.display = 'none';
      saveMeetingButton.style.display = 'none';
    }
  });
}

// Toggle settings modal
function toggleSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    const isShowing = modal.style.display !== 'none';
    modal.style.display = isShowing ? 'none' : 'block';
    if (!isShowing) {
      document.getElementById('backend-url').value = backendUrl;
    }
  }
}

// Save settings
function saveSettings() {
  const urlInput = document.getElementById('backend-url');
  if (urlInput && urlInput.value.trim()) {
    backendUrl = urlInput.value.trim();
    chrome.storage.sync.set({ backendUrl });
    const statusElement = document.getElementById('sidebar-status');
    if (statusElement) {
      statusElement.textContent = "Settings saved";
      setTimeout(() => {
        statusElement.textContent = isRecording ? "Recording in progress..." : "Not recording";
      }, 2000);
    }
    toggleSettings();
  }
}

// Toggle sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById('caption-saver-sidebar');
  if (sidebar) {
    const isHidden = sidebar.style.transform === 'translateX(300px)';
    sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(300px)';
  }
}

// Toggle recording state
function toggleRecording() {
  const recordButton = document.getElementById('sidebar-record-button');
  const statusElement = document.getElementById('sidebar-status');
  const captionsList = document.getElementById('sidebar-captions-list');
  
  if (isRecording) {
    stopRecording();
    
    if (recordButton) {
      recordButton.textContent = "Start Recording Captions";
      recordButton.style.backgroundColor = "#4CAF50";
    }
    
    if (statusElement) {
      statusElement.textContent = "Not recording";
    }
  } else {
    if (captionsList) {
      captionsList.innerHTML = '<p class="no-captions">Starting new recording session...</p>';
    }
    
    startRecording();
    
    if (recordButton) {
      recordButton.textContent = "Stop Recording";
      recordButton.style.backgroundColor = "#f44336";
    }
    
    if (statusElement) {
      statusElement.textContent = "Recording in progress...";
    }
  }
}

// Export captions to JSON file
function exportCaptions() {
  if (captionData.length === 0) {
    alert('No captions to export. Please record some captions first.');
    return;
  }
  
  const jsonData = JSON.stringify(captionData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('sidebar-download-link');
  
  if (downloadLink) {
    downloadLink.href = url;
    downloadLink.download = `google-meet-captions-${new Date().toISOString().split('T')[0]}.json`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }
}

// Load saved captions from storage
function loadSavedCaptions() {
  chrome.storage.local.get(['captionData'], function(result) {
    if (result.captionData && Array.isArray(result.captionData)) {
      captionData = result.captionData;
      const captionsList = document.getElementById('sidebar-captions-list');
      
      if (captionsList) {
        captionsList.innerHTML = '';
        
        if (captionData.length > 0) {
          captionData.forEach(caption => addCaptionToSidebar(caption));
        } else {
          captionsList.innerHTML = '<p class="no-captions">No captions yet. Start recording to capture captions.</p>';
        }
      }
    }
  });
}

// Add caption to sidebar UI
function addCaptionToSidebar(caption) {
  if (!sidebarInjected) return;
  
  const captionsList = document.getElementById('sidebar-captions-list');
  if (!captionsList) return;
  
  try {
    // Remove "No captions" message if present
    const noCaption = captionsList.querySelector('.no-captions');
    if (noCaption) captionsList.removeChild(noCaption);
    
    // Generate unique ID
    const uniqueId = caption.id || `caption-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create caption element
    const captionElement = document.createElement('div');
    captionElement.id = uniqueId.startsWith('caption-') ? uniqueId : `caption-${uniqueId}`;
    captionElement.className = 'caption-entry';
    captionElement.style.marginBottom = '8px';
    captionElement.style.borderBottom = '1px solid #eee';
    captionElement.style.paddingBottom = '8px';
    
    // Format timestamp
    const time = new Date(caption.timestamp);
    
    // Build caption HTML
    captionElement.innerHTML = `
      <div class="caption-time" style="font-size: 11px; color: #5f6368; margin-bottom: 2px;">
        ${time.toLocaleTimeString()}
      </div>
      <div>
        <span class="caption-speaker" style="font-weight: bold; color: #1a73e8;">${caption.speaker}: </span>
        <span class="caption-text">${caption.text}</span>
      </div>
    `;
    
    // Add to list and scroll to bottom
    captionsList.appendChild(captionElement);
    captionsList.scrollTop = captionsList.scrollHeight;
    
    // Limit displayed captions to improve performance
    const maxDisplayedCaptions = 50;
    const entries = captionsList.querySelectorAll('.caption-entry');
    if (entries.length > maxDisplayedCaptions) {
      for (let i = 0; i < entries.length - maxDisplayedCaptions; i++) {
        captionsList.removeChild(entries[i]);
      }
    }
  } catch (error) {
    console.error('Error adding caption to sidebar:', error);
  }
}

// Start recording captions
function startRecording() {
  isRecording = true;
  captionData = [];
  capturedCaptions = [];
  
  // Clear previous captions from storage
  chrome.storage.local.get(null, function(items) {
    const keysToRemove = Object.keys(items).filter(key => key.startsWith('meet_captions_'));
    if (keysToRemove.length > 0) {
      chrome.storage.local.remove(keysToRemove);
      chrome.runtime.sendMessage({action: "captionsCleared"});
    }
  });
  
  setupCaptionObserver();
  chrome.runtime.sendMessage({action: "recordingStatus", status: true});
}

// Stop recording captions
function stopRecording() {
  isRecording = false;
  
  if (captionObserver) {
    captionObserver.disconnect();
    captionObserver = null;
  }
  
  saveCaptionData();
  chrome.runtime.sendMessage({action: "recordingStatus", status: false});
}

// Save caption data to storage
function saveCaptionData() {
  if (capturedCaptions.length > 0) {
    const timestamp = new Date().toISOString();
    const key = `meet_captions_${timestamp}`;
    
    chrome.storage.local.set({[key]: capturedCaptions, captionData}, function() {
      chrome.runtime.sendMessage({
        action: "captionsSaved", 
        timestamp,
        count: capturedCaptions.length
      });
    });
  }
}

// Extract speaker name from DOM element
function extractSpeakerName(captionElement) {
  // Try common speaker element selectors
  const speakerSelectors = [
    '.NWpY1d', '.zs7s8d', '.YTbUzc', '.KcIKyf.jxFHg',
    '.KcIKyf', 'span.NWpY1d', 'span.zs7s8d'
  ];
  
  // Try each selector
  for (const selector of speakerSelectors) {
    const speakerElement = captionElement.querySelector(selector);
    if (speakerElement) {
      // Check child elements first
      const possibleNameElements = speakerElement.querySelectorAll('span, div');
      for (const elem of possibleNameElements) {
        const speakerName = elem.textContent.trim();
        if (speakerName && speakerName !== ':' && !speakerName.endsWith(':')) {
          return speakerName.replace(/[:：]$/, '').trim();
        }
      }
      
      // Then try the element itself
      let speakerName = speakerElement.textContent.trim();
      speakerName = speakerName.replace(/[:：]$/, '').trim();
      if (speakerName) return speakerName;
    }
  }
  
  // Try parent element structure
  const parentElement = captionElement.parentElement;
  if (parentElement) {
    const speakerElems = parentElement.querySelectorAll('span.NWpY1d');
    for (const elem of speakerElems) {
      if (elem.textContent && elem.textContent.trim()) {
        return elem.textContent.trim().replace(/[:：]$/, '');
      }
    }
  }
  
  // Try to parse from text content
  const fullText = captionElement.textContent.trim();
  const colonMatch = fullText.match(/^([^:：]+)[：:]\s*(.+)$/);
  if (colonMatch) return colonMatch[1].trim();
  
  return "Unknown";
}

// Find caption container
function findCaptionContainer() {
    // Try different caption container selectors used by Google Meet
    const selectors = [
      '.a4cQT', '.VbkSUe', '.cnKdNb', '.TBMuR', 
      '[data-message-text]', '.iTTPOb', '.iOzk7'
    ];
    
    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) return container;
    }
    
    // Try alternative approach - look for elements that might contain captions
    const possibleContainers = document.querySelectorAll('div[role="log"]');
    if (possibleContainers.length > 0) return possibleContainers[0];
    
    return null;
  }
  
  // Process captions from DOM
  function processCaptions() {
    if (!isRecording) return;
    
    try {
      const captionContainer = findCaptionContainer();
      if (!captionContainer) return;
      
      // Process all caption elements
      const captionElements = captionContainer.querySelectorAll('div');
      if (!captionElements || captionElements.length === 0) return;
      
      captionElements.forEach(element => {
        // Skip processed elements or empty ones
        if (element.dataset.processed === 'true' || !element.textContent.trim()) return;
        
        // Extract caption text
        let captionText = element.textContent.trim();
        const speakerName = extractSpeakerName(element);
        
        // Clean up caption text (remove speaker name if it's included)
        if (speakerName !== "Unknown" && captionText.startsWith(speakerName)) {
          captionText = captionText.substring(speakerName.length).trim();
          captionText = captionText.replace(/^[:：]\s*/, '');
        }
        
        // Skip if empty after cleanup
        if (!captionText) return;
        
        // Skip if exact duplicate of last processed text
        if (captionText === lastProcessedText) return;
        lastProcessedText = captionText;
        
        // Create caption object
        const caption = {
          id: `caption-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          speaker: speakerName,
          text: captionText,
          timestamp: new Date().toISOString()
        };
        
        // Add to data arrays
        capturedCaptions.push(caption);
        captionData.push(caption);
        
        // Add to UI
        addCaptionToSidebar(caption);
        
        // Mark as processed
        element.dataset.processed = 'true';
      });
      
      // Save periodically
      if (capturedCaptions.length > 0 && capturedCaptions.length % 10 === 0) {
        saveCaptionData();
      }
    } catch (error) {
      console.error('Error processing captions:', error);
    }
  }
  
  // Set up caption observer
  function setupCaptionObserver() {
    if (captionObserver) {
      captionObserver.disconnect();
      captionObserver = null;
    }
    
    // First try to observe directly
    const captionContainer = findCaptionContainer();
    if (!captionContainer) {
      // If container not found, observe body for changes and retry later
      captionObserver = new MutationObserver(mutations => {
        const container = findCaptionContainer();
        if (container) {
          captionObserver.disconnect();
          setupCaptionObserver(); // Retry with the found container
        }
      });
      
      captionObserver.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      
      return;
    }
    
    // Set up observer for caption changes
    captionObserver = new MutationObserver(() => {
      if (captionProcessTimer) clearTimeout(captionProcessTimer);
      captionProcessTimer = setTimeout(processCaptions, 500);
    });
    
    captionObserver.observe(captionContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Initial processing
    processCaptions();
  }
  
  // AI Summary function
  function summarizeCaptions() {
    if (captionData.length === 0) {
      alert('No captions to summarize. Please record some captions first.');
      return;
    }
    
    const statusElement = document.getElementById('sidebar-status');
    const summaryContainer = document.getElementById('summary-container');
    const summaryContent = document.getElementById('summary-content');
    
    if (statusElement) statusElement.textContent = "Generating AI summary...";
    if (summaryContainer) summaryContainer.style.display = 'block';
    if (summaryContent) summaryContent.textContent = "Processing...";
    
    // Prepare data for summarization
    const captionText = captionData.map(c => `${c.speaker}: ${c.text}`).join('\n');
    
    // Call API for summarization
    fetch(`${backendUrl}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({ 
        text: captionText,
        meetingTitle: document.title || 'Google Meet'
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (summaryContent) {
        summaryContent.innerHTML = `
          <div style="margin-bottom: 10px;">
            <strong>Summary:</strong><br>
            ${data.summary.replace(/\n/g, '<br>')}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Key Points:</strong><br>
            <ul style="margin-top: 5px; padding-left: 20px;">
              ${data.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong>Action Items:</strong><br>
            <ul style="margin-top: 5px; padding-left: 20px;">
              ${data.actionItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
        
        // Show save meeting button if logged in
        if (isLoggedIn) {
          const saveMeetingButton = document.getElementById('sidebar-save-meeting-button');
          if (saveMeetingButton) saveMeetingButton.style.display = 'block';
        }
      }
      
      if (statusElement) statusElement.textContent = isRecording ? "Recording in progress..." : "Not recording";
    })
    .catch(error => {
      console.error('Error summarizing captions:', error);
      if (summaryContent) summaryContent.textContent = `Failed to generate summary: ${error.message}`;
      if (statusElement) statusElement.textContent = isRecording ? "Recording in progress..." : "Not recording";
    });
  }
  
  // Save meeting to user account
  function saveMeetingToAccount() {
    if (!isLoggedIn || !authToken) {
      alert('Please log in to save meetings to your account.');
      return;
    }
    
    if (captionData.length === 0) {
      alert('No captions to save. Please record some captions first.');
      return;
    }
    
    const statusElement = document.getElementById('sidebar-status');
    
    if (statusElement) statusElement.textContent = "Saving meeting to account...";
    
    const summaryContent = document.getElementById('summary-content');
    const summary = summaryContent ? summaryContent.textContent : '';
    
    // Prepare meeting data
    const meetingData = {
      title: document.title || 'Google Meet',
      date: new Date().toISOString(),
      captions: captionData,
      summary: summary
    };
    
    // Call API to save meeting
    fetch(`${backendUrl}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(meetingData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (statusElement) {
        statusElement.textContent = "Meeting saved successfully!";
        setTimeout(() => {
          statusElement.textContent = isRecording ? "Recording in progress..." : "Not recording";
        }, 3000);
      }
    })
    .catch(error => {
      console.error('Error saving meeting:', error);
      if (statusElement) {
        statusElement.textContent = `Failed to save meeting: ${error.message}`;
        setTimeout(() => {
          statusElement.textContent = isRecording ? "Recording in progress..." : "Not recording";
        }, 3000);
      }
    });
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'authStatusChanged') {
      updateAuthDisplay();
    }
  });
  
  // Handle page visibility changes to manage observer
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Save data when page becomes hidden
      if (isRecording && capturedCaptions.length > 0) {
        saveCaptionData();
      }
    } else {
      // Page is visible again, ensure observer is running if still recording
      if (isRecording && !captionObserver) {
        setupCaptionObserver();
      }
    }
  });
  
  // Export functions for testing
  window.captionSaver = {
    startRecording,
    stopRecording,
    toggleSidebar,
    exportCaptions,
    summarizeCaptions
  };