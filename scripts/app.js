
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
      document.title = "Stay Mindful";
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

function chimeAlert(text, color){
  var container = document.createElement("div");
  container.className="chime-alert";
  container.style.backgroundColor=color 
  var textContainer = document.createElement("div");
  textContainer.className = "chime-text"
  textContainer.innerHTML = text;
  container.appendChild(textContainer);
  randomMargin(container);
  var holder = document.getElementById("breather-holder");
  holder.appendChild(container);
  setTimeout(function() { 
    holder.removeChild(container);
  }, 5000);
}

function initAudio(soundKey) {
  var audioElemId  = "audio-" + soundKey;
  var audioElem = document.getElementById(audioElemId);
  if(!audioElem){
    audioElem = document.createElement("audio");
    audioElem.id = audioElemId;
    audioElem.src = "sounds/" + soundKey +".ogg";
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
     initAudio(soundName);
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
  initAudio(chime.ding.soundKey);
});
Chimer.onPlayChime(function(chime){
  try {
    initAudio(chime.ding.soundKey).play();
  }
  catch (e){
    console.log(e);
  }
});
 
var chimeColors = {};

var RandomColor = {
    allColors : ['blue' , 'green' , 'teal' , 'lime' , 'red', 'orange'],
    colorList : [],
    nextColor : function(){
      if(this.colorList.length == 0){
        this.colorList = this.allColors.slice(); 
      }
      var colorPos = Math.floor(Math.random() * this.colorList.length); 
      var colorAssigned = this.colorList.splice(colorPos,1);
      return colorAssigned[0]; 
    }
}

function chimeColor(id){
  if(!chimeColors[id]){
    chimeColors[id] = RandomColor.nextColor();
  }
  return chimeColors[id];
}

Chimer.onDisplayChimeText(function(msg , blinkTab, notification, chime){
    chimeAlert(msg, chimeColor(chime.id));

    if(blinkTab){
      blinkTabMsg(msg, 5);
    }

    if(notification){
      notify(msg);
    }
});

function showTour(){
  var tourElem =  document.getElementById("tour-dialog-container");
  if(Chimer.chimes.length == 0) { // first Run
    if(tourElem){
      tourElem.style.display = "block";
    }
  }
  else {
    if(tourElem){
      tourElem.style.display = "none";
    }
  }
}

Chimer.onInitCompleted(showTour);
Chimer.onChimesChanged(showTour);

function showForm(){
  document.getElementById("form-container").className += " active";
  document.getElementById("custom-chime-form").reset();
  document.getElementById("chime-sound-enabled").checked=true;
  document.querySelector("#chime-sound-key option[value=chimes]").selected = true;
}

function hideForm(){
  var formContainer = document.getElementById("form-container");
  formContainer.classname = formContainer.className = "toggle-form"
}

function toggleSound(el){
   document.getElementById("chime-sound-key").disabled = !el.checked;
}

function playSampleSound(el){
  var soundKey= el.value;
  initAudio(soundKey).play();
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
