/**
 * 
 */

JazzMap.layout = function () {
	
  var epsilon = Math.pow(10, -5);

  var absoluteMax = 0;

  var denominator = (1000 * 60 * 60 * 24) * 365;
  /*
      function 1 - more smoothed
      function 2 - more suseptible to sessions
  */
  var sigma1 = 3.00, sigma2 = 1;
  var p2_1 = 2 * sigma1 * sigma1;
  //    var p1_1 = 1 / Math.sqrt(p2_1 * Math.PI);
  var p1_1 = 4 / Math.sqrt(p2_1 * Math.PI);

  var p2_2 = 2 * sigma2 * sigma2;
  //    var p1_2 = 1 / Math.sqrt(p2_2 * Math.PI);
  var p1_2 = 4 / Math.sqrt(p2_2 * Math.PI);

  var alpha = 0.1;
  var y1 = 2.00, y2 = 1.43;
	
  // public variables, methods
  return {
      /********************************************************
        Original influence function (by Fernando)
       *******************************************************/
      computeInfluenceScore: function (origin, node, sessions) {
          if (!sessions)
              return 1;

          var d = null;
          var sum = 0;			
          var mn = JazzMap.ui.network.getMainNode();
          var l = sessions.length;
          var c = 0;
          var diff;
          for (var i = 0; i < l; i++) {
              d = sessions[i].dateDate;
              if (sessions[i].guyPresent(node.id)) {
                c++;
                diff = Math.abs(JazzMap.ui.timeline.dates.convert2Float(d) - 
                      JazzMap.ui.timeline.dates.convert2Float(origin));

                if (diff < Math.pow(epsilon, JazzMap.powerK))
                    sum += 1 / Math.pow(epsilon, JazzMap.powerK);
                else
                    sum += 1 / Math.pow(diff, JazzMap.powerK);
              }
          }
          return sum;
      },

      /******************************************************
      Influence function w/ gaussian fall-off
      Sessions - all sessions currently selected
      (saves on guyPresent() calls )
      *******************************************************/
      computeNormedScore : function (origin, node, sessions) {
          if (!sessions || sessions.length == 0) return 0;
          var date, i, sum1=0, sum2=0, mn = JazzMap.ui.network.getMainNode(), diff;
          var len = sessions.length;
          var participated = 0;
          for (i = 0; i < len; i++) {
              d = sessions[i].dateDate;
              if (node.inSession(sessions[i].sessionId)) {
                  participated++;
                  diff = (d - origin) / denominator;

                  sum1 += p1_2 * Math.exp( - (diff * diff) / p2_2 );
                  sum2 += p1_1 * Math.exp( -(diff * diff) / p2_1);
              }
          }
          var s = alpha * sum1 + (1-alpha) * sum2;
/*            if (s > absoluteMax) {
              absoluteMax = s;
              var ep = JazzMap.ui.timeline.getEpicenterDate();
              console.log(absoluteMax, ep, origin, node.id, node.nodeName, participated);
          } */
          return s;
      },

      /******************************************************
      Computes influence scores for all performers involved 
      in the given sessions
      ******************************************************/
      computeScoreDict : function (origin, sessions) {
          if (!sessions || sessions.length == 0 || origin == null) return 0;
          var date, i, sum1=0, sum2=0, mn = JazzMap.ui.network.getMainNode(), diff;
          var len = sessions.length;
          var id2sum1 = {}, id2sum2 = {};

          for (i = 0; i < len; i++) {
              date = sessions[i].dateDate;
              diff = (date - origin) / denominator;
              sum1 = Math.exp( - (diff * diff) / p2_2 );
              sum2 = Math.exp( -(diff * diff) / p2_1);
              for (var id in sessions[i].people) {
                  if (id2sum1[id] == null) {
                      id2sum1[id] = 0;
                      id2sum2[id] = 0;
                  }
                  id2sum1[id] += sum1;
                  id2sum2[id] += sum2;
              }
          }
          var scores = {};
          for (var id in id2sum1) {
              scores[id] = alpha * p1_2 * id2sum1[id] + (1-alpha) * p1_1 * id2sum2[id];
          }

          return scores;
      }
  };
	
	
} ();
