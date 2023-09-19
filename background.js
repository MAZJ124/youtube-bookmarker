chrome.tabs.onUpdated.addListener((tabId, tab) => {
    const youtubeVideoUrl = 'youtube.com/watch';
    console.log("page updated");
    if (tab.url && tab.url.includes(youtubeVideoUrl)) {
      const queryParams = tab.url.split('?')[1];
      const urlParams = new URLSearchParams(queryParams);
      chrome.tabs.sendMessage(tabId, {
        type: 'NEW',
        videoId: urlParams.get('v'),
      });
    }
  });
  