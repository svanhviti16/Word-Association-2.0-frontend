// Basic game structure based on Brad Traversy's speed-typing game tutorial: https://www.youtube.com/watch?v=Yw-SYSG-028

window.addEventListener('load', init);

// Global scope variables
let score = 0;
let isPlaying;
let time = 10;
scoreStorage = window.localStorage;

// DOM elements
const wordInput = document.querySelector('#word-input')
var contents = new Array()
const mainWord = document.querySelector('#main-word')
const other0 = document.querySelector('#other-0')
const other1 = document.querySelector('#other-1')
const other2 = document.querySelector('#other-2')
const scoreDisplay = document.querySelector('#score')
const scoreText = document.querySelector('#scoreText')
const timeDisplay = document.querySelector('#time')
const message = document.querySelector('#message')
const feedback = document.querySelector('#feedback')
const seconds = document.querySelector('#seconds')
const skyldheitiDisplay = document.querySelector('#skyldheiti')
var wordDict = {}
var isValid;

// Initialize Game
function init() {
  // getting user score from local storage
  score = scoreStorage.getItem("userScore");
  if (score >= 1) {
      scoreDisplay.innerHTML = score;
  }
  else {
      scoreDisplay.innerHTML = "0";
  }
  // display random word
  showWord(wordDict);
  // check typed words - waiting for user to press enter
  matchWords(wordDict);
  
}

// match word to skyldheiti
// random index word
function showWord(wordDict) {
  fetch('http://localhost:5042/words')
  .then(function(response) {
    return response.json();
  })
  .then(word => {
    wordDict["mainword"] = word.mainword;
    wordDict["otherwords"] = word.otherwords;
    // contains the count
    console.log(wordDict)
    mainWord.innerHTML = wordDict["mainword"];
    other0.innerHTML = wordDict["otherwords"][0];
    other1.innerHTML = wordDict["otherwords"][1];
    other2.innerHTML = wordDict["otherwords"][2];
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

      fetch(`http://localhost:5042/userword/${wordInput.value}+${wordDict.mainword}+${wordDict.otherwords}`)
      .then(function(response) {
        return response.json();
      })
      .then(result => {
        isCorrect = result.is_correct;
        mostSimilar = result.most_similar;
        var timeOut = 2500;
        if (isCorrect) {
          wordInput.value = '';
          score++;
          scoreStorage.setItem("userScore", score);
          score = scoreStorage.getItem("userScore");
          feedback.className="green-text";
          feedback.innerHTML = "Já, tölvan er sammála þér!";
        }
        else {
          wordInput.value = '';
          feedback.className="blue-text";
          feedback.innerHTML = 'Tölvan segir að þetta orð passi betur við ' + mostSimilar;
        }
        setTimeout(function() {
          feedback.innerHTML = "";
          window.location.reload(true);
        }, timeOut);
      })
    }
  })
}

function countdown() {
  // Make sure time is not run out
  if (time > 0) {
    // Decrement
    time--;
  } else if (time === 0) {
    // Game is over
    isPlaying = false;
  }
  // Show time
  timeDisplay.innerHTML = time;
}

// Check game status
function checkStatus() {
  if (!isPlaying && time === 0) {
    message.innerHTML = 'Game Over!!!';
    score = -1;
  }
}