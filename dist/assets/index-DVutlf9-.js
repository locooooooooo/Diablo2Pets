var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
var react = { exports: {} };
var react_production_min = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReact_production_min;
function requireReact_production_min() {
  if (hasRequiredReact_production_min) return react_production_min;
  hasRequiredReact_production_min = 1;
  var l = Symbol.for("react.element"), n = Symbol.for("react.portal"), p = Symbol.for("react.fragment"), q = Symbol.for("react.strict_mode"), r = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), z = Symbol.iterator;
  function A(a) {
    if (null === a || "object" !== typeof a) return null;
    a = z && a[z] || a["@@iterator"];
    return "function" === typeof a ? a : null;
  }
  var B = { isMounted: function() {
    return false;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, C = Object.assign, D = {};
  function E(a, b, e) {
    this.props = a;
    this.context = b;
    this.refs = D;
    this.updater = e || B;
  }
  E.prototype.isReactComponent = {};
  E.prototype.setState = function(a, b) {
    if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, a, b, "setState");
  };
  E.prototype.forceUpdate = function(a) {
    this.updater.enqueueForceUpdate(this, a, "forceUpdate");
  };
  function F() {
  }
  F.prototype = E.prototype;
  function G(a, b, e) {
    this.props = a;
    this.context = b;
    this.refs = D;
    this.updater = e || B;
  }
  var H = G.prototype = new F();
  H.constructor = G;
  C(H, E.prototype);
  H.isPureReactComponent = true;
  var I = Array.isArray, J = Object.prototype.hasOwnProperty, K = { current: null }, L = { key: true, ref: true, __self: true, __source: true };
  function M(a, b, e) {
    var d, c = {}, k = null, h = null;
    if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
    var g = arguments.length - 2;
    if (1 === g) c.children = e;
    else if (1 < g) {
      for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
      c.children = f;
    }
    if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
    return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
  }
  function N(a, b) {
    return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
  }
  function O(a) {
    return "object" === typeof a && null !== a && a.$$typeof === l;
  }
  function escape(a) {
    var b = { "=": "=0", ":": "=2" };
    return "$" + a.replace(/[=:]/g, function(a2) {
      return b[a2];
    });
  }
  var P = /\/+/g;
  function Q(a, b) {
    return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
  }
  function R(a, b, e, d, c) {
    var k = typeof a;
    if ("undefined" === k || "boolean" === k) a = null;
    var h = false;
    if (null === a) h = true;
    else switch (k) {
      case "string":
      case "number":
        h = true;
        break;
      case "object":
        switch (a.$$typeof) {
          case l:
          case n:
            h = true;
        }
    }
    if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
      return a2;
    })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
    h = 0;
    d = "" === d ? "." : d + ":";
    if (I(a)) for (var g = 0; g < a.length; g++) {
      k = a[g];
      var f = d + Q(k, g);
      h += R(k, b, e, f, c);
    }
    else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
    else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
    return h;
  }
  function S(a, b, e) {
    if (null == a) return a;
    var d = [], c = 0;
    R(a, d, "", "", function(a2) {
      return b.call(e, a2, c++);
    });
    return d;
  }
  function T(a) {
    if (-1 === a._status) {
      var b = a._result;
      b = b();
      b.then(function(b2) {
        if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
      }, function(b2) {
        if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
      });
      -1 === a._status && (a._status = 0, a._result = b);
    }
    if (1 === a._status) return a._result.default;
    throw a._result;
  }
  var U = { current: null }, V = { transition: null }, W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
  function X() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  react_production_min.Children = { map: S, forEach: function(a, b, e) {
    S(a, function() {
      b.apply(this, arguments);
    }, e);
  }, count: function(a) {
    var b = 0;
    S(a, function() {
      b++;
    });
    return b;
  }, toArray: function(a) {
    return S(a, function(a2) {
      return a2;
    }) || [];
  }, only: function(a) {
    if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
    return a;
  } };
  react_production_min.Component = E;
  react_production_min.Fragment = p;
  react_production_min.Profiler = r;
  react_production_min.PureComponent = G;
  react_production_min.StrictMode = q;
  react_production_min.Suspense = w;
  react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
  react_production_min.act = X;
  react_production_min.cloneElement = function(a, b, e) {
    if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
    var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
    if (null != b) {
      void 0 !== b.ref && (k = b.ref, h = K.current);
      void 0 !== b.key && (c = "" + b.key);
      if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
      for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
    }
    var f = arguments.length - 2;
    if (1 === f) d.children = e;
    else if (1 < f) {
      g = Array(f);
      for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
      d.children = g;
    }
    return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
  };
  react_production_min.createContext = function(a) {
    a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
    a.Provider = { $$typeof: t, _context: a };
    return a.Consumer = a;
  };
  react_production_min.createElement = M;
  react_production_min.createFactory = function(a) {
    var b = M.bind(null, a);
    b.type = a;
    return b;
  };
  react_production_min.createRef = function() {
    return { current: null };
  };
  react_production_min.forwardRef = function(a) {
    return { $$typeof: v, render: a };
  };
  react_production_min.isValidElement = O;
  react_production_min.lazy = function(a) {
    return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
  };
  react_production_min.memo = function(a, b) {
    return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
  };
  react_production_min.startTransition = function(a) {
    var b = V.transition;
    V.transition = {};
    try {
      a();
    } finally {
      V.transition = b;
    }
  };
  react_production_min.unstable_act = X;
  react_production_min.useCallback = function(a, b) {
    return U.current.useCallback(a, b);
  };
  react_production_min.useContext = function(a) {
    return U.current.useContext(a);
  };
  react_production_min.useDebugValue = function() {
  };
  react_production_min.useDeferredValue = function(a) {
    return U.current.useDeferredValue(a);
  };
  react_production_min.useEffect = function(a, b) {
    return U.current.useEffect(a, b);
  };
  react_production_min.useId = function() {
    return U.current.useId();
  };
  react_production_min.useImperativeHandle = function(a, b, e) {
    return U.current.useImperativeHandle(a, b, e);
  };
  react_production_min.useInsertionEffect = function(a, b) {
    return U.current.useInsertionEffect(a, b);
  };
  react_production_min.useLayoutEffect = function(a, b) {
    return U.current.useLayoutEffect(a, b);
  };
  react_production_min.useMemo = function(a, b) {
    return U.current.useMemo(a, b);
  };
  react_production_min.useReducer = function(a, b, e) {
    return U.current.useReducer(a, b, e);
  };
  react_production_min.useRef = function(a) {
    return U.current.useRef(a);
  };
  react_production_min.useState = function(a) {
    return U.current.useState(a);
  };
  react_production_min.useSyncExternalStore = function(a, b, e) {
    return U.current.useSyncExternalStore(a, b, e);
  };
  react_production_min.useTransition = function() {
    return U.current.useTransition();
  };
  react_production_min.version = "18.3.1";
  return react_production_min;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production_min();
  }
  return react.exports;
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production_min;
function requireReactJsxRuntime_production_min() {
  if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
  hasRequiredReactJsxRuntime_production_min = 1;
  var f = requireReact(), k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
  function q(c, a, g) {
    var b, d = {}, e = null, h = null;
    void 0 !== g && (e = "" + g);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (h = a.ref);
    for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
    if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
    return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
  }
  reactJsxRuntime_production_min.Fragment = l;
  reactJsxRuntime_production_min.jsx = q;
  reactJsxRuntime_production_min.jsxs = q;
  return reactJsxRuntime_production_min;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production_min();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
var reactExports = requireReact();
const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
var client = {};
var reactDom = { exports: {} };
var reactDom_production_min = {};
var scheduler = { exports: {} };
var scheduler_production_min = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredScheduler_production_min;
function requireScheduler_production_min() {
  if (hasRequiredScheduler_production_min) return scheduler_production_min;
  hasRequiredScheduler_production_min = 1;
  (function(exports$1) {
    function f(a, b) {
      var c = a.length;
      a.push(b);
      a: for (; 0 < c; ) {
        var d = c - 1 >>> 1, e = a[d];
        if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
        else break a;
      }
    }
    function h(a) {
      return 0 === a.length ? null : a[0];
    }
    function k(a) {
      if (0 === a.length) return null;
      var b = a[0], c = a.pop();
      if (c !== b) {
        a[0] = c;
        a: for (var d = 0, e = a.length, w = e >>> 1; d < w; ) {
          var m = 2 * (d + 1) - 1, C = a[m], n = m + 1, x = a[n];
          if (0 > g(C, c)) n < e && 0 > g(x, C) ? (a[d] = x, a[n] = c, d = n) : (a[d] = C, a[m] = c, d = m);
          else if (n < e && 0 > g(x, c)) a[d] = x, a[n] = c, d = n;
          else break a;
        }
      }
      return b;
    }
    function g(a, b) {
      var c = a.sortIndex - b.sortIndex;
      return 0 !== c ? c : a.id - b.id;
    }
    if ("object" === typeof performance && "function" === typeof performance.now) {
      var l = performance;
      exports$1.unstable_now = function() {
        return l.now();
      };
    } else {
      var p = Date, q = p.now();
      exports$1.unstable_now = function() {
        return p.now() - q;
      };
    }
    var r = [], t = [], u = 1, v = null, y = 3, z = false, A = false, B = false, D = "function" === typeof setTimeout ? setTimeout : null, E = "function" === typeof clearTimeout ? clearTimeout : null, F = "undefined" !== typeof setImmediate ? setImmediate : null;
    "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function G(a) {
      for (var b = h(t); null !== b; ) {
        if (null === b.callback) k(t);
        else if (b.startTime <= a) k(t), b.sortIndex = b.expirationTime, f(r, b);
        else break;
        b = h(t);
      }
    }
    function H(a) {
      B = false;
      G(a);
      if (!A) if (null !== h(r)) A = true, I(J);
      else {
        var b = h(t);
        null !== b && K(H, b.startTime - a);
      }
    }
    function J(a, b) {
      A = false;
      B && (B = false, E(L), L = -1);
      z = true;
      var c = y;
      try {
        G(b);
        for (v = h(r); null !== v && (!(v.expirationTime > b) || a && !M()); ) {
          var d = v.callback;
          if ("function" === typeof d) {
            v.callback = null;
            y = v.priorityLevel;
            var e = d(v.expirationTime <= b);
            b = exports$1.unstable_now();
            "function" === typeof e ? v.callback = e : v === h(r) && k(r);
            G(b);
          } else k(r);
          v = h(r);
        }
        if (null !== v) var w = true;
        else {
          var m = h(t);
          null !== m && K(H, m.startTime - b);
          w = false;
        }
        return w;
      } finally {
        v = null, y = c, z = false;
      }
    }
    var N = false, O = null, L = -1, P = 5, Q = -1;
    function M() {
      return exports$1.unstable_now() - Q < P ? false : true;
    }
    function R() {
      if (null !== O) {
        var a = exports$1.unstable_now();
        Q = a;
        var b = true;
        try {
          b = O(true, a);
        } finally {
          b ? S() : (N = false, O = null);
        }
      } else N = false;
    }
    var S;
    if ("function" === typeof F) S = function() {
      F(R);
    };
    else if ("undefined" !== typeof MessageChannel) {
      var T = new MessageChannel(), U = T.port2;
      T.port1.onmessage = R;
      S = function() {
        U.postMessage(null);
      };
    } else S = function() {
      D(R, 0);
    };
    function I(a) {
      O = a;
      N || (N = true, S());
    }
    function K(a, b) {
      L = D(function() {
        a(exports$1.unstable_now());
      }, b);
    }
    exports$1.unstable_IdlePriority = 5;
    exports$1.unstable_ImmediatePriority = 1;
    exports$1.unstable_LowPriority = 4;
    exports$1.unstable_NormalPriority = 3;
    exports$1.unstable_Profiling = null;
    exports$1.unstable_UserBlockingPriority = 2;
    exports$1.unstable_cancelCallback = function(a) {
      a.callback = null;
    };
    exports$1.unstable_continueExecution = function() {
      A || z || (A = true, I(J));
    };
    exports$1.unstable_forceFrameRate = function(a) {
      0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a ? Math.floor(1e3 / a) : 5;
    };
    exports$1.unstable_getCurrentPriorityLevel = function() {
      return y;
    };
    exports$1.unstable_getFirstCallbackNode = function() {
      return h(r);
    };
    exports$1.unstable_next = function(a) {
      switch (y) {
        case 1:
        case 2:
        case 3:
          var b = 3;
          break;
        default:
          b = y;
      }
      var c = y;
      y = b;
      try {
        return a();
      } finally {
        y = c;
      }
    };
    exports$1.unstable_pauseExecution = function() {
    };
    exports$1.unstable_requestPaint = function() {
    };
    exports$1.unstable_runWithPriority = function(a, b) {
      switch (a) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          a = 3;
      }
      var c = y;
      y = a;
      try {
        return b();
      } finally {
        y = c;
      }
    };
    exports$1.unstable_scheduleCallback = function(a, b, c) {
      var d = exports$1.unstable_now();
      "object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
      switch (a) {
        case 1:
          var e = -1;
          break;
        case 2:
          e = 250;
          break;
        case 5:
          e = 1073741823;
          break;
        case 4:
          e = 1e4;
          break;
        default:
          e = 5e3;
      }
      e = c + e;
      a = { id: u++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
      c > d ? (a.sortIndex = c, f(t, a), null === h(r) && a === h(t) && (B ? (E(L), L = -1) : B = true, K(H, c - d))) : (a.sortIndex = e, f(r, a), A || z || (A = true, I(J)));
      return a;
    };
    exports$1.unstable_shouldYield = M;
    exports$1.unstable_wrapCallback = function(a) {
      var b = y;
      return function() {
        var c = y;
        y = b;
        try {
          return a.apply(this, arguments);
        } finally {
          y = c;
        }
      };
    };
  })(scheduler_production_min);
  return scheduler_production_min;
}
var hasRequiredScheduler;
function requireScheduler() {
  if (hasRequiredScheduler) return scheduler.exports;
  hasRequiredScheduler = 1;
  {
    scheduler.exports = requireScheduler_production_min();
  }
  return scheduler.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactDom_production_min;
function requireReactDom_production_min() {
  if (hasRequiredReactDom_production_min) return reactDom_production_min;
  hasRequiredReactDom_production_min = 1;
  var aa = requireReact(), ca = requireScheduler();
  function p(a) {
    for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
    return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var da = /* @__PURE__ */ new Set(), ea = {};
  function fa(a, b) {
    ha(a, b);
    ha(a + "Capture", b);
  }
  function ha(a, b) {
    ea[a] = b;
    for (a = 0; a < b.length; a++) da.add(b[a]);
  }
  var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), ja = Object.prototype.hasOwnProperty, ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, la = {}, ma = {};
  function oa(a) {
    if (ja.call(ma, a)) return true;
    if (ja.call(la, a)) return false;
    if (ka.test(a)) return ma[a] = true;
    la[a] = true;
    return false;
  }
  function pa(a, b, c, d) {
    if (null !== c && 0 === c.type) return false;
    switch (typeof b) {
      case "function":
      case "symbol":
        return true;
      case "boolean":
        if (d) return false;
        if (null !== c) return !c.acceptsBooleans;
        a = a.toLowerCase().slice(0, 5);
        return "data-" !== a && "aria-" !== a;
      default:
        return false;
    }
  }
  function qa(a, b, c, d) {
    if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return true;
    if (d) return false;
    if (null !== c) switch (c.type) {
      case 3:
        return !b;
      case 4:
        return false === b;
      case 5:
        return isNaN(b);
      case 6:
        return isNaN(b) || 1 > b;
    }
    return false;
  }
  function v(a, b, c, d, e, f, g) {
    this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
    this.attributeName = d;
    this.attributeNamespace = e;
    this.mustUseProperty = c;
    this.propertyName = a;
    this.type = b;
    this.sanitizeURL = f;
    this.removeEmptyString = g;
  }
  var z = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
    z[a] = new v(a, 0, false, a, null, false, false);
  });
  [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
    var b = a[0];
    z[b] = new v(b, 1, false, a[1], null, false, false);
  });
  ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
    z[a] = new v(a, 2, false, a.toLowerCase(), null, false, false);
  });
  ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
    z[a] = new v(a, 2, false, a, null, false, false);
  });
  "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
    z[a] = new v(a, 3, false, a.toLowerCase(), null, false, false);
  });
  ["checked", "multiple", "muted", "selected"].forEach(function(a) {
    z[a] = new v(a, 3, true, a, null, false, false);
  });
  ["capture", "download"].forEach(function(a) {
    z[a] = new v(a, 4, false, a, null, false, false);
  });
  ["cols", "rows", "size", "span"].forEach(function(a) {
    z[a] = new v(a, 6, false, a, null, false, false);
  });
  ["rowSpan", "start"].forEach(function(a) {
    z[a] = new v(a, 5, false, a.toLowerCase(), null, false, false);
  });
  var ra = /[\-:]([a-z])/g;
  function sa(a) {
    return a[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
    var b = a.replace(
      ra,
      sa
    );
    z[b] = new v(b, 1, false, a, null, false, false);
  });
  "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
    var b = a.replace(ra, sa);
    z[b] = new v(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
  });
  ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
    var b = a.replace(ra, sa);
    z[b] = new v(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
  });
  ["tabIndex", "crossOrigin"].forEach(function(a) {
    z[a] = new v(a, 1, false, a.toLowerCase(), null, false, false);
  });
  z.xlinkHref = new v("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
  ["src", "href", "action", "formAction"].forEach(function(a) {
    z[a] = new v(a, 1, false, a.toLowerCase(), null, true, true);
  });
  function ta(a, b, c, d) {
    var e = z.hasOwnProperty(b) ? z[b] : null;
    if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? false : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && true === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
  }
  var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, va = Symbol.for("react.element"), wa = Symbol.for("react.portal"), ya = Symbol.for("react.fragment"), za = Symbol.for("react.strict_mode"), Aa = Symbol.for("react.profiler"), Ba = Symbol.for("react.provider"), Ca = Symbol.for("react.context"), Da = Symbol.for("react.forward_ref"), Ea = Symbol.for("react.suspense"), Fa = Symbol.for("react.suspense_list"), Ga = Symbol.for("react.memo"), Ha = Symbol.for("react.lazy");
  var Ia = Symbol.for("react.offscreen");
  var Ja = Symbol.iterator;
  function Ka(a) {
    if (null === a || "object" !== typeof a) return null;
    a = Ja && a[Ja] || a["@@iterator"];
    return "function" === typeof a ? a : null;
  }
  var A = Object.assign, La;
  function Ma(a) {
    if (void 0 === La) try {
      throw Error();
    } catch (c) {
      var b = c.stack.trim().match(/\n( *(at )?)/);
      La = b && b[1] || "";
    }
    return "\n" + La + a;
  }
  var Na = false;
  function Oa(a, b) {
    if (!a || Na) return "";
    Na = true;
    var c = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (b) if (b = function() {
        throw Error();
      }, Object.defineProperty(b.prototype, "props", { set: function() {
        throw Error();
      } }), "object" === typeof Reflect && Reflect.construct) {
        try {
          Reflect.construct(b, []);
        } catch (l) {
          var d = l;
        }
        Reflect.construct(a, [], b);
      } else {
        try {
          b.call();
        } catch (l) {
          d = l;
        }
        a.call(b.prototype);
      }
      else {
        try {
          throw Error();
        } catch (l) {
          d = l;
        }
        a();
      }
    } catch (l) {
      if (l && d && "string" === typeof l.stack) {
        for (var e = l.stack.split("\n"), f = d.stack.split("\n"), g = e.length - 1, h = f.length - 1; 1 <= g && 0 <= h && e[g] !== f[h]; ) h--;
        for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f[h]) {
          if (1 !== g || 1 !== h) {
            do
              if (g--, h--, 0 > h || e[g] !== f[h]) {
                var k = "\n" + e[g].replace(" at new ", " at ");
                a.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", a.displayName));
                return k;
              }
            while (1 <= g && 0 <= h);
          }
          break;
        }
      }
    } finally {
      Na = false, Error.prepareStackTrace = c;
    }
    return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
  }
  function Pa(a) {
    switch (a.tag) {
      case 5:
        return Ma(a.type);
      case 16:
        return Ma("Lazy");
      case 13:
        return Ma("Suspense");
      case 19:
        return Ma("SuspenseList");
      case 0:
      case 2:
      case 15:
        return a = Oa(a.type, false), a;
      case 11:
        return a = Oa(a.type.render, false), a;
      case 1:
        return a = Oa(a.type, true), a;
      default:
        return "";
    }
  }
  function Qa(a) {
    if (null == a) return null;
    if ("function" === typeof a) return a.displayName || a.name || null;
    if ("string" === typeof a) return a;
    switch (a) {
      case ya:
        return "Fragment";
      case wa:
        return "Portal";
      case Aa:
        return "Profiler";
      case za:
        return "StrictMode";
      case Ea:
        return "Suspense";
      case Fa:
        return "SuspenseList";
    }
    if ("object" === typeof a) switch (a.$$typeof) {
      case Ca:
        return (a.displayName || "Context") + ".Consumer";
      case Ba:
        return (a._context.displayName || "Context") + ".Provider";
      case Da:
        var b = a.render;
        a = a.displayName;
        a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
        return a;
      case Ga:
        return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
      case Ha:
        b = a._payload;
        a = a._init;
        try {
          return Qa(a(b));
        } catch (c) {
        }
    }
    return null;
  }
  function Ra(a) {
    var b = a.type;
    switch (a.tag) {
      case 24:
        return "Cache";
      case 9:
        return (b.displayName || "Context") + ".Consumer";
      case 10:
        return (b._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return b;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return Qa(b);
      case 8:
        return b === za ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if ("function" === typeof b) return b.displayName || b.name || null;
        if ("string" === typeof b) return b;
    }
    return null;
  }
  function Sa(a) {
    switch (typeof a) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return a;
      case "object":
        return a;
      default:
        return "";
    }
  }
  function Ta(a) {
    var b = a.type;
    return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
  }
  function Ua(a) {
    var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
    if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
      var e = c.get, f = c.set;
      Object.defineProperty(a, b, { configurable: true, get: function() {
        return e.call(this);
      }, set: function(a2) {
        d = "" + a2;
        f.call(this, a2);
      } });
      Object.defineProperty(a, b, { enumerable: c.enumerable });
      return { getValue: function() {
        return d;
      }, setValue: function(a2) {
        d = "" + a2;
      }, stopTracking: function() {
        a._valueTracker = null;
        delete a[b];
      } };
    }
  }
  function Va(a) {
    a._valueTracker || (a._valueTracker = Ua(a));
  }
  function Wa(a) {
    if (!a) return false;
    var b = a._valueTracker;
    if (!b) return true;
    var c = b.getValue();
    var d = "";
    a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
    a = d;
    return a !== c ? (b.setValue(a), true) : false;
  }
  function Xa(a) {
    a = a || ("undefined" !== typeof document ? document : void 0);
    if ("undefined" === typeof a) return null;
    try {
      return a.activeElement || a.body;
    } catch (b) {
      return a.body;
    }
  }
  function Ya(a, b) {
    var c = b.checked;
    return A({}, b, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c ? c : a._wrapperState.initialChecked });
  }
  function Za(a, b) {
    var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
    c = Sa(null != b.value ? b.value : c);
    a._wrapperState = { initialChecked: d, initialValue: c, controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value };
  }
  function ab(a, b) {
    b = b.checked;
    null != b && ta(a, "checked", b, false);
  }
  function bb(a, b) {
    ab(a, b);
    var c = Sa(b.value), d = b.type;
    if (null != c) if ("number" === d) {
      if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
    } else a.value !== "" + c && (a.value = "" + c);
    else if ("submit" === d || "reset" === d) {
      a.removeAttribute("value");
      return;
    }
    b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
    null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
  }
  function db(a, b, c) {
    if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
      var d = b.type;
      if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
      b = "" + a._wrapperState.initialValue;
      c || b === a.value || (a.value = b);
      a.defaultValue = b;
    }
    c = a.name;
    "" !== c && (a.name = "");
    a.defaultChecked = !!a._wrapperState.initialChecked;
    "" !== c && (a.name = c);
  }
  function cb(a, b, c) {
    if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
  }
  var eb = Array.isArray;
  function fb(a, b, c, d) {
    a = a.options;
    if (b) {
      b = {};
      for (var e = 0; e < c.length; e++) b["$" + c[e]] = true;
      for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = true);
    } else {
      c = "" + Sa(c);
      b = null;
      for (e = 0; e < a.length; e++) {
        if (a[e].value === c) {
          a[e].selected = true;
          d && (a[e].defaultSelected = true);
          return;
        }
        null !== b || a[e].disabled || (b = a[e]);
      }
      null !== b && (b.selected = true);
    }
  }
  function gb(a, b) {
    if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
    return A({}, b, { value: void 0, defaultValue: void 0, children: "" + a._wrapperState.initialValue });
  }
  function hb(a, b) {
    var c = b.value;
    if (null == c) {
      c = b.children;
      b = b.defaultValue;
      if (null != c) {
        if (null != b) throw Error(p(92));
        if (eb(c)) {
          if (1 < c.length) throw Error(p(93));
          c = c[0];
        }
        b = c;
      }
      null == b && (b = "");
      c = b;
    }
    a._wrapperState = { initialValue: Sa(c) };
  }
  function ib(a, b) {
    var c = Sa(b.value), d = Sa(b.defaultValue);
    null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
    null != d && (a.defaultValue = "" + d);
  }
  function jb(a) {
    var b = a.textContent;
    b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
  }
  function kb(a) {
    switch (a) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function lb(a, b) {
    return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
  }
  var mb, nb = (function(a) {
    return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
      MSApp.execUnsafeLocalFunction(function() {
        return a(b, c, d, e);
      });
    } : a;
  })(function(a, b) {
    if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
    else {
      mb = mb || document.createElement("div");
      mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
      for (b = mb.firstChild; a.firstChild; ) a.removeChild(a.firstChild);
      for (; b.firstChild; ) a.appendChild(b.firstChild);
    }
  });
  function ob(a, b) {
    if (b) {
      var c = a.firstChild;
      if (c && c === a.lastChild && 3 === c.nodeType) {
        c.nodeValue = b;
        return;
      }
    }
    a.textContent = b;
  }
  var pb = {
    animationIterationCount: true,
    aspectRatio: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    columns: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridArea: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowSpan: true,
    gridRowStart: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnSpan: true,
    gridColumnStart: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
  }, qb = ["Webkit", "ms", "Moz", "O"];
  Object.keys(pb).forEach(function(a) {
    qb.forEach(function(b) {
      b = b + a.charAt(0).toUpperCase() + a.substring(1);
      pb[b] = pb[a];
    });
  });
  function rb(a, b, c) {
    return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
  }
  function sb(a, b) {
    a = a.style;
    for (var c in b) if (b.hasOwnProperty(c)) {
      var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
      "float" === c && (c = "cssFloat");
      d ? a.setProperty(c, e) : a[c] = e;
    }
  }
  var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
  function ub(a, b) {
    if (b) {
      if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
      if (null != b.dangerouslySetInnerHTML) {
        if (null != b.children) throw Error(p(60));
        if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
      }
      if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
    }
  }
  function vb(a, b) {
    if (-1 === a.indexOf("-")) return "string" === typeof b.is;
    switch (a) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var wb = null;
  function xb(a) {
    a = a.target || a.srcElement || window;
    a.correspondingUseElement && (a = a.correspondingUseElement);
    return 3 === a.nodeType ? a.parentNode : a;
  }
  var yb = null, zb = null, Ab = null;
  function Bb(a) {
    if (a = Cb(a)) {
      if ("function" !== typeof yb) throw Error(p(280));
      var b = a.stateNode;
      b && (b = Db(b), yb(a.stateNode, a.type, b));
    }
  }
  function Eb(a) {
    zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
  }
  function Fb() {
    if (zb) {
      var a = zb, b = Ab;
      Ab = zb = null;
      Bb(a);
      if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
    }
  }
  function Gb(a, b) {
    return a(b);
  }
  function Hb() {
  }
  var Ib = false;
  function Jb(a, b, c) {
    if (Ib) return a(b, c);
    Ib = true;
    try {
      return Gb(a, b, c);
    } finally {
      if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
    }
  }
  function Kb(a, b) {
    var c = a.stateNode;
    if (null === c) return null;
    var d = Db(c);
    if (null === d) return null;
    c = d[b];
    a: switch (b) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
        a = !d;
        break a;
      default:
        a = false;
    }
    if (a) return null;
    if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
    return c;
  }
  var Lb = false;
  if (ia) try {
    var Mb = {};
    Object.defineProperty(Mb, "passive", { get: function() {
      Lb = true;
    } });
    window.addEventListener("test", Mb, Mb);
    window.removeEventListener("test", Mb, Mb);
  } catch (a) {
    Lb = false;
  }
  function Nb(a, b, c, d, e, f, g, h, k) {
    var l = Array.prototype.slice.call(arguments, 3);
    try {
      b.apply(c, l);
    } catch (m) {
      this.onError(m);
    }
  }
  var Ob = false, Pb = null, Qb = false, Rb = null, Sb = { onError: function(a) {
    Ob = true;
    Pb = a;
  } };
  function Tb(a, b, c, d, e, f, g, h, k) {
    Ob = false;
    Pb = null;
    Nb.apply(Sb, arguments);
  }
  function Ub(a, b, c, d, e, f, g, h, k) {
    Tb.apply(this, arguments);
    if (Ob) {
      if (Ob) {
        var l = Pb;
        Ob = false;
        Pb = null;
      } else throw Error(p(198));
      Qb || (Qb = true, Rb = l);
    }
  }
  function Vb(a) {
    var b = a, c = a;
    if (a.alternate) for (; b.return; ) b = b.return;
    else {
      a = b;
      do
        b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
      while (a);
    }
    return 3 === b.tag ? c : null;
  }
  function Wb(a) {
    if (13 === a.tag) {
      var b = a.memoizedState;
      null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
      if (null !== b) return b.dehydrated;
    }
    return null;
  }
  function Xb(a) {
    if (Vb(a) !== a) throw Error(p(188));
  }
  function Yb(a) {
    var b = a.alternate;
    if (!b) {
      b = Vb(a);
      if (null === b) throw Error(p(188));
      return b !== a ? null : a;
    }
    for (var c = a, d = b; ; ) {
      var e = c.return;
      if (null === e) break;
      var f = e.alternate;
      if (null === f) {
        d = e.return;
        if (null !== d) {
          c = d;
          continue;
        }
        break;
      }
      if (e.child === f.child) {
        for (f = e.child; f; ) {
          if (f === c) return Xb(e), a;
          if (f === d) return Xb(e), b;
          f = f.sibling;
        }
        throw Error(p(188));
      }
      if (c.return !== d.return) c = e, d = f;
      else {
        for (var g = false, h = e.child; h; ) {
          if (h === c) {
            g = true;
            c = e;
            d = f;
            break;
          }
          if (h === d) {
            g = true;
            d = e;
            c = f;
            break;
          }
          h = h.sibling;
        }
        if (!g) {
          for (h = f.child; h; ) {
            if (h === c) {
              g = true;
              c = f;
              d = e;
              break;
            }
            if (h === d) {
              g = true;
              d = f;
              c = e;
              break;
            }
            h = h.sibling;
          }
          if (!g) throw Error(p(189));
        }
      }
      if (c.alternate !== d) throw Error(p(190));
    }
    if (3 !== c.tag) throw Error(p(188));
    return c.stateNode.current === c ? a : b;
  }
  function Zb(a) {
    a = Yb(a);
    return null !== a ? $b(a) : null;
  }
  function $b(a) {
    if (5 === a.tag || 6 === a.tag) return a;
    for (a = a.child; null !== a; ) {
      var b = $b(a);
      if (null !== b) return b;
      a = a.sibling;
    }
    return null;
  }
  var ac = ca.unstable_scheduleCallback, bc = ca.unstable_cancelCallback, cc = ca.unstable_shouldYield, dc = ca.unstable_requestPaint, B = ca.unstable_now, ec = ca.unstable_getCurrentPriorityLevel, fc = ca.unstable_ImmediatePriority, gc = ca.unstable_UserBlockingPriority, hc = ca.unstable_NormalPriority, ic = ca.unstable_LowPriority, jc = ca.unstable_IdlePriority, kc = null, lc = null;
  function mc(a) {
    if (lc && "function" === typeof lc.onCommitFiberRoot) try {
      lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
    } catch (b) {
    }
  }
  var oc = Math.clz32 ? Math.clz32 : nc, pc = Math.log, qc = Math.LN2;
  function nc(a) {
    a >>>= 0;
    return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
  }
  var rc = 64, sc = 4194304;
  function tc(a) {
    switch (a & -a) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return a & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return a & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return a;
    }
  }
  function uc(a, b) {
    var c = a.pendingLanes;
    if (0 === c) return 0;
    var d = 0, e = a.suspendedLanes, f = a.pingedLanes, g = c & 268435455;
    if (0 !== g) {
      var h = g & ~e;
      0 !== h ? d = tc(h) : (f &= g, 0 !== f && (d = tc(f)));
    } else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f && (d = tc(f));
    if (0 === d) return 0;
    if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f = b & -b, e >= f || 16 === e && 0 !== (f & 4194240))) return b;
    0 !== (d & 4) && (d |= c & 16);
    b = a.entangledLanes;
    if (0 !== b) for (a = a.entanglements, b &= d; 0 < b; ) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
    return d;
  }
  function vc(a, b) {
    switch (a) {
      case 1:
      case 2:
      case 4:
        return b + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return b + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function wc(a, b) {
    for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f = a.pendingLanes; 0 < f; ) {
      var g = 31 - oc(f), h = 1 << g, k = e[g];
      if (-1 === k) {
        if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
      } else k <= b && (a.expiredLanes |= h);
      f &= ~h;
    }
  }
  function xc(a) {
    a = a.pendingLanes & -1073741825;
    return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
  }
  function yc() {
    var a = rc;
    rc <<= 1;
    0 === (rc & 4194240) && (rc = 64);
    return a;
  }
  function zc(a) {
    for (var b = [], c = 0; 31 > c; c++) b.push(a);
    return b;
  }
  function Ac(a, b, c) {
    a.pendingLanes |= b;
    536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
    a = a.eventTimes;
    b = 31 - oc(b);
    a[b] = c;
  }
  function Bc(a, b) {
    var c = a.pendingLanes & ~b;
    a.pendingLanes = b;
    a.suspendedLanes = 0;
    a.pingedLanes = 0;
    a.expiredLanes &= b;
    a.mutableReadLanes &= b;
    a.entangledLanes &= b;
    b = a.entanglements;
    var d = a.eventTimes;
    for (a = a.expirationTimes; 0 < c; ) {
      var e = 31 - oc(c), f = 1 << e;
      b[e] = 0;
      d[e] = -1;
      a[e] = -1;
      c &= ~f;
    }
  }
  function Cc(a, b) {
    var c = a.entangledLanes |= b;
    for (a = a.entanglements; c; ) {
      var d = 31 - oc(c), e = 1 << d;
      e & b | a[d] & b && (a[d] |= b);
      c &= ~e;
    }
  }
  var C = 0;
  function Dc(a) {
    a &= -a;
    return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
  }
  var Ec, Fc, Gc, Hc, Ic, Jc = false, Kc = [], Lc = null, Mc = null, Nc = null, Oc = /* @__PURE__ */ new Map(), Pc = /* @__PURE__ */ new Map(), Qc = [], Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Sc(a, b) {
    switch (a) {
      case "focusin":
      case "focusout":
        Lc = null;
        break;
      case "dragenter":
      case "dragleave":
        Mc = null;
        break;
      case "mouseover":
      case "mouseout":
        Nc = null;
        break;
      case "pointerover":
      case "pointerout":
        Oc.delete(b.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Pc.delete(b.pointerId);
    }
  }
  function Tc(a, b, c, d, e, f) {
    if (null === a || a.nativeEvent !== f) return a = { blockedOn: b, domEventName: c, eventSystemFlags: d, nativeEvent: f, targetContainers: [e] }, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
    a.eventSystemFlags |= d;
    b = a.targetContainers;
    null !== e && -1 === b.indexOf(e) && b.push(e);
    return a;
  }
  function Uc(a, b, c, d, e) {
    switch (b) {
      case "focusin":
        return Lc = Tc(Lc, a, b, c, d, e), true;
      case "dragenter":
        return Mc = Tc(Mc, a, b, c, d, e), true;
      case "mouseover":
        return Nc = Tc(Nc, a, b, c, d, e), true;
      case "pointerover":
        var f = e.pointerId;
        Oc.set(f, Tc(Oc.get(f) || null, a, b, c, d, e));
        return true;
      case "gotpointercapture":
        return f = e.pointerId, Pc.set(f, Tc(Pc.get(f) || null, a, b, c, d, e)), true;
    }
    return false;
  }
  function Vc(a) {
    var b = Wc(a.target);
    if (null !== b) {
      var c = Vb(b);
      if (null !== c) {
        if (b = c.tag, 13 === b) {
          if (b = Wb(c), null !== b) {
            a.blockedOn = b;
            Ic(a.priority, function() {
              Gc(c);
            });
            return;
          }
        } else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
          a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
          return;
        }
      }
    }
    a.blockedOn = null;
  }
  function Xc(a) {
    if (null !== a.blockedOn) return false;
    for (var b = a.targetContainers; 0 < b.length; ) {
      var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
      if (null === c) {
        c = a.nativeEvent;
        var d = new c.constructor(c.type, c);
        wb = d;
        c.target.dispatchEvent(d);
        wb = null;
      } else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, false;
      b.shift();
    }
    return true;
  }
  function Zc(a, b, c) {
    Xc(a) && c.delete(b);
  }
  function $c() {
    Jc = false;
    null !== Lc && Xc(Lc) && (Lc = null);
    null !== Mc && Xc(Mc) && (Mc = null);
    null !== Nc && Xc(Nc) && (Nc = null);
    Oc.forEach(Zc);
    Pc.forEach(Zc);
  }
  function ad(a, b) {
    a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
  }
  function bd(a) {
    function b(b2) {
      return ad(b2, a);
    }
    if (0 < Kc.length) {
      ad(Kc[0], a);
      for (var c = 1; c < Kc.length; c++) {
        var d = Kc[c];
        d.blockedOn === a && (d.blockedOn = null);
      }
    }
    null !== Lc && ad(Lc, a);
    null !== Mc && ad(Mc, a);
    null !== Nc && ad(Nc, a);
    Oc.forEach(b);
    Pc.forEach(b);
    for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
    for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn); ) Vc(c), null === c.blockedOn && Qc.shift();
  }
  var cd = ua.ReactCurrentBatchConfig, dd = true;
  function ed(a, b, c, d) {
    var e = C, f = cd.transition;
    cd.transition = null;
    try {
      C = 1, fd(a, b, c, d);
    } finally {
      C = e, cd.transition = f;
    }
  }
  function gd(a, b, c, d) {
    var e = C, f = cd.transition;
    cd.transition = null;
    try {
      C = 4, fd(a, b, c, d);
    } finally {
      C = e, cd.transition = f;
    }
  }
  function fd(a, b, c, d) {
    if (dd) {
      var e = Yc(a, b, c, d);
      if (null === e) hd(a, b, d, id, c), Sc(a, d);
      else if (Uc(e, a, b, c, d)) d.stopPropagation();
      else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
        for (; null !== e; ) {
          var f = Cb(e);
          null !== f && Ec(f);
          f = Yc(a, b, c, d);
          null === f && hd(a, b, d, id, c);
          if (f === e) break;
          e = f;
        }
        null !== e && d.stopPropagation();
      } else hd(a, b, d, null, c);
    }
  }
  var id = null;
  function Yc(a, b, c, d) {
    id = null;
    a = xb(d);
    a = Wc(a);
    if (null !== a) if (b = Vb(a), null === b) a = null;
    else if (c = b.tag, 13 === c) {
      a = Wb(b);
      if (null !== a) return a;
      a = null;
    } else if (3 === c) {
      if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
      a = null;
    } else b !== a && (a = null);
    id = a;
    return null;
  }
  function jd(a) {
    switch (a) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (ec()) {
          case fc:
            return 1;
          case gc:
            return 4;
          case hc:
          case ic:
            return 16;
          case jc:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var kd = null, ld = null, md = null;
  function nd() {
    if (md) return md;
    var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f = e.length;
    for (a = 0; a < c && b[a] === e[a]; a++) ;
    var g = c - a;
    for (d = 1; d <= g && b[c - d] === e[f - d]; d++) ;
    return md = e.slice(a, 1 < d ? 1 - d : void 0);
  }
  function od(a) {
    var b = a.keyCode;
    "charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
    10 === a && (a = 13);
    return 32 <= a || 13 === a ? a : 0;
  }
  function pd() {
    return true;
  }
  function qd() {
    return false;
  }
  function rd(a) {
    function b(b2, d, e, f, g) {
      this._reactName = b2;
      this._targetInst = e;
      this.type = d;
      this.nativeEvent = f;
      this.target = g;
      this.currentTarget = null;
      for (var c in a) a.hasOwnProperty(c) && (b2 = a[c], this[c] = b2 ? b2(f) : f[c]);
      this.isDefaultPrevented = (null != f.defaultPrevented ? f.defaultPrevented : false === f.returnValue) ? pd : qd;
      this.isPropagationStopped = qd;
      return this;
    }
    A(b.prototype, { preventDefault: function() {
      this.defaultPrevented = true;
      var a2 = this.nativeEvent;
      a2 && (a2.preventDefault ? a2.preventDefault() : "unknown" !== typeof a2.returnValue && (a2.returnValue = false), this.isDefaultPrevented = pd);
    }, stopPropagation: function() {
      var a2 = this.nativeEvent;
      a2 && (a2.stopPropagation ? a2.stopPropagation() : "unknown" !== typeof a2.cancelBubble && (a2.cancelBubble = true), this.isPropagationStopped = pd);
    }, persist: function() {
    }, isPersistent: pd });
    return b;
  }
  var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a) {
    return a.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, td = rd(sd), ud = A({}, sd, { view: 0, detail: 0 }), vd = rd(ud), wd, xd, yd, Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a) {
    return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
  }, movementX: function(a) {
    if ("movementX" in a) return a.movementX;
    a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
    return wd;
  }, movementY: function(a) {
    return "movementY" in a ? a.movementY : xd;
  } }), Bd = rd(Ad), Cd = A({}, Ad, { dataTransfer: 0 }), Dd = rd(Cd), Ed = A({}, ud, { relatedTarget: 0 }), Fd = rd(Ed), Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Hd = rd(Gd), Id = A({}, sd, { clipboardData: function(a) {
    return "clipboardData" in a ? a.clipboardData : window.clipboardData;
  } }), Jd = rd(Id), Kd = A({}, sd, { data: 0 }), Ld = rd(Kd), Md = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, Nd = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function Pd(a) {
    var b = this.nativeEvent;
    return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : false;
  }
  function zd() {
    return Pd;
  }
  var Qd = A({}, ud, { key: function(a) {
    if (a.key) {
      var b = Md[a.key] || a.key;
      if ("Unidentified" !== b) return b;
    }
    return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a) {
    return "keypress" === a.type ? od(a) : 0;
  }, keyCode: function(a) {
    return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
  }, which: function(a) {
    return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
  } }), Rd = rd(Qd), Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Td = rd(Sd), Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd }), Vd = rd(Ud), Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Xd = rd(Wd), Yd = A({}, Ad, {
    deltaX: function(a) {
      return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
    },
    deltaY: function(a) {
      return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Zd = rd(Yd), $d = [9, 13, 27, 32], ae = ia && "CompositionEvent" in window, be = null;
  ia && "documentMode" in document && (be = document.documentMode);
  var ce = ia && "TextEvent" in window && !be, de = ia && (!ae || be && 8 < be && 11 >= be), ee = String.fromCharCode(32), fe = false;
  function ge(a, b) {
    switch (a) {
      case "keyup":
        return -1 !== $d.indexOf(b.keyCode);
      case "keydown":
        return 229 !== b.keyCode;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function he(a) {
    a = a.detail;
    return "object" === typeof a && "data" in a ? a.data : null;
  }
  var ie = false;
  function je(a, b) {
    switch (a) {
      case "compositionend":
        return he(b);
      case "keypress":
        if (32 !== b.which) return null;
        fe = true;
        return ee;
      case "textInput":
        return a = b.data, a === ee && fe ? null : a;
      default:
        return null;
    }
  }
  function ke(a, b) {
    if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = false, a) : null;
    switch (a) {
      case "paste":
        return null;
      case "keypress":
        if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
          if (b.char && 1 < b.char.length) return b.char;
          if (b.which) return String.fromCharCode(b.which);
        }
        return null;
      case "compositionend":
        return de && "ko" !== b.locale ? null : b.data;
      default:
        return null;
    }
  }
  var le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
  function me(a) {
    var b = a && a.nodeName && a.nodeName.toLowerCase();
    return "input" === b ? !!le[a.type] : "textarea" === b ? true : false;
  }
  function ne(a, b, c, d) {
    Eb(d);
    b = oe(b, "onChange");
    0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({ event: c, listeners: b }));
  }
  var pe = null, qe = null;
  function re(a) {
    se(a, 0);
  }
  function te(a) {
    var b = ue(a);
    if (Wa(b)) return a;
  }
  function ve(a, b) {
    if ("change" === a) return b;
  }
  var we = false;
  if (ia) {
    var xe;
    if (ia) {
      var ye = "oninput" in document;
      if (!ye) {
        var ze = document.createElement("div");
        ze.setAttribute("oninput", "return;");
        ye = "function" === typeof ze.oninput;
      }
      xe = ye;
    } else xe = false;
    we = xe && (!document.documentMode || 9 < document.documentMode);
  }
  function Ae() {
    pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
  }
  function Be(a) {
    if ("value" === a.propertyName && te(qe)) {
      var b = [];
      ne(b, qe, a, xb(a));
      Jb(re, b);
    }
  }
  function Ce(a, b, c) {
    "focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
  }
  function De(a) {
    if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
  }
  function Ee(a, b) {
    if ("click" === a) return te(b);
  }
  function Fe(a, b) {
    if ("input" === a || "change" === a) return te(b);
  }
  function Ge(a, b) {
    return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
  }
  var He = "function" === typeof Object.is ? Object.is : Ge;
  function Ie(a, b) {
    if (He(a, b)) return true;
    if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return false;
    var c = Object.keys(a), d = Object.keys(b);
    if (c.length !== d.length) return false;
    for (d = 0; d < c.length; d++) {
      var e = c[d];
      if (!ja.call(b, e) || !He(a[e], b[e])) return false;
    }
    return true;
  }
  function Je(a) {
    for (; a && a.firstChild; ) a = a.firstChild;
    return a;
  }
  function Ke(a, b) {
    var c = Je(a);
    a = 0;
    for (var d; c; ) {
      if (3 === c.nodeType) {
        d = a + c.textContent.length;
        if (a <= b && d >= b) return { node: c, offset: b - a };
        a = d;
      }
      a: {
        for (; c; ) {
          if (c.nextSibling) {
            c = c.nextSibling;
            break a;
          }
          c = c.parentNode;
        }
        c = void 0;
      }
      c = Je(c);
    }
  }
  function Le(a, b) {
    return a && b ? a === b ? true : a && 3 === a.nodeType ? false : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : false : false;
  }
  function Me() {
    for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement; ) {
      try {
        var c = "string" === typeof b.contentWindow.location.href;
      } catch (d) {
        c = false;
      }
      if (c) a = b.contentWindow;
      else break;
      b = Xa(a.document);
    }
    return b;
  }
  function Ne(a) {
    var b = a && a.nodeName && a.nodeName.toLowerCase();
    return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
  }
  function Oe(a) {
    var b = Me(), c = a.focusedElem, d = a.selectionRange;
    if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
      if (null !== d && Ne(c)) {
        if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
        else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
          a = a.getSelection();
          var e = c.textContent.length, f = Math.min(d.start, e);
          d = void 0 === d.end ? f : Math.min(d.end, e);
          !a.extend && f > d && (e = d, d = f, f = e);
          e = Ke(c, f);
          var g = Ke(
            c,
            d
          );
          e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
        }
      }
      b = [];
      for (a = c; a = a.parentNode; ) 1 === a.nodeType && b.push({ element: a, left: a.scrollLeft, top: a.scrollTop });
      "function" === typeof c.focus && c.focus();
      for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
    }
  }
  var Pe = ia && "documentMode" in document && 11 >= document.documentMode, Qe = null, Re = null, Se = null, Te = false;
  function Ue(a, b, c) {
    var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
    Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = { start: d.selectionStart, end: d.selectionEnd } : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = { anchorNode: d.anchorNode, anchorOffset: d.anchorOffset, focusNode: d.focusNode, focusOffset: d.focusOffset }), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({ event: b, listeners: d }), b.target = Qe)));
  }
  function Ve(a, b) {
    var c = {};
    c[a.toLowerCase()] = b.toLowerCase();
    c["Webkit" + a] = "webkit" + b;
    c["Moz" + a] = "moz" + b;
    return c;
  }
  var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") }, Xe = {}, Ye = {};
  ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
  function Ze(a) {
    if (Xe[a]) return Xe[a];
    if (!We[a]) return a;
    var b = We[a], c;
    for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
    return a;
  }
  var $e = Ze("animationend"), af = Ze("animationiteration"), bf = Ze("animationstart"), cf = Ze("transitionend"), df = /* @__PURE__ */ new Map(), ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function ff(a, b) {
    df.set(a, b);
    fa(b, [a]);
  }
  for (var gf = 0; gf < ef.length; gf++) {
    var hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
    ff(jf, "on" + kf);
  }
  ff($e, "onAnimationEnd");
  ff(af, "onAnimationIteration");
  ff(bf, "onAnimationStart");
  ff("dblclick", "onDoubleClick");
  ff("focusin", "onFocus");
  ff("focusout", "onBlur");
  ff(cf, "onTransitionEnd");
  ha("onMouseEnter", ["mouseout", "mouseover"]);
  ha("onMouseLeave", ["mouseout", "mouseover"]);
  ha("onPointerEnter", ["pointerout", "pointerover"]);
  ha("onPointerLeave", ["pointerout", "pointerover"]);
  fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
  fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
  fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
  fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
  fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
  fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
  function nf(a, b, c) {
    var d = a.type || "unknown-event";
    a.currentTarget = c;
    Ub(d, b, void 0, a);
    a.currentTarget = null;
  }
  function se(a, b) {
    b = 0 !== (b & 4);
    for (var c = 0; c < a.length; c++) {
      var d = a[c], e = d.event;
      d = d.listeners;
      a: {
        var f = void 0;
        if (b) for (var g = d.length - 1; 0 <= g; g--) {
          var h = d[g], k = h.instance, l = h.currentTarget;
          h = h.listener;
          if (k !== f && e.isPropagationStopped()) break a;
          nf(e, h, l);
          f = k;
        }
        else for (g = 0; g < d.length; g++) {
          h = d[g];
          k = h.instance;
          l = h.currentTarget;
          h = h.listener;
          if (k !== f && e.isPropagationStopped()) break a;
          nf(e, h, l);
          f = k;
        }
      }
    }
    if (Qb) throw a = Rb, Qb = false, Rb = null, a;
  }
  function D(a, b) {
    var c = b[of];
    void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
    var d = a + "__bubble";
    c.has(d) || (pf(b, a, 2, false), c.add(d));
  }
  function qf(a, b, c) {
    var d = 0;
    b && (d |= 4);
    pf(c, a, d, b);
  }
  var rf = "_reactListening" + Math.random().toString(36).slice(2);
  function sf(a) {
    if (!a[rf]) {
      a[rf] = true;
      da.forEach(function(b2) {
        "selectionchange" !== b2 && (mf.has(b2) || qf(b2, false, a), qf(b2, true, a));
      });
      var b = 9 === a.nodeType ? a : a.ownerDocument;
      null === b || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
    }
  }
  function pf(a, b, c, d) {
    switch (jd(b)) {
      case 1:
        var e = ed;
        break;
      case 4:
        e = gd;
        break;
      default:
        e = fd;
    }
    c = e.bind(null, b, c, a);
    e = void 0;
    !Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = true);
    d ? void 0 !== e ? a.addEventListener(b, c, { capture: true, passive: e }) : a.addEventListener(b, c, true) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, false);
  }
  function hd(a, b, c, d, e) {
    var f = d;
    if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (; ; ) {
      if (null === d) return;
      var g = d.tag;
      if (3 === g || 4 === g) {
        var h = d.stateNode.containerInfo;
        if (h === e || 8 === h.nodeType && h.parentNode === e) break;
        if (4 === g) for (g = d.return; null !== g; ) {
          var k = g.tag;
          if (3 === k || 4 === k) {
            if (k = g.stateNode.containerInfo, k === e || 8 === k.nodeType && k.parentNode === e) return;
          }
          g = g.return;
        }
        for (; null !== h; ) {
          g = Wc(h);
          if (null === g) return;
          k = g.tag;
          if (5 === k || 6 === k) {
            d = f = g;
            continue a;
          }
          h = h.parentNode;
        }
      }
      d = d.return;
    }
    Jb(function() {
      var d2 = f, e2 = xb(c), g2 = [];
      a: {
        var h2 = df.get(a);
        if (void 0 !== h2) {
          var k2 = td, n = a;
          switch (a) {
            case "keypress":
              if (0 === od(c)) break a;
            case "keydown":
            case "keyup":
              k2 = Rd;
              break;
            case "focusin":
              n = "focus";
              k2 = Fd;
              break;
            case "focusout":
              n = "blur";
              k2 = Fd;
              break;
            case "beforeblur":
            case "afterblur":
              k2 = Fd;
              break;
            case "click":
              if (2 === c.button) break a;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              k2 = Bd;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              k2 = Dd;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              k2 = Vd;
              break;
            case $e:
            case af:
            case bf:
              k2 = Hd;
              break;
            case cf:
              k2 = Xd;
              break;
            case "scroll":
              k2 = vd;
              break;
            case "wheel":
              k2 = Zd;
              break;
            case "copy":
            case "cut":
            case "paste":
              k2 = Jd;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              k2 = Td;
          }
          var t = 0 !== (b & 4), J = !t && "scroll" === a, x = t ? null !== h2 ? h2 + "Capture" : null : h2;
          t = [];
          for (var w = d2, u; null !== w; ) {
            u = w;
            var F = u.stateNode;
            5 === u.tag && null !== F && (u = F, null !== x && (F = Kb(w, x), null != F && t.push(tf(w, F, u))));
            if (J) break;
            w = w.return;
          }
          0 < t.length && (h2 = new k2(h2, n, null, c, e2), g2.push({ event: h2, listeners: t }));
        }
      }
      if (0 === (b & 7)) {
        a: {
          h2 = "mouseover" === a || "pointerover" === a;
          k2 = "mouseout" === a || "pointerout" === a;
          if (h2 && c !== wb && (n = c.relatedTarget || c.fromElement) && (Wc(n) || n[uf])) break a;
          if (k2 || h2) {
            h2 = e2.window === e2 ? e2 : (h2 = e2.ownerDocument) ? h2.defaultView || h2.parentWindow : window;
            if (k2) {
              if (n = c.relatedTarget || c.toElement, k2 = d2, n = n ? Wc(n) : null, null !== n && (J = Vb(n), n !== J || 5 !== n.tag && 6 !== n.tag)) n = null;
            } else k2 = null, n = d2;
            if (k2 !== n) {
              t = Bd;
              F = "onMouseLeave";
              x = "onMouseEnter";
              w = "mouse";
              if ("pointerout" === a || "pointerover" === a) t = Td, F = "onPointerLeave", x = "onPointerEnter", w = "pointer";
              J = null == k2 ? h2 : ue(k2);
              u = null == n ? h2 : ue(n);
              h2 = new t(F, w + "leave", k2, c, e2);
              h2.target = J;
              h2.relatedTarget = u;
              F = null;
              Wc(e2) === d2 && (t = new t(x, w + "enter", n, c, e2), t.target = u, t.relatedTarget = J, F = t);
              J = F;
              if (k2 && n) b: {
                t = k2;
                x = n;
                w = 0;
                for (u = t; u; u = vf(u)) w++;
                u = 0;
                for (F = x; F; F = vf(F)) u++;
                for (; 0 < w - u; ) t = vf(t), w--;
                for (; 0 < u - w; ) x = vf(x), u--;
                for (; w--; ) {
                  if (t === x || null !== x && t === x.alternate) break b;
                  t = vf(t);
                  x = vf(x);
                }
                t = null;
              }
              else t = null;
              null !== k2 && wf(g2, h2, k2, t, false);
              null !== n && null !== J && wf(g2, J, n, t, true);
            }
          }
        }
        a: {
          h2 = d2 ? ue(d2) : window;
          k2 = h2.nodeName && h2.nodeName.toLowerCase();
          if ("select" === k2 || "input" === k2 && "file" === h2.type) var na = ve;
          else if (me(h2)) if (we) na = Fe;
          else {
            na = De;
            var xa = Ce;
          }
          else (k2 = h2.nodeName) && "input" === k2.toLowerCase() && ("checkbox" === h2.type || "radio" === h2.type) && (na = Ee);
          if (na && (na = na(a, d2))) {
            ne(g2, na, c, e2);
            break a;
          }
          xa && xa(a, h2, d2);
          "focusout" === a && (xa = h2._wrapperState) && xa.controlled && "number" === h2.type && cb(h2, "number", h2.value);
        }
        xa = d2 ? ue(d2) : window;
        switch (a) {
          case "focusin":
            if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d2, Se = null;
            break;
          case "focusout":
            Se = Re = Qe = null;
            break;
          case "mousedown":
            Te = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Te = false;
            Ue(g2, c, e2);
            break;
          case "selectionchange":
            if (Pe) break;
          case "keydown":
          case "keyup":
            Ue(g2, c, e2);
        }
        var $a;
        if (ae) b: {
          switch (a) {
            case "compositionstart":
              var ba = "onCompositionStart";
              break b;
            case "compositionend":
              ba = "onCompositionEnd";
              break b;
            case "compositionupdate":
              ba = "onCompositionUpdate";
              break b;
          }
          ba = void 0;
        }
        else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
        ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e2, ld = "value" in kd ? kd.value : kd.textContent, ie = true)), xa = oe(d2, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
        if ($a = ce ? je(a, c) : ke(a, c)) d2 = oe(d2, "onBeforeInput"), 0 < d2.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c, e2), g2.push({ event: e2, listeners: d2 }), e2.data = $a);
      }
      se(g2, b);
    });
  }
  function tf(a, b, c) {
    return { instance: a, listener: b, currentTarget: c };
  }
  function oe(a, b) {
    for (var c = b + "Capture", d = []; null !== a; ) {
      var e = a, f = e.stateNode;
      5 === e.tag && null !== f && (e = f, f = Kb(a, c), null != f && d.unshift(tf(a, f, e)), f = Kb(a, b), null != f && d.push(tf(a, f, e)));
      a = a.return;
    }
    return d;
  }
  function vf(a) {
    if (null === a) return null;
    do
      a = a.return;
    while (a && 5 !== a.tag);
    return a ? a : null;
  }
  function wf(a, b, c, d, e) {
    for (var f = b._reactName, g = []; null !== c && c !== d; ) {
      var h = c, k = h.alternate, l = h.stateNode;
      if (null !== k && k === d) break;
      5 === h.tag && null !== l && (h = l, e ? (k = Kb(c, f), null != k && g.unshift(tf(c, k, h))) : e || (k = Kb(c, f), null != k && g.push(tf(c, k, h))));
      c = c.return;
    }
    0 !== g.length && a.push({ event: b, listeners: g });
  }
  var xf = /\r\n?/g, yf = /\u0000|\uFFFD/g;
  function zf(a) {
    return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
  }
  function Af(a, b, c) {
    b = zf(b);
    if (zf(a) !== b && c) throw Error(p(425));
  }
  function Bf() {
  }
  var Cf = null, Df = null;
  function Ef(a, b) {
    return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
  }
  var Ff = "function" === typeof setTimeout ? setTimeout : void 0, Gf = "function" === typeof clearTimeout ? clearTimeout : void 0, Hf = "function" === typeof Promise ? Promise : void 0, Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
    return Hf.resolve(null).then(a).catch(If);
  } : Ff;
  function If(a) {
    setTimeout(function() {
      throw a;
    });
  }
  function Kf(a, b) {
    var c = b, d = 0;
    do {
      var e = c.nextSibling;
      a.removeChild(c);
      if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
        if (0 === d) {
          a.removeChild(e);
          bd(b);
          return;
        }
        d--;
      } else "$" !== c && "$?" !== c && "$!" !== c || d++;
      c = e;
    } while (c);
    bd(b);
  }
  function Lf(a) {
    for (; null != a; a = a.nextSibling) {
      var b = a.nodeType;
      if (1 === b || 3 === b) break;
      if (8 === b) {
        b = a.data;
        if ("$" === b || "$!" === b || "$?" === b) break;
        if ("/$" === b) return null;
      }
    }
    return a;
  }
  function Mf(a) {
    a = a.previousSibling;
    for (var b = 0; a; ) {
      if (8 === a.nodeType) {
        var c = a.data;
        if ("$" === c || "$!" === c || "$?" === c) {
          if (0 === b) return a;
          b--;
        } else "/$" === c && b++;
      }
      a = a.previousSibling;
    }
    return null;
  }
  var Nf = Math.random().toString(36).slice(2), Of = "__reactFiber$" + Nf, Pf = "__reactProps$" + Nf, uf = "__reactContainer$" + Nf, of = "__reactEvents$" + Nf, Qf = "__reactListeners$" + Nf, Rf = "__reactHandles$" + Nf;
  function Wc(a) {
    var b = a[Of];
    if (b) return b;
    for (var c = a.parentNode; c; ) {
      if (b = c[uf] || c[Of]) {
        c = b.alternate;
        if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a; ) {
          if (c = a[Of]) return c;
          a = Mf(a);
        }
        return b;
      }
      a = c;
      c = a.parentNode;
    }
    return null;
  }
  function Cb(a) {
    a = a[Of] || a[uf];
    return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
  }
  function ue(a) {
    if (5 === a.tag || 6 === a.tag) return a.stateNode;
    throw Error(p(33));
  }
  function Db(a) {
    return a[Pf] || null;
  }
  var Sf = [], Tf = -1;
  function Uf(a) {
    return { current: a };
  }
  function E(a) {
    0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
  }
  function G(a, b) {
    Tf++;
    Sf[Tf] = a.current;
    a.current = b;
  }
  var Vf = {}, H = Uf(Vf), Wf = Uf(false), Xf = Vf;
  function Yf(a, b) {
    var c = a.type.contextTypes;
    if (!c) return Vf;
    var d = a.stateNode;
    if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
    var e = {}, f;
    for (f in c) e[f] = b[f];
    d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
    return e;
  }
  function Zf(a) {
    a = a.childContextTypes;
    return null !== a && void 0 !== a;
  }
  function $f() {
    E(Wf);
    E(H);
  }
  function ag(a, b, c) {
    if (H.current !== Vf) throw Error(p(168));
    G(H, b);
    G(Wf, c);
  }
  function bg(a, b, c) {
    var d = a.stateNode;
    b = b.childContextTypes;
    if ("function" !== typeof d.getChildContext) return c;
    d = d.getChildContext();
    for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
    return A({}, c, d);
  }
  function cg(a) {
    a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
    Xf = H.current;
    G(H, a);
    G(Wf, Wf.current);
    return true;
  }
  function dg(a, b, c) {
    var d = a.stateNode;
    if (!d) throw Error(p(169));
    c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
    G(Wf, c);
  }
  var eg = null, fg = false, gg = false;
  function hg(a) {
    null === eg ? eg = [a] : eg.push(a);
  }
  function ig(a) {
    fg = true;
    hg(a);
  }
  function jg() {
    if (!gg && null !== eg) {
      gg = true;
      var a = 0, b = C;
      try {
        var c = eg;
        for (C = 1; a < c.length; a++) {
          var d = c[a];
          do
            d = d(true);
          while (null !== d);
        }
        eg = null;
        fg = false;
      } catch (e) {
        throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
      } finally {
        C = b, gg = false;
      }
    }
    return null;
  }
  var kg = [], lg = 0, mg = null, ng = 0, og = [], pg = 0, qg = null, rg = 1, sg = "";
  function tg(a, b) {
    kg[lg++] = ng;
    kg[lg++] = mg;
    mg = a;
    ng = b;
  }
  function ug(a, b, c) {
    og[pg++] = rg;
    og[pg++] = sg;
    og[pg++] = qg;
    qg = a;
    var d = rg;
    a = sg;
    var e = 32 - oc(d) - 1;
    d &= ~(1 << e);
    c += 1;
    var f = 32 - oc(b) + e;
    if (30 < f) {
      var g = e - e % 5;
      f = (d & (1 << g) - 1).toString(32);
      d >>= g;
      e -= g;
      rg = 1 << 32 - oc(b) + e | c << e | d;
      sg = f + a;
    } else rg = 1 << f | c << e | d, sg = a;
  }
  function vg(a) {
    null !== a.return && (tg(a, 1), ug(a, 1, 0));
  }
  function wg(a) {
    for (; a === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
    for (; a === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
  }
  var xg = null, yg = null, I = false, zg = null;
  function Ag(a, b) {
    var c = Bg(5, null, null, 0);
    c.elementType = "DELETED";
    c.stateNode = b;
    c.return = a;
    b = a.deletions;
    null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
  }
  function Cg(a, b) {
    switch (a.tag) {
      case 5:
        var c = a.type;
        b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
        return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), true) : false;
      case 6:
        return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, true) : false;
      case 13:
        return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? { id: rg, overflow: sg } : null, a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 }, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, true) : false;
      default:
        return false;
    }
  }
  function Dg(a) {
    return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
  }
  function Eg(a) {
    if (I) {
      var b = yg;
      if (b) {
        var c = b;
        if (!Cg(a, b)) {
          if (Dg(a)) throw Error(p(418));
          b = Lf(c.nextSibling);
          var d = xg;
          b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = false, xg = a);
        }
      } else {
        if (Dg(a)) throw Error(p(418));
        a.flags = a.flags & -4097 | 2;
        I = false;
        xg = a;
      }
    }
  }
  function Fg(a) {
    for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag; ) a = a.return;
    xg = a;
  }
  function Gg(a) {
    if (a !== xg) return false;
    if (!I) return Fg(a), I = true, false;
    var b;
    (b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
    if (b && (b = yg)) {
      if (Dg(a)) throw Hg(), Error(p(418));
      for (; b; ) Ag(a, b), b = Lf(b.nextSibling);
    }
    Fg(a);
    if (13 === a.tag) {
      a = a.memoizedState;
      a = null !== a ? a.dehydrated : null;
      if (!a) throw Error(p(317));
      a: {
        a = a.nextSibling;
        for (b = 0; a; ) {
          if (8 === a.nodeType) {
            var c = a.data;
            if ("/$" === c) {
              if (0 === b) {
                yg = Lf(a.nextSibling);
                break a;
              }
              b--;
            } else "$" !== c && "$!" !== c && "$?" !== c || b++;
          }
          a = a.nextSibling;
        }
        yg = null;
      }
    } else yg = xg ? Lf(a.stateNode.nextSibling) : null;
    return true;
  }
  function Hg() {
    for (var a = yg; a; ) a = Lf(a.nextSibling);
  }
  function Ig() {
    yg = xg = null;
    I = false;
  }
  function Jg(a) {
    null === zg ? zg = [a] : zg.push(a);
  }
  var Kg = ua.ReactCurrentBatchConfig;
  function Lg(a, b, c) {
    a = c.ref;
    if (null !== a && "function" !== typeof a && "object" !== typeof a) {
      if (c._owner) {
        c = c._owner;
        if (c) {
          if (1 !== c.tag) throw Error(p(309));
          var d = c.stateNode;
        }
        if (!d) throw Error(p(147, a));
        var e = d, f = "" + a;
        if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f) return b.ref;
        b = function(a2) {
          var b2 = e.refs;
          null === a2 ? delete b2[f] : b2[f] = a2;
        };
        b._stringRef = f;
        return b;
      }
      if ("string" !== typeof a) throw Error(p(284));
      if (!c._owner) throw Error(p(290, a));
    }
    return a;
  }
  function Mg(a, b) {
    a = Object.prototype.toString.call(b);
    throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
  }
  function Ng(a) {
    var b = a._init;
    return b(a._payload);
  }
  function Og(a) {
    function b(b2, c2) {
      if (a) {
        var d2 = b2.deletions;
        null === d2 ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
      }
    }
    function c(c2, d2) {
      if (!a) return null;
      for (; null !== d2; ) b(c2, d2), d2 = d2.sibling;
      return null;
    }
    function d(a2, b2) {
      for (a2 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
      return a2;
    }
    function e(a2, b2) {
      a2 = Pg(a2, b2);
      a2.index = 0;
      a2.sibling = null;
      return a2;
    }
    function f(b2, c2, d2) {
      b2.index = d2;
      if (!a) return b2.flags |= 1048576, c2;
      d2 = b2.alternate;
      if (null !== d2) return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
      b2.flags |= 2;
      return c2;
    }
    function g(b2) {
      a && null === b2.alternate && (b2.flags |= 2);
      return b2;
    }
    function h(a2, b2, c2, d2) {
      if (null === b2 || 6 !== b2.tag) return b2 = Qg(c2, a2.mode, d2), b2.return = a2, b2;
      b2 = e(b2, c2);
      b2.return = a2;
      return b2;
    }
    function k(a2, b2, c2, d2) {
      var f2 = c2.type;
      if (f2 === ya) return m(a2, b2, c2.props.children, d2, c2.key);
      if (null !== b2 && (b2.elementType === f2 || "object" === typeof f2 && null !== f2 && f2.$$typeof === Ha && Ng(f2) === b2.type)) return d2 = e(b2, c2.props), d2.ref = Lg(a2, b2, c2), d2.return = a2, d2;
      d2 = Rg(c2.type, c2.key, c2.props, null, a2.mode, d2);
      d2.ref = Lg(a2, b2, c2);
      d2.return = a2;
      return d2;
    }
    function l(a2, b2, c2, d2) {
      if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation) return b2 = Sg(c2, a2.mode, d2), b2.return = a2, b2;
      b2 = e(b2, c2.children || []);
      b2.return = a2;
      return b2;
    }
    function m(a2, b2, c2, d2, f2) {
      if (null === b2 || 7 !== b2.tag) return b2 = Tg(c2, a2.mode, d2, f2), b2.return = a2, b2;
      b2 = e(b2, c2);
      b2.return = a2;
      return b2;
    }
    function q(a2, b2, c2) {
      if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = Qg("" + b2, a2.mode, c2), b2.return = a2, b2;
      if ("object" === typeof b2 && null !== b2) {
        switch (b2.$$typeof) {
          case va:
            return c2 = Rg(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = Lg(a2, null, b2), c2.return = a2, c2;
          case wa:
            return b2 = Sg(b2, a2.mode, c2), b2.return = a2, b2;
          case Ha:
            var d2 = b2._init;
            return q(a2, d2(b2._payload), c2);
        }
        if (eb(b2) || Ka(b2)) return b2 = Tg(b2, a2.mode, c2, null), b2.return = a2, b2;
        Mg(a2, b2);
      }
      return null;
    }
    function r(a2, b2, c2, d2) {
      var e2 = null !== b2 ? b2.key : null;
      if ("string" === typeof c2 && "" !== c2 || "number" === typeof c2) return null !== e2 ? null : h(a2, b2, "" + c2, d2);
      if ("object" === typeof c2 && null !== c2) {
        switch (c2.$$typeof) {
          case va:
            return c2.key === e2 ? k(a2, b2, c2, d2) : null;
          case wa:
            return c2.key === e2 ? l(a2, b2, c2, d2) : null;
          case Ha:
            return e2 = c2._init, r(
              a2,
              b2,
              e2(c2._payload),
              d2
            );
        }
        if (eb(c2) || Ka(c2)) return null !== e2 ? null : m(a2, b2, c2, d2, null);
        Mg(a2, c2);
      }
      return null;
    }
    function y(a2, b2, c2, d2, e2) {
      if ("string" === typeof d2 && "" !== d2 || "number" === typeof d2) return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
      if ("object" === typeof d2 && null !== d2) {
        switch (d2.$$typeof) {
          case va:
            return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, k(b2, a2, d2, e2);
          case wa:
            return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, l(b2, a2, d2, e2);
          case Ha:
            var f2 = d2._init;
            return y(a2, b2, c2, f2(d2._payload), e2);
        }
        if (eb(d2) || Ka(d2)) return a2 = a2.get(c2) || null, m(b2, a2, d2, e2, null);
        Mg(b2, d2);
      }
      return null;
    }
    function n(e2, g2, h2, k2) {
      for (var l2 = null, m2 = null, u = g2, w = g2 = 0, x = null; null !== u && w < h2.length; w++) {
        u.index > w ? (x = u, u = null) : x = u.sibling;
        var n2 = r(e2, u, h2[w], k2);
        if (null === n2) {
          null === u && (u = x);
          break;
        }
        a && u && null === n2.alternate && b(e2, u);
        g2 = f(n2, g2, w);
        null === m2 ? l2 = n2 : m2.sibling = n2;
        m2 = n2;
        u = x;
      }
      if (w === h2.length) return c(e2, u), I && tg(e2, w), l2;
      if (null === u) {
        for (; w < h2.length; w++) u = q(e2, h2[w], k2), null !== u && (g2 = f(u, g2, w), null === m2 ? l2 = u : m2.sibling = u, m2 = u);
        I && tg(e2, w);
        return l2;
      }
      for (u = d(e2, u); w < h2.length; w++) x = y(u, e2, w, h2[w], k2), null !== x && (a && null !== x.alternate && u.delete(null === x.key ? w : x.key), g2 = f(x, g2, w), null === m2 ? l2 = x : m2.sibling = x, m2 = x);
      a && u.forEach(function(a2) {
        return b(e2, a2);
      });
      I && tg(e2, w);
      return l2;
    }
    function t(e2, g2, h2, k2) {
      var l2 = Ka(h2);
      if ("function" !== typeof l2) throw Error(p(150));
      h2 = l2.call(h2);
      if (null == h2) throw Error(p(151));
      for (var u = l2 = null, m2 = g2, w = g2 = 0, x = null, n2 = h2.next(); null !== m2 && !n2.done; w++, n2 = h2.next()) {
        m2.index > w ? (x = m2, m2 = null) : x = m2.sibling;
        var t2 = r(e2, m2, n2.value, k2);
        if (null === t2) {
          null === m2 && (m2 = x);
          break;
        }
        a && m2 && null === t2.alternate && b(e2, m2);
        g2 = f(t2, g2, w);
        null === u ? l2 = t2 : u.sibling = t2;
        u = t2;
        m2 = x;
      }
      if (n2.done) return c(
        e2,
        m2
      ), I && tg(e2, w), l2;
      if (null === m2) {
        for (; !n2.done; w++, n2 = h2.next()) n2 = q(e2, n2.value, k2), null !== n2 && (g2 = f(n2, g2, w), null === u ? l2 = n2 : u.sibling = n2, u = n2);
        I && tg(e2, w);
        return l2;
      }
      for (m2 = d(e2, m2); !n2.done; w++, n2 = h2.next()) n2 = y(m2, e2, w, n2.value, k2), null !== n2 && (a && null !== n2.alternate && m2.delete(null === n2.key ? w : n2.key), g2 = f(n2, g2, w), null === u ? l2 = n2 : u.sibling = n2, u = n2);
      a && m2.forEach(function(a2) {
        return b(e2, a2);
      });
      I && tg(e2, w);
      return l2;
    }
    function J(a2, d2, f2, h2) {
      "object" === typeof f2 && null !== f2 && f2.type === ya && null === f2.key && (f2 = f2.props.children);
      if ("object" === typeof f2 && null !== f2) {
        switch (f2.$$typeof) {
          case va:
            a: {
              for (var k2 = f2.key, l2 = d2; null !== l2; ) {
                if (l2.key === k2) {
                  k2 = f2.type;
                  if (k2 === ya) {
                    if (7 === l2.tag) {
                      c(a2, l2.sibling);
                      d2 = e(l2, f2.props.children);
                      d2.return = a2;
                      a2 = d2;
                      break a;
                    }
                  } else if (l2.elementType === k2 || "object" === typeof k2 && null !== k2 && k2.$$typeof === Ha && Ng(k2) === l2.type) {
                    c(a2, l2.sibling);
                    d2 = e(l2, f2.props);
                    d2.ref = Lg(a2, l2, f2);
                    d2.return = a2;
                    a2 = d2;
                    break a;
                  }
                  c(a2, l2);
                  break;
                } else b(a2, l2);
                l2 = l2.sibling;
              }
              f2.type === ya ? (d2 = Tg(f2.props.children, a2.mode, h2, f2.key), d2.return = a2, a2 = d2) : (h2 = Rg(f2.type, f2.key, f2.props, null, a2.mode, h2), h2.ref = Lg(a2, d2, f2), h2.return = a2, a2 = h2);
            }
            return g(a2);
          case wa:
            a: {
              for (l2 = f2.key; null !== d2; ) {
                if (d2.key === l2) if (4 === d2.tag && d2.stateNode.containerInfo === f2.containerInfo && d2.stateNode.implementation === f2.implementation) {
                  c(a2, d2.sibling);
                  d2 = e(d2, f2.children || []);
                  d2.return = a2;
                  a2 = d2;
                  break a;
                } else {
                  c(a2, d2);
                  break;
                }
                else b(a2, d2);
                d2 = d2.sibling;
              }
              d2 = Sg(f2, a2.mode, h2);
              d2.return = a2;
              a2 = d2;
            }
            return g(a2);
          case Ha:
            return l2 = f2._init, J(a2, d2, l2(f2._payload), h2);
        }
        if (eb(f2)) return n(a2, d2, f2, h2);
        if (Ka(f2)) return t(a2, d2, f2, h2);
        Mg(a2, f2);
      }
      return "string" === typeof f2 && "" !== f2 || "number" === typeof f2 ? (f2 = "" + f2, null !== d2 && 6 === d2.tag ? (c(a2, d2.sibling), d2 = e(d2, f2), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = Qg(f2, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
    }
    return J;
  }
  var Ug = Og(true), Vg = Og(false), Wg = Uf(null), Xg = null, Yg = null, Zg = null;
  function $g() {
    Zg = Yg = Xg = null;
  }
  function ah(a) {
    var b = Wg.current;
    E(Wg);
    a._currentValue = b;
  }
  function bh(a, b, c) {
    for (; null !== a; ) {
      var d = a.alternate;
      (a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
      if (a === c) break;
      a = a.return;
    }
  }
  function ch(a, b) {
    Xg = a;
    Zg = Yg = null;
    a = a.dependencies;
    null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (dh = true), a.firstContext = null);
  }
  function eh(a) {
    var b = a._currentValue;
    if (Zg !== a) if (a = { context: a, memoizedValue: b, next: null }, null === Yg) {
      if (null === Xg) throw Error(p(308));
      Yg = a;
      Xg.dependencies = { lanes: 0, firstContext: a };
    } else Yg = Yg.next = a;
    return b;
  }
  var fh = null;
  function gh(a) {
    null === fh ? fh = [a] : fh.push(a);
  }
  function hh(a, b, c, d) {
    var e = b.interleaved;
    null === e ? (c.next = c, gh(b)) : (c.next = e.next, e.next = c);
    b.interleaved = c;
    return ih(a, d);
  }
  function ih(a, b) {
    a.lanes |= b;
    var c = a.alternate;
    null !== c && (c.lanes |= b);
    c = a;
    for (a = a.return; null !== a; ) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
    return 3 === c.tag ? c.stateNode : null;
  }
  var jh = false;
  function kh(a) {
    a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function lh(a, b) {
    a = a.updateQueue;
    b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
  }
  function mh(a, b) {
    return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
  }
  function nh(a, b, c) {
    var d = a.updateQueue;
    if (null === d) return null;
    d = d.shared;
    if (0 !== (K & 2)) {
      var e = d.pending;
      null === e ? b.next = b : (b.next = e.next, e.next = b);
      d.pending = b;
      return ih(a, c);
    }
    e = d.interleaved;
    null === e ? (b.next = b, gh(d)) : (b.next = e.next, e.next = b);
    d.interleaved = b;
    return ih(a, c);
  }
  function oh(a, b, c) {
    b = b.updateQueue;
    if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
      var d = b.lanes;
      d &= a.pendingLanes;
      c |= d;
      b.lanes = c;
      Cc(a, c);
    }
  }
  function ph(a, b) {
    var c = a.updateQueue, d = a.alternate;
    if (null !== d && (d = d.updateQueue, c === d)) {
      var e = null, f = null;
      c = c.firstBaseUpdate;
      if (null !== c) {
        do {
          var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
          null === f ? e = f = g : f = f.next = g;
          c = c.next;
        } while (null !== c);
        null === f ? e = f = b : f = f.next = b;
      } else e = f = b;
      c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f, shared: d.shared, effects: d.effects };
      a.updateQueue = c;
      return;
    }
    a = c.lastBaseUpdate;
    null === a ? c.firstBaseUpdate = b : a.next = b;
    c.lastBaseUpdate = b;
  }
  function qh(a, b, c, d) {
    var e = a.updateQueue;
    jh = false;
    var f = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
    if (null !== h) {
      e.shared.pending = null;
      var k = h, l = k.next;
      k.next = null;
      null === g ? f = l : g.next = l;
      g = k;
      var m = a.alternate;
      null !== m && (m = m.updateQueue, h = m.lastBaseUpdate, h !== g && (null === h ? m.firstBaseUpdate = l : h.next = l, m.lastBaseUpdate = k));
    }
    if (null !== f) {
      var q = e.baseState;
      g = 0;
      m = l = k = null;
      h = f;
      do {
        var r = h.lane, y = h.eventTime;
        if ((d & r) === r) {
          null !== m && (m = m.next = {
            eventTime: y,
            lane: 0,
            tag: h.tag,
            payload: h.payload,
            callback: h.callback,
            next: null
          });
          a: {
            var n = a, t = h;
            r = b;
            y = c;
            switch (t.tag) {
              case 1:
                n = t.payload;
                if ("function" === typeof n) {
                  q = n.call(y, q, r);
                  break a;
                }
                q = n;
                break a;
              case 3:
                n.flags = n.flags & -65537 | 128;
              case 0:
                n = t.payload;
                r = "function" === typeof n ? n.call(y, q, r) : n;
                if (null === r || void 0 === r) break a;
                q = A({}, q, r);
                break a;
              case 2:
                jh = true;
            }
          }
          null !== h.callback && 0 !== h.lane && (a.flags |= 64, r = e.effects, null === r ? e.effects = [h] : r.push(h));
        } else y = { eventTime: y, lane: r, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, null === m ? (l = m = y, k = q) : m = m.next = y, g |= r;
        h = h.next;
        if (null === h) if (h = e.shared.pending, null === h) break;
        else r = h, h = r.next, r.next = null, e.lastBaseUpdate = r, e.shared.pending = null;
      } while (1);
      null === m && (k = q);
      e.baseState = k;
      e.firstBaseUpdate = l;
      e.lastBaseUpdate = m;
      b = e.shared.interleaved;
      if (null !== b) {
        e = b;
        do
          g |= e.lane, e = e.next;
        while (e !== b);
      } else null === f && (e.shared.lanes = 0);
      rh |= g;
      a.lanes = g;
      a.memoizedState = q;
    }
  }
  function sh(a, b, c) {
    a = b.effects;
    b.effects = null;
    if (null !== a) for (b = 0; b < a.length; b++) {
      var d = a[b], e = d.callback;
      if (null !== e) {
        d.callback = null;
        d = c;
        if ("function" !== typeof e) throw Error(p(191, e));
        e.call(d);
      }
    }
  }
  var th = {}, uh = Uf(th), vh = Uf(th), wh = Uf(th);
  function xh(a) {
    if (a === th) throw Error(p(174));
    return a;
  }
  function yh(a, b) {
    G(wh, b);
    G(vh, a);
    G(uh, th);
    a = b.nodeType;
    switch (a) {
      case 9:
      case 11:
        b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
        break;
      default:
        a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
    }
    E(uh);
    G(uh, b);
  }
  function zh() {
    E(uh);
    E(vh);
    E(wh);
  }
  function Ah(a) {
    xh(wh.current);
    var b = xh(uh.current);
    var c = lb(b, a.type);
    b !== c && (G(vh, a), G(uh, c));
  }
  function Bh(a) {
    vh.current === a && (E(uh), E(vh));
  }
  var L = Uf(0);
  function Ch(a) {
    for (var b = a; null !== b; ) {
      if (13 === b.tag) {
        var c = b.memoizedState;
        if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
      } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
        if (0 !== (b.flags & 128)) return b;
      } else if (null !== b.child) {
        b.child.return = b;
        b = b.child;
        continue;
      }
      if (b === a) break;
      for (; null === b.sibling; ) {
        if (null === b.return || b.return === a) return null;
        b = b.return;
      }
      b.sibling.return = b.return;
      b = b.sibling;
    }
    return null;
  }
  var Dh = [];
  function Eh() {
    for (var a = 0; a < Dh.length; a++) Dh[a]._workInProgressVersionPrimary = null;
    Dh.length = 0;
  }
  var Fh = ua.ReactCurrentDispatcher, Gh = ua.ReactCurrentBatchConfig, Hh = 0, M = null, N = null, O = null, Ih = false, Jh = false, Kh = 0, Lh = 0;
  function P() {
    throw Error(p(321));
  }
  function Mh(a, b) {
    if (null === b) return false;
    for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return false;
    return true;
  }
  function Nh(a, b, c, d, e, f) {
    Hh = f;
    M = b;
    b.memoizedState = null;
    b.updateQueue = null;
    b.lanes = 0;
    Fh.current = null === a || null === a.memoizedState ? Oh : Ph;
    a = c(d, e);
    if (Jh) {
      f = 0;
      do {
        Jh = false;
        Kh = 0;
        if (25 <= f) throw Error(p(301));
        f += 1;
        O = N = null;
        b.updateQueue = null;
        Fh.current = Qh;
        a = c(d, e);
      } while (Jh);
    }
    Fh.current = Rh;
    b = null !== N && null !== N.next;
    Hh = 0;
    O = N = M = null;
    Ih = false;
    if (b) throw Error(p(300));
    return a;
  }
  function Sh() {
    var a = 0 !== Kh;
    Kh = 0;
    return a;
  }
  function Th() {
    var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    null === O ? M.memoizedState = O = a : O = O.next = a;
    return O;
  }
  function Uh() {
    if (null === N) {
      var a = M.alternate;
      a = null !== a ? a.memoizedState : null;
    } else a = N.next;
    var b = null === O ? M.memoizedState : O.next;
    if (null !== b) O = b, N = a;
    else {
      if (null === a) throw Error(p(310));
      N = a;
      a = { memoizedState: N.memoizedState, baseState: N.baseState, baseQueue: N.baseQueue, queue: N.queue, next: null };
      null === O ? M.memoizedState = O = a : O = O.next = a;
    }
    return O;
  }
  function Vh(a, b) {
    return "function" === typeof b ? b(a) : b;
  }
  function Wh(a) {
    var b = Uh(), c = b.queue;
    if (null === c) throw Error(p(311));
    c.lastRenderedReducer = a;
    var d = N, e = d.baseQueue, f = c.pending;
    if (null !== f) {
      if (null !== e) {
        var g = e.next;
        e.next = f.next;
        f.next = g;
      }
      d.baseQueue = e = f;
      c.pending = null;
    }
    if (null !== e) {
      f = e.next;
      d = d.baseState;
      var h = g = null, k = null, l = f;
      do {
        var m = l.lane;
        if ((Hh & m) === m) null !== k && (k = k.next = { lane: 0, action: l.action, hasEagerState: l.hasEagerState, eagerState: l.eagerState, next: null }), d = l.hasEagerState ? l.eagerState : a(d, l.action);
        else {
          var q = {
            lane: m,
            action: l.action,
            hasEagerState: l.hasEagerState,
            eagerState: l.eagerState,
            next: null
          };
          null === k ? (h = k = q, g = d) : k = k.next = q;
          M.lanes |= m;
          rh |= m;
        }
        l = l.next;
      } while (null !== l && l !== f);
      null === k ? g = d : k.next = h;
      He(d, b.memoizedState) || (dh = true);
      b.memoizedState = d;
      b.baseState = g;
      b.baseQueue = k;
      c.lastRenderedState = d;
    }
    a = c.interleaved;
    if (null !== a) {
      e = a;
      do
        f = e.lane, M.lanes |= f, rh |= f, e = e.next;
      while (e !== a);
    } else null === e && (c.lanes = 0);
    return [b.memoizedState, c.dispatch];
  }
  function Xh(a) {
    var b = Uh(), c = b.queue;
    if (null === c) throw Error(p(311));
    c.lastRenderedReducer = a;
    var d = c.dispatch, e = c.pending, f = b.memoizedState;
    if (null !== e) {
      c.pending = null;
      var g = e = e.next;
      do
        f = a(f, g.action), g = g.next;
      while (g !== e);
      He(f, b.memoizedState) || (dh = true);
      b.memoizedState = f;
      null === b.baseQueue && (b.baseState = f);
      c.lastRenderedState = f;
    }
    return [f, d];
  }
  function Yh() {
  }
  function Zh(a, b) {
    var c = M, d = Uh(), e = b(), f = !He(d.memoizedState, e);
    f && (d.memoizedState = e, dh = true);
    d = d.queue;
    $h(ai.bind(null, c, d, a), [a]);
    if (d.getSnapshot !== b || f || null !== O && O.memoizedState.tag & 1) {
      c.flags |= 2048;
      bi(9, ci.bind(null, c, d, e, b), void 0, null);
      if (null === Q) throw Error(p(349));
      0 !== (Hh & 30) || di(c, b, e);
    }
    return e;
  }
  function di(a, b, c) {
    a.flags |= 16384;
    a = { getSnapshot: b, value: c };
    b = M.updateQueue;
    null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
  }
  function ci(a, b, c, d) {
    b.value = c;
    b.getSnapshot = d;
    ei(b) && fi(a);
  }
  function ai(a, b, c) {
    return c(function() {
      ei(b) && fi(a);
    });
  }
  function ei(a) {
    var b = a.getSnapshot;
    a = a.value;
    try {
      var c = b();
      return !He(a, c);
    } catch (d) {
      return true;
    }
  }
  function fi(a) {
    var b = ih(a, 1);
    null !== b && gi(b, a, 1, -1);
  }
  function hi(a) {
    var b = Th();
    "function" === typeof a && (a = a());
    b.memoizedState = b.baseState = a;
    a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a };
    b.queue = a;
    a = a.dispatch = ii.bind(null, M, a);
    return [b.memoizedState, a];
  }
  function bi(a, b, c, d) {
    a = { tag: a, create: b, destroy: c, deps: d, next: null };
    b = M.updateQueue;
    null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
    return a;
  }
  function ji() {
    return Uh().memoizedState;
  }
  function ki(a, b, c, d) {
    var e = Th();
    M.flags |= a;
    e.memoizedState = bi(1 | b, c, void 0, void 0 === d ? null : d);
  }
  function li(a, b, c, d) {
    var e = Uh();
    d = void 0 === d ? null : d;
    var f = void 0;
    if (null !== N) {
      var g = N.memoizedState;
      f = g.destroy;
      if (null !== d && Mh(d, g.deps)) {
        e.memoizedState = bi(b, c, f, d);
        return;
      }
    }
    M.flags |= a;
    e.memoizedState = bi(1 | b, c, f, d);
  }
  function mi(a, b) {
    return ki(8390656, 8, a, b);
  }
  function $h(a, b) {
    return li(2048, 8, a, b);
  }
  function ni(a, b) {
    return li(4, 2, a, b);
  }
  function oi(a, b) {
    return li(4, 4, a, b);
  }
  function pi(a, b) {
    if ("function" === typeof b) return a = a(), b(a), function() {
      b(null);
    };
    if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
      b.current = null;
    };
  }
  function qi(a, b, c) {
    c = null !== c && void 0 !== c ? c.concat([a]) : null;
    return li(4, 4, pi.bind(null, b, a), c);
  }
  function ri() {
  }
  function si(a, b) {
    var c = Uh();
    b = void 0 === b ? null : b;
    var d = c.memoizedState;
    if (null !== d && null !== b && Mh(b, d[1])) return d[0];
    c.memoizedState = [a, b];
    return a;
  }
  function ti(a, b) {
    var c = Uh();
    b = void 0 === b ? null : b;
    var d = c.memoizedState;
    if (null !== d && null !== b && Mh(b, d[1])) return d[0];
    a = a();
    c.memoizedState = [a, b];
    return a;
  }
  function ui(a, b, c) {
    if (0 === (Hh & 21)) return a.baseState && (a.baseState = false, dh = true), a.memoizedState = c;
    He(c, b) || (c = yc(), M.lanes |= c, rh |= c, a.baseState = true);
    return b;
  }
  function vi(a, b) {
    var c = C;
    C = 0 !== c && 4 > c ? c : 4;
    a(true);
    var d = Gh.transition;
    Gh.transition = {};
    try {
      a(false), b();
    } finally {
      C = c, Gh.transition = d;
    }
  }
  function wi() {
    return Uh().memoizedState;
  }
  function xi(a, b, c) {
    var d = yi(a);
    c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
    if (zi(a)) Ai(b, c);
    else if (c = hh(a, b, c, d), null !== c) {
      var e = R();
      gi(c, a, d, e);
      Bi(c, b, d);
    }
  }
  function ii(a, b, c) {
    var d = yi(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
    if (zi(a)) Ai(b, e);
    else {
      var f = a.alternate;
      if (0 === a.lanes && (null === f || 0 === f.lanes) && (f = b.lastRenderedReducer, null !== f)) try {
        var g = b.lastRenderedState, h = f(g, c);
        e.hasEagerState = true;
        e.eagerState = h;
        if (He(h, g)) {
          var k = b.interleaved;
          null === k ? (e.next = e, gh(b)) : (e.next = k.next, k.next = e);
          b.interleaved = e;
          return;
        }
      } catch (l) {
      } finally {
      }
      c = hh(a, b, e, d);
      null !== c && (e = R(), gi(c, a, d, e), Bi(c, b, d));
    }
  }
  function zi(a) {
    var b = a.alternate;
    return a === M || null !== b && b === M;
  }
  function Ai(a, b) {
    Jh = Ih = true;
    var c = a.pending;
    null === c ? b.next = b : (b.next = c.next, c.next = b);
    a.pending = b;
  }
  function Bi(a, b, c) {
    if (0 !== (c & 4194240)) {
      var d = b.lanes;
      d &= a.pendingLanes;
      c |= d;
      b.lanes = c;
      Cc(a, c);
    }
  }
  var Rh = { readContext: eh, useCallback: P, useContext: P, useEffect: P, useImperativeHandle: P, useInsertionEffect: P, useLayoutEffect: P, useMemo: P, useReducer: P, useRef: P, useState: P, useDebugValue: P, useDeferredValue: P, useTransition: P, useMutableSource: P, useSyncExternalStore: P, useId: P, unstable_isNewReconciler: false }, Oh = { readContext: eh, useCallback: function(a, b) {
    Th().memoizedState = [a, void 0 === b ? null : b];
    return a;
  }, useContext: eh, useEffect: mi, useImperativeHandle: function(a, b, c) {
    c = null !== c && void 0 !== c ? c.concat([a]) : null;
    return ki(
      4194308,
      4,
      pi.bind(null, b, a),
      c
    );
  }, useLayoutEffect: function(a, b) {
    return ki(4194308, 4, a, b);
  }, useInsertionEffect: function(a, b) {
    return ki(4, 2, a, b);
  }, useMemo: function(a, b) {
    var c = Th();
    b = void 0 === b ? null : b;
    a = a();
    c.memoizedState = [a, b];
    return a;
  }, useReducer: function(a, b, c) {
    var d = Th();
    b = void 0 !== c ? c(b) : b;
    d.memoizedState = d.baseState = b;
    a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
    d.queue = a;
    a = a.dispatch = xi.bind(null, M, a);
    return [d.memoizedState, a];
  }, useRef: function(a) {
    var b = Th();
    a = { current: a };
    return b.memoizedState = a;
  }, useState: hi, useDebugValue: ri, useDeferredValue: function(a) {
    return Th().memoizedState = a;
  }, useTransition: function() {
    var a = hi(false), b = a[0];
    a = vi.bind(null, a[1]);
    Th().memoizedState = a;
    return [b, a];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(a, b, c) {
    var d = M, e = Th();
    if (I) {
      if (void 0 === c) throw Error(p(407));
      c = c();
    } else {
      c = b();
      if (null === Q) throw Error(p(349));
      0 !== (Hh & 30) || di(d, b, c);
    }
    e.memoizedState = c;
    var f = { value: c, getSnapshot: b };
    e.queue = f;
    mi(ai.bind(
      null,
      d,
      f,
      a
    ), [a]);
    d.flags |= 2048;
    bi(9, ci.bind(null, d, f, c, b), void 0, null);
    return c;
  }, useId: function() {
    var a = Th(), b = Q.identifierPrefix;
    if (I) {
      var c = sg;
      var d = rg;
      c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
      b = ":" + b + "R" + c;
      c = Kh++;
      0 < c && (b += "H" + c.toString(32));
      b += ":";
    } else c = Lh++, b = ":" + b + "r" + c.toString(32) + ":";
    return a.memoizedState = b;
  }, unstable_isNewReconciler: false }, Ph = {
    readContext: eh,
    useCallback: si,
    useContext: eh,
    useEffect: $h,
    useImperativeHandle: qi,
    useInsertionEffect: ni,
    useLayoutEffect: oi,
    useMemo: ti,
    useReducer: Wh,
    useRef: ji,
    useState: function() {
      return Wh(Vh);
    },
    useDebugValue: ri,
    useDeferredValue: function(a) {
      var b = Uh();
      return ui(b, N.memoizedState, a);
    },
    useTransition: function() {
      var a = Wh(Vh)[0], b = Uh().memoizedState;
      return [a, b];
    },
    useMutableSource: Yh,
    useSyncExternalStore: Zh,
    useId: wi,
    unstable_isNewReconciler: false
  }, Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
    return Xh(Vh);
  }, useDebugValue: ri, useDeferredValue: function(a) {
    var b = Uh();
    return null === N ? b.memoizedState = a : ui(b, N.memoizedState, a);
  }, useTransition: function() {
    var a = Xh(Vh)[0], b = Uh().memoizedState;
    return [a, b];
  }, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
  function Ci(a, b) {
    if (a && a.defaultProps) {
      b = A({}, b);
      a = a.defaultProps;
      for (var c in a) void 0 === b[c] && (b[c] = a[c]);
      return b;
    }
    return b;
  }
  function Di(a, b, c, d) {
    b = a.memoizedState;
    c = c(d, b);
    c = null === c || void 0 === c ? b : A({}, b, c);
    a.memoizedState = c;
    0 === a.lanes && (a.updateQueue.baseState = c);
  }
  var Ei = { isMounted: function(a) {
    return (a = a._reactInternals) ? Vb(a) === a : false;
  }, enqueueSetState: function(a, b, c) {
    a = a._reactInternals;
    var d = R(), e = yi(a), f = mh(d, e);
    f.payload = b;
    void 0 !== c && null !== c && (f.callback = c);
    b = nh(a, f, e);
    null !== b && (gi(b, a, e, d), oh(b, a, e));
  }, enqueueReplaceState: function(a, b, c) {
    a = a._reactInternals;
    var d = R(), e = yi(a), f = mh(d, e);
    f.tag = 1;
    f.payload = b;
    void 0 !== c && null !== c && (f.callback = c);
    b = nh(a, f, e);
    null !== b && (gi(b, a, e, d), oh(b, a, e));
  }, enqueueForceUpdate: function(a, b) {
    a = a._reactInternals;
    var c = R(), d = yi(a), e = mh(c, d);
    e.tag = 2;
    void 0 !== b && null !== b && (e.callback = b);
    b = nh(a, e, d);
    null !== b && (gi(b, a, d, c), oh(b, a, d));
  } };
  function Fi(a, b, c, d, e, f, g) {
    a = a.stateNode;
    return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f) : true;
  }
  function Gi(a, b, c) {
    var d = false, e = Vf;
    var f = b.contextType;
    "object" === typeof f && null !== f ? f = eh(f) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
    b = new b(c, f);
    a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
    b.updater = Ei;
    a.stateNode = b;
    b._reactInternals = a;
    d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
    return b;
  }
  function Hi(a, b, c, d) {
    a = b.state;
    "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
    "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
    b.state !== a && Ei.enqueueReplaceState(b, b.state, null);
  }
  function Ii(a, b, c, d) {
    var e = a.stateNode;
    e.props = c;
    e.state = a.memoizedState;
    e.refs = {};
    kh(a);
    var f = b.contextType;
    "object" === typeof f && null !== f ? e.context = eh(f) : (f = Zf(b) ? Xf : H.current, e.context = Yf(a, f));
    e.state = a.memoizedState;
    f = b.getDerivedStateFromProps;
    "function" === typeof f && (Di(a, b, f, c), e.state = a.memoizedState);
    "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && Ei.enqueueReplaceState(e, e.state, null), qh(a, c, e, d), e.state = a.memoizedState);
    "function" === typeof e.componentDidMount && (a.flags |= 4194308);
  }
  function Ji(a, b) {
    try {
      var c = "", d = b;
      do
        c += Pa(d), d = d.return;
      while (d);
      var e = c;
    } catch (f) {
      e = "\nError generating stack: " + f.message + "\n" + f.stack;
    }
    return { value: a, source: b, stack: e, digest: null };
  }
  function Ki(a, b, c) {
    return { value: a, source: null, stack: null != c ? c : null, digest: null != b ? b : null };
  }
  function Li(a, b) {
    try {
      console.error(b.value);
    } catch (c) {
      setTimeout(function() {
        throw c;
      });
    }
  }
  var Mi = "function" === typeof WeakMap ? WeakMap : Map;
  function Ni(a, b, c) {
    c = mh(-1, c);
    c.tag = 3;
    c.payload = { element: null };
    var d = b.value;
    c.callback = function() {
      Oi || (Oi = true, Pi = d);
      Li(a, b);
    };
    return c;
  }
  function Qi(a, b, c) {
    c = mh(-1, c);
    c.tag = 3;
    var d = a.type.getDerivedStateFromError;
    if ("function" === typeof d) {
      var e = b.value;
      c.payload = function() {
        return d(e);
      };
      c.callback = function() {
        Li(a, b);
      };
    }
    var f = a.stateNode;
    null !== f && "function" === typeof f.componentDidCatch && (c.callback = function() {
      Li(a, b);
      "function" !== typeof d && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
      var c2 = b.stack;
      this.componentDidCatch(b.value, { componentStack: null !== c2 ? c2 : "" });
    });
    return c;
  }
  function Si(a, b, c) {
    var d = a.pingCache;
    if (null === d) {
      d = a.pingCache = new Mi();
      var e = /* @__PURE__ */ new Set();
      d.set(b, e);
    } else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
    e.has(c) || (e.add(c), a = Ti.bind(null, a, b, c), b.then(a, a));
  }
  function Ui(a) {
    do {
      var b;
      if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
      if (b) return a;
      a = a.return;
    } while (null !== a);
    return null;
  }
  function Vi(a, b, c, d, e) {
    if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = mh(-1, 1), b.tag = 2, nh(c, b, 1))), c.lanes |= 1), a;
    a.flags |= 65536;
    a.lanes = e;
    return a;
  }
  var Wi = ua.ReactCurrentOwner, dh = false;
  function Xi(a, b, c, d) {
    b.child = null === a ? Vg(b, null, c, d) : Ug(b, a.child, c, d);
  }
  function Yi(a, b, c, d, e) {
    c = c.render;
    var f = b.ref;
    ch(b, e);
    d = Nh(a, b, c, d, f, e);
    c = Sh();
    if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
    I && c && vg(b);
    b.flags |= 1;
    Xi(a, b, d, e);
    return b.child;
  }
  function $i(a, b, c, d, e) {
    if (null === a) {
      var f = c.type;
      if ("function" === typeof f && !aj(f) && void 0 === f.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f, bj(a, b, f, d, e);
      a = Rg(c.type, null, d, b, b.mode, e);
      a.ref = b.ref;
      a.return = b;
      return b.child = a;
    }
    f = a.child;
    if (0 === (a.lanes & e)) {
      var g = f.memoizedProps;
      c = c.compare;
      c = null !== c ? c : Ie;
      if (c(g, d) && a.ref === b.ref) return Zi(a, b, e);
    }
    b.flags |= 1;
    a = Pg(f, d);
    a.ref = b.ref;
    a.return = b;
    return b.child = a;
  }
  function bj(a, b, c, d, e) {
    if (null !== a) {
      var f = a.memoizedProps;
      if (Ie(f, d) && a.ref === b.ref) if (dh = false, b.pendingProps = d = f, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (dh = true);
      else return b.lanes = a.lanes, Zi(a, b, e);
    }
    return cj(a, b, c, d, e);
  }
  function dj(a, b, c) {
    var d = b.pendingProps, e = d.children, f = null !== a ? a.memoizedState : null;
    if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(ej, fj), fj |= c;
    else {
      if (0 === (c & 1073741824)) return a = null !== f ? f.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, G(ej, fj), fj |= a, null;
      b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
      d = null !== f ? f.baseLanes : c;
      G(ej, fj);
      fj |= d;
    }
    else null !== f ? (d = f.baseLanes | c, b.memoizedState = null) : d = c, G(ej, fj), fj |= d;
    Xi(a, b, e, c);
    return b.child;
  }
  function gj(a, b) {
    var c = b.ref;
    if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
  }
  function cj(a, b, c, d, e) {
    var f = Zf(c) ? Xf : H.current;
    f = Yf(b, f);
    ch(b, e);
    c = Nh(a, b, c, d, f, e);
    d = Sh();
    if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
    I && d && vg(b);
    b.flags |= 1;
    Xi(a, b, c, e);
    return b.child;
  }
  function hj(a, b, c, d, e) {
    if (Zf(c)) {
      var f = true;
      cg(b);
    } else f = false;
    ch(b, e);
    if (null === b.stateNode) ij(a, b), Gi(b, c, d), Ii(b, c, d, e), d = true;
    else if (null === a) {
      var g = b.stateNode, h = b.memoizedProps;
      g.props = h;
      var k = g.context, l = c.contextType;
      "object" === typeof l && null !== l ? l = eh(l) : (l = Zf(c) ? Xf : H.current, l = Yf(b, l));
      var m = c.getDerivedStateFromProps, q = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
      q || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && Hi(b, g, d, l);
      jh = false;
      var r = b.memoizedState;
      g.state = r;
      qh(b, d, g, e);
      k = b.memoizedState;
      h !== d || r !== k || Wf.current || jh ? ("function" === typeof m && (Di(b, c, m, d), k = b.memoizedState), (h = jh || Fi(b, c, h, d, r, k, l)) ? (q || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = false);
    } else {
      g = b.stateNode;
      lh(a, b);
      h = b.memoizedProps;
      l = b.type === b.elementType ? h : Ci(b.type, h);
      g.props = l;
      q = b.pendingProps;
      r = g.context;
      k = c.contextType;
      "object" === typeof k && null !== k ? k = eh(k) : (k = Zf(c) ? Xf : H.current, k = Yf(b, k));
      var y = c.getDerivedStateFromProps;
      (m = "function" === typeof y || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q || r !== k) && Hi(b, g, d, k);
      jh = false;
      r = b.memoizedState;
      g.state = r;
      qh(b, d, g, e);
      var n = b.memoizedState;
      h !== q || r !== n || Wf.current || jh ? ("function" === typeof y && (Di(b, c, y, d), n = b.memoizedState), (l = jh || Fi(b, c, l, d, r, n, k) || false) ? (m || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n, k), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n, k)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n), g.props = d, g.state = n, g.context = k, d = l) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), d = false);
    }
    return jj(a, b, c, d, f, e);
  }
  function jj(a, b, c, d, e, f) {
    gj(a, b);
    var g = 0 !== (b.flags & 128);
    if (!d && !g) return e && dg(b, c, false), Zi(a, b, f);
    d = b.stateNode;
    Wi.current = b;
    var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
    b.flags |= 1;
    null !== a && g ? (b.child = Ug(b, a.child, null, f), b.child = Ug(b, null, h, f)) : Xi(a, b, h, f);
    b.memoizedState = d.state;
    e && dg(b, c, true);
    return b.child;
  }
  function kj(a) {
    var b = a.stateNode;
    b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, false);
    yh(a, b.containerInfo);
  }
  function lj(a, b, c, d, e) {
    Ig();
    Jg(e);
    b.flags |= 256;
    Xi(a, b, c, d);
    return b.child;
  }
  var mj = { dehydrated: null, treeContext: null, retryLane: 0 };
  function nj(a) {
    return { baseLanes: a, cachePool: null, transitions: null };
  }
  function oj(a, b, c) {
    var d = b.pendingProps, e = L.current, f = false, g = 0 !== (b.flags & 128), h;
    (h = g) || (h = null !== a && null === a.memoizedState ? false : 0 !== (e & 2));
    if (h) f = true, b.flags &= -129;
    else if (null === a || null !== a.memoizedState) e |= 1;
    G(L, e & 1);
    if (null === a) {
      Eg(b);
      a = b.memoizedState;
      if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
      g = d.children;
      a = d.fallback;
      return f ? (d = b.mode, f = b.child, g = { mode: "hidden", children: g }, 0 === (d & 1) && null !== f ? (f.childLanes = 0, f.pendingProps = g) : f = pj(g, d, 0, null), a = Tg(a, d, c, null), f.return = b, a.return = b, f.sibling = a, b.child = f, b.child.memoizedState = nj(c), b.memoizedState = mj, a) : qj(b, g);
    }
    e = a.memoizedState;
    if (null !== e && (h = e.dehydrated, null !== h)) return rj(a, b, g, d, h, e, c);
    if (f) {
      f = d.fallback;
      g = b.mode;
      e = a.child;
      h = e.sibling;
      var k = { mode: "hidden", children: d.children };
      0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k, b.deletions = null) : (d = Pg(e, k), d.subtreeFlags = e.subtreeFlags & 14680064);
      null !== h ? f = Pg(h, f) : (f = Tg(f, g, c, null), f.flags |= 2);
      f.return = b;
      d.return = b;
      d.sibling = f;
      b.child = d;
      d = f;
      f = b.child;
      g = a.child.memoizedState;
      g = null === g ? nj(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
      f.memoizedState = g;
      f.childLanes = a.childLanes & ~c;
      b.memoizedState = mj;
      return d;
    }
    f = a.child;
    a = f.sibling;
    d = Pg(f, { mode: "visible", children: d.children });
    0 === (b.mode & 1) && (d.lanes = c);
    d.return = b;
    d.sibling = null;
    null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
    b.child = d;
    b.memoizedState = null;
    return d;
  }
  function qj(a, b) {
    b = pj({ mode: "visible", children: b }, a.mode, 0, null);
    b.return = a;
    return a.child = b;
  }
  function sj(a, b, c, d) {
    null !== d && Jg(d);
    Ug(b, a.child, null, c);
    a = qj(b, b.pendingProps.children);
    a.flags |= 2;
    b.memoizedState = null;
    return a;
  }
  function rj(a, b, c, d, e, f, g) {
    if (c) {
      if (b.flags & 256) return b.flags &= -257, d = Ki(Error(p(422))), sj(a, b, g, d);
      if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
      f = d.fallback;
      e = b.mode;
      d = pj({ mode: "visible", children: d.children }, e, 0, null);
      f = Tg(f, e, g, null);
      f.flags |= 2;
      d.return = b;
      f.return = b;
      d.sibling = f;
      b.child = d;
      0 !== (b.mode & 1) && Ug(b, a.child, null, g);
      b.child.memoizedState = nj(g);
      b.memoizedState = mj;
      return f;
    }
    if (0 === (b.mode & 1)) return sj(a, b, g, null);
    if ("$!" === e.data) {
      d = e.nextSibling && e.nextSibling.dataset;
      if (d) var h = d.dgst;
      d = h;
      f = Error(p(419));
      d = Ki(f, d, void 0);
      return sj(a, b, g, d);
    }
    h = 0 !== (g & a.childLanes);
    if (dh || h) {
      d = Q;
      if (null !== d) {
        switch (g & -g) {
          case 4:
            e = 2;
            break;
          case 16:
            e = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            e = 32;
            break;
          case 536870912:
            e = 268435456;
            break;
          default:
            e = 0;
        }
        e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
        0 !== e && e !== f.retryLane && (f.retryLane = e, ih(a, e), gi(d, a, e, -1));
      }
      tj();
      d = Ki(Error(p(421)));
      return sj(a, b, g, d);
    }
    if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = uj.bind(null, a), e._reactRetry = b, null;
    a = f.treeContext;
    yg = Lf(e.nextSibling);
    xg = b;
    I = true;
    zg = null;
    null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
    b = qj(b, d.children);
    b.flags |= 4096;
    return b;
  }
  function vj(a, b, c) {
    a.lanes |= b;
    var d = a.alternate;
    null !== d && (d.lanes |= b);
    bh(a.return, b, c);
  }
  function wj(a, b, c, d, e) {
    var f = a.memoizedState;
    null === f ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f.isBackwards = b, f.rendering = null, f.renderingStartTime = 0, f.last = d, f.tail = c, f.tailMode = e);
  }
  function xj(a, b, c) {
    var d = b.pendingProps, e = d.revealOrder, f = d.tail;
    Xi(a, b, d.children, c);
    d = L.current;
    if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
    else {
      if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a; ) {
        if (13 === a.tag) null !== a.memoizedState && vj(a, c, b);
        else if (19 === a.tag) vj(a, c, b);
        else if (null !== a.child) {
          a.child.return = a;
          a = a.child;
          continue;
        }
        if (a === b) break a;
        for (; null === a.sibling; ) {
          if (null === a.return || a.return === b) break a;
          a = a.return;
        }
        a.sibling.return = a.return;
        a = a.sibling;
      }
      d &= 1;
    }
    G(L, d);
    if (0 === (b.mode & 1)) b.memoizedState = null;
    else switch (e) {
      case "forwards":
        c = b.child;
        for (e = null; null !== c; ) a = c.alternate, null !== a && null === Ch(a) && (e = c), c = c.sibling;
        c = e;
        null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
        wj(b, false, e, c, f);
        break;
      case "backwards":
        c = null;
        e = b.child;
        for (b.child = null; null !== e; ) {
          a = e.alternate;
          if (null !== a && null === Ch(a)) {
            b.child = e;
            break;
          }
          a = e.sibling;
          e.sibling = c;
          c = e;
          e = a;
        }
        wj(b, true, c, null, f);
        break;
      case "together":
        wj(b, false, null, null, void 0);
        break;
      default:
        b.memoizedState = null;
    }
    return b.child;
  }
  function ij(a, b) {
    0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
  }
  function Zi(a, b, c) {
    null !== a && (b.dependencies = a.dependencies);
    rh |= b.lanes;
    if (0 === (c & b.childLanes)) return null;
    if (null !== a && b.child !== a.child) throw Error(p(153));
    if (null !== b.child) {
      a = b.child;
      c = Pg(a, a.pendingProps);
      b.child = c;
      for (c.return = b; null !== a.sibling; ) a = a.sibling, c = c.sibling = Pg(a, a.pendingProps), c.return = b;
      c.sibling = null;
    }
    return b.child;
  }
  function yj(a, b, c) {
    switch (b.tag) {
      case 3:
        kj(b);
        Ig();
        break;
      case 5:
        Ah(b);
        break;
      case 1:
        Zf(b.type) && cg(b);
        break;
      case 4:
        yh(b, b.stateNode.containerInfo);
        break;
      case 10:
        var d = b.type._context, e = b.memoizedProps.value;
        G(Wg, d._currentValue);
        d._currentValue = e;
        break;
      case 13:
        d = b.memoizedState;
        if (null !== d) {
          if (null !== d.dehydrated) return G(L, L.current & 1), b.flags |= 128, null;
          if (0 !== (c & b.child.childLanes)) return oj(a, b, c);
          G(L, L.current & 1);
          a = Zi(a, b, c);
          return null !== a ? a.sibling : null;
        }
        G(L, L.current & 1);
        break;
      case 19:
        d = 0 !== (c & b.childLanes);
        if (0 !== (a.flags & 128)) {
          if (d) return xj(a, b, c);
          b.flags |= 128;
        }
        e = b.memoizedState;
        null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
        G(L, L.current);
        if (d) break;
        else return null;
      case 22:
      case 23:
        return b.lanes = 0, dj(a, b, c);
    }
    return Zi(a, b, c);
  }
  var zj, Aj, Bj, Cj;
  zj = function(a, b) {
    for (var c = b.child; null !== c; ) {
      if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
      else if (4 !== c.tag && null !== c.child) {
        c.child.return = c;
        c = c.child;
        continue;
      }
      if (c === b) break;
      for (; null === c.sibling; ) {
        if (null === c.return || c.return === b) return;
        c = c.return;
      }
      c.sibling.return = c.return;
      c = c.sibling;
    }
  };
  Aj = function() {
  };
  Bj = function(a, b, c, d) {
    var e = a.memoizedProps;
    if (e !== d) {
      a = b.stateNode;
      xh(uh.current);
      var f = null;
      switch (c) {
        case "input":
          e = Ya(a, e);
          d = Ya(a, d);
          f = [];
          break;
        case "select":
          e = A({}, e, { value: void 0 });
          d = A({}, d, { value: void 0 });
          f = [];
          break;
        case "textarea":
          e = gb(a, e);
          d = gb(a, d);
          f = [];
          break;
        default:
          "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
      }
      ub(c, d);
      var g;
      c = null;
      for (l in e) if (!d.hasOwnProperty(l) && e.hasOwnProperty(l) && null != e[l]) if ("style" === l) {
        var h = e[l];
        for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
      } else "dangerouslySetInnerHTML" !== l && "children" !== l && "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && "autoFocus" !== l && (ea.hasOwnProperty(l) ? f || (f = []) : (f = f || []).push(l, null));
      for (l in d) {
        var k = d[l];
        h = null != e ? e[l] : void 0;
        if (d.hasOwnProperty(l) && k !== h && (null != k || null != h)) if ("style" === l) if (h) {
          for (g in h) !h.hasOwnProperty(g) || k && k.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
          for (g in k) k.hasOwnProperty(g) && h[g] !== k[g] && (c || (c = {}), c[g] = k[g]);
        } else c || (f || (f = []), f.push(
          l,
          c
        )), c = k;
        else "dangerouslySetInnerHTML" === l ? (k = k ? k.__html : void 0, h = h ? h.__html : void 0, null != k && h !== k && (f = f || []).push(l, k)) : "children" === l ? "string" !== typeof k && "number" !== typeof k || (f = f || []).push(l, "" + k) : "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && (ea.hasOwnProperty(l) ? (null != k && "onScroll" === l && D("scroll", a), f || h === k || (f = [])) : (f = f || []).push(l, k));
      }
      c && (f = f || []).push("style", c);
      var l = f;
      if (b.updateQueue = l) b.flags |= 4;
    }
  };
  Cj = function(a, b, c, d) {
    c !== d && (b.flags |= 4);
  };
  function Dj(a, b) {
    if (!I) switch (a.tailMode) {
      case "hidden":
        b = a.tail;
        for (var c = null; null !== b; ) null !== b.alternate && (c = b), b = b.sibling;
        null === c ? a.tail = null : c.sibling = null;
        break;
      case "collapsed":
        c = a.tail;
        for (var d = null; null !== c; ) null !== c.alternate && (d = c), c = c.sibling;
        null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
    }
  }
  function S(a) {
    var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
    if (b) for (var e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
    else for (e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
    a.subtreeFlags |= d;
    a.childLanes = c;
    return b;
  }
  function Ej(a, b, c) {
    var d = b.pendingProps;
    wg(b);
    switch (b.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return S(b), null;
      case 1:
        return Zf(b.type) && $f(), S(b), null;
      case 3:
        d = b.stateNode;
        zh();
        E(Wf);
        E(H);
        Eh();
        d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
        if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Fj(zg), zg = null));
        Aj(a, b);
        S(b);
        return null;
      case 5:
        Bh(b);
        var e = xh(wh.current);
        c = b.type;
        if (null !== a && null != b.stateNode) Bj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
        else {
          if (!d) {
            if (null === b.stateNode) throw Error(p(166));
            S(b);
            return null;
          }
          a = xh(uh.current);
          if (Gg(b)) {
            d = b.stateNode;
            c = b.type;
            var f = b.memoizedProps;
            d[Of] = b;
            d[Pf] = f;
            a = 0 !== (b.mode & 1);
            switch (c) {
              case "dialog":
                D("cancel", d);
                D("close", d);
                break;
              case "iframe":
              case "object":
              case "embed":
                D("load", d);
                break;
              case "video":
              case "audio":
                for (e = 0; e < lf.length; e++) D(lf[e], d);
                break;
              case "source":
                D("error", d);
                break;
              case "img":
              case "image":
              case "link":
                D(
                  "error",
                  d
                );
                D("load", d);
                break;
              case "details":
                D("toggle", d);
                break;
              case "input":
                Za(d, f);
                D("invalid", d);
                break;
              case "select":
                d._wrapperState = { wasMultiple: !!f.multiple };
                D("invalid", d);
                break;
              case "textarea":
                hb(d, f), D("invalid", d);
            }
            ub(c, f);
            e = null;
            for (var g in f) if (f.hasOwnProperty(g)) {
              var h = f[g];
              "children" === g ? "string" === typeof h ? d.textContent !== h && (true !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (true !== f.suppressHydrationWarning && Af(
                d.textContent,
                h,
                a
              ), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
            }
            switch (c) {
              case "input":
                Va(d);
                db(d, f, true);
                break;
              case "textarea":
                Va(d);
                jb(d);
                break;
              case "select":
              case "option":
                break;
              default:
                "function" === typeof f.onClick && (d.onclick = Bf);
            }
            d = e;
            b.updateQueue = d;
            null !== d && (b.flags |= 4);
          } else {
            g = 9 === e.nodeType ? e : e.ownerDocument;
            "http://www.w3.org/1999/xhtml" === a && (a = kb(c));
            "http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = true : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
            a[Of] = b;
            a[Pf] = d;
            zj(a, b, false, false);
            b.stateNode = a;
            a: {
              g = vb(c, d);
              switch (c) {
                case "dialog":
                  D("cancel", a);
                  D("close", a);
                  e = d;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  D("load", a);
                  e = d;
                  break;
                case "video":
                case "audio":
                  for (e = 0; e < lf.length; e++) D(lf[e], a);
                  e = d;
                  break;
                case "source":
                  D("error", a);
                  e = d;
                  break;
                case "img":
                case "image":
                case "link":
                  D(
                    "error",
                    a
                  );
                  D("load", a);
                  e = d;
                  break;
                case "details":
                  D("toggle", a);
                  e = d;
                  break;
                case "input":
                  Za(a, d);
                  e = Ya(a, d);
                  D("invalid", a);
                  break;
                case "option":
                  e = d;
                  break;
                case "select":
                  a._wrapperState = { wasMultiple: !!d.multiple };
                  e = A({}, d, { value: void 0 });
                  D("invalid", a);
                  break;
                case "textarea":
                  hb(a, d);
                  e = gb(a, d);
                  D("invalid", a);
                  break;
                default:
                  e = d;
              }
              ub(c, e);
              h = e;
              for (f in h) if (h.hasOwnProperty(f)) {
                var k = h[f];
                "style" === f ? sb(a, k) : "dangerouslySetInnerHTML" === f ? (k = k ? k.__html : void 0, null != k && nb(a, k)) : "children" === f ? "string" === typeof k ? ("textarea" !== c || "" !== k) && ob(a, k) : "number" === typeof k && ob(a, "" + k) : "suppressContentEditableWarning" !== f && "suppressHydrationWarning" !== f && "autoFocus" !== f && (ea.hasOwnProperty(f) ? null != k && "onScroll" === f && D("scroll", a) : null != k && ta(a, f, k, g));
              }
              switch (c) {
                case "input":
                  Va(a);
                  db(a, d, false);
                  break;
                case "textarea":
                  Va(a);
                  jb(a);
                  break;
                case "option":
                  null != d.value && a.setAttribute("value", "" + Sa(d.value));
                  break;
                case "select":
                  a.multiple = !!d.multiple;
                  f = d.value;
                  null != f ? fb(a, !!d.multiple, f, false) : null != d.defaultValue && fb(
                    a,
                    !!d.multiple,
                    d.defaultValue,
                    true
                  );
                  break;
                default:
                  "function" === typeof e.onClick && (a.onclick = Bf);
              }
              switch (c) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  d = !!d.autoFocus;
                  break a;
                case "img":
                  d = true;
                  break a;
                default:
                  d = false;
              }
            }
            d && (b.flags |= 4);
          }
          null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
        }
        S(b);
        return null;
      case 6:
        if (a && null != b.stateNode) Cj(a, b, a.memoizedProps, d);
        else {
          if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
          c = xh(wh.current);
          xh(uh.current);
          if (Gg(b)) {
            d = b.stateNode;
            c = b.memoizedProps;
            d[Of] = b;
            if (f = d.nodeValue !== c) {
              if (a = xg, null !== a) switch (a.tag) {
                case 3:
                  Af(d.nodeValue, c, 0 !== (a.mode & 1));
                  break;
                case 5:
                  true !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
              }
            }
            f && (b.flags |= 4);
          } else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
        }
        S(b);
        return null;
      case 13:
        E(L);
        d = b.memoizedState;
        if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
          if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f = false;
          else if (f = Gg(b), null !== d && null !== d.dehydrated) {
            if (null === a) {
              if (!f) throw Error(p(318));
              f = b.memoizedState;
              f = null !== f ? f.dehydrated : null;
              if (!f) throw Error(p(317));
              f[Of] = b;
            } else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
            S(b);
            f = false;
          } else null !== zg && (Fj(zg), zg = null), f = true;
          if (!f) return b.flags & 65536 ? b : null;
        }
        if (0 !== (b.flags & 128)) return b.lanes = c, b;
        d = null !== d;
        d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (L.current & 1) ? 0 === T && (T = 3) : tj()));
        null !== b.updateQueue && (b.flags |= 4);
        S(b);
        return null;
      case 4:
        return zh(), Aj(a, b), null === a && sf(b.stateNode.containerInfo), S(b), null;
      case 10:
        return ah(b.type._context), S(b), null;
      case 17:
        return Zf(b.type) && $f(), S(b), null;
      case 19:
        E(L);
        f = b.memoizedState;
        if (null === f) return S(b), null;
        d = 0 !== (b.flags & 128);
        g = f.rendering;
        if (null === g) if (d) Dj(f, false);
        else {
          if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a; ) {
            g = Ch(a);
            if (null !== g) {
              b.flags |= 128;
              Dj(f, false);
              d = g.updateQueue;
              null !== d && (b.updateQueue = d, b.flags |= 4);
              b.subtreeFlags = 0;
              d = c;
              for (c = b.child; null !== c; ) f = c, a = d, f.flags &= 14680066, g = f.alternate, null === g ? (f.childLanes = 0, f.lanes = a, f.child = null, f.subtreeFlags = 0, f.memoizedProps = null, f.memoizedState = null, f.updateQueue = null, f.dependencies = null, f.stateNode = null) : (f.childLanes = g.childLanes, f.lanes = g.lanes, f.child = g.child, f.subtreeFlags = 0, f.deletions = null, f.memoizedProps = g.memoizedProps, f.memoizedState = g.memoizedState, f.updateQueue = g.updateQueue, f.type = g.type, a = g.dependencies, f.dependencies = null === a ? null : { lanes: a.lanes, firstContext: a.firstContext }), c = c.sibling;
              G(L, L.current & 1 | 2);
              return b.child;
            }
            a = a.sibling;
          }
          null !== f.tail && B() > Gj && (b.flags |= 128, d = true, Dj(f, false), b.lanes = 4194304);
        }
        else {
          if (!d) if (a = Ch(g), null !== a) {
            if (b.flags |= 128, d = true, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Dj(f, true), null === f.tail && "hidden" === f.tailMode && !g.alternate && !I) return S(b), null;
          } else 2 * B() - f.renderingStartTime > Gj && 1073741824 !== c && (b.flags |= 128, d = true, Dj(f, false), b.lanes = 4194304);
          f.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f.last, null !== c ? c.sibling = g : b.child = g, f.last = g);
        }
        if (null !== f.tail) return b = f.tail, f.rendering = b, f.tail = b.sibling, f.renderingStartTime = B(), b.sibling = null, c = L.current, G(L, d ? c & 1 | 2 : c & 1), b;
        S(b);
        return null;
      case 22:
      case 23:
        return Hj(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (fj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(p(156, b.tag));
  }
  function Ij(a, b) {
    wg(b);
    switch (b.tag) {
      case 1:
        return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
      case 3:
        return zh(), E(Wf), E(H), Eh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
      case 5:
        return Bh(b), null;
      case 13:
        E(L);
        a = b.memoizedState;
        if (null !== a && null !== a.dehydrated) {
          if (null === b.alternate) throw Error(p(340));
          Ig();
        }
        a = b.flags;
        return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
      case 19:
        return E(L), null;
      case 4:
        return zh(), null;
      case 10:
        return ah(b.type._context), null;
      case 22:
      case 23:
        return Hj(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Jj = false, U = false, Kj = "function" === typeof WeakSet ? WeakSet : Set, V = null;
  function Lj(a, b) {
    var c = a.ref;
    if (null !== c) if ("function" === typeof c) try {
      c(null);
    } catch (d) {
      W(a, b, d);
    }
    else c.current = null;
  }
  function Mj(a, b, c) {
    try {
      c();
    } catch (d) {
      W(a, b, d);
    }
  }
  var Nj = false;
  function Oj(a, b) {
    Cf = dd;
    a = Me();
    if (Ne(a)) {
      if ("selectionStart" in a) var c = { start: a.selectionStart, end: a.selectionEnd };
      else a: {
        c = (c = a.ownerDocument) && c.defaultView || window;
        var d = c.getSelection && c.getSelection();
        if (d && 0 !== d.rangeCount) {
          c = d.anchorNode;
          var e = d.anchorOffset, f = d.focusNode;
          d = d.focusOffset;
          try {
            c.nodeType, f.nodeType;
          } catch (F) {
            c = null;
            break a;
          }
          var g = 0, h = -1, k = -1, l = 0, m = 0, q = a, r = null;
          b: for (; ; ) {
            for (var y; ; ) {
              q !== c || 0 !== e && 3 !== q.nodeType || (h = g + e);
              q !== f || 0 !== d && 3 !== q.nodeType || (k = g + d);
              3 === q.nodeType && (g += q.nodeValue.length);
              if (null === (y = q.firstChild)) break;
              r = q;
              q = y;
            }
            for (; ; ) {
              if (q === a) break b;
              r === c && ++l === e && (h = g);
              r === f && ++m === d && (k = g);
              if (null !== (y = q.nextSibling)) break;
              q = r;
              r = q.parentNode;
            }
            q = y;
          }
          c = -1 === h || -1 === k ? null : { start: h, end: k };
        } else c = null;
      }
      c = c || { start: 0, end: 0 };
    } else c = null;
    Df = { focusedElem: a, selectionRange: c };
    dd = false;
    for (V = b; null !== V; ) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
    else for (; null !== V; ) {
      b = V;
      try {
        var n = b.alternate;
        if (0 !== (b.flags & 1024)) switch (b.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (null !== n) {
              var t = n.memoizedProps, J = n.memoizedState, x = b.stateNode, w = x.getSnapshotBeforeUpdate(b.elementType === b.type ? t : Ci(b.type, t), J);
              x.__reactInternalSnapshotBeforeUpdate = w;
            }
            break;
          case 3:
            var u = b.stateNode.containerInfo;
            1 === u.nodeType ? u.textContent = "" : 9 === u.nodeType && u.documentElement && u.removeChild(u.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(p(163));
        }
      } catch (F) {
        W(b, b.return, F);
      }
      a = b.sibling;
      if (null !== a) {
        a.return = b.return;
        V = a;
        break;
      }
      V = b.return;
    }
    n = Nj;
    Nj = false;
    return n;
  }
  function Pj(a, b, c) {
    var d = b.updateQueue;
    d = null !== d ? d.lastEffect : null;
    if (null !== d) {
      var e = d = d.next;
      do {
        if ((e.tag & a) === a) {
          var f = e.destroy;
          e.destroy = void 0;
          void 0 !== f && Mj(b, c, f);
        }
        e = e.next;
      } while (e !== d);
    }
  }
  function Qj(a, b) {
    b = b.updateQueue;
    b = null !== b ? b.lastEffect : null;
    if (null !== b) {
      var c = b = b.next;
      do {
        if ((c.tag & a) === a) {
          var d = c.create;
          c.destroy = d();
        }
        c = c.next;
      } while (c !== b);
    }
  }
  function Rj(a) {
    var b = a.ref;
    if (null !== b) {
      var c = a.stateNode;
      switch (a.tag) {
        case 5:
          a = c;
          break;
        default:
          a = c;
      }
      "function" === typeof b ? b(a) : b.current = a;
    }
  }
  function Sj(a) {
    var b = a.alternate;
    null !== b && (a.alternate = null, Sj(b));
    a.child = null;
    a.deletions = null;
    a.sibling = null;
    5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
    a.stateNode = null;
    a.return = null;
    a.dependencies = null;
    a.memoizedProps = null;
    a.memoizedState = null;
    a.pendingProps = null;
    a.stateNode = null;
    a.updateQueue = null;
  }
  function Tj(a) {
    return 5 === a.tag || 3 === a.tag || 4 === a.tag;
  }
  function Uj(a) {
    a: for (; ; ) {
      for (; null === a.sibling; ) {
        if (null === a.return || Tj(a.return)) return null;
        a = a.return;
      }
      a.sibling.return = a.return;
      for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag; ) {
        if (a.flags & 2) continue a;
        if (null === a.child || 4 === a.tag) continue a;
        else a.child.return = a, a = a.child;
      }
      if (!(a.flags & 2)) return a.stateNode;
    }
  }
  function Vj(a, b, c) {
    var d = a.tag;
    if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
    else if (4 !== d && (a = a.child, null !== a)) for (Vj(a, b, c), a = a.sibling; null !== a; ) Vj(a, b, c), a = a.sibling;
  }
  function Wj(a, b, c) {
    var d = a.tag;
    if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
    else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a; ) Wj(a, b, c), a = a.sibling;
  }
  var X = null, Xj = false;
  function Yj(a, b, c) {
    for (c = c.child; null !== c; ) Zj(a, b, c), c = c.sibling;
  }
  function Zj(a, b, c) {
    if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
      lc.onCommitFiberUnmount(kc, c);
    } catch (h) {
    }
    switch (c.tag) {
      case 5:
        U || Lj(c, b);
      case 6:
        var d = X, e = Xj;
        X = null;
        Yj(a, b, c);
        X = d;
        Xj = e;
        null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
        break;
      case 18:
        null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
        break;
      case 4:
        d = X;
        e = Xj;
        X = c.stateNode.containerInfo;
        Xj = true;
        Yj(a, b, c);
        X = d;
        Xj = e;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
          e = d = d.next;
          do {
            var f = e, g = f.destroy;
            f = f.tag;
            void 0 !== g && (0 !== (f & 2) ? Mj(c, b, g) : 0 !== (f & 4) && Mj(c, b, g));
            e = e.next;
          } while (e !== d);
        }
        Yj(a, b, c);
        break;
      case 1:
        if (!U && (Lj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
          d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
        } catch (h) {
          W(c, b, h);
        }
        Yj(a, b, c);
        break;
      case 21:
        Yj(a, b, c);
        break;
      case 22:
        c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Yj(a, b, c), U = d) : Yj(a, b, c);
        break;
      default:
        Yj(a, b, c);
    }
  }
  function ak(a) {
    var b = a.updateQueue;
    if (null !== b) {
      a.updateQueue = null;
      var c = a.stateNode;
      null === c && (c = a.stateNode = new Kj());
      b.forEach(function(b2) {
        var d = bk.bind(null, a, b2);
        c.has(b2) || (c.add(b2), b2.then(d, d));
      });
    }
  }
  function ck(a, b) {
    var c = b.deletions;
    if (null !== c) for (var d = 0; d < c.length; d++) {
      var e = c[d];
      try {
        var f = a, g = b, h = g;
        a: for (; null !== h; ) {
          switch (h.tag) {
            case 5:
              X = h.stateNode;
              Xj = false;
              break a;
            case 3:
              X = h.stateNode.containerInfo;
              Xj = true;
              break a;
            case 4:
              X = h.stateNode.containerInfo;
              Xj = true;
              break a;
          }
          h = h.return;
        }
        if (null === X) throw Error(p(160));
        Zj(f, g, e);
        X = null;
        Xj = false;
        var k = e.alternate;
        null !== k && (k.return = null);
        e.return = null;
      } catch (l) {
        W(e, b, l);
      }
    }
    if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) dk(b, a), b = b.sibling;
  }
  function dk(a, b) {
    var c = a.alternate, d = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        ck(b, a);
        ek(a);
        if (d & 4) {
          try {
            Pj(3, a, a.return), Qj(3, a);
          } catch (t) {
            W(a, a.return, t);
          }
          try {
            Pj(5, a, a.return);
          } catch (t) {
            W(a, a.return, t);
          }
        }
        break;
      case 1:
        ck(b, a);
        ek(a);
        d & 512 && null !== c && Lj(c, c.return);
        break;
      case 5:
        ck(b, a);
        ek(a);
        d & 512 && null !== c && Lj(c, c.return);
        if (a.flags & 32) {
          var e = a.stateNode;
          try {
            ob(e, "");
          } catch (t) {
            W(a, a.return, t);
          }
        }
        if (d & 4 && (e = a.stateNode, null != e)) {
          var f = a.memoizedProps, g = null !== c ? c.memoizedProps : f, h = a.type, k = a.updateQueue;
          a.updateQueue = null;
          if (null !== k) try {
            "input" === h && "radio" === f.type && null != f.name && ab(e, f);
            vb(h, g);
            var l = vb(h, f);
            for (g = 0; g < k.length; g += 2) {
              var m = k[g], q = k[g + 1];
              "style" === m ? sb(e, q) : "dangerouslySetInnerHTML" === m ? nb(e, q) : "children" === m ? ob(e, q) : ta(e, m, q, l);
            }
            switch (h) {
              case "input":
                bb(e, f);
                break;
              case "textarea":
                ib(e, f);
                break;
              case "select":
                var r = e._wrapperState.wasMultiple;
                e._wrapperState.wasMultiple = !!f.multiple;
                var y = f.value;
                null != y ? fb(e, !!f.multiple, y, false) : r !== !!f.multiple && (null != f.defaultValue ? fb(
                  e,
                  !!f.multiple,
                  f.defaultValue,
                  true
                ) : fb(e, !!f.multiple, f.multiple ? [] : "", false));
            }
            e[Pf] = f;
          } catch (t) {
            W(a, a.return, t);
          }
        }
        break;
      case 6:
        ck(b, a);
        ek(a);
        if (d & 4) {
          if (null === a.stateNode) throw Error(p(162));
          e = a.stateNode;
          f = a.memoizedProps;
          try {
            e.nodeValue = f;
          } catch (t) {
            W(a, a.return, t);
          }
        }
        break;
      case 3:
        ck(b, a);
        ek(a);
        if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
          bd(b.containerInfo);
        } catch (t) {
          W(a, a.return, t);
        }
        break;
      case 4:
        ck(b, a);
        ek(a);
        break;
      case 13:
        ck(b, a);
        ek(a);
        e = a.child;
        e.flags & 8192 && (f = null !== e.memoizedState, e.stateNode.isHidden = f, !f || null !== e.alternate && null !== e.alternate.memoizedState || (fk = B()));
        d & 4 && ak(a);
        break;
      case 22:
        m = null !== c && null !== c.memoizedState;
        a.mode & 1 ? (U = (l = U) || m, ck(b, a), U = l) : ck(b, a);
        ek(a);
        if (d & 8192) {
          l = null !== a.memoizedState;
          if ((a.stateNode.isHidden = l) && !m && 0 !== (a.mode & 1)) for (V = a, m = a.child; null !== m; ) {
            for (q = V = m; null !== V; ) {
              r = V;
              y = r.child;
              switch (r.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Pj(4, r, r.return);
                  break;
                case 1:
                  Lj(r, r.return);
                  var n = r.stateNode;
                  if ("function" === typeof n.componentWillUnmount) {
                    d = r;
                    c = r.return;
                    try {
                      b = d, n.props = b.memoizedProps, n.state = b.memoizedState, n.componentWillUnmount();
                    } catch (t) {
                      W(d, c, t);
                    }
                  }
                  break;
                case 5:
                  Lj(r, r.return);
                  break;
                case 22:
                  if (null !== r.memoizedState) {
                    gk(q);
                    continue;
                  }
              }
              null !== y ? (y.return = r, V = y) : gk(q);
            }
            m = m.sibling;
          }
          a: for (m = null, q = a; ; ) {
            if (5 === q.tag) {
              if (null === m) {
                m = q;
                try {
                  e = q.stateNode, l ? (f = e.style, "function" === typeof f.setProperty ? f.setProperty("display", "none", "important") : f.display = "none") : (h = q.stateNode, k = q.memoizedProps.style, g = void 0 !== k && null !== k && k.hasOwnProperty("display") ? k.display : null, h.style.display = rb("display", g));
                } catch (t) {
                  W(a, a.return, t);
                }
              }
            } else if (6 === q.tag) {
              if (null === m) try {
                q.stateNode.nodeValue = l ? "" : q.memoizedProps;
              } catch (t) {
                W(a, a.return, t);
              }
            } else if ((22 !== q.tag && 23 !== q.tag || null === q.memoizedState || q === a) && null !== q.child) {
              q.child.return = q;
              q = q.child;
              continue;
            }
            if (q === a) break a;
            for (; null === q.sibling; ) {
              if (null === q.return || q.return === a) break a;
              m === q && (m = null);
              q = q.return;
            }
            m === q && (m = null);
            q.sibling.return = q.return;
            q = q.sibling;
          }
        }
        break;
      case 19:
        ck(b, a);
        ek(a);
        d & 4 && ak(a);
        break;
      case 21:
        break;
      default:
        ck(
          b,
          a
        ), ek(a);
    }
  }
  function ek(a) {
    var b = a.flags;
    if (b & 2) {
      try {
        a: {
          for (var c = a.return; null !== c; ) {
            if (Tj(c)) {
              var d = c;
              break a;
            }
            c = c.return;
          }
          throw Error(p(160));
        }
        switch (d.tag) {
          case 5:
            var e = d.stateNode;
            d.flags & 32 && (ob(e, ""), d.flags &= -33);
            var f = Uj(a);
            Wj(a, f, e);
            break;
          case 3:
          case 4:
            var g = d.stateNode.containerInfo, h = Uj(a);
            Vj(a, h, g);
            break;
          default:
            throw Error(p(161));
        }
      } catch (k) {
        W(a, a.return, k);
      }
      a.flags &= -3;
    }
    b & 4096 && (a.flags &= -4097);
  }
  function hk(a, b, c) {
    V = a;
    ik(a);
  }
  function ik(a, b, c) {
    for (var d = 0 !== (a.mode & 1); null !== V; ) {
      var e = V, f = e.child;
      if (22 === e.tag && d) {
        var g = null !== e.memoizedState || Jj;
        if (!g) {
          var h = e.alternate, k = null !== h && null !== h.memoizedState || U;
          h = Jj;
          var l = U;
          Jj = g;
          if ((U = k) && !l) for (V = e; null !== V; ) g = V, k = g.child, 22 === g.tag && null !== g.memoizedState ? jk(e) : null !== k ? (k.return = g, V = k) : jk(e);
          for (; null !== f; ) V = f, ik(f), f = f.sibling;
          V = e;
          Jj = h;
          U = l;
        }
        kk(a);
      } else 0 !== (e.subtreeFlags & 8772) && null !== f ? (f.return = e, V = f) : kk(a);
    }
  }
  function kk(a) {
    for (; null !== V; ) {
      var b = V;
      if (0 !== (b.flags & 8772)) {
        var c = b.alternate;
        try {
          if (0 !== (b.flags & 8772)) switch (b.tag) {
            case 0:
            case 11:
            case 15:
              U || Qj(5, b);
              break;
            case 1:
              var d = b.stateNode;
              if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
              else {
                var e = b.elementType === b.type ? c.memoizedProps : Ci(b.type, c.memoizedProps);
                d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
              }
              var f = b.updateQueue;
              null !== f && sh(b, f, d);
              break;
            case 3:
              var g = b.updateQueue;
              if (null !== g) {
                c = null;
                if (null !== b.child) switch (b.child.tag) {
                  case 5:
                    c = b.child.stateNode;
                    break;
                  case 1:
                    c = b.child.stateNode;
                }
                sh(b, g, c);
              }
              break;
            case 5:
              var h = b.stateNode;
              if (null === c && b.flags & 4) {
                c = h;
                var k = b.memoizedProps;
                switch (b.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    k.autoFocus && c.focus();
                    break;
                  case "img":
                    k.src && (c.src = k.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (null === b.memoizedState) {
                var l = b.alternate;
                if (null !== l) {
                  var m = l.memoizedState;
                  if (null !== m) {
                    var q = m.dehydrated;
                    null !== q && bd(q);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(p(163));
          }
          U || b.flags & 512 && Rj(b);
        } catch (r) {
          W(b, b.return, r);
        }
      }
      if (b === a) {
        V = null;
        break;
      }
      c = b.sibling;
      if (null !== c) {
        c.return = b.return;
        V = c;
        break;
      }
      V = b.return;
    }
  }
  function gk(a) {
    for (; null !== V; ) {
      var b = V;
      if (b === a) {
        V = null;
        break;
      }
      var c = b.sibling;
      if (null !== c) {
        c.return = b.return;
        V = c;
        break;
      }
      V = b.return;
    }
  }
  function jk(a) {
    for (; null !== V; ) {
      var b = V;
      try {
        switch (b.tag) {
          case 0:
          case 11:
          case 15:
            var c = b.return;
            try {
              Qj(4, b);
            } catch (k) {
              W(b, c, k);
            }
            break;
          case 1:
            var d = b.stateNode;
            if ("function" === typeof d.componentDidMount) {
              var e = b.return;
              try {
                d.componentDidMount();
              } catch (k) {
                W(b, e, k);
              }
            }
            var f = b.return;
            try {
              Rj(b);
            } catch (k) {
              W(b, f, k);
            }
            break;
          case 5:
            var g = b.return;
            try {
              Rj(b);
            } catch (k) {
              W(b, g, k);
            }
        }
      } catch (k) {
        W(b, b.return, k);
      }
      if (b === a) {
        V = null;
        break;
      }
      var h = b.sibling;
      if (null !== h) {
        h.return = b.return;
        V = h;
        break;
      }
      V = b.return;
    }
  }
  var lk = Math.ceil, mk = ua.ReactCurrentDispatcher, nk = ua.ReactCurrentOwner, ok = ua.ReactCurrentBatchConfig, K = 0, Q = null, Y = null, Z = 0, fj = 0, ej = Uf(0), T = 0, pk = null, rh = 0, qk = 0, rk = 0, sk = null, tk = null, fk = 0, Gj = Infinity, uk = null, Oi = false, Pi = null, Ri = null, vk = false, wk = null, xk = 0, yk = 0, zk = null, Ak = -1, Bk = 0;
  function R() {
    return 0 !== (K & 6) ? B() : -1 !== Ak ? Ak : Ak = B();
  }
  function yi(a) {
    if (0 === (a.mode & 1)) return 1;
    if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
    if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
    a = C;
    if (0 !== a) return a;
    a = window.event;
    a = void 0 === a ? 16 : jd(a.type);
    return a;
  }
  function gi(a, b, c, d) {
    if (50 < yk) throw yk = 0, zk = null, Error(p(185));
    Ac(a, c, d);
    if (0 === (K & 2) || a !== Q) a === Q && (0 === (K & 2) && (qk |= c), 4 === T && Ck(a, Z)), Dk(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Gj = B() + 500, fg && jg());
  }
  function Dk(a, b) {
    var c = a.callbackNode;
    wc(a, b);
    var d = uc(a, a === Q ? Z : 0);
    if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
    else if (b = d & -d, a.callbackPriority !== b) {
      null != c && bc(c);
      if (1 === b) 0 === a.tag ? ig(Ek.bind(null, a)) : hg(Ek.bind(null, a)), Jf(function() {
        0 === (K & 6) && jg();
      }), c = null;
      else {
        switch (Dc(d)) {
          case 1:
            c = fc;
            break;
          case 4:
            c = gc;
            break;
          case 16:
            c = hc;
            break;
          case 536870912:
            c = jc;
            break;
          default:
            c = hc;
        }
        c = Fk(c, Gk.bind(null, a));
      }
      a.callbackPriority = b;
      a.callbackNode = c;
    }
  }
  function Gk(a, b) {
    Ak = -1;
    Bk = 0;
    if (0 !== (K & 6)) throw Error(p(327));
    var c = a.callbackNode;
    if (Hk() && a.callbackNode !== c) return null;
    var d = uc(a, a === Q ? Z : 0);
    if (0 === d) return null;
    if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Ik(a, d);
    else {
      b = d;
      var e = K;
      K |= 2;
      var f = Jk();
      if (Q !== a || Z !== b) uk = null, Gj = B() + 500, Kk(a, b);
      do
        try {
          Lk();
          break;
        } catch (h) {
          Mk(a, h);
        }
      while (1);
      $g();
      mk.current = f;
      K = e;
      null !== Y ? b = 0 : (Q = null, Z = 0, b = T);
    }
    if (0 !== b) {
      2 === b && (e = xc(a), 0 !== e && (d = e, b = Nk(a, e)));
      if (1 === b) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
      if (6 === b) Ck(a, d);
      else {
        e = a.current.alternate;
        if (0 === (d & 30) && !Ok(e) && (b = Ik(a, d), 2 === b && (f = xc(a), 0 !== f && (d = f, b = Nk(a, f))), 1 === b)) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
        a.finishedWork = e;
        a.finishedLanes = d;
        switch (b) {
          case 0:
          case 1:
            throw Error(p(345));
          case 2:
            Pk(a, tk, uk);
            break;
          case 3:
            Ck(a, d);
            if ((d & 130023424) === d && (b = fk + 500 - B(), 10 < b)) {
              if (0 !== uc(a, 0)) break;
              e = a.suspendedLanes;
              if ((e & d) !== d) {
                R();
                a.pingedLanes |= a.suspendedLanes & e;
                break;
              }
              a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), b);
              break;
            }
            Pk(a, tk, uk);
            break;
          case 4:
            Ck(a, d);
            if ((d & 4194240) === d) break;
            b = a.eventTimes;
            for (e = -1; 0 < d; ) {
              var g = 31 - oc(d);
              f = 1 << g;
              g = b[g];
              g > e && (e = g);
              d &= ~f;
            }
            d = e;
            d = B() - d;
            d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * lk(d / 1960)) - d;
            if (10 < d) {
              a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), d);
              break;
            }
            Pk(a, tk, uk);
            break;
          case 5:
            Pk(a, tk, uk);
            break;
          default:
            throw Error(p(329));
        }
      }
    }
    Dk(a, B());
    return a.callbackNode === c ? Gk.bind(null, a) : null;
  }
  function Nk(a, b) {
    var c = sk;
    a.current.memoizedState.isDehydrated && (Kk(a, b).flags |= 256);
    a = Ik(a, b);
    2 !== a && (b = tk, tk = c, null !== b && Fj(b));
    return a;
  }
  function Fj(a) {
    null === tk ? tk = a : tk.push.apply(tk, a);
  }
  function Ok(a) {
    for (var b = a; ; ) {
      if (b.flags & 16384) {
        var c = b.updateQueue;
        if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
          var e = c[d], f = e.getSnapshot;
          e = e.value;
          try {
            if (!He(f(), e)) return false;
          } catch (g) {
            return false;
          }
        }
      }
      c = b.child;
      if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
      else {
        if (b === a) break;
        for (; null === b.sibling; ) {
          if (null === b.return || b.return === a) return true;
          b = b.return;
        }
        b.sibling.return = b.return;
        b = b.sibling;
      }
    }
    return true;
  }
  function Ck(a, b) {
    b &= ~rk;
    b &= ~qk;
    a.suspendedLanes |= b;
    a.pingedLanes &= ~b;
    for (a = a.expirationTimes; 0 < b; ) {
      var c = 31 - oc(b), d = 1 << c;
      a[c] = -1;
      b &= ~d;
    }
  }
  function Ek(a) {
    if (0 !== (K & 6)) throw Error(p(327));
    Hk();
    var b = uc(a, 0);
    if (0 === (b & 1)) return Dk(a, B()), null;
    var c = Ik(a, b);
    if (0 !== a.tag && 2 === c) {
      var d = xc(a);
      0 !== d && (b = d, c = Nk(a, d));
    }
    if (1 === c) throw c = pk, Kk(a, 0), Ck(a, b), Dk(a, B()), c;
    if (6 === c) throw Error(p(345));
    a.finishedWork = a.current.alternate;
    a.finishedLanes = b;
    Pk(a, tk, uk);
    Dk(a, B());
    return null;
  }
  function Qk(a, b) {
    var c = K;
    K |= 1;
    try {
      return a(b);
    } finally {
      K = c, 0 === K && (Gj = B() + 500, fg && jg());
    }
  }
  function Rk(a) {
    null !== wk && 0 === wk.tag && 0 === (K & 6) && Hk();
    var b = K;
    K |= 1;
    var c = ok.transition, d = C;
    try {
      if (ok.transition = null, C = 1, a) return a();
    } finally {
      C = d, ok.transition = c, K = b, 0 === (K & 6) && jg();
    }
  }
  function Hj() {
    fj = ej.current;
    E(ej);
  }
  function Kk(a, b) {
    a.finishedWork = null;
    a.finishedLanes = 0;
    var c = a.timeoutHandle;
    -1 !== c && (a.timeoutHandle = -1, Gf(c));
    if (null !== Y) for (c = Y.return; null !== c; ) {
      var d = c;
      wg(d);
      switch (d.tag) {
        case 1:
          d = d.type.childContextTypes;
          null !== d && void 0 !== d && $f();
          break;
        case 3:
          zh();
          E(Wf);
          E(H);
          Eh();
          break;
        case 5:
          Bh(d);
          break;
        case 4:
          zh();
          break;
        case 13:
          E(L);
          break;
        case 19:
          E(L);
          break;
        case 10:
          ah(d.type._context);
          break;
        case 22:
        case 23:
          Hj();
      }
      c = c.return;
    }
    Q = a;
    Y = a = Pg(a.current, null);
    Z = fj = b;
    T = 0;
    pk = null;
    rk = qk = rh = 0;
    tk = sk = null;
    if (null !== fh) {
      for (b = 0; b < fh.length; b++) if (c = fh[b], d = c.interleaved, null !== d) {
        c.interleaved = null;
        var e = d.next, f = c.pending;
        if (null !== f) {
          var g = f.next;
          f.next = e;
          d.next = g;
        }
        c.pending = d;
      }
      fh = null;
    }
    return a;
  }
  function Mk(a, b) {
    do {
      var c = Y;
      try {
        $g();
        Fh.current = Rh;
        if (Ih) {
          for (var d = M.memoizedState; null !== d; ) {
            var e = d.queue;
            null !== e && (e.pending = null);
            d = d.next;
          }
          Ih = false;
        }
        Hh = 0;
        O = N = M = null;
        Jh = false;
        Kh = 0;
        nk.current = null;
        if (null === c || null === c.return) {
          T = 1;
          pk = b;
          Y = null;
          break;
        }
        a: {
          var f = a, g = c.return, h = c, k = b;
          b = Z;
          h.flags |= 32768;
          if (null !== k && "object" === typeof k && "function" === typeof k.then) {
            var l = k, m = h, q = m.tag;
            if (0 === (m.mode & 1) && (0 === q || 11 === q || 15 === q)) {
              var r = m.alternate;
              r ? (m.updateQueue = r.updateQueue, m.memoizedState = r.memoizedState, m.lanes = r.lanes) : (m.updateQueue = null, m.memoizedState = null);
            }
            var y = Ui(g);
            if (null !== y) {
              y.flags &= -257;
              Vi(y, g, h, f, b);
              y.mode & 1 && Si(f, l, b);
              b = y;
              k = l;
              var n = b.updateQueue;
              if (null === n) {
                var t = /* @__PURE__ */ new Set();
                t.add(k);
                b.updateQueue = t;
              } else n.add(k);
              break a;
            } else {
              if (0 === (b & 1)) {
                Si(f, l, b);
                tj();
                break a;
              }
              k = Error(p(426));
            }
          } else if (I && h.mode & 1) {
            var J = Ui(g);
            if (null !== J) {
              0 === (J.flags & 65536) && (J.flags |= 256);
              Vi(J, g, h, f, b);
              Jg(Ji(k, h));
              break a;
            }
          }
          f = k = Ji(k, h);
          4 !== T && (T = 2);
          null === sk ? sk = [f] : sk.push(f);
          f = g;
          do {
            switch (f.tag) {
              case 3:
                f.flags |= 65536;
                b &= -b;
                f.lanes |= b;
                var x = Ni(f, k, b);
                ph(f, x);
                break a;
              case 1:
                h = k;
                var w = f.type, u = f.stateNode;
                if (0 === (f.flags & 128) && ("function" === typeof w.getDerivedStateFromError || null !== u && "function" === typeof u.componentDidCatch && (null === Ri || !Ri.has(u)))) {
                  f.flags |= 65536;
                  b &= -b;
                  f.lanes |= b;
                  var F = Qi(f, h, b);
                  ph(f, F);
                  break a;
                }
            }
            f = f.return;
          } while (null !== f);
        }
        Sk(c);
      } catch (na) {
        b = na;
        Y === c && null !== c && (Y = c = c.return);
        continue;
      }
      break;
    } while (1);
  }
  function Jk() {
    var a = mk.current;
    mk.current = Rh;
    return null === a ? Rh : a;
  }
  function tj() {
    if (0 === T || 3 === T || 2 === T) T = 4;
    null === Q || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q, Z);
  }
  function Ik(a, b) {
    var c = K;
    K |= 2;
    var d = Jk();
    if (Q !== a || Z !== b) uk = null, Kk(a, b);
    do
      try {
        Tk();
        break;
      } catch (e) {
        Mk(a, e);
      }
    while (1);
    $g();
    K = c;
    mk.current = d;
    if (null !== Y) throw Error(p(261));
    Q = null;
    Z = 0;
    return T;
  }
  function Tk() {
    for (; null !== Y; ) Uk(Y);
  }
  function Lk() {
    for (; null !== Y && !cc(); ) Uk(Y);
  }
  function Uk(a) {
    var b = Vk(a.alternate, a, fj);
    a.memoizedProps = a.pendingProps;
    null === b ? Sk(a) : Y = b;
    nk.current = null;
  }
  function Sk(a) {
    var b = a;
    do {
      var c = b.alternate;
      a = b.return;
      if (0 === (b.flags & 32768)) {
        if (c = Ej(c, b, fj), null !== c) {
          Y = c;
          return;
        }
      } else {
        c = Ij(c, b);
        if (null !== c) {
          c.flags &= 32767;
          Y = c;
          return;
        }
        if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
        else {
          T = 6;
          Y = null;
          return;
        }
      }
      b = b.sibling;
      if (null !== b) {
        Y = b;
        return;
      }
      Y = b = a;
    } while (null !== b);
    0 === T && (T = 5);
  }
  function Pk(a, b, c) {
    var d = C, e = ok.transition;
    try {
      ok.transition = null, C = 1, Wk(a, b, c, d);
    } finally {
      ok.transition = e, C = d;
    }
    return null;
  }
  function Wk(a, b, c, d) {
    do
      Hk();
    while (null !== wk);
    if (0 !== (K & 6)) throw Error(p(327));
    c = a.finishedWork;
    var e = a.finishedLanes;
    if (null === c) return null;
    a.finishedWork = null;
    a.finishedLanes = 0;
    if (c === a.current) throw Error(p(177));
    a.callbackNode = null;
    a.callbackPriority = 0;
    var f = c.lanes | c.childLanes;
    Bc(a, f);
    a === Q && (Y = Q = null, Z = 0);
    0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || vk || (vk = true, Fk(hc, function() {
      Hk();
      return null;
    }));
    f = 0 !== (c.flags & 15990);
    if (0 !== (c.subtreeFlags & 15990) || f) {
      f = ok.transition;
      ok.transition = null;
      var g = C;
      C = 1;
      var h = K;
      K |= 4;
      nk.current = null;
      Oj(a, c);
      dk(c, a);
      Oe(Df);
      dd = !!Cf;
      Df = Cf = null;
      a.current = c;
      hk(c);
      dc();
      K = h;
      C = g;
      ok.transition = f;
    } else a.current = c;
    vk && (vk = false, wk = a, xk = e);
    f = a.pendingLanes;
    0 === f && (Ri = null);
    mc(c.stateNode);
    Dk(a, B());
    if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
    if (Oi) throw Oi = false, a = Pi, Pi = null, a;
    0 !== (xk & 1) && 0 !== a.tag && Hk();
    f = a.pendingLanes;
    0 !== (f & 1) ? a === zk ? yk++ : (yk = 0, zk = a) : yk = 0;
    jg();
    return null;
  }
  function Hk() {
    if (null !== wk) {
      var a = Dc(xk), b = ok.transition, c = C;
      try {
        ok.transition = null;
        C = 16 > a ? 16 : a;
        if (null === wk) var d = false;
        else {
          a = wk;
          wk = null;
          xk = 0;
          if (0 !== (K & 6)) throw Error(p(331));
          var e = K;
          K |= 4;
          for (V = a.current; null !== V; ) {
            var f = V, g = f.child;
            if (0 !== (V.flags & 16)) {
              var h = f.deletions;
              if (null !== h) {
                for (var k = 0; k < h.length; k++) {
                  var l = h[k];
                  for (V = l; null !== V; ) {
                    var m = V;
                    switch (m.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Pj(8, m, f);
                    }
                    var q = m.child;
                    if (null !== q) q.return = m, V = q;
                    else for (; null !== V; ) {
                      m = V;
                      var r = m.sibling, y = m.return;
                      Sj(m);
                      if (m === l) {
                        V = null;
                        break;
                      }
                      if (null !== r) {
                        r.return = y;
                        V = r;
                        break;
                      }
                      V = y;
                    }
                  }
                }
                var n = f.alternate;
                if (null !== n) {
                  var t = n.child;
                  if (null !== t) {
                    n.child = null;
                    do {
                      var J = t.sibling;
                      t.sibling = null;
                      t = J;
                    } while (null !== t);
                  }
                }
                V = f;
              }
            }
            if (0 !== (f.subtreeFlags & 2064) && null !== g) g.return = f, V = g;
            else b: for (; null !== V; ) {
              f = V;
              if (0 !== (f.flags & 2048)) switch (f.tag) {
                case 0:
                case 11:
                case 15:
                  Pj(9, f, f.return);
              }
              var x = f.sibling;
              if (null !== x) {
                x.return = f.return;
                V = x;
                break b;
              }
              V = f.return;
            }
          }
          var w = a.current;
          for (V = w; null !== V; ) {
            g = V;
            var u = g.child;
            if (0 !== (g.subtreeFlags & 2064) && null !== u) u.return = g, V = u;
            else b: for (g = w; null !== V; ) {
              h = V;
              if (0 !== (h.flags & 2048)) try {
                switch (h.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Qj(9, h);
                }
              } catch (na) {
                W(h, h.return, na);
              }
              if (h === g) {
                V = null;
                break b;
              }
              var F = h.sibling;
              if (null !== F) {
                F.return = h.return;
                V = F;
                break b;
              }
              V = h.return;
            }
          }
          K = e;
          jg();
          if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
            lc.onPostCommitFiberRoot(kc, a);
          } catch (na) {
          }
          d = true;
        }
        return d;
      } finally {
        C = c, ok.transition = b;
      }
    }
    return false;
  }
  function Xk(a, b, c) {
    b = Ji(c, b);
    b = Ni(a, b, 1);
    a = nh(a, b, 1);
    b = R();
    null !== a && (Ac(a, 1, b), Dk(a, b));
  }
  function W(a, b, c) {
    if (3 === a.tag) Xk(a, a, c);
    else for (; null !== b; ) {
      if (3 === b.tag) {
        Xk(b, a, c);
        break;
      } else if (1 === b.tag) {
        var d = b.stateNode;
        if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Ri || !Ri.has(d))) {
          a = Ji(c, a);
          a = Qi(b, a, 1);
          b = nh(b, a, 1);
          a = R();
          null !== b && (Ac(b, 1, a), Dk(b, a));
          break;
        }
      }
      b = b.return;
    }
  }
  function Ti(a, b, c) {
    var d = a.pingCache;
    null !== d && d.delete(b);
    b = R();
    a.pingedLanes |= a.suspendedLanes & c;
    Q === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - fk ? Kk(a, 0) : rk |= c);
    Dk(a, b);
  }
  function Yk(a, b) {
    0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
    var c = R();
    a = ih(a, b);
    null !== a && (Ac(a, b, c), Dk(a, c));
  }
  function uj(a) {
    var b = a.memoizedState, c = 0;
    null !== b && (c = b.retryLane);
    Yk(a, c);
  }
  function bk(a, b) {
    var c = 0;
    switch (a.tag) {
      case 13:
        var d = a.stateNode;
        var e = a.memoizedState;
        null !== e && (c = e.retryLane);
        break;
      case 19:
        d = a.stateNode;
        break;
      default:
        throw Error(p(314));
    }
    null !== d && d.delete(b);
    Yk(a, c);
  }
  var Vk;
  Vk = function(a, b, c) {
    if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) dh = true;
    else {
      if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return dh = false, yj(a, b, c);
      dh = 0 !== (a.flags & 131072) ? true : false;
    }
    else dh = false, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
    b.lanes = 0;
    switch (b.tag) {
      case 2:
        var d = b.type;
        ij(a, b);
        a = b.pendingProps;
        var e = Yf(b, H.current);
        ch(b, c);
        e = Nh(null, b, d, a, e, c);
        var f = Sh();
        b.flags |= 1;
        "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f = true, cg(b)) : f = false, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, kh(b), e.updater = Ei, b.stateNode = e, e._reactInternals = b, Ii(b, d, a, c), b = jj(null, b, d, true, f, c)) : (b.tag = 0, I && f && vg(b), Xi(null, b, e, c), b = b.child);
        return b;
      case 16:
        d = b.elementType;
        a: {
          ij(a, b);
          a = b.pendingProps;
          e = d._init;
          d = e(d._payload);
          b.type = d;
          e = b.tag = Zk(d);
          a = Ci(d, a);
          switch (e) {
            case 0:
              b = cj(null, b, d, a, c);
              break a;
            case 1:
              b = hj(null, b, d, a, c);
              break a;
            case 11:
              b = Yi(null, b, d, a, c);
              break a;
            case 14:
              b = $i(null, b, d, Ci(d.type, a), c);
              break a;
          }
          throw Error(p(
            306,
            d,
            ""
          ));
        }
        return b;
      case 0:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), cj(a, b, d, e, c);
      case 1:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), hj(a, b, d, e, c);
      case 3:
        a: {
          kj(b);
          if (null === a) throw Error(p(387));
          d = b.pendingProps;
          f = b.memoizedState;
          e = f.element;
          lh(a, b);
          qh(b, d, null, c);
          var g = b.memoizedState;
          d = g.element;
          if (f.isDehydrated) if (f = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f, b.memoizedState = f, b.flags & 256) {
            e = Ji(Error(p(423)), b);
            b = lj(a, b, d, c, e);
            break a;
          } else if (d !== e) {
            e = Ji(Error(p(424)), b);
            b = lj(a, b, d, c, e);
            break a;
          } else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = true, zg = null, c = Vg(b, null, d, c), b.child = c; c; ) c.flags = c.flags & -3 | 4096, c = c.sibling;
          else {
            Ig();
            if (d === e) {
              b = Zi(a, b, c);
              break a;
            }
            Xi(a, b, d, c);
          }
          b = b.child;
        }
        return b;
      case 5:
        return Ah(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f && Ef(d, f) && (b.flags |= 32), gj(a, b), Xi(a, b, g, c), b.child;
      case 6:
        return null === a && Eg(b), null;
      case 13:
        return oj(a, b, c);
      case 4:
        return yh(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Ug(b, null, d, c) : Xi(a, b, d, c), b.child;
      case 11:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), Yi(a, b, d, e, c);
      case 7:
        return Xi(a, b, b.pendingProps, c), b.child;
      case 8:
        return Xi(a, b, b.pendingProps.children, c), b.child;
      case 12:
        return Xi(a, b, b.pendingProps.children, c), b.child;
      case 10:
        a: {
          d = b.type._context;
          e = b.pendingProps;
          f = b.memoizedProps;
          g = e.value;
          G(Wg, d._currentValue);
          d._currentValue = g;
          if (null !== f) if (He(f.value, g)) {
            if (f.children === e.children && !Wf.current) {
              b = Zi(a, b, c);
              break a;
            }
          } else for (f = b.child, null !== f && (f.return = b); null !== f; ) {
            var h = f.dependencies;
            if (null !== h) {
              g = f.child;
              for (var k = h.firstContext; null !== k; ) {
                if (k.context === d) {
                  if (1 === f.tag) {
                    k = mh(-1, c & -c);
                    k.tag = 2;
                    var l = f.updateQueue;
                    if (null !== l) {
                      l = l.shared;
                      var m = l.pending;
                      null === m ? k.next = k : (k.next = m.next, m.next = k);
                      l.pending = k;
                    }
                  }
                  f.lanes |= c;
                  k = f.alternate;
                  null !== k && (k.lanes |= c);
                  bh(
                    f.return,
                    c,
                    b
                  );
                  h.lanes |= c;
                  break;
                }
                k = k.next;
              }
            } else if (10 === f.tag) g = f.type === b.type ? null : f.child;
            else if (18 === f.tag) {
              g = f.return;
              if (null === g) throw Error(p(341));
              g.lanes |= c;
              h = g.alternate;
              null !== h && (h.lanes |= c);
              bh(g, c, b);
              g = f.sibling;
            } else g = f.child;
            if (null !== g) g.return = f;
            else for (g = f; null !== g; ) {
              if (g === b) {
                g = null;
                break;
              }
              f = g.sibling;
              if (null !== f) {
                f.return = g.return;
                g = f;
                break;
              }
              g = g.return;
            }
            f = g;
          }
          Xi(a, b, e.children, c);
          b = b.child;
        }
        return b;
      case 9:
        return e = b.type, d = b.pendingProps.children, ch(b, c), e = eh(e), d = d(e), b.flags |= 1, Xi(a, b, d, c), b.child;
      case 14:
        return d = b.type, e = Ci(d, b.pendingProps), e = Ci(d.type, e), $i(a, b, d, e, c);
      case 15:
        return bj(a, b, b.type, b.pendingProps, c);
      case 17:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), ij(a, b), b.tag = 1, Zf(d) ? (a = true, cg(b)) : a = false, ch(b, c), Gi(b, d, e), Ii(b, d, e, c), jj(null, b, d, true, a, c);
      case 19:
        return xj(a, b, c);
      case 22:
        return dj(a, b, c);
    }
    throw Error(p(156, b.tag));
  };
  function Fk(a, b) {
    return ac(a, b);
  }
  function $k(a, b, c, d) {
    this.tag = a;
    this.key = c;
    this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
    this.index = 0;
    this.ref = null;
    this.pendingProps = b;
    this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
    this.mode = d;
    this.subtreeFlags = this.flags = 0;
    this.deletions = null;
    this.childLanes = this.lanes = 0;
    this.alternate = null;
  }
  function Bg(a, b, c, d) {
    return new $k(a, b, c, d);
  }
  function aj(a) {
    a = a.prototype;
    return !(!a || !a.isReactComponent);
  }
  function Zk(a) {
    if ("function" === typeof a) return aj(a) ? 1 : 0;
    if (void 0 !== a && null !== a) {
      a = a.$$typeof;
      if (a === Da) return 11;
      if (a === Ga) return 14;
    }
    return 2;
  }
  function Pg(a, b) {
    var c = a.alternate;
    null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
    c.flags = a.flags & 14680064;
    c.childLanes = a.childLanes;
    c.lanes = a.lanes;
    c.child = a.child;
    c.memoizedProps = a.memoizedProps;
    c.memoizedState = a.memoizedState;
    c.updateQueue = a.updateQueue;
    b = a.dependencies;
    c.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
    c.sibling = a.sibling;
    c.index = a.index;
    c.ref = a.ref;
    return c;
  }
  function Rg(a, b, c, d, e, f) {
    var g = 2;
    d = a;
    if ("function" === typeof a) aj(a) && (g = 1);
    else if ("string" === typeof a) g = 5;
    else a: switch (a) {
      case ya:
        return Tg(c.children, e, f, b);
      case za:
        g = 8;
        e |= 8;
        break;
      case Aa:
        return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f, a;
      case Ea:
        return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f, a;
      case Fa:
        return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f, a;
      case Ia:
        return pj(c, e, f, b);
      default:
        if ("object" === typeof a && null !== a) switch (a.$$typeof) {
          case Ba:
            g = 10;
            break a;
          case Ca:
            g = 9;
            break a;
          case Da:
            g = 11;
            break a;
          case Ga:
            g = 14;
            break a;
          case Ha:
            g = 16;
            d = null;
            break a;
        }
        throw Error(p(130, null == a ? a : typeof a, ""));
    }
    b = Bg(g, c, b, e);
    b.elementType = a;
    b.type = d;
    b.lanes = f;
    return b;
  }
  function Tg(a, b, c, d) {
    a = Bg(7, a, d, b);
    a.lanes = c;
    return a;
  }
  function pj(a, b, c, d) {
    a = Bg(22, a, d, b);
    a.elementType = Ia;
    a.lanes = c;
    a.stateNode = { isHidden: false };
    return a;
  }
  function Qg(a, b, c) {
    a = Bg(6, a, null, b);
    a.lanes = c;
    return a;
  }
  function Sg(a, b, c) {
    b = Bg(4, null !== a.children ? a.children : [], a.key, b);
    b.lanes = c;
    b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
    return b;
  }
  function al(a, b, c, d, e) {
    this.tag = b;
    this.containerInfo = a;
    this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
    this.timeoutHandle = -1;
    this.callbackNode = this.pendingContext = this.context = null;
    this.callbackPriority = 0;
    this.eventTimes = zc(0);
    this.expirationTimes = zc(-1);
    this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
    this.entanglements = zc(0);
    this.identifierPrefix = d;
    this.onRecoverableError = e;
    this.mutableSourceEagerHydrationData = null;
  }
  function bl(a, b, c, d, e, f, g, h, k) {
    a = new al(a, b, c, h, k);
    1 === b ? (b = 1, true === f && (b |= 8)) : b = 0;
    f = Bg(3, null, null, b);
    a.current = f;
    f.stateNode = a;
    f.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
    kh(f);
    return a;
  }
  function cl(a, b, c) {
    var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    return { $$typeof: wa, key: null == d ? null : "" + d, children: a, containerInfo: b, implementation: c };
  }
  function dl(a) {
    if (!a) return Vf;
    a = a._reactInternals;
    a: {
      if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
      var b = a;
      do {
        switch (b.tag) {
          case 3:
            b = b.stateNode.context;
            break a;
          case 1:
            if (Zf(b.type)) {
              b = b.stateNode.__reactInternalMemoizedMergedChildContext;
              break a;
            }
        }
        b = b.return;
      } while (null !== b);
      throw Error(p(171));
    }
    if (1 === a.tag) {
      var c = a.type;
      if (Zf(c)) return bg(a, c, b);
    }
    return b;
  }
  function el(a, b, c, d, e, f, g, h, k) {
    a = bl(c, d, true, a, e, f, g, h, k);
    a.context = dl(null);
    c = a.current;
    d = R();
    e = yi(c);
    f = mh(d, e);
    f.callback = void 0 !== b && null !== b ? b : null;
    nh(c, f, e);
    a.current.lanes = e;
    Ac(a, e, d);
    Dk(a, d);
    return a;
  }
  function fl(a, b, c, d) {
    var e = b.current, f = R(), g = yi(e);
    c = dl(c);
    null === b.context ? b.context = c : b.pendingContext = c;
    b = mh(f, g);
    b.payload = { element: a };
    d = void 0 === d ? null : d;
    null !== d && (b.callback = d);
    a = nh(e, b, g);
    null !== a && (gi(a, e, g, f), oh(a, e, g));
    return g;
  }
  function gl(a) {
    a = a.current;
    if (!a.child) return null;
    switch (a.child.tag) {
      case 5:
        return a.child.stateNode;
      default:
        return a.child.stateNode;
    }
  }
  function hl(a, b) {
    a = a.memoizedState;
    if (null !== a && null !== a.dehydrated) {
      var c = a.retryLane;
      a.retryLane = 0 !== c && c < b ? c : b;
    }
  }
  function il(a, b) {
    hl(a, b);
    (a = a.alternate) && hl(a, b);
  }
  function jl() {
    return null;
  }
  var kl = "function" === typeof reportError ? reportError : function(a) {
    console.error(a);
  };
  function ll(a) {
    this._internalRoot = a;
  }
  ml.prototype.render = ll.prototype.render = function(a) {
    var b = this._internalRoot;
    if (null === b) throw Error(p(409));
    fl(a, b, null, null);
  };
  ml.prototype.unmount = ll.prototype.unmount = function() {
    var a = this._internalRoot;
    if (null !== a) {
      this._internalRoot = null;
      var b = a.containerInfo;
      Rk(function() {
        fl(null, a, null, null);
      });
      b[uf] = null;
    }
  };
  function ml(a) {
    this._internalRoot = a;
  }
  ml.prototype.unstable_scheduleHydration = function(a) {
    if (a) {
      var b = Hc();
      a = { blockedOn: null, target: a, priority: b };
      for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++) ;
      Qc.splice(c, 0, a);
      0 === c && Vc(a);
    }
  };
  function nl(a) {
    return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
  }
  function ol(a) {
    return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
  }
  function pl() {
  }
  function ql(a, b, c, d, e) {
    if (e) {
      if ("function" === typeof d) {
        var f = d;
        d = function() {
          var a2 = gl(g);
          f.call(a2);
        };
      }
      var g = el(b, d, a, 0, null, false, false, "", pl);
      a._reactRootContainer = g;
      a[uf] = g.current;
      sf(8 === a.nodeType ? a.parentNode : a);
      Rk();
      return g;
    }
    for (; e = a.lastChild; ) a.removeChild(e);
    if ("function" === typeof d) {
      var h = d;
      d = function() {
        var a2 = gl(k);
        h.call(a2);
      };
    }
    var k = bl(a, 0, false, null, null, false, false, "", pl);
    a._reactRootContainer = k;
    a[uf] = k.current;
    sf(8 === a.nodeType ? a.parentNode : a);
    Rk(function() {
      fl(b, k, c, d);
    });
    return k;
  }
  function rl(a, b, c, d, e) {
    var f = c._reactRootContainer;
    if (f) {
      var g = f;
      if ("function" === typeof e) {
        var h = e;
        e = function() {
          var a2 = gl(g);
          h.call(a2);
        };
      }
      fl(b, g, a, e);
    } else g = ql(c, b, a, e, d);
    return gl(g);
  }
  Ec = function(a) {
    switch (a.tag) {
      case 3:
        var b = a.stateNode;
        if (b.current.memoizedState.isDehydrated) {
          var c = tc(b.pendingLanes);
          0 !== c && (Cc(b, c | 1), Dk(b, B()), 0 === (K & 6) && (Gj = B() + 500, jg()));
        }
        break;
      case 13:
        Rk(function() {
          var b2 = ih(a, 1);
          if (null !== b2) {
            var c2 = R();
            gi(b2, a, 1, c2);
          }
        }), il(a, 1);
    }
  };
  Fc = function(a) {
    if (13 === a.tag) {
      var b = ih(a, 134217728);
      if (null !== b) {
        var c = R();
        gi(b, a, 134217728, c);
      }
      il(a, 134217728);
    }
  };
  Gc = function(a) {
    if (13 === a.tag) {
      var b = yi(a), c = ih(a, b);
      if (null !== c) {
        var d = R();
        gi(c, a, b, d);
      }
      il(a, b);
    }
  };
  Hc = function() {
    return C;
  };
  Ic = function(a, b) {
    var c = C;
    try {
      return C = a, b();
    } finally {
      C = c;
    }
  };
  yb = function(a, b, c) {
    switch (b) {
      case "input":
        bb(a, c);
        b = c.name;
        if ("radio" === c.type && null != b) {
          for (c = a; c.parentNode; ) c = c.parentNode;
          c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
          for (b = 0; b < c.length; b++) {
            var d = c[b];
            if (d !== a && d.form === a.form) {
              var e = Db(d);
              if (!e) throw Error(p(90));
              Wa(d);
              bb(d, e);
            }
          }
        }
        break;
      case "textarea":
        ib(a, c);
        break;
      case "select":
        b = c.value, null != b && fb(a, !!c.multiple, b, false);
    }
  };
  Gb = Qk;
  Hb = Rk;
  var sl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Qk] }, tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
  var ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a) {
    a = Zb(a);
    return null === a ? null : a.stateNode;
  }, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
    var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!vl.isDisabled && vl.supportsFiber) try {
      kc = vl.inject(ul), lc = vl;
    } catch (a) {
    }
  }
  reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sl;
  reactDom_production_min.createPortal = function(a, b) {
    var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    if (!nl(b)) throw Error(p(200));
    return cl(a, b, null, c);
  };
  reactDom_production_min.createRoot = function(a, b) {
    if (!nl(a)) throw Error(p(299));
    var c = false, d = "", e = kl;
    null !== b && void 0 !== b && (true === b.unstable_strictMode && (c = true), void 0 !== b.identifierPrefix && (d = b.identifierPrefix), void 0 !== b.onRecoverableError && (e = b.onRecoverableError));
    b = bl(a, 1, false, null, null, c, false, d, e);
    a[uf] = b.current;
    sf(8 === a.nodeType ? a.parentNode : a);
    return new ll(b);
  };
  reactDom_production_min.findDOMNode = function(a) {
    if (null == a) return null;
    if (1 === a.nodeType) return a;
    var b = a._reactInternals;
    if (void 0 === b) {
      if ("function" === typeof a.render) throw Error(p(188));
      a = Object.keys(a).join(",");
      throw Error(p(268, a));
    }
    a = Zb(b);
    a = null === a ? null : a.stateNode;
    return a;
  };
  reactDom_production_min.flushSync = function(a) {
    return Rk(a);
  };
  reactDom_production_min.hydrate = function(a, b, c) {
    if (!ol(b)) throw Error(p(200));
    return rl(null, a, b, true, c);
  };
  reactDom_production_min.hydrateRoot = function(a, b, c) {
    if (!nl(a)) throw Error(p(405));
    var d = null != c && c.hydratedSources || null, e = false, f = "", g = kl;
    null !== c && void 0 !== c && (true === c.unstable_strictMode && (e = true), void 0 !== c.identifierPrefix && (f = c.identifierPrefix), void 0 !== c.onRecoverableError && (g = c.onRecoverableError));
    b = el(b, null, a, 1, null != c ? c : null, e, false, f, g);
    a[uf] = b.current;
    sf(a);
    if (d) for (a = 0; a < d.length; a++) c = d[a], e = c._getVersion, e = e(c._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(
      c,
      e
    );
    return new ml(b);
  };
  reactDom_production_min.render = function(a, b, c) {
    if (!ol(b)) throw Error(p(200));
    return rl(null, a, b, false, c);
  };
  reactDom_production_min.unmountComponentAtNode = function(a) {
    if (!ol(a)) throw Error(p(40));
    return a._reactRootContainer ? (Rk(function() {
      rl(null, null, a, false, function() {
        a._reactRootContainer = null;
        a[uf] = null;
      });
    }), true) : false;
  };
  reactDom_production_min.unstable_batchedUpdates = Qk;
  reactDom_production_min.unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
    if (!ol(c)) throw Error(p(200));
    if (null == a || void 0 === a._reactInternals) throw Error(p(38));
    return rl(a, b, c, false, d);
  };
  reactDom_production_min.version = "18.3.1-next-f1338f8080-20240426";
  return reactDom_production_min;
}
var hasRequiredReactDom;
function requireReactDom() {
  if (hasRequiredReactDom) return reactDom.exports;
  hasRequiredReactDom = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    reactDom.exports = requireReactDom_production_min();
  }
  return reactDom.exports;
}
var hasRequiredClient;
function requireClient() {
  if (hasRequiredClient) return client;
  hasRequiredClient = 1;
  var m = requireReactDom();
  {
    client.createRoot = m.createRoot;
    client.hydrateRoot = m.hydrateRoot;
  }
  return client;
}
var clientExports = requireClient();
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(clientExports);
function getDayKey(input) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor(safeSeconds % 3600 / 60);
  const seconds = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function formatDateTime(input) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(input));
}
function formatCompactDateTime(input) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(input));
}
function normalizeValue(value) {
  return value.trim();
}
function pickPreviewLines(block, count = 4) {
  return block.split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && line !== "(empty)").slice(0, count);
}
function getFirstMeaningfulLine(...blocks) {
  for (const block of blocks) {
    const line = block.split("\n").map((item) => item.trim()).find((item) => item.length > 0 && item !== "(empty)");
    if (line) {
      return line;
    }
  }
  return "";
}
function buildSuccessHeadline(action, stdout) {
  if (action.includes("dry-run")) {
    return "试运行完成，计划已经生成。";
  }
  if (action.includes("execute")) {
    return "正式执行完成，建议确认游戏内结果。";
  }
  if (action.includes("record-profile")) {
    return "Profile 录制完成，关键坐标已经更新。";
  }
  if (action.includes("print-profile")) {
    return "当前 Profile 已输出到日志。";
  }
  if (action.includes("import-legacy-config")) {
    return "旧配置导入完成，建议再跑一次试运行。";
  }
  if (action.includes("install-python-deps")) {
    return "Python 运行时依赖安装动作已经执行。";
  }
  const firstStdoutLine = getFirstMeaningfulLine(stdout);
  return firstStdoutLine || "本次任务执行完成。";
}
function buildGuidance(success, action, stderr, stdout) {
  const text = `${stderr}
${stdout}`.toLowerCase();
  if (success) {
    if (action.includes("dry-run")) {
      return "先核对计划里的格位、次数和等待秒数，确认无误后再正式执行。";
    }
    if (action.includes("execute")) {
      return "建议回到游戏确认合成、金币或仓库状态是否和日志一致。";
    }
    if (action.includes("record-profile")) {
      return "如果后续点击偏位，优先重新录制本任务的关键坐标。";
    }
    if (action.includes("import-legacy-config")) {
      return "旧配置迁入后，最好立刻做一次试运行，确认新 runtime 解释没有偏差。";
    }
    if (action.includes("install-python-deps")) {
      return "建议立刻刷新一次工坊预检，确认 Python 包和 OCR 引擎是否已经全部回绿。";
    }
    return "这次结果看起来正常，如需深挖细节可以继续展开原始日志。";
  }
  if (text.includes("no module named") || text.includes("modulenotfounderror")) {
    return "当前更像是 Python 依赖没装全，先检查 OCR 或自动化运行时依赖。";
  }
  if (text.includes("not found") || text.includes("未找到") || text.includes("不存在")) {
    return "这次更像路径或文件缺失，优先检查脚本、Profile、旧配置和截图路径。";
  }
  if (text.includes("permission") || text.includes("denied")) {
    return "这次更像权限问题，先确认日志目录、导出目录或外部运行环境是否可写。";
  }
  if (text.includes("整数") || text.includes("invalid literal") || text.includes("valueerror")) {
    return "这次更像输入格式问题，优先回头检查数量、金额、等级和矩阵内容。";
  }
  return "这次执行没有成功，建议先看 stderr 摘要，再回到预检确认是哪一项先变红了。";
}
function parseAutomationLog(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  const stdoutMarker = "\n[stdout]\n";
  const stderrMarker = "\n[stderr]\n";
  const stdoutIndex = normalized.indexOf(stdoutMarker);
  const stderrIndex = normalized.indexOf(stderrMarker);
  if (stdoutIndex === -1 || stderrIndex === -1) {
    return null;
  }
  const header = normalized.slice(0, stdoutIndex).trim();
  const stdout = normalized.slice(stdoutIndex + stdoutMarker.length, stderrIndex).trim();
  const stderr = normalized.slice(stderrIndex + stderrMarker.length).trim();
  const meta = /* @__PURE__ */ new Map();
  for (const line of header.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const key = normalizeValue(line.slice(0, separatorIndex));
    const value = normalizeValue(line.slice(separatorIndex + 1));
    meta.set(key, value);
  }
  if (!meta.has("Task") && !meta.has("Action") && !meta.has("Command")) {
    return null;
  }
  const successText = meta.get("Success");
  const success = successText === "true" ? true : successText === "false" ? false : null;
  const action = meta.get("Action") ?? "";
  const headline = success ? buildSuccessHeadline(action, stdout) : getFirstMeaningfulLine(stderr, stdout) || "本次执行失败，请查看日志细节。";
  return {
    time: meta.get("Time") ?? "",
    task: meta.get("Task") ?? "",
    action,
    success,
    exitCode: meta.get("Exit Code") ?? "",
    command: meta.get("Command") ?? "",
    stdout,
    stderr,
    stdoutPreview: pickPreviewLines(stdout),
    stderrPreview: pickPreviewLines(stderr),
    headline,
    guidance: buildGuidance(success, action, stderr, stdout)
  };
}
function findGlobalCheck$2(checks, key) {
  return checks.find((check) => check.key === key) ?? null;
}
function getIntegrationLabel(id) {
  switch (id) {
    case "rune-cube":
      return "符文";
    case "gem-cube":
      return "宝石";
    case "drop-shared-gold":
      return "金币";
  }
}
function isTaskProfileReady(task) {
  return task.checks.some((check) => check.key === "profile-path" && check.level === "ok");
}
function buildSetupGuideHint(preflight, settings) {
  if (!preflight) {
    return {
      badge: "等待诊断",
      title: "先读取当前可用状态",
      detail: "我会先检查 Python 运行环境、依赖和三条坐标配置，再明确告诉你当前卡在哪一步。",
      actionLabel: "打开引导",
      action: "open-guide",
      stepKey: "runtime"
    };
  }
  const globalChecks = preflight.globalChecks ?? [];
  const tasks = preflight.tasks ?? [];
  const runtimeChecks = [
    findGlobalCheck$2(globalChecks, "runtime-root"),
    findGlobalCheck$2(globalChecks, "python-command"),
    findGlobalCheck$2(globalChecks, "requirements-file"),
    findGlobalCheck$2(globalChecks, "pip-command")
  ].filter(Boolean);
  const pythonSourceCheck = findGlobalCheck$2(globalChecks, "python-source");
  const runtimeBaseReady = runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === "ok");
  const runtimeReady = runtimeBaseReady && (pythonSourceCheck == null ? void 0 : pythonSourceCheck.level) === "ok";
  if (!runtimeReady) {
    return {
      badge: "第 1 步",
      title: runtimeBaseReady ? "切换到内置 Python 运行环境" : "先安装内置 Python 运行环境",
      detail: runtimeBaseReady ? "当前还能跑，但还在使用系统 Python。切到桌宠自带的运行环境后，后面的自动化和打包都会更稳。" : "桌宠需要先准备好自己的 Python、pip 和运行环境目录，后面的自动化任务才会真正开箱即用。",
      actionLabel: "安装内置 Python 运行环境",
      action: "install-runtime",
      stepKey: "runtime"
    };
  }
  const dependencyCheck = findGlobalCheck$2(globalChecks, "python-dependencies");
  const ocrCheck = findGlobalCheck$2(globalChecks, "ocr-engine");
  const dependencyReady = (dependencyCheck == null ? void 0 : dependencyCheck.level) === "ok" && (ocrCheck == null ? void 0 : ocrCheck.level) === "ok";
  if (!dependencyReady) {
    return {
      badge: "第 2 步",
      title: "先安装 Python 依赖",
      detail: "依赖和图像识别还没到位前，工坊任务和掉落识别都不会完整可用。",
      actionLabel: "一键安装依赖",
      action: "install-deps",
      stepKey: "deps"
    };
  }
  if (tasks.length === 0) {
    return {
      badge: "等待工坊状态",
      title: "还在读取三条任务线状态",
      detail: "我还没拿到符文、宝石、金币三条任务线的预检结果。先打开完整引导，或者去工坊刷新一次。",
      actionLabel: "打开引导",
      action: "open-guide",
      stepKey: "profiles"
    };
  }
  const missingProfileTasks = tasks.filter((task) => !isTaskProfileReady(task));
  if (missingProfileTasks.length > 0) {
    const task = missingProfileTasks[0];
    const label = getIntegrationLabel(task.id);
    return {
      badge: "第 3 步",
      title: `先录 ${label} 坐标配置`,
      detail: "录完这一条后，工坊预检会马上更新，你也能更快进入试运行。",
      actionLabel: `去录 ${label} 坐标配置`,
      action: "open-workshop-task",
      stepKey: "profiles",
      integrationId: task.id
    };
  }
  const desktopReady = settings.windowMode === "floating" || settings.notificationsEnabled;
  if (!desktopReady) {
    return {
      badge: "已经可用",
      title: "核心功能已经能用了",
      detail: "环境、依赖和坐标配置都齐了。现在就能去工坊执行任务；悬浮态和通知只是额外增强。",
      actionLabel: "完成引导",
      action: "complete-guide",
      stepKey: "finish"
    };
  }
  return {
    badge: "已经可用",
    title: "桌宠已经准备好了",
    detail: "Python 运行环境、依赖和坐标配置都齐了，悬浮态和通知也已经就位，可以正式开始用了。",
    actionLabel: "完成引导",
    action: "complete-guide",
    stepKey: "finish"
  };
}
function PanelStateCard(props) {
  var _a;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card panel-state-card tone-${props.tone}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-state-head", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: props.eyebrow ?? "当前状态" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: props.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: props.detail })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${props.tone}`, children: getToneLabel$1(props.tone) })
    ] }),
    props.meta ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "panel-state-meta", children: props.meta }) : null,
    ((_a = props.actions) == null ? void 0 : _a.length) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-row", children: props.actions.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: action.kind === "primary" ? "primary-button" : "ghost-button",
        disabled: action.disabled,
        onClick: action.onClick,
        type: "button",
        children: action.label
      },
      action.label
    )) }) : null
  ] });
}
function getToneLabel$1(tone) {
  switch (tone) {
    case "success":
      return "已就绪";
    case "attention":
      return "处理中";
    case "error":
      return "待处理";
  }
}
function getIntegration(integrations, id) {
  const target = integrations.find((item) => item.id === id);
  if (!target) {
    throw new Error(`Missing integration config for ${id}`);
  }
  return target;
}
function getBusyKey(id, mode) {
  return `task-${id}-${mode}`;
}
function getAdminBusyKey(id, action) {
  return `admin-${id}-${action}`;
}
function getEnvironmentBusyKey(action) {
  return `env-${action}`;
}
function getTaskMetaText(id) {
  switch (id) {
    case "rune-cube":
      return {
        title: "自动合成低级符文",
        description: "先根据库存生成合成计划，再切回游戏执行，会比直接硬跑更稳。"
      };
    case "gem-cube":
      return {
        title: "自动合成宝石",
        description: "支持矩阵输入和截图识别两种方式，适合共享仓库联调。"
      };
    case "drop-shared-gold":
      return {
        title: "共享仓库丢金币",
        description: "根据总额和角色等级自动拆批执行，减少重复手工操作。"
      };
  }
}
function getModeLabelText(mode) {
  return mode === "dry-run" ? "试运行" : "立即执行";
}
function getStatusTextText(item) {
  return item.lastRunAt ? `上次执行 ${formatCompactDateTime(item.lastRunAt)}` : "还没有执行过";
}
function getInputModeLabelText(mode) {
  return mode === "matrix" ? "矩阵输入" : "截图识别";
}
function getAdminLabelText(action) {
  switch (action) {
    case "record-profile":
      return "录制坐标配置";
    case "print-profile":
      return "查看坐标配置";
    case "import-legacy-config":
      return "导入旧配置";
  }
}
function getReadableRecordStepsText(id) {
  switch (id) {
    case "rune-cube":
      return ["方块输出格", "Transmute 按钮", "左上符文格", "右上符文格", "左下符文格"];
    case "gem-cube":
      return [
        "输入格 1",
        "输入格 2",
        "输入格 3",
        "输出格",
        "Transmute 按钮",
        "结果落点",
        "左上宝石堆",
        "右上宝石堆",
        "左下宝石堆"
      ];
    case "drop-shared-gold":
      return ["仓库点击点", "共享标签", "仓库金币按钮", "背包金币按钮"];
  }
}
function getProfileNoteText(item) {
  if (item.supportsLegacyImport && item.legacyConfigPath) {
    return `默认旧配置路径：${item.legacyConfigPath}`;
  }
  return "这条任务线没有独立旧配置，建议直接录新的坐标配置。";
}
function getTaskHintText(message) {
  if (!message) {
    return "先看预检，再决定是试运行还是正式执行。";
  }
  const normalized = message.toLowerCase();
  if (message.includes("未找到") || normalized.includes("not found")) {
    return "通常是脚本、坐标配置、旧配置或截图路径不存在，先看预检里哪一项变红了。";
  }
  if (message.includes("整数")) {
    return "检查数量、金额、等级这些输入是不是都填成了整数。";
  }
  if (message.includes("截图")) {
    return "先粘贴截图，或者把现有截图路径填完整。";
  }
  if (message.includes("停用")) {
    return "这条任务当前被停用了，先确认任务状态。";
  }
  if (message.includes("执行失败")) {
    return "先点“看日志”，再对照预检判断是环境问题还是输入问题。";
  }
  return "如果这次结果不符合预期，优先看预检和日志。";
}
function getProfileGuideDetailText(id) {
  switch (id) {
    case "rune-cube":
      return "先录方块输出格、Transmute 和符文关键点，后面填数量就能跑。";
    case "gem-cube":
      return "先录输入格、输出格、结果落点和宝石堆关键点，矩阵和截图识别都会用到。";
    case "drop-shared-gold":
      return "先录共享仓库标签、金币按钮和点击点，后面才能自动拆批丢金币。";
  }
}
function buildTaskDiagnosisText(item, task, drafts, hasGemClipboardImage) {
  const actions = [];
  if (!task) {
    return {
      tone: "attention",
      title: "诊断准备中",
      description: "正在重新扫描这条任务线的环境、坐标配置和输入条件。",
      actions: [{ key: "refresh", label: "立即刷新", kind: "refresh" }]
    };
  }
  const profileCheck = findCheck(task, "profile-path");
  const legacyCheck = findCheck(task, "legacy-config");
  const scriptCheck = findCheck(task, "script-path");
  const pythonCheck = findCheck(task, "python-global");
  const screenshotCheck = findCheck(task, "gem-screenshot");
  const matrixCheck = findCheck(task, "gem-matrix");
  const inactiveCheck = findCheck(task, "inactive-window");
  const waitCheck = findCheck(task, "rune-wait") ?? findCheck(task, "gem-wait") ?? findCheck(task, "gold-wait");
  if ((pythonCheck == null ? void 0 : pythonCheck.level) === "error" || (scriptCheck == null ? void 0 : scriptCheck.level) === "error") {
    pushAction(actions, {
      key: "open-runtime",
      label: "打开运行时目录",
      kind: "open-path",
      path: item.workingDirectory
    });
    return {
      tone: "error",
      title: "运行环境还没到位",
      description: (pythonCheck == null ? void 0 : pythonCheck.detail) ?? (scriptCheck == null ? void 0 : scriptCheck.detail) ?? task.summary,
      actions
    };
  }
  if ((profileCheck == null ? void 0 : profileCheck.level) === "error") {
    pushAction(actions, {
      key: "record-profile",
      label: "重录制坐标配置",
      kind: "admin",
      adminAction: "record-profile"
    });
    pushAction(actions, {
      key: "open-profile-dir",
      label: "打开坐标目录",
      kind: "open-path",
      path: getParentPath(item.profilePath)
    });
    if (item.supportsLegacyImport && (legacyCheck == null ? void 0 : legacyCheck.level) === "ok") {
      pushAction(actions, {
        key: "import-legacy",
        label: "导入旧配置",
        kind: "admin",
        adminAction: "import-legacy-config"
      });
    }
    return {
      tone: "error",
      title: "坐标配置还没准备好",
      description: profileCheck.detail,
      actions
    };
  }
  if ((screenshotCheck == null ? void 0 : screenshotCheck.level) === "error") {
    if (drafts.gemMatrix.trim()) {
      pushAction(actions, {
        key: "switch-gem-matrix",
        label: "改用矩阵模式",
        kind: "set-gem-mode",
        mode: "matrix"
      });
    }
    if (drafts.gemImagePath.trim()) {
      pushAction(actions, {
        key: "open-image-dir",
        label: "打开截图目录",
        kind: "open-path",
        path: getParentPath(drafts.gemImagePath)
      });
      pushAction(actions, {
        key: "clear-image-path",
        label: "清空截图路径",
        kind: "clear-gem-path"
      });
    }
    if (!hasGemClipboardImage && !drafts.gemImagePath.trim()) {
      pushAction(actions, { key: "refresh", label: "刷新诊断", kind: "refresh" });
    }
    return {
      tone: "error",
      title: "宝石截图来源未就绪",
      description: screenshotCheck.detail,
      actions
    };
  }
  if ((matrixCheck == null ? void 0 : matrixCheck.level) === "error") {
    if (hasGemClipboardImage || drafts.gemImagePath.trim()) {
      pushAction(actions, {
        key: "switch-gem-scan",
        label: "改用截图识别",
        kind: "set-gem-mode",
        mode: "scan-image"
      });
    }
    return {
      tone: "error",
      title: "宝石矩阵还没填好",
      description: matrixCheck.detail,
      actions
    };
  }
  if ((inactiveCheck == null ? void 0 : inactiveCheck.level) === "warning") {
    pushAction(actions, {
      key: "focus-window",
      label: "改回前台执行",
      kind: "set-allow-inactive",
      value: false
    });
    return {
      tone: "attention",
      title: "当前允许后台点击",
      description: inactiveCheck.detail,
      actions
    };
  }
  if ((waitCheck == null ? void 0 : waitCheck.level) === "warning") {
    const waitRepair = getWaitRepair(item.id);
    pushAction(actions, {
      key: `repair-${waitRepair.draftKey}`,
      label: `恢复为 ${waitRepair.value} 秒等待`,
      kind: "set-wait",
      value: waitRepair.value
    });
    return {
      tone: "attention",
      title: "等待时间偏长",
      description: waitCheck.detail,
      actions
    };
  }
  if (task.status === "ready") {
    pushAction(actions, {
      key: "print-profile",
      label: "查看当前坐标",
      kind: "admin",
      adminAction: "print-profile"
    });
    if (item.lastLogPath) {
      pushAction(actions, {
        key: "open-last-log",
        label: "打开最新日志",
        kind: "open-path",
        path: item.lastLogPath
      });
    }
    return {
      tone: "success",
      title: "这条任务已经可以开跑",
      description: "环境和输入都通过诊断了，建议先试运行，再决定是否正式执行。",
      actions
    };
  }
  const focusCheck = task.checks.find((check) => check.level === "error") ?? task.checks.find((check) => check.level === "warning") ?? null;
  return {
    tone: task.status === "error" ? "error" : "attention",
    title: task.status === "error" ? "还有阻塞项待处理" : "还有提醒项待处理",
    description: (focusCheck == null ? void 0 : focusCheck.detail) ?? task.summary,
    actions
  };
}
function translateRecordConsoleLine(id, line) {
  const normalized = line.trim().toLowerCase();
  if (normalized.startsWith("recording ")) {
    return `${getIntegrationLabel(id)} 录制已开始，请保持暗黑 2 和目标界面可见。`;
  }
  if (normalized.includes("make sure the diablo ii inventory and cube ui are visible")) {
    return "请保持背包和赫拉迪姆方块界面可见，然后按步骤按 F10 捕获位置。";
  }
  if (normalized.includes("now capture the rune grid anchors")) {
    return "基础点位已经完成，下一步开始录符文网格锚点。";
  }
  if (normalized.startsWith("saved recorded")) {
    return `${getIntegrationLabel(id)} 坐标配置已保存，预检会自动刷新。`;
  }
  return line;
}
function describeRecordingProgress(event) {
  const translatedLine = translateRecordConsoleLine(event.id, event.line);
  if (event.finished) {
    return event.success ? translatedLine : `录制失败：${translatedLine}`;
  }
  if (typeof event.stepIndex === "number") {
    const stepLabel = getReadableRecordStepsText(event.id)[event.stepIndex] ?? `步骤 ${event.stepIndex + 1}`;
    return `当前目标：${stepLabel}。切回游戏后把鼠标对准这里，再按 F10。`;
  }
  if (event.kind === "stderr") {
    return `录制器提示：${translatedLine}`;
  }
  return translatedLine;
}
function getRecordingFailureSummary(rawText) {
  const text = rawText.trim();
  const normalized = text.toLowerCase();
  if (!text) {
    return "录制中断了，但没有返回更多信息。建议先看日志，再重新录一次。";
  }
  if (normalized.includes("stopped by user") || normalized.includes("cancelled") || normalized.includes("canceled") || normalized.includes("stop key")) {
    return "录制被提前结束了。通常是按了 F12，或者主动中止了录制。";
  }
  if (normalized.includes("access is denied") || normalized.includes("permission") || normalized.includes("administrator")) {
    return "录制权限不足。请尝试以管理员身份运行桌宠，再重新录制。";
  }
  if (normalized.includes("not found") || normalized.includes("no such file") || normalized.includes("找不到")) {
    return "录制依赖的脚本或配置没有找到。建议先看日志确认缺的是哪一项。";
  }
  if (normalized.includes("keyboard") || normalized.includes("hotkey") || normalized.includes("f10")) {
    return "热键监听没有正常工作。请确认没有别的程序占用 F10 / F12。";
  }
  if (normalized.includes("window") || normalized.includes("inventory") || normalized.includes("cube")) {
    return "游戏窗口可能没有准备好。请把背包、方块或仓库界面摆好后再录。";
  }
  return `录制失败：${text}`;
}
function getRecordingSuccessSummary(id) {
  return `${getIntegrationLabel(id)} 的坐标配置已经录好。下一步建议先试运行，确认点击点和流程都对。`;
}
function readImageDataFromItems$1(items) {
  const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
  const imageFile = imageItem == null ? void 0 : imageItem.getAsFile();
  if (!imageFile) {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("截图读取失败，请重新截图后再试。"));
    reader.readAsDataURL(imageFile);
  });
}
function getErrorMessage$2(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return "发生了未知错误。";
}
function getCheckToneClass(level) {
  switch (level) {
    case "ok":
      return "check-ok";
    case "warning":
      return "check-warning";
    case "error":
      return "check-error";
  }
}
function getTaskToneClass(task) {
  switch (task == null ? void 0 : task.status) {
    case "ready":
      return "success";
    case "warning":
      return "attention";
    case "error":
      return "error";
    default:
      return "attention";
  }
}
function findCheck(task, key) {
  return (task == null ? void 0 : task.checks.find((check) => check.key === key)) ?? null;
}
function findGlobalCheck$1(checks, key) {
  return checks.find((check) => check.key === key) ?? null;
}
function getDependencyChecks(checks) {
  return checks.filter((check) => check.key.startsWith("dependency-"));
}
function getVisibleGlobalChecks(checks) {
  return checks.filter((check) => !check.key.startsWith("dependency-"));
}
function getParentPath(targetPath) {
  const normalized = targetPath.trim().replace(/[\\/]+$/, "");
  const match = normalized.match(/^(.*)[\\/][^\\/]+$/);
  return (match == null ? void 0 : match[1]) ?? normalized;
}
function pushAction(actions, action) {
  if (!actions.some((item) => item.key === action.key)) {
    actions.push(action);
  }
}
function buildSiblingPath(basePath, childName) {
  return `${basePath.replace(/[\\/]+$/, "")}\\${childName}`;
}
function getWaitRepair(id) {
  switch (id) {
    case "rune-cube":
      return { draftKey: "runeWaitSeconds", value: 3 };
    case "gem-cube":
      return { draftKey: "gemWaitSeconds", value: 3 };
    case "drop-shared-gold":
      return { draftKey: "goldWaitSeconds", value: 5 };
  }
}
function buildEnvironmentDiagnosis(globalChecks, runtimeRoot) {
  const actions = [];
  const runtimeCheck = findGlobalCheck$1(globalChecks, "runtime-root");
  const pythonCheck = findGlobalCheck$1(globalChecks, "python-command");
  const requirementsCheck = findGlobalCheck$1(globalChecks, "requirements-file");
  const pipCheck = findGlobalCheck$1(globalChecks, "pip-command");
  const dependencyCheck = findGlobalCheck$1(globalChecks, "python-dependencies");
  const ocrCheck = findGlobalCheck$1(globalChecks, "ocr-engine");
  const requirementsPath = buildSiblingPath(runtimeRoot, "requirements.txt");
  const readmePath = buildSiblingPath(runtimeRoot, "README.md");
  pushAction(actions, {
    key: "open-runtime-readme",
    label: "打开运行环境说明",
    kind: "open-path",
    path: readmePath
  });
  pushAction(actions, {
    key: "open-requirements",
    label: "打开 requirements",
    kind: "open-path",
    path: requirementsPath
  });
  pushAction(actions, {
    key: "refresh-environment",
    label: "刷新环境诊断",
    kind: "refresh"
  });
  if ((runtimeCheck == null ? void 0 : runtimeCheck.level) === "error") {
    pushAction(actions, {
      key: "open-runtime-root",
      label: "打开运行环境目录",
      kind: "open-path",
      path: runtimeRoot
    });
    return {
      tone: "error",
      title: "内置运行环境缺失",
      description: runtimeCheck.detail,
      actions
    };
  }
  if ((pythonCheck == null ? void 0 : pythonCheck.level) === "error") {
    return {
      tone: "error",
      title: "运行环境还没就绪",
      description: pythonCheck.detail,
      actions
    };
  }
  if ((requirementsCheck == null ? void 0 : requirementsCheck.level) === "error") {
    pushAction(actions, {
      key: "open-runtime-root",
      label: "打开运行环境目录",
      kind: "open-path",
      path: runtimeRoot
    });
    return {
      tone: "error",
      title: "依赖清单缺失",
      description: requirementsCheck.detail,
      actions
    };
  }
  if ((pipCheck == null ? void 0 : pipCheck.level) === "error") {
    return {
      tone: "error",
      title: "pip 当前不可用",
      description: pipCheck.detail,
      actions
    };
  }
  if ((dependencyCheck == null ? void 0 : dependencyCheck.level) === "error") {
    pushAction(actions, {
      key: "install-python-deps",
      label: "安装运行环境依赖",
      kind: "environment-action",
      environmentAction: "install-python-deps"
    });
    return {
      tone: "error",
      title: "运行时依赖还没装齐",
      description: dependencyCheck.detail,
      actions
    };
  }
  if ((ocrCheck == null ? void 0 : ocrCheck.level) === "warning") {
    pushAction(actions, {
      key: "install-python-deps",
      label: "补装文字识别组件相关依赖",
      kind: "environment-action",
      environmentAction: "install-python-deps"
    });
    return {
      tone: "attention",
      title: "文字识别组件还没准备好",
      description: ocrCheck.detail,
      actions
    };
  }
  return {
    tone: "success",
    title: "环境已经就绪",
    description: "运行环境、依赖清单、运行时包和文字识别能力都已经通过检查。",
    actions
  };
}
function getDependencyTitle(check) {
  return check.label === "pillow" ? "Pillow" : check.label;
}
function getParsedTaskLabel(task) {
  if (task === "rune-cube" || task === "gem-cube" || task === "drop-shared-gold") {
    return getTaskMetaText(task).title;
  }
  if (task === "environment") {
    return "环境修复站";
  }
  return task || "未知任务";
}
function getActionSummaryLabel(action) {
  switch (action) {
    case "dry-run":
      return "试运行";
    case "execute":
      return "立即执行";
    case "record-profile":
      return "录制坐标配置";
    case "print-profile":
      return "查看坐标配置";
    case "import-legacy-config":
      return "导旧配置";
    case "install-python-deps":
      return "安装运行环境依赖";
    default:
      return action || "未命名动作";
  }
}
function getLogToneClass(success) {
  if (success === true) {
    return "success";
  }
  if (success === false) {
    return "error";
  }
  return "attention";
}
function getLogResultLabel(success) {
  if (success === true) {
    return "执行成功";
  }
  if (success === false) {
    return "执行失败";
  }
  return "结果未知";
}
function getCheckLevelLabel(level) {
  switch (level) {
    case "ok":
      return "正常";
    case "warning":
      return "提醒";
    case "error":
      return "阻塞";
  }
}
function getDiagnosisToneLabel(tone) {
  switch (tone) {
    case "success":
      return "已就绪";
    case "attention":
      return "建议处理";
    case "error":
      return "需要修复";
  }
}
function getTaskStatusLabel(status) {
  switch (status) {
    case "ready":
      return "可以开跑";
    case "warning":
      return "先看提醒";
    case "error":
      return "先补条件";
    default:
      return "等待预检";
  }
}
function AutomationPanel(props) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const [drafts, setDrafts] = reactExports.useState(props.initialDrafts);
  const [gemImageDataUrl, setGemImageDataUrl] = reactExports.useState("");
  const [gemPasteHint, setGemPasteHint] = reactExports.useState(
    "切到“截图识别”后，截图后直接按 Ctrl+V，下一次运行会自动保存到本地。"
  );
  const [viewer, setViewer] = reactExports.useState(null);
  const [environmentLog, setEnvironmentLog] = reactExports.useState(null);
  const [environmentTimeline, setEnvironmentTimeline] = reactExports.useState([]);
  const [logBusyId, setLogBusyId] = reactExports.useState(null);
  const [preflight, setPreflight] = reactExports.useState(null);
  const [preflightBusy, setPreflightBusy] = reactExports.useState(false);
  const [preflightError, setPreflightError] = reactExports.useState("");
  const [preflightTick, setPreflightTick] = reactExports.useState(0);
  const [recordingGuide, setRecordingGuide] = reactExports.useState(null);
  const [selectedTaskId, setSelectedTaskId] = reactExports.useState("rune-cube");
  const [showWorkshopAdvanced, setShowWorkshopAdvanced] = reactExports.useState(false);
  const environmentSnapshotRef = reactExports.useRef("");
  const runeCardRef = reactExports.useRef(null);
  const gemCardRef = reactExports.useRef(null);
  const goldCardRef = reactExports.useRef(null);
  const workshopAdvancedRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setDrafts(props.initialDrafts);
  }, [props.initialDrafts]);
  reactExports.useEffect(() => {
    if (drafts.gemInputMode !== "scan-image") {
      return void 0;
    }
    function handlePaste(event) {
      if (!event.clipboardData) {
        return;
      }
      const hasImage = Array.from(event.clipboardData.items).some(
        (item) => item.type.startsWith("image/")
      );
      if (!hasImage) {
        return;
      }
      event.preventDefault();
      void readImageDataFromItems$1(event.clipboardData.items).then((value) => {
        if (!value) {
          return;
        }
        setGemImageDataUrl(value);
        setGemPasteHint("新截图已经就绪，下一次试运行或执行会自动保存并用于识别。");
      }).catch(() => {
        setGemPasteHint("截图读取失败，请重新截图后再试。");
      });
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [drafts.gemInputMode]);
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreflightBusy(true);
      setPreflightError("");
      void props.onGetPreflight({
        drafts,
        hasGemClipboardImage: Boolean(gemImageDataUrl)
      }).then((value) => setPreflight(value)).catch((error) => {
        setPreflightError(getErrorMessage$2(error));
      }).finally(() => setPreflightBusy(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [drafts, gemImageDataUrl, props.integrations, preflightTick]);
  reactExports.useEffect(() => {
    return window.d2Pet.onAutomationRecordProgress((event) => {
      setRecordingGuide((current) => {
        if (!current || current.taskId !== event.id) {
          return current;
        }
        const stepCount = getReadableRecordStepsText(event.id).length;
        const nextStepIndex = typeof event.stepIndex === "number" ? Math.min(Math.max(event.stepIndex, 0), Math.max(stepCount - 1, 0)) : current.stepIndex;
        return {
          ...current,
          stepIndex: nextStepIndex,
          status: event.finished ? event.success ? "success" : "error" : "recording",
          detail: describeRecordingProgress(event),
          updatedAt: event.updatedAt,
          lastLine: translateRecordConsoleLine(event.id, event.line),
          live: true
        };
      });
    });
  }, []);
  const runeTask = getIntegration(props.integrations, "rune-cube");
  const gemTask = getIntegration(props.integrations, "gem-cube");
  const goldTask = getIntegration(props.integrations, "drop-shared-gold");
  const taskItems = reactExports.useMemo(() => [runeTask, gemTask, goldTask], [runeTask, gemTask, goldTask]);
  const preflightMap = reactExports.useMemo(() => {
    return new Map(((preflight == null ? void 0 : preflight.tasks) ?? []).map((task) => [task.id, task]));
  }, [preflight]);
  const parsedViewerLog = reactExports.useMemo(() => {
    return viewer ? parseAutomationLog(viewer.content) : null;
  }, [viewer]);
  const viewerIntegration = reactExports.useMemo(() => {
    return (viewer == null ? void 0 : viewer.id) ? props.integrations.find((item) => item.id === viewer.id) ?? null : null;
  }, [props.integrations, viewer]);
  const globalChecks = (preflight == null ? void 0 : preflight.globalChecks) ?? [];
  const dependencyChecks = reactExports.useMemo(() => getDependencyChecks(globalChecks), [globalChecks]);
  const installedDependencies = dependencyChecks.filter((check) => check.level === "ok").length;
  const environmentDiagnosis = reactExports.useMemo(() => {
    return buildEnvironmentDiagnosis(globalChecks, runeTask.workingDirectory);
  }, [globalChecks, runeTask.workingDirectory]);
  const parsedEnvironmentLog = reactExports.useMemo(() => {
    return environmentLog ? parseAutomationLog(environmentLog.content) : null;
  }, [environmentLog]);
  const pythonCheck = reactExports.useMemo(
    () => findGlobalCheck$1(globalChecks, "python-command"),
    [globalChecks]
  );
  const pythonSourceCheck = reactExports.useMemo(
    () => findGlobalCheck$1(globalChecks, "python-source"),
    [globalChecks]
  );
  reactExports.useMemo(
    () => findGlobalCheck$1(globalChecks, "pip-command"),
    [globalChecks]
  );
  const dependencyCheck = reactExports.useMemo(
    () => findGlobalCheck$1(globalChecks, "python-dependencies"),
    [globalChecks]
  );
  const ocrCheck = reactExports.useMemo(
    () => findGlobalCheck$1(globalChecks, "ocr-engine"),
    [globalChecks]
  );
  const needsEmbeddedRuntime = (pythonCheck == null ? void 0 : pythonCheck.level) === "error" || (pythonSourceCheck == null ? void 0 : pythonSourceCheck.level) === "warning";
  const needsDependencyInstall = (dependencyCheck == null ? void 0 : dependencyCheck.level) === "error" || (ocrCheck == null ? void 0 : ocrCheck.level) === "warning";
  const environmentPrimaryAction = reactExports.useMemo(() => {
    if (needsEmbeddedRuntime) {
      return {
        action: "install-python-runtime",
        label: props.busyKey === getEnvironmentBusyKey("install-python-runtime") ? "安装内置运行环境中..." : "安装内置运行环境",
        detail: (pythonSourceCheck == null ? void 0 : pythonSourceCheck.level) === "warning" ? "当前还在使用系统环境，切到桌宠自带的运行环境会更稳。" : "先把桌宠自带的运行环境装好，再继续后面的自动化。"
      };
    }
    if (needsDependencyInstall) {
      return {
        action: "install-python-deps",
        label: props.busyKey === getEnvironmentBusyKey("install-python-deps") ? "安装依赖中..." : "安装运行环境依赖",
        detail: "依赖和文字识别组件补齐后，工坊任务与截图识别才会完整可用。"
      };
    }
    return {
      action: null,
      label: preflightBusy ? "刷新诊断中..." : "刷新环境诊断",
      detail: "当前环境已经基本就绪，随时可以重新做一次预检。"
    };
  }, [
    needsEmbeddedRuntime,
    needsDependencyInstall,
    ocrCheck == null ? void 0 : ocrCheck.level,
    preflightBusy,
    props.busyKey,
    pythonSourceCheck == null ? void 0 : pythonSourceCheck.level
  ]);
  const profileGuideSteps = reactExports.useMemo(() => {
    return taskItems.map((item) => {
      const task = preflightMap.get(item.id) ?? null;
      const ready = task ? isTaskProfileReady(task) : false;
      return {
        id: item.id,
        title: `${getIntegrationLabel(item.id)} 坐标配置`,
        ready,
        summary: ready ? "这条坐标已经录好。" : "还没录制，当前不能稳定执行这条任务。",
        detail: ready ? "可以直接试运行，或者点“查看坐标配置”确认当前配置。" : task ? getProfileGuideDetailText(item.id) : "我还在等预检返回这条任务的坐标状态。"
      };
    });
  }, [preflightMap, taskItems]);
  const readyProfileCount = profileGuideSteps.filter((step) => step.ready).length;
  const nextProfileStep = profileGuideSteps.find((step) => !step.ready) ?? null;
  const focusTaskId = reactExports.useMemo(() => {
    if (recordingGuide == null ? void 0 : recordingGuide.taskId) {
      return recordingGuide.taskId;
    }
    if (props.highlightedTaskId) {
      return props.highlightedTaskId;
    }
    if (nextProfileStep == null ? void 0 : nextProfileStep.id) {
      return nextProfileStep.id;
    }
    const blockingTask = taskItems.find((item) => {
      var _a2;
      return ((_a2 = preflightMap.get(item.id)) == null ? void 0 : _a2.status) === "error";
    }) ?? null;
    if (blockingTask) {
      return blockingTask.id;
    }
    const warningTask = taskItems.find((item) => {
      var _a2;
      return ((_a2 = preflightMap.get(item.id)) == null ? void 0 : _a2.status) === "warning";
    }) ?? null;
    if (warningTask) {
      return warningTask.id;
    }
    return "rune-cube";
  }, [nextProfileStep, preflightMap, props.highlightedTaskId, recordingGuide == null ? void 0 : recordingGuide.taskId, taskItems]);
  const selectedTask = reactExports.useMemo(
    () => taskItems.find((item) => item.id === selectedTaskId) ?? runeTask,
    [runeTask, selectedTaskId, taskItems]
  );
  const workshopFocus = reactExports.useMemo(() => {
    var _a2, _b2;
    if (needsEmbeddedRuntime) {
      return {
        tone: "error",
        title: "先装运行环境",
        detail: environmentPrimaryAction.detail,
        primaryLabel: environmentPrimaryAction.label,
        secondaryLabel: "更多诊断"
      };
    }
    if (needsDependencyInstall) {
      return {
        tone: "error",
        title: "先补运行环境依赖",
        detail: environmentPrimaryAction.detail,
        primaryLabel: environmentPrimaryAction.label,
        secondaryLabel: "更多诊断"
      };
    }
    if (nextProfileStep) {
      const label = getIntegrationLabel(nextProfileStep.id);
      return {
        tone: "attention",
        title: `先录 ${label} 坐标`,
        detail: "先把这条录好，再往下走。",
        primaryLabel: `录 ${label}`,
        secondaryLabel: "看这条任务",
        taskId: nextProfileStep.id
      };
    }
    const blockingTask = taskItems.find((item) => {
      var _a3;
      return ((_a3 = preflightMap.get(item.id)) == null ? void 0 : _a3.status) === "error";
    }) ?? null;
    if (blockingTask) {
      return {
        tone: "error",
        title: `${getIntegrationLabel(blockingTask.id)} 有阻塞`,
        detail: ((_a2 = preflightMap.get(blockingTask.id)) == null ? void 0 : _a2.summary) ?? "这条任务还有阻塞项，先处理它。",
        primaryLabel: "看这条任务",
        secondaryLabel: "更多诊断",
        taskId: blockingTask.id
      };
    }
    const warningTask = taskItems.find((item) => {
      var _a3;
      return ((_a3 = preflightMap.get(item.id)) == null ? void 0 : _a3.status) === "warning";
    }) ?? null;
    if (warningTask) {
      return {
        tone: "attention",
        title: `${getIntegrationLabel(warningTask.id)} 有提醒`,
        detail: ((_b2 = preflightMap.get(warningTask.id)) == null ? void 0 : _b2.summary) ?? "建议先看完这条任务的提醒。",
        primaryLabel: "看这条任务",
        secondaryLabel: "更多诊断",
        taskId: warningTask.id
      };
    }
    return {
      tone: "success",
      title: `${getIntegrationLabel(selectedTask.id)} 可以试运行`,
      detail: "先跑一遍计划，再决定是否正式执行。",
      primaryLabel: "试运行",
      secondaryLabel: "更多诊断",
      taskId: selectedTask.id
    };
  }, [
    environmentPrimaryAction.detail,
    environmentPrimaryAction.label,
    needsDependencyInstall,
    needsEmbeddedRuntime,
    nextProfileStep,
    preflightMap,
    selectedTask.id,
    taskItems
  ]);
  const workshopStateCard = reactExports.useMemo(() => {
    if (props.busyKey === getEnvironmentBusyKey("install-python-runtime")) {
      return {
        tone: "attention",
        title: "正在安装运行环境",
        detail: "装完后会自动重新诊断。",
        meta: "请先等当前动作完成"
      };
    }
    if (props.busyKey === getEnvironmentBusyKey("install-python-deps")) {
      return {
        tone: "attention",
        title: "正在安装运行环境依赖",
        detail: "装完后，预检会自动刷新。",
        meta: "请先等当前动作完成"
      };
    }
    if ((recordingGuide == null ? void 0 : recordingGuide.status) === "recording") {
      return {
        tone: "attention",
        title: `正在录 ${getIntegrationLabel(recordingGuide.taskId)} 坐标`,
        detail: recordingGuide.detail,
        meta: recordingGuide.lastLine || "请看弹出的录制窗口提示"
      };
    }
    if ((recordingGuide == null ? void 0 : recordingGuide.status) === "error") {
      return {
        tone: "error",
        title: `${getIntegrationLabel(recordingGuide.taskId)} 录制失败`,
        detail: recordingGuide.detail,
        meta: "建议先看日志，再重录",
        actions: [
          {
            label: "重录",
            kind: "primary",
            disabled: props.busyKey !== null,
            onClick: () => {
              const item = getIntegration(props.integrations, recordingGuide.taskId);
              handleSelectTask(recordingGuide.taskId);
              openRecordingGuide(item);
              void runAdmin(item, "record-profile");
            }
          }
        ]
      };
    }
    if ((recordingGuide == null ? void 0 : recordingGuide.status) === "success") {
      return {
        tone: "success",
        title: `${getIntegrationLabel(recordingGuide.taskId)} 已录好`,
        detail: recordingGuide.detail,
        meta: "下一步建议直接试运行",
        actions: [
          {
            label: "试运行",
            kind: "primary",
            disabled: props.busyKey !== null,
            onClick: () => void runTask(recordingGuide.taskId, "dry-run")
          }
        ]
      };
    }
    if (preflightBusy) {
      return {
        tone: "attention",
        title: "正在刷新工坊状态",
        detail: "我在重新读取环境、依赖和三条任务线。",
        meta: "刷新后会直接告诉你下一步"
      };
    }
    if (preflightError) {
      return {
        tone: "error",
        title: "工坊诊断读取失败",
        detail: preflightError,
        meta: "先重试；如果还失败，再看诊断和日志",
        actions: [
          {
            label: "重新诊断",
            kind: "primary",
            disabled: props.busyKey !== null,
            onClick: requestPreflightRefresh
          },
          {
            label: "更多诊断",
            kind: "secondary",
            onClick: () => toggleWorkshopAdvanced(true)
          }
        ]
      };
    }
    if (!preflight) {
      return {
        tone: "attention",
        title: "工坊还在准备中",
        detail: "诊断结果还没完整返回。",
        meta: "稍等片刻，或手动刷新一次",
        actions: [
          {
            label: "刷新诊断",
            kind: "primary",
            disabled: props.busyKey !== null,
            onClick: requestPreflightRefresh
          }
        ]
      };
    }
    if (needsEmbeddedRuntime || needsDependencyInstall || nextProfileStep) {
      return {
        tone: workshopFocus.tone,
        title: workshopFocus.title,
        detail: workshopFocus.detail,
        meta: needsEmbeddedRuntime || needsDependencyInstall ? "先补环境，再录制坐标配置，再试运行" : "先把这条坐标录好，再往下走",
        actions: [
          {
            label: workshopFocus.primaryLabel,
            kind: "primary",
            disabled: props.busyKey !== null,
            onClick: handleWorkshopFocusPrimary
          },
          {
            label: workshopFocus.secondaryLabel,
            kind: "secondary",
            onClick: handleWorkshopFocusSecondary
          }
        ]
      };
    }
    return {
      tone: "success",
      title: "工坊已就绪",
      detail: `${getIntegrationLabel(selectedTask.id)} 当前可以试运行。`,
      meta: "建议先试运行，再决定是否正式执行",
      actions: [
        {
          label: "试运行",
          kind: "primary",
          disabled: props.busyKey !== null,
          onClick: () => void runTask(selectedTask.id, "dry-run")
        },
        {
          label: "更多诊断",
          kind: "secondary",
          onClick: () => toggleWorkshopAdvanced()
        }
      ]
    };
  }, [
    needsDependencyInstall,
    needsEmbeddedRuntime,
    nextProfileStep,
    preflight,
    preflightBusy,
    preflightError,
    props.busyKey,
    props.integrations,
    recordingGuide,
    selectedTask.id,
    workshopFocus
  ]);
  reactExports.useEffect(() => {
    if (!props.highlightedTaskId) {
      return;
    }
    const target = props.highlightedTaskId === "rune-cube" ? runeCardRef.current : props.highlightedTaskId === "gem-cube" ? gemCardRef.current : goldCardRef.current;
    if (!target) {
      return;
    }
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [props.highlightedTaskId]);
  reactExports.useEffect(() => {
    setSelectedTaskId(focusTaskId);
  }, [focusTaskId]);
  reactExports.useEffect(() => {
    var _a2;
    if (!preflight || globalChecks.length === 0) {
      return;
    }
    const signature = JSON.stringify({
      tone: environmentDiagnosis.tone,
      title: environmentDiagnosis.title,
      description: environmentDiagnosis.description,
      dependencies: dependencyChecks.map((check) => `${check.key}:${check.detail}`),
      global: globalChecks.map((check) => `${check.key}:${check.level}:${check.detail}`)
    });
    if (environmentSnapshotRef.current === signature) {
      return;
    }
    environmentSnapshotRef.current = signature;
    appendEnvironmentTimeline({
      time: preflight.generatedAt,
      tone: environmentDiagnosis.tone,
      title: `环境快照 · ${environmentDiagnosis.title}`,
      detail: `${environmentDiagnosis.description} 依赖 ${installedDependencies}/${dependencyChecks.length || 0}，文字识别 ${((_a2 = findGlobalCheck$1(globalChecks, "ocr-engine")) == null ? void 0 : _a2.level) === "ok" ? "已就绪" : "待补齐"}。`,
      meta: "自动预检"
    });
  }, [
    preflight,
    globalChecks,
    dependencyChecks,
    environmentDiagnosis,
    installedDependencies
  ]);
  function updateDraft(key, value) {
    setDrafts((current) => ({
      ...current,
      [key]: value
    }));
  }
  function updateWaitSeconds(key, value) {
    const nextValue = Number(value);
    updateDraft(key, Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0);
  }
  function requestPreflightRefresh() {
    setPreflightTick((current) => current + 1);
  }
  function scrollToTask(id) {
    const target = id === "rune-cube" ? runeCardRef.current : id === "gem-cube" ? gemCardRef.current : goldCardRef.current;
    target == null ? void 0 : target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function toggleWorkshopAdvanced(nextExpanded = !showWorkshopAdvanced) {
    var _a2;
    setShowWorkshopAdvanced(nextExpanded);
    (_a2 = props.onSurfaceNotice) == null ? void 0 : _a2.call(props, {
      tone: nextExpanded ? "attention" : "success",
      title: nextExpanded ? "更多诊断已展开" : "更多诊断已收起",
      detail: nextExpanded ? "环境修复、录制向导和全局预检都在下方，先只看这一段就够了。" : "工坊已经回到主任务视图，现在只需要盯住当前这张任务卡。"
    });
    window.setTimeout(() => {
      var _a3;
      (_a3 = workshopAdvancedRef.current) == null ? void 0 : _a3.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }
  function handleSelectTask(id) {
    var _a2;
    setSelectedTaskId(id);
    (_a2 = props.onSurfaceNotice) == null ? void 0 : _a2.call(props, {
      tone: "attention",
      title: `已定位到${getIntegrationLabel(id)}`,
      detail: "我已经把工坊收束到这一张任务卡，先看这张就行。"
    });
    window.requestAnimationFrame(() => {
      scrollToTask(id);
    });
  }
  function handleWorkshopFocusPrimary() {
    if (needsEmbeddedRuntime && environmentPrimaryAction.action) {
      void runEnvironmentAction(environmentPrimaryAction.action);
      return;
    }
    if (needsDependencyInstall && environmentPrimaryAction.action) {
      void runEnvironmentAction(environmentPrimaryAction.action);
      return;
    }
    if (workshopFocus.taskId && nextProfileStep && workshopFocus.taskId === nextProfileStep.id) {
      const item = getIntegration(props.integrations, workshopFocus.taskId);
      handleSelectTask(workshopFocus.taskId);
      openRecordingGuide(item);
      void runAdmin(item, "record-profile");
      return;
    }
    if (workshopFocus.taskId && workshopFocus.tone !== "success") {
      handleSelectTask(workshopFocus.taskId);
      return;
    }
    void runTask(selectedTask.id, "dry-run");
  }
  function handleWorkshopFocusSecondary() {
    if (workshopFocus.taskId && nextProfileStep && workshopFocus.taskId === nextProfileStep.id) {
      handleSelectTask(workshopFocus.taskId);
      return;
    }
    if (workshopFocus.taskId && workshopFocus.tone !== "success") {
      toggleWorkshopAdvanced();
      return;
    }
    toggleWorkshopAdvanced();
  }
  function openRecordingGuide(item) {
    setRecordingGuide({
      taskId: item.id,
      stepIndex: 0,
      status: "recording",
      detail: "录制窗口已经打开。请看弹出的控制台，按顺序对准游戏界面并按 F10 捕获当前点位。",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastLine: "正在等待第一条录制提示...",
      live: false
    });
    scrollToTask(item.id);
  }
  function appendEnvironmentTimeline(entry) {
    setEnvironmentTimeline((current) => {
      const duplicate = current[0];
      if (duplicate && duplicate.title === entry.title && duplicate.detail === entry.detail && duplicate.meta === entry.meta) {
        return current;
      }
      return [
        {
          ...entry,
          id: `${entry.time}-${Math.random().toString(36).slice(2, 8)}`
        },
        ...current
      ].slice(0, 8);
    });
  }
  function buildEnvironmentReport() {
    var _a2;
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const ocrReady = ((_a2 = findGlobalCheck$1(globalChecks, "ocr-engine")) == null ? void 0 : _a2.level) === "ok";
    const globalSection = globalChecks.length > 0 ? globalChecks.map(
      (check) => `- [${getCheckLevelLabel(check.level)}] ${check.label}: ${check.detail}`
    ).join("\n") : "- 暂无全局预检结果";
    const dependencySection = dependencyChecks.length > 0 ? dependencyChecks.map(
      (check) => `- ${getDependencyTitle(check)}: ${check.detail}`
    ).join("\n") : "- 暂无依赖诊断结果";
    const taskSection = ((preflight == null ? void 0 : preflight.tasks) ?? []).length > 0 ? ((preflight == null ? void 0 : preflight.tasks) ?? []).map((task) => {
      const taskLines = task.checks.length > 0 ? task.checks.map(
        (check) => `  - [${getCheckLevelLabel(check.level)}] ${check.label}: ${check.detail}`
      ).join("\n") : "  - 暂无细分检查";
      return [
        `### ${getTaskMetaText(task.id).title}`,
        `- 状态：${getTaskStatusLabel(task.status)}`,
        `- 摘要：${task.summary}`,
        taskLines
      ].join("\n");
    }).join("\n\n") : "### 暂无任务预检结果\n- 当前还没有生成任务级诊断";
    const timelineSection = environmentTimeline.length > 0 ? environmentTimeline.map(
      (entry, index) => `${index + 1}. ${entry.title} (${formatCompactDateTime(entry.time)})
   ${entry.detail}
   ${entry.meta}`
    ).join("\n") : "1. 还没有环境事件记录";
    const latestLogSection = environmentLog ? [
      `- 日志路径：${environmentLog.path}`,
      (parsedEnvironmentLog == null ? void 0 : parsedEnvironmentLog.headline) ? `- 结果摘要：${parsedEnvironmentLog.headline}` : "- 结果摘要：暂无摘要",
      (parsedEnvironmentLog == null ? void 0 : parsedEnvironmentLog.guidance) ? `- 处理建议：${parsedEnvironmentLog.guidance}` : "- 处理建议：请查看原始日志"
    ].join("\n") : "- 暂无环境修复日志";
    return [
      "# 暗黑2桌宠 环境诊断报告",
      `生成时间：${formatCompactDateTime(generatedAt)}`,
      "",
      "## 当前结论",
      `- 诊断：${environmentDiagnosis.title}`,
      `- 状态：${getDiagnosisToneLabel(environmentDiagnosis.tone)}`,
      `- 说明：${environmentDiagnosis.description}`,
      `- 依赖安装：${installedDependencies}/${dependencyChecks.length || 0}`,
      `- 文字识别：${ocrReady ? "已就绪" : "待补齐"}`,
      `- 运行环境目录：${runeTask.workingDirectory}`,
      "",
      "## 全局预检",
      globalSection,
      "",
      "## 依赖矩阵",
      dependencySection,
      "",
      "## 任务状态",
      taskSection,
      "",
      "## 最近环境时间线",
      timelineSection,
      "",
      "## 最近一次环境日志",
      latestLogSection
    ].join("\n");
  }
  async function copyEnvironmentReport() {
    await props.onCopyText(buildEnvironmentReport());
  }
  async function exportEnvironmentReport() {
    const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    await props.onExportText({
      suggestedName: `environment-diagnostic-${stamp}`,
      defaultExtension: "md",
      content: buildEnvironmentReport()
    });
  }
  function clearGemImage() {
    setGemImageDataUrl("");
    setGemPasteHint("切到“截图识别”后，截图后直接按 Ctrl+V，下一次运行会自动保存到本地。");
  }
  async function handleGemPasteZone(event) {
    event.preventDefault();
    try {
      const value = await readImageDataFromItems$1(event.clipboardData.items);
      if (!value) {
        return;
      }
      setGemImageDataUrl(value);
      setGemPasteHint("新截图已经就绪，下一次试运行或执行会自动保存并用于识别。");
    } catch {
      setGemPasteHint("截图读取失败，请重新截图后再试。");
    }
  }
  async function openLogViewer(id, title) {
    setLogBusyId(id);
    try {
      const log = await props.onGetLog(id);
      setViewer({
        id,
        title,
        path: log.path,
        content: log.content
      });
    } catch (error) {
      setViewer({
        id,
        title,
        content: getErrorMessage$2(error)
      });
    } finally {
      setLogBusyId(null);
    }
  }
  async function runTask(id, mode) {
    try {
      const response = await props.onRunTask({
        id,
        mode,
        drafts,
        gemImageDataUrl: id === "gem-cube" && drafts.gemInputMode === "scan-image" ? gemImageDataUrl : void 0
      });
      if (response.result.success) {
        if (id === "gem-cube" && gemImageDataUrl) {
          clearGemImage();
        }
        await openLogViewer(id, `${getTaskMetaText(id).title} / ${getModeLabelText(mode)}日志`);
      }
      requestPreflightRefresh();
    } catch {
      return;
    }
  }
  async function runAdmin(item, action) {
    try {
      const response = await props.onRunAdmin({
        id: item.id,
        action
      });
      if (action === "record-profile") {
        setRecordingGuide({
          taskId: item.id,
          stepIndex: Math.max(0, getReadableRecordStepsText(item.id).length - 1),
          status: response.result.success ? "success" : "error",
          detail: response.result.success ? `${getIntegrationLabel(item.id)} 坐标配置录制完成，预检会自动刷新。你现在可以查看坐标配置，或者直接试运行这条任务。` : response.result.stderr || "坐标配置录制失败，请查看日志或重新录制。",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastLine: response.result.stderr || response.result.stdout || "录制流程已结束。",
          live: true
        });
        setRecordingGuide(
          (current) => current ? {
            ...current,
            detail: response.result.success ? getRecordingSuccessSummary(item.id) : getRecordingFailureSummary(response.result.stderr || response.result.stdout),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : current
        );
        if (response.result.success) {
          scrollToTask(item.id);
        }
      }
      if (response.result.success) {
        await openLogViewer(item.id, `${getTaskMetaText(item.id).title} / ${getAdminLabelText(action)}日志`);
      }
      requestPreflightRefresh();
    } catch (error) {
      if (action === "record-profile") {
        setRecordingGuide({
          taskId: item.id,
          stepIndex: 0,
          status: "error",
          detail: getErrorMessage$2(error),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastLine: getErrorMessage$2(error),
          live: false
        });
        setRecordingGuide(
          (current) => current ? {
            ...current,
            detail: getRecordingFailureSummary(getErrorMessage$2(error)),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : current
        );
      }
      return;
    }
  }
  async function runEnvironmentAction(action) {
    try {
      const response = await props.onRunEnvironmentAction({ action });
      const nextParsedLog = parseAutomationLog(response.log.content);
      setEnvironmentLog(response.log);
      setViewer({
        title: action === "install-python-runtime" ? "环境修复 / 安装内置运行环境日志" : action === "install-python-deps" ? "环境修复 / 安装运行环境依赖日志" : "环境修复日志",
        path: response.log.path,
        content: response.log.content
      });
      appendEnvironmentTimeline({
        time: (/* @__PURE__ */ new Date()).toISOString(),
        tone: response.result.success ? "success" : "error",
        title: action === "install-python-runtime" ? "安装内置运行环境" : action === "install-python-deps" ? "安装运行环境依赖" : "执行环境修复动作",
        detail: response.result.success ? (nextParsedLog == null ? void 0 : nextParsedLog.headline) || "环境修复动作已经完成。" : (nextParsedLog == null ? void 0 : nextParsedLog.headline) || response.result.stderr || "环境修复动作执行失败。",
        meta: response.result.code !== null ? `退出码 ${response.result.code}` : "日志已写入"
      });
      requestPreflightRefresh();
    } catch {
      return;
    }
  }
  async function handleQuickFix(item, action) {
    switch (action.kind) {
      case "admin":
        if (action.adminAction) {
          if (action.adminAction === "record-profile") {
            openRecordingGuide(item);
          }
          await runAdmin(item, action.adminAction);
        }
        return;
      case "environment-action":
        if (action.environmentAction) {
          await runEnvironmentAction(action.environmentAction);
        }
        return;
      case "open-path":
        if (action.path) {
          await props.onOpenPath(action.path);
        }
        return;
      case "set-gem-mode":
        if (action.mode) {
          updateDraft("gemInputMode", action.mode);
        }
        return;
      case "set-allow-inactive":
        updateDraft("allowInactiveWindow", Boolean(action.value));
        return;
      case "set-wait": {
        const waitRepair = getWaitRepair(item.id);
        updateDraft(waitRepair.draftKey, Number(action.value ?? waitRepair.value));
        return;
      }
      case "clear-gem-path":
        updateDraft("gemImagePath", "");
        clearGemImage();
        return;
      case "refresh":
        requestPreflightRefresh();
        return;
    }
  }
  function getTaskCardTone(id) {
    if ((recordingGuide == null ? void 0 : recordingGuide.taskId) === id) {
      if (recordingGuide.status === "recording") {
        return "recording";
      }
      if (recordingGuide.status === "success") {
        return "next-step";
      }
    }
    if (props.highlightedTaskId === id) {
      return "spotlight";
    }
    return "idle";
  }
  function renderTaskLiveGuide(item) {
    const preflightTask = preflightMap.get(item.id) ?? null;
    const profileReady = preflightTask ? isTaskProfileReady(preflightTask) : false;
    const tone = getTaskCardTone(item.id);
    const currentStepLabel = recordingGuide && recordingGuide.taskId === item.id ? getReadableRecordStepsText(item.id)[Math.min(recordingGuide.stepIndex, getReadableRecordStepsText(item.id).length - 1)] : null;
    if ((recordingGuide == null ? void 0 : recordingGuide.taskId) === item.id && recordingGuide.status === "recording") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "task-live-guide recording", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "正在录制" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "这张任务卡正在录制坐标配置配置" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "当前步骤：",
            currentStepLabel ?? "等待同步",
            "。把鼠标对到目标位置后，回到录制窗口按",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: " F10" }),
            "。"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-live-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill warm", children: "录制中" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: props.busyKey !== null,
              onClick: () => setRecordingGuide((current) => current ? { ...current } : current),
              type: "button",
              children: "看顶部助手"
            }
          )
        ] })
      ] });
    }
    if ((recordingGuide == null ? void 0 : recordingGuide.taskId) === item.id && recordingGuide.status === "success") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "task-live-guide success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "下一步" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "坐标配置已录好，直接试运行这条线" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: getRecordingSuccessSummary(item.id) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-live-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              disabled: props.busyKey !== null,
              onClick: () => void runTask(item.id, "dry-run"),
              type: "button",
              children: "立即试运行"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: props.busyKey !== null,
              onClick: () => void runAdmin(item, "print-profile"),
              type: "button",
              children: "查看坐标配置"
            }
          )
        ] })
      ] });
    }
    if ((recordingGuide == null ? void 0 : recordingGuide.taskId) === item.id && recordingGuide.status === "error") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "task-live-guide error", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "建议重录" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "这条任务线刚刚录制失败了" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: recordingGuide.detail })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-live-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              disabled: props.busyKey !== null,
              onClick: () => {
                openRecordingGuide(item);
                void runAdmin(item, "record-profile");
              },
              type: "button",
              children: "重新录制坐标配置"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: props.busyKey !== null,
              onClick: () => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`),
              type: "button",
              children: "看失败日志"
            }
          )
        ] })
      ] });
    }
    if (props.highlightedTaskId === item.id) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `task-live-guide ${tone === "spotlight" ? "focus" : "soft"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "当前引导焦点" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: profileReady ? "这条任务线已经就绪，下一步可以直接试运行" : "这条任务线是当前推荐入口，先把坐标配置录好" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: profileReady ? (preflightTask == null ? void 0 : preflightTask.status) === "ready" ? "预检也已经通过了，先跑一遍试运行最稳。" : "坐标配置已经有了，但还有别的条件没补齐，先看诊断卡。" : "顺着这张卡往下点，先录制坐标配置，再试运行。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-live-actions", children: profileReady ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "primary-button",
            disabled: props.busyKey !== null,
            onClick: () => void runTask(item.id, "dry-run"),
            type: "button",
            children: "试运行这条线"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "primary-button",
            disabled: props.busyKey !== null,
            onClick: () => {
              openRecordingGuide(item);
              void runAdmin(item, "record-profile");
            },
            type: "button",
            children: "先录制坐标配置"
          }
        ) })
      ] });
    }
    return null;
  }
  function renderRunButtons(id) {
    if (needsEmbeddedRuntime || needsDependencyInstall) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "primary-button",
          disabled: props.busyKey !== null,
          onClick: handleWorkshopFocusPrimary,
          type: "button",
          children: needsEmbeddedRuntime ? "第一步：准备运行环境" : "第一步：补齐环境依赖"
        }
      );
    }
    const task = preflightMap.get(id);
    const profileReady = task ? isTaskProfileReady(task) : false;
    if (!profileReady) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "primary-button",
          disabled: props.busyKey !== null,
          onClick: () => {
            const item = getIntegration(props.integrations, id);
            openRecordingGuide(item);
            void runAdmin(item, "record-profile");
          },
          type: "button",
          children: "第二步：录制坐标配置"
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: ["dry-run", "execute"].map((mode) => {
      const busy = props.busyKey === getBusyKey(id, mode);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: mode === "execute" ? "primary-button" : "ghost-button",
          disabled: props.busyKey !== null,
          onClick: () => void runTask(id, mode),
          type: "button",
          children: busy ? `${getModeLabelText(mode)}中...` : getModeLabelText(mode)
        },
        mode
      );
    }) });
  }
  function renderRecordingGuideCard() {
    if (!recordingGuide) {
      return null;
    }
    const item = getIntegration(props.integrations, recordingGuide.taskId);
    const steps = getReadableRecordStepsText(recordingGuide.taskId);
    const currentStep = steps[Math.min(recordingGuide.stepIndex, steps.length - 1)] ?? steps[0];
    const busy = props.busyKey === getAdminBusyKey(recordingGuide.taskId, "record-profile") || recordingGuide.status === "recording";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card recording-guide-card ${recordingGuide.status}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "录制助手" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-title", children: [
            "正在录 ",
            getIntegrationLabel(recordingGuide.taskId),
            " 坐标配置"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "secondary-text", children: [
            "录制助手会跟着控制台提示自动推进。你只需要切回游戏，把鼠标对到目标位置后按",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: " F10" }),
            "。"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${recordingGuide.live ? "success" : "warm"}`, children: recordingGuide.live ? "实时同步" : "预置步骤" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `status-pill ${recordingGuide.status === "success" ? "success" : recordingGuide.status === "error" ? "error" : "warm"}`,
              children: recordingGuide.status === "success" ? "录制完成" : recordingGuide.status === "error" ? "录制失败" : "录制中"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              onClick: () => setRecordingGuide(null),
              type: "button",
              children: "收起助手"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `recording-guide-focus ${recordingGuide.status}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "当前步骤" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: currentStep }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: recordingGuide.detail }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "recording-guide-console-line", children: [
            "最近一条录制提示：",
            recordingGuide.lastLine ?? "等待录制提示..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "helper-text", children: [
            "热键：按 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "F10" }),
            " 捕获当前位置，按 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "F12" }),
            " 提前结束录制。时间：",
            formatCompactDateTime(recordingGuide.updatedAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: busy || recordingGuide.stepIndex <= 0,
              onClick: () => setRecordingGuide(
                (current) => current ? { ...current, stepIndex: Math.max(0, current.stepIndex - 1) } : current
              ),
              type: "button",
              children: "上一步提示"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              disabled: busy || recordingGuide.stepIndex >= steps.length - 1,
              onClick: () => setRecordingGuide(
                (current) => current ? {
                  ...current,
                  stepIndex: Math.min(steps.length - 1, current.stepIndex + 1),
                  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
                } : current
              ),
              type: "button",
              children: "下一步提示"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              onClick: () => scrollToTask(recordingGuide.taskId),
              type: "button",
              children: "回到任务卡"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recording-guide-step-grid", children: steps.map((step, index) => {
        const state = index < recordingGuide.stepIndex ? "done" : index === recordingGuide.stepIndex ? "current" : "upcoming";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "article",
          {
            className: `recording-guide-step ${state}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                "步骤 ",
                index + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: step }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: state === "done" ? "这一格已经录完了，可以继续往后走。" : state === "current" ? "把鼠标对准当前目标，回到录制窗口后按 F10。" : "先不用急，录完当前高亮步骤再继续。" })
            ]
          },
          `${recordingGuide.taskId}-${step}`
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recording-guide-footer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "helper-text", children: busy ? `录制窗口仍在运行：${getTaskMetaText(item.id).title}` : recordingGuide.status === "success" ? "坐标配置已录好。建议现在先试运行一次，确认点击点和流程都对。" : "录制已中断或失败。先看日志，再重新录一次会更稳。" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          recordingGuide.status === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              disabled: props.busyKey !== null,
              onClick: () => void runTask(item.id, "dry-run"),
              type: "button",
              children: "立即试运行"
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: props.busyKey !== null,
              onClick: () => void runAdmin(item, "print-profile"),
              type: "button",
              children: "查查看坐标配置"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: props.busyKey !== null,
              onClick: () => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`),
              type: "button",
              children: "查看日志"
            }
          )
        ] })
      ] })
    ] });
  }
  function renderAdminButtonsSmart(item) {
    const recordingState = (recordingGuide == null ? void 0 : recordingGuide.taskId) === item.id ? recordingGuide.status : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "ghost-button",
          disabled: props.busyKey !== null,
          onClick: () => void runAdmin(item, "print-profile"),
          type: "button",
          children: props.busyKey === getAdminBusyKey(item.id, "print-profile") ? "读取中..." : "查看坐标配置"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: recordingState === "recording" ? "primary-button" : "ghost-button",
          disabled: props.busyKey !== null,
          onClick: () => {
            openRecordingGuide(item);
            void runAdmin(item, "record-profile");
          },
          type: "button",
          children: props.busyKey === getAdminBusyKey(item.id, "record-profile") ? "录制中..." : recordingState === "success" || recordingState === "error" ? "重录制坐标配置" : "录制坐标配置"
        }
      ),
      item.supportsLegacyImport ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "ghost-button",
          disabled: props.busyKey !== null,
          onClick: () => void runAdmin(item, "import-legacy-config"),
          type: "button",
          children: props.busyKey === getAdminBusyKey(item.id, "import-legacy-config") ? "导入中..." : "导旧配置"
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "ghost-button",
          disabled: props.busyKey !== null || logBusyId === item.id,
          onClick: () => void openLogViewer(item.id, `${getTaskMetaText(item.id).title} / 执行日志`),
          type: "button",
          children: logBusyId === item.id ? "读取日志中..." : "看日志"
        }
      )
    ] });
  }
  function renderGlobalChecks() {
    const visibleChecks = getVisibleGlobalChecks((preflight == null ? void 0 : preflight.globalChecks) ?? []);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card preflight-banner", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "工坊预检" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "这里会实时检查运行环境、依赖包、坐标配置和当前输入条件，先扫雷再执行。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pill", children: preflightBusy ? "预检更新中" : "实时联调" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: preflightBusy || props.busyKey !== null,
              onClick: requestPreflightRefresh,
              type: "button",
              children: preflightBusy ? "刷新中..." : "立即刷新"
            }
          )
        ] })
      ] }),
      preflightError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "预检暂时失败" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: preflightError })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "preflight-grid", children: visibleChecks.map((check) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `check-chip ${getCheckToneClass(check.level)}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: check.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: check.detail })
      ] }, check.key)) })
    ] });
  }
  function renderEnvironmentStationModern() {
    var _a2;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card environment-card environment-card-${environmentDiagnosis.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "环境修复站" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "把运行环境、依赖清单、运行时包和文字识别能力收进一个地方管理。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${environmentDiagnosis.tone}`, children: getDiagnosisToneLabel(environmentDiagnosis.tone) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "environment-summary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: environmentDiagnosis.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: environmentDiagnosis.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tag-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "依赖已安装 ",
            installedDependencies,
            "/",
            dependencyChecks.length || 0
          ] }),
          ((_a2 = findGlobalCheck$1(globalChecks, "ocr-engine")) == null ? void 0 : _a2.level) === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "文字识别已就绪" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "文字识别待补齐" }),
          (environmentLog == null ? void 0 : environmentLog.path) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "最近修复日志已留存" }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "diagnosis-actions", children: environmentDiagnosis.actions.map((action, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: index === 0 ? "primary-button" : "ghost-button",
          disabled: props.busyKey !== null || action.kind === "refresh" && preflightBusy || action.kind === "environment-action" && props.busyKey === getEnvironmentBusyKey(action.environmentAction),
          onClick: () => void handleQuickFix(runeTask, action),
          type: "button",
          children: action.kind === "refresh" && preflightBusy ? "刷新中..." : action.kind === "environment-action" && props.busyKey === getEnvironmentBusyKey(action.environmentAction) ? "处理中..." : action.label
        },
        action.key
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "environment-utility-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "ghost-button",
            disabled: props.busyKey !== null || !preflight,
            onClick: () => void copyEnvironmentReport(),
            type: "button",
            children: "复制诊断报告"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "ghost-button",
            disabled: props.busyKey !== null || !preflight,
            onClick: () => void exportEnvironmentReport(),
            type: "button",
            children: "导出诊断报告"
          }
        ),
        (environmentLog == null ? void 0 : environmentLog.path) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "ghost-button",
            disabled: props.busyKey !== null,
            onClick: () => void props.onOpenPath(environmentLog.path),
            type: "button",
            children: "打开最新修复日志"
          }
        ) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "environment-detail-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "environment-dependency-grid", children: dependencyChecks.map((check) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `dependency-card ${getCheckToneClass(check.level)}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dependency-card-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: getDependencyTitle(check) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: check.level === "ok" ? "已安装" : "缺失" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: check.detail })
        ] }, check.key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card environment-timeline-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "修复时间线" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "记录最近的预检变化和环境修复动作。" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
              environmentTimeline.length,
              " 条"
            ] })
          ] }),
          environmentTimeline.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "还没有环境事件" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "等一次预检快照或环境修复动作完成后，这里就会开始留痕。" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "environment-timeline", children: environmentTimeline.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `timeline-entry ${entry.tone}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "timeline-entry-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: entry.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCompactDateTime(entry.time) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: entry.detail }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "helper-text", children: entry.meta })
          ] }, entry.id)) }),
          parsedEnvironmentLog ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "environment-log-note", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "最近一次修复怎么看" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: parsedEnvironmentLog.headline }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parsedEnvironmentLog.guidance })
          ] }) : null
        ] })
      ] })
    ] });
  }
  function renderTaskOverviewCard(item) {
    const task = preflightMap.get(item.id) ?? null;
    const topChecks = (task == null ? void 0 : task.checks.slice(0, 3)) ?? [];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `overview-card overview-card-${getTaskToneClass(task)}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overview-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "Task" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: getTaskMetaText(item.id).title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${getTaskToneClass(task)}`, children: (task == null ? void 0 : task.status) === "ready" ? "可以开跑" : (task == null ? void 0 : task.status) === "warning" ? "先看提醒" : (task == null ? void 0 : task.status) === "error" ? "先补条件" : "等待预检" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: (task == null ? void 0 : task.summary) ?? getTaskMetaText(item.id).description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tag-row", children: topChecks.length > 0 ? topChecks.map((check) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mini-pill ${getCheckToneClass(check.level)}`, children: check.label }, check.key)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "正在准备预检结果" }) })
    ] }, item.id);
  }
  function renderAdvancedDetails(item) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "tool-details", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "更多信息" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-details-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "helper-text", children: getProfileNoteText(item) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "helper-text", children: [
          "当前坐标文件：",
          item.profilePath
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "text-button",
              onClick: () => void props.onOpenPath(item.profilePath),
              type: "button",
              children: "打开坐标文件"
            }
          ),
          item.lastLogPath ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "text-button",
              onClick: () => void props.onOpenPath(item.lastLogPath),
              type: "button",
              children: "打开日志文件"
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sequence-chips", children: getReadableRecordStepsText(item.id).map((step) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: step }, step)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "helper-text", children: [
          "录制时按 ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "F10" }),
          " 捕获当前位置，按 ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "F12" }),
          " 结束录制。"
        ] })
      ] })
    ] });
  }
  function renderTaskChecks(id) {
    const task = preflightMap.get(id);
    if (!task) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "正在等待预检结果" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "输入变化后会自动刷新，不需要手动重复点检测。" })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "preflight-list", children: task.checks.map((check) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `check-item ${getCheckToneClass(check.level)}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "check-item-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: check.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: check.level === "ok" ? "正常" : check.level === "warning" ? "提醒" : "阻塞" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: check.detail })
    ] }, check.key)) });
  }
  function renderTaskDiagnosis(item, compact = false) {
    const diagnosis = buildTaskDiagnosisText(
      item,
      preflightMap.get(item.id) ?? null,
      drafts,
      Boolean(gemImageDataUrl)
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `diagnosis-card ${diagnosis.tone} ${compact ? "compact" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: diagnosis.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: diagnosis.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${diagnosis.tone}`, children: diagnosis.tone === "success" ? "已诊断" : diagnosis.tone === "error" ? "需要修复" : "建议处理" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "diagnosis-actions", children: diagnosis.actions.length > 0 ? diagnosis.actions.map((action, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: index === 0 ? "primary-button" : "ghost-button",
          disabled: props.busyKey !== null || action.kind === "refresh" && preflightBusy,
          onClick: () => void handleQuickFix(item, action),
          type: "button",
          children: action.kind === "refresh" && preflightBusy ? "刷新中..." : action.label
        },
        action.key
      )) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "helper-text", children: "当前没有可自动处理的动作，先按诊断提示检查输入和环境。" }) })
    ] });
  }
  function renderTaskFooter(item) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-line", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-dot status-${item.lastStatus ?? "idle"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getStatusTextText(item) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: item.lastMessage || "执行结果摘要会显示在这里。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "helper-text", children: getTaskHintText(item.lastMessage) })
    ] });
  }
  function renderProfileGuide() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card profile-guide-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "先录制坐标配置" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "坐标录制向导" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "secondary-text", children: [
            "先把三条任务线的坐标录好，工坊才会从“能看”变成“能跑”。录制时按 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "F10" }),
            " 捕获点位，按 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "F12" }),
            " 结束。"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `status-pill ${readyProfileCount === profileGuideSteps.length ? "success" : "warm"}`, children: [
          readyProfileCount,
          "/",
          profileGuideSteps.length,
          " 已录制"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `profile-guide-focus ${nextProfileStep ? "attention" : "success"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "下一步" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: nextProfileStep ? `先录 ${getIntegrationLabel(nextProfileStep.id)} 坐标配置` : "三条坐标配置都已经就绪" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: nextProfileStep ? `${nextProfileStep.detail} 录完后我会自动刷新预检，并把最新日志显示出来。` : "现在已经可以直接试运行三条任务线了，建议先从符文或金币开始。" })
        ] }),
        nextProfileStep ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              disabled: props.busyKey !== null,
              onClick: () => {
                scrollToTask(nextProfileStep.id);
                const targetItem = getIntegration(props.integrations, nextProfileStep.id);
                openRecordingGuide(targetItem);
                void runAdmin(targetItem, "record-profile");
              },
              type: "button",
              children: props.busyKey === getAdminBusyKey(nextProfileStep.id, "record-profile") ? "录制中..." : `开始录 ${getIntegrationLabel(nextProfileStep.id)}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              disabled: props.busyKey !== null,
              onClick: () => scrollToTask(nextProfileStep.id),
              type: "button",
              children: "先定位到任务卡"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-row", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "primary-button",
            disabled: props.busyKey !== null,
            onClick: () => void runTask("rune-cube", "dry-run"),
            type: "button",
            children: "试运行符文任务"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-guide-grid", children: profileGuideSteps.map((step, index) => {
        const item = getIntegration(props.integrations, step.id);
        const task = preflightMap.get(step.id) ?? null;
        const statusLabel = step.ready ? "已录制" : task ? "待录制" : "等待读取";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "article",
          {
            className: `profile-guide-step ${step.ready ? "ready" : "pending"} ${props.highlightedTaskId === step.id ? "spotlight" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-guide-step-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                  "步骤 ",
                  index + 1
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${step.ready ? "success" : "attention"}`, children: statusLabel })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: step.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: step.summary }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "helper-text", children: step.detail }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sequence-chips compact", children: getReadableRecordStepsText(step.id).slice(0, 4).map((recordStep) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: recordStep }, recordStep)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-guide-actions", children: [
                !step.ready ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "primary-button",
                    disabled: props.busyKey !== null,
                    onClick: () => {
                      scrollToTask(step.id);
                      openRecordingGuide(item);
                      void runAdmin(item, "record-profile");
                    },
                    type: "button",
                    children: props.busyKey === getAdminBusyKey(step.id, "record-profile") ? "录制中..." : "录制坐标配置"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "ghost-button",
                    disabled: props.busyKey !== null,
                    onClick: () => void runAdmin(item, "print-profile"),
                    type: "button",
                    children: "查看坐标配置"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "ghost-button",
                    disabled: props.busyKey !== null,
                    onClick: () => scrollToTask(step.id),
                    type: "button",
                    children: "查看任务卡"
                  }
                )
              ] })
            ]
          },
          step.id
        );
      }) })
    ] });
  }
  function renderWorkshopFocusPanel() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card workshop-focus-card tone-${workshopFocus.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "当前主任务" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: workshopFocus.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: workshopFocus.detail })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${workshopFocus.tone}`, children: workshopFocus.tone === "success" ? "现在能用" : workshopFocus.tone === "error" ? "先补这一项" : "先看这一项" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "primary-button",
            disabled: props.busyKey !== null,
            onClick: handleWorkshopFocusPrimary,
            type: "button",
            children: workshopFocus.primaryLabel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: handleWorkshopFocusSecondary, type: "button", children: workshopFocus.secondaryLabel })
      ] })
    ] });
  }
  function renderTaskSwitcher() {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "workshop-task-switcher", children: taskItems.map((item) => {
      const task = preflightMap.get(item.id) ?? null;
      const tone = getTaskToneClass(task);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: `task-switch-chip ${selectedTaskId === item.id ? "active" : ""} ${tone}`,
          onClick: () => handleSelectTask(item.id),
          type: "button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: getIntegrationLabel(item.id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (task == null ? void 0 : task.status) === "ready" ? "可运行" : (task == null ? void 0 : task.status) === "warning" ? "有提醒" : (task == null ? void 0 : task.status) === "error" ? "待处理" : "待读取" })
          ]
        },
        item.id
      );
    }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "工坊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "赫拉迪姆工坊" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pill", children: "先做当前这一项" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PanelStateCard,
      {
        actions: workshopStateCard.actions,
        detail: workshopStateCard.detail,
        eyebrow: "当前状态",
        meta: workshopStateCard.meta,
        title: workshopStateCard.title,
        tone: workshopStateCard.tone
      }
    ),
    renderWorkshopFocusPanel(),
    renderTaskSwitcher(),
    renderRecordingGuideCard(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "workshop-grid workshop-grid-single", children: [
      selectedTaskId === "rune-cube" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "article",
        {
          className: `card workshop-card task-tone-${getTaskCardTone("rune-cube")} ${props.highlightedTaskId === "rune-cube" ? "spotlight" : ""}`,
          ref: runeCardRef,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "workshop-topbar", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "内置流程" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: getTaskMetaText(runeTask.id).title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: getTaskMetaText(runeTask.id).description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${getTaskToneClass(preflightMap.get(runeTask.id) ?? null)}`, children: ((_a = preflightMap.get(runeTask.id)) == null ? void 0 : _a.status) === "ready" ? "可以开跑" : ((_b = preflightMap.get(runeTask.id)) == null ? void 0 : _b.status) === "warning" ? "先看提醒" : ((_c = preflightMap.get(runeTask.id)) == null ? void 0 : _c.status) === "error" ? "先补条件" : "等待预检" })
            ] }),
            renderTaskLiveGuide(runeTask),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "task-section-label", children: "运行" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-toolbar", children: renderRunButtons("rune-cube") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "task-section-label", children: "维护" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-toolbar secondary", children: renderAdminButtonsSmart(runeTask) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "符文数量" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  onChange: (event) => updateDraft("runeCounts", event.target.value),
                  placeholder: "例如：12 6 0 0 0 0 0 0 0",
                  rows: 2,
                  value: drafts.runeCounts
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-grid", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "等待秒数" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  min: 0,
                  onChange: (event) => updateWaitSeconds("runeWaitSeconds", event.target.value),
                  type: "number",
                  value: drafts.runeWaitSeconds
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "helper-text", children: "空格分隔即可，执行前会先等几秒让你切回游戏。" }),
            renderTaskDiagnosis(runeTask),
            renderTaskChecks("rune-cube"),
            renderAdvancedDetails(runeTask),
            renderTaskFooter(runeTask)
          ]
        }
      ) : null,
      selectedTaskId === "gem-cube" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "article",
        {
          className: `card workshop-card task-tone-${getTaskCardTone("gem-cube")} ${props.highlightedTaskId === "gem-cube" ? "spotlight" : ""}`,
          ref: gemCardRef,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "workshop-topbar", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "内置流程" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: getTaskMetaText(gemTask.id).title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: getTaskMetaText(gemTask.id).description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${getTaskToneClass(preflightMap.get(gemTask.id) ?? null)}`, children: ((_d = preflightMap.get(gemTask.id)) == null ? void 0 : _d.status) === "ready" ? "可以开跑" : ((_e = preflightMap.get(gemTask.id)) == null ? void 0 : _e.status) === "warning" ? "先看提醒" : ((_f = preflightMap.get(gemTask.id)) == null ? void 0 : _f.status) === "error" ? "先补条件" : "等待预检" })
            ] }),
            renderTaskLiveGuide(gemTask),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "task-section-label", children: "运行" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-toolbar", children: renderRunButtons("gem-cube") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "task-section-label", children: "维护" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-toolbar secondary", children: renderAdminButtonsSmart(gemTask) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mode-switch", children: ["matrix", "scan-image"].map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: drafts.gemInputMode === mode ? "mode-button active" : "mode-button",
                onClick: () => updateDraft("gemInputMode", mode),
                type: "button",
                children: getInputModeLabelText(mode)
              },
              mode
            )) }),
            drafts.gemInputMode === "matrix" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "宝石矩阵" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  onChange: (event) => updateDraft("gemMatrix", event.target.value),
                  placeholder: "例如：10 5 2 0 0; 8 4 1 0 0",
                  rows: 3,
                  value: drafts.gemMatrix
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `paste-zone compact-zone ${gemImageDataUrl ? "ready" : ""}`,
                  onPaste: handleGemPasteZone,
                  tabIndex: 0,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "宝石截图粘贴区" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: gemPasteHint })
                    ] }),
                    gemImageDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "宝石截图预览", className: "paste-preview", src: gemImageDataUrl }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "paste-empty", children: "点这里后也可以直接 Ctrl+V 粘贴截图" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "或使用现有截图路径" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    onChange: (event) => updateDraft("gemImagePath", event.target.value),
                    placeholder: "例如：E:\\\\screenshots\\\\gems.png",
                    value: drafts.gemImagePath
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: clearGemImage, type: "button", children: "清空截图" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "ghost-button",
                    disabled: !drafts.gemImagePath.trim(),
                    onClick: () => void props.onOpenPath(drafts.gemImagePath),
                    type: "button",
                    children: "打开当前截图"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-grid", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "等待秒数" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  min: 0,
                  onChange: (event) => updateWaitSeconds("gemWaitSeconds", event.target.value),
                  type: "number",
                  value: drafts.gemWaitSeconds
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "helper-text", children: "矩阵适合手填库存，截图识别适合直接粘贴共享仓库截图。" }),
            renderTaskDiagnosis(gemTask),
            renderTaskChecks("gem-cube"),
            renderAdvancedDetails(gemTask),
            renderTaskFooter(gemTask)
          ]
        }
      ) : null,
      selectedTaskId === "drop-shared-gold" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "article",
        {
          className: `card workshop-card task-tone-${getTaskCardTone("drop-shared-gold")} ${props.highlightedTaskId === "drop-shared-gold" ? "spotlight" : ""}`,
          ref: goldCardRef,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "workshop-topbar", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "内置流程" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: getTaskMetaText(goldTask.id).title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: getTaskMetaText(goldTask.id).description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${getTaskToneClass(preflightMap.get(goldTask.id) ?? null)}`, children: ((_g = preflightMap.get(goldTask.id)) == null ? void 0 : _g.status) === "ready" ? "可以开跑" : ((_h = preflightMap.get(goldTask.id)) == null ? void 0 : _h.status) === "warning" ? "先看提醒" : ((_i = preflightMap.get(goldTask.id)) == null ? void 0 : _i.status) === "error" ? "先补条件" : "等待预检" })
            ] }),
            renderTaskLiveGuide(goldTask),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "task-section-label", children: "运行" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-toolbar", children: renderRunButtons("drop-shared-gold") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-section", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "task-section-label", children: "维护" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "task-toolbar secondary", children: renderAdminButtonsSmart(goldTask) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "task-grid", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "总金额" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    inputMode: "numeric",
                    onChange: (event) => updateDraft("goldAmount", event.target.value),
                    placeholder: "例如：20000000",
                    value: drafts.goldAmount
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "角色等级" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    inputMode: "numeric",
                    onChange: (event) => updateDraft("goldLevel", event.target.value),
                    placeholder: "例如：90",
                    value: drafts.goldLevel
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "等待秒数" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    min: 0,
                    onChange: (event) => updateWaitSeconds("goldWaitSeconds", event.target.value),
                    type: "number",
                    value: drafts.goldWaitSeconds
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "helper-text", children: "先输入总额和等级，试运行会先给你分批方案。" }),
            renderTaskDiagnosis(goldTask),
            renderTaskChecks("drop-shared-gold"),
            renderAdvancedDetails(goldTask),
            renderTaskFooter(goldTask)
          ]
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "card workshop-advanced-card", ref: workshopAdvancedRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "更多诊断与维护" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "环境修复、录制坐标配置向导、全局预检和详细日志都收在这里。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: showWorkshopAdvanced ? "ghost-button active" : "ghost-button",
          onClick: () => toggleWorkshopAdvanced(),
          type: "button",
          children: showWorkshopAdvanced ? "收起诊断" : "更多诊断"
        }
      )
    ] }) }),
    showWorkshopAdvanced ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      renderProfileGuide(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card safety-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "统一执行策略" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "先试运行看计划，再切回游戏执行，会更稳。" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-chip", children: "联调优先" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "checkbox-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              checked: drafts.allowInactiveWindow,
              onChange: (event) => updateDraft("allowInactiveWindow", event.target.checked),
              type: "checkbox"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "允许在游戏窗口未置顶时继续点击" })
        ] })
      ] }),
      renderEnvironmentStationModern(),
      renderGlobalChecks(),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overview-grid", children: [runeTask, gemTask, goldTask].map((item) => renderTaskOverviewCard(item)) })
    ] }) : null,
    viewer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card log-viewer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: viewer.title }),
          viewer.path ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: viewer.path }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
          viewer.path ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "ghost-button",
              onClick: () => void props.onOpenPath(viewer.path),
              type: "button",
              children: "打开文件"
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: () => setViewer(null), type: "button", children: "关闭" })
        ] })
      ] }),
      parsedViewerLog ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        viewerIntegration ? renderTaskDiagnosis(viewerIntegration, true) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "log-summary-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `log-stat-card ${getLogToneClass(parsedViewerLog.success)}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "结果" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: getLogResultLabel(parsedViewerLog.success) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: parsedViewerLog.headline })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "log-stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "任务" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: getParsedTaskLabel(parsedViewerLog.task) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: getActionSummaryLabel(parsedViewerLog.action) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "log-stat-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "退出码" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: parsedViewerLog.exitCode || "无" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: parsedViewerLog.time ? `执行于 ${formatCompactDateTime(parsedViewerLog.time)}` : "日志里没有时间戳" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card log-insight-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "这次怎么看" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: parsedViewerLog.guidance }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tag-row", children: [
            parsedViewerLog.command ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "命令已记录" }) : null,
            parsedViewerLog.stdoutPreview.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
              "标准输出 ",
              parsedViewerLog.stdoutPreview.length,
              " 条摘要"
            ] }) : null,
            parsedViewerLog.stderrPreview.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
              "标准错误 ",
              parsedViewerLog.stderrPreview.length,
              " 条摘要"
            ] }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "log-section-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "标准输出摘要" }),
            parsedViewerLog.stdoutPreview.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "没有关键标准输出" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "这次标准输出没有留下有效摘要。" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stack compact", children: parsedViewerLog.stdoutPreview.map((line, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "highlight-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                index + 1,
                ". 输出片段"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: line })
            ] }, `${index}-${line}`)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "标准错误摘要" }),
            parsedViewerLog.stderrPreview.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "没有标准错误提醒" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "这次标准错误里没有发现关键报错。" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stack compact", children: parsedViewerLog.stderrPreview.map((line, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "highlight-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                index + 1,
                ". 错误片段"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: line })
            ] }, `${index}-${line}`)) })
          ] })
        ] }),
        parsedViewerLog.command ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "执行命令" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "code-view compact-code", children: parsedViewerLog.command })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "tool-details", open: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "原始日志" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tool-details-content", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "code-view", children: viewer.content }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "code-view", children: viewer.content })
    ] }) : null
  ] });
}
const routePresets = ["混沌避难所", "牛场", "巴尔", "远古通道", "恐怖地带"];
function getLatestRunText(recentRuns) {
  if (recentRuns.length === 0) {
    return "今天还没有完成的刷图记录。";
  }
  return `${recentRuns[0].mapName} · ${formatDuration(recentRuns[0].durationSeconds)}`;
}
function getTopRouteText(stats) {
  const topRoute = stats.mapBreakdown[0];
  if (!topRoute) {
    return "还没形成主刷路线";
  }
  return `${topRoute.mapName} · ${topRoute.count} 次`;
}
function getLatestDropText(recentDrops) {
  const latestDrop = recentDrops[0];
  if (!latestDrop) {
    return "等你贴上今天的第一张战利品截图";
  }
  return latestDrop.mapName ? `${latestDrop.itemName} · ${latestDrop.mapName}` : latestDrop.itemName;
}
function buildReadiness(preflight, setupGuideCompleted, activeRun, recentRuns, recentDrops) {
  const tasks = (preflight == null ? void 0 : preflight.tasks) ?? [];
  const allTasksReady = tasks.length > 0 && tasks.every((task) => task.status === "ready");
  const environmentReady = ((preflight == null ? void 0 : preflight.globalChecks) ?? []).some(
    (check) => check.key === "python-dependencies" && check.level === "ok"
  ) && ((preflight == null ? void 0 : preflight.globalChecks) ?? []).some(
    (check) => check.key === "ocr-engine" && check.level === "ok"
  );
  return [
    {
      label: "引导",
      ready: setupGuideCompleted,
      detail: setupGuideCompleted ? "已完成首启闭环" : "还有首启步骤待补齐"
    },
    {
      label: "环境",
      ready: Boolean(environmentReady),
      detail: environmentReady ? "runtime 与 OCR 可用" : "还需要补环境条件"
    },
    {
      label: "路线",
      ready: Boolean(activeRun || recentRuns.length > 0),
      detail: activeRun ? "当前正在记录" : recentRuns.length > 0 ? "已有最近路线" : "等待第一轮开跑"
    },
    {
      label: "战报",
      ready: recentDrops.length > 0,
      detail: recentDrops.length > 0 ? "今天已经开账" : "等待首条掉落"
    },
    {
      label: "工坊",
      ready: allTasksReady,
      detail: allTasksReady ? "三条任务线都已就绪" : tasks.length > 0 ? "还有预检项待补" : "等待预检返回"
    }
  ];
}
function getCommandTone(items) {
  const readyCount = items.filter((item) => item.ready).length;
  if (readyCount >= 4) {
    return "success";
  }
  if (readyCount >= 2) {
    return "attention";
  }
  return "error";
}
function getLatestRunNeedingWrapUp$3(recentRuns, recentDrops) {
  const latestRun = recentRuns[0];
  if (!latestRun) {
    return null;
  }
  const runEndedAt = new Date(latestRun.endedAt).getTime();
  const hasFollowupDrop = recentDrops.some(
    (drop) => new Date(drop.createdAt).getTime() >= runEndedAt - 9e4
  );
  return hasFollowupDrop ? null : latestRun;
}
function CounterPanel(props) {
  var _a, _b, _c;
  const [mapName, setMapName] = reactExports.useState(((_a = props.activeRun) == null ? void 0 : _a.mapName) ?? "混沌避难所");
  const [pulseIndex, setPulseIndex] = reactExports.useState(0);
  const [showAdvancedCompanion, setShowAdvancedCompanion] = reactExports.useState(false);
  const advancedCardRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (props.activeRun) {
      setMapName(props.activeRun.mapName);
    }
  }, [props.activeRun]);
  function toggleAdvancedCompanion(nextExpanded = !showAdvancedCompanion) {
    var _a2;
    setShowAdvancedCompanion(nextExpanded);
    (_a2 = props.onSurfaceNotice) == null ? void 0 : _a2.call(props, {
      tone: nextExpanded ? "attention" : "success",
      title: nextExpanded ? "今日详细面板已展开" : "今日详细面板已收起",
      detail: nextExpanded ? "就绪度、地图分布和更多快捷入口已经放到下方，继续往下看就行。" : "首页已经回到精简模式，只保留当前动作、上次中断点和当前狩猎状态。"
    });
    window.requestAnimationFrame(() => {
      var _a3;
      (_a3 = advancedCardRef.current) == null ? void 0 : _a3.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const readinessItems = reactExports.useMemo(
    () => buildReadiness(
      props.preflight,
      props.setupGuideCompleted,
      props.activeRun,
      props.recentRuns,
      props.recentDrops
    ),
    [
      props.activeRun,
      props.preflight,
      props.recentDrops,
      props.recentRuns,
      props.setupGuideCompleted
    ]
  );
  const readinessReadyCount = readinessItems.filter((item) => item.ready).length;
  const readinessTone = getCommandTone(readinessItems);
  const topRouteText = getTopRouteText(props.stats);
  const latestDropText = getLatestDropText(props.recentDrops);
  const latestRunText = getLatestRunText(props.recentRuns);
  !props.setupGuideCompleted;
  const preflightTasks = ((_b = props.preflight) == null ? void 0 : _b.tasks) ?? [];
  const blockingTask = preflightTasks.find((task) => task.status === "error");
  const warningTask = preflightTasks.find((task) => task.status === "warning");
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp$3(
    props.recentRuns,
    props.recentDrops
  );
  reactExports.useMemo(() => {
    if (props.activeRun) {
      return {
        badge: "当前动作",
        title: `正在记录 ${props.activeRun.mapName}`,
        detail: "刷完回来点完成，再去战报记掉落。",
        label: props.busy ? "结算中..." : "完成这一轮",
        kind: "primary",
        onClick: () => void props.onStopRun()
      };
    }
    if (!props.setupGuideCompleted) {
      return {
        badge: props.setupGuideHint.badge,
        title: props.setupGuideHint.title,
        detail: props.setupGuideHint.detail,
        label: props.setupGuideHint.actionLabel,
        kind: "primary",
        onClick: props.onFollowSetupGuideHint
      };
    }
    if (blockingTask) {
      return {
        badge: "当前待办",
        title: "先补工坊阻塞项",
        detail: `${blockingTask.summary}。先补这一项。`,
        label: "去工坊处理",
        kind: "primary",
        onClick: props.onGoToWorkshop
      };
    }
    if (warningTask) {
      return {
        badge: "当前待办",
        title: "工坊有提醒",
        detail: `${warningTask.summary}。先看一下就行。`,
        label: "看工坊提醒",
        kind: "secondary",
        onClick: props.onGoToWorkshop
      };
    }
    if (props.recentRuns.length > 0 && props.recentDrops.length === 0) {
      return {
        badge: "今日待办",
        title: "先记第一条掉落",
        detail: "记完这条，战报和首页才会完整。",
        label: "去记录掉落",
        kind: "primary",
        onClick: props.onGoToDrops
      };
    }
    if (props.recentRuns.length > 0) {
      const latestRoute = props.recentRuns[0].mapName;
      return {
        badge: "一键继续",
        title: `继续 ${latestRoute}`,
        detail: "直接沿用上一条路线最省事。",
        label: props.busy ? "启动中..." : `继续 ${latestRoute}`,
        kind: "primary",
        onClick: () => void props.onStartRun(latestRoute)
      };
    }
    return {
      badge: "一键开局",
      title: "开始今天第一轮",
      detail: "先开一轮熟图，后面数据才会热起来。",
      label: props.busy ? "启动中..." : `开始 ${mapName.trim() || "混沌避难所"}`,
      kind: "primary",
      onClick: () => void props.onStartRun(mapName.trim() || "混沌避难所")
    };
  }, [
    blockingTask,
    mapName,
    props.activeRun,
    props.busy,
    props.onFollowSetupGuideHint,
    props.onGoToDrops,
    props.onGoToWorkshop,
    props.onOpenSetupGuide,
    props.onStartRun,
    props.onStopRun,
    props.recentDrops.length,
    props.recentRuns,
    props.setupGuideHint,
    props.setupGuideCompleted,
    warningTask
  ]);
  reactExports.useMemo(
    () => ({
      label: showAdvancedCompanion ? "收起详情" : "今日详情",
      onClick: () => toggleAdvancedCompanion()
    }),
    [showAdvancedCompanion]
  );
  const huntSecondaryAction = reactExports.useMemo(() => {
    if (!props.setupGuideCompleted) {
      return {
        label: props.setupGuideHint.actionLabel,
        onClick: props.onFollowSetupGuideHint
      };
    }
    if (blockingTask || warningTask) {
      return {
        label: "打开工坊",
        onClick: props.onGoToWorkshop
      };
    }
    if (props.activeRun || props.recentRuns.length > 0) {
      return {
        label: "去记掉落",
        onClick: props.onGoToDrops
      };
    }
    return {
      label: "打开工坊",
      onClick: props.onGoToWorkshop
    };
  }, [
    blockingTask,
    props.activeRun,
    props.onFollowSetupGuideHint,
    props.onGoToDrops,
    props.onGoToWorkshop,
    props.recentRuns.length,
    props.setupGuideCompleted,
    props.setupGuideHint.actionLabel,
    warningTask
  ]);
  const recoveryState = reactExports.useMemo(() => {
    if (props.activeRun) {
      return {
        badge: "正在陪刷",
        title: `当前停在 ${props.activeRun.mapName}`,
        detail: "刷完回来点完成，再去战报记掉落。",
        meta: `当前计时 ${props.activeDurationText}`,
        actions: [
          {
            label: props.busy ? "结算中..." : "完成这一轮",
            kind: "primary",
            onClick: () => void props.onStopRun()
          },
          {
            label: "打开战报",
            kind: "secondary",
            onClick: props.onGoToDrops
          }
        ]
      };
    }
    if (!props.setupGuideCompleted) {
      return {
        badge: props.setupGuideHint.badge,
        title: props.setupGuideHint.title,
        detail: `先做完这一步，首页就会回到日常模式。`,
        meta: "引导完成后，首页会自动切回纯日常模式。",
        actions: [
          {
            label: props.setupGuideHint.actionLabel,
            kind: "primary",
            onClick: props.onFollowSetupGuideHint
          },
          {
            label: "先看工坊",
            kind: "secondary",
            onClick: props.onGoToWorkshop
          }
        ]
      };
    }
    if (latestRunNeedingWrapUp) {
      return {
        badge: "上次中断点",
        title: `${latestRunNeedingWrapUp.mapName} 还没收口`,
        detail: "先记掉落，或者直接沿用这条路线继续。",
        meta: `上次结束于 ${formatCompactDateTime(latestRunNeedingWrapUp.endedAt)} · 用时 ${formatDuration(latestRunNeedingWrapUp.durationSeconds)}`,
        actions: [
          {
            label: "先记掉落",
            kind: "primary",
            onClick: props.onGoToDrops
          },
          {
            label: `继续 ${latestRunNeedingWrapUp.mapName}`,
            kind: "secondary",
            onClick: () => void props.onStartRun(latestRunNeedingWrapUp.mapName)
          }
        ]
      };
    }
    if (props.recentRuns.length > 0) {
      const latestRun = props.recentRuns[0];
      return {
        badge: "上次中断点",
        title: `继续 ${latestRun.mapName}`,
        detail: "上一轮已经收口，直接沿用这条路线最顺。",
        meta: `最近一次完成于 ${formatCompactDateTime(latestRun.endedAt)} · 用时 ${formatDuration(latestRun.durationSeconds)}`,
        actions: [
          {
            label: props.busy ? "启动中..." : `继续 ${latestRun.mapName}`,
            kind: "primary",
            onClick: () => void props.onStartRun(latestRun.mapName)
          },
          {
            label: "看今日战报",
            kind: "secondary",
            onClick: props.onGoToDrops
          }
        ]
      };
    }
    return {
      badge: "今日开局",
      title: "先开一轮熟图",
      detail: "开局后首页和战报就会开始记录。",
      meta: "建议先选一条最熟的路线做热身。",
      actions: [
        {
          label: props.busy ? "启动中..." : `开始 ${mapName.trim() || "混沌避难所"}`,
          kind: "primary",
          onClick: () => void props.onStartRun(mapName.trim() || "混沌避难所")
        },
        {
          label: "先看工坊",
          kind: "secondary",
          onClick: props.onGoToWorkshop
        }
      ]
    };
  }, [
    latestRunNeedingWrapUp,
    mapName,
    props.activeDurationText,
    props.activeRun,
    props.busy,
    props.onFollowSetupGuideHint,
    props.onGoToDrops,
    props.onGoToWorkshop,
    props.onOpenSetupGuide,
    props.onStartRun,
    props.onStopRun,
    props.recentRuns,
    props.setupGuideHint,
    props.setupGuideCompleted
  ]);
  const pulseItems = reactExports.useMemo(() => {
    const workshopValue = props.preflightBusy ? "预检刷新中" : blockingTask ? "还有阻塞项" : warningTask ? "还有提醒项" : props.preflight ? "今天可联调" : "等待首轮预检";
    return [
      {
        id: "count",
        label: "今日总次数",
        value: `${props.stats.totalCount} 轮`,
        detail: props.stats.totalCount > 0 ? `总耗时 ${formatDuration(props.stats.totalDurationSeconds)}，平均单次 ${formatDuration(props.stats.averageDurationSeconds)}。` : "今天还没开刷，先起第一轮，战况脉冲就会亮起来。"
      },
      {
        id: "route",
        label: "主刷路线",
        value: topRouteText,
        detail: props.stats.mapBreakdown[0] ? `当前最热的是 ${props.stats.mapBreakdown[0].mapName}，平均 ${formatDuration(props.stats.mapBreakdown[0].averageDurationSeconds)} 一轮。` : "还没形成主刷路线，桌宠会在你完成几轮后自动归纳。"
      },
      {
        id: "loot",
        label: "最近战果",
        value: latestDropText,
        detail: props.recentDrops.length > 0 ? "最近这条战利品会挂在首页前排，方便你随时回看今天的战果温度。" : "先去战报页贴一张截图，首页就会开始出现真正的战果脉冲。"
      },
      {
        id: "workshop",
        label: "工坊状态",
        value: workshopValue,
        detail: blockingTask ? `${blockingTask.summary}。先补齐它，再跑自动化会稳得多。` : warningTask ? `${warningTask.summary}。你可以先看一眼，再决定是不是现在就开跑。` : "今天的自动化联调条件已经收得比较齐了，需要时可以随时切去工坊。"
      }
    ];
  }, [
    blockingTask,
    latestDropText,
    props.preflight,
    props.preflightBusy,
    props.recentDrops.length,
    props.stats.averageDurationSeconds,
    props.stats.mapBreakdown,
    props.stats.totalCount,
    props.stats.totalDurationSeconds,
    topRouteText,
    warningTask
  ]);
  reactExports.useEffect(() => {
    setPulseIndex(0);
  }, [pulseItems.length, (_c = props.activeRun) == null ? void 0 : _c.id, props.recentDrops.length, props.stats.totalCount]);
  reactExports.useEffect(() => {
    if (pulseItems.length <= 1) {
      return void 0;
    }
    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % pulseItems.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [pulseItems]);
  const activePulse = pulseItems[pulseIndex] ?? pulseItems[0];
  reactExports.useMemo(() => {
    const pending = readinessItems.filter((item) => !item.ready).slice(0, 2);
    if (pending.length === 0) {
      return [
        {
          title: "核心条件已经就绪",
          detail: "今天可以直接开刷、记战报，自动化联调也能随时接上。",
          tone: "success"
        },
        {
          title: "最近路线已经留下来了",
          detail: latestRunText,
          tone: "attention"
        }
      ];
    }
    return pending.map((item) => ({
      title: `${item.label} 还没收好`,
      detail: item.detail,
      tone: "attention"
    }));
  }, [latestRunText, readinessItems]);
  const companionStateCard = reactExports.useMemo(() => {
    if (props.busy) {
      return {
        tone: "attention",
        title: props.activeRun ? "正在结算" : "正在开始记录",
        detail: props.activeRun ? "本轮结束后，统计会立即刷新。" : "开始成功后，今天的数据就会动起来。",
        meta: props.activeRun ? `当前计时 ${props.activeDurationText}` : "请先等本次动作完成"
      };
    }
    if (props.preflightBusy) {
      return {
        tone: "attention",
        title: "正在刷新状态",
        detail: "我在重新读取环境、依赖和工坊预检。",
        meta: "完成后会直接告诉你还能不能开跑"
      };
    }
    if (!props.preflight) {
      return {
        tone: "attention",
        title: "还在读取可用状态",
        detail: "桌宠已经打开，预检结果还没回来。",
        meta: "稍等一下，或直接开始第一轮也可以"
      };
    }
    if (!props.setupGuideCompleted) {
      return {
        tone: "attention",
        title: props.setupGuideHint.title,
        detail: "先做完这一步，首页就会回到日常模式。",
        meta: "现在先跟着引导做就行"
      };
    }
    if (blockingTask) {
      return {
        tone: "error",
        title: "工坊有阻塞项",
        detail: `${blockingTask.summary}。建议先补这一项。`,
        meta: "不处理这条，后面的自动化会不稳"
      };
    }
    if (warningTask) {
      return {
        tone: "attention",
        title: "工坊有提醒",
        detail: `${warningTask.summary}。最好先看一下。`,
        meta: "它不会完全挡住你"
      };
    }
    if (props.activeRun) {
      return {
        tone: "success",
        title: `已开始记录 ${props.activeRun.mapName}`,
        detail: "刷完回来点完成，再去战报记掉落。",
        meta: `当前计时 ${props.activeDurationText}`
      };
    }
    if (props.stats.totalCount === 0) {
      return {
        tone: "success",
        title: "可以开始第一轮了",
        detail: "先开一轮熟图，今天的数据就会热起来。",
        meta: "建议从你最熟的路线开局"
      };
    }
    return {
      tone: "success",
      title: "今天已进入日常模式",
      detail: "现在可以继续路线、记掉落，或切去工坊。",
      meta: `今天已完成 ${props.stats.totalCount} 轮，已记录 ${props.recentDrops.length} 条掉落`
    };
  }, [
    blockingTask,
    props.activeDurationText,
    props.activeRun,
    props.busy,
    props.preflight,
    props.preflightBusy,
    props.recentDrops.length,
    props.setupGuideCompleted,
    props.setupGuideHint.detail,
    props.setupGuideHint.title,
    props.stats.totalCount,
    warningTask
  ]);
  async function handleSubmit(event) {
    event.preventDefault();
    if (props.activeRun) {
      await props.onStopRun();
      return;
    }
    await props.onStartRun(mapName.trim() || "混沌避难所");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Companion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "陪刷首页" })
      ] }),
      props.activeRun ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill warm", children: [
        "陪刷中 · ",
        props.activeDurationText
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pill", children: "待命中" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "companion-hero companion-hero-compact", style: { marginTop: "16px", marginBottom: "16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card hero-card hero-banner", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "当前狩猎状态" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "在这里开始或收口一轮刷图。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-chip", children: props.activeRun ? `进行中：${props.activeRun.mapName}` : "准备下一轮" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "stack compact", onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "地图 / 场景" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              disabled: Boolean(props.activeRun),
              onChange: (event) => setMapName(event.target.value),
              placeholder: "例如：世界之石、混沌避难所、牛场",
              value: mapName
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "preset-strip", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "preset-label", children: "常用路线" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tag-row", children: routePresets.map((preset) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: mapName === preset ? "preset-button active" : "preset-button",
              disabled: Boolean(props.activeRun),
              onClick: () => setMapName(preset),
              type: "button",
              children: preset
            },
            preset
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-actions", style: { marginTop: "8px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              disabled: props.busy,
              type: "submit",
              style: { padding: "12px 32px", fontSize: "1.1rem", fontWeight: "bold" },
              children: props.busy ? props.activeRun ? "正在结算..." : "正在开始..." : props.activeRun ? "完成本次刷图" : "开始记录本次刷图"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: huntSecondaryAction.onClick, type: "button", children: huntSecondaryAction.label })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PanelStateCard,
      {
        detail: companionStateCard.detail,
        eyebrow: "系统状态",
        meta: companionStateCard.meta,
        title: companionStateCard.title,
        tone: companionStateCard.tone
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "article",
      {
        className: `card companion-advanced-card ${showAdvancedCompanion ? "expanded" : ""}`,
        ref: advancedCardRef,
        style: { marginTop: "16px" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日详细面板" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "查看今日战况、战果脉冲、地图分布及工坊就绪度。" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "ghost-button",
                onClick: () => toggleAdvancedCompanion(),
                type: "button",
                children: showAdvancedCompanion ? "收起详情" : "展开详情"
              }
            )
          ] }),
          !showAdvancedCompanion ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "companion-focus-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "战果脉冲" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                activePulse.label,
                " · ",
                activePulse.value
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "今日掉落" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                props.recentDrops.length,
                " 条记录"
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "companion-command-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card command-card command-card-${readinessTone}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日就绪度" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "引导、环境、路线、战报和工坊预检都集中在这里。" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `status-pill ${readinessTone}`, children: [
                  readinessReadyCount,
                  "/",
                  readinessItems.length,
                  " 已就绪"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "readiness-grid", children: readinessItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "article",
                {
                  className: `readiness-item ${item.ready ? "ready" : "pending"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.ready ? "已就绪" : "待处理" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.detail })
                  ]
                },
                item.label
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card pulse-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日战果脉冲" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "让首页自己轮播今天最值得盯住的信号。" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill warm", children: [
                  pulseIndex + 1,
                  "/",
                  pulseItems.length
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pulse-stage", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-label", children: activePulse.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: activePulse.value }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: activePulse.detail })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pulse-mini-list", children: pulseItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "article",
                {
                  className: `pulse-mini-item ${index === pulseIndex ? "active" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.value })
                  ]
                },
                item.id
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pulse-dots", "aria-label": "battle pulse progression", children: pulseItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: index === pulseIndex ? "pulse-dot active" : "pulse-dot"
                },
                item.id
              )) })
            ] })
          ] })
        ]
      }
    ),
    showAdvancedCompanion ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "companion-recovery-grid", style: { marginTop: "16px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card recovery-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "上次中断点" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "我把你上一次停下来的位置和最顺手的续跑方式收在这里。" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-chip", children: recoveryState.badge })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recovery-stage", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: recoveryState.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: recoveryState.detail })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recovery-meta", children: recoveryState.meta }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-actions", children: recoveryState.actions.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: action.kind === "primary" ? "primary-button" : "ghost-button",
              disabled: props.busy,
              onClick: action.onClick,
              type: "button",
              children: action.label
            },
            action.label
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card hero-card warm-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日战况" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "metric-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "今日次数" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.stats.totalCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "metric-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "总耗时" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatDuration(props.stats.totalDurationSeconds) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "metric-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "平均单次" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatDuration(props.stats.averageDurationSeconds) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-grid", style: { marginTop: "16px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "地图分布" }),
          props.stats.mapBreakdown.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "今天还没有地图统计" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "开始第一轮刷图后，这里会显示各个场景的次数和平均耗时。" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-card", children: props.stats.mapBreakdown.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.mapName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                item.count,
                " 次"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "list-row-side", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatDuration(item.totalDurationSeconds) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "均值 ",
                formatDuration(item.averageDurationSeconds)
              ] })
            ] })
          ] }, item.mapName)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "最近刷图" }),
          props.recentRuns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "还没有最近刷图数据" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "完成一轮后，这里会按时间显示最近几次路线和时长。" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-card", children: props.recentRuns.map((run) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: run.mapName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCompactDateTime(run.endedAt) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-row-side", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatDuration(run.durationSeconds) }) })
          ] }, run.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card", style: { marginTop: "16px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日战果预览" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "最近掉落会先在这里出现，再决定要不要去战报页继续整理。" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pill", children: props.recentDrops.length > 0 ? `${props.recentDrops.length} 条战果` : "等待第一条掉落" })
        ] }),
        props.recentDrops.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "战果区还是空的" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "去战报页贴一张截图，桌宠就能帮你开始记账。" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-card", children: props.recentDrops.map((drop) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "list-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: drop.itemName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: drop.mapName || "未填写场景" }),
            drop.note ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "secondary-text", children: drop.note }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-row-side", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCompactDateTime(drop.createdAt) }) })
        ] }, drop.id)) })
      ] })
    ] }) : null
  ] });
}
const highRunes = /* @__PURE__ */ new Set(["vex", "ohm", "lo", "sur", "ber", "jah", "cham", "zod"]);
const highlightKeywords = [
  "无形",
  "eth",
  "4孔",
  "5孔",
  "6孔",
  "45抗",
  "技能",
  "超大护身符",
  "小护身符",
  "毁灭",
  "火炬",
  "年纪",
  "高亮",
  "极品",
  "毕业"
];
function normalizeText$1(value) {
  return (value ?? "").trim().toLowerCase();
}
function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
function containsWholeRuneWord(text) {
  const match = text.match(
    /\b(el|eld|tir|nef|eth|ith|tal|ral|ort|thul|amn|sol|shael|dol|hel|io|lum|ko|fal|lem|pul|um|mal|ist|gul|vex|ohm|lo|sur|ber|jah|cham|zod)\b/
  );
  return match ? match[1] : null;
}
function getDropCategoryLabel(category) {
  switch (category) {
    case "rune":
      return "符文";
    case "gem":
      return "宝石";
    case "charm":
      return "护身符";
    case "jewel":
      return "珠宝";
    case "key":
      return "钥匙 / 材料";
    case "base":
      return "底材";
    case "equipment":
      return "装备";
    case "other":
      return "其他";
  }
}
function classifyDropRecord(drop) {
  const text = normalizeText$1(`${drop.itemName} ${drop.note} ${drop.ocrText ?? ""}`);
  if (!text) {
    return "other";
  }
  const runeWord = containsWholeRuneWord(text);
  if (runeWord || text.includes("符文")) {
    return "rune";
  }
  if (includesAny(text, [
    "宝石",
    "完美",
    "无瑕",
    "裂开",
    "碎裂",
    "perfect",
    "flawless",
    "chipped",
    "gem"
  ])) {
    return "gem";
  }
  if (includesAny(text, ["护身符", "small charm", "grand charm", "charm"])) {
    return "charm";
  }
  if (includesAny(text, ["珠宝", "jewel"])) {
    return "jewel";
  }
  if (includesAny(text, ["钥匙", "精华", "token", "key"])) {
    return "key";
  }
  if (includesAny(text, [
    "底材",
    "无形",
    "eth",
    "socket",
    "孔",
    "统盾",
    "幻化",
    "神圣",
    "权冠",
    "巨神",
    "君主盾"
  ])) {
    return "base";
  }
  return "equipment";
}
function isHighlightedDrop(drop) {
  const text = normalizeText$1(`${drop.itemName} ${drop.note} ${drop.ocrText ?? ""}`);
  const runeWord = containsWholeRuneWord(text);
  if (runeWord && highRunes.has(runeWord)) {
    return true;
  }
  return includesAny(text, highlightKeywords);
}
function prepareDropRecords(drops) {
  return drops.map((drop) => ({
    ...drop,
    category: classifyDropRecord(drop),
    highlighted: isHighlightedDrop(drop)
  }));
}
function buildDailyDropSummary(drops) {
  const categoryCounts = {
    rune: 0,
    gem: 0,
    charm: 0,
    jewel: 0,
    key: 0,
    base: 0,
    equipment: 0,
    other: 0
  };
  const mapNames = /* @__PURE__ */ new Set();
  for (const drop of drops) {
    categoryCounts[drop.category] += 1;
    if (drop.mapName.trim()) {
      mapNames.add(drop.mapName.trim());
    }
  }
  const sortedCategories = Object.entries(categoryCounts).sort(
    (left, right) => right[1] - left[1]
  );
  const [topCategory, topCategoryCount] = sortedCategories[0] ?? [null, 0];
  const highlights = drops.filter((drop) => drop.highlighted).slice(0, 3);
  return {
    totalCount: drops.length,
    mapCount: mapNames.size,
    topCategory: topCategoryCount > 0 ? topCategory : null,
    topCategoryCount,
    highlightedCount: drops.filter((drop) => drop.highlighted).length,
    highlights,
    categoryCounts
  };
}
function buildDailySummaryLine(summary) {
  if (summary.totalCount === 0) {
    return "今天还没有记录战利品，先贴一张截图让我开始记账。";
  }
  const topCategoryText = summary.topCategory ? `${getDropCategoryLabel(summary.topCategory)} ${summary.topCategoryCount} 件` : "类别尚未形成主峰";
  return `今天共记录 ${summary.totalCount} 条掉落，覆盖 ${summary.mapCount} 个场景，当前最多的是 ${topCategoryText}。`;
}
function getCategoryOptions(preparedDrops) {
  const order = [
    "rune",
    "gem",
    "charm",
    "jewel",
    "key",
    "base",
    "equipment",
    "other"
  ];
  return order.filter(
    (category) => preparedDrops.some((drop) => drop.category === category)
  );
}
const categoryOrder = [
  "rune",
  "gem",
  "charm",
  "jewel",
  "key",
  "base",
  "equipment",
  "other"
];
function buildDropHotspots(drops) {
  const mapCounts = /* @__PURE__ */ new Map();
  for (const drop of drops) {
    const mapName = drop.mapName.trim() || "未填写场景";
    const current = mapCounts.get(mapName) ?? { count: 0, highlightedCount: 0 };
    current.count += 1;
    if (drop.highlighted) {
      current.highlightedCount += 1;
    }
    mapCounts.set(mapName, current);
  }
  return Array.from(mapCounts.entries()).map(([mapName, value]) => ({
    mapName,
    totalCount: value.count,
    highlightedCount: value.highlightedCount
  })).sort((left, right) => {
    if (right.highlightedCount !== left.highlightedCount) {
      return right.highlightedCount - left.highlightedCount;
    }
    return right.totalCount - left.totalCount;
  }).slice(0, 5);
}
function formatNoteLine(drop) {
  var _a;
  if (drop.note.trim()) {
    return drop.note.trim();
  }
  if ((_a = drop.ocrText) == null ? void 0 : _a.trim()) {
    return `OCR：${drop.ocrText.trim()}`;
  }
  return "无备注";
}
function buildDropListItem(drop) {
  return {
    title: drop.itemName,
    meta: `${getDropCategoryLabel(drop.category)} · ${drop.mapName || "未填写场景"} · ${formatCompactDateTime(drop.createdAt)}`,
    detail: formatNoteLine(drop),
    highlighted: drop.highlighted
  };
}
function buildCategoryBreakdown(summary) {
  return categoryOrder.filter((category) => summary.categoryCounts[category] > 0).map((category) => `- ${getDropCategoryLabel(category)}：${summary.categoryCounts[category]} 条`);
}
function buildDropReportMarkdown(payload) {
  const lines = [
    `# ${payload.title}`,
    "",
    `- 报表区间：${payload.periodLabel}`,
    `- 导出时间：${formatDateTime(payload.generatedAt)}`,
    `- 总掉落：${payload.summary.totalCount} 条`,
    `- 高亮战利品：${payload.summary.highlightedCount} 条`,
    `- 覆盖场景：${payload.summary.mapCount} 个`,
    `- 主类目：${payload.summary.topCategory ? `${getDropCategoryLabel(payload.summary.topCategory)} ${payload.summary.topCategoryCount} 条` : "尚未形成"}`,
    ""
  ];
  lines.push("## 类别分布", "");
  if (payload.summary.totalCount === 0) {
    lines.push("- 当前区间没有战利品记录。", "");
  } else {
    lines.push(...buildCategoryBreakdown(payload.summary), "");
  }
  lines.push("## 高亮战利品", "");
  if (payload.summary.highlights.length === 0) {
    lines.push("- 当前区间没有高亮战利品。", "");
  } else {
    payload.summary.highlights.forEach((drop, index) => {
      lines.push(
        `${index + 1}. ${drop.itemName}｜${drop.mapName || "未填写场景"}｜${formatCompactDateTime(drop.createdAt)}`
      );
      lines.push(`   ${formatNoteLine(drop)}`);
    });
    lines.push("");
  }
  lines.push("## 场景热区", "");
  if (payload.hotspots.length === 0) {
    lines.push("- 当前区间还没有形成场景热区。", "");
  } else {
    payload.hotspots.forEach((spot, index) => {
      lines.push(
        `${index + 1}. ${spot.mapName}｜${spot.totalCount} 条掉落${spot.highlightedCount > 0 ? `｜高亮 ${spot.highlightedCount}` : ""}`
      );
    });
    lines.push("");
  }
  lines.push("## 明细", "");
  if (payload.items.length === 0) {
    lines.push("- 当前区间没有战利品记录。");
  } else {
    categoryOrder.forEach((category) => {
      const items = payload.items.filter((item) => item.category === category);
      if (items.length === 0) {
        return;
      }
      lines.push(`### ${getDropCategoryLabel(category)}（${items.length}）`, "");
      for (const item of items) {
        lines.push(
          `- ${formatCompactDateTime(item.createdAt)}｜${item.itemName}｜${item.mapName || "未填写场景"}${item.highlighted ? "｜高亮" : ""}`
        );
        lines.push(`  ${formatNoteLine(item)}`);
      }
      lines.push("");
    });
  }
  return lines.join("\n").trim();
}
function buildDropReportJson(payload) {
  return JSON.stringify(
    {
      title: payload.title,
      periodLabel: payload.periodLabel,
      generatedAt: payload.generatedAt,
      summary: payload.summary,
      hotspots: payload.hotspots,
      items: payload.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        mapName: item.mapName,
        category: item.category,
        highlighted: item.highlighted,
        createdAt: item.createdAt,
        note: item.note,
        screenshotPath: item.screenshotPath,
        ocrEngine: item.ocrEngine,
        ocrItemName: item.ocrItemName
      }))
    },
    null,
    2
  );
}
function buildVisualDropReportPayload(payload, options) {
  return {
    title: payload.title,
    subtitle: options.subtitle,
    periodLabel: payload.periodLabel,
    generatedAt: payload.generatedAt,
    badge: options.badge,
    metrics: [
      { label: "总掉落", value: `${payload.summary.totalCount} 条` },
      { label: "高亮战利品", value: `${payload.summary.highlightedCount} 条` },
      { label: "覆盖场景", value: `${payload.summary.mapCount} 个` },
      {
        label: "主类目",
        value: payload.summary.topCategory ? `${getDropCategoryLabel(payload.summary.topCategory)} ${payload.summary.topCategoryCount}` : "尚未形成"
      }
    ],
    highlights: payload.summary.highlights.map((drop) => buildDropListItem(drop)),
    hotspots: payload.hotspots.map((spot) => ({
      title: spot.mapName,
      meta: `${spot.totalCount} 条掉落`,
      detail: spot.highlightedCount > 0 ? `高亮 ${spot.highlightedCount} 条` : "暂无高亮掉落",
      highlighted: spot.highlightedCount > 0
    })),
    timeline: payload.items.slice(0, options.maxTimeline).map((drop) => buildDropListItem(drop)),
    footer: options.footer
  };
}
function getRecentDayKeys(todayKey, count) {
  const [year, month, day] = todayKey.split("-").map(Number);
  const baseDate = new Date(year, (month ?? 1) - 1, day ?? 1);
  return Array.from({ length: count }, (_item, index) => {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() - index);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
    const nextDay = String(nextDate.getDate()).padStart(2, "0");
    return `${nextYear}-${nextMonth}-${nextDay}`;
  });
}
function getMonthKey(dayKey) {
  return dayKey.slice(0, 7);
}
function readImageDataFromItems(items) {
  const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
  const imageFile = imageItem == null ? void 0 : imageItem.getAsFile();
  if (!imageFile) {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("截图读取失败，请重新截图后再试。"));
    reader.readAsDataURL(imageFile);
  });
}
function getErrorMessage$1(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return "发生了未知错误。";
}
function categoryMatches(categoryFilter, category) {
  return categoryFilter === "all" || categoryFilter === category;
}
function DropPanel(props) {
  var _a;
  const [itemName, setItemName] = reactExports.useState("");
  const [mapName, setMapName] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [imageDataUrl, setImageDataUrl] = reactExports.useState("");
  const [preparedScreenshotPath, setPreparedScreenshotPath] = reactExports.useState("");
  const [ocrResult, setOcrResult] = reactExports.useState(null);
  const [ocrBusy, setOcrBusy] = reactExports.useState(false);
  const [pasteHint, setPasteHint] = reactExports.useState(
    "截图后直接按 Ctrl+V，我会自动保存图片、跑 OCR，并帮你预填一条掉落记录。"
  );
  const [searchText, setSearchText] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const [mapFilter, setMapFilter] = reactExports.useState("all");
  const [highlightOnly, setHighlightOnly] = reactExports.useState(false);
  const [exportBusyKey, setExportBusyKey] = reactExports.useState("");
  const [showAdvancedReport, setShowAdvancedReport] = reactExports.useState(false);
  const [showManualEntry, setShowManualEntry] = reactExports.useState(false);
  const advancedCardRef = reactExports.useRef(null);
  const reportFiltersRef = reactExports.useRef(null);
  const [exportNote, setExportNote] = reactExports.useState(
    "周报会导出最近 7 天，月报会导出当前自然月。归档和分享素材现在都能直接生成。"
  );
  const preparedDrops = reactExports.useMemo(() => prepareDropRecords(props.drops), [props.drops]);
  const todayDrops = reactExports.useMemo(
    () => preparedDrops.filter((drop) => drop.dayKey === props.todayKey),
    [preparedDrops, props.todayKey]
  );
  const weeklyDayKeys = reactExports.useMemo(() => new Set(getRecentDayKeys(props.todayKey, 7)), [props.todayKey]);
  const monthKey = reactExports.useMemo(() => getMonthKey(props.todayKey), [props.todayKey]);
  const weeklyDrops = reactExports.useMemo(
    () => preparedDrops.filter((drop) => weeklyDayKeys.has(drop.dayKey)),
    [preparedDrops, weeklyDayKeys]
  );
  const monthlyDrops = reactExports.useMemo(
    () => preparedDrops.filter((drop) => drop.dayKey.startsWith(monthKey)),
    [monthKey, preparedDrops]
  );
  const dailySummary = reactExports.useMemo(() => buildDailyDropSummary(todayDrops), [todayDrops]);
  const weeklySummary = reactExports.useMemo(() => buildDailyDropSummary(weeklyDrops), [weeklyDrops]);
  const monthlySummary = reactExports.useMemo(() => buildDailyDropSummary(monthlyDrops), [monthlyDrops]);
  const weeklyHotspots = reactExports.useMemo(() => buildDropHotspots(weeklyDrops), [weeklyDrops]);
  const monthlyHotspots = reactExports.useMemo(() => buildDropHotspots(monthlyDrops), [monthlyDrops]);
  const categoryOptions = reactExports.useMemo(() => getCategoryOptions(todayDrops), [todayDrops]);
  const mapOptions = reactExports.useMemo(() => {
    return Array.from(
      new Set(
        todayDrops.map((drop) => drop.mapName.trim()).filter((value) => value.length > 0)
      )
    ).sort((left, right) => left.localeCompare(right, "zh-CN"));
  }, [todayDrops]);
  const filteredDrops = reactExports.useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return todayDrops.filter((drop) => {
      const fullText = `${drop.itemName} ${drop.mapName} ${drop.note} ${drop.ocrText ?? ""}`.toLowerCase();
      return (!keyword || fullText.includes(keyword)) && categoryMatches(categoryFilter, drop.category) && (mapFilter === "all" || drop.mapName === mapFilter) && (!highlightOnly || drop.highlighted);
    });
  }, [categoryFilter, highlightOnly, mapFilter, todayDrops, searchText]);
  const groupedDrops = reactExports.useMemo(() => {
    const order = [
      "rune",
      "gem",
      "charm",
      "jewel",
      "key",
      "base",
      "equipment",
      "other"
    ];
    return order.map((category) => ({
      category,
      items: filteredDrops.filter((drop) => drop.category === category)
    })).filter((group) => group.items.length > 0);
  }, [filteredDrops]);
  const currentCategory = reactExports.useMemo(() => {
    return classifyDropRecord({
      itemName: itemName || (ocrResult == null ? void 0 : ocrResult.suggestedItemName) || "",
      note,
      ocrText: ocrResult == null ? void 0 : ocrResult.text
    });
  }, [itemName, note, ocrResult]);
  const canAdoptSuggestedItem = Boolean(ocrResult == null ? void 0 : ocrResult.suggestedItemName) && itemName !== ((ocrResult == null ? void 0 : ocrResult.suggestedItemName) ?? "");
  const canAdoptSuggestedNote = Boolean(ocrResult == null ? void 0 : ocrResult.suggestedNote) && note !== ((ocrResult == null ? void 0 : ocrResult.suggestedNote) ?? "");
  const hasDraft = Boolean(imageDataUrl || itemName.trim() || mapName.trim() || note.trim());
  const latestTodayDrop = todayDrops[0] ?? null;
  const previewDrops = (showAdvancedReport ? filteredDrops : todayDrops).slice(0, 5);
  const dropFocus = reactExports.useMemo(() => {
    if (ocrBusy) {
      return {
        tone: "attention",
        title: "正在识别截图",
        detail: "等 OCR 跑完，我会把结果回填到表单。",
        primaryLabel: "等待 OCR",
        secondaryLabel: "看详细战报"
      };
    }
    if (hasDraft) {
      return {
        tone: "attention",
        title: "当前有一条待保存",
        detail: "回到表单直接保存，或清空后重来。",
        primaryLabel: "保存这一条",
        secondaryLabel: "清空草稿"
      };
    }
    if (dailySummary.totalCount === 0) {
      return {
        tone: "attention",
        title: "先记第一条掉落",
        detail: "Ctrl+V 贴图或手填都行。",
        primaryLabel: "开始记录",
        secondaryLabel: "看详细战报"
      };
    }
    return {
      tone: "success",
      title: `今日已记 ${dailySummary.totalCount} 条`,
      detail: latestTodayDrop ? `最近一条是 ${latestTodayDrop.itemName}${latestTodayDrop.mapName ? ` · ${latestTodayDrop.mapName}` : ""}。` : "今天的战报已经开起来了。",
      primaryLabel: "继续记录",
      secondaryLabel: "看详细战报"
    };
  }, [dailySummary.totalCount, hasDraft, latestTodayDrop, ocrBusy]);
  const dropStateCard = reactExports.useMemo(() => {
    const hasFilters = searchText.trim().length > 0 || categoryFilter !== "all" || mapFilter !== "all" || highlightOnly;
    if (props.busy) {
      return {
        tone: "attention",
        title: "正在保存记录",
        detail: "保存后，战报会立刻刷新。",
        meta: "请先等这次写入结束"
      };
    }
    if (ocrBusy) {
      return {
        tone: "attention",
        title: "正在识别截图",
        detail: "我会先保存图片，再把建议结果回填到表单。",
        meta: "识别完成前，不用重复贴图"
      };
    }
    if (hasDraft) {
      return {
        tone: "attention",
        title: "有一条待保存",
        detail: "现在最短路径就是直接保存，或清空后重来。",
        meta: preparedScreenshotPath ? "截图已经落盘" : "还没正式写入战报"
      };
    }
    if (dailySummary.totalCount === 0) {
      return {
        tone: "attention",
        title: "今天还没开账",
        detail: "先记第一条掉落，战报页才会开始有内容。",
        meta: "第一条保存后，这页会立刻充实起来"
      };
    }
    if (hasFilters && filteredDrops.length === 0) {
      return {
        tone: "error",
        title: "当前筛选没有结果",
        detail: "不是数据丢了，是筛选条件太严了。",
        meta: `今天共有 ${todayDrops.length} 条记录，当前命中 0 条`
      };
    }
    return {
      tone: "success",
      title: "战报工作正常",
      detail: latestTodayDrop ? `最近一条是 ${latestTodayDrop.itemName}${latestTodayDrop.mapName ? ` · ${latestTodayDrop.mapName}` : ""}。` : "现在可以继续贴图，或回看最近几条。",
      meta: `今天共 ${dailySummary.totalCount} 条，其中高亮 ${dailySummary.highlightedCount} 条`
    };
  }, [
    categoryFilter,
    dailySummary.highlightedCount,
    dailySummary.totalCount,
    filteredDrops.length,
    hasDraft,
    highlightOnly,
    latestTodayDrop,
    mapFilter,
    ocrBusy,
    preparedScreenshotPath,
    props.busy,
    searchText,
    todayDrops.length
  ]);
  reactExports.useEffect(() => {
    function handlePaste(event) {
      if (!event.clipboardData) {
        return;
      }
      const hasImage = Array.from(event.clipboardData.items).some(
        (item) => item.type.startsWith("image/")
      );
      if (!hasImage) {
        return;
      }
      event.preventDefault();
      void readImageDataFromItems(event.clipboardData.items).then((value) => {
        if (!value) {
          return;
        }
        return applyPastedImage(value);
      }).catch((error) => {
        setPasteHint(getErrorMessage$1(error));
      });
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [itemName, note, ocrResult]);
  function resetDraft() {
    setItemName("");
    setMapName("");
    setNote("");
    setImageDataUrl("");
    setPreparedScreenshotPath("");
    setOcrResult(null);
    setOcrBusy(false);
    setShowManualEntry(false);
    setPasteHint("截图后直接按 Ctrl+V，我会自动保存图片、跑 OCR，并帮你预填一条掉落记录。");
  }
  async function runOcrForImage(dataUrl) {
    setOcrBusy(true);
    setPasteHint("截图已收到，正在进行 OCR 识别和战利品预判...");
    try {
      const result = await props.onPreviewOcr({
        dataUrl,
        suggestedName: itemName.trim() || "drop-ocr"
      });
      setPreparedScreenshotPath(result.imagePath);
      setOcrResult(result);
      if (result.suggestedItemName && !itemName.trim()) {
        setItemName(result.suggestedItemName);
      }
      if (result.suggestedNote && !note.trim()) {
        setNote(result.suggestedNote);
      }
      if (result.success) {
        setPasteHint(
          result.warning ? `截图已保存，OCR 已完成：${result.warning}` : "截图已保存，OCR 已完成，结果已经回填到记录表单。"
        );
      } else {
        setPasteHint(result.warning || "截图已保存，但当前环境没有可用的 OCR 引擎。");
      }
    } catch (error) {
      setPasteHint(`截图已收到，但 OCR 失败：${getErrorMessage$1(error)}`);
    } finally {
      setOcrBusy(false);
    }
  }
  async function applyPastedImage(dataUrl) {
    setImageDataUrl(dataUrl);
    await runOcrForImage(dataUrl);
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const finalItemName = itemName.trim() || (ocrResult == null ? void 0 : ocrResult.suggestedItemName) || "";
    const finalNote = note.trim() || (ocrResult == null ? void 0 : ocrResult.suggestedNote) || "";
    if (!finalItemName) {
      setPasteHint("请先填写物品名称，或先贴一张掉落截图。");
      return;
    }
    await props.onCreateDrop({
      itemName: finalItemName,
      mapName,
      note: finalNote,
      screenshotPath: preparedScreenshotPath || void 0,
      imageDataUrl: preparedScreenshotPath ? void 0 : imageDataUrl || void 0,
      ocrText: (ocrResult == null ? void 0 : ocrResult.text) || void 0,
      ocrEngine: (ocrResult == null ? void 0 : ocrResult.engine) || void 0,
      ocrItemName: (ocrResult == null ? void 0 : ocrResult.suggestedItemName) || void 0
    });
    resetDraft();
  }
  async function handlePasteZone(event) {
    event.preventDefault();
    try {
      const value = await readImageDataFromItems(event.clipboardData.items);
      if (!value) {
        return;
      }
      await applyPastedImage(value);
    } catch (error) {
      setPasteHint(getErrorMessage$1(error));
    }
  }
  function clearFilters() {
    setSearchText("");
    setCategoryFilter("all");
    setMapFilter("all");
    setHighlightOnly(false);
  }
  function applySuggestedItem() {
    if (ocrResult == null ? void 0 : ocrResult.suggestedItemName) {
      setItemName(ocrResult.suggestedItemName);
    }
  }
  function applySuggestedNote() {
    if (ocrResult == null ? void 0 : ocrResult.suggestedNote) {
      setNote(ocrResult.suggestedNote);
    }
  }
  async function exportReport(mode) {
    const isWeekly = mode === "weekly-markdown";
    const isJson = mode === "monthly-json";
    const title = isWeekly ? "暗黑 2 桌宠助手周报" : "暗黑 2 桌宠助手月报";
    const items = isWeekly ? weeklyDrops : monthlyDrops;
    const summary = isWeekly ? weeklySummary : monthlySummary;
    const hotspots = isWeekly ? weeklyHotspots : monthlyHotspots;
    const weeklyDayRange = getRecentDayKeys(props.todayKey, 7);
    const periodLabel = isWeekly ? `${weeklyDayRange[weeklyDayRange.length - 1]} 至 ${props.todayKey}` : `${monthKey} 月`;
    setExportBusyKey(mode);
    setExportNote(
      isWeekly ? "正在整理最近 7 天的战报..." : "正在整理本月战报，明细会一并带出去。"
    );
    try {
      const content = isJson ? buildDropReportJson({
        title,
        periodLabel,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        items,
        summary,
        hotspots
      }) : buildDropReportMarkdown({
        title,
        periodLabel,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        items,
        summary,
        hotspots
      });
      const result = await props.onExportText({
        suggestedName: isWeekly ? `d2-weekly-report-${props.todayKey}` : `d2-monthly-report-${monthKey}`,
        defaultExtension: isJson ? "json" : "md",
        content
      });
      if (result.canceled) {
        setExportNote("这次取消了导出，报表内容还在这里，随时可以再导一次。");
      } else {
        setExportNote(
          isWeekly ? "周报已经导出完成，可以直接发给队友或留档。" : isJson ? "本月 JSON 已导出，适合后续统计或二次分析。" : "月报已经导出完成，适合做本月复盘。"
        );
      }
    } catch (error) {
      setExportNote(`导出失败：${getErrorMessage$1(error)}`);
    } finally {
      setExportBusyKey("");
    }
  }
  async function exportVisualReport(mode) {
    const isWeekly = mode === "weekly-png";
    const format = isWeekly ? "png" : "pdf";
    const title = isWeekly ? "暗黑 2 桌宠助手周报海报" : "暗黑 2 桌宠助手月报";
    const items = isWeekly ? weeklyDrops : monthlyDrops;
    const summary = isWeekly ? weeklySummary : monthlySummary;
    const hotspots = isWeekly ? weeklyHotspots : monthlyHotspots;
    const weeklyDayRange = getRecentDayKeys(props.todayKey, 7);
    const periodLabel = isWeekly ? `${weeklyDayRange[weeklyDayRange.length - 1]} 至 ${props.todayKey}` : `${monthKey} 月`;
    setExportBusyKey(mode);
    setExportNote(isWeekly ? "正在生成周报海报..." : "正在排版月报 PDF...");
    try {
      const report = buildVisualDropReportPayload(
        {
          title,
          periodLabel,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          items,
          summary,
          hotspots
        },
        {
          subtitle: isWeekly ? "适合发群、发队友、晒战绩的高亮战报海报" : "适合留档和复盘的月度战利品 PDF",
          badge: isWeekly ? "WEEKLY SHARE" : "MONTHLY ARCHIVE",
          footer: isWeekly ? "周报海报会优先展示高亮掉落、热区和近期关键战果。" : "月报 PDF 会保留更长的时间线，适合整月复盘和长期归档。",
          maxTimeline: isWeekly ? 8 : 18
        }
      );
      const result = await props.onExportVisual({
        suggestedName: isWeekly ? `d2-weekly-share-${props.todayKey}` : `d2-monthly-report-${monthKey}`,
        format,
        report
      });
      if (result.canceled) {
        setExportNote("这次取消了导出，当前战报内容仍然保留在页面里。");
      } else {
        setExportNote(
          isWeekly ? "周报海报已经生成，适合直接发群或留作当周战绩图。" : "月报 PDF 已经生成，适合归档和整月复盘。"
        );
      }
    } catch (error) {
      setExportNote(`导出失败：${getErrorMessage$1(error)}`);
    } finally {
      setExportBusyKey("");
    }
  }
  function handleDropFocusPrimary() {
    var _a2;
    if (ocrBusy) {
      return;
    }
    if (hasDraft) {
      const form = document.getElementById("drop-entry-form");
      if (form instanceof HTMLFormElement) {
        form.requestSubmit();
        return;
      }
    }
    const pasteZone = document.getElementById("drop-paste-zone") || document.getElementById("drop-paste-zone-main");
    pasteZone == null ? void 0 : pasteZone.focus();
    pasteZone == null ? void 0 : pasteZone.scrollIntoView({ behavior: "smooth", block: "center" });
    (_a2 = props.onSurfaceNotice) == null ? void 0 : _a2.call(props, {
      tone: "attention",
      title: "已定位到截图粘贴区",
      detail: "把截图贴到这里，OCR 和本地保存会自动接着跑。"
    });
  }
  function toggleAdvancedReport(nextExpanded = !showAdvancedReport) {
    var _a2;
    setShowAdvancedReport(nextExpanded);
    (_a2 = props.onSurfaceNotice) == null ? void 0 : _a2.call(props, {
      tone: nextExpanded ? "attention" : "success",
      title: nextExpanded ? "详细战报已展开" : "详细战报已收起",
      detail: nextExpanded ? "筛选、导出和完整明细都在下方，继续往下就能看到。" : "我把战报先收回到精简模式了，先记账、后复盘会更轻。"
    });
    window.setTimeout(() => {
      const target = nextExpanded ? reportFiltersRef.current ?? advancedCardRef.current : advancedCardRef.current;
      target == null ? void 0 : target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }
  function handleDropFocusSecondary() {
    var _a2;
    if (hasDraft) {
      resetDraft();
      (_a2 = props.onSurfaceNotice) == null ? void 0 : _a2.call(props, {
        tone: "success",
        title: "当前草稿已清空",
        detail: "表单已经重置，你可以重新贴图或手动记一条新的掉落。"
      });
      return;
    }
    toggleAdvancedReport();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Drops" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "战利品账本" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${dropFocus.tone}`, children: ocrBusy ? "OCR 识别中" : dailySummary.totalCount > 0 ? `今日 ${dailySummary.totalCount} 条` : "等待第一条" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PanelStateCard,
      {
        detail: dropStateCard.detail,
        eyebrow: "当前状态",
        meta: dropStateCard.meta,
        title: dropStateCard.title,
        tone: dropStateCard.tone
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card drop-focus-card tone-${dropFocus.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: dropFocus.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: dropFocus.detail })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tag-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "今日 ",
            dailySummary.totalCount,
            " 条"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "高亮 ",
            dailySummary.highlightedCount,
            " 条"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "场景 ",
            dailySummary.mapCount,
            " 个"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "drop-focus-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "当前主动作" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: hasDraft ? "把这条草稿存下来" : "先贴图或手填一条掉落" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "最近一条" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: latestTodayDrop ? `${latestTodayDrop.itemName}${latestTodayDrop.mapName ? ` · ${latestTodayDrop.mapName}` : ""}` : "今天还没有掉落记录" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "详细复盘" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: showAdvancedReport ? "详细战报已展开" : "周报、导出和完整明细都先收在后面" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "primary-button",
            disabled: ocrBusy,
            onClick: handleDropFocusPrimary,
            type: "button",
            children: dropFocus.primaryLabel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: handleDropFocusSecondary, type: "button", children: hasDraft ? "清空草稿" : showAdvancedReport ? "收起战报" : dropFocus.secondaryLabel }),
        (latestTodayDrop == null ? void 0 : latestTodayDrop.screenshotPath) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "text-button",
            onClick: () => void props.onOpenPath(latestTodayDrop.screenshotPath),
            type: "button",
            children: "打开最近截图"
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `report-hero ${showAdvancedReport ? "" : "report-hero-compact"}`, children: [
      showAdvancedReport ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card hero-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日战报" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: buildDailySummaryLine(dailySummary) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-chip", children: dailySummary.highlightedCount > 0 ? `高亮 ${dailySummary.highlightedCount} 条` : "等待第一条高亮" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "metric-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "今日掉落" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dailySummary.totalCount })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "metric-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "覆盖场景" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dailySummary.mapCount })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "metric-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "高亮条目" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dailySummary.highlightedCount })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "report-summary-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "类别分布" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tag-row", children: categoryOptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "secondary-text", children: "还没有足够的掉落记录来形成分布。" }) : categoryOptions.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
              getDropCategoryLabel(category),
              " ",
              dailySummary.categoryCounts[category]
            ] }, category)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "高亮速记" }),
            dailySummary.highlights.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "还没有高亮战利品" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "掉到高符、精品底材或重点物品后，这里会优先展示。" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stack compact", children: dailySummary.highlights.map((drop) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "highlight-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: drop.itemName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                getDropCategoryLabel(drop.category),
                drop.mapName ? ` · ${drop.mapName}` : ""
              ] })
            ] }, drop.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "report-pulse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "主类目：",
            dailySummary.topCategory ? `${getDropCategoryLabel(dailySummary.topCategory)} ${dailySummary.topCategoryCount} 件` : "尚未形成"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "最新高亮：",
            ((_a = dailySummary.highlights[0]) == null ? void 0 : _a.itemName) ?? "等待下一件重点掉落"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "report-trend-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "近 7 日博览" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-row compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "总掉落" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  weeklySummary.totalCount || 0,
                  " 条"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-row compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "高亮数" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  weeklySummary.highlightedCount || 0,
                  " 条"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-row compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "覆盖场景" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  weeklySummary.mapCount || 0,
                  " 个"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "场景热区榜" }),
            weeklyHotspots.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "近 7 日还没有场景热区" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "继续记录几轮掉落后，这里会显示你最近最热的地图。" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stack compact", children: weeklyHotspots.map((spot, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "highlight-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                index + 1,
                ". ",
                spot.mapName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                spot.totalCount,
                " 条掉落",
                spot.highlightedCount > 0 ? ` · 高亮 ${spot.highlightedCount}` : ""
              ] })
            ] }, spot.mapName)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "report-summary-card report-export-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title small", children: "本月归档" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-row compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "本月掉落" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  monthlySummary.totalCount || 0,
                  " 条"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-row compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "本月高亮" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  monthlySummary.highlightedCount || 0,
                  " 条"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-row compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "主类目" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: monthlySummary.topCategory ? `${getDropCategoryLabel(monthlySummary.topCategory)} ${monthlySummary.topCategoryCount}` : "尚未形成" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "helper-text", children: exportNote }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "report-export-sections", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "export-cluster", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "分享素材" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "export-tile-grid", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      className: "export-tile primary",
                      disabled: exportBusyKey !== "",
                      onClick: () => void exportVisualReport("weekly-png"),
                      type: "button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: exportBusyKey === "weekly-png" ? "生成中..." : "周报海报 PNG" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "适合直接发群，重点展示高亮掉落和热区。" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      className: "export-tile",
                      disabled: exportBusyKey !== "",
                      onClick: () => void exportVisualReport("monthly-pdf"),
                      type: "button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: exportBusyKey === "monthly-pdf" ? "生成中..." : "月报 PDF" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "适合留档和复盘，带更完整的月度时间线。" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "export-cluster", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "归档文件" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-actions report-export-actions", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "ghost-button",
                      disabled: exportBusyKey !== "",
                      onClick: () => void exportReport("weekly-markdown"),
                      type: "button",
                      children: exportBusyKey === "weekly-markdown" ? "导出中..." : "周报 Markdown"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "ghost-button",
                      disabled: exportBusyKey !== "",
                      onClick: () => void exportReport("monthly-markdown"),
                      type: "button",
                      children: exportBusyKey === "monthly-markdown" ? "导出中..." : "月报 Markdown"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "ghost-button",
                      disabled: exportBusyKey !== "",
                      onClick: () => void exportReport("monthly-json"),
                      type: "button",
                      children: exportBusyKey === "monthly-json" ? "导出中..." : "月报 JSON"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }) : null,
      !showManualEntry && !hasDraft ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "card hero-card paste-hero-card",
          id: "drop-paste-zone-main",
          style: {
            textAlign: "center",
            padding: "48px 16px",
            border: "2px dashed var(--border-color)",
            backgroundColor: "var(--surface-color)",
            cursor: "pointer",
            marginBottom: "16px"
          },
          onClick: () => {
            const pasteZone = document.getElementById("drop-paste-zone-main");
            pasteZone == null ? void 0 : pasteZone.focus();
          },
          tabIndex: 0,
          onPaste: handlePasteZone,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "3rem", opacity: 0.5, marginBottom: "16px" }, children: "📋" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", style: { fontSize: "1.5rem", marginBottom: "8px" }, children: "请在此页面直接按下 Ctrl+V" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", style: { fontSize: "1.1rem" }, children: "粘贴游戏掉落截图，自动识别物品并记账" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "text-button",
                style: { marginTop: "24px" },
                onClick: (e) => {
                  e.stopPropagation();
                  setShowManualEntry(true);
                },
                type: "button",
                children: "没有截图？点击这里手动录入"
              }
            )
          ]
        }
      ) : null,
      showManualEntry || hasDraft ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "card hero-card drop-entry-card", id: "drop-entry-form", onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: hasDraft ? "完善掉落记录" : "手动记录战利品" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: hasDraft ? "检查 OCR 结果，补充场景和备注后保存。" : "手动填写物品名称和场景。随时可按 Ctrl+V 补充截图。" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
            "当前分类建议：",
            getDropCategoryLabel(currentCategory)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tag-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: ocrBusy ? "OCR 识别中" : "可随时 Ctrl+V 粘贴截图" }),
          preparedScreenshotPath ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "截图已落盘" }) : null,
          (ocrResult == null ? void 0 : ocrResult.engine) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
            "OCR ",
            ocrResult.engine
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "物品名称" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                onChange: (event) => setItemName(event.target.value),
                placeholder: "例如：破隐法杖、乔丹之石、Ber",
                value: itemName
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "掉落场景" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                onChange: (event) => setMapName(event.target.value),
                placeholder: "例如：巴尔、牛场、A4 超市",
                value: mapName
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "备注" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              onChange: (event) => setNote(event.target.value),
              placeholder: "可选：角色、MF、层数、孔数、无形、队伍信息等",
              rows: 3,
              value: note
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `paste-zone ${imageDataUrl ? "ready" : ""}`,
            id: "drop-paste-zone",
            onPaste: handlePasteZone,
            tabIndex: 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "截图粘贴区" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: pasteHint })
              ] }),
              imageDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "截图预览", className: "paste-preview", src: imageDataUrl }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "paste-empty", children: "点这里后也可以直接 Ctrl+V 粘贴截图" })
            ]
          }
        ),
        ocrResult ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card ocr-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "OCR 识别结果" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "secondary-text", children: [
                "引擎：",
                ocrResult.engine || "unknown",
                ocrResult.warning ? ` · ${ocrResult.warning}` : ""
              ] })
            ] }),
            preparedScreenshotPath ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "text-button",
                onClick: () => void props.onOpenPath(preparedScreenshotPath),
                type: "button",
                children: "打开截图"
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ocr-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
              "建议物品：",
              ocrResult.suggestedItemName || "未识别"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
              "文本行数：",
              ocrResult.lines.length
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
              "建议分类：",
              getDropCategoryLabel(currentCategory)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ocr-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "ghost-button",
                disabled: !canAdoptSuggestedItem,
                onClick: applySuggestedItem,
                type: "button",
                children: "采用建议物品"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "ghost-button",
                disabled: !canAdoptSuggestedNote,
                onClick: applySuggestedNote,
                type: "button",
                children: "采用建议备注"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "ghost-button",
                disabled: ocrBusy || !imageDataUrl,
                onClick: () => void runOcrForImage(imageDataUrl),
                type: "button",
                children: "重新识别"
              }
            )
          ] }),
          ocrResult.suggestedNote ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "helper-text", children: [
            "建议备注：",
            ocrResult.suggestedNote
          ] }) : null,
          ocrResult.text ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "ocr-preview", children: ocrResult.text }) : null
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", disabled: props.busy || ocrBusy, type: "submit", children: props.busy ? "保存中..." : "保存战利品记录" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: resetDraft, type: "button", children: "清空草稿" })
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card drop-preview-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "最近几条" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: showAdvancedReport ? "这里显示当前筛选后的前 5 条，适合快速确认今天的记录有没有记对。" : "先看今天最新的几条掉落，不用一上来就翻完整战报。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
          previewDrops.length,
          " 条预览"
        ] })
      ] }),
      previewDrops.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "现在还没有可预览的记录" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "先保存一条掉落，或者展开详细战报调整筛选条件。" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-card", children: previewDrops.map((drop) => renderDropRow(drop, props.onOpenPath)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "article",
      {
        className: `card drop-advanced-card ${showAdvancedReport ? "expanded" : ""}`,
        ref: advancedCardRef,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "详细战报" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "筛选、导出、周报和完整明细都收在这里，先记账，再复盘。" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "ghost-button",
                onClick: () => toggleAdvancedReport(),
                type: "button",
                children: showAdvancedReport ? "收起战报" : "详细战报"
              }
            )
          ] }),
          !showAdvancedReport ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "drop-advanced-summary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "今日摘要" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: buildDailySummaryLine(dailySummary) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "近 7 天热区" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: weeklyHotspots[0] ? `${weeklyHotspots[0].mapName} · ${weeklyHotspots[0].totalCount} 条` : "还没有形成热区" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "导出入口" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "周报海报、月报 PDF 和 Markdown/JSON 归档都已经准备好了。" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "现在已经展开完整战报，你可以筛选今天的记录、导出周报，或者逐条回看截图。" })
        ]
      }
    ),
    showAdvancedReport ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card", ref: reportFiltersRef, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "战报筛选" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "按关键词、类别、场景和高亮状态快速回看今天的战果。" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill", children: [
            "当前结果 ",
            filteredDrops.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filter-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "关键词" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                onChange: (event) => setSearchText(event.target.value),
                placeholder: "搜索物品名、备注或 OCR 文本",
                value: searchText
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "类别" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                onChange: (event) => setCategoryFilter(event.target.value),
                value: categoryFilter,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "全部类别" }),
                  categoryOptions.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category, children: getDropCategoryLabel(category) }, category))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "场景" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { onChange: (event) => setMapFilter(event.target.value), value: mapFilter, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "全部场景" }),
              mapOptions.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: value }, value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filter-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "checkbox-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                checked: highlightOnly,
                onChange: (event) => setHighlightOnly(event.target.checked),
                type: "checkbox"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "只看高亮战利品" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-button", onClick: clearFilters, type: "button", children: "清空筛选" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: "今日战报明细" }),
        groupedDrops.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "当前筛选下还没有内容" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "你可以清空筛选，或者先贴一张截图开始记账。" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stack", children: groupedDrops.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "report-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "report-group-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: getDropCategoryLabel(group.category) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              group.items.length,
              " 条"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-card", children: group.items.map((drop) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "report-title-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: drop.itemName }),
                drop.highlighted ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill mini-pill-highlight", children: "高亮" }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                drop.mapName || "未填写场景",
                " · ",
                formatCompactDateTime(drop.createdAt)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tag-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: getDropCategoryLabel(drop.category) }),
                drop.ocrEngine ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                  "OCR ",
                  drop.ocrEngine
                ] }) : null,
                drop.screenshotPath ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "有截图" }) : null
              ] }),
              drop.note ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "secondary-text", children: drop.note }) : drop.ocrText ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "secondary-text", children: drop.ocrText }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "list-row-side", children: drop.screenshotPath ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "text-button",
                onClick: () => void props.onOpenPath(drop.screenshotPath),
                type: "button",
                children: "打开截图"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "secondary-text", children: "无截图" }) })
          ] }, drop.id)) })
        ] }, group.category)) })
      ] })
    ] }) : null
  ] });
}
function getLatestRunNeedingWrapUp$2(recentRuns, recentDrops) {
  const latestRun = recentRuns[0];
  if (!latestRun) {
    return null;
  }
  const runEndedAt = new Date(latestRun.endedAt).getTime();
  const hasFollowupDrop = recentDrops.some(
    (drop) => new Date(drop.createdAt).getTime() >= runEndedAt - 9e4
  );
  return hasFollowupDrop ? null : latestRun;
}
function makeInteractionId() {
  return Date.now() + Math.floor(Math.random() * 1e4);
}
function pickRandom$2(items) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}
function createPetInteractionCue(kind, input) {
  var _a;
  const tasks = ((_a = input.preflight) == null ? void 0 : _a.tasks) ?? [];
  const blockingTask = tasks.find((task) => task.status === "error");
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp$2(
    input.recentRuns,
    input.recentDrops
  );
  if (kind === "headpat") {
    if (input.highlightDropName) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "celebrate",
        emotionLabel: "被你夸到了",
        headline: `${input.highlightDropName} 这条真的亮`,
        statusLine: "我已经把这条高亮战果抱紧了，等你回账本里把它记漂亮。",
        scripts: [
          "这一下摸头我收到了，今天这条掉落值得多看两眼。",
          "继续刷也行，先去战报收口也行，我会把高亮留在最前面。",
          "像这种时刻，桌宠就该跟你一起得意一下。"
        ],
        durationMs: 3600
      };
    }
    if (input.activeRun) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "focused",
        emotionLabel: "收到招呼",
        headline: "我还在陪你盯这一轮",
        statusLine: `${input.activeRun.mapName} 已经刷了 ${input.liveDurationText}，你继续推图，我来记节奏。`,
        scripts: [
          "摸到我了，我就继续替你看着这轮时长和收口点。",
          "如果这一轮中途爆货，回来记一笔就行，我还在这里。",
          "专注是我的事，你只管刷图。"
        ],
        durationMs: 3200
      };
    }
    if (!input.setupGuideCompleted) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "curious",
        emotionLabel: "待完成引导",
        headline: "我在，先把引导走完",
        statusLine: "再给我一点准备时间，等环境和 Profile 补齐之后，我就能更稳地陪刷。",
        scripts: [
          "摸头这种互动我很喜欢，顺手把引导也带我走完吧。",
          "等我安家完成，悬浮态和工坊闭环都会更顺。",
          "现在先把底子打牢，后面每天上线都能直接开刷。"
        ],
        durationMs: 3400
      };
    }
    if (latestRunNeedingWrapUp) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "curious",
        emotionLabel: "等你收口",
        headline: `${latestRunNeedingWrapUp.mapName} 那轮我还记着`,
        statusLine: "上次刷完的中断点还在，先去补掉落，或者直接沿用那条路线继续都行。",
        scripts: [
          "我会把收口点守住，不会让今天的节奏断掉。",
          "你点我一下，我就提醒你最该做的下一步。",
          "这种细碎收尾很适合交给桌宠盯着。"
        ],
        durationMs: 3200
      };
    }
    return {
      id: makeInteractionId(),
      kind,
      emotion: input.todayDropCount > 0 ? "proud" : "idle",
      emotionLabel: input.todayDropCount > 0 ? "今天有战果" : "桌边待命",
      headline: "我一直都在桌边",
      statusLine: input.todayDropCount > 0 ? `今天已经收了 ${input.todayDropCount} 条战果，我会继续帮你把账本看紧。` : "先开一轮，我就能开始记路线、时长和掉落了。",
      scripts: [
        "摸头收到，今天这份陪刷状态我会继续稳稳接住。",
        "如果你只是想确认我还在，我当然在。",
        "桌宠最重要的事情，就是让你回来时上下文还在。"
      ],
      durationMs: 3e3
    };
  }
  if (kind === "cheer") {
    if (input.highlightDropName) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "celebrate",
        emotionLabel: "高亮庆祝",
        headline: `${input.highlightDropName} 值得放烟花`,
        statusLine: "这条高亮够今天整份战报提气了，记完它，首页都会更有成就感。",
        scripts: [
          "双击这一下很对味，今天的好运气我先替你喊出来。",
          "去战报写下它，这会是今天最亮的一行。",
          "像这种掉落，桌宠就该陪你一起庆祝。"
        ],
        durationMs: 4200
      };
    }
    if (input.todayDropCount > 0) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "proud",
        emotionLabel: "继续冲",
        headline: "今天已经有战果了",
        statusLine: "气势已经起来了，再多刷几轮，周报和月报都会更像一份完整战报。",
        scripts: [
          "我替你把今天的运气再往上拱一把。",
          "现在最适合沿着今天的主路线再推几轮。",
          "这声庆祝不是结束，是继续冲。"
        ],
        durationMs: 3800
      };
    }
    if (input.activeRun) {
      return {
        id: makeInteractionId(),
        kind,
        emotion: "focused",
        emotionLabel: "这轮加油",
        headline: `${input.activeRun.mapName} 这轮冲一把`,
        statusLine: "计时我盯着，情绪我也给你抬起来，回来时直接点完成本轮就行。",
        scripts: [
          "这一轮回来，说不定就能把今天的第一条高亮带回来。",
          "你专心刷，我专心把桌面的仪式感撑起来。",
          "双击已生效，今天这轮就当成好运加持。"
        ],
        durationMs: 3400
      };
    }
    return {
      id: makeInteractionId(),
      kind,
      emotion: "celebrate",
      emotionLabel: "先热个场",
      headline: "把今天的气势先拉满",
      statusLine: "第一轮还没开也没关系，先把氛围点起来，接下来更容易进入节奏。",
      scripts: [
        "QQ 宠物那种桌边陪伴感，现在就是这个味道。",
        "先给今天打一声气，等第一条掉落出来时会更有仪式感。",
        "准备好了就去开一轮，我会把今天的故事记下来。"
      ],
      durationMs: 3600
    };
  }
  const idleVariants = [
    {
      emotion: "idle",
      emotionLabel: "桌边晃一圈",
      headline: "我在桌边轻轻巡逻",
      statusLine: "刚才顺手看了一眼今天的节奏，没有新动作时我会自己小幅活动一下。",
      scripts: [
        "不用管我，我只是在桌边转一圈，确认今天的状态都还在。",
        "这种小动作会让桌宠更像一直陪着你，而不是静止控件。",
        "你回来时，我会像刚刚一直都在这里一样。"
      ],
      durationMs: 3200
    },
    {
      emotion: "curious",
      emotionLabel: "偷看战报",
      headline: "我刚翻了一眼战利品账本",
      statusLine: input.todayDropCount > 0 ? `今天已经有 ${input.todayDropCount} 条记录了，账本开始有点战报味了。` : "账本今天还挺干净，等你下一条掉落把它点亮。",
      scripts: [
        "我会偶尔自己看一眼账本，确认掉落和截图都还在。",
        "如果待会儿出货，我会第一时间把情绪切到庆祝态。",
        "桌宠闲着时也该有点小动作，而不是完全没反应。"
      ],
      durationMs: 3600
    },
    {
      emotion: "focused",
      emotionLabel: "整理符文",
      headline: "我在脑内排了一遍工坊按钮",
      statusLine: (blockingTask == null ? void 0 : blockingTask.summary) ?? "符文、宝石和金币三条线我都还记得，下次点进工坊时会更顺手。",
      scripts: [
        "工坊扁平化之后，我会一直帮你记得哪个入口最常用。",
        "闲着的时候整理一下工坊，是桌宠该做的背景工作。",
        "等你切过去时，应该能一眼看到最想点的按钮。"
      ],
      durationMs: 3400
    }
  ];
  if (latestRunNeedingWrapUp) {
    idleVariants.push({
      emotion: "curious",
      emotionLabel: "盯着收口点",
      headline: `${latestRunNeedingWrapUp.mapName} 那轮还挂着`,
      statusLine: "我刚又确认了一次中断点，想继续刷的时候可以直接沿用，不会丢上下文。",
      scripts: [
        "我会偶尔自己回头看一下上次停在哪，确保你回来就能接着刷。",
        "收口点没丢，节奏也就没丢。",
        "这类“记住你停在哪”的细节，正是桌宠该负责的事。"
      ],
      durationMs: 3600
    });
  }
  if (input.todayDropCount > 0) {
    idleVariants.push({
      emotion: "proud",
      emotionLabel: "战果回味",
      headline: "我在回味今天的高光时刻",
      statusLine: `今天已经收了 ${input.todayDropCount} 条掉落，战报看起来比刚开机时有生命力多了。`,
      scripts: [
        "这种静静回味今天战果的小动作，会让桌宠更像活的。",
        "如果再出一条高亮，我会立刻切成庆祝态。",
        "周报海报会喜欢这种有内容的一天。"
      ],
      durationMs: 3800
    });
  }
  const selected = pickRandom$2(idleVariants);
  return {
    id: makeInteractionId(),
    kind,
    ...selected
  };
}
function buildPetPersona(input) {
  var _a;
  if (input.interactionCue) {
    return {
      emotion: input.interactionCue.emotion,
      emotionLabel: input.interactionCue.emotionLabel,
      headline: input.interactionCue.headline,
      statusLine: input.interactionCue.statusLine,
      scripts: input.interactionCue.scripts
    };
  }
  const tasks = ((_a = input.preflight) == null ? void 0 : _a.tasks) ?? [];
  const blockingTask = tasks.find((task) => task.status === "error");
  const warningTask = tasks.find((task) => task.status === "warning");
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp$2(
    input.recentRuns,
    input.recentDrops
  );
  if (input.highlightDropName) {
    return {
      emotion: "celebrate",
      emotionLabel: "爆金时刻",
      headline: `${input.highlightDropName} 出现了`,
      statusLine: "刚刚那条高亮战果值得立刻收口，写进战报会特别有成就感。",
      scripts: [
        "去战报页记下来吧，这会是今天最亮的一行。",
        "我已经把这条掉落挂到最前排了。",
        "如果继续刷，今天的战果脉冲会更好看。"
      ]
    };
  }
  if (input.activeRun) {
    return {
      emotion: "focused",
      emotionLabel: "专注陪刷",
      headline: `${input.activeRun.mapName} 路 ${input.liveDurationText}`,
      statusLine: "这一轮正在计时，我会继续替你盯着节奏和收口点。",
      scripts: [
        "刷完记得回来点完成本轮，我会继续接住今天的节奏。",
        "如果中途爆货，直接去战报页收口就行。",
        "当前这条路线已经被我记成今天的主线之一了。"
      ]
    };
  }
  if (!input.setupGuideCompleted) {
    return {
      emotion: "curious",
      emotionLabel: "待完成引导",
      headline: "还差几步就能正式开用",
      statusLine: "先把环境、依赖和 Profile 补齐，我会明确告诉你下一步该点什么。",
      scripts: [
        "现在不是“安家中”这种抽象状态了，你只要照着下一步补就行。",
        "引导结束后，我会从工具面板变成真正能直接用的桌面陪刷助手。",
        "先补这一段，后面每天打开就能直接继续。"
      ]
    };
  }
  if (blockingTask) {
    return {
      emotion: "alert",
      emotionLabel: "工坊告警",
      headline: "自动化还有条件没补齐",
      statusLine: blockingTask.summary,
      scripts: [
        "先去工坊补掉阻塞项，再开自动化会稳很多。",
        "我已经替你盯住最关键的那一条了，不用自己翻日志找。",
        "今天的主流程还在，补完这一项就能无缝接回去。"
      ]
    };
  }
  if (latestRunNeedingWrapUp) {
    return {
      emotion: "curious",
      emotionLabel: "等你收口",
      headline: `${latestRunNeedingWrapUp.mapName} 那一轮刚刷完`,
      statusLine: "上一轮已经结束，但战报里还没有新的掉落记录。",
      scripts: [
        "先记掉落，或者直接沿用这条路线继续开下一轮都行。",
        "我已经帮你把中断点留在这里了，回来时不会断节奏。",
        "这种小收口最适合交给我盯着。"
      ]
    };
  }
  if (warningTask) {
    return {
      emotion: "curious",
      emotionLabel: "工坊提醒",
      headline: "今天的联调条件基本齐了",
      statusLine: warningTask.summary,
      scripts: [
        "你可以先继续刷，也可以顺手去工坊看一下提醒项。",
        "我不急着催你修，只是把风险放到你眼前。",
        "现在的整体状态已经接近可直接开跑。"
      ]
    };
  }
  if (input.todayDropCount > 0) {
    return {
      emotion: "proud",
      emotionLabel: "今天有战果",
      headline: `今天已经收了 ${input.todayDropCount} 条战果`,
      statusLine: "桌宠账本已经热起来了，继续刷会越来越像一份完整战报。",
      scripts: [
        "最近那条战利品我还记着，随时都能带你回去看。",
        "今天已经不是空账本了，气氛到位了。",
        "如果再多刷几轮，周报会变得很好看。"
      ]
    };
  }
  if (input.todayCount > 0) {
    return {
      emotion: "focused",
      emotionLabel: "节奏已起",
      headline: `今天已经刷了 ${input.todayCount} 轮`,
      statusLine: "路线节奏已经起来了，最顺手的做法就是继续沿用最近那条路线。",
      scripts: [
        "我已经记住你今天的节奏了，再开一轮会非常顺。",
        "现在切去战报或工坊，我也能把上下文接住。",
        "这种时候最适合把桌宠留在桌边盯状态。"
      ]
    };
  }
  return {
    emotion: "idle",
    emotionLabel: "桌边待命",
    headline: "我在桌面等你开刷",
    statusLine: "先开第一轮，我就能开始记录路线、时间和战果。",
    scripts: [
      "从一张熟图热身最舒服，我会把今天的节奏慢慢养起来。",
      "如果你只是想看看状态，我会一直在这里待命。",
      "我现在像一只安静蹲在桌边的小宠物，等你发出第一条指令。"
    ]
  };
}
const DAY_LABEL = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric"
});
const RARE_DROP_PATTERNS = [
  {
    accent: "高阶符文",
    keywords: [
      "jah",
      "ber",
      "sur",
      "cham",
      "zod",
      "lo rune",
      "ohm rune",
      "vex rune",
      "乔",
      "贝",
      "瑟",
      "查姆",
      "萨德"
    ],
    detail: (itemName) => `${itemName} 已经被记入高阶符文卷宗，这类掉落会长期停留在桌宠的终局收藏线里。`,
    rarity: "mythic",
    sigil: "Rune",
    chips: ["终局收藏", "高阶符文"],
    badges: ["神话级", "终局战果", "收藏墙核心"],
    storyTitle: (itemName) => `${itemName} 点亮了符文星盘`,
    storyLead: (drop) => `${drop.itemName} 来自 ${drop.mapName || "未知场景"}，这是足以把整面收藏墙推向终局阶段的掉落。`
  },
  {
    accent: "传奇暗金",
    keywords: [
      "griffon",
      "death's web",
      "death fathom",
      "tyrael",
      "coa",
      "年纪之冠",
      "格利风",
      "死亡之网",
      "死亡深度",
      "泰瑞尔"
    ],
    detail: (itemName) => `${itemName} 会被当成传奇暗金记录，桌宠会把它视作可以反复翻看的战果故事。`,
    rarity: "legend",
    sigil: "Unique",
    chips: ["传奇暗金", "陈列级"],
    badges: ["传奇级", "凯旋陈列", "战果故事"],
    storyTitle: (itemName) => `${itemName} 进入凯旋陈列厅`,
    storyLead: (drop) => `${drop.itemName} 这类掉落不会只停留在战报里，它会被当成真正的奖杯陈列进房间。`
  },
  {
    accent: "底材珍品",
    keywords: [
      "monarch",
      "archon plate",
      "sacred armor",
      "giant thresher",
      "统治者大盾",
      "君主盾",
      "执政官铠甲",
      "神圣盔甲"
    ],
    detail: (itemName) => `${itemName} 已经被收进底材珍品页，提醒你它值得继续筛选、打孔或后续制作。`,
    rarity: "artifact",
    sigil: "Base",
    chips: ["底材珍品", "后续制作"],
    badges: ["珍品级", "底材档案", "待处理"],
    storyTitle: (itemName) => `${itemName} 被挂上底材陈列架`,
    storyLead: (drop) => `${drop.itemName} 这类底材会在收藏册里保留位置，提醒你它可能对应一条后续制作路线。`
  }
];
function createPetCodexEntryId(chapterId, rawId) {
  return `${chapterId}:${rawId}`;
}
function mapHabitatState(state) {
  return state;
}
function mapRewardState(reward, rewards) {
  var _a;
  if (((_a = rewards.activeReward) == null ? void 0 : _a.id) === reward.id) {
    return "glory";
  }
  if (reward.state === "unlocked") {
    return "ready";
  }
  if (reward.state === "next") {
    return "warming";
  }
  return "locked";
}
function mapRoomState(state) {
  return state;
}
function buildSearchableText(parts) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}
function buildIllustration(monogram, title, orbitLabels) {
  return {
    monogram,
    title,
    orbitLabels: orbitLabels.slice(0, 3)
  };
}
function toDayLabel(input) {
  return DAY_LABEL.format(new Date(input));
}
function detectRareDrop(drop) {
  const text = `${drop.itemName} ${drop.note} ${drop.ocrItemName ?? ""}`.toLowerCase();
  const pattern = RARE_DROP_PATTERNS.find(
    (candidate) => candidate.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
  );
  if (!pattern) {
    return null;
  }
  return {
    accent: pattern.accent,
    detail: pattern.detail(drop.itemName),
    tone: "glory",
    rarity: pattern.rarity,
    sigil: pattern.sigil,
    chips: pattern.chips,
    badges: pattern.badges,
    storyTitle: pattern.storyTitle,
    storyLead: pattern.storyLead
  };
}
function buildRelicEntries(habitat) {
  return habitat.exhibits.map((exhibit) => {
    const stateText = exhibit.state === "glory" ? "高亮陈列" : exhibit.state === "ready" ? "稳定陈列" : exhibit.state === "warming" ? "即将点亮" : "尚未解锁";
    return {
      id: createPetCodexEntryId("relics", exhibit.id),
      chapterId: "relics",
      title: exhibit.label,
      subtitle: `${habitat.title} · ${habitat.collectionTitle}`,
      detail: exhibit.detail,
      meta: exhibit.state === "glory" ? "当前正处于高亮陈列位，会优先出现在桌宠收藏墙。" : exhibit.state === "ready" ? "已经正式点亮，可随时从收藏册回看。" : exhibit.state === "warming" ? "离正式陈列只差最后一点成长或联调进度。" : "还没有满足点亮条件，先继续陪刷和补工坊进度。",
      accent: exhibit.accent,
      categoryLabel: stateText,
      groupLabel: stateText,
      state: mapHabitatState(exhibit.state),
      rarity: exhibit.state === "glory" ? "legend" : exhibit.state === "ready" ? "artifact" : "ember",
      sigil: exhibit.state === "glory" ? "Relic" : "Wall",
      storyTitle: exhibit.state === "glory" ? `${exhibit.label} 正在收藏墙中央发亮` : `${exhibit.label} 正在进入收藏墙`,
      storyLead: `这件陈列属于 ${habitat.collectionTitle}，会和桌宠成长阶段一起改变房间气氛。`,
      chips: [habitat.crest, exhibit.accent],
      badges: [stateText, habitat.aura],
      facts: [
        { label: "所属主题", value: habitat.title },
        { label: "当前阶段", value: stateText },
        { label: "收藏线", value: habitat.collectionTitle }
      ],
      searchableText: buildSearchableText([
        exhibit.label,
        exhibit.detail,
        exhibit.accent,
        habitat.title,
        habitat.collectionTitle,
        habitat.crest,
        stateText
      ]),
      illustration: buildIllustration(
        exhibit.state === "glory" ? "RL" : "WL",
        habitat.collectionTitle,
        [habitat.crest, exhibit.accent, stateText]
      )
    };
  });
}
function buildRewardEntries(progression, rewards) {
  return rewards.rewards.map((reward) => {
    var _a;
    const stateText = reward.state === "unlocked" ? "已解锁" : reward.state === "next" ? "下一件" : "待解锁";
    return {
      id: createPetCodexEntryId("rewards", reward.id),
      chapterId: "rewards",
      title: reward.label,
      subtitle: `Lv.${reward.level} 解锁 · 当前羁绊 Lv.${progression.level}`,
      detail: reward.state === "unlocked" ? reward.bonus : reward.detail,
      meta: reward.state === "unlocked" ? "这条奖励已经影响到桌宠当前的展示和交互。" : reward.state === "next" ? "这是距离最近的一条奖励轨道，继续刷图和记账就会点亮。" : "还在后续成长线中，先让前面的奖励稳定亮起来。",
      accent: reward.shortLabel,
      categoryLabel: stateText,
      groupLabel: stateText,
      state: mapRewardState(reward, rewards),
      rarity: ((_a = rewards.activeReward) == null ? void 0 : _a.id) === reward.id ? "legend" : reward.state === "unlocked" ? "artifact" : reward.state === "next" ? "trophy" : "ember",
      sigil: reward.state === "unlocked" ? "Bond" : "Track",
      storyTitle: reward.state === "unlocked" ? `${reward.label} 已经进入当前桌宠形态` : `${reward.label} 仍在成长轨道上等待点亮`,
      storyLead: reward.state === "unlocked" ? "奖励一旦点亮，就会真正改变桌宠的房间、演出或信息结构。" : "成长线不是纯数字，它会在桌宠房间里变成具体陈列和新的交互表达。",
      chips: [`Lv.${reward.level}`, reward.shortLabel],
      badges: [stateText, reward.state === "unlocked" ? "已生效" : "成长中"],
      facts: [
        { label: "当前状态", value: stateText },
        { label: "奖励效果", value: reward.bonus },
        { label: "当前等级", value: `Lv.${progression.level}` }
      ],
      searchableText: buildSearchableText([
        reward.label,
        reward.detail,
        reward.bonus,
        reward.shortLabel,
        `lv${reward.level}`,
        stateText
      ]),
      illustration: buildIllustration(reward.shortLabel, reward.label, [
        `Lv.${reward.level}`,
        stateText,
        reward.shortLabel
      ])
    };
  });
}
function buildChamberEntries(room) {
  return room.items.map((item) => {
    const stateText = item.state === "glory" ? "主陈列" : item.state === "ready" ? "已入驻" : item.state === "warming" ? "预热中" : "未入驻";
    return {
      id: createPetCodexEntryId("chamber", item.id),
      chapterId: "chamber",
      title: item.label,
      subtitle: `${room.title} · ${item.shortLabel}`,
      detail: item.detail,
      meta: item.state === "glory" ? "这是房间里最醒目的陈列位，会跟着升级演出一起点亮。" : item.state === "ready" ? "已经是稳定陈列的一部分，会持续出现在桌宠房间里。" : item.state === "warming" ? "已经开始显影，但还没进入最终的完整形态。" : "目前仍在预留位置，等后续成长再真正入驻。",
      accent: item.shortLabel,
      categoryLabel: stateText,
      groupLabel: stateText,
      state: mapRoomState(item.state),
      rarity: item.state === "glory" ? "legend" : item.state === "ready" ? "artifact" : item.state === "warming" ? "trophy" : "ember",
      sigil: item.state === "glory" ? "Room" : "Slot",
      storyTitle: item.state === "glory" ? `${item.label} 已经成为房间的主陈列` : `${item.label} 正在慢慢进入房间布局`,
      storyLead: `这件房间陈列属于 ${room.title}，会跟着桌宠成长和陪刷节奏逐步丰富起来。`,
      chips: [room.title, item.shortLabel],
      badges: [stateText, "房间陈列"],
      facts: [
        { label: "所属房间", value: room.title },
        { label: "当前阶段", value: stateText },
        { label: "布置标签", value: item.label }
      ],
      searchableText: buildSearchableText([
        item.label,
        item.detail,
        room.title,
        item.shortLabel,
        stateText
      ]),
      illustration: buildIllustration(item.shortLabel, room.title, [
        room.title,
        item.shortLabel,
        stateText
      ])
    };
  });
}
function buildChronicleEntries(drops) {
  return drops.slice(0, 12).map((drop, index) => {
    const rare = detectRareDrop(drop);
    const hasManualNote = Boolean(drop.note.trim());
    const subtitle = drop.mapName ? `${drop.mapName} · ${formatCompactDateTime(drop.createdAt)}` : formatCompactDateTime(drop.createdAt);
    const state = (rare == null ? void 0 : rare.tone) ?? (index === 0 ? "ready" : "warming");
    const stateText = state === "glory" ? "高亮战果" : state === "ready" ? "已入编年" : "待补故事";
    return {
      id: createPetCodexEntryId("chronicle", drop.id),
      chapterId: "chronicle",
      title: drop.itemName,
      subtitle,
      detail: drop.note.trim() || (rare == null ? void 0 : rare.detail) || (drop.ocrItemName ? `OCR 曾建议记录为 ${drop.ocrItemName}。` : "这条战利品已经收入编年记录，等待你继续补充更多故事。"),
      meta: hasManualNote ? "这条记录带有你亲自补写的备注。" : drop.ocrEngine ? `由 ${drop.ocrEngine} OCR 辅助识别后入账。` : index === 0 ? "这是当前最新的一条战果记录。" : "这条记录来自历史掉落档案。",
      accent: (rare == null ? void 0 : rare.accent) ?? (index === 0 ? "最新战果" : "战利品"),
      categoryLabel: (rare == null ? void 0 : rare.accent) ?? "战利品",
      groupLabel: toDayLabel(drop.createdAt),
      state,
      rarity: (rare == null ? void 0 : rare.rarity) ?? (index === 0 ? "trophy" : "ember"),
      sigil: (rare == null ? void 0 : rare.sigil) ?? (drop.screenshotPath ? "Drop" : "Log"),
      storyTitle: (rare == null ? void 0 : rare.storyTitle(drop.itemName)) ?? `${drop.itemName} 已经被写入今日卷宗`,
      storyLead: (rare == null ? void 0 : rare.storyLead(drop)) ?? `${drop.itemName} 于 ${drop.mapName || "未知场景"} 掉落，已经被桌宠收入编年册。`,
      chips: [
        (rare == null ? void 0 : rare.accent) ?? "战利品",
        drop.mapName || "未标注地图",
        hasManualNote ? "手写备注" : drop.ocrEngine ? "OCR 入账" : "基础记录"
      ],
      badges: [...(rare == null ? void 0 : rare.badges) ?? [], stateText],
      facts: [
        { label: "掉落时间", value: formatCompactDateTime(drop.createdAt) },
        { label: "掉落场景", value: drop.mapName || "未标注地图" },
        { label: "记录来源", value: hasManualNote ? "手动补充" : drop.ocrEngine ? drop.ocrEngine : "直接记账" }
      ],
      searchableText: buildSearchableText([
        drop.itemName,
        drop.note,
        drop.mapName,
        drop.ocrItemName,
        drop.ocrText,
        rare == null ? void 0 : rare.accent,
        ...(rare == null ? void 0 : rare.badges) ?? []
      ]),
      illustration: buildIllustration(
        (rare == null ? void 0 : rare.sigil) ?? "Drop",
        drop.itemName,
        [
          drop.mapName || "未知场景",
          (rare == null ? void 0 : rare.accent) ?? "战利品",
          formatCompactDateTime(drop.createdAt)
        ]
      ),
      mapName: drop.mapName,
      capturedAt: drop.createdAt,
      note: drop.note,
      ocrText: drop.ocrText,
      ocrEngine: drop.ocrEngine,
      screenshotPath: drop.screenshotPath
    };
  });
}
function countReadyEntries(entries) {
  return entries.filter((entry) => entry.state === "glory" || entry.state === "ready").length;
}
function buildAtlasEntries(input, relicEntries, rewardEntries, chamberEntries, chronicleEntries) {
  var _a;
  const archiveEntries = [
    ...relicEntries,
    ...rewardEntries,
    ...chamberEntries,
    ...chronicleEntries
  ];
  const readyCount = countReadyEntries(archiveEntries);
  const totalCount = archiveEntries.length;
  const completionPercent = totalCount > 0 ? Math.round(readyCount / totalCount * 100) : 0;
  const rareEntries = archiveEntries.filter(
    (entry) => entry.rarity === "mythic" || entry.rarity === "legend"
  );
  const mapCounts = /* @__PURE__ */ new Map();
  input.drops.forEach((drop) => {
    const key = drop.mapName.trim();
    if (!key) {
      return;
    }
    mapCounts.set(key, (mapCounts.get(key) ?? 0) + 1);
  });
  const topMaps = Array.from(mapCounts.entries()).sort((left, right) => right[1] - left[1]).slice(0, 4);
  const uniqueMapCount = mapCounts.size;
  const rarityBands = [
    {
      label: "神话",
      count: archiveEntries.filter((entry) => entry.rarity === "mythic").length,
      rarity: "mythic"
    },
    {
      label: "传奇",
      count: archiveEntries.filter((entry) => entry.rarity === "legend").length,
      rarity: "legend"
    },
    {
      label: "珍品",
      count: archiveEntries.filter((entry) => entry.rarity === "artifact").length,
      rarity: "artifact"
    },
    {
      label: "战果",
      count: archiveEntries.filter((entry) => entry.rarity === "trophy").length,
      rarity: "trophy"
    },
    {
      label: "基石",
      count: archiveEntries.filter((entry) => entry.rarity === "ember").length,
      rarity: "ember"
    }
  ];
  const chapterBoards = [
    {
      chapterId: "relics",
      label: "收藏墙",
      ready: countReadyEntries(relicEntries),
      total: relicEntries.length
    },
    {
      chapterId: "rewards",
      label: "成长轨",
      ready: countReadyEntries(rewardEntries),
      total: rewardEntries.length
    },
    {
      chapterId: "chamber",
      label: "房间陈列",
      ready: countReadyEntries(chamberEntries),
      total: chamberEntries.length
    },
    {
      chapterId: "chronicle",
      label: "战果编年",
      ready: countReadyEntries(chronicleEntries),
      total: chronicleEntries.length
    }
  ];
  const topMapLine = topMaps.length > 0 ? topMaps.map(([mapName, count]) => `${mapName} ${count}次`).join(" · ") : "等待第一张地图写入档案馆";
  const rareLine = rareEntries.length > 0 ? `${rareEntries.length} 项高阶条目已经进入收藏序列` : "目前还没有神话或传奇条目进入总览层";
  return [
    {
      id: createPetCodexEntryId("atlas", "overview"),
      chapterId: "atlas",
      title: "档案总览",
      subtitle: `Lv.${input.progression.level} · ${readyCount}/${totalCount} 已点亮`,
      detail: "总览页会把收藏墙、成长轨、房间陈列和战果编年压成一页，先看全局，再决定往哪条线继续翻。",
      meta: `当前总完成度 ${completionPercent}% ，地图覆盖 ${uniqueMapCount} 张，稀有条目 ${rareEntries.length} 项。`,
      accent: "总览",
      categoryLabel: "统计总览",
      groupLabel: "档案总览",
      state: readyCount > 0 ? "glory" : "warming",
      rarity: rareEntries.length > 0 ? "legend" : "artifact",
      sigil: "Atlas",
      storyTitle: "档案馆已经长出可回看的总览层",
      storyLead: "这张总览会把今日掉落、长期收藏和成长进度压进同一页，让你先看到全局节奏。",
      chips: [`完成度 ${completionPercent}%`, `地图 ${uniqueMapCount} 张`, `稀有 ${rareEntries.length} 项`],
      badges: ["总览首页", "档案馆", input.progression.title],
      facts: [
        { label: "当前等级", value: `Lv.${input.progression.level}` },
        { label: "点亮条目", value: `${readyCount}/${totalCount}` },
        { label: "地图覆盖", value: `${uniqueMapCount} 张` },
        { label: "稀有条目", value: `${rareEntries.length} 项` }
      ],
      searchableText: buildSearchableText([
        "档案总览",
        "统计总览",
        input.progression.title,
        `lv${input.progression.level}`,
        topMapLine,
        rareLine
      ]),
      illustration: buildIllustration("AT", "Codex Atlas", [
        `Lv.${input.progression.level}`,
        `${completionPercent}%`,
        `${uniqueMapCount} Maps`
      ]),
      visuals: [
        {
          id: "overview-meter",
          kind: "meter",
          title: "档案点亮率",
          subtitle: `${readyCount}/${totalCount} 已点亮`,
          value: readyCount,
          total: totalCount,
          tone: rareEntries.length > 0 ? "gold" : "artifact",
          footnote: "总览会把所有长期收藏、成长奖励和战果编年压成一个总体完成度。"
        },
        {
          id: "overview-boards",
          kind: "bars",
          title: "四条主线",
          subtitle: "收藏墙、成长轨、房间陈列和战果编年的当前进度",
          items: chapterBoards.map((item) => ({
            label: item.label,
            value: item.ready,
            displayValue: `${item.ready}/${item.total}`,
            detail: item.total > 0 ? `${Math.round(item.ready / item.total * 100)}%` : "0%",
            target: {
              chapterId: item.chapterId
            },
            tone: item.ready === item.total ? "gold" : item.ready > 0 ? "artifact" : "ember"
          })),
          footnote: "先看哪一条主线拖后腿，再决定继续刷、补联调还是回房间收陈列。"
        }
      ]
    },
    {
      id: createPetCodexEntryId("atlas", "maps"),
      chapterId: "atlas",
      title: "地图热区",
      subtitle: uniqueMapCount > 0 ? `覆盖 ${uniqueMapCount} 张地图` : "等待地图样本写入",
      detail: topMapLine,
      meta: uniqueMapCount > 0 ? "地图热区会按掉落记录自动滚动更新。" : "先记下第一条掉落后，这里就会开始形成热区榜。",
      accent: "热区",
      categoryLabel: "地图分布",
      groupLabel: "路线图谱",
      state: uniqueMapCount > 0 ? "ready" : "warming",
      rarity: topMaps.length >= 3 ? "artifact" : "trophy",
      sigil: "Map",
      storyTitle: "桌宠已经开始理解你的主刷路线",
      storyLead: "同一张地图反复出现时，它会被提升到总览层，帮助你识别今天的热区节奏。",
      chips: topMaps.length > 0 ? topMaps.map(([mapName]) => mapName) : ["等待样本"],
      badges: ["路线图谱", uniqueMapCount > 0 ? "已形成热区" : "等待首条记录"],
      facts: topMaps.length > 0 ? topMaps.map(([mapName, count], index) => ({
        label: `热区 ${index + 1}`,
        value: `${mapName} · ${count}次`
      })) : [{ label: "当前状态", value: "还没有足够的地图记录" }],
      searchableText: buildSearchableText([
        "地图热区",
        "路线图谱",
        ...topMaps.map(([mapName]) => mapName)
      ]),
      illustration: buildIllustration("MP", "Route Atlas", [
        ((_a = topMaps[0]) == null ? void 0 : _a[0]) ?? "No Route",
        `${uniqueMapCount} Maps`,
        `${input.drops.length} Drops`
      ]),
      visuals: [
        {
          id: "map-hotspots",
          kind: "bars",
          title: "热区排行",
          subtitle: uniqueMapCount > 0 ? "按掉落记录排序的当前热点地图" : "等待地图数据写入",
          items: topMaps.length > 0 ? topMaps.map(([mapName, count], index) => ({
            label: mapName,
            value: count,
            displayValue: `${count}次`,
            detail: index === 0 ? "当前最热路线" : `热区 ${index + 1}`,
            target: {
              chapterId: "chronicle",
              mapName
            },
            tone: index === 0 ? "gold" : index === 1 ? "artifact" : "ember"
          })) : [
            {
              label: "暂无热区",
              value: 0,
              displayValue: "0次",
              detail: "写入第一条掉落后这里会开始形成地图脉络",
              tone: "ember"
            }
          ],
          footnote: uniqueMapCount > 0 ? `当前已经覆盖 ${uniqueMapCount} 张地图。` : "还没有足够的样本形成地图热区。"
        }
      ]
    },
    {
      id: createPetCodexEntryId("atlas", "rarity"),
      chapterId: "atlas",
      title: "稀有层级",
      subtitle: `神话 ${rarityBands[0].count} · 传奇 ${rarityBands[1].count} · 珍品 ${rarityBands[2].count}`,
      detail: rarityBands.map((band) => `${band.label} ${band.count} 项`).join(" · "),
      meta: rareLine,
      accent: "层级",
      categoryLabel: "稀有层级",
      groupLabel: "稀有层级",
      state: rareEntries.length > 0 ? "glory" : "ready",
      rarity: rareEntries.length > 0 ? "mythic" : "artifact",
      sigil: "Rare",
      storyTitle: "稀有度已经不再只是单条高亮",
      storyLead: "总览层会把神话、传奇、珍品和基础条目拆开看，方便你判断今天的掉落质量。",
      chips: rarityBands.map((band) => `${band.label} ${band.count}`),
      badges: ["稀有层级", rareEntries.length > 0 ? "高阶条目已入列" : "等待高阶条目"],
      facts: rarityBands.map((band) => ({
        label: band.label,
        value: `${band.count} 项`
      })),
      searchableText: buildSearchableText([
        "稀有层级",
        ...rarityBands.map((band) => `${band.label} ${band.count}`)
      ]),
      illustration: buildIllustration("RR", "Rarity Ladder", [
        `Mythic ${rarityBands[0].count}`,
        `Legend ${rarityBands[1].count}`,
        `Artifact ${rarityBands[2].count}`
      ]),
      visuals: [
        {
          id: "rarity-ladder",
          kind: "segments",
          title: "稀有分层",
          subtitle: "按稀有度拆看当前档案馆的条目结构",
          items: rarityBands.map((band, index) => ({
            label: band.label,
            value: band.count,
            displayValue: `${band.count} 项`,
            detail: index === 0 ? "最高阶条目" : index === 1 ? "高价值收藏" : void 0,
            target: archiveEntries.find((entry) => entry.rarity === band.rarity) ? {
              chapterId: archiveEntries.find((entry) => entry.rarity === band.rarity).chapterId,
              entryId: archiveEntries.find((entry) => entry.rarity === band.rarity).id,
              rarity: band.rarity
            } : void 0,
            tone: band.label === "神话" ? "mythic" : band.label === "传奇" ? "gold" : band.label === "珍品" ? "artifact" : "ember"
          })),
          footnote: "稀有层级越往上，越值得进入收藏墙和专属故事页。"
        }
      ]
    },
    {
      id: createPetCodexEntryId("atlas", "completion"),
      chapterId: "atlas",
      title: "完成度总表",
      subtitle: `${chapterBoards.filter((item) => item.ready === item.total).length}/${chapterBoards.length} 条主线已收口`,
      detail: chapterBoards.map((item) => `${item.label} ${item.ready}/${item.total}`).join(" · "),
      meta: "这张总表会告诉你当前更该继续刷、去工坊补联调，还是回房间收陈列。",
      accent: "总表",
      categoryLabel: "完成度总表",
      groupLabel: "完成度总表",
      state: chapterBoards.every((item) => item.ready === item.total) ? "glory" : "ready",
      rarity: chapterBoards.every((item) => item.ready === item.total) ? "legend" : "trophy",
      sigil: "Board",
      storyTitle: "四条主线已经被压成一张完成度总表",
      storyLead: "当你想快速决定下一步时，总表会比单条详情更快告诉你现在最缺哪一块。",
      chips: chapterBoards.map((item) => `${item.label} ${item.ready}/${item.total}`),
      badges: ["完成度总表", `${completionPercent}% 已点亮`],
      facts: chapterBoards.map((item) => ({
        label: item.label,
        value: `${item.ready}/${item.total}`
      })),
      searchableText: buildSearchableText([
        "完成度总表",
        ...chapterBoards.map((item) => `${item.label} ${item.ready}/${item.total}`)
      ]),
      illustration: buildIllustration("BD", "Completion Board", [
        chapterBoards[0] ? `${chapterBoards[0].ready}/${chapterBoards[0].total}` : "0/0",
        chapterBoards[1] ? `${chapterBoards[1].ready}/${chapterBoards[1].total}` : "0/0",
        `${completionPercent}%`
      ]),
      visuals: [
        {
          id: "completion-bars",
          kind: "bars",
          title: "主线完成度",
          subtitle: "四条主线当前的收口情况",
          items: chapterBoards.map((item) => ({
            label: item.label,
            value: item.ready,
            displayValue: `${item.ready}/${item.total}`,
            detail: item.ready === item.total ? "已收口" : "仍可继续推进",
            target: {
              chapterId: item.chapterId
            },
            tone: item.ready === item.total ? "gold" : item.ready > 0 ? "artifact" : "ember"
          })),
          footnote: "这张表更适合用来决定下一步做什么，而不是看单条故事。"
        },
        {
          id: "completion-meter",
          kind: "meter",
          title: "全局收口率",
          subtitle: `${completionPercent}% 已点亮`,
          value: readyCount,
          total: totalCount,
          tone: chapterBoards.every((item) => item.ready === item.total) ? "gold" : "artifact",
          footnote: "当全局收口率抬高时，桌宠房间和收藏墙也会越来越完整。"
        }
      ]
    }
  ];
}
function buildChapter(id, label, title, summary, entries) {
  return {
    id,
    label,
    title,
    summary,
    entries,
    readyCount: entries.filter((entry) => entry.state === "glory" || entry.state === "ready").length
  };
}
function buildPetCodex(input) {
  var _a, _b, _c, _d, _e, _f;
  const relicEntries = buildRelicEntries(input.habitat);
  const rewardEntries = buildRewardEntries(input.progression, input.rewards);
  const chamberEntries = buildChamberEntries(input.room);
  const chronicleEntries = buildChronicleEntries(input.drops);
  const atlasEntries = buildAtlasEntries(
    input,
    relicEntries,
    rewardEntries,
    chamberEntries,
    chronicleEntries
  );
  const highlightedChronicle = chronicleEntries.find((entry) => entry.state === "glory");
  const highlightedRelic = relicEntries.find((entry) => entry.state === "glory");
  const activeReward = rewardEntries.find((entry) => entry.state === "glory");
  const featuredEntryId = ((_a = atlasEntries[0]) == null ? void 0 : _a.id) ?? (highlightedChronicle == null ? void 0 : highlightedChronicle.id) ?? (highlightedRelic == null ? void 0 : highlightedRelic.id) ?? (activeReward == null ? void 0 : activeReward.id) ?? ((_b = chronicleEntries[0]) == null ? void 0 : _b.id) ?? ((_c = relicEntries[0]) == null ? void 0 : _c.id) ?? ((_d = rewardEntries[0]) == null ? void 0 : _d.id) ?? ((_e = chamberEntries[0]) == null ? void 0 : _e.id) ?? createPetCodexEntryId("relics", "empty");
  const chapters = [
    buildChapter(
      "atlas",
      "总览图谱",
      "档案总览",
      "先看地图热区、稀有层级和完成度总表，再决定往哪条线继续翻。",
      atlasEntries
    ),
    buildChapter(
      "relics",
      "收藏墙",
      input.habitat.collectionTitle,
      input.habitat.collectionSummary,
      relicEntries
    ),
    buildChapter(
      "rewards",
      "成长轨道",
      "奖励解锁册",
      input.rewards.summary,
      rewardEntries
    ),
    buildChapter(
      "chamber",
      "房间陈列",
      input.room.title,
      input.room.subtitle,
      chamberEntries
    ),
    buildChapter(
      "chronicle",
      "战果编年",
      "掉落卷宗",
      chronicleEntries.length > 0 ? `当前已经记下 ${chronicleEntries.length} 条战果，最新条目会优先出现在桌宠编年册。` : "掉落记录还没开始，贴上第一张截图后这里就会慢慢长成完整卷宗。",
      chronicleEntries
    )
  ];
  return {
    badge: input.progression.level >= 6 ? "终局藏品册" : "桌宠藏品册",
    title: "赫拉迪姆收藏册",
    subtitle: "把成长奖励、房间陈列和战利品编年收成一套可翻看的桌边卷册。",
    featuredEntryId,
    chapters,
    metrics: [
      {
        label: "当前等级",
        value: `Lv.${input.progression.level}`,
        detail: input.progression.title
      },
      {
        label: "已点亮陈列",
        value: `${input.habitat.exhibits.filter((item) => item.state !== "locked").length}/${input.habitat.exhibits.length}`,
        detail: input.habitat.collectionTitle
      },
      {
        label: "房间布置",
        value: `${input.room.items.filter((item) => item.state !== "locked").length}/${input.room.items.length}`,
        detail: input.room.title
      },
      {
        label: "编年记录",
        value: String(input.drops.length),
        detail: (highlightedChronicle == null ? void 0 : highlightedChronicle.accent) ?? ((_f = chronicleEntries[0]) == null ? void 0 : _f.accent) ?? "战利品条目"
      }
    ]
  };
}
function FishingDiabloPet(props) {
  const tierClass = props.fishingCatch ? `tier-${props.fishingCatch.tier}` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-ring pet-ring-outer" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-ring pet-ring-inner" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": "true", className: "pet-diablo-wings", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-wing wing-left" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-wing wing-right" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-core pet-diablo-core", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-horn horn-left" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-horn horn-right" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-brow brow-left" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-brow brow-right" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-body" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-cheek cheek-left" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-cheek cheek-right" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-diablo-mouth" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-eyes", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "pet-diablo-tail" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": "true", className: "pet-fishing-scene", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-fishing-rod" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-fishing-line ${props.fishingCatch ? "is-catching" : ""}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-fishing-bobber ${props.fishingCatch ? "is-catching" : ""}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-fishing-pond" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-fishing-ripple ripple-a" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-fishing-ripple ripple-b" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-prop-badge ${props.floating ? "floating-prop-badge" : ""}`, children: props.propLabel }),
    props.highlightDropName ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-spark" }) : null,
    props.fishingCatch ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pet-rune-catch ${tierClass}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-rune-sigil", children: props.fishingCatch.runeShort }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-rune-label", children: props.fishingCatch.runeLabel })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `pet-blessing-chip ${tierClass}`, children: props.fishingCatch.miniBlessing })
    ] }) : null
  ] });
}
function getLatestRunNeedingWrapUp$1(recentRuns, recentDrops) {
  const latestRun = recentRuns[0];
  if (!latestRun) {
    return null;
  }
  const runEndedAt = new Date(latestRun.endedAt).getTime();
  const hasFollowupDrop = recentDrops.some(
    (drop) => new Date(drop.createdAt).getTime() >= runEndedAt - 9e4
  );
  return hasFollowupDrop ? null : latestRun;
}
function getSnapHint(preview) {
  if (!preview.visible || !preview.edge) {
    return "拖到屏幕边缘时会自动吸附。";
  }
  const edgeLabel = preview.edge === "left" ? "左侧" : preview.edge === "right" ? "右侧" : preview.edge === "top" ? "顶部" : "底部";
  return preview.snapped ? `已经吸附到${edgeLabel}。` : `松手后会吸附到${edgeLabel}。`;
}
function FloatingPet(props) {
  var _a, _b, _c, _d, _e;
  const [pulseIndex, setPulseIndex] = reactExports.useState(0);
  const [scriptIndex, setScriptIndex] = reactExports.useState(0);
  const persona = reactExports.useMemo(
    () => buildPetPersona({
      activeRun: props.activeRun,
      highlightDropName: props.highlightDropName,
      interactionCue: props.interactionCue,
      liveDurationText: props.liveDurationText,
      preflight: props.preflight,
      recentDrops: props.recentDrops,
      recentRuns: props.recentRuns,
      setupGuideCompleted: props.setupGuideCompleted,
      todayCount: props.todayCount,
      todayDropCount: props.todayDropCount
    }),
    [
      props.activeRun,
      props.highlightDropName,
      props.interactionCue,
      props.liveDurationText,
      props.preflight,
      props.recentDrops,
      props.recentRuns,
      props.setupGuideCompleted,
      props.todayCount,
      props.todayDropCount
    ]
  );
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp$1(
    props.recentRuns,
    props.recentDrops
  );
  const preflightTasks = ((_a = props.preflight) == null ? void 0 : _a.tasks) ?? [];
  const blockingTask = preflightTasks.find((task) => task.status === "error");
  const warningTask = preflightTasks.find((task) => task.status === "warning");
  const primaryAction = reactExports.useMemo(() => {
    if (props.activeRun) {
      return {
        badge: "本轮进行中",
        title: `本轮停在 ${props.activeRun.mapName}`,
        detail: "刷完以后点这里就能直接结算，悬浮态不会丢掉今天的节奏。",
        label: props.busy ? "结算中…" : "完成本轮",
        action: props.onStopRun
      };
    }
    if (!props.setupGuideCompleted) {
      return {
        badge: props.setupGuideHint.badge,
        title: props.setupGuideHint.title,
        detail: props.setupGuideHint.detail,
        label: props.setupGuideHint.actionLabel,
        action: props.onOpenSetupGuide
      };
    }
    if (latestRunNeedingWrapUp) {
      return {
        badge: "先去收口",
        title: `${latestRunNeedingWrapUp.mapName} 刚刷完`,
        detail: "上一轮结束了，但战报还没写进新的掉落，现在去收口最顺。",
        label: "去记掉落",
        action: props.onOpenDrops
      };
    }
    if (blockingTask) {
      return {
        badge: "工坊阻塞",
        title: "自动化还有条件没补齐",
        detail: `${blockingTask.summary}，先去工坊处理掉它。`,
        label: "去工坊处理",
        action: props.onOpenWorkshop
      };
    }
    if (props.recentRuns.length > 0) {
      const latestRoute = props.recentRuns[0].mapName;
      return {
        badge: warningTask ? "工坊提醒" : "一键继续",
        title: `沿用 ${latestRoute} 再开一轮`,
        detail: warningTask ? `${warningTask.summary}。如果你先不处理，也可以继续今天主刷路线。` : "继续最近一轮的路线，是每天上线后最顺手的开始方式。",
        label: props.busy ? "启动中…" : `继续 ${latestRoute}`,
        action: () => props.onStartRun(latestRoute)
      };
    }
    return {
      badge: "今日开局",
      title: "从熟图开始热身",
      detail: "先开第一轮，桌宠就会开始认真陪你盯节奏。",
      label: props.busy ? "启动中…" : "开始今天",
      action: () => props.onStartRun("混沌避难所")
    };
  }, [
    blockingTask,
    latestRunNeedingWrapUp,
    props.activeRun,
    props.busy,
    props.onOpenDrops,
    props.onOpenSetupGuide,
    props.onOpenWorkshop,
    props.onStartRun,
    props.onStopRun,
    props.recentRuns,
    props.setupGuideHint,
    props.setupGuideCompleted,
    warningTask
  ]);
  const pulseItems = reactExports.useMemo(() => {
    return [
      {
        id: "count",
        label: "今日次数",
        value: `${props.todayCount} 轮`,
        detail: props.todayCount > 0 ? "今天的刷图节奏已经跑起来了。" : "今天还没开刷，先起第一轮。"
      },
      {
        id: "drop",
        label: "今日战果",
        value: props.highlightDropName || `${props.todayDropCount} 条`,
        detail: props.highlightDropName ? "刚刚有高亮掉落，最适合顺手去战报页收口。" : props.todayDropCount > 0 ? "今天已经有战利品入账。" : "还在等第一条掉落出现。"
      },
      {
        id: "workshop",
        label: "工坊状态",
        value: props.preflightBusy ? "预检刷新中" : blockingTask ? "还有阻塞项" : warningTask ? "还有提醒项" : props.preflight ? "联调可用" : "等待预检",
        detail: blockingTask ? blockingTask.summary : warningTask ? warningTask.summary : "符文、宝石、金币三条线都能从这里接回去。"
      }
    ];
  }, [
    blockingTask,
    props.highlightDropName,
    props.preflight,
    props.preflightBusy,
    props.todayCount,
    props.todayDropCount,
    warningTask
  ]);
  reactExports.useEffect(() => {
    setPulseIndex(0);
  }, [props.highlightDropName, props.todayCount, props.todayDropCount, (_b = props.activeRun) == null ? void 0 : _b.id]);
  reactExports.useEffect(() => {
    setScriptIndex(0);
  }, [persona.headline, persona.statusLine]);
  reactExports.useEffect(() => {
    if (pulseItems.length <= 1) {
      return void 0;
    }
    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % pulseItems.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [pulseItems]);
  reactExports.useEffect(() => {
    if (persona.scripts.length <= 1) {
      return void 0;
    }
    const timer = window.setInterval(() => {
      setScriptIndex((current) => (current + 1) % persona.scripts.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [persona.scripts]);
  const activePulse = pulseItems[pulseIndex] ?? pulseItems[0];
  const activeScript = persona.scripts[scriptIndex] ?? persona.scripts[0] ?? "";
  const bubbleTitle = props.interactionCue ? persona.headline : props.highlightDropName ? `高亮战果 · ${props.highlightDropName}` : props.activeRun ? `${props.activeRun.mapName} · ${props.liveDurationText}` : persona.headline;
  const bubbleDetail = props.interactionCue ? persona.statusLine : props.highlightDropName ? "这条掉落刚刚触发了桌宠高亮，适合顺手去战报页收口。" : activeScript;
  const snapHint = getSnapHint(props.snapPreview);
  const interactionClass = props.interactionCue ? `interaction-${props.interactionCue.kind}` : "";
  const rewardSpotlightIds = new Set(((_c = props.ceremony) == null ? void 0 : _c.rewardIds) ?? []);
  const roomSpotlightIds = new Set(((_d = props.ceremony) == null ? void 0 : _d.roomIds) ?? []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "floating-shell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `floating-card floating-card-${persona.emotion} scene-${props.scene.id} habitat-${props.habitat.tier} ${props.interactionCue ? "floating-card-interaction" : ""} ${interactionClass} ${props.snapPreview.visible && props.snapPreview.edge ? `snap-preview snap-${props.snapPreview.edge}` : ""} ${props.snapPreview.snapped ? "snap-locked" : ""} drag-strip`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-scene-orbs", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-scene-orb orb-a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-scene-orb orb-b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-scene-orb orb-c" })
        ] }),
        props.snapPreview.visible && props.snapPreview.edge ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: `floating-snap-glow ${props.snapPreview.edge} ${props.snapPreview.snapped ? "locked" : ""}`
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-top", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "aria-label": "摸头互动，双击庆祝",
              className: `pet-avatar pet-avatar-${persona.emotion} floating-avatar pet-avatar-trigger no-drag ${interactionClass}`,
              onClick: props.onPetHeadpat,
              onDoubleClick: (event) => {
                event.preventDefault();
                props.onPetCheer();
              },
              title: "摸头互动，双击庆祝",
              type: "button",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FishingDiabloPet,
                {
                  fishingCatch: props.fishingCatch,
                  floating: true,
                  highlightDropName: props.highlightDropName,
                  propLabel: props.scene.propLabel
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "floating-bubble no-drag",
              onDoubleClick: () => props.onToggleWindowMode("panel"),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  props.onToggleWindowMode("panel");
                }
              },
              role: "button",
              tabIndex: 0,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-bubble-head", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `emotion-pill emotion-${persona.emotion}`, children: persona.emotionLabel }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-bubble-chips", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill pet-gesture-hint", children: "摸头像互动" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "floating-toggle-chip", children: "双击展开" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: bubbleTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: bubbleDetail }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "floating-script-line", children: activeScript })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-scene-strip no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-stage-chip strong", children: props.scene.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-stage-chip", children: props.scene.auraLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-stage-ambient", children: props.scene.ambientLine })
        ] }),
        props.ceremony ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "article",
          {
            className: `pet-ceremony-banner floating-ceremony-banner no-drag ceremony-${props.ceremony.kind}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-ceremony-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-ceremony-badge", children: props.ceremony.badge }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                  "Lv.",
                  props.ceremony.level
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.ceremony.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.ceremony.detail })
            ]
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-progress-card floating-progress-card no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-progress-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Bond" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "Lv.",
                props.progression.level,
                " ",
                props.progression.title
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: props.progression.nextMilestone })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": "true", className: "pet-progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "pet-progress-fill",
              style: { width: `${Math.round(props.progression.progress * 100)}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-progress-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.progression.sceneLine }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.progression.progressLabel })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-habitat-card floating-habitat-card no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Habitat" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.habitat.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.habitat.collectionSummary })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-crest", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "ghost-button pet-codex-launch compact",
                  onClick: props.onOpenCodex,
                  type: "button",
                  children: "藏品册"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-habitat-crest-chip", children: props.habitat.crest })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-habitat-mini-grid", children: props.habitat.exhibits.slice(0, 4).map((exhibit) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: `pet-habitat-item pet-codex-card compact state-${exhibit.state}`,
              onClick: () => props.onOpenCodexEntry(createPetCodexEntryId("relics", exhibit.id)),
              type: "button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-room-kicker", children: exhibit.accent }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: exhibit.label })
              ]
            },
            exhibit.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-reward-card floating-reward-card no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Unlocks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: ((_e = props.rewards.activeReward) == null ? void 0 : _e.label) ?? props.rewards.headline }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.rewards.nextReward ? `下一件：Lv.${props.rewards.nextReward.level} ${props.rewards.nextReward.label}` : "终局陈列已经全部点亮" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
              props.rewards.unlockedCount,
              "/",
              props.rewards.totalCount
            ] })
          ] }),
          props.rewards.activeReward ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-spotlight compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.rewards.activeReward.detail }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.rewards.activeReward.bonus })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-reward-mini-grid", children: props.rewards.rewards.map((reward) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: `pet-reward-pill state-${reward.state} ${rewardSpotlightIds.has(reward.id) ? "is-spotlight" : ""}`,
              onClick: () => props.onOpenCodexEntry(createPetCodexEntryId("rewards", reward.id)),
              type: "button",
              children: [
                "Lv.",
                reward.level,
                " ",
                reward.shortLabel
              ]
            },
            reward.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-room-card floating-room-card no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-room-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Pet Room" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.room.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.room.subtitle })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-room-grid compact", children: props.room.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: `pet-room-item pet-codex-card state-${item.state} ${roomSpotlightIds.has(item.id) ? "is-spotlight" : ""}`,
              onClick: () => props.onOpenCodexEntry(createPetCodexEntryId("chamber", item.id)),
              type: "button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-room-kicker", children: item.shortLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.detail })
              ]
            },
            item.id
          )) })
        ] }),
        props.event ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `pet-event-card floating-event-card event-${props.event.tone} no-drag`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-event-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-event-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Random Event" }),
              props.event.storyLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill story-pill", children: props.event.storyLabel }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.event.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.event.detail })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "floating-action primary pet-event-button",
              disabled: props.eventBusy,
              onClick: props.onEventAction,
              type: "button",
              children: props.event.ctaLabel
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "floating-brief no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "Resume" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: primaryAction.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: primaryAction.detail }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "floating-action primary floating-primary-action",
              disabled: props.busy,
              onClick: primaryAction.action,
              type: "button",
              children: primaryAction.label
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-snap-note no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: props.snapPreview.snapped ? "已吸附" : "可吸附" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: snapHint })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "floating-pulse-card no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-pulse-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "Pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
              pulseIndex + 1,
              "/",
              pulseItems.length
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: activePulse.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            activePulse.label,
            " · ",
            activePulse.detail
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "floating-pulse-dots", "aria-label": "floating pulse", children: pulseItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: index === pulseIndex ? "floating-pulse-dot active" : "floating-pulse-dot"
            },
            item.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "floating-dock no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "floating-action", onClick: props.onOpenPanel, type: "button", children: "展开" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "floating-action", onClick: props.onOpenDrops, type: "button", children: "战报" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "floating-action", onClick: props.onOpenWorkshop, type: "button", children: "工坊" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "floating-action", onClick: props.onOpenCodex, type: "button", children: "藏品册" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: props.alwaysOnTop ? "floating-action active" : "floating-action",
              onClick: props.onToggleAlwaysOnTop,
              type: "button",
              children: "置顶"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "floating-action", onClick: props.onMinimize, type: "button", children: "收起" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "floating-action",
              disabled: props.busy || Boolean(props.activeRun),
              onClick: () => {
                var _a2;
                return props.onStartRun(((_a2 = props.recentRuns[0]) == null ? void 0 : _a2.mapName) ?? "混沌避难所");
              },
              type: "button",
              children: "快开"
            }
          )
        ] })
      ]
    }
  ) });
}
class PanelErrorBoundary extends reactExports.Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", {
      hasError: false,
      message: "",
      tone: "error"
    });
    __publicField(this, "handleReset", () => {
      var _a, _b;
      this.setState({
        hasError: false,
        message: "",
        tone: "attention"
      });
      (_b = (_a = this.props).onReset) == null ? void 0 : _b.call(_a);
    });
    __publicField(this, "handleReload", () => {
      window.location.reload();
    });
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error && error.message ? error.message : "这个页面刚才渲染失败了。",
      tone: "error"
    };
  }
  componentDidCatch(error, info) {
    console.error(`[PanelErrorBoundary:${this.props.panelLabel}]`, error, info);
  }
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({
        hasError: false,
        message: "",
        tone: "attention"
      });
    }
  }
  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `card panel-fallback panel-fallback-${this.state.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel-fallback-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "页面兜底" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
            this.props.panelLabel,
            " 暂时没有正常渲染出来"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "我先把整页保住了，避免你直接看到白屏。可以先重试当前页，或者刷新整个桌宠。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pill error", children: "已拦截异常" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "这次异常信息" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: this.state.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: this.handleReset, type: "button", children: "重试当前页" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: this.handleReload, type: "button", children: "刷新整个桌宠" })
      ] })
    ] });
  }
}
let audioContext = null;
function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }
  const Context = window.AudioContext || // @ts-expect-error webkit prefix fallback
  window.webkitAudioContext;
  if (!Context) {
    return null;
  }
  if (!audioContext) {
    audioContext = new Context();
  }
  return audioContext;
}
function scheduleTone(context, startAt, frequency, duration, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(1e-4, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(1e-4, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}
function playPetChime(kind) {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  if (context.state === "suspended") {
    void context.resume();
  }
  const startAt = context.currentTime + 0.02;
  const pattern = kind === "mastery" ? [
    [523.25, 0.18, 0.03],
    [659.25, 0.22, 0.038],
    [880, 0.34, 0.045]
  ] : kind === "rare" ? [
    [392, 0.16, 0.024],
    [587.33, 0.22, 0.032],
    [783.99, 0.3, 0.04]
  ] : [
    [523.25, 0.16, 0.02],
    [659.25, 0.24, 0.028]
  ];
  pattern.forEach(([frequency, offset, volume]) => {
    scheduleTone(context, startAt + offset, frequency, 0.22, volume);
  });
}
const MAP_FILTER_ALL = "全部地图";
const TYPE_FILTER_ALL = "全部类型";
const RARITY_FILTERS = [
  { id: "all", label: "全部" },
  { id: "mythic", label: "神话" },
  { id: "legend", label: "传奇" },
  { id: "artifact", label: "珍品" },
  { id: "trophy", label: "战果" },
  { id: "ember", label: "基础" }
];
function toFileUrl(path) {
  const normalized = path.replace(/\\/g, "/");
  const prefixed = /^[A-Za-z]:\//.test(normalized) ? `file:///${normalized}` : `file://${normalized}`;
  return encodeURI(prefixed);
}
function findEntry(codex, entryId) {
  for (const chapter of codex.chapters) {
    const entry = chapter.entries.find((candidate) => candidate.id === entryId);
    if (entry) {
      return { chapter, entry };
    }
  }
  return null;
}
function getEntryAction(entry, onOpenDrops, onOpenWorkshop, onClose) {
  if (entry.chapterId === "chronicle") {
    return { label: "去战报翻记录", action: onOpenDrops };
  }
  if (entry.chapterId === "rewards") {
    return { label: "去工坊补联调", action: onOpenWorkshop };
  }
  return { label: "回到桌宠主页", action: onClose };
}
function getRarityLabel(rarity) {
  switch (rarity) {
    case "mythic":
      return "Mythic";
    case "legend":
      return "Legend";
    case "artifact":
      return "Artifact";
    case "trophy":
      return "Trophy";
    case "ember":
      return "Ember";
  }
}
function getRarityFilterLabel(rarity) {
  var _a;
  return ((_a = RARITY_FILTERS.find((filter) => filter.id === rarity)) == null ? void 0 : _a.label) ?? "全部";
}
function groupEntries(entries) {
  const groups = /* @__PURE__ */ new Map();
  entries.forEach((entry) => {
    const current = groups.get(entry.groupLabel) ?? [];
    current.push(entry);
    groups.set(entry.groupLabel, current);
  });
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}
function findJumpEntry(chapter, target) {
  const filtered = chapter.entries.filter((entry) => {
    const matchesMap = target.mapName ? entry.mapName === target.mapName : true;
    const matchesType = target.typeLabel ? entry.categoryLabel === target.typeLabel : true;
    const matchesHighlight = target.highlightOnly ? entry.state === "glory" || entry.state === "ready" : true;
    const matchesRarity = target.rarity && target.rarity !== "all" ? entry.rarity === target.rarity : true;
    return matchesMap && matchesType && matchesHighlight && matchesRarity;
  });
  if (target.entryId) {
    return filtered.find((entry) => entry.id === target.entryId) ?? chapter.entries.find((entry) => entry.id === target.entryId) ?? null;
  }
  return filtered[0] ?? chapter.entries[0] ?? null;
}
function formatCompletion(readyCount, totalCount) {
  if (totalCount === 0) {
    return "0%";
  }
  return `${Math.round(readyCount / totalCount * 100)}%`;
}
function buildOverviewCards(chapter, visibleEntries) {
  const totalCount = chapter.entries.length;
  const rareCount = chapter.entries.filter(
    (entry) => entry.rarity === "mythic" || entry.rarity === "legend"
  ).length;
  const gloryCount = chapter.entries.filter((entry) => entry.state === "glory").length;
  const visibleGroupCount = new Set(visibleEntries.map((entry) => entry.groupLabel)).size;
  const uniqueMapCount = new Set(
    chapter.entries.map((entry) => entry.mapName).filter(Boolean)
  ).size;
  const latestEntry = chapter.entries[0];
  const nextEntry = chapter.entries.find(
    (entry) => entry.state === "warming" || entry.state === "locked"
  );
  if (chapter.id === "atlas") {
    return [
      {
        label: "总览页签",
        value: `${visibleEntries.length} 页`,
        detail: "地图热区、稀有层级和完成度总表都在这里收口"
      },
      {
        label: "点亮状态",
        value: formatCompletion(chapter.readyCount, totalCount),
        detail: "总览层会跟随战报、成长和陈列实时刷新"
      },
      {
        label: "信息分组",
        value: `${visibleGroupCount} 组`,
        detail: "你可以按总览、地图、稀有和完成度来翻"
      },
      {
        label: "当前焦点",
        value: (latestEntry == null ? void 0 : latestEntry.title) ?? "待生成",
        detail: latestEntry ? latestEntry.subtitle : "等第一批数据写入后这里会变得完整"
      }
    ];
  }
  if (chapter.id === "chronicle") {
    return [
      {
        label: "收录条目",
        value: `${visibleEntries.length}/${totalCount}`,
        detail: "当前筛选下可翻看的战果数量"
      },
      {
        label: "稀有战果",
        value: `${rareCount} 条`,
        detail: rareCount > 0 ? "神话与传奇掉落会长期留档" : "还在等下一条高亮掉落"
      },
      {
        label: "涉及地图",
        value: `${uniqueMapCount} 张`,
        detail: uniqueMapCount > 0 ? "不同场景会被拆成独立证据脉络" : "等第一张地图写入"
      },
      {
        label: "最新波段",
        value: (latestEntry == null ? void 0 : latestEntry.groupLabel) ?? "待记录",
        detail: latestEntry ? latestEntry.title : "第一条战利品会从这里开始编年"
      }
    ];
  }
  if (chapter.id === "rewards") {
    return [
      {
        label: "解锁进度",
        value: formatCompletion(chapter.readyCount, totalCount),
        detail: `${chapter.readyCount}/${totalCount} 项奖励已经亮起`
      },
      {
        label: "当前高亮",
        value: gloryCount > 0 ? `${gloryCount} 项` : "待点亮",
        detail: gloryCount > 0 ? "本轮成长演出正在聚焦这些奖励" : "等下一个等级节点触发演出"
      },
      {
        label: "分组浏览",
        value: `${visibleGroupCount} 组`,
        detail: "按状态拆看已解锁、下一件与未解锁轨道"
      },
      {
        label: "下一里程碑",
        value: (nextEntry == null ? void 0 : nextEntry.title) ?? "全部解锁",
        detail: nextEntry ? nextEntry.subtitle : "这条成长轨已经全部点亮"
      }
    ];
  }
  return [
    {
      label: "点亮进度",
      value: formatCompletion(chapter.readyCount, totalCount),
      detail: `${chapter.readyCount}/${totalCount} 项已经进入可陈列状态`
    },
    {
      label: "高亮陈列",
      value: gloryCount > 0 ? `${gloryCount} 项` : "待点亮",
      detail: gloryCount > 0 ? "这些条目正位于当前舞台中心" : "继续陪刷后会点亮新的主陈列"
    },
    {
      label: "稀有条目",
      value: `${rareCount} 项`,
      detail: rareCount > 0 ? "神话与传奇条目会被优先展示" : "目前以基础陈列为主"
    },
    {
      label: "分组视图",
      value: `${visibleGroupCount} 组`,
      detail: latestEntry ? `当前焦点：${latestEntry.title}` : "还没有可展示的焦点条目"
    }
  ];
}
function getVisualToneClass(tone) {
  return tone ? `tone-${tone}` : "tone-gold";
}
function getVisualToneColor(tone) {
  switch (tone) {
    case "mythic":
      return "#b48cff";
    case "artifact":
      return "#7abedc";
    case "ember":
      return "#cf9154";
    case "gold":
    default:
      return "#f3b05b";
  }
}
function getVisualValueText(visual) {
  if (typeof visual.value === "number" && typeof visual.total === "number") {
    return `${visual.value}/${visual.total}`;
  }
  if (typeof visual.value === "number") {
    return String(visual.value);
  }
  return "--";
}
function getVisualProgress(visual) {
  if (typeof visual.value === "number" && typeof visual.total === "number" && visual.total > 0) {
    return Math.max(0, Math.min(1, visual.value / visual.total));
  }
  return 0;
}
function getVisualMax(items, fallback = 0) {
  return Math.max(
    fallback,
    ...(items == null ? void 0 : items.map((item) => item.value)) ?? [0],
    1
  );
}
function PetCodexOverlay(props) {
  var _a;
  const [searchText, setSearchText] = reactExports.useState("");
  const [rarityFilter, setRarityFilter] = reactExports.useState("all");
  const [highlightOnly, setHighlightOnly] = reactExports.useState(false);
  const [mapFilter, setMapFilter] = reactExports.useState(MAP_FILTER_ALL);
  const [imageFailed, setImageFailed] = reactExports.useState(false);
  const [jumpContext, setJumpContext] = reactExports.useState(null);
  const [evidencePulse, setEvidencePulse] = reactExports.useState(false);
  reactExports.useEffect(() => {
    function handleKeydown(event) {
      if (event.key === "Escape") {
        props.onClose();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [props.onClose]);
  const selected = findEntry(props.codex, props.selectedEntryId) ?? findEntry(props.codex, props.codex.featuredEntryId);
  const availableMaps = reactExports.useMemo(() => {
    if (!selected) {
      return [MAP_FILTER_ALL];
    }
    return [
      MAP_FILTER_ALL,
      ...Array.from(
        new Set(selected.chapter.entries.map((entry) => entry.mapName).filter(Boolean))
      )
    ];
  }, [selected]);
  reactExports.useEffect(() => {
    if (!availableMaps.includes(mapFilter)) {
      setMapFilter(MAP_FILTER_ALL);
    }
  }, [availableMaps, mapFilter]);
  const availableTypes = reactExports.useMemo(() => {
    if (!selected) {
      return [TYPE_FILTER_ALL];
    }
    return [
      TYPE_FILTER_ALL,
      ...Array.from(new Set(selected.chapter.entries.map((entry) => entry.categoryLabel)))
    ];
  }, [selected]);
  const [typeFilter, setTypeFilter] = reactExports.useState(TYPE_FILTER_ALL);
  reactExports.useEffect(() => {
    if (!availableTypes.includes(typeFilter)) {
      setTypeFilter(TYPE_FILTER_ALL);
    }
  }, [availableTypes, typeFilter]);
  const filteredEntries = reactExports.useMemo(() => {
    if (!selected) {
      return [];
    }
    const normalizedSearch = searchText.trim().toLowerCase();
    return selected.chapter.entries.filter((entry) => {
      const matchesSearch = normalizedSearch ? entry.searchableText.includes(normalizedSearch) : true;
      const matchesRarity = rarityFilter === "all" ? true : entry.rarity === rarityFilter;
      const matchesHighlight = highlightOnly ? entry.state === "glory" || entry.state === "ready" : true;
      const matchesType = typeFilter === TYPE_FILTER_ALL ? true : entry.categoryLabel === typeFilter;
      const matchesMap = mapFilter === MAP_FILTER_ALL ? true : entry.mapName === mapFilter;
      return matchesSearch && matchesRarity && matchesHighlight && matchesType && matchesMap;
    });
  }, [highlightOnly, mapFilter, rarityFilter, searchText, selected, typeFilter]);
  const visibleSelectedEntry = filteredEntries.find((entry) => entry.id === (selected == null ? void 0 : selected.entry.id)) ?? filteredEntries[0] ?? (selected == null ? void 0 : selected.entry) ?? null;
  reactExports.useEffect(() => {
    if (!visibleSelectedEntry || visibleSelectedEntry.id === props.selectedEntryId) {
      return;
    }
    props.onSelectEntry(visibleSelectedEntry.id);
  }, [props.onSelectEntry, props.selectedEntryId, visibleSelectedEntry]);
  reactExports.useEffect(() => {
    setImageFailed(false);
  }, [visibleSelectedEntry == null ? void 0 : visibleSelectedEntry.screenshotPath]);
  const groupedEntries = reactExports.useMemo(() => groupEntries(filteredEntries), [filteredEntries]);
  const overviewCards = reactExports.useMemo(
    () => selected ? buildOverviewCards(selected.chapter, filteredEntries) : [],
    [filteredEntries, selected]
  );
  const hasActiveDrilldownFilters = Boolean(jumpContext) && (mapFilter !== MAP_FILTER_ALL || typeFilter !== TYPE_FILTER_ALL || rarityFilter !== "all" || highlightOnly);
  const drilldownEntries = reactExports.useMemo(() => {
    if (!jumpContext || !selected || selected.chapter.id === "atlas") {
      return [];
    }
    return filteredEntries.filter((entry) => {
      const matchesMap = mapFilter === MAP_FILTER_ALL ? true : entry.mapName === mapFilter;
      const matchesType = typeFilter === TYPE_FILTER_ALL ? true : entry.categoryLabel === typeFilter;
      const matchesRarity = rarityFilter === "all" ? true : entry.rarity === rarityFilter;
      const matchesHighlight = highlightOnly ? entry.state === "glory" || entry.state === "ready" : true;
      if (hasActiveDrilldownFilters) {
        return matchesMap && matchesType && matchesRarity && matchesHighlight;
      }
      return entry.id === (visibleSelectedEntry == null ? void 0 : visibleSelectedEntry.id);
    });
  }, [
    filteredEntries,
    hasActiveDrilldownFilters,
    highlightOnly,
    jumpContext,
    mapFilter,
    rarityFilter,
    selected,
    typeFilter,
    visibleSelectedEntry == null ? void 0 : visibleSelectedEntry.id
  ]);
  const drilldownEntryIds = reactExports.useMemo(
    () => new Set(drilldownEntries.map((entry) => entry.id)),
    [drilldownEntries]
  );
  const drilldownFocusSummary = reactExports.useMemo(() => {
    if (!jumpContext || !selected || selected.chapter.id === "atlas") {
      return null;
    }
    const focusTags = [
      mapFilter !== MAP_FILTER_ALL ? `地图 · ${mapFilter}` : null,
      typeFilter !== TYPE_FILTER_ALL ? `类型 · ${typeFilter}` : null,
      rarityFilter !== "all" ? `稀有 · ${getRarityFilterLabel(rarityFilter)}` : null,
      highlightOnly ? "只看点亮项" : null
    ].filter(Boolean);
    return {
      label: focusTags[0] ?? jumpContext.sourceLabel ?? jumpContext.sourceTitle,
      detail: focusTags.length > 1 ? focusTags.slice(1).join(" · ") : hasActiveDrilldownFilters ? "Atlas 图板条件正在持续约束当前列表" : "当前焦点跟随这次 Atlas 钻取停留在相关条目上"
    };
  }, [
    hasActiveDrilldownFilters,
    highlightOnly,
    jumpContext,
    mapFilter,
    rarityFilter,
    selected,
    typeFilter
  ]);
  const detailDrilldownMeta = reactExports.useMemo(() => {
    if (!jumpContext || !selected || selected.chapter.id === "atlas") {
      return null;
    }
    const entryInFocus = drilldownEntryIds.has(visibleSelectedEntry.id);
    const sourceLabel = jumpContext.sourceLabel ? `${jumpContext.sourceTitle} · ${jumpContext.sourceLabel}` : jumpContext.sourceTitle;
    return {
      sourceLabel,
      statusLabel: entryInFocus ? "焦点命中" : "上下文跟随",
      statusDetail: entryInFocus ? "当前详情属于这次 Atlas 钻取命中的条目，右侧面板会保持这条证据线。" : "当前详情仍保留 Atlas 钻取来源，方便你继续沿着这条上下文回看。",
      clues: jumpContext.clues.length > 0 ? jumpContext.clues : [(drilldownFocusSummary == null ? void 0 : drilldownFocusSummary.label) ?? jumpContext.sourceTitle]
    };
  }, [drilldownEntryIds, drilldownFocusSummary == null ? void 0 : drilldownFocusSummary.label, jumpContext, selected, visibleSelectedEntry.id]);
  const drilldownPathState = reactExports.useMemo(() => {
    if (!jumpContext || !selected || selected.chapter.id === "atlas" || drilldownEntries.length === 0) {
      return null;
    }
    const currentIndex = drilldownEntries.findIndex((entry) => entry.id === visibleSelectedEntry.id);
    return {
      total: drilldownEntries.length,
      currentIndex,
      currentStep: currentIndex >= 0 ? currentIndex + 1 : null,
      previousEntry: currentIndex > 0 ? drilldownEntries[currentIndex - 1] : null,
      nextEntry: currentIndex >= 0 && currentIndex < drilldownEntries.length - 1 ? drilldownEntries[currentIndex + 1] : null,
      anchorEntry: currentIndex === -1 ? drilldownEntries[0] : null
    };
  }, [drilldownEntries, jumpContext, selected, visibleSelectedEntry.id]);
  reactExports.useEffect(() => {
    if (!drilldownPathState) {
      return;
    }
    function handleDrilldownKeydown(event) {
      var _a2;
      const target = event.target;
      const tagName = (_a2 = target == null ? void 0 : target.tagName) == null ? void 0 : _a2.toLowerCase();
      const isTypingContext = tagName === "input" || tagName === "textarea" || tagName === "select" || Boolean(target == null ? void 0 : target.isContentEditable);
      if (isTypingContext || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (event.key === "ArrowLeft" && drilldownPathState.previousEntry) {
        event.preventDefault();
        props.onSelectEntry(drilldownPathState.previousEntry.id);
      }
      if (event.key === "ArrowRight" && drilldownPathState.nextEntry) {
        event.preventDefault();
        props.onSelectEntry(drilldownPathState.nextEntry.id);
      }
    }
    window.addEventListener("keydown", handleDrilldownKeydown);
    return () => window.removeEventListener("keydown", handleDrilldownKeydown);
  }, [drilldownPathState, props.onSelectEntry]);
  reactExports.useEffect(() => {
    if (!jumpContext || !selected || selected.chapter.id === "atlas") {
      setEvidencePulse(false);
      return;
    }
    setEvidencePulse(true);
    const timer = window.setTimeout(() => setEvidencePulse(false), 900);
    return () => window.clearTimeout(timer);
  }, [jumpContext, selected, visibleSelectedEntry.id]);
  function resetFilters(clearContext = true) {
    setSearchText("");
    setRarityFilter("all");
    setHighlightOnly(false);
    setMapFilter(MAP_FILTER_ALL);
    setTypeFilter(TYPE_FILTER_ALL);
    if (clearContext) {
      setJumpContext(null);
    }
  }
  function handleJumpTarget(target, sourceTitle, sourceLabel) {
    const chapter = props.codex.chapters.find((candidate) => candidate.id === target.chapterId);
    if (!chapter) {
      return;
    }
    setSearchText("");
    setRarityFilter(target.rarity ?? "all");
    setHighlightOnly(Boolean(target.highlightOnly));
    setMapFilter(target.mapName ?? MAP_FILTER_ALL);
    setTypeFilter(target.typeLabel ?? TYPE_FILTER_ALL);
    const nextEntry = findJumpEntry(chapter, target);
    if (nextEntry) {
      const clues = [
        target.mapName ? `地图：${target.mapName}` : null,
        target.typeLabel ? `类型：${target.typeLabel}` : null,
        target.rarity && target.rarity !== "all" ? `稀有：${getRarityFilterLabel(target.rarity)}` : null,
        target.highlightOnly ? "只看点亮项" : null
      ].filter(Boolean);
      setJumpContext({
        sourceTitle,
        sourceLabel,
        targetChapterTitle: chapter.title,
        clues
      });
      props.onSelectEntry(nextEntry.id);
    }
  }
  function handleReturnToAtlas() {
    var _a2;
    const atlasChapter = props.codex.chapters.find((chapter) => chapter.id === "atlas");
    if (!atlasChapter) {
      return;
    }
    resetFilters();
    props.onSelectEntry(((_a2 = atlasChapter.entries[0]) == null ? void 0 : _a2.id) ?? props.codex.featuredEntryId);
  }
  function handleTraceStep(entryId) {
    if (!entryId) {
      return;
    }
    props.onSelectEntry(entryId);
  }
  const action = reactExports.useMemo(
    () => visibleSelectedEntry ? getEntryAction(
      visibleSelectedEntry,
      props.onOpenDrops,
      props.onOpenWorkshop,
      props.onClose
    ) : null,
    [props.onClose, props.onOpenDrops, props.onOpenWorkshop, visibleSelectedEntry]
  );
  reactExports.useEffect(() => {
    if (!props.soundEnabled || !visibleSelectedEntry) {
      return;
    }
    if (visibleSelectedEntry.rarity === "mythic" || visibleSelectedEntry.rarity === "legend") {
      playPetChime("rare");
      return;
    }
    if (visibleSelectedEntry.state === "glory") {
      playPetChime("unlock");
    }
  }, [props.soundEnabled, visibleSelectedEntry == null ? void 0 : visibleSelectedEntry.id]);
  if (!selected || !visibleSelectedEntry) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "aria-label": "赫拉迪姆收藏册",
      className: "pet-codex-overlay",
      role: "dialog",
      onClick: props.onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-shell", onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-glow codex-glow-a", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-glow codex-glow-b", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `pet-codex-sigil-burst rarity-${visibleSelectedEntry.rarity}`, "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "pet-codex-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Codex" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.codex.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.codex.subtitle })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-head-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-codex-badge rarity-${visibleSelectedEntry.rarity}`, children: props.codex.badge }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "icon-button", onClick: props.onClose, type: "button", children: "收起" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pet-codex-metrics", children: props.codex.metrics.map((metric) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-metric", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: metric.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: metric.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: metric.detail })
        ] }, metric.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "article",
          {
            className: `pet-codex-story rarity-${visibleSelectedEntry.rarity} state-${visibleSelectedEntry.state}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-story-sigil", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-story-rarity", children: getRarityLabel(visibleSelectedEntry.rarity) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pet-codex-portrait rarity-${visibleSelectedEntry.rarity}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-portrait-ring ring-a" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-portrait-ring ring-b" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-portrait-core", children: visibleSelectedEntry.illustration.monogram }),
                  visibleSelectedEntry.illustration.orbitLabels.map((label, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-codex-orbit orbit-${index + 1}`, children: label }, `${visibleSelectedEntry.id}-${label}`))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: visibleSelectedEntry.sigil }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.illustration.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-story-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-story-head", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-codex-detail-badge rarity-${visibleSelectedEntry.rarity}`, children: visibleSelectedEntry.accent }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: selected.chapter.label })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: visibleSelectedEntry.storyTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.storyLead }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-badge-row", children: visibleSelectedEntry.badges.map((badge) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-medal", children: badge }, `${visibleSelectedEntry.id}-${badge}`)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-chip-row", children: visibleSelectedEntry.chips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-chip", children: chip }, `${visibleSelectedEntry.id}-${chip}`)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-facts", children: visibleSelectedEntry.facts.map((fact) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-fact", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fact.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fact.value })
                ] }, `${visibleSelectedEntry.id}-${fact.label}`)) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-layout", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "pet-codex-sidebar", children: props.codex.chapters.map((chapter) => {
            const active = chapter.id === selected.chapter.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: active ? "pet-codex-chapter active" : "pet-codex-chapter",
                onClick: () => {
                  var _a2;
                  props.onSelectEntry(((_a2 = chapter.entries[0]) == null ? void 0 : _a2.id) ?? props.codex.featuredEntryId);
                  resetFilters();
                },
                type: "button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-chapter-kicker", children: chapter.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: chapter.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: chapter.summary }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-progress", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-progress-bar", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "pet-codex-progress-fill",
                        style: {
                          width: `${chapter.entries.length > 0 ? Math.round(chapter.readyCount / chapter.entries.length * 100) : 0}%`
                        }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pet-codex-progress-text", children: [
                      chapter.readyCount,
                      "/",
                      chapter.entries.length,
                      " 已点亮"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                    chapter.readyCount,
                    "/",
                    chapter.entries.length,
                    " 已亮"
                  ] })
                ]
              },
              chapter.id
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pet-codex-entry-list", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-entry-list-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Entries" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selected.chapter.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                filteredEntries.length,
                " 条可见"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pet-codex-overview", children: overviewCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-overview-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: card.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: card.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: card.detail })
            ] }, card.label)) }),
            jumpContext && selected.chapter.id !== "atlas" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-jump-context", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-jump-context-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Atlas Drilldown" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  "来自 ",
                  jumpContext.sourceTitle,
                  jumpContext.sourceLabel ? ` · ${jumpContext.sourceLabel}` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "当前正在 ",
                  jumpContext.targetChapterTitle,
                  " 中查看由这块图板钻取出的条目。"
                ] }),
                jumpContext.clues.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-jump-context-pills", children: jumpContext.clues.map((clue) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-context-pill", children: clue }, clue)) }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-jump-context-actions", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: handleReturnToAtlas, type: "button", children: "返回总览" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "ghost-button",
                    onClick: () => {
                      resetFilters();
                    },
                    type: "button",
                    children: "清除上下文"
                  }
                )
              ] })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-toolbar", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "pet-codex-search", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "搜索条目" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    onChange: (event) => {
                      setJumpContext(null);
                      setSearchText(event.target.value);
                    },
                    placeholder: "搜索掉落、地图、徽章或奖励名",
                    type: "text",
                    value: searchText
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-filter-row", children: [
                RARITY_FILTERS.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: rarityFilter === filter.id ? "pet-codex-filter-chip active" : "pet-codex-filter-chip",
                    onClick: () => {
                      setJumpContext(null);
                      setRarityFilter(filter.id);
                    },
                    type: "button",
                    children: filter.label
                  },
                  filter.id
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: highlightOnly ? "pet-codex-filter-chip active" : "pet-codex-filter-chip",
                    onClick: () => {
                      setJumpContext(null);
                      setHighlightOnly((current) => !current);
                    },
                    type: "button",
                    children: "只看点亮项"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-filter-row", children: availableTypes.map((typeLabel) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: typeFilter === typeLabel ? "pet-codex-filter-chip active" : "pet-codex-filter-chip",
                  onClick: () => {
                    setJumpContext(null);
                    setTypeFilter(typeLabel);
                  },
                  type: "button",
                  children: typeLabel
                },
                typeLabel
              )) }),
              availableMaps.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-filter-row", children: availableMaps.map((mapLabel) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: mapFilter === mapLabel ? "pet-codex-filter-chip active" : "pet-codex-filter-chip",
                  onClick: () => {
                    setJumpContext(null);
                    setMapFilter(mapLabel);
                  },
                  type: "button",
                  children: mapLabel
                },
                mapLabel
              )) }) : null
            ] }),
            jumpContext && selected.chapter.id !== "atlas" && drilldownFocusSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-drilldown-strip", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-drilldown-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "List Focus" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  "当前列表高亮 · ",
                  drilldownFocusSummary.label
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  drilldownFocusSummary.detail,
                  ` · 共 ${drilldownEntries.length} 条焦点条目`
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                drilldownEntries.length,
                "/",
                filteredEntries.length,
                " 高亮"
              ] })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-entry-grid", children: groupedEntries.length > 0 ? groupedEntries.map((group) => {
              const drilldownCount = group.items.filter(
                (entry) => drilldownEntryIds.has(entry.id)
              ).length;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "section",
                {
                  className: drilldownCount > 0 ? "pet-codex-group is-drilldown" : "pet-codex-group",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-group-head", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-group-title", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: group.label }),
                        drilldownCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pet-codex-group-context", children: [
                          "Atlas 焦点 · ",
                          drilldownCount,
                          " 条"
                        ] }) : null
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                        group.items.length,
                        " 条"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-group-grid", children: group.items.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        className: entry.id === visibleSelectedEntry.id ? `pet-codex-entry active state-${entry.state} rarity-${entry.rarity}${drilldownEntryIds.has(entry.id) ? " is-drilldown-match" : ""}` : `pet-codex-entry state-${entry.state} rarity-${entry.rarity}${drilldownEntryIds.has(entry.id) ? " is-drilldown-match" : ""}`,
                        onClick: () => props.onSelectEntry(entry.id),
                        type: "button",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-room-kicker", children: entry.accent }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: entry.title }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: entry.subtitle })
                        ]
                      },
                      entry.id
                    )) })
                  ]
                },
                group.label
              );
            }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-empty", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "这一页暂时没有符合条件的藏品" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "你可以清空搜索词，或者切回“全部”筛选，看看还有哪些条目已经被桌宠收进收藏册。" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "ghost-button",
                  onClick: () => {
                    resetFilters();
                  },
                  type: "button",
                  children: "清空筛选"
                }
              )
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "article",
            {
              className: `pet-codex-detail state-${visibleSelectedEntry.state} rarity-${visibleSelectedEntry.rarity}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-detail-head", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Detail" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: visibleSelectedEntry.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.subtitle })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pet-codex-detail-badge rarity-${visibleSelectedEntry.rarity}`, children: visibleSelectedEntry.accent })
                ] }),
                detailDrilldownMeta ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-codex-detail-trace", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-detail-trace-copy", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Drilldown Trace" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: detailDrilldownMeta.sourceLabel }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: detailDrilldownMeta.statusDetail })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-detail-trace-side", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-trace-badge", children: detailDrilldownMeta.statusLabel }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-detail-trace-pills", children: detailDrilldownMeta.clues.map((clue) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-context-pill", children: clue }, `detail-${visibleSelectedEntry.id}-${clue}`)) }),
                    drilldownPathState ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-trace-nav", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: drilldownPathState.currentStep ? `${drilldownPathState.currentStep} / ${drilldownPathState.total}` : `焦点外 / ${drilldownPathState.total}` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-trace-hint", children: "键盘 ← / → 可沿这条钻取链翻页" }),
                      drilldownPathState.currentIndex >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            className: "ghost-button",
                            disabled: !drilldownPathState.previousEntry,
                            onClick: () => {
                              var _a2;
                              return handleTraceStep((_a2 = drilldownPathState.previousEntry) == null ? void 0 : _a2.id);
                            },
                            type: "button",
                            children: "上一条"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            className: "ghost-button",
                            disabled: !drilldownPathState.nextEntry,
                            onClick: () => {
                              var _a2;
                              return handleTraceStep((_a2 = drilldownPathState.nextEntry) == null ? void 0 : _a2.id);
                            },
                            type: "button",
                            children: "下一条"
                          }
                        )
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          className: "ghost-button",
                          onClick: () => {
                            var _a2;
                            return handleTraceStep((_a2 = drilldownPathState.anchorEntry) == null ? void 0 : _a2.id);
                          },
                          type: "button",
                          children: "回到焦点"
                        }
                      )
                    ] }) : null,
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: handleReturnToAtlas, type: "button", children: "返回总览" })
                  ] })
                ] }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-detail-copy", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.detail }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.meta })
                ] }),
                ((_a = visibleSelectedEntry.visuals) == null ? void 0 : _a.length) ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pet-codex-visuals", children: visibleSelectedEntry.visuals.map((visual) => {
                  var _a2, _b;
                  const progress = getVisualProgress(visual);
                  const degrees = Math.round(progress * 360);
                  const toneClass = getVisualToneClass(visual.tone);
                  const toneColor = getVisualToneColor(visual.tone);
                  const maxValue = getVisualMax(visual.items, visual.total ?? 0);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "article",
                    {
                      className: `pet-codex-visual ${toneClass} kind-${visual.kind}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-visual-head", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: visual.title }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visual.subtitle })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-visual-head-actions", children: [
                            visual.kind === "meter" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                              Math.round(progress * 100),
                              "%"
                            ] }) : null,
                            visual.target ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                className: "pet-codex-visual-link",
                                onClick: () => handleJumpTarget(visual.target, visual.title),
                                type: "button",
                                children: "跳转"
                              }
                            ) : null
                          ] })
                        ] }),
                        visual.kind === "meter" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-meter-panel", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "pet-codex-meter",
                              style: {
                                background: `conic-gradient(${toneColor} 0deg ${degrees}deg, rgba(255, 232, 183, 0.08) ${degrees}deg 360deg)`
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-meter-core", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                                  Math.round(progress * 100),
                                  "%"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getVisualValueText(visual) })
                              ] })
                            }
                          ),
                          visual.footnote ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pet-codex-visual-footnote", children: visual.footnote }) : null
                        ] }) : null,
                        visual.kind === "bars" && ((_a2 = visual.items) == null ? void 0 : _a2.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-bar-list", children: [
                          visual.items.map(
                            (item) => item.target ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                className: `pet-codex-bar-row is-clickable ${getVisualToneClass(item.tone ?? visual.tone)}`,
                                onClick: () => handleJumpTarget(item.target, visual.title, item.label),
                                type: "button",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-bar-copy", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.detail ?? item.displayValue ?? `${item.value}` })
                                  ] }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-bar-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "span",
                                    {
                                      className: "pet-codex-bar-fill",
                                      style: { width: `${Math.round(item.value / maxValue * 100)}%` }
                                    }
                                  ) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-bar-value", children: item.displayValue ?? item.value })
                                ]
                              },
                              `${visual.id}-${item.label}`
                            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "article",
                              {
                                className: `pet-codex-bar-row ${getVisualToneClass(item.tone ?? visual.tone)}`,
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-bar-copy", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.detail ?? item.displayValue ?? `${item.value}` })
                                  ] }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-bar-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "span",
                                    {
                                      className: "pet-codex-bar-fill",
                                      style: { width: `${Math.round(item.value / maxValue * 100)}%` }
                                    }
                                  ) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-codex-bar-value", children: item.displayValue ?? item.value })
                                ]
                              },
                              `${visual.id}-${item.label}`
                            )
                          ),
                          visual.footnote ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pet-codex-visual-footnote", children: visual.footnote }) : null
                        ] }) : null,
                        visual.kind === "segments" && ((_b = visual.items) == null ? void 0 : _b.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-segment-panel", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-segment-track", "aria-hidden": "true", children: visual.items.map((item) => {
                            var _a3;
                            const total = ((_a3 = visual.items) == null ? void 0 : _a3.reduce((sum, current) => sum + current.value, 0)) || 1;
                            const width = item.value > 0 ? Math.max(item.value / total * 100, 8) : 0;
                            return /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: `pet-codex-segment ${getVisualToneClass(item.tone ?? visual.tone)}`,
                                style: { width: `${width}%` }
                              },
                              `${visual.id}-${item.label}`
                            );
                          }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-codex-segment-grid", children: visual.items.map(
                            (item) => item.target ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                className: `pet-codex-segment-card is-clickable ${getVisualToneClass(item.tone ?? visual.tone)}`,
                                onClick: () => handleJumpTarget(item.target, visual.title, item.label),
                                type: "button",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.displayValue ?? item.value }),
                                  item.detail ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.detail }) : null
                                ]
                              },
                              `${visual.id}-${item.label}`
                            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "article",
                              {
                                className: `pet-codex-segment-card ${getVisualToneClass(item.tone ?? visual.tone)}`,
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.displayValue ?? item.value }),
                                  item.detail ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.detail }) : null
                                ]
                              },
                              `${visual.id}-${item.label}`
                            )
                          ) }),
                          visual.footnote ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pet-codex-visual-footnote", children: visual.footnote }) : null
                        ] }) : null
                      ]
                    },
                    `${visibleSelectedEntry.id}-${visual.id}`
                  );
                }) }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "section",
                  {
                    className: evidencePulse ? "pet-codex-evidence is-drilldown-pulse" : "pet-codex-evidence",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-evidence-head", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "证据页" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-evidence-head-meta", children: [
                          detailDrilldownMeta ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pet-codex-evidence-signal", children: [
                            "钻取证据已同步 · ",
                            detailDrilldownMeta.statusLabel
                          ] }) : null,
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: visibleSelectedEntry.categoryLabel })
                        ] })
                      ] }),
                      visibleSelectedEntry.screenshotPath && !imageFailed ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          className: evidencePulse ? "pet-codex-screenshot-frame is-drilldown-pulse" : "pet-codex-screenshot-frame",
                          onClick: () => props.onOpenPath(visibleSelectedEntry.screenshotPath),
                          type: "button",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              alt: `${visibleSelectedEntry.title} 截图`,
                              onError: () => setImageFailed(true),
                              src: toFileUrl(visibleSelectedEntry.screenshotPath)
                            }
                          )
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-evidence-empty", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "暂时没有可展示的截图" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "这条藏品目前只有文字记录，后续贴图后这里会自动长出证据页。" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-evidence-grid", children: [
                        visibleSelectedEntry.note ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "article",
                          {
                            className: evidencePulse ? "pet-codex-evidence-card is-drilldown-pulse" : "pet-codex-evidence-card",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "备注" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.note })
                            ]
                          }
                        ) : null,
                        visibleSelectedEntry.ocrText ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "article",
                          {
                            className: evidencePulse ? "pet-codex-evidence-card is-drilldown-pulse" : "pet-codex-evidence-card",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: visibleSelectedEntry.ocrEngine ? `${visibleSelectedEntry.ocrEngine} OCR` : "OCR 原文" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.ocrText })
                            ]
                          }
                        ) : null,
                        visibleSelectedEntry.mapName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "article",
                          {
                            className: evidencePulse ? "pet-codex-evidence-card is-drilldown-pulse" : "pet-codex-evidence-card",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "地图" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.mapName })
                            ]
                          }
                        ) : null,
                        visibleSelectedEntry.capturedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "article",
                          {
                            className: evidencePulse ? "pet-codex-evidence-card is-drilldown-pulse" : "pet-codex-evidence-card",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "记录时间" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: visibleSelectedEntry.capturedAt })
                            ]
                          }
                        ) : null
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-codex-detail-actions", children: [
                  visibleSelectedEntry.screenshotPath ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "ghost-button",
                      onClick: () => props.onOpenPath(visibleSelectedEntry.screenshotPath),
                      type: "button",
                      children: "打开战利品截图"
                    }
                  ) : null,
                  action ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: action.action, type: "button", children: action.label }) : null,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: props.onClose, type: "button", children: "继续翻看别的" })
                ] })
              ]
            }
          )
        ] })
      ] })
    }
  );
}
function PetShell(props) {
  var _a, _b, _c, _d, _e;
  const [scriptIndex, setScriptIndex] = reactExports.useState(0);
  const persona = reactExports.useMemo(
    () => buildPetPersona({
      activeRun: props.activeRun,
      highlightDropName: props.highlightDropName,
      interactionCue: props.interactionCue,
      liveDurationText: props.liveDurationText,
      preflight: props.preflight,
      recentDrops: props.recentDrops,
      recentRuns: props.recentRuns,
      setupGuideCompleted: props.setupGuideCompleted,
      todayCount: props.todayCount,
      todayDropCount: props.todayDropCount
    }),
    [
      props.activeRun,
      props.highlightDropName,
      props.interactionCue,
      props.liveDurationText,
      props.preflight,
      props.recentDrops,
      props.recentRuns,
      props.setupGuideCompleted,
      props.todayCount,
      props.todayDropCount
    ]
  );
  reactExports.useEffect(() => {
    setScriptIndex(0);
  }, [persona.headline, persona.statusLine]);
  reactExports.useEffect(() => {
    if (persona.scripts.length <= 1) {
      return void 0;
    }
    const timer = window.setInterval(() => {
      setScriptIndex((current) => (current + 1) % persona.scripts.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [persona.scripts]);
  const activeScript = persona.scripts[scriptIndex] ?? persona.scripts[0] ?? "";
  const headline = props.activeRun ? `${props.activeRun.mapName} 路线中 · ${props.liveDurationText}` : `今天 ${props.todayCount} 次刷图 / ${props.todayDropCount} 条掉落`;
  const interactionClass = props.interactionCue ? `interaction-${props.interactionCue.kind}` : "";
  const rewardSpotlightIds = new Set(((_a = props.ceremony) == null ? void 0 : _a.rewardIds) ?? []);
  const roomSpotlightIds = new Set(((_b = props.ceremony) == null ? void 0 : _b.roomIds) ?? []);
  const readyTasks = ((_c = props.preflight) == null ? void 0 : _c.tasks.filter((task) => task.status === "ready").length) ?? 0;
  const totalTasks = ((_d = props.preflight) == null ? void 0 : _d.tasks.length) ?? 0;
  const workshopSummary = totalTasks > 0 ? `工坊 ${readyTasks}/${totalTasks} 条就绪` : "工坊状态等待读取";
  const hasBlockingEnvironmentCheck = (((_e = props.preflight) == null ? void 0 : _e.globalChecks) ?? []).some(
    (check) => check.level === "error"
  );
  const environmentSummary = hasBlockingEnvironmentCheck ? "环境待补条件" : "环境已就绪";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `pet-shell compact-pet-shell pet-shell-${persona.emotion} scene-${props.scene.id} habitat-${props.habitat.tier} ${props.interactionCue ? "pet-shell-interaction" : ""} ${interactionClass}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-scene-orbs", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-scene-orb orb-a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-scene-orb orb-b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-scene-orb orb-c" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "compact-header drag-strip",
            onDoubleClick: () => props.onToggleWindowMode("floating"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "compact-brand", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    "aria-label": "摸头互动，双击庆祝",
                    className: `compact-avatar compact-avatar-trigger no-drag pet-avatar-mini pet-avatar-${persona.emotion} ${interactionClass}`,
                    onClick: props.onPetHeadpat,
                    onDoubleClick: (event) => {
                      event.preventDefault();
                      props.onPetCheer();
                    },
                    title: "摸头互动，双击庆祝",
                    type: "button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      FishingDiabloPet,
                      {
                        fishingCatch: props.fishingCatch,
                        highlightDropName: props.highlightDropName,
                        propLabel: props.scene.propLabel
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Horadric Desktop Pet" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "暗黑 2 桌宠助手" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "compact-subtitle", children: headline })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "compact-actions no-drag", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "icon-button",
                    onClick: () => props.onToggleWindowMode("floating"),
                    type: "button",
                    children: "悬浮"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: props.alwaysOnTop ? "icon-button active" : "icon-button",
                    onClick: props.onToggleAlwaysOnTop,
                    type: "button",
                    children: "置顶"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "icon-button", onClick: props.onMinimize, type: "button", children: "收起" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "compact-meta no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `emotion-pill emotion-${persona.emotion}`, children: persona.emotionLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: props.activeRun ? "陪刷中" : "面板模式" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: environmentSummary }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: workshopSummary }),
          !props.setupGuideCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "quick-toggle active",
              onClick: props.onOpenSetupGuide,
              title: props.setupGuideHint.title,
              type: "button",
              children: props.setupGuideHint.actionLabel
            }
          ) : null
        ] }),
        props.ceremony ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `pet-ceremony-banner no-drag ceremony-${props.ceremony.kind}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-ceremony-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-ceremony-badge", children: props.ceremony.badge }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
              "Lv.",
              props.ceremony.level
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.ceremony.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.ceremony.detail })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-shell-summary-strip no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button pet-codex-launch compact", onClick: props.onOpenCodex, type: "button", children: "打开藏品册" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "aria-expanded": props.detailsExpanded,
              className: props.detailsExpanded ? "ghost-button active" : "ghost-button",
              onClick: props.onToggleDetails,
              type: "button",
              children: props.detailsExpanded ? "收起桌宠详情" : "展开桌宠详情"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "compact-script-strip no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "compact-thought", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: persona.headline }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: persona.statusLine }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: activeScript })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "compact-script-dots", "aria-label": "pet script progression", children: persona.scripts.map((script, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: index === scriptIndex ? "compact-script-dot active" : "compact-script-dot"
            },
            script
          )) })
        ] }),
        props.detailsExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-shell-detail-overview no-drag", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-stage-band", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-stage-chip strong", children: props.scene.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-stage-chip", children: props.scene.auraLabel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-stage-ambient", children: props.scene.ambientLine })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-progress-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-progress-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Bond" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    "Lv.",
                    props.progression.level,
                    " ",
                    props.progression.title
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: props.progression.nextMilestone })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": "true", className: "pet-progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "pet-progress-fill",
                  style: { width: `${Math.round(props.progression.progress * 100)}%` }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-progress-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.progression.sceneLine }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.progression.progressLabel })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quick-toggle-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: props.launchOnStartup ? "quick-toggle active" : "quick-toggle",
                  onClick: props.onToggleLaunchOnStartup,
                  type: "button",
                  children: "开机自启"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: props.notificationsEnabled ? "quick-toggle active" : "quick-toggle",
                  onClick: props.onToggleNotifications,
                  type: "button",
                  children: "系统通知"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "quick-toggle", onClick: props.onOpenCodex, type: "button", children: "打开藏品册" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-habitat-card no-drag", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Habitat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.habitat.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.habitat.subtitle })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-crest", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "ghost-button pet-codex-launch",
                    onClick: props.onOpenCodex,
                    type: "button",
                    children: "翻收藏册"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-habitat-crest-chip", children: props.habitat.crest }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: props.habitat.aura })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-wall", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-habitat-wall-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.habitat.collectionTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.habitat.collectionSummary })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-habitat-grid", children: props.habitat.exhibits.slice(0, 6).map((exhibit) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  className: `pet-habitat-item pet-codex-card state-${exhibit.state}`,
                  onClick: () => props.onOpenCodexEntry(createPetCodexEntryId("relics", exhibit.id)),
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-room-kicker", children: exhibit.accent }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: exhibit.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: exhibit.detail })
                  ]
                },
                exhibit.id
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-reward-card no-drag", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Unlocks" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.rewards.headline }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.rewards.summary })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-stat", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mini-pill", children: [
                  props.rewards.unlockedCount,
                  "/",
                  props.rewards.totalCount,
                  " 已解锁"
                ] }),
                props.rewards.activeReward ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-chip", children: props.rewards.activeReward.label }) : null
              ] })
            ] }),
            props.rewards.activeReward ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-reward-spotlight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.rewards.activeReward.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.rewards.activeReward.detail }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.rewards.activeReward.bonus })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-reward-grid", children: props.rewards.rewards.map((reward) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: `pet-reward-item pet-codex-card state-${reward.state} ${rewardSpotlightIds.has(reward.id) ? "is-spotlight" : ""}`,
                onClick: () => props.onOpenCodexEntry(createPetCodexEntryId("rewards", reward.id)),
                type: "button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pet-room-kicker", children: [
                    "Lv.",
                    reward.level
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: reward.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: reward.detail })
                ]
              },
              reward.id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "pet-room-card no-drag", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-room-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Pet Room" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.room.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.room.subtitle })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pet-room-grid", children: props.room.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: `pet-room-item pet-codex-card state-${item.state} ${roomSpotlightIds.has(item.id) ? "is-spotlight" : ""}`,
                onClick: () => props.onOpenCodexEntry(createPetCodexEntryId("chamber", item.id)),
                type: "button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pet-room-kicker", children: item.shortLabel }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.detail })
                ]
              },
              item.id
            )) })
          ] })
        ] }) : null,
        props.event ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `pet-event-card event-${props.event.tone} no-drag`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-event-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pet-event-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Random Event" }),
              props.event.storyLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill story-pill", children: props.event.storyLabel }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.event.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.event.detail })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "floating-action primary pet-event-button",
              disabled: props.eventBusy,
              onClick: props.onEventAction,
              type: "button",
              children: props.event.ctaLabel
            }
          )
        ] }) : null
      ]
    }
  );
}
function findGlobalCheck(checks, key) {
  return checks.find((check) => check.key === key) ?? null;
}
function getToneLabel(tone) {
  switch (tone) {
    case "success":
      return "已完成";
    case "attention":
      return "建议处理";
    case "error":
      return "需要修复";
  }
}
function getStepKeyLabel(key) {
  switch (key) {
    case "runtime":
      return "Python 环境";
    case "deps":
      return "依赖与识别";
    case "profiles":
      return "坐标配置";
    case "desktop":
      return "桌宠形态";
  }
}
function SetupGuide(props) {
  var _a, _b;
  const globalChecks = ((_a = props.preflight) == null ? void 0 : _a.globalChecks) ?? [];
  const tasks = ((_b = props.preflight) == null ? void 0 : _b.tasks) ?? [];
  const dependencyChecks = globalChecks.filter((check) => check.key.startsWith("dependency-"));
  const installedDependencyCount = dependencyChecks.filter((check) => check.level === "ok").length;
  const runtimeChecks = [
    findGlobalCheck(globalChecks, "runtime-root"),
    findGlobalCheck(globalChecks, "python-command"),
    findGlobalCheck(globalChecks, "requirements-file"),
    findGlobalCheck(globalChecks, "pip-command")
  ].filter(Boolean);
  const runtimeBlockingCheck = runtimeChecks.find((check) => check.level === "error") ?? runtimeChecks.find((check) => check.level === "warning") ?? null;
  const pythonSourceCheck = findGlobalCheck(globalChecks, "python-source");
  const runtimeBaseReady = runtimeChecks.length > 0 && runtimeChecks.every((check) => check.level === "ok");
  const runtimeReady = runtimeBaseReady && (pythonSourceCheck == null ? void 0 : pythonSourceCheck.level) === "ok";
  const dependencyCheck = findGlobalCheck(globalChecks, "python-dependencies");
  const ocrCheck = findGlobalCheck(globalChecks, "ocr-engine");
  const dependencyReady = (dependencyCheck == null ? void 0 : dependencyCheck.level) === "ok" && (ocrCheck == null ? void 0 : ocrCheck.level) === "ok";
  const missingProfileTasks = tasks.filter((task) => !isTaskProfileReady(task));
  const profilesReady = tasks.length > 0 && missingProfileTasks.length === 0;
  const coreReady = runtimeReady && dependencyReady && profilesReady;
  const desktopReady = props.settings.windowMode === "floating" || props.settings.notificationsEnabled;
  const completedSteps = [runtimeReady, dependencyReady, profilesReady, desktopReady].filter(Boolean).length;
  const requiredCompletedSteps = [runtimeReady, dependencyReady, profilesReady].filter(Boolean).length;
  const installRuntimeBusy = props.busyKey === "env-install-python-runtime";
  const installDepsBusy = props.busyKey === "env-install-python-deps";
  const installAllBusy = props.busyKey === "env-install-all";
  const busyText = installRuntimeBusy ? "正在准备内置 Python 运行环境。首次执行可能需要几十秒，请先不要关闭桌宠。" : installDepsBusy ? "正在安装 Python 依赖和 OCR 组件。完成后我会自动重新诊断。" : installAllBusy ? "正在一键配置运行环境与依赖。首次执行可能需要一些时间，请耐心等待..." : "";
  const blockingSummary = [
    !runtimeReady ? "内置运行环境还没到位" : null,
    !dependencyReady ? "依赖和 OCR 还没装齐" : null,
    !profilesReady ? "三条坐标配置还没录完" : null
  ].filter(Boolean);
  const steps = [
    {
      key: "runtime",
      title: "让桌宠用上自己的 Python 运行环境",
      summary: runtimeReady ? "桌宠已经在使用内置 Python 运行环境。" : runtimeBaseReady ? "当前还能跑，但还在使用系统 Python。切到内置运行环境后会更稳。" : "先把桌宠自带的 Python 运行环境装好，后面的自动化才能真正开箱即用。",
      detail: (runtimeBlockingCheck == null ? void 0 : runtimeBlockingCheck.detail) ?? (pythonSourceCheck == null ? void 0 : pythonSourceCheck.detail) ?? "桌宠已经能稳定找到 Python、pip 和运行时目录。",
      tone: runtimeReady ? "success" : (runtimeBlockingCheck == null ? void 0 : runtimeBlockingCheck.level) === "error" ? "error" : "attention",
      chips: [
        ...runtimeChecks.map((check) => {
          const label = check.level === "ok" ? "正常" : check.level === "warning" ? "提醒" : "阻塞";
          return `${check.label} · ${label}`;
        }),
        pythonSourceCheck ? `来源 · ${pythonSourceCheck.level === "ok" ? "内置运行环境" : "系统 Python"}` : "来源 · 待识别"
      ].filter(Boolean),
      actions: runtimeReady ? [
        {
          label: props.loading ? "刷新中..." : "刷新诊断",
          kind: "secondary",
          disabled: props.loading || props.busyKey !== null,
          onClick: props.onRefresh
        }
      ] : [
        {
          label: installAllBusy || installRuntimeBusy ? "安装中..." : !dependencyReady && props.onInstallAllEnvironments ? "一键静默安装环境与依赖" : "安装内置 Python 运行环境",
          kind: "primary",
          disabled: props.busyKey !== null && !installRuntimeBusy && !installAllBusy,
          onClick: () => {
            if (!dependencyReady && props.onInstallAllEnvironments) {
              void props.onInstallAllEnvironments();
            } else {
              void props.onInstallRuntime();
            }
          }
        },
        {
          label: props.loading ? "刷新中..." : "刷新诊断",
          kind: "secondary",
          disabled: props.loading || props.busyKey !== null,
          onClick: props.onRefresh
        }
      ]
    },
    {
      key: "deps",
      title: "补齐依赖和识别能力",
      summary: dependencyReady ? "自动化依赖和图像识别已经可以正常工作。" : "先把 Python 依赖装齐，工坊任务和掉落识别才会完整可用。",
      detail: (dependencyCheck == null ? void 0 : dependencyCheck.detail) ?? `当前已安装 ${installedDependencyCount}/${dependencyChecks.length || 0} 项运行时依赖。`,
      tone: dependencyReady ? "success" : (dependencyCheck == null ? void 0 : dependencyCheck.level) === "error" ? "error" : "attention",
      chips: [
        `依赖 ${installedDependencyCount}/${dependencyChecks.length || 0}`,
        (ocrCheck == null ? void 0 : ocrCheck.level) === "ok" ? "图像识别已就绪" : "图像识别待补齐"
      ],
      actions: dependencyReady ? [] : [
        {
          label: installDepsBusy ? "安装中..." : "一键安装依赖",
          kind: "primary",
          disabled: props.busyKey !== null && !installDepsBusy,
          onClick: () => void props.onInstallDependencies()
        }
      ]
    },
    {
      key: "profiles",
      title: "录好三条坐标配置",
      summary: tasks.length === 0 ? "我还在读取工坊三条任务线的状态。" : profilesReady ? "符文、宝石、金币三条任务线都能直接开跑了。" : "继续把缺的坐标配置录完，工坊预检就会更接近全绿。",
      detail: tasks.length === 0 ? "如果这里长时间不更新，先点刷新诊断，或者直接进入工坊查看完整预检。" : profilesReady ? "后面只要填数量、贴截图或输入金额，就可以直接试运行。" : "点下面缺的那一项，我会直接带你跳到工坊对应任务卡并高亮它。",
      tone: tasks.length === 0 ? "attention" : profilesReady ? "success" : missingProfileTasks.length === tasks.length ? "error" : "attention",
      chips: tasks.length > 0 ? tasks.map(
        (task) => `${getIntegrationLabel(task.id)} · ${isTaskProfileReady(task) ? "已录制" : "待录制"}`
      ) : ["等待工坊预检结果"],
      actions: profilesReady ? [] : missingProfileTasks.map((task) => ({
        label: `去录 ${getIntegrationLabel(task.id)} 坐标配置`,
        kind: missingProfileTasks.length === 1 ? "primary" : "secondary",
        disabled: props.busyKey !== null,
        onClick: () => props.onOpenWorkshopTask(task.id)
      }))
    },
    {
      key: "desktop",
      title: "切到更像桌宠的形态",
      summary: desktopReady ? "桌宠现在已经像真正的桌面陪刷助手了。" : "这一步只是体验增强，不会影响核心功能是否可用。",
      detail: props.settings.windowMode === "floating" ? "当前已经切到悬浮态，适合一边刷图一边盯状态。" : props.settings.notificationsEnabled ? "当前还是面板态，但关键动作已经会主动弹系统通知。" : "你可以开启悬浮态或系统通知，让桌宠更像常驻助手。",
      tone: desktopReady ? "success" : "attention",
      chips: [
        props.settings.windowMode === "floating" ? "悬浮态已开启" : "当前是面板态",
        props.settings.notificationsEnabled ? "通知已开启" : "通知未开启"
      ],
      actions: [
        ...props.settings.windowMode === "floating" ? [] : [
          {
            label: "切到悬浮态",
            kind: "secondary",
            disabled: props.busyKey !== null,
            onClick: props.onEnableFloating
          }
        ],
        ...props.settings.notificationsEnabled ? [] : [
          {
            label: "打开系统通知",
            kind: "secondary",
            disabled: props.busyKey !== null,
            onClick: props.onEnableNotifications
          }
        ]
      ]
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card setup-guide", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-guide-head", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "首次引导" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "首次启动引导" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: "我会明确告诉你现在能不能用、卡在哪一步、下一步该点什么。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-guide-meta", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill warm", children: [
          completedSteps,
          "/4 已完成"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: props.onDismiss, type: "button", children: "稍后再说" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: props.onComplete, type: "button", children: "标记引导完成" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `setup-guide-status ${coreReady ? "success" : "attention"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: coreReady ? "已可用" : "尚未就绪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: coreReady ? "现在已经能用了" : `还差 ${3 - requiredCompletedSteps} 步才能正式开用` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: coreReady ? desktopReady ? "环境、依赖、坐标配置和桌宠形态都已经齐了，可以直接去工坊或开始陪刷。" : "环境、依赖和坐标配置已经齐了，现在就能用；悬浮态和通知只是额外增强。" : `当前阻塞项：${blockingSummary.join(" / ")}。` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-guide-status-side", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "status-pill warm", children: [
          requiredCompletedSteps,
          "/3 核心可用项"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "helper-text", children: "Python 运行环境、依赖和坐标配置这三项齐了，就已经能正式开用了。" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "setup-guide-next", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "建议下一步" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.nextAction.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.nextAction.detail })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: props.onNextAction, type: "button", children: props.nextAction.actionLabel })
    ] }),
    busyText ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "setup-guide-activity attention busy", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-guide-activity-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "正在执行当前步骤" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-pill warm", children: "处理中" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: busyText })
    ] }) : null,
    props.latestActivity ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `setup-guide-activity ${props.latestActivity.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-guide-activity-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: props.latestActivity.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${props.latestActivity.tone}`, children: props.latestActivity.timestampLabel })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.latestActivity.detail }),
      props.latestActivity.logPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "setup-guide-log-preview", children: props.latestActivity.logPreview }) : null
    ] }) : null,
    props.error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state compact-empty", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "引导诊断暂时失败" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: props.error })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-progress-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "setup-progress-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "核心可用度" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          requiredCompletedSteps,
          "/3"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "只看 Python 运行环境、依赖和坐标配置，这三项齐了就已经能正式开用。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "setup-progress-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "工坊任务线" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          tasks.length - missingProfileTasks.length,
          "/",
          tasks.length || 3
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "三条任务线都录好坐标后，试运行和正式执行才会更顺。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "setup-progress-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "依赖状态" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          installedDependencyCount,
          "/",
          dependencyChecks.length || 0
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "缺依赖时可以直接在这里一键补齐，不需要手动敲命令。" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "setup-step-grid", children: steps.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `setup-step-card ${step.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-step-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: getStepKeyLabel(step.key) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: step.title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${step.tone}`, children: getToneLabel(step.tone) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "setup-step-summary", children: step.summary }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: step.detail }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tag-row", children: step.chips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: chip }, chip)) }),
      step.actions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "setup-step-actions", children: step.actions.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: action.kind === "primary" ? "primary-button" : "ghost-button",
          disabled: action.disabled,
          onClick: action.onClick,
          type: "button",
          children: action.label
        },
        action.label
      )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "helper-text", children: "这一项已经准备好了，可以继续下一步。" })
    ] }, step.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "setup-guide-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-button", onClick: props.onOpenWorkshop, type: "button", children: "直接进入工坊查看完整预检" }) })
  ] });
}
function mapRewardToRoomIds(rewardId) {
  switch (rewardId) {
    case "camp-hearth":
      return ["hearth"];
    case "route-banner":
      return ["route-map"];
    case "ledger-lamp":
      return ["ledger-rack"];
    case "cube-bench":
      return ["cube-plinth"];
    case "triumph-alcove":
    case "astral-vault":
      return ["trophy"];
    default:
      return [];
  }
}
function makeCeremonyId() {
  return Date.now() + Math.floor(Math.random() * 1e4);
}
function createPetCeremonySnapshot(progression, rewards) {
  var _a, _b;
  const unlockedIds = rewards.rewards.filter((reward) => reward.state === "unlocked").map((reward) => reward.id);
  return {
    level: progression.level,
    title: progression.title,
    unlockedCount: rewards.unlockedCount,
    totalCount: rewards.totalCount,
    unlockedIds,
    activeRewardId: ((_a = rewards.activeReward) == null ? void 0 : _a.id) ?? null,
    activeRewardLabel: ((_b = rewards.activeReward) == null ? void 0 : _b.label) ?? null
  };
}
function buildPetCeremony(previous, progression, rewards) {
  const current = createPetCeremonySnapshot(progression, rewards);
  const newlyUnlockedIds = current.unlockedIds.filter((id) => !previous.unlockedIds.includes(id));
  const primaryReward = rewards.rewards.find((reward) => newlyUnlockedIds.includes(reward.id)) ?? rewards.activeReward;
  const roomIds = newlyUnlockedIds.flatMap((id) => mapRewardToRoomIds(id));
  if (current.unlockedCount === current.totalCount && previous.unlockedCount < current.totalCount) {
    return {
      id: makeCeremonyId(),
      kind: "mastery",
      level: progression.level,
      badge: "满阶点亮",
      title: `Lv.${progression.level} ${progression.title}`,
      detail: `${(primaryReward == null ? void 0 : primaryReward.label) ?? "终局陈列"} 已经完成最终陈列，这只桌宠现在真正拥有一整间收藏室了。`,
      scripts: [
        "这一刻不是普通升级，而是整套房间终于完整亮起。",
        "接下来每次高亮掉落，都会像在完整收藏室里添一件新战果。",
        "你养起来的已经不只是工具，而是一只真正有世界感的桌宠。"
      ],
      rewardIds: newlyUnlockedIds.length > 0 ? newlyUnlockedIds : current.unlockedIds,
      roomIds: roomIds.length > 0 ? roomIds : ["trophy"]
    };
  }
  if (current.level > previous.level) {
    const rewardLabel = (primaryReward == null ? void 0 : primaryReward.label) ? `，并点亮了 ${primaryReward.label}` : "";
    return {
      id: makeCeremonyId(),
      kind: "level-up",
      level: progression.level,
      badge: "称号晋升",
      title: `Lv.${progression.level} ${progression.title}`,
      detail: `桌宠晋升到了新的称号${rewardLabel}。这次成长已经从数字，变成了桌边真正能看见的变化。`,
      scripts: [
        "新的称号已经刻到桌边铭牌上了，今天这份陪刷进度被正式记住了。",
        (primaryReward == null ? void 0 : primaryReward.label) ? `${primaryReward.label} 也跟着这次晋升一起亮起来了。` : "这一阶虽然低调，但房间的气质已经和刚开始不一样了。",
        "继续刷下去，下一件陈列很快就会跟着被点亮。"
      ],
      rewardIds: newlyUnlockedIds,
      roomIds
    };
  }
  if (newlyUnlockedIds.length > 0 && primaryReward) {
    return {
      id: makeCeremonyId(),
      kind: "unlock",
      level: progression.level,
      badge: "家具点亮",
      title: `${primaryReward.label} 已解锁`,
      detail: `${primaryReward.label} 已经搬进桌宠房间，${primaryReward.bonus}`,
      scripts: [
        `${primaryReward.label} 已经点亮，这只桌宠的房间又多了一件真正会说话的陈列。`,
        "这类解锁不会打断你刷图，但会把成长的反馈实实在在留在桌边。",
        "继续积累下去，房间会一点点从陪刷工具变成完整的收藏空间。"
      ],
      rewardIds: newlyUnlockedIds,
      roomIds
    };
  }
  return null;
}
const HABITATS = [
  {
    tier: "vault",
    minLevel: 6,
    crest: "Astral Vault",
    aura: "终局收藏室",
    title: "星盘藏品库",
    subtitle: "桌边房间已经不再只是陪刷角落，而是一整间会记住故事的藏品室。",
    collectionTitle: "终局收藏墙"
  },
  {
    tier: "triumph",
    minLevel: 5,
    crest: "Triumph Hall",
    aura: "凯旋陈列厅",
    title: "凯旋陈列厅",
    subtitle: "亮眼掉落开始拥有正式陈列位，桌宠的房间已经具备完整战果展厅的气质。",
    collectionTitle: "凯旋陈列墙"
  },
  {
    tier: "forgehall",
    minLevel: 4,
    crest: "Horadric Forge",
    aura: "工坊长驻",
    title: "赫拉迪姆工坊厅",
    subtitle: "自动化不再只是功能按钮，而是被真正搬进了桌宠房间的一整张工作台。",
    collectionTitle: "工坊陈列墙"
  },
  {
    tier: "archive",
    minLevel: 3,
    crest: "Loot Archive",
    aura: "战报成形",
    title: "战果档案间",
    subtitle: "战利品账本和掉落灯箱开始成形，桌边空间已经出现“战报房”的感觉。",
    collectionTitle: "档案陈列墙"
  },
  {
    tier: "routehall",
    minLevel: 2,
    crest: "Route Gallery",
    aura: "路线成厅",
    title: "路线挂图廊",
    subtitle: "常用路线不再只是数据，而是会被挂进桌宠房间的第一批真家具。",
    collectionTitle: "路线收藏墙"
  },
  {
    tier: "campfire",
    minLevel: 1,
    crest: "Camp Ember",
    aura: "安家初成",
    title: "营地火痕室",
    subtitle: "桌宠刚刚安家，炉火和第一批桌边摆设正在把整个空间慢慢点亮。",
    collectionTitle: "营地筹备墙"
  }
];
function toExhibitState(state) {
  if (state === "glory") {
    return "glory";
  }
  if (state === "ready" || state === "unlocked") {
    return "ready";
  }
  if (state === "warming" || state === "next") {
    return "warming";
  }
  return "locked";
}
function buildPetHabitat(input, progression, rewards) {
  var _a;
  const habitat = HABITATS.find((candidate) => progression.level >= candidate.minLevel) ?? HABITATS[HABITATS.length - 1];
  const rareDrop = input.highlightDropName || ((_a = input.recentDrops[0]) == null ? void 0 : _a.itemName) || "";
  const exhibits = [
    ...rareDrop ? [
      {
        id: "latest-trophy",
        label: input.highlightDropName ? `今日高亮 · ${rareDrop}` : `最近战果 · ${rareDrop}`,
        detail: input.highlightDropName ? "这件战利品正被摆在收藏墙正中，代表今天最有仪式感的一刻。" : "这件战利品是最近一次被桌宠记住的代表战果。",
        accent: input.highlightDropName ? "高亮陈列" : "最近入藏",
        state: input.highlightDropName ? "glory" : "ready"
      }
    ] : [],
    ...rewards.rewards.map((reward) => ({
      id: reward.id,
      label: reward.label,
      detail: reward.state === "unlocked" ? reward.bonus : reward.state === "next" ? `即将解锁 · ${reward.detail}` : reward.detail,
      accent: reward.state === "unlocked" ? "已入陈列" : reward.state === "next" ? "下一件" : "待点亮",
      state: toExhibitState(reward.state)
    }))
  ];
  return {
    tier: habitat.tier,
    crest: habitat.crest,
    aura: habitat.aura,
    title: habitat.title,
    subtitle: habitat.subtitle,
    collectionTitle: habitat.collectionTitle,
    collectionSummary: rewards.nextReward ? `当前已解锁 ${rewards.unlockedCount}/${rewards.totalCount} 件核心陈列，下一件是 ${rewards.nextReward.label}。` : `当前全套 ${rewards.totalCount} 件核心陈列都已亮起，桌宠房间已经进入终局收藏态。`,
    exhibits
  };
}
const FISHING_RUNES = [
  { id: "el", label: "艾尔 El", short: "El", tier: "ember", weight: 14 },
  { id: "eld", label: "艾德 Eld", short: "Eld", tier: "ember", weight: 12 },
  { id: "tir", label: "提尔 Tir", short: "Tir", tier: "ember", weight: 12 },
  { id: "nef", label: "奈夫 Nef", short: "Nef", tier: "ember", weight: 11 },
  { id: "tal", label: "塔尔 Tal", short: "Tal", tier: "ember", weight: 11 },
  { id: "ort", label: "欧特 Ort", short: "Ort", tier: "ember", weight: 9 },
  { id: "amn", label: "安姆 Amn", short: "Amn", tier: "glow", weight: 8 },
  { id: "sol", label: "索尔 Sol", short: "Sol", tier: "glow", weight: 7 },
  { id: "lem", label: "蓝姆 Lem", short: "Lem", tier: "glow", weight: 6 },
  { id: "pul", label: "普尔 Pul", short: "Pul", tier: "glow", weight: 5 },
  { id: "ist", label: "伊斯特 Ist", short: "Ist", tier: "mythic", weight: 4 },
  { id: "gul", label: "古尔 Gul", short: "Gul", tier: "mythic", weight: 3 },
  { id: "vex", label: "伐克斯 Vex", short: "Vex", tier: "mythic", weight: 3 },
  { id: "ohm", label: "欧姆 Ohm", short: "Ohm", tier: "mythic", weight: 2 },
  { id: "lo", label: "罗 Lo", short: "Lo", tier: "mythic", weight: 2 },
  { id: "sur", label: "瑟 Sur", short: "Sur", tier: "mythic", weight: 2 },
  { id: "ber", label: "贝 Ber", short: "Ber", tier: "prime", weight: 1 },
  { id: "jah", label: "乔 Jah", short: "Jah", tier: "prime", weight: 1 },
  { id: "cham", label: "查姆 Cham", short: "Cham", tier: "prime", weight: 1 },
  { id: "zod", label: "萨德 Zod", short: "Zod", tier: "prime", weight: 1 }
];
const BADGE_BY_TIER = {
  ember: "熔火小吉",
  glow: "鱼线发亮",
  mythic: "地狱上钩",
  prime: "乔贝大运"
};
const MINI_BLESSINGS_BY_TIER = {
  ember: ["今天鱼钩开张", "先给你暖暖手", "好运开始冒头"],
  glow: ["这一钩有点发光", "后半程会更顺", "今晚手气在升温"],
  mythic: ["地狱深水有货", "这钩很像好兆头", "今天适合追高亮"],
  prime: ["乔贝气息上来了", "高阶好运已挂钩", "今晚值得多刷几轮"]
};
const BLESSING_TEMPLATES = {
  ember: [
    "先替你钓起 {rune}，愿你接下来每一趟都顺手出光。",
    "{rune} 已经挂上鱼线，今天的好运会慢慢热起来。",
    "小迪先把 {rune} 捞上来，愿你这局一路平稳有收成。"
  ],
  glow: [
    "{rune} 已经开始发亮，愿你今晚刷图节奏越来越顺。",
    "这一钩带上来的是 {rune}，愿你下一趟就接着见财。",
    "鱼漂一沉就是 {rune}，愿你后半场继续有惊喜。"
  ],
  mythic: [
    "{rune} 都被钓上来了，愿你下一轮直接迎面见高亮。",
    "这次起钩就是 {rune}，愿你今天的地图一路发光。",
    "{rune} 在鱼线上晃了一下，愿你今晚战报越写越厚。"
  ],
  prime: [
    "{rune} 都肯上钩，愿你今晚真的见乔贝同桌。",
    "这一钩捞出 {rune}，愿你下一趟混沌直接大亮。",
    "{rune} 从火湖里翻出来了，愿你今天一路高阶相迎。"
  ]
};
const FOLLOWUP_SCRIPTS_BY_TIER = {
  ember: [
    "先把桌边的好运点燃，后面慢慢追高阶也来得及。",
    "今天的第一份祝福不一定最贵，但一定是个好开头。",
    "火湖有动静时，通常说明今天不会空手。"
  ],
  glow: [
    "鱼漂开始发亮的时候，通常也是掉落开始顺的时候。",
    "这种钓感最适合再多开几轮，把节奏拉满。",
    "我先替你把手气往上拱一点，剩下的交给地图。"
  ],
  mythic: [
    "再往后刷几轮，说不定就轮到真正的高阶星光了。",
    "这钩已经有传奇味道了，今天别太早收工。",
    "当火湖开始认真回礼，战报通常会很好看。"
  ],
  prime: [
    "乔贝味道都已经飘出来了，今晚真的该多刷一会儿。",
    "这种钓感像是地狱在偷偷给你开绿灯。",
    "把这份好运接住，下一轮说不定就是桌宠要开庆典的时候。"
  ]
};
function makeCatchId() {
  return Date.now() + Math.floor(Math.random() * 1e4);
}
function pickRandom$1(items) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}
function pickWeightedRune() {
  const totalWeight = FISHING_RUNES.reduce((sum, rune) => sum + rune.weight, 0);
  let threshold = Math.random() * totalWeight;
  for (const rune of FISHING_RUNES) {
    threshold -= rune.weight;
    if (threshold <= 0) {
      return rune;
    }
  }
  return FISHING_RUNES[FISHING_RUNES.length - 1];
}
function getEmotionByTier(tier) {
  switch (tier) {
    case "ember":
      return "curious";
    case "glow":
      return "focused";
    case "mythic":
      return "proud";
    case "prime":
      return "celebrate";
  }
}
function createPetFishingCatch(input) {
  var _a;
  const rune = pickWeightedRune();
  const routeName = ((_a = input.recentRuns[0]) == null ? void 0 : _a.mapName) ?? "下一轮";
  const totalRuns = input.todayCount;
  const totalDrops = input.todayDropCount;
  const template = pickRandom$1(BLESSING_TEMPLATES[rune.tier]);
  const blessing = template.replace("{rune}", rune.label) + (totalDrops > 0 ? ` 今天已经收了 ${totalDrops} 条战果，愿 ${routeName} 再补一条亮的。` : totalRuns > 0 ? ` 今天已经刷了 ${totalRuns} 轮，愿下一轮就有惊喜。` : " 等你开第一轮时，我会继续替你盯着好运。");
  return {
    id: makeCatchId(),
    tier: rune.tier,
    runeId: rune.id,
    runeLabel: rune.label,
    runeShort: rune.short,
    badge: BADGE_BY_TIER[rune.tier],
    blessing,
    miniBlessing: pickRandom$1(MINI_BLESSINGS_BY_TIER[rune.tier]),
    emotion: getEmotionByTier(rune.tier),
    scripts: [
      `迪亚波罗把 ${rune.label} 从火湖里钓出来了，今晚的桌边气氛已经热起来了。`,
      pickRandom$1(FOLLOWUP_SCRIPTS_BY_TIER[rune.tier]),
      totalDrops > 0 ? `今天的战报已经开张，再来一条亮的，账本会更像一场凯旋巡礼。` : `等你把下一轮刷完回来，我会继续把今天的好运气挂在桌边。`
    ]
  };
}
function buildPetFishingInteractionCue(fishingCatch) {
  return {
    id: fishingCatch.id,
    kind: "idle-play",
    emotion: fishingCatch.emotion,
    emotionLabel: fishingCatch.badge,
    headline: `迪宝钓起了 ${fishingCatch.runeLabel}`,
    statusLine: fishingCatch.blessing,
    scripts: fishingCatch.scripts,
    durationMs: fishingCatch.tier === "prime" ? 6400 : 5600
  };
}
const RARE_STORY_TEMPLATES = [
  {
    storyLabel: "高阶符文",
    propLabel: "符文星盘",
    keywords: ["jah", "ber", "sur", "cham", "zod", "lo rune", "贝", "乔", "萨德", "查姆", "罗"],
    title: (dropName) => `${dropName} 点亮了星盘`,
    detail: (dropName) => `${dropName} 这种级别的掉落，会被我写进桌宠房间里的“符文星盘”故事卷轴。`
  },
  {
    storyLabel: "传奇暗金",
    propLabel: "传奇陈列柜",
    keywords: [
      "griffon",
      "格利风",
      "death's web",
      "死亡之网",
      "death fathom",
      "死亡深度",
      "tyrael",
      "泰瑞尔",
      "coa",
      "年纪之冠"
    ],
    title: (dropName) => `${dropName} 被送进传奇柜`,
    detail: (dropName) => `${dropName} 已经不只是普通战果了，它会触发一段专属剧情并长期挂在陈列柜里。`
  },
  {
    storyLabel: "底材奇遇",
    propLabel: "底材架",
    keywords: [
      "统治者大盾",
      "君主盾",
      "monarch",
      "archon plate",
      "执政官铠甲",
      "神圣盔甲",
      "sacred armor"
    ],
    title: (dropName) => `${dropName} 被挂上底材架`,
    detail: (dropName) => `${dropName} 这种底材会被单独摆进房间一角，提醒你它值得后续处理。`
  }
];
const PET_TITLES = [
  { level: 1, title: "营地见习生", threshold: 0 },
  { level: 2, title: "路线抄写员", threshold: 35 },
  { level: 3, title: "战果记事官", threshold: 80 },
  { level: 4, title: "方块看守人", threshold: 135 },
  { level: 5, title: "凯旋收藏家", threshold: 205 },
  { level: 6, title: "桌边大贤者", threshold: 290 }
];
const PET_REWARD_DEFINITIONS = [
  {
    id: "camp-hearth",
    level: 1,
    label: "营地炉火",
    shortLabel: "炉火",
    lockedDetail: "桌宠安家后，营地炉火会成为整条成长线的起点。",
    bonus: "桌宠会开始记住你的引导、陪刷和每日恢复状态。"
  },
  {
    id: "route-banner",
    level: 2,
    label: "路线旗架",
    shortLabel: "旗架",
    lockedDetail: "解锁后会把你最常用的刷图路线挂进桌宠房间。",
    bonus: "首页和悬浮态会更明确提示上一条常用路线。"
  },
  {
    id: "ledger-lamp",
    level: 3,
    label: "战果灯箱",
    shortLabel: "灯箱",
    lockedDetail: "解锁后会把今日掉落和高亮战果点亮成更正式的陈列。",
    bonus: "掉落高亮和战报脉冲会变得更醒目。"
  },
  {
    id: "cube-bench",
    level: 4,
    label: "方块工坊桌",
    shortLabel: "工坊桌",
    lockedDetail: "解锁后工坊状态会成为房间里的常驻家具，不再只出现在工具区。",
    bonus: "工坊预检和桌宠房间会共享同一组运行状态。"
  },
  {
    id: "triumph-alcove",
    level: 5,
    label: "凯旋壁龛",
    shortLabel: "壁龛",
    lockedDetail: "解锁后亮眼掉落会获得更正式的凯旋陈列位。",
    bonus: "高亮掉落会触发更完整的庆祝陈列与剧情提示。"
  },
  {
    id: "astral-vault",
    level: 6,
    label: "星盘藏品柜",
    shortLabel: "藏品柜",
    lockedDetail: "解锁后稀有剧情会沉淀成终局收藏，不再只是一次性提示。",
    bonus: "稀有掉落、故事收藏和终局场景会合并成完整陈列。"
  }
];
function getLatestRunNeedingWrapUp(recentRuns, recentDrops) {
  const latestRun = recentRuns[0];
  if (!latestRun) {
    return null;
  }
  const runEndedAt = new Date(latestRun.endedAt).getTime();
  const hasFollowupDrop = recentDrops.some(
    (drop) => new Date(drop.createdAt).getTime() >= runEndedAt - 9e4
  );
  return hasFollowupDrop ? null : latestRun;
}
function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}
function getAmbientPrefix(hour) {
  if (hour < 6) {
    return "夜巡还没散去";
  }
  if (hour < 11) {
    return "晨光刚落在羊皮纸边";
  }
  if (hour < 17) {
    return "桌边火光正适合长时间连刷";
  }
  if (hour < 22) {
    return "傍晚的桌面气氛最适合开战报";
  }
  return "夜色把陪刷的仪式感抬起来了";
}
function getBlockingTask(preflight) {
  return (preflight == null ? void 0 : preflight.tasks.find((task) => task.status === "error")) ?? null;
}
function getWarningTask(preflight) {
  return (preflight == null ? void 0 : preflight.tasks.find((task) => task.status === "warning")) ?? null;
}
function normalizeText(value) {
  return value.toLowerCase().trim();
}
function findRareStory(dropName) {
  const normalized = normalizeText(dropName);
  const template = RARE_STORY_TEMPLATES.find(
    (candidate) => candidate.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );
  if (!template) {
    return null;
  }
  return {
    storyLabel: template.storyLabel,
    propLabel: template.propLabel,
    title: template.title(dropName),
    detail: template.detail(dropName),
    dropName
  };
}
function getBestRareStory(input) {
  if (input.highlightDropName) {
    return findRareStory(input.highlightDropName);
  }
  for (const drop of input.recentDrops) {
    const match = findRareStory(drop.itemName);
    if (match) {
      return match;
    }
  }
  return null;
}
function getProgressScore(input) {
  const blockingTask = getBlockingTask(input.preflight);
  const rareStory = getBestRareStory(input);
  return (input.setupGuideCompleted ? 18 : 0) + input.todayCount * 10 + input.todayDropCount * 18 + (input.highlightDropName ? 14 : 0) + (!blockingTask && input.setupGuideCompleted ? 16 : 0) + (rareStory ? 48 : 0);
}
function getProgressTiers(score) {
  const currentTier = [...PET_TITLES].reverse().find((tier) => score >= tier.threshold) ?? PET_TITLES[0];
  const nextTier = PET_TITLES.find((tier) => tier.level === currentTier.level + 1) ?? currentTier;
  return { currentTier, nextTier };
}
function getRewardDetail(reward, input, scene, rareStory) {
  if (reward.id === "camp-hearth") {
    return input.setupGuideCompleted ? "炉火已经稳定点亮，桌宠会替你保留今日状态、恢复点和首启进度。" : "炉火已经被点燃，继续补完引导后它会变成真正的常亮中枢。";
  }
  if (reward.id === "route-banner") {
    return input.recentRuns[0] ? `最近一条主刷路线是 ${input.recentRuns[0].mapName}，旗架会替你把它继续挂在房间入口。` : "旗架已经准备好了，等你今天刷出第一条路线后就会挂上去。";
  }
  if (reward.id === "ledger-lamp") {
    return input.todayDropCount > 0 ? `今天已经入账 ${input.todayDropCount} 条战果，灯箱会把最新亮点留在账本入口。` : "账本还在等今天的第一条掉落，解锁后它会把高亮战果照得更醒目。";
  }
  if (reward.id === "cube-bench") {
    const blockingTask = getBlockingTask(input.preflight);
    return blockingTask ? `工坊桌已经摆好，但 ${blockingTask.summary} 还需要你补完。` : "工坊桌已经接通，符文、宝石和金币三条线会共享这张工作台。";
  }
  if (reward.id === "triumph-alcove") {
    return rareStory ? `${rareStory.dropName} 正挂在凯旋壁龛里，桌宠会把它当成今天的压轴战果。` : input.highlightDropName ? `${input.highlightDropName} 正挂在凯旋壁龛里，庆祝反馈会比普通陈列更正式。` : "壁龛已经解锁，等下一条亮眼掉落出现时就会被立刻点亮。";
  }
  if (reward.id === "astral-vault") {
    return rareStory ? `${rareStory.dropName} 的剧情已经沉入星盘藏品柜，${scene.label} 也会因此带上更终局的氛围。` : `星盘藏品柜已经待命，接下来出现的稀有故事会直接沉淀成常驻收藏。`;
  }
  return reward.lockedDetail;
}
function buildPetScene(input) {
  const hour = new Date(input.now).getHours();
  const ambientPrefix = getAmbientPrefix(hour);
  const blockingTask = getBlockingTask(input.preflight);
  const warningTask = getWarningTask(input.preflight);
  const rareStory = getBestRareStory(input);
  if (input.highlightDropName) {
    return {
      id: "altar",
      label: rareStory ? "传奇陈列室" : "凯旋祭台",
      propLabel: (rareStory == null ? void 0 : rareStory.propLabel) ?? "高亮战利品",
      auraLabel: rareStory ? "剧情触发" : "庆祝中",
      ambientLine: rareStory ? `${ambientPrefix}，一段只属于 ${rareStory.dropName} 的剧情已经在桌边亮起来了。` : `${ambientPrefix}，这条高亮战果正被摆在最醒目的位置。`,
      detail: (rareStory == null ? void 0 : rareStory.detail) ?? "最适合收口、截图、记战报的高光时刻。"
    };
  }
  if (input.activeRun) {
    return {
      id: "sanctuary",
      label: "火焰石阶",
      propLabel: "门钥徽记",
      auraLabel: "陪刷中",
      ambientLine: `${ambientPrefix}，当前路线正在计时里稳定推进。`,
      detail: "桌宠会优先展示当前刷图路线与返回时机。"
    };
  }
  if (!input.setupGuideCompleted) {
    return {
      id: "camp",
      label: "营地桌角",
      propLabel: "凯恩手札",
      auraLabel: "安家中",
      ambientLine: `${ambientPrefix}，先把环境和 Profile 整理好。`,
      detail: "这是首启安家阶段，适合补完引导和基础环境。"
    };
  }
  if (blockingTask || warningTask) {
    return {
      id: "forge",
      label: "赫拉迪姆工坊",
      propLabel: "赫拉迪姆方块",
      auraLabel: blockingTask ? "待修复" : "可联调",
      ambientLine: blockingTask ? `${ambientPrefix}，工坊里还有一项阻塞需要你点亮。` : `${ambientPrefix}，工坊状态基本就绪，只剩一些提醒项。`,
      detail: (blockingTask == null ? void 0 : blockingTask.summary) ?? (warningTask == null ? void 0 : warningTask.summary) ?? "三条自动化链路都在这里收口。"
    };
  }
  if (rareStory) {
    return {
      id: "altar",
      label: "传奇陈列室",
      propLabel: rareStory.propLabel,
      auraLabel: "故事常驻",
      ambientLine: `${ambientPrefix}，${rareStory.dropName} 还留在桌宠房间的荣誉位上。`,
      detail: rareStory.detail
    };
  }
  if (input.todayDropCount > 0) {
    return {
      id: "ledger",
      label: "战果账室",
      propLabel: "战利品账册",
      auraLabel: "战报热身",
      ambientLine: `${ambientPrefix}，今天已经有 ${input.todayDropCount} 条战果入账。`,
      detail: "账本已经热起来了，适合继续积累周报和月报素材。"
    };
  }
  if (input.todayCount > 0) {
    return {
      id: "sanctuary",
      label: "路线瞭望台",
      propLabel: "路线刻印",
      auraLabel: "节奏已起",
      ambientLine: `${ambientPrefix}，今天已经刷了 ${input.todayCount} 轮。`,
      detail: "继续沿用最近的主路线，会是最顺手的开始方式。"
    };
  }
  return {
    id: "camp",
    label: "营地桌角",
    propLabel: "热身卷册",
    auraLabel: "待命中",
    ambientLine: `${ambientPrefix}，第一轮还没开始，桌宠正在安静待命。`,
    detail: "从这里起步最轻松，适合热身和进入节奏。"
  };
}
function buildPetRoom(input) {
  const blockingTask = getBlockingTask(input.preflight);
  const rareStory = getBestRareStory(input);
  const todayMomentum = input.todayCount > 0;
  const todayLooted = input.todayDropCount > 0;
  const items = [
    {
      id: "hearth",
      label: "营地炉火",
      shortLabel: "炉火",
      state: input.setupGuideCompleted ? "ready" : "warming",
      detail: input.setupGuideCompleted ? "首启安家已经完成，桌边的基础氛围稳定点亮了。" : "把环境和引导补齐后，这盏炉火会从微光变成常亮。"
    },
    {
      id: "route-map",
      label: "路线挂图",
      shortLabel: "挂图",
      state: todayMomentum ? "ready" : input.setupGuideCompleted ? "warming" : "locked",
      detail: todayMomentum ? "今天的主刷路线已经挂到墙面上，回来时能直接续刷。" : "先开一轮，房间里才会出现今天的路线挂图。"
    },
    {
      id: "ledger-rack",
      label: "战果陈列架",
      shortLabel: "账架",
      state: todayLooted ? "ready" : input.todayCount > 0 ? "warming" : "locked",
      detail: todayLooted ? `今天的 ${input.todayDropCount} 条战果已经挂上陈列架了。` : "等第一条掉落出现之后，账架会开始被填满。"
    },
    {
      id: "cube-plinth",
      label: "方块底座",
      shortLabel: "方块",
      state: blockingTask ? "warming" : input.setupGuideCompleted ? "ready" : "locked",
      detail: blockingTask ? `${blockingTask.summary}，修好之后工坊底座会完整点亮。` : "工坊联调条件已经基本就绪，方块底座处于可用状态。"
    },
    {
      id: "trophy",
      label: rareStory ? rareStory.storyLabel : "凯旋奖杯",
      shortLabel: rareStory ? "剧情" : "奖杯",
      state: rareStory ? "glory" : input.highlightDropName || input.todayDropCount >= 2 ? "ready" : "locked",
      detail: rareStory ? `${rareStory.dropName} 已经被收藏进房间的荣耀位。` : input.highlightDropName || input.todayDropCount >= 2 ? "今天已经有足够亮眼的战果，奖杯位开始有存在感了。" : "等更亮眼的掉落出现，房间里的荣耀位就会被真正点亮。"
    }
  ];
  return {
    title: rareStory ? "传奇陈列室已点亮" : "桌宠房间正在生长",
    subtitle: rareStory ? `${rareStory.dropName} 触发了一段专属剧情，它已经成了房间里的常驻收藏。` : input.todayDropCount > 0 ? "今天的掉落和路线会慢慢把这间房填满。" : "随着引导、刷图和战报推进，房间里的家具会一件件亮起来。",
    items
  };
}
function buildPetProgression(input) {
  const score = getProgressScore(input);
  const scene = buildPetScene(input);
  const rareStory = getBestRareStory(input);
  const currentTier = [...PET_TITLES].reverse().find((tier) => score >= tier.threshold) ?? PET_TITLES[0];
  const nextTier = PET_TITLES.find((tier) => tier.level === currentTier.level + 1) ?? currentTier;
  const span = Math.max(1, nextTier.threshold - currentTier.threshold);
  const progressValue = currentTier.level === nextTier.level ? 1 : (score - currentTier.threshold) / span;
  const progress = Math.max(0.08, Math.min(1, progressValue));
  let sceneLine = "我会继续在桌边待命，把今天的上下文接住。";
  if (scene.id === "camp") {
    sceneLine = "我在替你把炉火和卷册整理好，等你回来时桌边还是热的。";
  } else if (scene.id === "sanctuary") {
    sceneLine = "石阶旁的路线刻印已经压住了，下一轮回来不会断节奏。";
  } else if (scene.id === "forge") {
    sceneLine = "我在给方块底座校准刻纹，等你切进工坊时就会更顺手。";
  } else if (scene.id === "ledger") {
    sceneLine = "账册页角还在自己翻动，我会继续把今天的战果看紧。";
  } else if (scene.id === "altar") {
    sceneLine = rareStory ? `${rareStory.dropName} 的收藏灯还亮着，这段剧情会在房间里常驻。` : "凯旋祭台上的光还没退，这种高亮时刻值得多停留一会儿。";
  }
  return {
    level: currentTier.level,
    title: currentTier.title,
    progress,
    progressLabel: currentTier.level === nextTier.level ? "当前已经达到本轮称号上限" : `距离 ${nextTier.title} 还差 ${Math.max(0, nextTier.threshold - score)} 点陪刷阅历`,
    nextMilestone: currentTier.level === nextTier.level ? "已点亮当前全部称号" : `下一称号：${nextTier.title}`,
    sceneLine
  };
}
function buildPetRewards(input) {
  const score = getProgressScore(input);
  const scene = buildPetScene(input);
  const rareStory = getBestRareStory(input);
  const { currentTier } = getProgressTiers(score);
  let nextAssigned = false;
  const rewards = PET_REWARD_DEFINITIONS.map((reward) => {
    let state = "unlocked";
    if (currentTier.level < reward.level) {
      state = nextAssigned ? "locked" : "next";
      nextAssigned = true;
    }
    return {
      id: reward.id,
      level: reward.level,
      label: reward.label,
      shortLabel: reward.shortLabel,
      detail: state === "unlocked" ? getRewardDetail(reward, input, scene, rareStory) : `Lv.${reward.level} 解锁 · ${reward.lockedDetail}`,
      bonus: reward.bonus,
      state
    };
  });
  const unlockedCount = rewards.filter((reward) => reward.state === "unlocked").length;
  const activeReward = [...rewards].reverse().find((reward) => reward.state === "unlocked") ?? null;
  const nextReward = rewards.find((reward) => reward.state === "next") ?? null;
  return {
    headline: nextReward ? `已点亮 ${unlockedCount}/${rewards.length} 组桌宠陈列` : "全套桌宠陈列已点亮",
    summary: nextReward ? `${nextReward.label} 会在 Lv.${nextReward.level} 解锁，继续刷图和记战报就能把它请进房间。` : `${(activeReward == null ? void 0 : activeReward.label) ?? "终局陈列"} 已经成为这只桌宠的最终收藏。`,
    unlockedCount,
    totalCount: rewards.length,
    activeReward,
    nextReward,
    rewards
  };
}
function createPetEvent(input) {
  const blockingTask = getBlockingTask(input.preflight);
  const latestRunNeedingWrapUp = getLatestRunNeedingWrapUp(
    input.recentRuns,
    input.recentDrops
  );
  const rareStory = getBestRareStory(input);
  if (input.highlightDropName && rareStory) {
    return {
      id: Date.now(),
      tone: "bright",
      title: rareStory.title,
      detail: rareStory.detail,
      ctaLabel: "去写战报",
      action: "open-drops",
      storyLabel: rareStory.storyLabel
    };
  }
  if (input.highlightDropName) {
    return {
      id: Date.now(),
      tone: "bright",
      title: "高亮战果入册",
      detail: `${input.highlightDropName} 这条正挂在高亮区，现在去战报页收口最有仪式感。`,
      ctaLabel: "去记战报",
      action: "open-drops"
    };
  }
  if (rareStory) {
    return pickRandom([
      {
        id: Date.now(),
        tone: "bright",
        title: `${rareStory.dropName} 的故事还在发光`,
        detail: "这类掉落不会马上退场，它会长期停留在桌宠房间的荣耀位上。",
        ctaLabel: "去看账本",
        action: "open-drops",
        storyLabel: rareStory.storyLabel
      },
      {
        id: Date.now() + 1,
        tone: "bright",
        title: "房间里新增了一件传奇收藏",
        detail: `${rareStory.dropName} 已经触发专属剧情，你现在回账本会看到它更像一段完整战报。`,
        ctaLabel: "查看剧情",
        action: "open-drops",
        storyLabel: rareStory.storyLabel
      }
    ]);
  }
  if (!input.setupGuideCompleted) {
    return pickRandom([
      {
        id: Date.now(),
        tone: "warm",
        title: "新居整理提醒",
        detail: "把引导继续走完，桌宠的悬浮态、工坊闭环和通知体验都会更稳。",
        ctaLabel: "继续引导",
        action: "open-setup"
      },
      {
        id: Date.now() + 1,
        tone: "warm",
        title: "先安家再开刷",
        detail: "现在补掉 Python、Profile 和悬浮态配置，后面每天上线都会更顺。",
        ctaLabel: "打开引导",
        action: "open-setup"
      }
    ]);
  }
  if (blockingTask) {
    return {
      id: Date.now(),
      tone: "alert",
      title: "工坊巡检事件",
      detail: `${blockingTask.summary}。这一步补上之后，自动化三条线会更稳。`,
      ctaLabel: "去工坊",
      action: "open-workshop"
    };
  }
  if (latestRunNeedingWrapUp) {
    return {
      id: Date.now(),
      tone: "warm",
      title: "收口点还在",
      detail: `${latestRunNeedingWrapUp.mapName} 那轮刚刷完，我还替你把掉落收口点留着。`,
      ctaLabel: "去战报",
      action: "open-drops"
    };
  }
  if (input.todayDropCount > 0) {
    return pickRandom([
      {
        id: Date.now(),
        tone: "bright",
        title: "账本翻页提醒",
        detail: `今天已经有 ${input.todayDropCount} 条战果，去战报页看看今天最亮的一条吧。`,
        ctaLabel: "翻看战报",
        action: "open-drops"
      },
      {
        id: Date.now() + 1,
        tone: "bright",
        title: "海报素材已更新",
        detail: "账本现在已经有内容感了，再看一眼今天的高亮和热区，会很像成品战报。",
        ctaLabel: "打开账本",
        action: "open-drops"
      }
    ]);
  }
  if (input.recentRuns.length > 0) {
    const latestRoute = input.recentRuns[0].mapName;
    return pickRandom([
      {
        id: Date.now(),
        tone: "warm",
        title: "继续上一条路线",
        detail: `${latestRoute} 还是今天最顺手的开局路线，桌宠建议直接沿用。`,
        ctaLabel: `继续 ${latestRoute}`,
        action: "start-latest"
      },
      {
        id: Date.now() + 1,
        tone: "warm",
        title: "路线回放完成",
        detail: `我刚在脑内又过了一遍 ${latestRoute} 的节奏，现在直接接着刷会很丝滑。`,
        ctaLabel: "一键续刷",
        action: "start-latest"
      }
    ]);
  }
  return pickRandom([
    {
      id: Date.now(),
      tone: "warm",
      title: "今日开局事件",
      detail: "桌宠已经把桌边状态准备好了，先开第一轮让今天的故事动起来。",
      ctaLabel: "开始今天",
      action: "start-default"
    },
    {
      id: Date.now() + 1,
      tone: "warm",
      title: "热身路线就绪",
      detail: "现在最适合从熟图热身，等今天第一条掉落出来时桌面气氛会更完整。",
      ctaLabel: "开第一轮",
      action: "start-default"
    }
  ]);
}
function buildTodayStats(runHistory, todayKey) {
  const todayRuns = runHistory.filter((run) => run.dayKey === todayKey);
  const totalCount = todayRuns.length;
  const totalDurationSeconds = todayRuns.reduce(
    (sum, run) => sum + run.durationSeconds,
    0
  );
  const averageDurationSeconds = totalCount > 0 ? totalDurationSeconds / totalCount : 0;
  const mapStats = /* @__PURE__ */ new Map();
  for (const run of todayRuns) {
    const current = mapStats.get(run.mapName) ?? {
      count: 0,
      totalDurationSeconds: 0
    };
    current.count += 1;
    current.totalDurationSeconds += run.durationSeconds;
    mapStats.set(run.mapName, current);
  }
  const mapBreakdown = Array.from(mapStats.entries()).map(([mapName, values]) => ({
    mapName,
    count: values.count,
    totalDurationSeconds: values.totalDurationSeconds,
    averageDurationSeconds: values.totalDurationSeconds / values.count
  })).sort((left, right) => right.count - left.count);
  return {
    totalCount,
    totalDurationSeconds,
    averageDurationSeconds,
    mapBreakdown
  };
}
const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  windowMode: "panel"
};
function translateError(errorText) {
  if (errorText.includes("EPERM") || errorText.includes("Access is denied")) {
    return "权限不足，请尝试以管理员身份运行暗黑2桌宠。";
  }
  if (errorText.includes("not found") && errorText.includes("D2R.exe")) {
    return "未检测到游戏运行，请先启动《暗黑破坏神 II：重制版》。";
  }
  if (errorText.includes("python: can't open file")) {
    return "Python 脚本丢失，请尝试重新安装环境或检查杀毒软件是否误删。";
  }
  if (errorText.includes("ModuleNotFoundError") || errorText.includes("No module named")) {
    return '缺少必要的 Python 依赖包，请在引导或工坊中点击"一键安装依赖"。';
  }
  if (errorText.includes("tesseract") || errorText.includes("TesseractNotFoundError")) {
    return "图像识别引擎 (OCR) 异常，请检查依赖是否完整安装。";
  }
  return errorText;
}
function getErrorMessage(error) {
  if (error instanceof Error) {
    return translateError(error.message);
  }
  if (typeof error === "string") {
    return translateError(error);
  }
  return "发生了未知错误。";
}
function getAdminSuccessText(action) {
  switch (action) {
    case "record-profile":
      return "坐标录制完成，日志已经更新。";
    case "print-profile":
      return "当前坐标配置已输出到日志。";
    case "import-legacy-config":
      return "旧配置已经导入到新的运行环境。";
  }
}
function getSetupActivityTimeLabel() {
  return formatCompactDateTime((/* @__PURE__ */ new Date()).toISOString());
}
function getLogPreview(content) {
  if (!(content == null ? void 0 : content.trim())) {
    return void 0;
  }
  return content.trim().split(/\r?\n/).slice(-10).join("\n");
}
function getTabMeta(tab) {
  switch (tab) {
    case "companion":
      return {
        label: "陪刷",
        detail: "这里现在只保留当前动作、上次中断点和开跑入口。"
      };
    case "drops":
      return {
        label: "战报",
        detail: "先记一条掉落，再看最近几条和详细战报。"
      };
    case "workshop":
      return {
        label: "工坊",
        detail: "先看顶部主任务，再决定是补条件、录坐标还是试运行。"
      };
  }
}
function getBusySummary(busyKey) {
  if (!busyKey) {
    return null;
  }
  if (busyKey === "start-run") {
    return "正在开始本次刷图记录。";
  }
  if (busyKey === "stop-run") {
    return "正在结算这一轮刷图。";
  }
  if (busyKey === "create-drop") {
    return "正在保存这条掉落记录。";
  }
  if (busyKey === "settings") {
    return "正在同步桌宠设置。";
  }
  if (busyKey.startsWith("env-")) {
    return "正在处理运行环境或依赖。";
  }
  if (busyKey.startsWith("task-")) {
    return "自动化任务正在执行，请先等结果回写。";
  }
  if (busyKey.startsWith("admin-")) {
    return "正在处理坐标配置或维护动作。";
  }
  return "当前操作还在处理中。";
}
function buildCompanionIssues(preflight, setupGuideCompleted) {
  var _a;
  if (!preflight) {
    return [
      {
        title: "正在检查当前环境",
        detail: "桌宠已经打开，正在读取内置运行环境、依赖和工坊状态。",
        tone: "attention"
      }
    ];
  }
  const globalChecks = preflight.globalChecks ?? [];
  const tasks = preflight.tasks ?? [];
  const runtimeFailed = globalChecks.some(
    (check) => ["runtime-root", "python-command", "pip-command", "requirements-file", "python-source"].includes(
      check.key
    ) && check.level === "error"
  );
  const dependencyFailed = globalChecks.some(
    (check) => ["python-dependencies", "ocr-engine"].includes(check.key) && check.level === "error"
  );
  const missingProfiles = tasks.filter((task) => !isTaskProfileReady(task));
  const warningTasks = tasks.filter((task) => task.status === "warning");
  const issues = [];
  if (runtimeFailed) {
    issues.push({
      title: "内置运行环境还没完全就绪",
      detail: "先去工坊的环境区处理运行环境，处理完再执行自动化会稳定很多。",
      tone: "error"
    });
  }
  if (dependencyFailed) {
    issues.push({
      title: "依赖还没装齐",
      detail: "当前主要缺少 Python 依赖或 OCR 能力，先去工坊补安装。",
      tone: "error"
    });
  }
  if (missingProfiles.length > 0) {
    const labels = missingProfiles.map((task) => getIntegrationLabel(task.id));
    issues.push({
      title: `还缺坐标配置：${labels.join("、")}`,
      detail: "去工坊录好这些坐标后，符文、宝石、金币功能才能稳定执行。",
      tone: "attention"
    });
  }
  if (!runtimeFailed && !dependencyFailed && missingProfiles.length === 0) {
    issues.push({
      title: "核心环境已经能用了",
      detail: setupGuideCompleted ? "现在可以直接刷图、记战报，或者去工坊试运行。" : "虽然引导还没点完成，但核心功能已经能用了，悬浮和通知可以后面再开。",
      tone: "success"
    });
  }
  if (warningTasks.length > 0) {
    issues.push({
      title: "工坊还有提醒项",
      detail: ((_a = warningTasks[0]) == null ? void 0 : _a.summary) ?? "建议先看一眼工坊预检，再决定是否马上执行。",
      tone: "attention"
    });
  }
  return issues.slice(0, 2);
}
function App() {
  var _a;
  const [data, setData] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("companion");
  const [busyKey, setBusyKey] = reactExports.useState(null);
  const [message, setMessage] = reactExports.useState(null);
  const [surfaceNotice, setSurfaceNotice] = reactExports.useState(null);
  const [now, setNow] = reactExports.useState(Date.now());
  const [highlightedDropName, setHighlightedDropName] = reactExports.useState("");
  const [showSetupGuide, setShowSetupGuide] = reactExports.useState(false);
  const [setupPreflight, setSetupPreflight] = reactExports.useState(null);
  const [setupPreflightBusy, setSetupPreflightBusy] = reactExports.useState(false);
  const [setupPreflightError, setSetupPreflightError] = reactExports.useState("");
  const [setupGuideActivity, setSetupGuideActivity] = reactExports.useState(null);
  const [petInteractionCue, setPetInteractionCue] = reactExports.useState(null);
  const [petFishingCatch, setPetFishingCatch] = reactExports.useState(null);
  const [petCeremony, setPetCeremony] = reactExports.useState(null);
  const [petEvent, setPetEvent] = reactExports.useState(null);
  const [floatingSnapPreview, setFloatingSnapPreview] = reactExports.useState({
    visible: false,
    snapped: false
  });
  const [setupGuideTick, setSetupGuideTick] = reactExports.useState(0);
  const [workshopFocusId, setWorkshopFocusId] = reactExports.useState(null);
  const [showPetCodex, setShowPetCodex] = reactExports.useState(false);
  const [showCompanionDetails, setShowCompanionDetails] = reactExports.useState(false);
  const [selectedCodexEntryId, setSelectedCodexEntryId] = reactExports.useState(null);
  const [panelScrollState, setPanelScrollState] = reactExports.useState({
    canScrollUp: false,
    canScrollDown: false,
    progress: 0
  });
  const panelStackRef = reactExports.useRef(null);
  const latestDropIdRef = reactExports.useRef(null);
  const petCeremonySnapshotRef = reactExports.useRef(null);
  const setupGuideInitializedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    void window.d2Pet.getData().then((value) => setData(value)).catch(
      (error) => setMessage({
        kind: "error",
        text: getErrorMessage(error)
      })
    );
  }, []);
  reactExports.useEffect(() => {
    return window.d2Pet.onDataChanged((value) => {
      setData(value);
    });
  }, []);
  reactExports.useEffect(() => {
    if (!message) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setMessage((current) => current === message ? null : current);
    }, message.kind === "error" ? 7200 : 4200);
    return () => window.clearTimeout(timer);
  }, [message]);
  reactExports.useEffect(() => {
    if (!surfaceNotice) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setSurfaceNotice((current) => current === surfaceNotice ? null : current);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [surfaceNotice]);
  reactExports.useEffect(() => {
    return window.d2Pet.onFloatingSnapPreview((preview) => {
      setFloatingSnapPreview(preview);
    });
  }, []);
  reactExports.useEffect(() => {
    if (!data || setupGuideInitializedRef.current) {
      return;
    }
    setShowSetupGuide(!data.settings.setupGuideCompleted);
    setupGuideInitializedRef.current = true;
  }, [data]);
  reactExports.useEffect(() => {
    if (!(data == null ? void 0 : data.settings.setupGuideCompleted)) {
      return;
    }
    setShowSetupGuide(false);
  }, [data == null ? void 0 : data.settings.setupGuideCompleted]);
  reactExports.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1e3);
    return () => window.clearInterval(timer);
  }, []);
  reactExports.useEffect(() => {
    if (!data) {
      return;
    }
    const latestDrop = data.drops[0];
    if (!latestDrop) {
      latestDropIdRef.current = null;
      return;
    }
    if (!latestDropIdRef.current) {
      latestDropIdRef.current = latestDrop.id;
      return;
    }
    if (latestDropIdRef.current !== latestDrop.id) {
      latestDropIdRef.current = latestDrop.id;
      setHighlightedDropName(latestDrop.itemName);
    }
  }, [data]);
  reactExports.useEffect(() => {
    if (!highlightedDropName) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setHighlightedDropName("");
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [highlightedDropName]);
  reactExports.useEffect(() => {
    if (!petInteractionCue) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setPetInteractionCue(
        (current) => (current == null ? void 0 : current.id) === petInteractionCue.id ? null : current
      );
    }, petInteractionCue.durationMs);
    return () => window.clearTimeout(timer);
  }, [petInteractionCue]);
  reactExports.useEffect(() => {
    if (!petFishingCatch) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setPetFishingCatch(
        (current) => (current == null ? void 0 : current.id) === petFishingCatch.id ? null : current
      );
    }, 6200);
    return () => window.clearTimeout(timer);
  }, [petFishingCatch]);
  reactExports.useEffect(() => {
    if (!petEvent) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setPetEvent((current) => (current == null ? void 0 : current.id) === petEvent.id ? null : current);
    }, 12500);
    return () => window.clearTimeout(timer);
  }, [petEvent]);
  reactExports.useEffect(() => {
    if (!petCeremony) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setPetCeremony((current) => (current == null ? void 0 : current.id) === petCeremony.id ? null : current);
    }, 7600);
    return () => window.clearTimeout(timer);
  }, [petCeremony]);
  reactExports.useEffect(() => {
    if (!petCeremony || !(data == null ? void 0 : data.settings.notificationsEnabled)) {
      return;
    }
    playPetChime(
      petCeremony.kind === "mastery" ? "mastery" : petCeremony.kind === "unlock" ? "unlock" : "rare"
    );
  }, [data == null ? void 0 : data.settings.notificationsEnabled, petCeremony == null ? void 0 : petCeremony.id]);
  reactExports.useEffect(() => {
    if (!workshopFocusId) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setWorkshopFocusId(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [workshopFocusId]);
  reactExports.useEffect(() => {
    const container = panelStackRef.current;
    if (!container) {
      return;
    }
    if (activeTab === "companion" && !showSetupGuide) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, showSetupGuide]);
  reactExports.useEffect(() => {
    if (!data) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSetupPreflightBusy(true);
      setSetupPreflightError("");
      void window.d2Pet.getAutomationPreflight({
        drafts: data.automationDrafts,
        hasGemClipboardImage: false
      }).then((value) => setSetupPreflight(value)).catch((error) => setSetupPreflightError(getErrorMessage(error))).finally(() => setSetupPreflightBusy(false));
    }, 160);
    return () => window.clearTimeout(timer);
  }, [data, setupGuideTick]);
  const todayKey = getDayKey(new Date(now));
  const todayStats = reactExports.useMemo(
    () => data ? buildTodayStats(data.runHistory, todayKey) : {
      totalCount: 0,
      totalDurationSeconds: 0,
      averageDurationSeconds: 0,
      mapBreakdown: []
    },
    [data, todayKey]
  );
  const recentRuns = reactExports.useMemo(() => (data == null ? void 0 : data.runHistory.slice(0, 6)) ?? [], [data]);
  const todayDrops = reactExports.useMemo(
    () => (data == null ? void 0 : data.drops.filter((drop) => drop.dayKey === todayKey).slice(0, 12)) ?? [],
    [data, todayKey]
  );
  const activeDurationText = (data == null ? void 0 : data.activeRun) ? formatDuration((now - new Date(data.activeRun.startedAt).getTime()) / 1e3) : "00:00";
  const isFloatingMode = (data == null ? void 0 : data.settings.windowMode) === "floating";
  const petPersonaInput = reactExports.useMemo(
    () => data ? {
      activeRun: data.activeRun,
      highlightDropName: highlightedDropName,
      liveDurationText: activeDurationText,
      preflight: setupPreflight,
      recentDrops: todayDrops,
      recentRuns,
      setupGuideCompleted: data.settings.setupGuideCompleted,
      todayCount: todayStats.totalCount,
      todayDropCount: todayDrops.length
    } : null,
    [
      activeDurationText,
      data,
      highlightedDropName,
      recentRuns,
      setupPreflight,
      todayDrops,
      todayStats.totalCount
    ]
  );
  const petWorldInput = reactExports.useMemo(
    () => petPersonaInput ? { ...petPersonaInput, now } : null,
    [now, petPersonaInput]
  );
  const petScene = reactExports.useMemo(
    () => petWorldInput ? buildPetScene(petWorldInput) : null,
    [petWorldInput]
  );
  const petRoom = reactExports.useMemo(
    () => petWorldInput ? buildPetRoom(petWorldInput) : null,
    [petWorldInput]
  );
  const petProgression = reactExports.useMemo(
    () => petWorldInput ? buildPetProgression(petWorldInput) : null,
    [petWorldInput]
  );
  const petRewards = reactExports.useMemo(
    () => petWorldInput ? buildPetRewards(petWorldInput) : null,
    [petWorldInput]
  );
  const petHabitat = reactExports.useMemo(
    () => petWorldInput && petProgression && petRewards ? buildPetHabitat(petWorldInput, petProgression, petRewards) : null,
    [petProgression, petRewards, petWorldInput]
  );
  const petCodex = reactExports.useMemo(
    () => petProgression && petRewards && petRoom && petHabitat ? buildPetCodex({
      drops: (data == null ? void 0 : data.drops) ?? [],
      progression: petProgression,
      rewards: petRewards,
      room: petRoom,
      habitat: petHabitat
    }) : null,
    [data == null ? void 0 : data.drops, petHabitat, petProgression, petRewards, petRoom]
  );
  const setupGuideHint = reactExports.useMemo(
    () => buildSetupGuideHint(setupPreflight, (data == null ? void 0 : data.settings) ?? DEFAULT_SETTINGS),
    [data == null ? void 0 : data.settings, setupPreflight]
  );
  const nextWorkshopTask = reactExports.useMemo(
    () => ((setupPreflight == null ? void 0 : setupPreflight.tasks) ?? []).find(
      (task) => task.status !== "ready" || !isTaskProfileReady(task)
    ) ?? null,
    [setupPreflight]
  );
  const companionIssues = reactExports.useMemo(
    () => buildCompanionIssues(setupPreflight, (data == null ? void 0 : data.settings.setupGuideCompleted) ?? false),
    [data == null ? void 0 : data.settings.setupGuideCompleted, setupPreflight]
  );
  reactExports.useEffect(() => {
    if (!petCodex) {
      return;
    }
    const entryIds = new Set(
      petCodex.chapters.flatMap((chapter) => chapter.entries.map((entry) => entry.id))
    );
    if (!selectedCodexEntryId || !entryIds.has(selectedCodexEntryId)) {
      setSelectedCodexEntryId(petCodex.featuredEntryId);
    }
  }, [petCodex, selectedCodexEntryId]);
  reactExports.useEffect(() => {
    if (!petProgression || !petRewards) {
      return;
    }
    const snapshot = createPetCeremonySnapshot(petProgression, petRewards);
    const previousSnapshot = petCeremonySnapshotRef.current;
    petCeremonySnapshotRef.current = snapshot;
    if (!previousSnapshot) {
      return;
    }
    const nextCeremony = buildPetCeremony(previousSnapshot, petProgression, petRewards);
    if (!nextCeremony) {
      return;
    }
    setPetCeremony(nextCeremony);
    setPetEvent(null);
    setPetInteractionCue({
      id: nextCeremony.id,
      kind: "cheer",
      emotion: nextCeremony.kind === "level-up" ? "proud" : "celebrate",
      emotionLabel: nextCeremony.badge,
      headline: nextCeremony.title,
      statusLine: nextCeremony.detail,
      scripts: nextCeremony.scripts,
      durationMs: 5600
    });
  }, [petProgression, petRewards]);
  reactExports.useEffect(() => {
    if (!data || !petPersonaInput || !data.settings.setupGuideCompleted || data.activeRun || Boolean(highlightedDropName) || Boolean(busyKey) || Boolean(petInteractionCue) || Boolean(petFishingCatch) || showSetupGuide) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      const fishingCatch = createPetFishingCatch(petPersonaInput);
      setPetFishingCatch(fishingCatch);
      setPetEvent(null);
      setPetInteractionCue(buildPetFishingInteractionCue(fishingCatch));
    }, 16e3 + Math.floor(Math.random() * 1e4));
    return () => window.clearTimeout(timer);
  }, [
    busyKey,
    data,
    highlightedDropName,
    petInteractionCue,
    petFishingCatch,
    petPersonaInput,
    showSetupGuide
  ]);
  reactExports.useEffect(() => {
    if (!data || !petWorldInput || Boolean(busyKey) || Boolean(petInteractionCue) || Boolean(petEvent) || showSetupGuide) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      setPetEvent(createPetEvent(petWorldInput));
    }, 26e3 + Math.floor(Math.random() * 12e3));
    return () => window.clearTimeout(timer);
  }, [busyKey, data, petEvent, petInteractionCue, petWorldInput, showSetupGuide]);
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "boot-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "boot-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "Booting" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "正在唤醒桌宠助手" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "首次启动会创建本地数据目录、截图目录和自动化日志目录。" })
    ] }) });
  }
  function refreshSetupGuide() {
    setSetupGuideTick((current) => current + 1);
  }
  function handlePetHeadpat() {
    if (!petPersonaInput) {
      return;
    }
    setPetInteractionCue(createPetInteractionCue("headpat", petPersonaInput));
  }
  function handlePetCheer() {
    if (!petPersonaInput) {
      return;
    }
    setPetInteractionCue(createPetInteractionCue("cheer", petPersonaInput));
  }
  function handlePetEventAction() {
    var _a2;
    if (!petEvent) {
      return;
    }
    const action = petEvent.action;
    setPetEvent(null);
    switch (action) {
      case "open-companion":
        handleOpenPanel("companion");
        return;
      case "open-drops":
        handleOpenPanel("drops");
        return;
      case "open-workshop":
        handleOpenPanel("workshop");
        return;
      case "open-setup":
        handleOpenSetupGuide();
        return;
      case "start-latest":
        void handleStartRun(((_a2 = recentRuns[0]) == null ? void 0 : _a2.mapName) ?? "混沌避难所");
        return;
      case "start-default":
        void handleStartRun("混沌避难所");
        return;
    }
  }
  async function handleStartRun(mapName) {
    setBusyKey("start-run");
    setMessage(null);
    try {
      const nextData = await window.d2Pet.startRun({ mapName });
      setData(nextData);
      setMessage({ kind: "success", text: "已经开始记录本次刷图。" });
    } catch (error) {
      setMessage({ kind: "error", text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }
  async function handleStopRun() {
    setBusyKey("stop-run");
    setMessage(null);
    try {
      const nextData = await window.d2Pet.stopRun();
      setData(nextData);
      setMessage({ kind: "success", text: "本次刷图已经完成并写入统计。" });
    } catch (error) {
      setMessage({ kind: "error", text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }
  async function handleCreateDrop(payload) {
    setBusyKey("create-drop");
    setMessage(null);
    try {
      let screenshotPath = payload.screenshotPath;
      if (!screenshotPath && payload.imageDataUrl) {
        const image = await window.d2Pet.saveImage({
          dataUrl: payload.imageDataUrl,
          suggestedName: payload.itemName
        });
        screenshotPath = image.path;
      }
      const nextData = await window.d2Pet.createDrop({
        itemName: payload.itemName,
        mapName: payload.mapName,
        note: payload.note,
        screenshotPath,
        ocrText: payload.ocrText,
        ocrEngine: payload.ocrEngine,
        ocrItemName: payload.ocrItemName
      });
      setData(nextData);
      setActiveTab("drops");
      setMessage({ kind: "success", text: "掉落记录已经保存。" });
    } catch (error) {
      setMessage({ kind: "error", text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }
  async function handlePreviewDropOcr(payload) {
    return window.d2Pet.previewDropOcr(payload);
  }
  async function handleRunAutomationTask(payload) {
    setBusyKey(`task-${payload.id}-${payload.mode}`);
    setMessage(null);
    try {
      let nextPayload = payload;
      if (payload.id === "gem-cube" && payload.drafts.gemInputMode === "scan-image" && payload.gemImageDataUrl) {
        const image = await window.d2Pet.saveImage({
          dataUrl: payload.gemImageDataUrl,
          suggestedName: "gem-scan"
        });
        nextPayload = {
          ...payload,
          gemImageDataUrl: void 0,
          drafts: {
            ...payload.drafts,
            gemImagePath: image.path
          }
        };
      }
      const response = await window.d2Pet.runAutomationTask(nextPayload);
      setData(response.data);
      setMessage({
        kind: response.result.success ? "success" : "error",
        text: response.result.success ? payload.mode === "dry-run" ? "试运行已经完成，计划和日志已经更新。" : "自动化任务执行完成。" : response.result.stderr || "自动化任务执行失败。"
      });
      refreshSetupGuide();
      return response;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: "error", text });
      throw new Error(text);
    } finally {
      setBusyKey(null);
    }
  }
  async function handleRunAutomationAdmin(payload) {
    setBusyKey(`admin-${payload.id}-${payload.action}`);
    setMessage(null);
    try {
      const response = await window.d2Pet.runAutomationAdmin(payload);
      setData(response.data);
      setMessage({
        kind: response.result.success ? "success" : "error",
        text: response.result.success ? getAdminSuccessText(payload.action) : response.result.stderr || "自动化工具操作失败。"
      });
      refreshSetupGuide();
      return response;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: "error", text });
      throw new Error(text);
    } finally {
      setBusyKey(null);
    }
  }
  async function handleRunEnvironmentAction(payload) {
    setBusyKey(`env-${payload.action}`);
    setMessage(null);
    try {
      const response = await window.d2Pet.runEnvironmentAction(payload);
      const successText = payload.action === "install-python-deps" ? "Python 运行时依赖安装完成。" : "内置 Python 运行环境已准备完成。";
      setMessage({
        kind: response.result.success ? "success" : "error",
        text: response.result.success ? successText : response.result.stderr || "环境修复失败。"
      });
      setSetupGuideActivity({
        title: payload.action === "install-python-deps" ? "依赖安装结果" : "内置运行环境处理结果",
        detail: response.result.success ? successText : response.result.stderr || response.result.stdout || "环境修复失败。",
        tone: response.result.success ? "success" : "error",
        timestampLabel: getSetupActivityTimeLabel(),
        logPreview: getLogPreview(response.log.content)
      });
      refreshSetupGuide();
      return response;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: "error", text });
      setSetupGuideActivity({
        title: "引导动作执行失败",
        detail: text,
        tone: "error",
        timestampLabel: getSetupActivityTimeLabel()
      });
      throw new Error(text);
    } finally {
      setBusyKey(null);
    }
  }
  async function handleInstallAllEnvironments() {
    setBusyKey("env-install-all");
    setMessage(null);
    try {
      setSetupGuideActivity({
        title: "一键静默安装",
        detail: "正在准备内置 Python 运行环境...",
        tone: "attention",
        timestampLabel: getSetupActivityTimeLabel()
      });
      const runtimeResponse = await window.d2Pet.runEnvironmentAction({ action: "install-python-runtime" });
      if (!runtimeResponse.result.success) {
        throw new Error(runtimeResponse.result.stderr || "Python 环境安装失败");
      }
      setSetupGuideActivity({
        title: "一键静默安装",
        detail: "Python 环境准备完成，正在安装依赖...",
        tone: "attention",
        timestampLabel: getSetupActivityTimeLabel()
      });
      const depsResponse = await window.d2Pet.runEnvironmentAction({ action: "install-python-deps" });
      if (!depsResponse.result.success) {
        throw new Error(depsResponse.result.stderr || "依赖安装失败");
      }
      setMessage({ kind: "success", text: "一键静默安装环境及依赖完成。" });
      setSetupGuideActivity({
        title: "一键静默安装结果",
        detail: "内置 Python 运行环境及依赖均已准备就绪。",
        tone: "success",
        timestampLabel: getSetupActivityTimeLabel()
      });
      refreshSetupGuide();
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: "error", text });
      setSetupGuideActivity({
        title: "一键静默安装失败",
        detail: text,
        tone: "error",
        timestampLabel: getSetupActivityTimeLabel()
      });
    } finally {
      setBusyKey(null);
    }
  }
  async function handleGetAutomationLog(id) {
    return window.d2Pet.getAutomationLog(id);
  }
  async function handleGetAutomationPreflight(payload) {
    return window.d2Pet.getAutomationPreflight(payload);
  }
  async function handleOpenPath(targetPath) {
    try {
      const result = await window.d2Pet.openPath(targetPath);
      if (result) {
        setMessage({ kind: "error", text: result });
      }
    } catch (error) {
      setMessage({ kind: "error", text: getErrorMessage(error) });
    }
  }
  async function handleExportTextFile(payload) {
    try {
      const result = await window.d2Pet.exportTextFile(payload);
      if (!result.canceled && result.path) {
        setMessage({ kind: "success", text: `文件已导出到 ${result.path}` });
      }
      return result;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: "error", text });
      throw new Error(text);
    }
  }
  async function handleCopyText(text) {
    try {
      await window.d2Pet.copyText({ text });
      setMessage({ kind: "success", text: "诊断内容已经复制到剪贴板。" });
    } catch (error) {
      const nextText = getErrorMessage(error);
      setMessage({ kind: "error", text: nextText });
      throw new Error(nextText);
    }
  }
  async function handleExportVisualReport(payload) {
    try {
      const result = await window.d2Pet.exportVisualReport(payload);
      if (!result.canceled && result.path) {
        setMessage({
          kind: "success",
          text: payload.format === "pdf" ? `战报 PDF 已导出到 ${result.path}` : `战报海报已导出到 ${result.path}`
        });
      }
      return result;
    } catch (error) {
      const text = getErrorMessage(error);
      setMessage({ kind: "error", text });
      throw new Error(text);
    }
  }
  async function handleUpdateSettings(patch) {
    setBusyKey("settings");
    setMessage(null);
    try {
      const nextData = await window.d2Pet.updateSettings({ patch });
      setData(nextData);
      refreshSetupGuide();
      if (typeof patch.alwaysOnTop === "boolean") {
        setMessage({
          kind: "success",
          text: patch.alwaysOnTop ? "桌宠已经置顶。" : "桌宠已经取消置顶。"
        });
      } else if (typeof patch.launchOnStartup === "boolean") {
        setMessage({
          kind: nextData.settings.launchOnStartup === patch.launchOnStartup ? "success" : "error",
          text: nextData.settings.launchOnStartup === patch.launchOnStartup ? nextData.settings.launchOnStartup ? "已启用开机自启。" : "已关闭开机自启。" : "当前环境未能切换开机自启，建议打包后再验证一次。"
        });
      } else if (typeof patch.notificationsEnabled === "boolean") {
        setMessage({
          kind: "success",
          text: nextData.settings.notificationsEnabled ? "已开启系统通知。" : "已关闭系统通知。"
        });
      } else if (typeof patch.setupGuideCompleted === "boolean") {
        setMessage({
          kind: "success",
          text: patch.setupGuideCompleted ? "首次引导已经标记完成。" : "首次引导已重新开启。"
        });
      }
    } catch (error) {
      setMessage({ kind: "error", text: getErrorMessage(error) });
    } finally {
      setBusyKey(null);
    }
  }
  function handleSwitchWindowMode(mode) {
    if (data.settings.windowMode === mode) {
      return;
    }
    void handleUpdateSettings({ windowMode: mode });
  }
  function scrollPanelToTop(behavior = "smooth") {
    var _a2;
    (_a2 = panelStackRef.current) == null ? void 0 : _a2.scrollTo({ top: 0, behavior });
  }
  function refreshPanelScrollState() {
    const root = panelStackRef.current;
    if (!root) {
      setPanelScrollState({
        canScrollUp: false,
        canScrollDown: false,
        progress: 0
      });
      return;
    }
    const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
    const nextState = {
      canScrollUp: root.scrollTop > 4,
      canScrollDown: root.scrollTop < maxTop - 4,
      progress: maxTop > 0 ? Math.round(root.scrollTop / maxTop * 100) : 0
    };
    setPanelScrollState(
      (current) => current.canScrollUp === nextState.canScrollUp && current.canScrollDown === nextState.canScrollDown && current.progress === nextState.progress ? current : nextState
    );
  }
  function handleSelectTab(tab) {
    const isSameTab = activeTab === tab;
    const tabMeta = getTabMeta(tab);
    const collapsedCompanionOverlays = tab === "companion" && (showSetupGuide || showCompanionDetails || showPetCodex);
    setActiveTab(tab);
    setShowPetCodex(false);
    if (tab === "companion") {
      setShowSetupGuide(false);
      setShowCompanionDetails(false);
    }
    window.requestAnimationFrame(() => {
      scrollPanelToTop(isSameTab ? "auto" : "smooth");
      refreshPanelScrollState();
    });
    setSurfaceNotice({
      tone: isSameTab ? "success" : "attention",
      title: isSameTab ? `${tabMeta.label} 已回到第一屏` : `已切到${tabMeta.label}`,
      detail: isSameTab ? collapsedCompanionOverlays ? "我顺手把陪刷页里展开的层收回了，主路径已经回到顶部。" : "当前页已经回到顶部，继续往下滚就能看到后面的内容。" : tabMeta.detail
    });
  }
  function shouldIgnorePanelWheelTarget(target) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return Boolean(
      target.closest(".pet-codex-overlay") || target.closest('textarea, input, select, [contenteditable="true"], .code-view')
    );
  }
  function scrollPanelByDelta(deltaY, deltaMode) {
    const root = panelStackRef.current;
    if (!root || root.scrollHeight <= root.clientHeight + 1) {
      return false;
    }
    const multiplier = deltaMode === 1 ? 20 : deltaMode === 2 ? root.clientHeight : 1;
    const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
    const nextTop = Math.max(0, Math.min(maxTop, root.scrollTop + deltaY * multiplier));
    if (Math.abs(nextTop - root.scrollTop) < 1) {
      return false;
    }
    root.scrollTop = nextTop;
    return true;
  }
  function handlePanelWheel(event) {
    if (showPetCodex) {
      return;
    }
    if (shouldIgnorePanelWheelTarget(event.target)) {
      return;
    }
    if (scrollPanelByDelta(event.deltaY, event.deltaMode)) {
      event.preventDefault();
    }
  }
  function handlePanelScroll() {
    refreshPanelScrollState();
  }
  reactExports.useEffect(() => {
    const root = panelStackRef.current;
    if (!root) {
      return;
    }
    const handleNativeWheel = (event) => {
      if (showPetCodex || shouldIgnorePanelWheelTarget(event.target)) {
        return;
      }
      if (scrollPanelByDelta(event.deltaY, event.deltaMode)) {
        event.preventDefault();
      }
    };
    root.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => root.removeEventListener("wheel", handleNativeWheel);
  }, [activeTab, showPetCodex]);
  reactExports.useEffect(() => {
    const root = panelStackRef.current;
    if (!root) {
      return;
    }
    let frame = 0;
    const scheduleRefresh = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        refreshPanelScrollState();
      });
    };
    const mutationObserver = new MutationObserver(() => {
      scheduleRefresh();
    });
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true
    });
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleRefresh();
      });
      resizeObserver.observe(root);
      Array.from(root.children).forEach((child) => resizeObserver == null ? void 0 : resizeObserver.observe(child));
    }
    root.addEventListener("scroll", scheduleRefresh, { passive: true });
    window.addEventListener("resize", scheduleRefresh);
    scheduleRefresh();
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      mutationObserver.disconnect();
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      root.removeEventListener("scroll", scheduleRefresh);
      window.removeEventListener("resize", scheduleRefresh);
    };
  }, [activeTab, showCompanionDetails, showPetCodex, showSetupGuide]);
  reactExports.useEffect(() => {
    var _a2;
    (_a2 = panelStackRef.current) == null ? void 0 : _a2.focus({ preventScroll: true });
  }, [activeTab, showPetCodex]);
  function handleOpenPanel(tab) {
    handleSelectTab(tab);
    if (data.settings.windowMode !== "panel") {
      void handleUpdateSettings({ windowMode: "panel" });
    }
  }
  function announceSurfaceNotice(notice) {
    setSurfaceNotice(notice);
  }
  function handleToggleCompanionDetails() {
    const nextExpanded = !showCompanionDetails;
    setShowCompanionDetails(nextExpanded);
    window.requestAnimationFrame(() => {
      scrollPanelToTop("smooth");
      refreshPanelScrollState();
    });
    announceSurfaceNotice({
      tone: nextExpanded ? "attention" : "success",
      title: nextExpanded ? "桌宠详情已展开" : "桌宠详情已收起",
      detail: nextExpanded ? "顶部已经展开成长、场景和开关设置，继续往下滚就能回到主内容。" : "我把桌宠壳收回到精简模式了，当前主路径已经回到最短视图。"
    });
  }
  function handleOpenSetupGuide() {
    handleSelectTab("companion");
    setShowPetCodex(false);
    setShowSetupGuide(true);
    refreshSetupGuide();
    if (data.settings.windowMode !== "panel") {
      void handleUpdateSettings({ windowMode: "panel" });
    }
  }
  function handleFollowSetupGuideHint() {
    switch (setupGuideHint.action) {
      case "install-runtime":
        void handleRunEnvironmentAction({ action: "install-python-runtime" });
        return;
      case "install-deps":
        void handleRunEnvironmentAction({ action: "install-python-deps" });
        return;
      case "complete-guide":
        handleCompleteSetupGuide();
        return;
      case "open-workshop-task":
        if (setupGuideHint.integrationId) {
          handleOpenWorkshopTaskFromGuide(setupGuideHint.integrationId);
          return;
        }
        handleOpenSetupGuide();
        return;
      case "enable-floating":
        handleEnableFloatingFromGuide();
        return;
      case "open-guide":
      default:
        handleOpenSetupGuide();
    }
  }
  function handleOpenWorkshopFromGuide() {
    handleOpenPanel("workshop");
  }
  function handleOpenWorkshopTaskFromGuide(id) {
    handleOpenPanel("workshop");
    setWorkshopFocusId(id);
    setSetupGuideActivity({
      title: `下一步：去录${id === "rune-cube" ? "符文" : id === "gem-cube" ? "宝石" : "金币"}坐标`,
      detail: "我已经把你带到工坊对应任务卡了。看到高亮任务后，先点“录坐标”，按弹出的提示捕获坐标。",
      tone: "attention",
      timestampLabel: getSetupActivityTimeLabel()
    });
  }
  function handleEnableFloatingFromGuide() {
    void handleUpdateSettings({ windowMode: "floating" });
  }
  function handleEnableNotificationsFromGuide() {
    if (!data.settings.notificationsEnabled) {
      void handleUpdateSettings({ notificationsEnabled: true });
    }
  }
  function handleCompleteSetupGuide() {
    setSetupGuideActivity({
      title: "首次引导已完成",
      detail: "现在已经不再是“安家中”。你可以直接去工坊执行任务，或者开始记录刷图和掉落。",
      tone: "success",
      timestampLabel: getSetupActivityTimeLabel()
    });
    void handleUpdateSettings({ setupGuideCompleted: true });
  }
  function handleOpenPetCodex(entryId) {
    if (petCodex) {
      setSelectedCodexEntryId(entryId ?? petCodex.featuredEntryId);
    }
    setShowSetupGuide(false);
    setShowPetCodex(true);
    setActiveTab("companion");
    if (data.settings.windowMode !== "panel") {
      void handleUpdateSettings({ windowMode: "panel" });
    }
  }
  function handleClosePetCodex() {
    setShowPetCodex(false);
  }
  const defaultRouteName = ((_a = recentRuns[0]) == null ? void 0 : _a.mapName) ?? "混沌避难所";
  const companionFocusTitle = data.activeRun ? `正在记录 ${data.activeRun.mapName}` : !data.settings.setupGuideCompleted ? setupGuideHint.title : nextWorkshopTask ? `先补 ${getIntegrationLabel(nextWorkshopTask.id)} 这一条` : "现在可以直接开跑";
  const companionFocusDetail = data.activeRun ? "先刷完这一轮，再去战报补掉落；其他内容先不用看。" : !data.settings.setupGuideCompleted ? `${setupGuideHint.detail} 先把这一步补完，别的信息可以先忽略。` : nextWorkshopTask ? `${nextWorkshopTask.summary}。我建议先处理这一条，工坊才会更稳。` : "你现在只需要做三件事里的一个：开始一轮、去工坊试运行、去战报记掉落。";
  const companionFocusBadge = data.activeRun ? "当前任务" : !data.settings.setupGuideCompleted ? "下一步" : nextWorkshopTask ? "先补条件" : "已可开跑";
  const activeTabMeta = getTabMeta(activeTab);
  const busySummary = getBusySummary(busyKey);
  const panelScrollLabel = panelScrollState.canScrollDown ? panelScrollState.canScrollUp ? `已浏览 ${panelScrollState.progress}% · 继续下滑查看更多` : "向下滚动查看更多" : panelScrollState.canScrollUp ? "已经到底部了" : "当前内容已经完整显示";
  const panelStatusLabel = busySummary ? "处理中" : panelScrollState.canScrollDown ? "可下滑" : panelScrollState.canScrollUp ? "已到底" : "已全显";
  const panelFeedback = surfaceNotice ?? {
    title: `当前页面：${activeTabMeta.label}`,
    detail: busySummary ?? activeTabMeta.detail,
    tone: busySummary ? "attention" : "neutral"
  };
  if (isFloatingMode) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scene scene-floating", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FloatingPet,
        {
          activeRun: data.activeRun,
          alwaysOnTop: data.settings.alwaysOnTop,
          busy: busyKey === "start-run" || busyKey === "stop-run",
          event: petEvent,
          eventBusy: Boolean(busyKey),
          ceremony: petCeremony,
          fishingCatch: petFishingCatch,
          highlightDropName: highlightedDropName,
          interactionCue: petInteractionCue,
          liveDurationText: activeDurationText,
          onMinimize: () => void window.d2Pet.minimize(),
          onEventAction: handlePetEventAction,
          onOpenCodex: () => handleOpenPetCodex(),
          onOpenCodexEntry: handleOpenPetCodex,
          onOpenDrops: () => handleOpenPanel("drops"),
          onOpenPanel: () => handleOpenPanel("companion"),
          onOpenSetupGuide: handleFollowSetupGuideHint,
          onOpenWorkshop: () => handleOpenPanel("workshop"),
          onPetCheer: handlePetCheer,
          onPetHeadpat: handlePetHeadpat,
          onStartRun: (mapName) => void handleStartRun(mapName),
          onStopRun: () => void handleStopRun(),
          onToggleWindowMode: handleSwitchWindowMode,
          onToggleAlwaysOnTop: () => void handleUpdateSettings({ alwaysOnTop: !data.settings.alwaysOnTop }),
          preflight: setupPreflight,
          preflightBusy: setupPreflightBusy,
          progression: petProgression,
          rewards: petRewards,
          habitat: petHabitat,
          recentDrops: todayDrops,
          recentRuns,
          room: petRoom,
          scene: petScene,
          snapPreview: floatingSnapPreview,
          setupGuideHint,
          setupGuideCompleted: data.settings.setupGuideCompleted,
          todayCount: todayStats.totalCount,
          todayDropCount: todayDrops.length
        }
      ),
      message ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `toast ${message.kind === "error" ? "error" : "success"}`, children: message.text }) : null
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scene scene-panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app-shell", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PetShell,
      {
        activeRun: data.activeRun,
        alwaysOnTop: data.settings.alwaysOnTop,
        event: petEvent,
        eventBusy: Boolean(busyKey),
        ceremony: petCeremony,
        fishingCatch: petFishingCatch,
        highlightDropName: highlightedDropName,
        interactionCue: petInteractionCue,
        launchOnStartup: data.settings.launchOnStartup,
        liveDurationText: activeDurationText,
        notificationsEnabled: data.settings.notificationsEnabled,
        onEventAction: handlePetEventAction,
        onOpenCodex: () => handleOpenPetCodex(),
        onOpenCodexEntry: handleOpenPetCodex,
        onOpenSetupGuide: handleFollowSetupGuideHint,
        onPetCheer: handlePetCheer,
        onPetHeadpat: handlePetHeadpat,
        onMinimize: () => void window.d2Pet.minimize(),
        onToggleAlwaysOnTop: () => void handleUpdateSettings({ alwaysOnTop: !data.settings.alwaysOnTop }),
        onToggleLaunchOnStartup: () => void handleUpdateSettings({
          launchOnStartup: !data.settings.launchOnStartup
        }),
        onToggleNotifications: () => void handleUpdateSettings({
          notificationsEnabled: !data.settings.notificationsEnabled
        }),
        onToggleWindowMode: handleSwitchWindowMode,
        preflight: setupPreflight,
        progression: petProgression,
        rewards: petRewards,
        habitat: petHabitat,
        recentDrops: todayDrops,
        recentRuns,
        room: petRoom,
        scene: petScene,
        setupGuideHint,
        setupGuideCompleted: data.settings.setupGuideCompleted,
        detailsExpanded: showCompanionDetails,
        todayCount: todayStats.totalCount,
        todayDropCount: todayDrops.length,
        onToggleDetails: handleToggleCompanionDetails
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "tab-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: activeTab === "companion" ? "tab-button active" : "tab-button",
          onClick: () => handleSelectTab("companion"),
          type: "button",
          children: "陪刷"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: activeTab === "drops" ? "tab-button active" : "tab-button",
          onClick: () => handleSelectTab("drops"),
          type: "button",
          children: "战报"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: activeTab === "workshop" ? "tab-button active" : "tab-button",
          onClick: () => handleSelectTab("workshop"),
          type: "button",
          children: "工坊"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `page-feedback-bar tone-${panelFeedback.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: activeTabMeta.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: panelFeedback.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: panelFeedback.detail })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "page-feedback-meta", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${busySummary ? "attention" : "success"}`, children: panelStatusLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "helper-text", children: panelScrollLabel })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: [
          "panel-stack",
          activeTab === "companion" ? "panel-stack-companion" : "",
          panelScrollState.canScrollUp ? "has-top-hint" : "",
          panelScrollState.canScrollDown ? "has-bottom-hint" : ""
        ].filter(Boolean).join(" "),
        onWheelCapture: handlePanelWheel,
        onScroll: handlePanelScroll,
        ref: panelStackRef,
        tabIndex: -1,
        children: [
          activeTab === "companion" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            PanelErrorBoundary,
            {
              onReset: () => handleSelectTab("companion"),
              panelLabel: "陪刷",
              resetKey: `companion-${showSetupGuide}-${showCompanionDetails}-${showPetCodex}-${data.settings.setupGuideCompleted}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                !data.settings.setupGuideCompleted && showSetupGuide ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SetupGuide,
                  {
                    busyKey,
                    error: setupPreflightError,
                    latestActivity: setupGuideActivity,
                    loading: setupPreflightBusy,
                    onComplete: handleCompleteSetupGuide,
                    onDismiss: () => setShowSetupGuide(false),
                    onEnableFloating: handleEnableFloatingFromGuide,
                    onEnableNotifications: handleEnableNotificationsFromGuide,
                    onInstallRuntime: () => handleRunEnvironmentAction({ action: "install-python-runtime" }).then(
                      () => void 0
                    ),
                    onInstallDependencies: () => handleRunEnvironmentAction({ action: "install-python-deps" }).then(() => void 0),
                    onInstallAllEnvironments: handleInstallAllEnvironments,
                    onNextAction: handleFollowSetupGuideHint,
                    onOpenWorkshop: handleOpenWorkshopFromGuide,
                    onOpenWorkshopTask: handleOpenWorkshopTaskFromGuide,
                    onRefresh: refreshSetupGuide,
                    nextAction: setupGuideHint,
                    preflight: setupPreflight,
                    settings: data.settings
                  }
                ) : null,
                !data.settings.setupGuideCompleted && !showSetupGuide ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card setup-guide-reminder", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: "下一步" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: setupGuideHint.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: setupGuideHint.detail })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: handleFollowSetupGuideHint, type: "button", children: setupGuideHint.actionLabel }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: handleOpenSetupGuide, type: "button", children: "打开完整引导" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-button", onClick: handleCompleteSetupGuide, type: "button", children: "直接完成" })
                  ] })
                ] }) : null,
                !showSetupGuide ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "card companion-focus-card", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "integration-head", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "eyebrow", children: companionFocusBadge }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-title", children: companionFocusTitle }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "secondary-text", children: companionFocusDetail })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-pill ${data.activeRun ? "warm" : nextWorkshopTask ? "attention" : "success"}`, children: data.activeRun ? "先刷完这轮" : !data.settings.setupGuideCompleted ? "先补引导" : nextWorkshopTask ? "工坊待处理" : "直接开跑" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "companion-focus-grid", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "1" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: data.activeRun ? "先完成这一轮" : !data.settings.setupGuideCompleted ? setupGuideHint.title : nextWorkshopTask ? `去补 ${getIntegrationLabel(nextWorkshopTask.id)}` : `开始 ${defaultRouteName}` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: data.activeRun ? "刷完以后先结算本轮，再决定要不要记掉落。" : !data.settings.setupGuideCompleted ? "只跟着这一步走，不用先看养成和收藏。" : nextWorkshopTask ? "先把这条工坊线补齐，后面执行会更稳。" : "先开一轮最熟的图，首页和战报就会开始有内容。" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "工坊只做一件事" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "进工坊后只看顶部高亮任务卡，先录坐标或先试运行，不要同时管三条线。" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "focus-step-card", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mini-pill", children: "3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "战报最后再补" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "等真正刷完一轮，再去战报记掉落；现在可以先不用管收藏和养成。" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-row", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        className: "primary-button",
                        disabled: busyKey === "start-run" || busyKey === "stop-run",
                        onClick: () => {
                          if (data.activeRun) {
                            void handleStopRun();
                            return;
                          }
                          if (!data.settings.setupGuideCompleted) {
                            handleFollowSetupGuideHint();
                            return;
                          }
                          if (nextWorkshopTask) {
                            handleOpenWorkshopTaskFromGuide(nextWorkshopTask.id);
                            return;
                          }
                          void handleStartRun(defaultRouteName);
                        },
                        type: "button",
                        children: data.activeRun ? busyKey === "stop-run" ? "结算中..." : "完成这一轮" : !data.settings.setupGuideCompleted ? setupGuideHint.actionLabel : nextWorkshopTask ? `去处理${getIntegrationLabel(nextWorkshopTask.id)}` : `开始 ${defaultRouteName}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        className: "ghost-button",
                        onClick: () => nextWorkshopTask ? handleOpenWorkshopTaskFromGuide(nextWorkshopTask.id) : handleSelectTab("workshop"),
                        type: "button",
                        children: "打开工坊"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        className: "ghost-button",
                        onClick: () => handleSelectTab("drops"),
                        type: "button",
                        children: "打开战报"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        className: "ghost-button",
                        onClick: () => setShowCompanionDetails((current) => !current),
                        type: "button",
                        children: showCompanionDetails ? "收起扩展状态" : "展开扩展状态"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "companion-issue-grid", children: companionIssues.map((issue) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "article",
                    {
                      className: `companion-issue-card tone-${issue.tone}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: issue.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: issue.detail })
                      ]
                    },
                    `${issue.tone}-${issue.title}`
                  )) })
                ] }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CounterPanel,
                  {
                    activeDurationText,
                    activeRun: data.activeRun,
                    busy: busyKey === "start-run" || busyKey === "stop-run",
                    onFollowSetupGuideHint: handleFollowSetupGuideHint,
                    onOpenSetupGuide: handleOpenSetupGuide,
                    onGoToDrops: () => handleSelectTab("drops"),
                    onGoToWorkshop: () => handleSelectTab("workshop"),
                    onStartRun: handleStartRun,
                    onStopRun: handleStopRun,
                    preflight: setupPreflight,
                    preflightBusy: setupPreflightBusy,
                    recentDrops: todayDrops,
                    recentRuns,
                    onSurfaceNotice: announceSurfaceNotice,
                    setupGuideHint,
                    setupGuideCompleted: data.settings.setupGuideCompleted,
                    stats: todayStats
                  }
                ),
                showPetCodex && petCodex ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PetCodexOverlay,
                  {
                    codex: petCodex,
                    onClose: handleClosePetCodex,
                    onOpenDrops: () => handleSelectTab("drops"),
                    onOpenPath: handleOpenPath,
                    onOpenWorkshop: () => handleSelectTab("workshop"),
                    onSelectEntry: setSelectedCodexEntryId,
                    selectedEntryId: selectedCodexEntryId,
                    soundEnabled: data.settings.notificationsEnabled
                  }
                ) : null
              ] })
            }
          ) : null,
          activeTab === "drops" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            PanelErrorBoundary,
            {
              onReset: () => handleSelectTab("drops"),
              panelLabel: "战报",
              resetKey: "drops",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                DropPanel,
                {
                  busy: busyKey === "create-drop",
                  drops: data.drops,
                  onCreateDrop: handleCreateDrop,
                  onExportText: handleExportTextFile,
                  onExportVisual: handleExportVisualReport,
                  onOpenPath: handleOpenPath,
                  onPreviewOcr: handlePreviewDropOcr,
                  onSurfaceNotice: announceSurfaceNotice,
                  todayKey
                }
              )
            }
          ) : null,
          activeTab === "workshop" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            PanelErrorBoundary,
            {
              onReset: () => handleSelectTab("workshop"),
              panelLabel: "工坊",
              resetKey: "workshop",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                AutomationPanel,
                {
                  busyKey,
                  highlightedTaskId: workshopFocusId,
                  initialDrafts: data.automationDrafts,
                  onCopyText: handleCopyText,
                  onExportText: handleExportTextFile,
                  integrations: data.integrations,
                  onGetPreflight: handleGetAutomationPreflight,
                  onGetLog: handleGetAutomationLog,
                  onOpenPath: handleOpenPath,
                  onRunAdmin: handleRunAutomationAdmin,
                  onRunEnvironmentAction: handleRunEnvironmentAction,
                  onRunTask: handleRunAutomationTask,
                  onSurfaceNotice: announceSurfaceNotice
                }
              )
            }
          ) : null
        ]
      }
    ),
    message ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `toast ${message.kind === "error" ? "error" : "success"}`, children: message.text }) : null
  ] }) });
}
const bootDiagnostics = [];
function pushBootDiagnostic(level, args) {
  const formatted = args.map((value) => {
    if (value instanceof Error) {
      return value.stack || value.message;
    }
    if (typeof value === "string") {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }).join(" ");
  bootDiagnostics.push(`[${level}] ${formatted}`);
  if (bootDiagnostics.length > 12) {
    bootDiagnostics.shift();
  }
}
const originalConsoleError = window.console.error.bind(window.console);
window.console.error = (...args) => {
  pushBootDiagnostic("error", args);
  originalConsoleError(...args);
};
const originalConsoleWarn = window.console.warn.bind(window.console);
window.console.warn = (...args) => {
  pushBootDiagnostic("warn", args);
  originalConsoleWarn(...args);
};
function renderFatalBootError(error) {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }
  const message = error instanceof Error ? `${error.message}

${error.stack ?? ""}` : String(error);
  const diagnostics = bootDiagnostics.length ? `

---- recent console diagnostics ----
${bootDiagnostics.join("\n\n")}` : "";
  root.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at top, rgba(221, 97, 40, 0.18), transparent 34%),
        linear-gradient(180deg, rgba(23, 11, 8, 0.92), rgba(38, 20, 11, 0.96));
      color: #f4e6c1;
      font-family: 'Microsoft YaHei UI', 'Segoe UI', sans-serif;
    ">
      <div style="
        width: min(560px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(223, 171, 88, 0.4);
        background: rgba(18, 10, 8, 0.92);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        padding: 24px;
      ">
        <p style="margin: 0 0 10px; color: #d8b37a; letter-spacing: 0.12em; font-size: 12px;">BOOT ERROR</p>
        <h1 style="margin: 0 0 12px; font-size: 28px;">桌宠界面启动失败</h1>
        <p style="margin: 0 0 16px; color: #d7c7a4; line-height: 1.6;">
          渲染层在启动时发生异常。我已经把错误直接显示出来，方便继续定位。
        </p>
        <pre style="
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          border-radius: 16px;
          border: 1px solid rgba(255, 210, 140, 0.16);
          background: rgba(0, 0, 0, 0.32);
          padding: 16px;
          color: #ffe1b0;
          font-size: 12px;
          line-height: 1.55;
          max-height: 52vh;
          overflow: auto;
        ">${`${message}${diagnostics}`.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>
      </div>
    </div>
  `;
}
window.addEventListener("error", (event) => {
  renderFatalBootError(event.error ?? event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  renderFatalBootError(event.reason);
});
try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
  );
} catch (error) {
  renderFatalBootError(error);
}
//# sourceMappingURL=index-DVutlf9-.js.map
