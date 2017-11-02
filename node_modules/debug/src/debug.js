const escapeStringRegexp = require('escape-string-regexp');

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.reset = reset;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];



/**
 * Namespace patterns to output or skip.
 */
function reset() {
  exports.includes = [];
  exports.excludes = [];  
}
reset();



/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */
exports.formatters = {};



/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */
function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}



/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */
function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}


/**
 * Removes this instance from scope.
 *
 * @api public
 */
function destroy() {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}




/**
 * Enables all namespaces, or namespaces by regular expression or string match. 
 *  Wildcard strings('*') maintained for legacy applications.
 *
 * @param pattern 
 *    {Boolean|'*'|undefined} all namespaces
 *    {RegExp} namespaces that match this regex
 *    {String|'*'} specific namespace, or comma-separated namespaces
 *  
 * @api public
 */
function enable(pattern) {
  if (typeof pattern === 'boolean' && pattern === false) {
    return disable();
  }
  const patterns = conform(pattern);

  for (var i in patterns) {
    const included = hasPattern(exports.includes, patterns[i]);
    if (included === undefined) {
      exports.includes.push(patterns[i]);
    }
    const excluded = hasPattern(exports.excludes, patterns[i]);
    if (excluded !== undefined) {
      exports.excludes.splice(excluded, 1);
    }
  }
  updateEnabled();
}



/**
 * Disables all namespaces, or namespaces by regular expression or string match. 
 *  Wildcard strings('*') maintained for legacy applications.
 *
 * @param pattern 
 *    {Boolean|'*'|undefined} all namespaces
 *    {RegExp} namespaces that match this regex
 *    {String|'*'} specific namespace, or comma-separated namespaces
 *  
 * @api public
 */
function disable(pattern) {
  if (typeof pattern === 'boolean' && pattern === true) {
    return enable();
  }
  const patterns = conform(pattern);

  for (var i in patterns) {
    const included = hasPattern(exports.includes, patterns[i]);
    if (included !== undefined) {
      exports.includes.splice(included, 1);
    }
    const excluded = hasPattern(exports.excludes, patterns[i]);
    if (excluded === undefined) {
      exports.excludes.push(patterns[i]);
    }
  }
  updateEnabled();
}



/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} namespace
 * @return {Boolean}
 * @api public
 */
function enabled(namespace) {
  // console.log('\nenabled?');
  // console.log(' includes:');
  var isIncluded = false;
  for (var i in exports.includes) {
    if (exports.includes[i].test(namespace)) {
      // console.log(' -', namespace, 'included');
      isIncluded = true;
      break;
    }
  }
  // console.log(' excludes:');
  var isExcluded = false;
  for (var j in exports.excludes) {
    if (exports.excludes[j].test(namespace)) {
      // console.log(' -', namespace, 'excluded');
      isExcluded = true;
      break;
    }
  }
  if (isIncluded && !isExcluded) {
    return true;
  }
  else {
    return false;
  }
}



/**
 * Conform a namespace argument
 *
 * @param {Mixed}
 * @api private
 */
function conform(pattern) {
  var debug = false;
  if (debug) console.log('>>', pattern);

  var patterns = [];

  // pattern is a list, recurse items
  if (pattern instanceof Array) {
    for (var i in pattern) {
      patterns = patterns.concat(
        conform(pattern[i])
      );
    }
  }
  // pattern is boolean or undefined, assume all
  else if (typeof pattern === 'boolean' || pattern === undefined) {
    patterns.push(
      new RegExp('.*?')
    );
  }
  // pattern is a regular expression, concat
  else if (pattern instanceof RegExp) {
    patterns.push(
      pattern
    );
  }
  // pattern is a string
  else {
    const ns = pattern.split(/[\s,]+/);
    // recurse multiple comma/space separated namespaces
    if (ns.length > 1) {
      for (var j in ns) {
        patterns = patterns.concat(
          conform(ns[j])
        );
      }
    }
    // single namespace
    else {
      // support for string regex, like: '/test:.*/', convert to regex
      if (pattern.match(/^\/.*\/$/)) {
        patterns.push(
          new RegExp(pattern.slice(1, -1))
        );        
      }
      // support for wildcard strings "*", replace with appropriate regex
      else if (pattern.match(/\*/)) {
        patterns = patterns.concat(
          new RegExp(pattern.replace(/\*/g, '.*?'))
        );
      }
      // support for exclusion strings starting with "-", send to disable
      else if (pattern.match(/^-/)) {
        disable(pattern.slice(1));
      }
      // normal string, escape for regex
      else {
        patterns = patterns.concat(
          new RegExp(escapeStringRegexp(ns[0]))
        );
      }
    }
  }
  if (debug) console.log('<<', patterns);
  return patterns;
}


/**
 * Does array have a matching regex?
 *
 * @param {Array} list of patterns
 * @param {RegExp} RegExp object to check against
 * @api private
 */
function hasPattern(patterns, pattern) {
  for (var i in patterns) {
    if (String(patterns[i]) === String(pattern)) {
      return i;
    }
  }
}


/**
 * Sets all debug instaces with current enabled states.
*
 * @api private
 */
function updateEnabled() {
  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }  
}



/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */
function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
