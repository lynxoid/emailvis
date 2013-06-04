/**
* Sets the default selectedID, calls a function to get collaborators for 
* default musician, creates a timeline.
**/
function onLoad() {	
  JazzMap.init();
  updateSize();
  placeLoadingLogo();
};

function placeLoadingLogo() {
  var ww = $(window).width();
  var hw = $(window).height();
  var footer_h = $("#footer").height();
  var header_h = $("#header").height();
  var sidebar_w = $(".detailsPanelDiv").width();

  var load_w = $("#loadingDiv").width();
  var load_h = $("#loadingDiv").height();

  var node = JazzMap.ui.network.getMainNode();
  $("#loadingDiv").css("left", (ww-sidebar_w-load_w-50)/2);
  $("#loadingDiv").css("top", (hw-footer_h-header_h)/2);
}

/** Called when the window is resized */
var resizeTimerID = null;

function onResize() {
   updateSize();
};

function updateSize() {
  // get page size
  // make #content height = window - footer - header
  var ww = $(window).width();
  var hw = $(window).height();
  var padding_top = parseInt($("#header").css("padding-top").replace("px", ""));
  var padding_bottom = parseInt($("#header").css("padding-bottom").replace("px", ""));
  var border_top = parseInt($("#header").css("border-top-width").replace("px", ""));
  var border_bottom = parseInt($("#header").css("border-bottom-width").replace("px", ""));

  var footer_h = $("#footer").height();
  var header_h = $("#header").height() + padding_top + padding_bottom + border_top + border_bottom;
  var sidebar_w = $(".detailsPanelDiv").width();
  var timeline_h = $("#my-timeline").height();

  var newContentWidth = ww - sidebar_w;

  $("#content").width(ww);
  $("#content").height(hw) // - footer_h - header_h);

  var w = $("#networkDiagramDiv").width();
  $("#networkDiagramDiv").width(ww);
  
  vis.width(newContentWidth - 50)
     .height(hw - footer_h - header_h);
  vis.render();

  JazzMap.ui.timeline.resize(ww, timeline_h);
  JazzMap.ui.network.forceLayout.reset();
  JazzMap.ui.network.forceLayout.graphChanged(true);

  JazzMap.ui.details.updateDetailsPanelLocation(header_h);

  $("#sliderDiv").css("background", "#dd7733");
  $("#sliderDiv").css("top", (hw - timeline_h - 12) + "px");
}
