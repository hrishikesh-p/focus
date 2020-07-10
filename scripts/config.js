let config = { 
  default_ding : {
    sound : true,
    soundKey : "chimes",
    blinkWindow: true,
  },
  sounds : [
    "all-cards-on-table",
    "awareness",
    "cause-and-effect",
    "chimes",
    "engine",
    "filling-your-inbox",
    "gesture",
    "knob",
    "oringz-w447",
    "piece-of-cake",
    "reload",
    "scratch",
    "shield",
    "springy",
    "your-turn" 
  ]
}

let default_chimes = [{
  id : new Date().getTime(),
  name : "Breathe",
  interval : 5,
  ding : { 
    sound : true, 
    soundKey : "chimes"
  }
}];

var Chimer = {
  prevId : -1,
  chimes : [],
  intervals : {},
  events : ["ChimeAdded",
            "ChimeRemoved",
            "ChimesChanged",
            "InitCompleted",
            "FireChime",
            "PlayChime",
            "DisplayChimeText"],
  eventListeners : {}, 
  on : function(eventName, func){
    this.eventListeners[eventName].push(func);
  },
  emit : function(){
    console.log(arguments);
    var eventName = Array.prototype.shift.apply(arguments);
    this.eventListeners[eventName].forEach(func => func.apply(null, arguments)); // TODO: might need to register listener with scope
  },
  init : function(){
    $this = this;
    this.events.forEach(event => {
      $this.eventListeners[event] = [];
      $this["on"+event] = function(func){
        $this.on(event, func);
      };
    });
    return this;
  },
  getId: function(){
    var id = new Date().getTime();
    if(this.prevId == id ) {
      id = id+1;
    }
    return id++;
  },
  add : function(chime, delayChanges){
    chime.id = chime.id || this.getId();
    this.chimes.push(chime);
    this.emit("ChimeAdded", chime);
    if(!delayChanges) {
      this.applyChanges();
    }
  },
  remove : function(chimeToRemove){
    if(chimeToRemove.id){
      this.chimes = this.chimes.filter(chime => chimeToRemove.id != chime.id);
      this.emit("ChimeRemoved", chimeToRemove);
      this.applyChanges();
    }
    else { 
      console.log("chime id missing");
    }
  },
  load: function(){
    $this = this;
    var existingChimes = JSON.parse(localStorage.getItem("chimes")) || default_chimes;
    existingChimes.forEach(function(chime) { $this.add(chime, true); });
    this.applyChanges();
  },
  applyChanges : function(){
    this.chimes.sort(function(chime1, chime2){
      var comparison = 0;
      if(chime1.interval == chime2.interval){
        comparison = chime1.id > chime2.id ? 1 : -1;
      }
      else {
       comparison = chime1.interval < chime2.interval ? 1 : -1;
      }
      return comparison;
    });
    localStorage.setItem("chimes" , JSON.stringify(this.chimes));
    console.log(this.chimes);
    this.startTimers();
    this.emit("ChimesChanged", this.chimes);
  },
  nextMatchingSecond: function(interval){ // interval is in minutes
    var now = new Date();
    var minutes = now.getMinutes();
    var minutesToNextChime = interval - (minutes % interval);
    if(minutesToNextChime == 0){
      minutesToNextChime = interval;
    }
    var seconds = now.getSeconds();
    var nextMatchingSec = minutesToNextChime * 60 - seconds;
    return nextMatchingSec;
  },
  addTimer : function(chimeId, initialTimer, intervalTimer){
    var timerInfo = null;
     if(this.intervals[chimeId]){
          timerInfo = this.intervals[chimeId];
     }
     else { 
       timerInfo = {};

     }
    if(initialTimer){
       if(timerInfo["initial"] ) {
         clearTimeout(timerInfo.initial);
       }
      timerInfo.initial = initialTimer;
    }

    if(intervalTimer){
      if(timerInfo["interval"]) {
        clearInterval(timerInfo.interval);
      }
      timerInfo.interval = intervalTimer;
    }
    this.intervals[chimeId] = timerInfo;
  },
  fireChime: function(chime){
    if(this.maxMatchingInterval(chime)){
      this.emit("PlayChime" , chime);
    }
    else {
      console.log("skipping audio as it is not the maxElement");
    }
 
    this.emit("DisplayChimeText", chime.name,
      chime.ding.blinkWindow, chime.ding.notification, chime);
  },
  maxMatchingInterval: function(currentChime){
    var currentMinutes =  new Date().getMinutes();
    var matchingChimes = Chimer.chimes.filter(function(chime) {
      return currentMinutes % chime.interval == 0;
    });
    return currentChime.id == matchingChimes[0].id;
  },
  startTimers : function() { 
    $this = this;
    this.chimes.forEach(function(chime){
        var secondsToFirstChime = $this.nextMatchingSecond(chime.interval);
        var firstChimeTimeout = setTimeout(function() { 
          $this.fireChime(chime); // TODO : move these to events too
          var subsequentChimesInterval = setInterval(function() { 
            $this.fireChime(chime);      
          }, chime.interval * 60 * 1000);
          $this.addTimer(chime.id, null, subsequentChimesInterval);
        }, secondsToFirstChime * 1000);
        $this.addTimer(chime.id, firstChimeTimeout);
    });
  }, 
  start : function(){
    this.load();
    this.emit("InitCompleted", this.chimes );
    this.emit("ChimesChanged", this.chimes);
  }
}.init();

let chime_5m = { sound: true, soundKey: "knob" } 
let chime_15m = { sound: true, soundKey: "your-turn", blink_window: true } 
let chime_30m = { sound: true, soundKey: "reload" , notification: true , blink_window: true } 
let chime_1h = { sound: true, soundKey: "chimes" , notification: true , blink_window: true } 
