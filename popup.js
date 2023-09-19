import { getActiveTabUrl } from "./utils";

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
  
    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";
  
    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);
  
    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);
  
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
  };

const viewBookmarks = (currentVideoBookmarks = []) => {
    const bookmarksElement = document.getElementById('bookmarks');
    bookmarksElement.innerHTML = '';

    if (currentVideoBookmarks.length > 0) {
        for (bookmark in currentVideoBookmarks) {
            addNewBookmark(bookmarksElement, bookmark);
        }
    }
    else {
        const msg = 'There are no bookmarks for the current video';
        bookmarksElement.innerHTML = '<i class="row">' + msg + '</i>';
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
  
    chrome.tabs.sendMessage(activeTab.id, {
      type: "PLAY",
      value: bookmarkTime,
    });
  };
  
  const onDelete = async e => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById(
      "bookmark-" + bookmarkTime
    );
  
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
  
    chrome.tabs.sendMessage(activeTab.id, {
      type: "DELETE",
      value: bookmarkTime,
    }, viewBookmarks);
  };
  
  const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
  
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
  };

document.addEventListener("DOMContentLoaded", async () => {
    const activeTabUrl = await getActiveTabUrl();
    const youtubeVideoUrl = 'youtube.com/watch';
    const queryParams = tab.url.split('?')[1];
    const urlParams = new URLSearchParams(queryParams);
    const currentVideoId = urlParams.get('v');

    console.log('reached here');

    // Current tab is a youtube video 
    if (currentVideoId && activeTabUrl.includes(youtubeVideoUrl)) {
        chrome.storage.sync.get([currentVideoId], (data) => {
            const currentVideoBookmarks = data[currentVideoId] ? JSON.parse(data[currentVideoId]) : [];
        })
        viewBookmarks(currentVideoBookmarks);
    }
    // Current tab is not a youtube video 
    else {
        const container = document.getElementsByClassName('container')[0];
        const msg = 'This is not a Youtube video';
        container.innerHTML = '<div class="title">' + msg + '</div>';
    }
});
