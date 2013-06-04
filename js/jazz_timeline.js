
/* Foreword here */

JazzMap.ui.timeline = function () {
    
   //==========================================================================
   //
   // Private variables
   //
   //==========================================================================

   /* absolute left date on the timeline */
   var absoluteStartDate = new Date(1923 - 50, 0, 1);
   /* absolute right date on the timeline */
   var absoluteEndDate = new Date(2010+50, 0, 1);

   var selectedStart = new Date(1923, 0, 1);
   var selectedEnd = new Date(2010, 0, 1);

   var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
   var MILLIS_PER_WEEK = MILLIS_PER_DAY * 7;
   var MILLIS_PER_YEAR = MILLIS_PER_DAY * 365;
   var MILLIS_PER_MONTH = MILLIS_PER_YEAR / 12;

   /* increment for x coordinate on the histogram */
   var bigStep = MILLIS_PER_YEAR * 5;
   var smallStep = MILLIS_PER_YEAR;

    var dob = null; // date of birth
    var dod = null; // date of death

   var sessions = [];
   var bins = null;

   var w = 800;//div.width(),
   //var minH2Height = 70;

   // visual appearence and layout
   var timelineSkin = {
       decadeTickLen: 8,
       demiDecadeTickLen: 6,
       demiDecadeTickWidth: 2,
       otherTickLen: 4,
       otherTickWidth: 1,
       tickColor: "white",    
       labelColor: "white",
       labelFont: "14px sans-serif",
       backgroundColor: 'black',
       dotBarStyle: 'rgb(80, 80, 80)',//'rgba(255, 128, 128, 0.9)',
       dotFillStyle: "rgb(170, 238, 252)", //'rgb(50, 100, 200)',
       dotStrokeStyle: "rgb(131, 190, 202)",//"rgb(100, 100, 100)",
       dotHighlightFill: "rgb(252, 253, 121)",
       dotHighlightStroke: "rgb(216, 216, 82)",
       dotSelectFill: "rgb(2250, 157, 18)",
       dotSelectStroke: "rgb(207, 130, 15)",
       dotBorderWidth: 1,
       dotBarPaddingLeft: 0, // 10
       dotBarPaddingRight: 0, // 10
       height: 50,
       topIndent: 16,
       dotSize: 50,
       zoomButtonScaleFactor: 2,
       lifeBackgroundColor: "rgb(120, 120, 120)"
   };

   // convience variables holding some of the skin constants
    var pl = timelineSkin.dotBarPaddingLeft, 
       pr = timelineSkin.dotBarPaddingRight;    // padding right, left
    var h1 = timelineSkin.height;
    var h2 = 0;//div.height() - topIndent - h1 > 0 ? div.height() - topIndent - h1 : 100,
    var x = null;
    var y = null;
    var fx = null;
    var t_center = 0;

    var convert2Float_d = function (d) {
        var y = d.getFullYear();
        var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var isLeap = (y % 4 == 0) && (y % 100 != 0);
        if ( isLeap )
            months[1] = 29;
        var days = 0;
        for (i = 0; i < d.getMonth(); i++)
            days += months[i];
        days += d.getDate() + 1;
        days = days / (isLeap ? 366 : 365);
        return y + days;
    };

    /* Dates util object */
   var dates = {
      compare: function (a,b) {
        return (a > b) - (a < b);
      },
      //
      convert2Date: function (d) {
        return new Date(d);
      },

      convert2Float: function (d) {
        return d.getTime();
      },
/*
      // convert d - float to Date object
      convert2Date: function (d) {
        var y = Math.floor(d);
        var day = Math.floor( (d - y ) * 365) + 1;
        var date = new Date(y, 0, day);
        return date;
      },
*/
      
      /**********
        takes two date objects and computes the difference in days between 
        the two 
      ***********/
      daysDiff : function (d1, d2) {
        var f1 = convert2Float_d(d1);
        var f2 = convert2Float_d(d2);
        var diff = f1 - f2;        

        // var diff = (d1.getTime() - d2.getTime() ) / (1000 * 60 * 60 * 24);
        return diff;
      },

      dateString : function(d) {
        if (!d) return "";
        var months = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
        return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
        //return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
      }
    };

    var getYearTicks = function (start, end, dy) {
        // put ticks at every 10 years
        var date, absoluteEndDate, dates = [];
        var y;
        // last mark for year divisible by 5
        y = end.getFullYear();
        y = y%dy==0 ? y : y - (dy-y%dy);
        absoluteEndDate = new Date(y, 0, 1);
        // first yearly mark on year divisible by 5
        y = start.getFullYear();
        y  = y % dy == 0? y: y + (dy-y%dy);
        date = new Date(y, 0, 1);
        dates.push(date);
        y += dy;
        while (y <= end.getFullYear()) {
            dates.push(new Date(y, 0, 1));
            y +=dy;
        }
        return {d: dates, s: dy * MILLIS_PER_YEAR};
    }

    var getMonthTicks = function (start, end, dm) {
        // put ticks at every 10 years
        var date, absoluteEndDate, dates = [];
        var m;
        m = end.getMonth();
        m = m%dm==0 ? dm : m-(dm-m%dm);
        absoluteEndDate = new Date(end.getFullYear(), m, 1);
        m = start.getMonth();
        m = m%dm == 0 ? m : m+(dm-m%dm);
        date = new Date(start.getFullYear(), m, 1);
        dates.push(date);
        var y = start.getFullYear();
        m += dm;
        y += m%12==0;   // add a year if acumulated 12 month
        m = m%12==0 ? 0 : m;    // restart month if accumulated 12 month
        while (12*y+m <= 12*end.getFullYear()+end.getMonth() ) {
            dates.push(new Date(y, m, 1));
            m += dm;
            y += m%12==0;
            m = m%12==0 ? 0 : m;
        }
        return {d: dates, s: dm * MILLIS_PER_MONTH};
    }

    var getDayTicks = function (start, end, dd) {
        // put ticks at every 10 years
        var date, absoluteEndDate, dates = [];
        var y;
        // last mark for year divisible by 5
        y = end.getFullYear();
        y = y%dy==0 ? y : y - y%dy;
        absoluteEndDate = new Date(y, 0, 1);
        // first yearly mark on year divisible by 5
        y = start.getFullYear();
        y  = y % dy == 0? y: y + y%dy;
        date = new Date(y, 0, 1);
        dates.push(date);
        y += dy;
        while (y <= end.getFullYear()) {
            dates.push(new Date(y, 0, 1));
            y +=dy;
        }
        return {d: dates, s: dy * MILLIS_PER_YEAR};
    }

   /* Generates cutoffs for bins in the histogram.
    Assumes start, end are Javascript date objects
   */
   var getTicks = function (start, end) {
        var d, step;
        var dy = end.getFullYear() - start.getFullYear();
        if (dy >= 30) {
            step = MILLIS_PER_YEAR;
            return getYearTicks(start, end, 5);
        }
        else {
          if (dy >= 5) {
            // group by years
            step = MILLIS_PER_YEAR;
            return getYearTicks(start, end, 1);
          }
          else { // months, weeks, or days
            if (dy > 0) {
                step = MILLIS_PER_MONTH;
                return getMonthTicks(start, end, 6);
            }
            else { // months, weeks, or days
              var dw = (end.getTime() - start.getTime() ) / MILLIS_PER_WEEK;     // num of weeks
              if (dw <= 48) { // weeks or days
            var ddays = (end.getTime - start.getTime() ) / MILLIS_PER_DAY;    // num of days
            if (ddays < 48)
              step = MILLIS_PER_DAY;
            else
              step = MILLIS_PER_WEEK;
              }
              else
            step = MILLIS_PER_MONTH; // group by month
            }
          }
          d = Math.ceil( (end.getTime() - start.getTime()) * 1.0 / step);
        }

        var date = start.getTime(), dates = [];
        dates.push(start);
        while (true) {
            date += step;
            if (date > end) break;
            dates.push(new Date(date));
        }

        return {d: dates, s: step};
   };

   var blah = getTicks(absoluteStartDate, absoluteEndDate);

   var ticks = blah.d;

   var getTimelineLabel = function (d, ticks) {
    var months = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
    var index = Math.round((d.getTime() - selectedStart.getTime() ) / smallStep);
    var y = d.getFullYear();

    if (smallStep >= MILLIS_PER_YEAR ) {
        if (smallStep == 10 * MILLIS_PER_YEAR) return y;
        if (smallStep == 5 * MILLIS_PER_YEAR) 
            if (ticks.length > 25) return y%10==0 ? y:'';
            else return y%5==0 ? y : '';
        // ticks per year
        if (ticks.length > 20) return y%5==0 ? y:'';
        return y;
    }
    else if (smallStep >= MILLIS_PER_MONTH) {
        if (ticks.length < 16) 
          return months[d.getMonth()] + ' ' + y;
        else
          if (ticks.length < 30)
            if (index%2 == 0) return months[d.getMonth()] + ' ' + y;
            else return '';
          else
            if (index%4 == 0) return months[d.getMonth()] + ' ' + y;
            else return '';
    }
    else if (smallStep >= MILLIS_PER_WEEK) {
        if (ticks.length < 20)
          if (index == ticks.length-1 || index == 0) 
              return  months[d.getMonth()] + ' ' + d.getDate() + ', ' + y;
          else
            return months[d.getMonth()] + ' ' + d.getDate();
        else
          
          if (index%2 == 0) 
            if (index >= ticks.length-2 || index == 2) 
              return  months[d.getMonth()] + ' ' + d.getDate() + ', ' + y;
            else
             return months[d.getMonth()] + ' ' + d.getDate();
          else return '';
    }
    else if (smallStep >= MILLIS_PER_DAY) return d.getDate();
    else return d.getDate();
   };

    /**
     * custom zoom behavior  when using the scrollwheel
     */
    var myzoom = function (e, w) {
        speed = 1/7;// 1/48;
        var obj = e;
        width = w;
        function mousewheel() {
          JazzMap.logEvent("INFO", "scrolled wheel on timeline");
          var m = this.mouse();
          var k = pv.event.wheel * speed;
          var ss = dates.convert2Float(selectedStart);    // in float date
          var se = dates.convert2Float(selectedEnd);
          var delta = Math.max(se - ss,0.01)/ width * k * 50;
      
          var ctr = ss + (se-ss)/2.0;
          ss = ss + delta;    // increase selectedStart
          se = se - delta;    // descrease selectedEnd

          // if the interval would be too small, make it the smallest interval
          if(se - ss < zoomLevels[0]) {
            ss = ctr - (zoomLevels[0] / 2.0);
            se = ctr + (zoomLevels[0] / 2.0);
          }
          obj.setRangeStart(dates.convert2Date(ss) );
          obj.setRangeEnd(dates.convert2Date(se) );
          JazzMap.data.sessions.filterSessionData();
          // obj.myinit(ss, se);
          this.render();
          obj.timeVis.render();
          pv.Mark.dispatch("myzoom", this.scene, this.index);
        }
        return mousewheel;
    }

    /**
     * custom pan behavior 
     */
    var mypan = function (e, w) {
        var v1,
            obj = e,
            width = w,
            prevX;
        function mousedown() {
          v1 = pv.vector(pv.event.pageX, pv.event.pageY);
          prevX = pv.event.pageX;
          JazzMap.ui.network.forceLayout.pauseSim();
        }
        function mousemove() {
          JazzMap.logEvent("INFO", "dragging mouse on timeline");
          if (!v1) return;
          var currX = pv.event.pageX;
          // console.log(pv.event.pageX, prevX);
          var x = currX - prevX;//(pv.event.pageX - prevX) > 0 ? 5: -5;
          step(obj, x, width);
          JazzMap.data.sessions.filterSessionData();
          prevX = pv.event.pageX;
        }
        function mouseup() {
          v1 = null;
          JazzMap.ui.network.forceLayout.graphChanged();
          JazzMap.ui.network.forceLayout.restartSim();
        }
        pv.listen(window, "mousemove", mousemove);
        pv.listen(window, "mouseup", mouseup);
        return mousedown;
    };

    /**
     *  Navigation function - step right or left one unit of distance
     */
    var step = function (obj, x, w) {
        var ss = dates.convert2Float(selectedStart);    // in float date
        var se = dates.convert2Float(selectedEnd);


        var ds = se - ss;
        var dx = x*ds / w;
        //if (Math.abs(dx) < zoomLevels[0] / 2.0) {
        //    dx = ((dx<0)?-1:1) * zoomLevels[0];
        //}
        
        ss -=  dx;
        se -=  dx;
        if (dates.convert2Date(ss) < absoluteStartDate) {
            ss = dates.convert2Float(absoluteStartDate);
            se = ss + ds;
        }
        else if (dates.convert2Date(se) > absoluteEndDate) {
            se = dates.convert2Float(absoluteEndDate);
            ss = se - ds;
        }
        obj.setRangeStart(dates.convert2Date(ss));
        obj.setRangeEnd(dates.convert2Date(se));
        obj.timeVis.render();
    };

    var rulerPanel, focus, center, globalDD, epicenter;

    // 1   2         3         4        5       6         7        8
    //all, 50 years, 10 years, 5 years, 1 year, 6 months, 1 month, 1 week

    var jan1 = dates.convert2Float(new Date(1900, 1, 1));
    var zoomLevels = [ 
//      dates.convert2Float(new Date(1900,1,7)) - jan1,
      dates.convert2Float(new Date(1900,1,31)) - jan1,
      dates.convert2Float(new Date(1900,6,31)) - jan1,
      dates.convert2Float(new Date(1901,1,1)) - jan1,
      dates.convert2Float(new Date(1905,1,1)) - jan1,
      dates.convert2Float(new Date(1910,1,1)) - jan1,
      dates.convert2Float(new Date(1950,1,1)) - jan1,
      dates.convert2Float(new Date(2050,1,1)) - jan1
    ];  

    function closestZoomLevel(interval, favorBigger) {
        var newInterval;
        if(favorBigger) {
            for(newInterval = zoomLevels.length-1; newInterval >= 0; newInterval--) {
                if (zoomLevels[newInterval] <= interval || newInterval == 0) { // we've passed it
                    if (newInterval < zoomLevels.length-1) newInterval++; // one higher
                    // if even that is < a 5% increase, bump it up one more
                    if (newInterval < zoomLevels.length-1 && 
                        zoomLevels[newInterval] < 1.05*interval) newInterval++;
                    return zoomLevels[newInterval];
                }
            }
        }
        else {
            for(newInterval = 0; newInterval < zoomLevels.length; newInterval++) {
                if (zoomLevels[newInterval] >= interval || newInterval == zoomLevels.length-1) {
                    if (newInterval > 0) newInterval--;
                    if (newInterval > 0 && zoomLevels[newInterval] > 0.95*interval) newInterval--;
                    return zoomLevels[newInterval];
                }
            }
        }
    }

    function zoomIn() {
        var ss = dates.convert2Float(selectedStart);    // in float date
        var se = dates.convert2Float(selectedEnd);
        var curWindow = se - ss;

        var newI = closestZoomLevel(curWindow, false);

        // if the change is very small, make no change
        if (Math.abs(newI - curWindow) < 0.001) return;
        
        newI = newI / 2.0;
        var ctr = ss + (curWindow / 2.0);
        ss = ctr - newI;
        se = ctr + newI;

        this.setRangeStart(dates.convert2Date(ss) );
        this.setRangeEnd(dates.convert2Date(se) );
        JazzMap.data.sessions.filterSessionData();
        this.timeVis.render();
    }

    function zoomOut() {
        var ss = dates.convert2Float(selectedStart);    // in float date
        var se = dates.convert2Float(selectedEnd);
        var curWindow = se - ss

        var newI = closestZoomLevel(curWindow, true);

        // if the change is very small, make no change
        if (Math.abs(newI - curWindow) < 0.001) return;
    
        newI = newI / 2.0;    
        var ctr = ss + (curWindow / 2.0);
        ss = ctr - newI;
        se = ctr + newI;
        
        this.setRangeStart(dates.convert2Date(ss) );
        this.setRangeEnd(dates.convert2Date(se) );
        JazzMap.data.sessions.filterSessionData();
        this.timeVis.render();
    }
   
    //==========================================================================
    //
    // Public functions and objects
    //
    //==========================================================================
    return {
      /* dates operations */
      dates : dates,

      timeVis : null,

      context : null,

      navigateTo : function (sessID, applyZoom) {
        // if no such session - do nothing
        var i, len = sessions.length, foundSess = false;
        for (i = 0; (i < len) && (foundSess == false); i++) {
          if (sessions[i].sessionId == sessID) {
            foundSess = true;
            break;
          }
        }
        if (foundSess == true) {
          this.deselectSessions();
          sessions[i].selected = true;
          JazzMap.ui.network.selectMusicians(sessions[i].people);
          // align with an epicenter mark (and zoom)
          var ss = dates.convert2Float(selectedStart);    // in float date
          var se = dates.convert2Float(selectedEnd);
          var curWindow = se - ss;
          if (applyZoom) {
            var newI = zoomLevels[Math.max(0, (zoomLevels.length - 5))];
            var ctr = sessions[i].dateFloat;//ss + (curWindow / 2.0);
            ss = ctr - newI;
            se = ctr + newI;
          }
          else {
            ss = sessions[i].dateFloat - curWindow/2;
            se = sessions[i].dateFloat + curWindow/2;
          }
          this.setRangeStart(dates.convert2Date(ss));
          this.setRangeEnd(dates.convert2Date(se));

          // TODO: update sessions, performers
          JazzMap.data.sessions.filterSessionData();
          this.timeVis.render();
        }
      },

      setDateOfBirth : function (d) {
          dob = d;
          this.timeVis.render();
      },

      setDateOfDeath : function (d) {
          dod = d;
          this.timeVis.render();
      },

      selectSessions : function (id) {
          this.deselectSessions();
          var sessions = JazzMap.data.sessions.getSessionData();
          var i, j = 0, node;
          var len = sessions.length, pplLen;
          for (i = 0; i < len; i++) {
          //pplLen = sessions[i].people.length;
          //for (j = 0; j < pplLen; j++)
          for (var p in sessions[i].people)
            if (p == id) {
	      node = sessions[i].people[p];
              sessions[i].selected = true;
              j++;
              break;
            }
          }
          //$("#selectedCount").html("1 node, " + j + " sessions");
          $("#selectedCount").html( j + " sessions with " + node.nodeName);
          this.timeVis.render();
      },

      deselectSessions : function () {
          var sessions = JazzMap.data.sessions.getSessionData();
          var i, len = sessions.length;
          for (i = 0; i < len; i++) {
              sessions[i].selected = false;
          }
          this.timeVis.render();
      },

	    highlightSessions : function (id) {
	      if (!globalDD)
	        return;

	      var i, j, m = 0; // matches
	      var sess = globalDD;
	      var len = sess.length, pplLen;
	      for (i = 0; i < len; i++) {
	        // pplLen = sess[i].people.length;
          for (var p_id in sess[i].people)
            if (p_id == id) {
              sess[i].isHighlighted = true;
              break;
            }
	      }
	      //console.log("Matches: " + m + " " + new Date());
	      this.timeVis.render();
	    },

	    removeHighlight : function () {
        // console.log("removeHighlght");
	      var sess = globalDD;
	      var len = sess.length;
	      for (var i = 0; i < len; i++) {
	        sess[i].isHighlighted = false;
	      }
	      this.timeVis.render();
	    },

      zoomIn : zoomIn,
      zoomOut : zoomOut,

      rewindLeft : function () {
          JazzMap.logEvent("INFO", "click icon to first sess on timeline");
          // get first musician's session
          // rewind to that - try to put it in the center
          var sessions = JazzMap.data.sessions.getSessionData();
          var ss = dates.convert2Float(selectedStart);
          var se = dates.convert2Float(selectedEnd);
          var ds = se - ss;
          if (!sessions || sessions.length == 0)
              ss = dates.convert2Float(absoluteStartDate);
          else
              ss = dates.convert2Float(sessions[0].dateDate) - ds/2;
          this.setRangeStart(dates.convert2Date(ss) );
          // in case ds was overshooting over the absoluteStartDate - adjust ss
          ss = dates.convert2Float(selectedStart);
          se = ss + ds;
          if (dates.convert2Date(se) > absoluteEndDate) {
            this.setRangeEnd(absoluteEndDate);
            ss = dates.convert2Float(absoluteEndDate) - ds;
            this.setRangeStart(dates.convert2Date(ss));
          }
          else
            this.setRangeEnd(dates.convert2Date(se) );
          JazzMap.data.sessions.filterSessionData();
          this.timeVis.render();
      },
      stepLeft : function () {
          JazzMap.logEvent("INFO", "click icon to pan on timeline");
          var w = this.timeVis.width()-pl-pr;
          step(this, 0.85*w, w);
          JazzMap.data.sessions.filterSessionData();
      },
      rewindRight : function () {
          JazzMap.logEvent("INFO", "click icon to last sess on timeline");
          // get last musician's session and rewind to there
          var sessions = JazzMap.data.sessions.getSessionData();
          var ss = dates.convert2Float(selectedStart);
          var se = dates.convert2Float(selectedEnd);
          var ds = se - ss;
          if (!sessions || sessions.length == 0)
              se = dates.convert2Float(absoluteEndDate);
          else
              se = dates.convert2Float(sessions[sessions.length-1].dateDate) + ds/2;
          this.setRangeEnd(dates.convert2Date(se) );
          // in case ds was overshooting beyond absoluteEndDate - adjust se for that
          se = dates.convert2Float(selectedEnd);
          ss = se - ds;
          if (dates.convert2Date(ss) < absoluteStartDate) {
            this.setRangeStart(absoluteStartDate);
            se = dates.convert2Float(absoluteStartDate) + ds;
            this.setRangeEnd(dates.convert2Date(se));
          }
          else
             this.setRangeStart(dates.convert2Date(ss) );
          JazzMap.data.sessions.filterSessionData();
          this.timeVis.render();
      },
      stepRight : function () {
          JazzMap.logEvent("INFO", "click icon to pan on timeline");
          var w = this.timeVis.width()-pl-pr;
          step(this, -0.85*w, w);
          JazzMap.data.sessions.filterSessionData();
      },

      setRangeStart : function (s) {
          if (s < absoluteStartDate) selectedStart = absoluteStartDate;
          else selectedStart = s;
      },

      setRangeEnd : function (e) {
          if (e > absoluteEndDate) selectedEnd = absoluteEndDate;
          else selectedEnd = e;
      },

      getRangeStart : function () {
          return selectedStart;
      },

      getRangeEnd : function () {
          return selectedEnd;
      },

      getEpicenterDate : function () {
          if (!selectedEnd || ! selectedStart)
              return new Date(1948,1,1);
          return new Date(selectedEnd.getTime() / 2 + selectedStart.getTime() / 2 );
      },
     
      /* update histogram with new data; center on the middle of career */
      update : function (data) {
          sessions = data;

          this.timeVis.render();
      },

      resize : function (width, height) {
          w = width;

          this.timeVis.width(width);//.height(height);
          rulerPanel.width(width);
          focus.width(w-pl-pr);
          // epicenter.left(w/2);

          // update ticks, x, y scales
          x = pv.Scale.linear(absoluteStartDate.getFullYear(), absoluteEndDate.getFullYear())
                  .range(0, width-pl-pr); /* sessions w/ dates */
          //fx = pv.Scale.linear().range(0, width-pl-pr);
          fx = pv.Scale.linear(dates.convert2Float(absoluteStartDate), dates.convert2Float(absoluteEndDate))
                       .range(0, width-pl-pr);

          this.timeVis.render();
      },


      initData : function (data) {
          // console.log("init data");
          sessions = data;
          var first = sessions[0].dateFloat;
          var last = sessions[sessions.length - 1].dateFloat;
          var mid = last/2 + first/2;
          var ss = dates.convert2Float(selectedStart);
          var se = dates.convert2Float(selectedEnd);
          var ds = se/2 - ss/2;
          var se = mid + ds;
          this.setRangeEnd(dates.convert2Date(se));
          var ss = mid - ds;
          this.setRangeStart(dates.convert2Date(ss));
          JazzMap.data.sessions.filterSessionData();

          this.timeVis.render();
      },

    
      /************************************************************************
      *************************************************************************
      
       Initializes histogram in the div

      *************************************************************************
      *************************************************************************/
      init : function () {
          // console.log("init tml");
          var div = $('#my-timeline');
          // set up data
          bigStep = blah.s;
          w = div.width();
          h2 = 0;
          x = pv.Scale.linear(absoluteStartDate.getFullYear(), absoluteEndDate.getFullYear()).range(0, w - pl -pr); /* sessions w/ dates */

          /* Interaction state. Focus scales will have domain set on-render. */
          //var fx = pv.Scale.linear(absoluteStartDate.getFullYear(), absoluteEndDate.getFullYear()).range(0, w-pl-pr); // CLK
          fx = pv.Scale.linear(dates.convert2Float(selectedStart), dates.convert2Float(selectedEnd))
                       .range(0, w-pl-pr);
          t_center = w/2;
          // console.log("set t_center", t_center);

          //selectedStart = absoluteStartDate;
          //selectedEnd = absoluteEndDate;

          // not sure why this is needed, but Chrome was not setting the my-timeline div to the right
          // height
          div.height(timelineSkin.topIndent + h1 + h2);

          /* Root panel. */
          this.timeVis = new pv.Panel()
              .width(w)
              .height(timelineSkin.topIndent + h1 + h2)
              .bottom(0)
              .left(0)
              .right(0)
              .top(0)
              .fillStyle("white")
              .events("all")
              .event("mousedown", mypan(this, w-pl-pr) )
              .event("mousewheel", myzoom(this, w-pl-pr) )
              .cursor("move");


          rulerPanel = this.timeVis.add(pv.Panel)
              .width(w)
              .height(timelineSkin.topIndent + h1 + h2)
              .bottom(0)
              .left(0)
              .right(0)
              .top(5)
              .fillStyle(timelineSkin.backgroundColor)
//              .events("all")
//              .event("mousedown", mypan(this, w-pl-pr) )
//              .event("mousewheel", myzoom(this, w-pl-pr) )
              .cursor("move");

          // add an epicenter pointer
          /*
          epicenter = rulerPanel.add(pv.Dot)
              .left(w/2)
              .top(1)
              .width(1)
              .height(timelineSkin.topIndent - 2)
              .shape("triangle")
              .fillStyle("red")
              .strokeStyle("red")
              .event("mouseover", pv.Behavior.tipsy({gravity: "n", fade: true}) )
              .text(function() {return "Epicenter: " + dates.dateString(dates.convert2Date( (dates.convert2Float(selectedEnd)+dates.convert2Float(selectedStart) ) /2)); });
          */

          /* Focus panel (zoomed in). */
          focus = rulerPanel.add(pv.Panel)
              .def("myinit", function(dd1, dd2) {
                  if (!sessions)
                    return [];
                  if (!dd1 || !dd2) {
                    dd1 = selectedStart; // in dates
                    dd2 = selectedEnd;
                  }
                  // conver int smallStartDate to Date object
                  var d1 = dates.convert2Float(dd1);//x.invert(i.x);    // in px
                  var d2 = dates.convert2Float(dd2);
                  fx.domain(d1, d2);
                  var blah = getTicks(dd1, dd2);
                  ticks = blah.d;
                  smallStep = blah.s;
                  // slice data
                  var startInd = Math.max(0, pv.search.index(sessions, dd1, function(d) {return d.dateDate;}) - 1);
                  var endInd = Math.min(sessions.length - 1, pv.search.index(sessions, dd2, function(d) {return d.dateDate;}) + 1);
                  var dd = smallData = sessions.slice(startInd, endInd + 1);
                  globalDD = dd;
                  return dd;
              })
              .width(w-pl-pr)
              .top(timelineSkin.topIndent)
              .left(pl)
              .right(pr)
              .height(h1)
              .fillStyle(timelineSkin.dotBarStyle)
              .cursor("move");

          // in lighter color, indicate musician's life span
          focus.add(pv.Panel)
              .fillStyle(timelineSkin.lifeBackgroundColor)
              .left(function () {
                  console.log()
                  if (dob==null || dob<absoluteStartDate) 
                    return fx(dates.convert2Float(absoluteStartDate)); 
                  else 
                    return fx(dates.convert2Float(dob) ); 
              })
              .width(function () {
                  var start = dob, end = dod;
                  if (dob == null || dob<absoluteStartDate)
                      start = absoluteStartDate;
                  if (dod == null || dod>absoluteEndDate)
                      end = new Date();
                  var p1 = fx(dates.convert2Float(end));
                  var p2 = fx(dates.convert2Float(start));
                  return p1 - p2; 
              })
              .events("none");

          // good panel, no overflow
          var p = focus.add(pv.Panel)
                       .overflow("hidden");


          // Add the dots

          // try images instead of triangles
          p.add(pv.Image)
              .url(function(d) {
                  var host = "css/images/";
                  if (d.isHighlighted)
                    return host + "roll_triang.png";
                  if (d.selected)
                    return host + "select_triang.png";
                  return host + "reg_triang.png";
              })
              .imageWidth(20)
              .imageHeight(17)
              .width(20)
              .height(17)
              .fillStyle(null)
              .strokeStyle(null)
              .data(function () {return focus.myinit();})
              .angle(Math.PI)
              .left(function (d) { return fx(d.dateFloat) - 10;})
              .bottom(function (d) {return (d.isHighlighted || d.selected )? h1/2+3 - 8 : h1 / 2 - 8; })
              .text(function (d) {return d.description;}) //+ " " + d[2];)
              .events("all")
  //          .title(function (d) {return dates.dateString(d.dateDate);})// + " " + d[2];)
              .event("mouseover", function (d) {
                    // highlight musicians
                    JazzMap.ui.network.highlightMusicians(d.people);
                    d.isHighlighted = true;
                    this.render();
              })
              .event("mouseout", function(d) {
                  JazzMap.ui.network.removeHighlight(); 
                  d.isHighlighted = false; 
                  this.render();
              } )
              .event("click", function(d) {
                  new Log("INFO", "click on Session " + d.sessionId);
                  if (d.selected == true) {
                    JazzMap.ui.timeline.deselectSessions();
                    JazzMap.ui.network.deselectMusicians(d.people);
            		    $("#selectedCount").html("");
                  }
                  else {
                    JazzMap.ui.timeline.deselectSessions();
                    d.selected = true;
                    JazzMap.ui.network.selectMusicians(d.people);
            		    //$("#selectedCount").html("1 session, " + d.pplCount + " collab");
            		    $("#selectedCount").html("");
                    pv.Behavior.tipsy({
                        html: true, 
                        gravity: "s", 
                        fade: true, 
                        delayOut:2000}).apply(this, arguments); 
                  }

              });


          // Add the ruler (& labels)
          focus.add(pv.Rule)
              .data(function () {
                  focus.myinit();
                  return ticks;})
              .left(function (d) {
                  var f = dates.convert2Float(d);
                  var ss = dates.convert2Float(selectedStart);
                  var se = dates.convert2Float(selectedEnd);
                  var x_coord = (f - ss) / (se - ss) * (w - pl - pr);//(f - i.d1) / (i.d2 - i.d1) * w;
                  return x_coord;})
              .top(1)
              .height(function(d) {
                  var y = d.getFullYear();
                  if(y%10==0) return timelineSkin.decadeTickLen;
                  if(y%5==0) return timelineSkin.demiDecadeTickLen;
                  return timelineSkin.otherTickLen;})
              .lineWidth(function(d) {
                  if(d.getFullYear() % 5 == 0) return timelineSkin.demiDecadeTickWidth;
                  else return timelineSkin.otherTickWidth;})
              .strokeStyle(timelineSkin.tickColor)
              .anchor("top")
              .add(pv.Label)
              .textStyle(timelineSkin.labelColor)
              .font(timelineSkin.labelFont)
              .text(function (d) { return getTimelineLabel(d, ticks); } );

           
          this.timeVis.render();
          JazzMap.data.sessions.filterSessionData();
          return this.timeVis;
          }
      }
} (/*self-invoking function*/);
