/*! loglevel - v1.2.0 - https://github.com/pimterry/loglevel - (c) 2014 Tim Perry - licensed MIT */

Loglevel = function (options) {
    var self = {};
    if(options && options.prefix) {
        self.prefix = options.prefix;
    } else {
        self.prefix = '';
    }
    if(options && options.level) {
        self.level = options.level;
    } else {
        self.level = 'info';
    }
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj, self.prefix);
        } else {
            try {
                return Function.prototype.bind.call(method, obj, self.prefix);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    function enableLoggingWhenConsoleArrives(methodName, level) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods(level);
                self[methodName].apply(self, arguments);
            }
        };
    }

    var logMethods = [
        "trace",
        "fine",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function replaceLoggingMethods(level) {
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            self[methodName] = (i < level) ? noop : self.methodFactory(methodName, level);
        }
    }

    function persistLevelIfPossible(levelNum) {
        var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

        // Use localStorage if available
        try {
            window.localStorage['loglevel'] = levelName;
            return;
        } catch (ignore) {}

        // Use session cookie as fallback
        try {
            window.document.cookie = "loglevel=" + levelName + ";";
        } catch (ignore) {}
    }

    function loadPersistedLevel() {
        var storedLevel;

        try {
            storedLevel = window.localStorage['loglevel'];
        } catch (ignore) {}

        if (typeof storedLevel === undefinedType) {
            try {
                storedLevel = /loglevel=([^;]+)/.exec(window.document.cookie)[1];
            } catch (ignore) {}
        }

        if (self.levels[storedLevel] === undefined) {
            storedLevel = "WARN";
        }

        self.setLevel(self.levels[storedLevel]);
    }

    /*
     *
     * Public API
     *
     */

    self.levels = { "TRACE": 0, "FINE": 1, "DEBUG": 2, "INFO": 3, "WARN": 4,
        "ERROR": 5, "SILENT": 6};

    self.methodFactory = function (methodName, level) {
        return realMethod(methodName) ||
            enableLoggingWhenConsoleArrives(methodName, level);
    };

    self.setLevel = function (level) {
        if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
            level = self.levels[level.toUpperCase()];
        }
        if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
            //persistLevelIfPossible(level);
            self.level = level;
            replaceLoggingMethods(level);
            if (typeof console === undefinedType && level < self.levels.SILENT) {
                return "No console available for logging";
            }
        } else {
            throw "log.setLevel() called with invalid level: " + level;
        }
    };

    self.enableAll = function() {
        self.setLevel(self.levels.TRACE);
    };

    self.disableAll = function() {
        self.setLevel(self.levels.SILENT);
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    self.noConflict = function() {
        if (typeof window !== undefinedType &&
            window.log === self) {
            window.log = _log;
        }

        return self;
    };

    self.setPrefix = function(prefix) {
        if(typeof prefix === undefinedType || prefix === null) {
            prefix = '';
        }
        self.prefix = prefix;
        self.setLevel(self.level);
    };

    //loadPersistedLevel();
    self.setLevel(self.level);
    return self;
};

log = Loglevel({prefix: 'practicalmeteor:loglevel:'});

export { log };


if (this.practical == null) { this.practical = {}; }


(function() {
  let instance = undefined;
  const Cls = (practical.LoggerFactory = class LoggerFactory {
    static initClass() {

      instance = null;
    }

    static get() {
      return instance != null ? instance : (instance = new practical.LoggerFactory());
    }

    // The 'global' namespace is checked first, in order to allow people to enforce
    // a loglevel across the board.
    _getSettingsLoglevel(namespace, defaultLevel){
      let level;
      if (namespace == null) { namespace = ''; }
      if (defaultLevel == null) { defaultLevel = 'info'; }
      const globalLevel = this._getNamespaceLoglevel('global');
      if (globalLevel != null) { return globalLevel; }
      if (namespace.length > 0) { level = this._getNamespaceLoglevel(namespace); }
      if (level == null) { level = this._getNamespaceLoglevel('default'); }
      return level != null ? level : (level = defaultLevel);
    }

    // @returns Meteor.settings.loglevel.namespace server side
    // or if called client side or it doesn't exist server side,
    // Meteor.settings.public.loglevel.namespace.
    // This allows to set only public loglevel for both client and server side.
    _getNamespaceLoglevel(namespace){
      let level = __guard__(__guard__(Meteor.settings != null ? Meteor.settings.public : undefined, x1 => x1.loglevel), x => x[namespace]);
      if (Meteor.isServer) {
        const serverLevel = __guard__(Meteor.settings != null ? Meteor.settings.loglevel : undefined, x2 => x2[namespace]);
        if (serverLevel != null) { level = serverLevel; }
      }
      return level;
    }

    createLogger(namespace, defaultLevel){
      if (namespace == null) { namespace = ''; }
      if (defaultLevel == null) { defaultLevel = 'info'; }

      const options = {};
      if (namespace.length > 0) { options.prefix = namespace + ':'; }
      options.level = this._getSettingsLoglevel(namespace, defaultLevel);
      const log = Loglevel(options)

      return log;
    }

    createPackageLogger(packageName, defaultLevel){
      if (defaultLevel == null) { defaultLevel = 'info'; }
      return this.createLogger(packageName, defaultLevel);
    }

    createAppLogger(appName, defaultLevel){
      if (appName == null) { appName = 'app'; }
      if (defaultLevel == null) { defaultLevel = 'info'; }
      return this.createLogger(appName, defaultLevel);
    }
  });
  Cls.initClass();
  return Cls;
})();

const LoggerFactory = practical.LoggerFactory.get();

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}

export class ObjectLogger {

  constructor(className, defaultLevel){
    this.className = className;

    if (defaultLevel == null) { defaultLevel = 'info'; }

    this.defaultLevel = defaultLevel;
    this.log = loglevel.createLogger(this.className, this.defaultLevel);

    this.callStack = [];

    this.log.enter = this.bindMethod(this.enter, 'debug');
    this.log.fineEnter = this.bindMethod(this.enter, 'fine');
    this.log.return = this.bindMethod(this.return, 'debug');
    this.log.fineReturn = this.bindMethod(this.return, 'fine');

    return this.log;
  }

  enter(level, ...args){
    if (args.length === 0) { throw new Error(('ObjectLogger: No method name provided to enter')); }
    const methodName = args.shift();
    this.callStack.unshift(methodName);
    this.log.setPrefix(`${this.className}.${methodName}:`);
    args.unshift('ENTER');
    return this.log[level].apply(this.log, args);
  }

  return(level){
    this.log[level].call(this.log, 'RETURN');
    this.callStack.shift();
    if (this.callStack.length > 0) {
      const methodName = this.callStack[0];
      return this.log.setPrefix(`${this.className}.${methodName}:`);
    }
  }


  bindMethod(method, level) {
    if (typeof method.bind === 'function') {
      return method.bind(this, level);
    } else {
      try {
        return Function.prototype.bind.call(method, this, level);
      } catch (e) {
      // Missing bind shim or IE8 + Modernizr, fallback to wrapping
        return (...args)=> {
          args.unshift(level);
          return Function.prototype.apply.apply(method, [
            this,
            args
          ]);
        };
      }
    }
  }
}

export default ObjectLogger;
