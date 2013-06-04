/**
* Handle calls for data
*/

JazzMap.data.sessions = function () {
	/////////////////////////////////////////////
	//
	// private methods
	//
	/////////////////////////////////////////////

  function Session(id, date, city, people) {
      this.sessionId = id;
      this.dateStr = (date)?date:null;
      this.dateDate = (date)?JazzMap.parseDate(date):null;
      this.dateFloat = (date)?JazzMap.ui.timeline.dates.convert2Float(this.dateDate):null;
      this.city = (city)?city:null;
      this.people = (people)?people:null;
      // add links back to the session for each person object
      if (this.people != null) {
        for (var p in this.people) {
          people[p].addSession(this);
        }
      }
  }

  // add a person to the of people playing in this session
  Session.prototype.addPerson = function(id, fName, lName, action) {
//      console.log("adding person to a session");
      this.people.push({
          playerId: id, 
          firstName: fName, 
          lastName: lName, 
          action: action
      });
  };

  Session.prototype.guyPresent = function(id) {
      if (!this.people) return false;

      for(var p_id in this.people) {
          if (p_id == id) return true;
      }
      return false;
  }


  function getSessionDescription(s) {
      var str = "<p style='text-align:left'>";
      if (s.approxDate == true)
        str += "~" + s.freeDate;
      else
        str += JazzMap.ui.timeline.dates.dateString(s.dateDate);
      if (s.city)
        str += ", " + s.city;

      // translate id's to names
      var mainNode = JazzMap.ui.network.getMainNode();
      str += "</p><hr style='height:0,padding:0'><p style='text-align:left'><b>"
             + mainNode.nodeName + "</b> (";

      // add main guy's instruments
      var instruments = mainNode.instruments;
      if (instruments && instruments != null) {
        for (var i = 0; i < instruments.length; i++)
          str += JazzMap.data.instruments.getInstrumentAbbrev(instruments[i]) + ",";
          // str += instruments[i] + ",";
        str = str.substring(0, str.length-1); // chop off last comma
        str += "), ";
      }
      else {
        str = str.substring(0, str.length-2); // chop off last two chars
        str += ", ";
      }

      // for each person, add their name, instruments
      for (var p in s.people) {
        if (p != mainNode.id) {
          var node = s.people[p];
          instruments = node.instruments;
          str += node.nodeName + " (";
          // parse instruments
          for (var i = 0; i < instruments.length; i++)
              str += JazzMap.data.instruments.getInstrumentAbbrev(instruments[i]) + ",";
          str = str.substring(0, str.length-1); // chop off last comma
          str += "), ";
        }
      }
      str = str.substring(0, str.length-2);   // chop off last comma and space
      str += "</p>";

      return str;
  }

	/* an array of arrays of session objects. each session object has 4 items:
		0 - date
		1 - sess id
		2 - description
		3 - people list
	*/
	var sessionData;

  var selectedSessions;

  var filterSessionData = function () {
    //console.log("filterSessionData");
		var startDate = JazzMap.ui.timeline.getRangeStart();
		var endDate = JazzMap.ui.timeline.getRangeEnd();

    //console.log("Dates", startDate, endDate);
		
		var arr = [];
		if (startDate && endDate && sessionData) {	
      for (i = 0; i < sessionData.length; i++) {
        if (sessionData[i].dateDate <= endDate && sessionData[i].dateDate >= startDate)
          arr.push(sessionData[i]);
      }
		}
		$("#visSessCount").html(arr.length);

		// update performers list to contain only performers for these sessions
    selectedSessions = arr;
    //console.log("selectedSess", selectedSessions.length);
		JazzMap.data.performers.updatePerformers(arr);

		return arr;
	}
	
	/////////////////////////////////////////////
	//
	// public methods
	//
	/////////////////////////////////////////////
	return  {

    getEmailEvents : function () {

    },

		filterSessionData : filterSessionData,

    getSelectedSessions : function () {
      if (selectedSessions)
        //console.log("getSelectedSessions", selectedSessions.length);
      return selectedSessions;
    },
		
		// public variables
		getSessionData: function () {return sessionData;},
		
		sessionCount: 0,
		
		// public methods
		getSessions: function (id) {
			$("#totalSessCount").html('<font color="red">...</font>');
			$("#visSessCount").html('<font color="red">...</font>');
			
			if (id == null || id < 0) return;
			var queryString = "performerID=" + id;
			
			$.ajax({
				url: 		JazzMap.phpPath + "getSessionData.php",
				data: 		queryString, 
				dataType: 	"json",
				method: 	"get",
				success: 	function(data, textStatus, XMLHttpRequest) {
            if ('sqlerror' in data) {
              alert('SQL error:' + data.sqlerror);
            }

            sessionData = new Array();
            for (var i = 0; i < data.events.length; i++) {
              var people = JazzMap.data.performers.parsePeople(data.events[i][3]);
              var j = 0;
              for (var id in people) j++;
              var s = new Session(
                  data.events[i][1],  /* id */
                  data.events[i][0],  /* date */
                  data.events[i][2],  /* city */
                  people             /* people with their instruments */
                );
              s.pplCount = j;
              if (data.events[i].length > 4) {// date is approximate
                s.approxDate = true;
                s.freeDate = data.events[i][4];
              }
              s.description = getSessionDescription(s);
              sessionData.push(s);
            }
            $("#totalSessCount").html(sessionData.length);

            //sessionData = data.events;
            selectedSessions = sessionData;
            filterSessionData();
            var sessID = JazzMap.ui.header.getFocusSessionID();
            if (JazzMap.initializing) {
              JazzMap.ui.timeline.initData(sessionData);
              JazzMap.ui.timeline.navigateTo(sessID, true);
            }
            else {
              JazzMap.ui.timeline.update(sessionData);
              JazzMap.ui.timeline.navigateTo(sessID);	
            }
            JazzMap.initializing = false;
            JazzMap.data.performers.updatePerformers(selectedSessions);
            // JazzMap.data.performers.getPerformers(JazzMap.getSelectedID());
            JazzMap.similar.updateSim(sessionData);

            // hide loading logo
            $("#loadingDiv").css("display", "none");
        },

        error:  function (XMLHttpRequest, textStatus, errorThrown) {
            alert('Could not load sessions.\nError: ' + textStatus +' ' + errorThrown);
        }
      });
    }
	};
} ();
