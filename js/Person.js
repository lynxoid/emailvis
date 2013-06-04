// person class
function Person(id, lname, fname, sessions, count, angle, influence) {
      this.id = id;
      this.lname = (lname!=null)?lname:null;
      this.fname = (fname!=null)?fname:null;
      this.sessions = (sessions)?sessions:null;
      this.nodeName = this.fname + " " + this.lname;// + " " + this.id;
      this.session_count = (count)?count:0;
      this.active = false;
      this.inside = true;
      this.alpha = 1;
      this.angle = (angle!=null)?angle:null;
      this.order = 0;
      this.influence = (influence!=null)?influence:null;
  }
  // is main guy
  Person.prototype.isMain = function() {
      return this.isMain;
  };

  Person.prototype.setMain = function(f) {
      this.isMain = f;
  }

  Person.prototype.setSessions = function(s) {
      this.sessions = s;
  }

  Person.prototype.addSession = function(sess) {  
      if (this.sessions == null)
        this.sessions = {};
//      console.log("added session for person ", this.id, sess.sessionId);
      this.sessions[sess.sessionId] = sess;
  }

  Person.prototype.setInstruments = function(instr) {
      this.instruments = instr;
  }

  Person.prototype.inSession = function(sid) {
    if (this.sessions == null) return false;
    if (this.sessions.hasOwnProperty(sid) )
        return true;
    return false;
  }
