JazzMap.data.instruments = function () {

  // dicitonary of instrument IDs to abbreviaitons
  var instruments;

  // get instrument ids, abbreviations
  var getInstrumentsDict = function() {
    // request details on the guy
    $.ajax({
        url: 			JazzMap.phpPath + "getInstruments.php",
        dataType: 		"json",
        method: 		"get",
        success: 		function(data, textStatus, XMLHttpRequest) {
            instruments = data;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            JazzMap.logEvent("ERROR", "getInstrumentsDict " + testStatus + " " + errorThrown);
            instruments = null;
            alert("Could not get instruments.\n" + textStatus + "\n" + errorThrown);
        }
    });
  };


  return {

    initialize :  function () {
      getInstrumentsDict();
    },

    getInstrumentAbbrev : function (id) {
      if (!instruments)
        return null;
      return instruments[id];
    }

  };


} ();
