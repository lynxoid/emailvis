JazzMap.ui.details = function () {

  //////////////////////////////////////////////////////////////////////////////
  //
  // public methods and variables
  //
  //////////////////////////////////////////////////////////////////////////////
  return {

    updateDetailsPanelLocation : function (top) {
      var detail_w = $("#detailsPanel").width();
      $("#detailsPanel").css("top", top);
      $("#detailsPanel").css("right", "0px");
    }

  };

} (); // self-invoking function

JazzMap.ui.details.buttons = function () {

  //////////////////////////////////////////////////////////////////////////////
  //
  // private methods and variables
  //
  //////////////////////////////////////////////////////////////////////////////
  var initializeFullScreenBtns = function () {
    // init full screen button
    $("#goFullScreen").click(function() {              
      $("#goFullScreen").attr("disabled","disabled");  // gray out somehow
      $("#goFullScreen").css("background-color", "red");
      JazzMap.parentWindow = window.self;
      JazzMap.window = window.open("http://localhost/jazzmap/prototype3-protovis/start.php", '', 'fullscreen=yes');
      $(JazzMap.window.document).ready( function () {
        $(JazzMap.window.document).contents().find("#goFullScreen").attr("disabled", "disabled");
        $(JazzMap.window.document).contents().find("#goFullScreen").css("background-color", "red");
      })
    });

    // init exit full screen button
    $("#exitFullScreen").click(function () {
      // JazzMap.window.close();
      $("#goFullScreen").removeAttr("disabled");  // gray out somehow
      $(JazzMap.parentWindow.document).contents().find("#goFullScreen").css("background-color", "green");
      window.self.close();
    });
  };

  var initializePlayerViewBtns =  function () {
    // TODO
  };

  var initializeHelpBtn = function () {
    $("#helpWindow").dialog("close");
    $("#helpBtn").click( function () {
        showHelpWindow();
    });
    $("#helpWindow").dialog("close");
  };

  var showHelpWindow = function () {
    var w = 870;
    var h = 600;
    var left = $("#content").width() / 2 - w/2;
    var tempH = $("#content").height();
    var top = tempH/2 - h/2;

    var dialog = $("#helpWindow")
        .dialog({
            title: "Quick Start Guide",
            resizable: false,
            draggable: true,
            collapsed: false,
            closeOnEscape: true,
            modal: false,
            height: h,
            width: w,
            position: [left, top],
        });

  };

  //////////////////////////////////////////////////////////////////////////////
  //
  // public methods and variables
  //
  //////////////////////////////////////////////////////////////////////////////
  return {

    /* initialize the buttons */
    initialize : function () {
      initializeFullScreenBtns();
      initializePlayerViewBtns();
      initializeHelpBtn();
    }

  };

} (); // self-invoking function
