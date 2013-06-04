/**
 * A spring force dragging a node to its home.
 * Modified from pv.Force.spring
 */

HomeForce = function(k) {
  var d = .1, // default damping factor
      l = 20, // default rest length
      //kl, // per-spring normalization
      force = {};

  if (!arguments.length) k = .1; // default spring constant (tension)


  /**
   * Sets or gets the spring constant. The default value is 0.1; greater values
   * will result in stronger tension. The spring tension is automatically
   * normalized using the inverse square root of the maximum link degree of
   * attached nodes.
   *
   * @function
   * @name pv.Force.spring.prototype.constant
   * @param {number} x the new spring constant.
   * @returns {pv.Force.spring} this, or the current spring constant.
   */
  force.constant = function(x) {
    if (arguments.length) {
      k = Number(x);
      return force;
    }
    return k;
  };

  /**
   * The spring damping factor, in the range [0,1]. Damping functions
   * identically to drag forces, damping spring bounciness by applying a force
   * in the opposite direction of attached nodes' velocities. The default value
   * is 0.1. The spring damping is automatically normalized using the inverse
   * square root of the maximum link degree of attached nodes.
   *
   * @function
   * @name pv.Force.spring.prototype.damping
   * @param {number} x the new spring damping factor.
   * @returns {pv.Force.spring} this, or the current spring damping factor.
   */
  force.damping = function(x) {
    if (arguments.length) {
      d = Number(x);
      return force;
    }
    return d;
  };

  /**
   * The spring rest length. The default value is 20 pixels.
   *
   * @function
   * @name pv.Force.spring.prototype.length
   * @param {number} x the new spring rest length.
   * @returns {pv.Force.spring} this, or the current spring rest length.
   */
  force.length = function(x) {
    if (arguments.length) {
      l = Number(x);
      return force;
    }
    return l;
  };

  /**
   * Sets or gets the nodes that this force should apply to
   * forces (such as charge and drag forces) which may be applied globally,
   * spring forces are only applied between linked particles. Therefore, an
   * array of links must be specified before this force can be applied; the
   * links should be an array of {@link pv.Layout.Network.Link}s.
   *
   * @function
   * @name pv.Force.spring.prototype.links
   * @param {array} x the new array of links.
   * @returns {pv.Force.spring} this, or the current array of links.
   */
  /*force.nodes = function(x) {
    if (arguments.length) { // if setting
      nodes = x;
      kl = x.map(function(l) {
        return (l.value) ? (0.1 - Math.pow(0.3 / l.value, 2)) : 1;
      });
      return force;
    }
    return nodes; // if getting
  }; */

  /**
   * Applies this force to the specified particles.
   *
   * @function
   * @name pv.Force.spring.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this force.
   */
  force.apply = function(particles) {
    for (var a=particles; a; a = a.next) {
      var dx = a.x - a.homeX,
          dy = a.y - a.homeY,
          dn = Math.sqrt(dx * dx + dy * dy),
          dd = dn ? (1 / dn) : 1,
          ks = k, // * kl[i], // normalized tension
          kd = d, // * kl[i], // normalized damping
          kk = (ks * (dn - l) + kd * (dx * (a.vx) + dy * (a.vy)) * dd) * dd,
          fx = -kk * (dn ? dx : (.01 * (.5 - Math.random()))),
          fy = -kk * (dn ? dy : (.01 * (.5 - Math.random())));
      a.fx += fx;
      a.fy += fy;
    }
  };

  return force;
};




SpringyRadial = function() {
  pv.Layout.Network.call(this);
  this.changed = true;
};

/* clk: the "not needed" properties below are kept so that SpringyRadial
is code-compatible with the other layouts */

SpringyRadial.prototype = pv.extend(pv.Layout.Network)
    .property("changed", Boolean)      
    .property("bound", Boolean)        // XXX: not needed
    .property("iterations", Number)    // XXX: not needed
    .property("springLength", Number); // XXX: not needed
    //.property("springNodeLimit", Number);

SpringyRadial.prototype.defaults = new SpringyRadial()
  .extend(pv.Layout.Network.prototype.defaults)
  //.springNodeLimit(150)
  .springLength(20); // XXX: not needed

/**
 * Set the x, y, homeX, homeY, visible, alpha, len properties of the nodes.
 */
