(() => {
    let currentVideoId = '';
    let currentVideoBookmarks = [];
    let youtubeLeftControls, youtubeVideoStream;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
    
        if (type === "NEW") {
          currentVideoId = videoId;
          newVideoLoaded();
        } else if (type === "PLAY") {
          youtubePlayer.currentTime = value;
        } else if ( type === "DELETE") {
          currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
          chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
          response(currentVideoBookmarks);
        }
      });

    async function fetchBookmarks() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideoId], (obj) => {
                resolve(obj[currentVideoId] ? JSON.parse(obj[currentVideoId]) : []);
            });
        });
    }

    async function loadVideo() {
        const bookmarkButtonExists = document.getElementsByClassName('bookmark-btn')[0];
        currentVideoBookmarks = await fetchBookmarks();
        if (!bookmarkButtonExists) {
            const bookmarkButton = document.createElement('img');
            bookmarkButton.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkButton.className = 'ytp-button' + 'bookmark-btn';
            bookmarkButton.titile = 'Bookmark current timestamp';

            youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
            youtubeVideoStream = document.getElementsByClassName('video-stream')[0];
            youtubeLeftControls.appendChild(bookmarkButton);

            bookmarkButton.addEventListener('click', addBookmark);
        }
    }

    async function addBookmark() {
        const currentTime = youtubeVideoStream.currentTime;
        const bookmark = {
            time: currentTime,
            desc: 'Bookmark at ' + getTime(currentTime),
        };
        currentVideoBookmarks = await fetchBookmarks();
        chrome.storage.sync.set({
            [currentVideoId]: JSON.stringify([...currentVideoBookmarks, bookmark].sort((a, b) => a.time - b.time))
        });

    }

    function getTime(t) {
        let date = new Date();
        date.setSeconds(t);
        return date.toISOString().substr(11, 8);
    } 

    loadVideo();
})();
