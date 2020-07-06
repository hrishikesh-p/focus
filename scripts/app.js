
var blinkTabMsg = function(message, times) {
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

function initAudio(chime) {
  var ding = chime.ding;
  var audioElemId  = "audio-" + ding.soundKey;
  var audioElem = document.getElementById(audioElemId);
  if(!audioElem){
    console.log("sound missing " + audioElemId);
    audioElem = document.createElement("audio");
    audioElem.id = audioElemId;
    audioElem.src = "sounds/" + ding.soundKey +".ogg";
  }
  return audioElem;
}

function createChime(name, interval, ding, interval_type){
  interval_type = interval_type || "standard" ;
  ding = ding || config.default_ding;
  Chimer.add({
    name: name,
    interval : interval,
    interval_type : interval_type, 
    ding : ding
  });
}

function displayActiveTimers(chimes){
  var activeChimesElem = document.getElementById("active-chimes");
  activeChimesElem.innerHTML = "";
  chimes.forEach(function(chime){
    var chimeContainer = document.createElement("div");
    chimeContainer.className = "chime-desc-container"; 
    var chimeText = document.createElement("span");
    chimeText.className = "chime-desc"; 
    chimeText.innerHTML = chimeDesription(chime);
    var chimeRemove = document.createElement("a");
    chimeRemove.onclick = function() {
      Chimer.remove(chime);
    }
    chimeRemove.innerHTML = "&#10007;";
    chimeContainer.appendChild(chimeText);
    chimeContainer.appendChild(chimeRemove);
    activeChimesElem.appendChild(chimeContainer);
  });
}

function chimeDesription(chime){
  var desc = chime.name || "" ;
  desc += " - " ; 
  desc += " Every " + chime.interval + " mins";
  return desc;
}

function setUpSounds(){
   var soundSelectElem = document.getElementById("chime-sound-key");
   config.sounds.forEach(function(soundName){
      var soundOptionElem = document.createElement("option");
     soundOptionElem.value = soundName;
     soundOptionElem.innerHTML = soundName;
     soundSelectElem.appendChild(soundOptionElem);
   });
}

function setUpInterval(){
  var intervalSelectElem = document.getElementById("chime-interval");
  for (var i = 1 ; i <= 60 ; i++ ) {
    if(60 % i == 0 ){
      var intervalOptionElem = document.createElement("option");
      intervalOptionElem.value = i;
      intervalOptionElem.innerHTML = i + " mins";
      intervalSelectElem.appendChild(intervalOptionElem);
    }
  }
}

function setup(chimes){
  setUpInterval();
  setUpSounds();
  Chimer.start();
}

function startMusic(){
  Chimer.start();
}

Chimer.onChimesChanged(displayActiveTimers);
Chimer.onChimeAdded(chime => {
  initAudio(chime);
});
Chimer.onPlayChime(function(chime){
  try {
    initAudio(chime).play();
  }
  catch (e){
    console.log(e);
  }
});

Chimer.onDisplayChimeText(function(msg , blinkTab, notification){
    chimeAlert(msg);

    if(blinkTab){
      blinkTabMsg(msg, 5);
    }

    if(notification){
      notify(msg);
    }
});

function showForm(){
  document.getElementById("form-container").className += " active";
  document.getElementById("custom-chime-form").reset();
}

function hideForm(){
  console.log("Hiding form");
  var formContainer = document.getElementById("form-container");
  formContainer.classname = formContainer.className = "toggle-form"
}

function toggleSound(el){
   document.getElementById("chime-sound-key").disabled = !el.checked;
}

function addChime(){
  var name = document.getElementById("chime-name").value;
  var interval = document.getElementById("chime-interval").value;
  var playSound = document.getElementById("chime-sound-enabled").checked;
  var blinkWindow = document.getElementById("chime-blinktab-enabled").checked;
  var showNotification = document.getElementById("chime-notification-enabled").checked;
  var chimeSoundKey = document.getElementById("chime-sound-key").value;
  Chimer.add({
    name: name,
    interval : interval,
    interval_type : "standard", 
    ding : {
      sound : playSound, 
      soundKey : chimeSoundKey, 
      notification : showNotification, 
      blinkWindow : blinkWindow
    }
  });
  notify("Added");
  hideForm();
}

setTimeout(setup, 300); // because i miss $.ready();
