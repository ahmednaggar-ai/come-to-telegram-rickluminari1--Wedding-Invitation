(function () {
  var SOUND_URL = 'src/sound/sound.mp3';
  var CHUNK_TARGET = 64 * 1024; // append in ~64KB buckets for faster first decode
  var loader = document.getElementById('loader');
  var invitation = document.getElementById('invitation');

  var doorSound = new Audio();
  doorSound.preload = 'none';
  doorSound.volume = 0.85;

  var audioUnlocked = false;
  var playWhenReady = false;
  var objectUrl = null;

  function canUseMpegSourceBuffer() {
    return !!(window.MediaSource && MediaSource.isTypeSupported('audio/mpeg'));
  }

  function waitForUpdateEnd(sourceBuffer) {
    return new Promise(function (resolve, reject) {
      if (!sourceBuffer.updating) {
        resolve();
        return;
      }
      function onEnd() {
        cleanup();
        resolve();
      }
      function onError() {
        cleanup();
        reject(new Error('SourceBuffer error'));
      }
      function cleanup() {
        sourceBuffer.removeEventListener('updateend', onEnd);
        sourceBuffer.removeEventListener('error', onError);
      }
      sourceBuffer.addEventListener('updateend', onEnd);
      sourceBuffer.addEventListener('error', onError);
    });
  }

  function appendBucket(sourceBuffer, bytes) {
    return waitForUpdateEnd(sourceBuffer).then(function () {
      sourceBuffer.appendBuffer(bytes);
      return waitForUpdateEnd(sourceBuffer);
    });
  }

  function startChunkedStream() {
    if (!canUseMpegSourceBuffer() || !window.fetch || !window.ReadableStream) {
      // Progressive HTTP download — browser plays before the full file finishes
      doorSound.preload = 'auto';
      doorSound.src = SOUND_URL;
      doorSound.load();
      return;
    }

    var mediaSource = new MediaSource();
    objectUrl = URL.createObjectURL(mediaSource);
    doorSound.src = objectUrl;

    mediaSource.addEventListener('sourceopen', function onSourceOpen() {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);

      var sourceBuffer;
      try {
        sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        doorSound.preload = 'auto';
        doorSound.src = SOUND_URL;
        doorSound.load();
        return;
      }

      fetch(SOUND_URL).then(function (response) {
        if (!response.ok || !response.body) {
          throw new Error('Sound fetch failed');
        }
        var reader = response.body.getReader();
        var pending = new Uint8Array(0);

        function merge(a, b) {
          var out = new Uint8Array(a.length + b.length);
          out.set(a, 0);
          out.set(b, a.length);
          return out;
        }

        function pump() {
          return reader.read().then(function (result) {
            if (result.done) {
              var finish = Promise.resolve();
              if (pending.length) {
                finish = appendBucket(sourceBuffer, pending.buffer.slice(
                  pending.byteOffset,
                  pending.byteOffset + pending.byteLength
                ));
                pending = new Uint8Array(0);
              }
              return finish.then(function () {
                if (mediaSource.readyState === 'open') {
                  mediaSource.endOfStream();
                }
              });
            }

            pending = merge(pending, result.value);

            // Keep feeding buckets so playback can start before the full download
            if (pending.length < CHUNK_TARGET) {
              return pump();
            }

            var bucket = pending;
            pending = new Uint8Array(0);
            return appendBucket(sourceBuffer, bucket.buffer.slice(
              bucket.byteOffset,
              bucket.byteOffset + bucket.byteLength
            )).then(pump);
          });
        }

        return pump();
      }).catch(function () {
        if (mediaSource.readyState === 'open') {
          try { mediaSource.endOfStream(); } catch (e) {}
        }
        // Fallback: native progressive playback
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        doorSound.preload = 'auto';
        doorSound.src = SOUND_URL;
        doorSound.load();
      });
    });
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    // Unlock without pulling the whole track: tiny silent Web Audio beep
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        var ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }
    } catch (e) {}

    // Also warm the media element under the same user gesture
    doorSound.muted = true;
    var warm = doorSound.play();
    if (warm && typeof warm.then === 'function') {
      warm.then(function () {
        doorSound.pause();
        doorSound.currentTime = 0;
        doorSound.muted = false;
      }).catch(function () {
        doorSound.muted = false;
      });
    } else {
      doorSound.muted = false;
    }
  }

  function tryPlay() {
    doorSound.muted = false;
    var playPromise = doorSound.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function playDoorSound() {
    playWhenReady = true;

    // Start as soon as the first buckets are decodable — do not wait for full file
    if (doorSound.readyState >= 2) {
      tryPlay();
      return;
    }

    function onCanPlay() {
      if (!playWhenReady) return;
      tryPlay();
    }

    doorSound.addEventListener('canplay', onCanPlay, { once: true });
    doorSound.addEventListener('loadeddata', onCanPlay, { once: true });
  }

  // Begin streaming immediately so buckets arrive during the intro
  startChunkedStream();

  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(function (evt) {
    document.addEventListener(evt, unlockAudio, { once: true, passive: true });
  });

  setTimeout(function () {
    loader.classList.add('show-text');
  }, 200);

  setTimeout(function () {
    loader.classList.add('open-doors');
    playDoorSound();
    if (window.startCelebration) window.startCelebration();
  }, 5000);

  setTimeout(function () {
    invitation.classList.add('visible');
  }, 5800);

  setTimeout(function () {
    loader.classList.add('hide');
  }, 6000);

  setTimeout(function () {
    loader.remove();
  }, 7000);
})();
