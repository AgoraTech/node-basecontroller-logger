
	var util = require('util'),
		instances = {},
		LogStream;
	
	function Logger(name) {
		this.sfx = (name != '__' ? '.' + name : '');
		this.pfx = (name != '__' ? name + '.' : '');
		this.target = null; // instances['__'] && instances['__'].target || process.stdout;

		this.subs = {};
		this.level(0);
		this.logs = [];
	};
	
	/**
	 * 
	 * @param {String} name
	 * @returns {SubLogger}
	 */
	Logger.prototype.getSub = function(name) {
		this.subs[name] = this.subs[name] || new SubLogger(this, name);
		return this.subs[name];
	};
	
	Logger.prototype.file = function(path) {
		LogStream = LogStream || require('logstream').LogStream;
		this.path = path;
		this.target = new LogStream(path);
		this.msg(1, "[==Logger"+this.sfx+"==] redirected to " + path);
		this.reopen = this.target.reopen.bind(this.target);
        
        return this;
    };
    
    Logger.prototype.close = function(callback) {
    	if (!this.target || this.target == process.stdout)
    		return callback && callback();
    	
    	if (callback) {
    		this.target.end();
    		this.target.once('close', callback);
    	}
    };
	
	Logger.prototype.level = function(level) {
		this.msg(level, '[==Logger==] Level set to ' + level);
		if (level) {
			this._level = level;
			return this;
		} else {
			return this._level;
		}
	};
	
	Logger.prototype.keepLogCount = function() {
		this.msg(1, "[==Logger"+this.sfx+"==] keepLogCount is no longer supported!");
	};
	
	Logger.prototype.msg = function(level, msg, sub) {
		if (level <= this._level) {
			var pfx = (new Date().toISOString()) + ' ['+this.pfx+level+(sub && ('.' + sub) || '')+'] ';
			if (msg.match("\n")) {
				var pad = Array(pfx.length + 1).join(' ');
				msg = msg.replace(/\n/g, "\n" + pad);
			}
			try {
				(this.target || instances['__'] && instances['__'].target || process.stdout).write(pfx + msg + "\n");
			} catch(e) {
				// just ignore this...
			}
			return true;
		}
		return false;
	};
	
	Logger.prototype.trace = function(msg) {
		var res = false;
		if (6 <= this._level) {
			var stack = new Error(msg).stack;
			if (stack) {
				res = this.msg(6, msg + "\n :Stack: \n" + stack);
			}
		}
		return res;
	};
	
	Logger.prototype.debug = function() {
		var msg = '' + arguments[0];
		var ret = this.msg(5, msg);
		if (arguments.length > 1) {
			for (var i=1; i<arguments.length; i++) {
				if (arguments[i] instanceof Error) {
					var err = arguments[i], 
						stack = err.stack;
					this.msg(5, ' :'+i+': Error['+err.type+']: ' + err.message);
					if (stack)
						this.msg(6, " :Stack: \n" + stack);
				} else
					this.msg(5, ' :'+i+': ' + util.inspect(arguments[i]));
			}
		}
		return ret;
	};
	
	Logger.prototype.info = function(msg) {
		return this.msg(4, msg);
	};
	Logger.prototype.log = function(msg) {
		return this.msg(3, msg);
	};
	Logger.prototype.warn = function(msg) {
		return this.msg(2, msg);
	};
	
	/**
	 * Logs an error
	 * @param {Error} msg
	 */
	Logger.prototype.error = function(msg) {
		if (msg instanceof Error) {
			msg = '['+(msg.type || 'unknown')+'] Error: ' + msg.message + "\n :Stack: \n" + msg.stack;
		}
		return this.msg(1, msg);
	};
	
	Logger.getInstance = function(name) {
		name = name && name.replace(/^\[|\]$/g, '') || '__';
		
		if (!instances[name]) {
			instances[name] = new Logger(name);
		}
		return instances[name];
	};

	/**
	 * 
	 * @param {Logger} base
	 */
	var SubLogger = function(base, name) {
		this._name = name;
		this._base = base;
	};
	
	SubLogger.prototype.msg = function(level, msg) {
		return this._base.msg(level, msg, this._name);
	};
	
	SubLogger.prototype.error = Logger.prototype.error;
	SubLogger.prototype.warn = Logger.prototype.warn;
	SubLogger.prototype.log = Logger.prototype.log;
	SubLogger.prototype.info = Logger.prototype.info;
	SubLogger.prototype.debug = Logger.prototype.debug;
	SubLogger.prototype.trace = Logger.prototype.trace;
	
	module.exports = Logger;