SpringyRadial.prototype.setNodeHomes = function(s) {
  var minLength = 80;     // The smallest allowed link length 
  var centerX = s.width / 2, centerY = s.height / 2;
  var defaultLength = Math.min(s.width/2, s.height/2) - 10;
  var p = 0.0; // padding on the borders
  
  // get the jazz data
  var mn = JazzMap.ui.network.getMainNode();
  var sessions = JazzMap.data.sessions.getSelectedSessions();
  var epicenter = JazzMap.ui.timeline.getEpicenterDate();
  var scores = JazzMap.layout.computeScoreDict(epicenter, sessions);

  var max_infl = 1.0;
  // divide by the local maximum (at this time point)
  for (var id in scores) {
      if (scores[id] > max_infl)
          max_infl = scores[id];
  }
  
  for (var i = 0, n; i < s.nodes.length; i++) {
    n = s.nodes[i];

    // reset the forces on the node
    n.fx = n.fy = n.vx = n.vy = 0.0;
    
    // the special case of the center node
    if (n == mn) {
      n.x = n.px = n.homeX = centerX;
      n.y = n.py = n.homeY = centerY;
      n.fix = new pv.Vector(n.x,n.y);
      continue;
    }
    
    var score = scores[n.id];

    score = 1 - score / max_infl;
    n.len = Math.max(minLength, defaultLength * score);

    // set the current position
    n.visible = true;
    n.x = centerX + Math.cos(n.angle) * n.len;
    n.y = centerY + Math.sin(n.angle) * n.len;

    // handle the case when the location is outside the window
    /*
     if (n.x < p) {
      n.y = centerY + (p - centerX) * (n.y - centerY) / (n.x - centerX);
      n.x = p;
    }
    else if (n.x > (s.width-p)) {
      n.y = centerY + (s.width - p - centerX) * (n.y - centerY) / (n.x - centerX);
      n.x = s.width - p;
    }
    else if (n.y < p) {
      n.x = centerX + (n.x - centerX) * (p - centerY) / (n.y - centerY);
      n.y = p;
    }
    else*/ if (n.y > (s.height-p)) {
      n.x = centerX + (n.x - centerX) * (s.height - p - centerY) / (n.y - centerY);
      n.y = s.height - p;
    }

    n.homeX = n.px = n.x;
    n.homeY = n.py = n.y;

    // save alpha and dim out the nodes that are far form the central node
    n.alpha = (defaultLength - n.len) / (defaultLength - minLength);
  }
  this.graphChanged(false);
};

SpringyRadial.prototype.graphChanged = function(x) {
    if (arguments.length) {
        this.changed = Boolean(x);
        return this;
    }
    return this.changed;
};


SpringyRadial.prototype.pauseSim = function(x) {

  if(this.$timer) {
    clearInterval(this.$timer);
    this.$timer = null;
    this.dragging = true;
  }
  return this;
};


/** Kickstart the simulation after its been paused. It might be that
  node positions & velocities have been changed during the pause, so we
  reset the countdown and take a few steps */
SpringyRadial.prototype.restartSim = function(x) {
  //console.log("restartSim");
  this.dragging = false;
  this.nodeMoved = true;
  this.countDown = 100;

  for (var f = this.binds.$force; f; f = f.next) {
      f.sim.step();
      f.sim.step();
  }

  if(!this.$timer && !this.dragging) {
    this.$timer = setInterval(this.updateFunction, 42);
  }
  return this;
};

SpringyRadial.prototype.buildImplied = function(s) {

  // must call the parent layout
  //pv.Layout.Network.prototype.buildImplied.call(this, s);
  if (pv.Layout.Network.prototype.buildImplied.call(this, s)) {
    var f = s.$force;
    if (f) {
       f.next = this.binds.$force;
       this.binds.$force = f;
    }
    if (!this.graphChanged()) return;
  } 
  if (this.graphChanged()) this.setNodeHomes(s);


  // Set up the simulation
  var sim = pv.simulation(s.nodes);

  sim.force(pv.Force.drag(0.1));

  sim.force(pv.Force.charge(-10)
    .domain(0, 40)
  );
 
  sim.force(HomeForce(0.5)
    .damping(0.2)
    .length(1)
  );

  sim.constraint(pv.Constraint.position());

  sim.constraint(pv.Constraint.bound()
    .x(6, s.width-6)
    .y(6, s.height-6)
  );
  
 /** @private Returns the speed of the given node, to determine cooling. */
  function speed(n) {
    return n.fix ? 0 : n.vx * n.vx + n.vy * n.vy;
  }

  /*for (var i = 1; i < 3; i++) {
    sim.step();
  }  
  sim.stabilize(); */

  
  // only add the simulation if there aren't too many nodes
  if (s.nodes.length < 150) {
      s.$force = this.binds.$force = {
        next: this.binds.$force,
        nodes: s.nodes,
        min:  1e-4,  //* (s.links.length + 1),
        sim: sim
      };
  } else {
    s.$force = this.binds.$force = null;
  }

  var that = this;
  this.updateFunction = function() {
        var render = false;
        for (var f = that.binds.$force; f; f = f.next) {
          if (that.countDown > 0 || pv.max(f.nodes, speed) > f.min) {
            if (that.countDown <= 0) {
                that.countDown = 100;
            } else that.countDown--;
            f.sim.step();
            render = true;
          }
        }
        if (render) that.render();
      };

  this.restartSim();

  //if (!this.$timer && !this.dragging) this.$timer = setInterval(this.updateFunction, 42);

};


SpringyRadial.prototype.refresh = function (nodes, links, centralNode, w, h) {
   /* do nothign for now */ 
};
