/**
 * Set the layout for the stars. This computes the node positions.
 * Currently, the layout does not use any 'force' --- buildImplied just
 * sets the node positions.
 **/

MyForceLayout = function() {
  pv.Layout.Network.call(this);

  /* The next line sets the edge width to be related to the # of sessions */
  this.link.lineWidth(function(d, p) { return Math.sqrt(p.linkValue) * 1.5; });
};

MyForceLayout.prototype = pv.extend(pv.Layout.Network)
    .property("bound", Boolean)
    .property("iterations", Number)
    .property("springLength", Number);
	
// default values
MyForceLayout.prototype.defaults = new MyForceLayout()
    .extend(pv.Layout.Network.prototype.defaults)
    .springLength(20);


/** @private Assign node positions */
MyForceLayout.prototype.buildImplied = function(s) {
    /* Any cached interactive layouts need to be rebound for the timer. */
    if (pv.Layout.Network.prototype.buildImplied.call(this, s)) {
        var f = s.$force;
        if (f) {
          f.next = this.binds.$force;
          this.binds.$force = f;
        }
        return;
    } 
	 
  // set node positions based on influence
  if (s.links) {
	var minLength = 80;     // The smallest allowed link length 
	var centerX = s.width / 2, centerY = s.height / 2;
	var defaultLength = Math.max(s.width/2, s.height/2) - 50;

	var p = 10.0; // padding on the borders
	var mn = JazzMap.ui.network.getMainNode();

	var sessions = JazzMap.data.sessions.getSelectedSessions();
  var epicenter = JazzMap.ui.timeline.getEpicenterDate();
  var scores = JazzMap.layout.computeScoreDict(epicenter, sessions);

	var link_length;
	var n;

	for (var i = 0; i < s.links.length; i++) {
		link_length = minLength;
		n = s.links[i].sourceNode == mn ? 
		    s.links[i].targetNode : s.links[i].sourceNode;

        // use influence score
        /*
        var score = JazzMap.layout.computeNormedScore(
	            JazzMap.ui.timeline.getEpicenterDate(),
	            n,
	            sessions
	        );
        */
        var score = scores[n.id];

        var max_infl = JazzMap.data.performers.getMaxInfluence();
        score = 1 - score / max_infl;

        link_length = Math.max(minLength,defaultLength * score);
		
		n.x = centerX + Math.cos(n.angle) * link_length;
		n.y = centerY + Math.sin(n.angle) * link_length;

		/*
		if (n.x < p || n.x > (s.width-p) || n.y < p || n.y > (s.height-p))
		  n.visible = false;
		else
		  n.visible = true;
		*/
		
		n.visible = true;

 		if (n.x < p) {
		  n.y = centerY + (p - centerX) * (n.y - centerY) / (n.x - centerX);
		  n.x = p;
		}
		else if (n.x > (s.width-p)) {
		  //n.x = s.width - 10;
		  n.y = centerY + (s.width - p - centerX) * (n.y - centerY) / (n.x - centerX);
		  n.x = s.width - p;
		}
		else if (n.y < p) {
		  // n.y = 10;
		  n.x = centerX + (n.x - centerX) * (p - centerY) / (n.y - centerY);
		  n.y = p;
		}
		else if (n.y > (s.height-p)) {
		  n.x = centerX + (n.x - centerX) * (s.height - p - centerY) / (n.y - centerY);
		  n.y = s.height - p;
		}
		
		n.len = link_length;
//		var minLen = 75;
//		var maxLen = Math.max(vis.width()/2, vis.height()/2);

		// save alpha and dim out the nodes that are far form the central node
		var alpha = (defaultLength - link_length) / (defaultLength - minLength);
		n.alpha = alpha; 
	}

	mn.x = centerX;
	mn.y = centerY;
  }

};


// referesh layout
MyForceLayout.prototype.refresh = function (nodes, links, centralNode, w, h) {
   /* do nothign for now */ 
};

