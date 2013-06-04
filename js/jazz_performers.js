
/**
*  Handle calls for performers - getting data, parsing
*/
JazzMap.data.performers = function () {
	/////////////////////////////////////////////
	//
	// private methods
	//
	/////////////////////////////////////////////

  /* array of collaborators */
	var collaborators;

  var max_infl = 0.0;

	var parsedNodes;	
	
	/******************************************************
	*
	* Convert an array of collaborators to protovis nodes
	*
	******************************************************/
	var parseNodes = function (data) {
	    var nodes = new Array();
	    var i, n = data.length;
	    var angle = 0;
	    var p;

	    for (i = 0; i < n; i++) {
		    nodes[i] = new Person(
	            data[i][0], /* id */
	            data[i][2], /* last name */
	            data[i][1], /* first name */
	            null,       /* session ids */
	            data[i][3], /* session count */
	            parseFloat(data[i][4]),  /* angle */
	            parseFloat(data[i][5])  /* influence */);
	      nodes[i].order = i;
	    }
	    return nodes;
	};

	/****************************************************** 
	*
	* build a star graph w/ center node in the center and every node in peripherals
	* connected to it
	*
	*******************************************************/
	var getStarGraph = function (center, peripherals) {
		var links = new Array();
		var i, n = peripherals.length;
		for (i = 0; i < n; i++) {
			links[i] = {
				sourceNode: center, 
				targetNode: peripherals[i], 
                value: 0.1 /*clk: fernando requested all lines be really thin */
				/* value: Math.min(peripherals[i].session_count, 20) */
			};
		}
		
		return links;
	};

  var updatePerformers = function(sessions) {
      if (!parsedNodes) return;
      // console.log("updatePerformers");

      var pplInSess = {}, sess2Ppl = {}, 
          s, 
          mainNode = JazzMap.ui.network.getMainNode();
      var nodes = new Array();
      for (var i = 0; i < sessions.length; i++) {
        s = sessions[i];
        for (var id in s.people) {
          if (id != mainNode.id)
            pplInSess[id] = s.people[id];
        }
      }

      // go through dictionary and add every a Person
      for (var id in pplInSess)
        nodes.push(pplInSess[id]);

			len = nodes.length;
			// update count
			$("#visCollabCount").html(len);

			JazzMap.ui.network.nodes = nodes;
			JazzMap.ui.network.links = getStarGraph(JazzMap.ui.network.getMainNode(), JazzMap.ui.network.nodes);
			
			// add main node
			JazzMap.ui.network.nodes[len] = JazzMap.ui.network.getMainNode();

			//console.log(JazzMap.nodes[0].id, JazzMap.nodes[len].id);

			// update layout
			if (JazzMap.ui.network.forceLayout !== undefined ) {
				JazzMap.ui.network.forceLayout.graphChanged(true);
        		JazzMap.ui.network.forceLayout.reset();
				JazzMap.ui.network.forceLayout// = vis.add(pv.Layout.Force)
					.nodes(JazzMap.ui.network.nodes)
					.links(JazzMap.ui.network.links);
				
//				var w = $("#networkDiagramDiv").width();
//				var h = $("#networkDiagramDiv").height();
//  			vis.width(w).height(h);
			}
		
			vis.render();
		}
	
	/***
	*
	* Retrieves an array of row objects (id, f_name, l_name) of people
	* who collaborated w/ <code>id</code> person within startDate-endDate
	* period. Dates may be left null, then the function retrieves all
	* collaborators.
	* Updates nodes, links to be a star graph w/ mainNode in the center.
	* Calls vis.render() to update the net vis.
	*
	***/
	var getCollaborators =  function (id) {
		
		JazzMap.logEvent("INFO", "getCollaborators " + id);
		var queryString;
		$("#totalCollabCount").html();

		queryString = "performerID=" + id + '&startDate=null&endDate=null';
		//alert("collab queryStr: " + queryString);
		
		// jQuery async call
		$.ajax({
			  url: 			JazzMap.phpPath + "getCollaborators.php",
			  data: 			queryString,
			  dataType: 		"json",
			  method: 		"get",
			  success: 		function(data, textStatus, XMLHttpRequest) {				
				// parse data
				collaborators = parsedNodes = parseNodes(data.array);
				

				  if (collaborators != null)
				    $("#totalCollabCount").html(collaborators.length);
				  else
				    $("#totalCollabCount").html(0);
				  JazzMap.data.sessions.getSessions(id);
			  },
			
			  error: function (XMLHttpRequest, textStatus, errorThrown) {
        		JazzMap.logEvent("ERROR", "getCollaborators " + testStatus + " " + errorThrown);
				    alert('Could not load musicians.\nError: ' + textStatus +' ' + errorThrown);
				    JazzMap.nodes = new Array();
				    JazzMap.nodes[0] = JazzMap.ui.network.getMainNode();
				    JazzMap.links = new Array();
				    JazzMap.links[0] = {sourceNode: JazzMap.ui.network.getMainNode(), targetNode: JazzMap.ui.network.getMainNode()};
				
				    // update forceLayout-directed layout
				    if (JazzMap.forceLayout != null) {
					    JazzMap.forceLayout
						    .nodes(JazzMap.nodes)
						    .links(JazzMap.links);
					    JazzMap.forceLayout.reset();
					
					    var w = $("#networkDiagramDiv").width(),
					    h = $("#networkDiagramDiv").height();
					    JazzMap.forceLayout.refresh(JazzMap.nodes, JazzMap.links, JazzMap.ui.network.getMainNode(), w, h);
				    }
				    vis.render();
			  }
		});
	};

  /**
  * Parse people - match people ids w/ people
  */
  function parsePeople2Dict(rawPeopleArray) {
    if (collaborators == null)
      // TODO: wrap into Person obj anyway
      return rawPeopleArray;
    var parsed = {};
    var i = 0, j = 0, p, len = collaborators.length;

    // match up with main node first
    var mainNode = JazzMap.ui.network.getMainNode();
    for (var id in rawPeopleArray) {
      if (id == mainNode.id) {
        mainNode.setInstruments(rawPeopleArray[id]);
        parsed[id] = mainNode;
        break;
      }
    }

    // parse everyone else
    for (i = 0, j = 0; i < len; i++) {
      p = collaborators[i];
      for (var id in rawPeopleArray) {
        if (id == p.id) {
          j++;
          p.setInstruments(rawPeopleArray[id]);
          parsed[p.id] = p;
          break;
        }
      }
    }
    return parsed;
  }



// input: array of objects with from, to, date fields
// creates a Node for each email address
// returns an Array of nodes
function parseEmails(data) {
	var uniqueAddresses = {};
	var i, n = data.length, theirEmail;
	for (i = 0; i < n; i++) {
		theirEmail = data[i]["from"];	// they sent me an email
		date = data[i]["date"];
		if (theirEmail == myEmail) {
			theirEmail = data[i]["to"]; // i sent them the email
		}
		if (!uniqueAddresses has theirEmail )
			uniqueAddresses[theirEmail] = new Array();
		uniqueAddresses[theirEmail].append(date);
	}

	var nodes = new Array();
    var angle = 0, delta = 360 / uniqueAddresses.length;
    var p;
    var nextID = 1;

    // TODO: compute angles and max influence

    for (var email in uniqueAddresses) {
	    nodes[i] = new Person(
            nextID, /* id */
            "", /* last name */
            email, /* first name */
            null,       /* session ids */
            uniqueAddresses[email].length, /* session count */
            parseFloat(angle),  /* angle */
            parseFloat(30)  /* influence */);
      nodes[i].order = i;
      nextID += 1;
      angle += delta;
    }
    return nodes;
};

	/////////////////////////////////////////////
	//
	// public methods
	//
	/////////////////////////////////////////////
	return {

	    loadEmails: function () {
			// TODO: process sample_data
			var main_node = new Person();
			// build a list of unique people (correspondents)

			// TODO: parse email senders/recipients
			collaborators = parsedNodes = parseEmails(JazzMap.data.sample_data);
			if (collaborators != null)
				$("#totalCollabCount").html(collaborators.length);
			else
				$("#totalCollabCount").html(0);

			// create sessions (email = session)
			JazzMap.ui.sessions.getEmailEvents();
	    },
		
		/***
		*
		* 
		*
		***/
	    createPerson : function (id, lname, fname, sessions, sess_count, angle, infl) {
	      return new Person(id, lname, fname, sessions, sess_count, angle, infl);
	    },

		getPerformers: function (id) {
			$("#totalCollabCount").html('<font color="red">...</font>');
			$("#visCollabCount").html('<font color="red">...</font>');

			// get collaborators, update nodes and links, vis.render()	
			getCollaborators(id);
		},

		updatePerformers : updatePerformers,

	    parsePeople : parsePeople2Dict,

	    getMaxInfluence : function () { return max_infl; },

	    /******************************************************
		* Find person in collaborators array by their id
		******************************************************/
		getNameByID : function (id) {
			if (!collaborators)
				return null;
			for (var i = 0; i < collaborators.length; i++) {
				p = collaborators[i];
				if (p.id == id)
					return p;
			}
			return null;
		}
 	};
	
} ();
