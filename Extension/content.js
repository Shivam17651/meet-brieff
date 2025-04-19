// Inject React app into Google Meet
const script = document.createElement('script');
script.src = chrome.runtime.getURL('build/static/js/main.js');
script.onload = () => {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);