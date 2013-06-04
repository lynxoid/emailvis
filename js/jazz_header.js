JazzMap.ui.header = function () {

  var sessID;

  //////////////////////////////////////////////////////////////////////////////
  //
  // public methods and variables
  //
  //////////////////////////////////////////////////////////////////////////////
  return {

    getFocusSessionID : function () {
      return sessID;
    },

    setFocusSessionID : function (id) {
      sessID = id;
    },

    initialize : function () {
      // pick a landmark session at random
      var count = $("#landmarkSessions option").length;
      var index = Math.round(1 + Math.random() * (count - 2));
      $('#landmarkSessions :nth-child(4)').attr('selected', 'selected')
      $('#landmarkSessions option').eq(index).attr('selected', 'selected');
      var values = $("#landmarkSessions").val();
      var parts = values.split(",");
      var perfID = parts[0],
              fname = parts[2],
              lname = parts[3];
      sessID = parts[1];

      var n = new Person(perfID, lname, fname);
      JazzMap.ui.network.centerOnNode(n);

      JazzMap.ui.header.dropdown.initialize();
      JazzMap.ui.header.searchBox.initialize();
    }

  };

} (); // self-invoking function




JazzMap.ui.header.searchBox = function () {

  //////////////////////////////////////////////////////////////////////////////
  //
  // public methods and variables
  //
  //////////////////////////////////////////////////////////////////////////////
  return {

    initialize : function () {
      // add them to the drop-down box
      $("#jazzCombo2").autocomplete(
          JazzMap.phpPath + "searchPerformers.php", {
            formatItem: function(item, i, p3, p4, p5) {
              //var obj = jQuery.parseJSON(item[0]);
              if (item.length > 3)
                return item[0] + " " + item[1] + " (" + item[3] + ")";
              else
                return item[0] + " " + item[1];
            },
            formatResult : function (item, i) {
              // parse result?
              //var obj = jQuery.parseJSON(item[0]);
              return item[0] + " " + item[1];
            },
            max:30,
            scroll:false /* causes some strange layout bug with sidebar if true... */
      });

      $("#jazzCombo2").result( function (event, item) {
          var node = new Person(item[2], item[1], item[0], null, 0, 0, 1);
      		JazzMap.ui.network.centerOnNode(node);
      });

      $("#jazzCombo2").click(function(d) {
        var t = $("#jazzCombo2").attr("value");
        if (t == "search for an artist" ) {
          $("#jazzCombo2").attr("value", "");
          $("#jazzCombo2").css("color", "black");
        }
      });
    }
  };

} (); // self-invoking function



JazzMap.ui.header.dropdown = function () {

  //////////////////////////////////////////////////////////////////////////////
  //
  // public methods and variables
  //
  //////////////////////////////////////////////////////////////////////////////
  return {

    initialize : function () {
  
      // event handler for dropdown
      $("#landmarkSessions").change(function () {
          var ids = $("#landmarkSessions").val();
          var parts = ids.split(",");
          var perfID = parts[0],
              sessID = parts[1],
              fname = parts[2],
              lname = parts[3];
          JazzMap.ui.header.setFocusSessionID(sessID);
          // console.log(parts);
          if (perfID < 1 || sessID < 1)
              return;
          // switch players if need to
          if (JazzMap.ui.network.getSelectedID() == perfID) {
              JazzMap.ui.timeline.navigateTo(sessID, true);
          }
          else {
              // TODO: set to Person()
              JazzMap.ui.network.centerOnNode(new Person(perfID, lname, fname));
          }
      });
    }
  };

} (); // self-invoking function
