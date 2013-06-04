/************************************************
**
** Collaboration strength slider
**
************************************************/
JazzMap.ui.collab = function () {
	var origin = new Date('1950').getFullYear();
	
	return {
	
		getOrigin: function () {return origin;},
		
		init: function () {
			/*
			$("#slider").slider({ 
				min: 0,
				max: 100, 
				value: 50,
				step: 2,
				slide: function(event, ui) {
					// adjust slider value
					var sliderValue = $("#slider").slider("value");
					var msLeft = JazzMap.currentLeftDate.getFullYear();
					var msRight = JazzMap.currentRightDate.getFullYear();
					origin = msLeft + (msRight - msLeft) / 100 * sliderValue;
					
					//console.log(this.origin);
					JazzMap.layout.computeInfluenceScore(
							this.origin, 
							JazzMap.ui.network.getMainNode(), 
							JazzMap.data.sessions.getSessionData());
					JazzMap.updateGraphLayout();		
				}
			});
			*/
		}
	};
} ();
