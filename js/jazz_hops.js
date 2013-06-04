/**
**
** Hops slider in the header
**
**/
JazzMap.ui.hops = function () {
	// private vars and functions
	
	/* create slider */
	var createSlider = function () {
/*		slider = YAHOO.widget.Slider.getHorizSlider("sliderbg", "sliderthumb", 0, 100, 20);
		slider.subscribe('change', function (newOffset) {
			//alert("Thumb is now " + newOffset + " pixels from its starting position");
			var thumb = $("#sliderThumb");
			if (thumb !== undefined) {
				var hops = newOffset / 20 + 1;
				if (hops > 5) // show all
					thumb.innerHTML = 'all';
				else
					thumb.innerHTML = hops;
			}
		});
*/	};
	
	// public vars
	return {
		slider: null,
		
		// functions
		init: function () {
			createSlider();
		}
	};

} ();
