/**
Compute similarities
*/
JazzMap.similar = function () {
	
	/////////////////////////////////////////////
	//
	// private methods
	//
	/////////////////////////////////////////////
	
	/* calculate session similarities */
	var computeSim = function (sess) {
		var count;
		var people1, people2;
		
		similarities = new Array();				// clear
		similarities[0] = {x: 1940, y: 0.0};	// set initial point
		
		// calculate similarities
		for (var i = 0; i < sess.length - 1; i++) {
			count = 0;
			// jaccard
			people1 = sess[i].people;
			people2 = sess[i+1].people;
			
			if (people1 == null || people2 == null)
				continue;
			
			for (var j = 0; j < people1.length; j++) {
				for (var k = 0; k < people2.length; k++) {
					if (people1[j] == people2[k])
						count++;
				}
			}
			
			similarities[i + 1] = {
				x: sess[i+1].date, 
				y: count / (people1.length + people2.length - count) 
			};
		}
		
		// TODO: update graph
	};
	
	// public methods, variables
	return {
		//////////////////////////////////////////
		//
		// public variables 
		// accessible as JazzMap.similarityModule.<variable>
		//
		//////////////////////////////////////////
		
		similarities: new Array(),
		
		//////////////////////////////////////////
		//
		// public functions
		//
		//////////////////////////////////////////
		
		/* initialize some stuff */
		init: function () {
			// TODO
		},
		
		/* update similarities given a new set of sessions */
		updateSim: function (sess) {
			computeSim(sess);
		}
		
	};	// end of public part

}  (); // parens cause this anonymous function to execute and return. sweet!
