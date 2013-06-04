// define JazzMap namespace

JazzMap = function () {

  // collaborator, last node clicked on
  var lastCollaborator = null;

  var jazzLog = new Log();

	var getAngle = function (n, c) {
	  var dx = n.x - c.x;
	  var dy = n.y - c.y;
	  var phi = Math.atan(dy/dx);
	  phi = dx > 0 ? phi : Math.PI+phi;
	  return phi;
	};

  
//  graphSkin.highlightedNodeFont = graphSkin.selectedNodeFont;

  function parseIntLeadingZeros(s) {
      // remove leading 0s on any string and then parse the integer
      // parseInt does not support leading 0 (either treats them as octal or the whole # as 0)
      var i;
      for(i = 0; i < s.length && s[i] == "0"; i++) {}
      if (i == s.length) return 0; // str was all zeros
      return parseInt(s.substr(i));
  }

	return {
		// public variables
		phpPath : "php/mysql/",
		currentLeftDate : new Date(1850,1,1),
		currentRightDate : new Date(2050,1,1),
    	initializing : true,
		powerK: 1,
    	sliderOldValue: 10,
		
		/************************************************
		**
		** module for handling data: calling, parsing
		**
		************************************************/
		data: {},						
		
		/************************************************
		**
		** module for UI, event handling
		**
		************************************************/
		ui: {},
			
		//////////////////////////////////////////////////////
		//
		// functions
		//
		//////////////////////////////////////////////////////

    logEvent : function(status, message) {
      jazzLog.logEvent(status, message);
    },

    pushLog : function() {
      jazzLog.pushLog();
    },

    parseDate: function (s) {
        var ymd = s.match(/(\d+)/g);
        return new Date(
            parseIntLeadingZeros(ymd[0]), 
            parseIntLeadingZeros(ymd[1])-1,  // for some reason, months are 0-based
            parseIntLeadingZeros(ymd[2])
        );
    },		
		
		/**
		 * Get data for initial performer
		 * @returns
		 */
		init: function() {
      JazzMap.ui.details.buttons.initialize();
      // JazzMap.data.performers.getMusicianDetails(JazzMap.ui.network.getMainNode() );
      JazzMap.data.performers.loadEmails();
		},

	};

} ();
