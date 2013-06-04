JazzMap.ui.network = function () {

  // Node object for the main guy
  var mainNode = new Person(0, "", "You", null, 6, 0, 1);

  // node that last was active and shown details for
  var activeNode;

  // ID for the currently selected central guy
  var selectedID = mainNode.id;

  var graphSkin = {
      centerNodeColor: "rgb(254, 98, 98)",
      centerNodeBorderColor: "rgb(218, 97, 97)",
      centerNodeSize: 85,
      centerNodeFont: "24px 'Viga', sans-serif",
      centerNodeLabelColor: "rgb(51,51,51)",
      selectedNodeColor: "rgb(254, 214, 105)",
      selectedNodeBorderColor: "rgb(254, 214, 120)",
      selectedNodeSize: 25,
      selectedNodeFont: "16px 'Viga', sans-serif",
      selectedNodeLabelColor: "rgb(64, 64, 64)",
      highlightedNodeColor: "rgb(252, 253, 121)",
      highlightedNodeBorderColor: "rgb(241, 241, 89)",
      highlightedNodeSize: 25,
      highlightedNodeLabelColor: "rgb(64, 64, 64)",
      highlightedNodeFont: "16px 'Viga', sans-serif",
      nodeColor: "rgb(170, 238, 252)",
      nodeBorderColor: "rgb(197, 226, 236)",
      nodeSize: 20,
      nodeFont:"11px 'Viga', sans-serif",
      nodeLabelColor: "rgb(130, 130, 130)",
      linkColor: "black",
      linkAlpha: 0.5,
      nodeLabelAlign: "center"
  };

  var isLabelVisible = function (d) {
    var h = vis.height();
    var w = vis.width();
    var half = Math.min(h/2, w/2) - 30;
    if (JazzMap.ui.network.nodes.length > 300) // hide some
      if (d.order % 2 == 0 && d != mainNode && d.len > half)
        return false;
    return d.visible || d==mainNode;
  };

  var isEdgeVisible = function (d) {
    return d.inside && d.visible;
  };

  var isNodeDimmed = function (d) {
    return !d.inside && d!=mainNode;
  };

  var isEdgeDimmed = function (d) {
    return !d.inside || !d.visible;
  };

  // returns default node size in px
  var getDefaultSize = function (d) {
    if (d == mainNode) return 85;
    if (d.isHighlighted) return 25;
    if (d.active) return 25;
    return 20;
  }

  // make a node active
	var active = function (d) {
		if (activeNode) {
			if (activeNode == d) {
				v = !activeNode.active;
			}
			else {
				activeNode.active = false;
				v = true;
				activeNode = d;
			}
		}
		else {
			v = true;
			activeNode = d;
		}
		d.active = v; if (d.parentNode) active(d.parentNode);
		vis.render();	// force an update
	};

	/**
	* Update the combo's selected item
	*/
	var updateSelectedElement = function (id, name) {
		  var combo = $("#jazzCombo2");
		  combo.value = name;
      $("#musicianName").html(name);
	};
	
	/**
	* Makes the node a central node, requests all of its collaborators
	* over the selected date range and shows them in a star graph.
	**/
  var centerOnNode = function (node) {
    // do not update if it is the main node itself
    if (mainNode == node)
      return;

    // update node's home location
    var old_x = node.homeX;
    var old_y = node.homeY;
    var old_fx = node.fx;
    var old_fy = node.fy;
    node.x = node.homeX = mainNode.x;
    node.y = node.homeY = mainNode.y;
    node.fx = mainNode.fx;
    node.fy = mainNode.fy;
    mainNode.x += 30;//mainNode.homeX = old_x;
    mainNode.y += 30;//mainNode.homeY = old_y;
    mainNode.fx = old_fx;
    mainNode.fy = old_fy;

    // set as main node
    mainNode = node;
    selectedID = node.id;

    // remove old nodes
    nodes = new Array();
    links = new Array();

    // put main node in the center
    nodes[0] = mainNode;
    links[0] = {
      sourceNode: nodes[0], 
      targetNode: nodes[0], 
      value: 4
    };

    updateSelectedElement(selectedID, node.nodeName);
    JazzMap.ui.network.updateGraphLayout();
    // JazzMap.ui.network.setMainNode(node);


    $("#detailsSessCnt").html("");
    $("#sessionPartnerDetails").html("");
    $("#musPhotoIMG").attr("src", JazzMap.phpPath + "view.php?id=" + node.id);
    $("#musPhotoIMG").attr("title", node.nodeName);

    // show loading icon
    var w = $("#loadingDiv").width();
    var h = $("#loadingDiv").height();
    $("#loadingDiv").css("left", mainNode.x -w/2);
    $("#loadingDiv").css("top", mainNode.y);
    $("#loadingDiv").css("display", "block");

    // call data providers    

    JazzMap.data.performers.getMusicianDetails(node);
    JazzMap.data.performers.getPerformers(selectedID);
	};

  //////////////////////////////////////////////////////////////////////////////
  //
  //  Public variables and functions
  //
  //////////////////////////////////////////////////////////////////////////////
  return {

    nodes: null,
    links: null,
    forceLayout: null,    // force layout instance

    centerOnNode : centerOnNode,

    getMainNode: function () {
      return mainNode;
    },

//		setMainNode: function (node) {
//      $.jql.info(node.id, "setMainNode");
//      mainNode = node;
//			centerOnNode(node);
//		},

    getSelectedID: function () {
      return selectedID;
    },

//		setSelectedID: function (id) {
//			selectedID = id;
//		},

    highlightMusicians : function (people) {
      var i, j, len2 = this.nodes.length;
      for (j = 0; j < len2; j++)
        for (var p_id in people)
          if (this.nodes[j].id == p_id) {
            this.nodes[j].isHighlighted = true;
            break;
          }
      vis.render();
    },

    removeHighlight : function () {
      var i, j, len = this.nodes.length;
      for (i = 0; i < len; i++)
        this.nodes[i].isHighlighted = false;
      vis.render();
    },

    selectMusicians : function (people) {
      var i, j, len2 = this.nodes.length;
      // remove selection from prev 
      for (i = 0; i < len2; i++)
        this.nodes[i].active = false;

      // add new selection
      for (var p_id in people)
        if (people[p_id] != this.getMainNode() )
          people[p_id].active = true;
      vis.render();
    },

    deselectMusicians : function (people) {
      for (var p_id in people)
        people[p_id].active = false;
      vis.render();
    },

    deselectAllMusicians : function () {
      var people = this.nodes;
      for (var p_id in people)
        people[p_id].active = false;
      vis.render();
    },

    /************************************************************************
    *************************************************************************

    Initialize graph rendering 

    *************************************************************************
    ************************************************************************/
    initialize : function (vis) {
      this.nodes = new Array();
      this.links = new Array();

      this.nodes[0] = mainNode;
      this.links[0] = {
        sourceNode: this.nodes[0], 
        targetNode: this.nodes[0], 
        value: 4
      };

      this.forceLayout = vis.add(SpringyRadial) // MyForceLayout) //SpringyRadial)
	      .nodes(this.nodes)
	      .links(this.links)
	      .springLength(200)
	      .bound(true);
				
      this.forceLayout.link.add(pv.Line)
	      .fillStyle(graphSkin.linkColor)
	      .visible(function(d1, d2) { return isEdgeVisible(d2.targetNode);} )
	      .strokeStyle(function (d1, e) {
	        var o = this.fillStyle();
	        return o.alpha(graphSkin.linkAlpha);
	      });
			
      this.forceLayout.iterations = 1;

      var that = this;

      // display images as nodes
      this.forceLayout.node.add(pv.Image)
      .url(function(d) {
          var host = "css/images/";
          if (d == mainNode )
            if (d.active)
            return host + "main_node_active.png";
            else
            return host + "main_node.png";
          if (d.isHighlighted || vis.i() == d.index)
            return host + "roll_node.png";
          if (d.active)
            return host + "select_node.png";
          return host + "reg_node.png";
      })
      .imageWidth(getDefaultSize)
      .imageHeight(getDefaultSize)
      .width(getDefaultSize)
      .height(getDefaultSize)
      .left(function (d) {return d.x - getDefaultSize(d)/2;})
      .top(function (d) {return d.y - getDefaultSize(d)/2;})
      .fillStyle(null)
      .strokeStyle(null)
      .cursor("pointer")
      .title(function(d) {return d.nodeName + " (" + d.session_count + ")"; })
      .event("mousedown", pv.Behavior.drag())
      .event("drag", function(d) {
          if (d.x < mainNode.x + 40 && d.x > mainNode.x - 40 &&
            d.y < mainNode.y + 40 && d.y > mainNode.y - 40)
            mainNode.active = true;
          else
            mainNode.active = false;
          return JazzMap.ui.network.forceLayout;
      })
      .event("dragstart", function (d) { 
        JazzMap.logEvent("INFO", "dragStart node " + d.id);
        this.draggingNode=true; 
        //this.forceLayout.draggedNode=this;
      })
      .event("dragend", function (d) { 
        this.draggingNode=false;

        if (d.x < mainNode.x + 40 && d.x > mainNode.x - 40 &&
            d.y < mainNode.y + 40 && d.y > mainNode.y - 40) {
          console.log("update Main node to " + d.nodeName);
      //            d.x = mainNode.x;
      //            d.y = mainNode.y;
          centerOnNode(d);
          JazzMap.ui.network.forceLayout.restartSim();
        }
        else {
          d.homeX = d.x;
          d.homeY = d.y;
        }
        //this.forceLayout.draggedNode=null;
      })
      .event("mouseup", function (d) {
          // clk: removed when using the force directed layout; d.angle = getAngle(d, mainNode);
          //that.forceLayout.restartSim();
      }) 
      .event("dblclick", function(d) { 
            JazzMap.logEvent("INFO", "dblClick node " + d.id);
      //              d.x = mainNode.x;
      //              d.y = mainNode.y;
            centerOnNode(d); 
      })
      .event("click", function(d) {
          JazzMap.logEvent("INFO", "click node " + d.id);
          if (d == mainNode)
            return;
          // deselect all others
          JazzMap.ui.network.deselectAllMusicians();
          active(d);
          if (d.active) { 
            // showDetails(mainNode, d);
            JazzMap.ui.timeline.selectSessions(d.id);
          }
          else
            JazzMap.ui.timeline.deselectSessions();
          vis.render();
      } )
      .event("mouseover", function(d) {
          // highlight main node
          // record the node that was dragged into the main
          if(!this.draggingNode) {
            d.isHighlighted = true;
            vis.i(d.index);
            vis.render();
            JazzMap.ui.timeline.highlightSessions(d.id);
          }
      })
      .event("mouseout", function(d) {
        mainNode.active = false;
        if(!this.draggingNode) {
            d.isHighlighted = false;
            vis.i(-1);
            vis.render();
            JazzMap.ui.timeline.removeHighlight();
        }
      } );
				

			this.forceLayout.label.add(pv.Label)
				.visible(function(d) {return isLabelVisible(d);} )
				.font(function(d) {
				    if (d == mainNode) 
              return graphSkin.centerNodeFont;
            if (d.index == vis.i() || d.isHighlighted)
              return graphSkin.highlightedNodeFont;
            if (d.active)
              return graphSkin.selectedNodeFont;
	  			  return graphSkin.nodeFont;
          })
				.textStyle(function(d) {
            if (d == mainNode)
              return graphSkin.centerNodeLabelColor;
            if (d.index == vis.i() || d.isHighlighted)
              return graphSkin.highlightedNodeLabelColor;
            if (d.active)
              return graphSkin.selectedNodeLabelColor;
				    return graphSkin.nodeLabelColor;
  				} )
         .textAlign(graphSkin.nodeLabelAlign)
         .textAngle(function(d) {
            if (d == mainNode) return 0;
            if ( Math.abs(d.angle + Math.PI/2) < Math.PI/3)
              return -Math.PI/15;
            if ( Math.abs(d.angle - Math.PI/2) < Math.PI/3 )
            return 0;
         });

      vis.render();
      return vis;
    },

    /**
		 * Update layout
		 */
    updateGraphLayout: function () {
      var w = $("#networkDiagramDiv").width();
      var h = $("#networkDiagramDiv").height();
      var sidebar_w = $("#detailsPanel").width();

      // update size
      vis
          .width(w-sidebar_w-50)
          .height(h);

      // refersh layout
      this.forceLayout.refresh(this.nodes,
          this.links,
          this.mainNode,
          w,
          h);

      // rerender
      vis.render();
    }

  };

} ();
