let config = { 
  default_ding : {
    sound : true,
    sound_key : "chimes",
    blink_window: true,
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
  interval_type : "standard",
  ding : { 
    sound : true, 
    sound_key : "chimes"
  }
}];

var Chimer = {
  chimes : [],
  intervals : [],
  events : ["ChimeAdded" , "ChimeRemoved", "ChimesChanged", "InitCompleted", "FireChime", "ChimeSound"],
  eventListeners : {}, 
  on : function(eventName, func){
    this.eventListeners[eventName].push(func);
  },
  emit : function(){
    var eventName = Array.prototype.shift.apply(arguments);
    this.eventListeners[eventName].forEach(func => func.apply(null, arguments)); // TODO: might need to register listener with scope
  },
  init : function(){
    $this = this;
    this.events.forEach(event => {
      this.eventListeners[event] = [];
      this["on"+event] = function(func){
        this.on(event, func);
      };
    });
    return this;
  },
  add : function(chime){
    chime.id = new Date().getTime();  
    this.chimes.push(chime);
    this.emit("ChimeAdded", chime);
    this.applyChanges();
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
    var existingChimes = JSON.parse(localStorage.getItem("chimes")) || default_chimes;
    existingChimes.forEach(function(chime) { $this.add(chime) });
    this.applyChanges();
  },
  applyChanges : function(){
    this.chimes.sort(function(chime1, chime2){
      var comparison = 0;
      if(chime1.interval == chime2.interval){
        comparison = chime1.id < chime2.id ? 1 : -1;
      }
      else {
       comparison = chime1.interval > chime2.interval ? 1 : -1;
      }
      return comparison;
    });
    this.startTimers();
    localStorage.setItem("chimes" , JSON.stringify(this.chimes));
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
  clearTimers : function(){
    this.intervals.forEach(function (interval){
      clearTimeout(interval.firstChime);
      clearInterval(interval.repeater);
    });
    this.intervals = [];
  },
  fireChime: function(chime){
    var name = chime.name;
    var ding = chime.ding;
    if(chime.blink_window){
      blinkTab(name, 5);
    }
    if(this.maxMatchingInterval(chime)){
      this.emit("ChimeSound" , chime);
    }
    else {
      console.log("skipping audio as it is not the maxElement");
    }

    chimeAlert(name);

    if(chime.notification){
      notify(chime.name);
    }
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
    this.clearTimers();
    this.chimes.forEach(function(chime){
      if(chime.interval_type == "standard") {
        var secondsToFirstChime = $this.nextMatchingSecond(chime.interval);
        var firstChimeTimeout = setTimeout(function() { 
          $this.fireChime(chime); // TODO : move these to events too
          var subsequentChimesInterval = setInterval(function() { 
            $this.fireChime(chime);      
          }, chime.interval * 60 * 1000);
          $this.intervals.push({ firstChime : firstChimeTimeout, repeater : subsequentChimesInterval });
        }, secondsToFirstChime * 1000);
      }
    });
  }, 
  start : function(){
    this.load();
    this.emit("InitCompleted", this.chimes );
    this.emit("ChimesChanged", this.chimes);
  }
}.init();

let chime_1m = { sound: true, sound_key: "your-turn" } 
let chime_15m = { sound: true, sound_key: "all-cards-on-table" , notification: true , blink_window: true } 
let chime_1h = { sound: true, sound_key: "piece-of-cake" , notification: true , blink_window: true } 
