/**
jQuery Logger ($.jql()) v1.0.0
Copyright (c) 2011 Joe Lu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
jQuery.jql = function() {
    var _LEVELS = {
        'TRACE' : 2,
        'DEBUG' : 4,
        'INFO' : 6,
        'WARN' : 8,
        'ERROR' : 10,
        'FATAL' : 12,
    };
    
    var _defaults = {
        'level' : 'info',
        'logger' : _getLocalLogger()
    };
    var _settings = {};
    var _level, _logger;
    
    /**
     * Initialize jQuery Logger.
     */
    function _init() {
        _setOptions({
            'level' : _defaults.level,
            'logger' : _defaults.logger
        });
    };
    
    /**
     * Returns a logger that logs to a local console. 
     */
    function _getLocalLogger() {
        return {
            'log' : function(level, message, location) {
                if (console) {
                    if (location) {
                        message = location + ' - ' + message;
                    }
                    
                    if (level <= _LEVELS.DEBUG) {
                        console.debug(_getCurrentTime(), message);
                    } else if (level <= _LEVELS.INFO) {
                        console.info(_getCurrentTime(), message);
                    } else if (level <= _LEVELS.WARN) {
                        console.warn(_getCurrentTime(), message);
                    } else if (level <= _LEVELS.FATAL) {
                        console.error(_getCurrentTime(), message);
                    }
                }
            }
        };
    };
    
    /**
     * 
     */
    function _getCurrentTime() {
        var date = new Date();
        var seconds = date.getSeconds().toString();
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        var day = date.getDate().toString();
        var month = (date.getMonth() + 1).toString();
        var year = date.getFullYear().toString();
        
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }
    
    /**
     * Resets the logger.
     */
    function _reset() {
        _init();
    };
    
    /**
     * 
     */
    function _setOptions(options) {
        _settings = $.extend({}, _defaults, options);
        
        if (options.level) {
            _setLevel(options.level);
        }
        
        if (options.logger) {
            _setLogger(options.logger);
        }
    };
    
    /**
     * 
     */
    function _setLevel(level) {
        level = level.toUpperCase();
        
        if (_LEVELS[level]) {
            _level = _LEVELS[level];
        }
    };
    
    /**
     * 
     */
    function _getLevel() {
        return _level;
    };
    
    /**
     * 
     */
    function _setLogger(logger) {
        if (logger && logger.log) {
            _logger = logger;
        } else {
            throw 'Invalid logger.  Logger must have log() method.';
        }
    };
    
    /**
     * 
     */
    function _getLogger() {
        return _logger;
    };
    
    /**
     * 
     */
    function _log(level, message, location) {
        return function(message, location) {
            if (level >= _level) {
                _logger.log(level, message, location);
            }
        }
    };
    
    // The API of jQuery Logger
    var _api = {
        'setOptions' : _setOptions,
        'setLogger' : _setLogger,
        'getLogger' : _getLogger,
        'setLevel' : _setLevel,
        'getLevel' : _getLevel,
        'reset' : _reset
    };
    
    // Adds all the log levels and corresponding logging methods to _api object.
    for (var level in _LEVELS) {
        _api[level] = _LEVELS[level];
        _api[level.toLowerCase()] = _log(_LEVELS[level]);
    }
    
    _init();
    
    return _api;
}();