// Meet Brief Extension - Background Script

// Initialize extension state when installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enabled: false,
      settings: {
        summarizeLevel: 'brief',
        autoSummarize: true,
        saveHistory: true
      }
    }, function() {
      console.log('Meet Brief: Default settings initialized');
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'welcome.html'
    });
  } else if (details.reason === 'update') {
    // Handle update logic if needed
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Meet Brief: Updated to version ${currentVersion}`);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'setBadgeText') {
    chrome.action.setBadgeText({
      text: message.text || '',
      tabId: sender.tab?.id
    });
    
    if (message.color) {
      chrome.action.setBadgeBackgroundColor({
        color: message.color,
        tabId: sender.tab?.id
      });
    }
    
    sendResponse({success: true});
  } else if (message.action === 'getMeetings') {
    // Get saved meetings from storage
    chrome.storage.local.get(['meetings'], function(data) {
      sendResponse({meetings: data.meetings || []});
    });
    return true; // Keep the channel open for async response
  } else if (message.action === 'deleteMeeting') {
    // Delete a meeting from storage
    chrome.storage.local.get(['meetings'], function(data) {
      const meetings = data.meetings || [];
      const updatedMeetings = meetings.filter(meeting => meeting.id !== message.meetingId);
      
      chrome.storage.local.set({meetings: updatedMeetings}, function() {
        sendResponse({success: true});
      });
    });
    return true; // Keep the channel open for async response
  }
});

// Listen for tab updates to check if we're on a Google Meet page
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('meet.google.com')) {
    // Check if extension is enabled
    chrome.storage.sync.get(['enabled'], function(data) {
      const enabled = data.enabled !== undefined ? data.enabled : false;
      
      // Update badge for active Google Meet tab
      if (enabled) {
        chrome.action.setBadgeText({
          text: 'ON',
          tabId: tabId
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#34a853',
          tabId: tabId
        });
      } else {
        chrome.action.setBadgeText({
          text: 'OFF',
          tabId: tabId
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#ea4335',
          tabId: tabId
        });
      }
    });
  }
});

// Listen for commands (keyboard shortcuts)
chrome.commands.onCommand.addListener(function(command) {
  if (command === 'toggle_extension') {
    // Toggle extension state
    chrome.storage.sync.get(['enabled'], function(data) {
      const newState = !(data.enabled !== undefined ? data.enabled : false);
      
      chrome.storage.sync.set({enabled: newState}, function() {
        console.log('Meet Brief: Extension toggled to', newState);
        
        // Notify all active Google Meet tabs
        chrome.tabs.query({url: '*://meet.google.com/*'}, function(tabs) {
          tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'stateChanged',
              enabled: newState
            });
            
            // Update badge
            chrome.action.setBadgeText({
              text: newState ? 'ON' : 'OFF',
              tabId: tab.id
            });
            
            chrome.action.setBadgeBackgroundColor({
              color: newState ? '#34a853' : '#ea4335',
              tabId: tab.id
            });
          });
        });
      });
    });
  }
});