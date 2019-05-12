// Basic game structure based on Brad Traversy's speed-typing game tutorial: https://www.youtube.com/watch?v=Yw-SYSG-028

window.addEventListener('load', init);

const currentLevel = 11;
const timeOut = 2500;

// Global scope variables
let score = 0;
let isPlaying;
let time = currentLevel;

scoreStorage = window.localStorage;

// DOM elements
const wordInput = document.querySelector('#word-input')
var contents = new Array()
const scoreDisplay = document.querySelector('#score')
const scoreText = document.querySelector('#scoreText')
const timeDisplay = document.querySelector('#time')
const message = document.querySelector('#message')
const feedback = document.querySelector('#feedback')
const seconds = document.querySelector('#seconds')
const newGame = document.querySelector('#new-game')
const wordList = document.querySelector('#word-list')
var wordDict = {}
var isValid;

// Initialize Game
function init() {
  // getting user score from local storage
  score = scoreStorage.getItem("userScore") || 0;
  // Decrement time
  window.countDown = setInterval(countdown, 1000);
  // Check game status (often)
  setInterval(checkStatus, 50);
  // Show number of seconds
  console.log(currentLevel)
  //seconds.innerHTML = currentLevel;
  
  if (score >= 1) {
      scoreDisplay.innerHTML = score;
  }
  else {
      score = 0;
      scoreStorage.setItem("userScore", score);
      scoreDisplay.innerHTML = "0";
  }
  // display random word
  showWord(wordDict);
  wordInput.addEventListener('input', handleInput);
  // Call countdown every second
  
  // check typed words - waiting for user to press enter
  matchWords(wordDict);
  
}

// Start match
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
// match word to skyldheiti
// random index word
function showWord(wordDict) {
  fetch('http://localhost:5042/words')
  .then(function(response) {
    return response.json();
  })
  .then(word => {
    console.log("mainword: " + word.mainword);
    console.log("oword: " + word.otherwords);

    wordDict["mainword"] = word.mainword;
    wordDict["otherwords"] = word.otherwords;
    // contains the count
    console.log(wordDict)
    allWords = [word.mainword, ...word.otherwords]
    allWords = shuffle(allWords);
    console.log("allwords: " + allWords);
    allWords.forEach(element => {
      listword = document.createElement("h2");
      listword.innerHTML = element;
      listword.setAttribute("id", element);

      if (element === word.mainword) {
        listword.setAttribute("class", "main-word")
      }
      wordList.appendChild(listword);
    });
    return wordDict;
  }).catch(err => {
    console.log("Error fetching word from server.")
  });
}

function matchWords(wordDict) {
  wordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      if (!wordInput.value) {
        return;
      }
      //if (startWithSameSubstr(wordDict.mainword, wordInput.value)) {
      //}
      fetch(`http://localhost:5042/userword/${wordInput.value}+${wordDict.mainword}+${wordDict.otherwords}`)
      .then(function(response) {
        return response.json();
      })
      .then(result => {
        isCorrect = result.is_correct;
        mostSimilar = result.most_similar;
        if (isCorrect) {
          clearTimeout(window.countDown);
          timeDisplay.style.display = "none";
          wordInput.value = '';
          score++;
          scoreStorage.setItem("userScore", score);
          score = scoreStorage.getItem("userScore");
          
          document.querySelector(".main-word").classList.add("correct")
          //feedback.className="green-text";
          //feedback.innerHTML = "Já, tölvan er sammála þér!";
          reloadGame();
        }
        else {
          wordInput.value = '';
          for (word in result.otherwords)
            console.log("orð " + word)
          if (mostSimilar) {
            clearTimeout(window.countDown);
            timeDisplay.style.display = "none";
            document.querySelector("#"+mostSimilar).className="purple-text";
            reloadGame();
          }
          //feedback.innerHTML = 'Tölvan segir að þetta orð passi betur við ' + mostSimilar;
        }
      })
    }
  })
}

function reloadGame() {
  setTimeout(function() {
    //feedback.innerHTML = "";
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
  }
  // Show time
  timeDisplay.innerHTML = time;
}

// Check game status
function checkStatus() {
  if (!isPlaying && time === 0) {
    newGame.style.display = "block";
  } else {
    newGame.style.display = "none";
  }
}

function gameOver() {
  var finalScore = scoreStorage.getItem("userScore");
  timeDisplay.innerHTML = '';
  scoreDisplay.innerHTML = 'Þú fékkst ' + finalScore;
  wordInput.style.display = "none";
  scoreStorage.clear();
  newGame.addEventListener("click", function (e) {
    window.location.reload(true);
  })
}

function startWithSameSubstr(mainWord, inputWord) {
  if (mainWord.startsWith(inputWord.substring(0, 4))) {
    console.log("substring found: " + inputWord.substring(0, 4))
    return true;
  }
}
/**
 * From SO
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}