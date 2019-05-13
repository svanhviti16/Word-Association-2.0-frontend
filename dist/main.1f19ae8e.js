// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"main.js":[function(require,module,exports) {
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*
* Word Association game based on word embeddings
* Uses parcelJS bundler
* Basic game structure based on Brad Traversy's speed-typing game tutorial: https://www.youtube.com/watch?v=Yw-SYSG-028
*
*/
window.addEventListener('load', init);
var currentLevel = 11;
var timeOut = 2500; // Global scope variables

var score = 0;
var isPlaying;
var time = currentLevel;
scoreStorage = window.localStorage; // DOM elements

var wordInput = document.querySelector('#word-input');
var scoreDisplay = document.querySelector('#score');
var scoreText = document.querySelector('#scoreText');
var timeDisplay = document.querySelector('#time');
var message = document.querySelector('#message');
var feedback = document.querySelector('#feedback');
var seconds = document.querySelector('#seconds');
var newGame = document.querySelector('#new-game');
var wordList = document.querySelector('#word-list');
var wordDict = {};
var isValid; // Initialize Game

function init() {
  // getting user score from local storage (and returns 0 if null)
  score = scoreStorage.getItem("userScore") || 0; // Decrement time

  window.countDown = setInterval(countdown, 1000); // Check game status (often)

  setInterval(checkStatus, 50);

  if (score >= 1) {
    scoreDisplay.innerHTML = score;
  } else {
    score = 0;
    scoreStorage.setItem("userScore", score);
    scoreDisplay.innerHTML = "0";
  } // display random word


  showWord(wordDict);
  wordInput.addEventListener('input', handleInput); // check typed words - waiting for user to press enter

  matchWords(wordDict);
} // Start match


function handleInput() {
  if (matchWords()) {
    isPlaying = true;
    time = 10;
    showWord(words);
    wordInput.value = '';
    score++;
  }

  scoreDisplay.innerHTML = score;
}

function showWord(wordDict) {
  fetch('http://localhost:5042/words').then(function (response) {
    return response.json();
  }).then(function (word) {
    wordDict["mainword"] = word.mainword;
    wordDict["otherwords"] = word.otherwords; // contains the count

    console.log(wordDict);
    allWords = [word.mainword].concat(_toConsumableArray(word.otherwords));
    allWords = shuffle(allWords);
    console.log("allwords: " + allWords);
    allWords.forEach(function (element) {
      listword = document.createElement("h2");
      listword.innerHTML = element;
      listword.setAttribute("id", element);

      if (element === word.mainword) {
        listword.setAttribute("class", "main-word");
      }

      wordList.appendChild(listword);
    });
    return wordDict;
  }).catch(function (err) {
    console.log("Error fetching word from server.");
  });
}

function matchWords(wordDict) {
  wordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      if (!wordInput.value) {
        return;
      } // unexplained HTML error in this line :( Doesn't affect game though


      fetch("http://localhost:5042/userword/".concat(wordInput.value, "+").concat(wordDict.mainword, "+").concat(wordDict.otherwords)).then(function (response) {
        return response.json();
      }).then(function (result) {
        if (wordInput.value != wordDict.mainword) {
          isCorrect = result.is_correct;
          mostSimilar = result.most_similar; // correct answer

          if (isCorrect) {
            clearTimeout(window.countDown);
            timeDisplay.style.display = "none";
            wordInput.value = '';
            score++;
            scoreStorage.setItem("userScore", score);
            score = scoreStorage.getItem("userScore");
            document.querySelector(".main-word").classList.add("correct");
            reloadGame();
          } // wrong but valid answer
          else {
              wordInput.value = '';

              if (mostSimilar) {
                clearTimeout(window.countDown);
                timeDisplay.style.display = "none";
                document.querySelector("#" + mostSimilar).className = "purple-text";
                reloadGame();
              }
            }
        } // clearing input if the user simply entered the main word


        wordInput.value = '';
      });
    }
  });
}

function reloadGame() {
  setTimeout(function () {
    window.location.reload(true);
  }, timeOut);
}

function countdown() {
  // Make sure time is not run out
  if (time > 0) {
    // Decrement
    time--;
  } else if (time === 0) {
    // Game is over
    isPlaying = false;
    gameOver();
    clearTimeout(window.countDown);
  } // Show time


  timeDisplay.innerHTML = time;
} // Check game status


function checkStatus() {
  if (!isPlaying && time === 0) {
    newGame.style.display = "block";
  } else {
    newGame.style.display = "none";
  }
}

function gameOver() {
  var finalScore = scoreStorage.getItem("userScore");
  timeDisplay.style.display = "none";
  scoreDisplay.innerHTML = 'Þú fékkst ' + finalScore;
  wordInput.style.display = "none";
  scoreStorage.clear();
  newGame.addEventListener("click", function (e) {
    window.location.reload(true);
  });
}
/**
 * From SO
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */


function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var _ref = [a[j], a[i]];
    a[i] = _ref[0];
    a[j] = _ref[1];
  }

  return a;
}
},{}],"../../../../../../../../.npm-packages/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53884" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../../../../../../.npm-packages/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.map