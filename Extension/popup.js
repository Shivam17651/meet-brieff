document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const extensionToggle = document.getElementById('extension-toggle');
    const statusText = document.getElementById('status-text');
    const settingsBtn = document.getElementById('settings-btn');
    const helpBtn = document.getElementById('help-btn');
    const feedbackBtn = document.getElementById('feedback-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close-modal');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // Settings form elements
    const summarizeLevel = document.getElementById('summarize-level');
    const autoSummarize = document.getElementById('auto-summarize');
    const saveHistory = document.getElementById('save-history');
    
    // Load saved extension state
    function loadExtensionState() {
      chrome.storage.sync.get(['enabled', 'settings'], function(data) {
        // Load extension enabled/disabled state
        if (data.enabled !== undefined) {
          extensionToggle.checked = data.enabled;
          updateStatusDisplay(data.enabled);
        } else {
          // Default to disabled if no state is saved
          extensionToggle.checked = false;
          updateStatusDisplay(false);
          saveExtensionState(false);
        }
        
        // Load settings if they exist
        if (data.settings) {
          summarizeLevel.value = data.settings.summarizeLevel || 'brief';
          autoSummarize.checked = data.settings.autoSummarize !== undefined ? 
                                 data.settings.autoSummarize : true;
          saveHistory.checked = data.settings.saveHistory !== undefined ? 
                               data.settings.saveHistory : true;
        }
      });
    }
    
    // Save extension state
    function saveExtensionState(enabled) {
      chrome.storage.sync.set({enabled: enabled}, function() {
        console.log('Extension state saved:', enabled);
        
        // Also update the extension icon based on state
        updateExtensionIcon(enabled);
        
        // Notify any active tabs about the state change
        notifyContentScripts(enabled);
      });
    }
    
    // Update extension icon
    function updateExtensionIcon(enabled) {
      const iconPath = enabled ? 
        {
          "16": "icons/icon16-active.png",
          "32": "icons/icon32-active.png",
          "48": "icons/icon48-active.png",
          "128": "icons/icon128-active.png"
        } : 
        {
          "16": "icons/icon16.png",
          "32": "icons/icon32.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        };
      
      chrome.action.setIcon({path: iconPath});
    }
    
    // Update status text display
    function updateStatusDisplay(enabled) {
      if (enabled) {
        statusText.textContent = 'Enabled';
        statusText.classList.add('active');
      } else {
        statusText.textContent = 'Disabled';
        statusText.classList.remove('active');
      }
    }
    
    // Notify all content scripts of state change
    function notifyContentScripts(enabled) {
      chrome.tabs.query({url: '*://meet.google.com/*'}, function(tabs) {
        tabs.forEach(function(tab) {
          chrome.tabs.sendMessage(tab.id, {action: 'stateChanged', enabled: enabled});
        });
      });
    }
    
    // Save settings to storage
    function saveSettings() {
      const settings = {
        summarizeLevel: summarizeLevel.value,
        autoSummarize: autoSummarize.checked,
        saveHistory: saveHistory.checked
      };
      
      chrome.storage.sync.set({settings: settings}, function() {
        console.log('Settings saved:', settings);
        
        // Show confirmation feedback
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.disabled = true;
        
        setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.disabled = false;
          closeSettingsModal();
        }, 1000);
      });
    }
    
    // Toggle extension state
    extensionToggle.addEventListener('change', function() {
      const enabled = this.checked;
      saveExtensionState(enabled);
      updateStatusDisplay(enabled);
    });
    
    // Open settings modal
    settingsBtn.addEventListener('click', openSettingsModal);
    
    function openSettingsModal() {
      settingsModal.style.display = 'block';
    }
    
    // Close settings modal
    closeModal.addEventListener('click', closeSettingsModal);
    
    function closeSettingsModal() {
      settingsModal.style.display = 'none';
    }
    
    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
      if (event.target === settingsModal) {
        closeSettingsModal();
      }
    });
    
    // Save settings button
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Help button
    helpBtn.addEventListener('click', function() {
      chrome.tabs.create({url: 'https://meetbrief.example.com/help'});
    });
    
    // Feedback button
    feedbackBtn.addEventListener('click', function() {
      chrome.tabs.create({url: 'https://meetbrief.example.com/feedback'});
    });
    
    // Initialize the popup
    loadExtensionState();
  });


