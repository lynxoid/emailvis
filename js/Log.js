function Log() {
  this.stack = new Array();
  setTimeout("JazzMap.pushLog()", 1000 * 60 * 1); // every 1 minutes
};

Log.prototype.logEvent = function (status, msg) {
  this.stack.push({"s": status, "m": msg});
};


Log.prototype.pushLog = function () {
  if (this.stack == null || this.stack.length == 0)
    return;

  var d = new Date();
  d = d.getMonth() + "-" + d.getDate() + "-" + d.getFullYear();
  var data, i, len = this.stack.length;
  for (i = 0; i < len; i++) {
    data = "logdate=" + d + "&status=" + this.stack[i]["s"] + "&message=" + this.stack[i]["m"];
    $.ajax({
      url:  JazzMap.phpPath + "log.php",
      data: data,
      success: function(data, textStatus, XMLHttpRequest) {},
      error: function (XMLHttpRequest, textStatus, errorThrown) {}
    });
  }

  // reset timer, stack
  this.stack = new Array();
  setTimeout("JazzMap.pushLog()", 1000 * 60 * 1); // every 1 min
};
