(() => {
  let youtubeLeftControls, youtubePlayer, youtubePlayerContainer;
  let currentVideo = '';
  let prevVideoTime = '';
  let prevVideo = '';
  let trail = '&ytExt=ON';

  const fetchVideoTimeStamp = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? obj[currentVideo] : '');
      });
    });
  };

  const saveVideoTimeStamp = () => {
    chrome.storage.local.set({
      [prevVideo]: prevVideoTime
    });
  };
  // window.onhashchange = () => {
  //   console.log('gg', 'onhashchange');
  //   saveVideoTimeStamp();
  // };
  window.addEventListener('popstate', () => {
    console.log('gg', 'popstate');
    saveVideoTimeStamp();
  });
  const removeContinuewWatchingBtn = () => {
    const continueWatchingBtnExists = document.getElementsByClassName(
      'continue-watching-btn'
    )[0];
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
  window.addEventListener('DOMContentLoaded', () => {
    console.log('gg', 'DOMContentLoaded');
  });
  // window.addEventListener('focusout', () => {
  //   console.log('gg', 'focusout');
  //   saveVideoTimeStamp();
  // });

  window.addEventListener('beforeunload', () => {
    removeContinuewWatchingBtn();
    saveVideoTimeStamp();
  });

  window.setInterval(() => {
    prevVideoTime = youtubePlayer?.currentTime;
    prevVideo = currentVideo;
  }, 500);

  window.setInterval(() => {
    removeContinuewWatchingBtn();
  }, 8000);

  const newVideoLoaded = async (type) => {
    youtubePlayer = document.getElementsByClassName('video-stream')[0];
    //console.log('gg', type, prevVideoTime, prevVideo, currentVideo);
    const timeStamp = await fetchVideoTimeStamp();
    console.log('gg', timeStamp);
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

    saveVideoTimeStamp();
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
