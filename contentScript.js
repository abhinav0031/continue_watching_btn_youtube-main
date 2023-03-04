(() => {
  let youtubePlayer, youtubePlayerContainer;
  let currentVideo = '';
  let prevVideoTime = '';
  let prevVideo = '';
  let trail = '&ytExt=ON';

  const fetchVideoTimeStamp = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? obj[currentVideo].timestamp : '');
      });
    });
  };
  //get all keys from chrome storage
  const checkStorageFilled = async () => {
    const pr = new Promise((resolve) =>
      chrome.storage.local.get(null, function (items) {
        resolve(items);
      })
    );
    const storedData = await pr;
    let arrData = [];
    if (Object.keys(storedData).length > 100) {
      Object.keys(storedData).forEach((key) => {
        arrData.push({
          id: key,
          savedTime: JSON.parse(storedData?.[key]?.savedTime)
        });
      });
      arrData.sort((a, b) => new Date(a.savedTime) - new Date(b.savedTime));
      chrome.storage.local.remove(arrData[0].id);
    }
  };

  const saveVideoTimeStamp = async () => {
    let pr = new Promise((resolve) => {
      chrome.storage.local.set({
        [prevVideo]: {
          timestamp: prevVideoTime,
          savedTime: JSON.stringify(new Date())
        }
      });
      resolve('success');
    });
    await pr;
    checkStorageFilled();
  };
  //tab gets removed
  window.addEventListener('popstate', async () => {
    await saveVideoTimeStamp();
  });
  const removeContinuewWatchingBtn = () => {
    const continueWatchingBtnExists = document.getElementsByClassName(
      'continue-watching-btn'
    )?.[0];
    youtubePlayerContainer =
      document.getElementsByClassName('ytp-chrome-top')[0];
    if (continueWatchingBtnExists) {
      youtubePlayerContainer.removeChild(continueWatchingBtnExists);
    }
  };

  const continueWatchingHandler = (timeStamp) => {
    youtubePlayer.currentTime = timeStamp;
    removeContinuewWatchingBtn();
  };
  //tab gets unloaded
  window.addEventListener('beforeunload', async () => {
    removeContinuewWatchingBtn();
    await saveVideoTimeStamp();
  });

  window.setInterval(() => {
    prevVideoTime = youtubePlayer?.currentTime;
    prevVideo = currentVideo;
  }, 1000);

  window.setInterval(() => {
    removeContinuewWatchingBtn();
  }, 8000);

  const newVideoLoaded = async () => {
    youtubePlayer = document.getElementsByClassName('video-stream')[0];
    const timeStamp = await fetchVideoTimeStamp();
    const continueWatchingBtnExists = document.getElementsByClassName(
      'continue-watching-btn'
    )[0];
    if (continueWatchingBtnExists && timeStamp === '') {
      youtubePlayerContainer =
        document.getElementsByClassName('ytp-chrome-top')[0];
      youtubePlayerContainer.removeChild(continueWatchingBtnExists);
    }
    if (!continueWatchingBtnExists && timeStamp !== '') {
      const continueWatchBtn = document.createElement('BUTTON');
      continueWatchBtn.name = 'continue watching';
      continueWatchBtn.className = 'ytp-button ' + 'continue-watching-btn';
      continueWatchBtn.title = 'Click to continue watching from where you left';
      continueWatchBtn.style.background = '#0f0f0f';
      continueWatchBtn.style.width = '160px';
      continueWatchBtn.style.height = '40px';
      continueWatchBtn.style.textAlign = 'center';
      continueWatchBtn.style.fontSize = '18px';
      let textNode = document.createTextNode('Continue watching');
      continueWatchBtn.appendChild(textNode);
      youtubePlayerContainer =
        document.getElementsByClassName('ytp-chrome-top')[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];
      youtubeLeftControls =
        document.getElementsByClassName('ytp-left-controls')[0];
      youtubePlayerContainer.appendChild(continueWatchBtn);
      continueWatchBtn.addEventListener('click', () =>
        continueWatchingHandler(timeStamp)
      );
    }
    await saveVideoTimeStamp();
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const {type, videoId} = obj;
    if (type === 'NEW') {
      currentVideo = videoId;
      newVideoLoaded(type);
    }
  });
  if (
    !window.location.href.includes(trail) &&
    !window.location.href.includes('ab_channel') &&
    window.location.href.includes('youtube.com/watch')
  ) {
    window.location.href += trail;
  }
})();
