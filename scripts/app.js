let intervals = []

function nextMatchingSecond(interval){ // interval is in minutes
  var now = new Date();
  console.log("now " + now);
  var minutes = now.getMinutes();
  console.log("minutes " + minutes);
  var minutesToNextChime = interval - (minutes % interval);
  if(minutesToNextChime == 0){
    minutesToNextChime = interval;
  }
  console.log("minutesToNextChime " + minutesToNextChime);
  var seconds = now.getSeconds();
  var nextMatchingSecond = minutesToNextChime * 60 - seconds;
  console.log("nextMatchingSecond " + nextMatchingSecond);
  return nextMatchingSecond;
}

var blinkTab = function(message, times) {
  var counter = 0;
  times = times || 5;
  var oldTitle = document.title,
    timeoutId,
    blink = function() {
      counter++;
      if(counter > 10) {
        clear();
      } 
      document.title = document.title == message ? ' ' : message; 
    },
    clear = function() {
      clearInterval(timeoutId);
      document.title = oldTitle;
      window.onmousemove = null;
      timeoutId = null;
    };

  if (!timeoutId) {
    timeoutId = setInterval(blink, 1000);
  }
  window.onmousemove = clear;
};

function playDing(ding){
  console.log("ding " + new Date())
  blinkTab("Breathe", 5);
  ding.audioElem.play();
  chimeAlert("Breathe");
  notify("Breathe");
}


function notify(msg) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }
  else if (Notification.permission === "granted") {
    var notification = new Notification(msg);
  }
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        var notification = new Notification(msg);
      }
    });
  }
}

function randomMargin(elem , width , height) { 
  var maxLeft = width || 300;
  var maxTop = height || 300;
  var leftMargin = Math.floor(Math.random() * maxLeft);
  var topMargin = Math.floor(Math.random() * maxTop);
  elem.style.margin = "" + topMargin + "px 10px 10px "+ leftMargin+"px"; 
}

function chimeAlert(text){
  var container = document.createElement("div");
  container.className="chime-alert";
  var textContainer = document.createElement("div");
  textContainer.className = "chime-text"
  textContainer.innerHTML = text;
  container.appendChild(textContainer);
  randomMargin(container);
  console.log("container" + container);
  console.log(container.outerHTML);
  var holder = document.getElementById("breather-holder");
  holder.appendChild(container);
  setTimeout(function() { 
    console.log(holder.outerHTML);
    holder.removeChild(container);
  }, 5000);
}

setTimeout(function() {
  chimeAlert("test");
}, 2000);

function clearTimers(){
  intervals.forEach(function (interval){
    clearTimeout(interval.firstChime);
    clearInterval(interval.repeater);
  });
  intervals = []
}

function initChime(chime) { 
  var ding = chime.ding;
  if(ding.type == "sound"){
    var audioElem = document.createElement("audio");
    audioElem.src = config.sounds[ding.sound_key];
    chime.ding.audioElem = audioElem;
  }
}

function startTimers() { 
  clearTimers();
  config.chimes.forEach(function(chime){
    if(chime.interval_type == "standard") {
      var secondsToFirstChime = nextMatchingSecond(chime.interval);
      var text = "Every " + chime.interval + " minutes";
      initChime(chime);
      var firstChimeTimeout = setTimeout(function() { 
        playDing(chime.ding);
        var subsequentChimesInterval = setInterval(function() { 
            playDing(chime.ding);      
        }, chime.interval * 60 * 1000);
        intervals.push({ firstChime : firstChimeTimeout, repeater : subsequentChimesInterval });
      }, secondsToFirstChime * 1000);
    }
  });
}

startTimers();
