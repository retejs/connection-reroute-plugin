/*!
* rete-connection-reroute-plugin v2.0.1
* (c) 2024 Vitaliy Stoliarov
* Released under the MIT license.
* */
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _typeof from '@babel/runtime/helpers/typeof';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _inherits from '@babel/runtime/helpers/inherits';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { getUID, Scope } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { classicConnectionPath } from 'rete-render-utils';

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function getPinsStorage() {
  var connectionPins = new Map();
  var pins = new Map();
  return {
    add: function add(connectionId, pin, index) {
      if (pins.has(pin.id)) throw new Error('already exists');
      var data = _objectSpread$1(_objectSpread$1({}, pin), {}, {
        connectionId: connectionId
      });
      var list = _toConsumableArray(connectionPins.get(connectionId) || []);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      var _index = typeof index === 'number' ? index : list.length;
      list.splice(_index, 0, data);
      connectionPins.set(connectionId, list);
      pins.set(pin.id, data);
    },
    remove: function remove(id) {
      var existing = this.getPin(id);
      if (existing) {
        var list = connectionPins.get(existing.connectionId) || [];
        connectionPins.set(existing.connectionId, list.filter(function (item) {
          return item.id !== existing.id;
        }));
        pins["delete"](existing.id);
      }
    },
    getPin: function getPin(id) {
      return pins.get(id);
    },
    getPins: function getPins(connectionId) {
      if (connectionId) return connectionPins.get(connectionId) || [];
      return Array.from(pins.values());
    }
  };
}

// eslint-disable-next-line max-statements
function findRightIndexBack(point) {
  var line = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var minIdx = -1;
  var minDist = Infinity;
  for (var index = 0; index < line.length; index++) {
    var point1 = line[index];
    var dist = distance(point, point1);
    if (dist < minDist) {
      minIdx = index;
      minDist = dist;
    }
  }
  if (minIdx === 0) {
    return 0;
  }
  if (minIdx === line.length - 1) {
    return minIdx - 1;
  }
  var leftDistBwtTarget = distance(point, line[minIdx - 1]);
  var leftDistBwtMinIdx = distance(line[minIdx], line[minIdx - 1]);
  if (leftDistBwtTarget < leftDistBwtMinIdx) {
    return minIdx - 1;
  }
  return minIdx;
}
function distance(point0, point1) {
  return Math.sqrt(Math.pow(point1.x - point0.x, 2) + Math.pow(point1.y - point0.y, 2));
}

// eslint-disable-next-line max-statements
function findRightIndex(point) {
  var line = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var minIdx = -1;
  var minDist = Infinity;
  for (var index = 0; index < line.length - 1; index++) {
    if (pointInBound(point, line[index], line[index + 1])) {
      var dist = distanceToLine(point, line[index], line[index + 1]);
      if (dist < minDist) {
        minIdx = index;
        minDist = dist;
      }
    }
  }
  if (minIdx === -1) {
    return findRightIndexBack(point, line);
  }
  return minIdx;
}

// eslint-disable-next-line max-statements, complexity
function pointInBound(p0, p1, p2) {
  var x1 = p1.x,
    y1 = p1.y;
  var x2 = p2.x,
    y2 = p2.y;
  var x0 = p0.x,
    y0 = p0.y;
  if (x1 < x0 && x0 < x2 && y1 < y0 && y0 < y2) {
    return true;
  }
  if (x2 < x0 && x0 < x1 && y2 < y0 && y0 < y1) {
    return true;
  }
  if (x1 < x0 && x0 < x2 && y1 > y0 && y0 > y2) {
    return true;
  }
  if (x2 < x0 && x0 < x1 && y2 > y0 && y0 > y1) {
    return true;
  }
  return false;
}
function distanceToLine(p0, p1, p2) {
  var top = (p2.y - p1.y) * p0.x - (p2.x - p1.x) * p0.y + p2.x * p1.y - p2.y * p1.x;
  var bot = Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2);
  return Math.abs(top) / Math.sqrt(bot);
}

/**
 * Enables synchronization between pins and the selector
 * @param reroutePlugin Reroute plugin instance
 * @param selector Selector instance
 * @param accumulating Accumulating state
 * @listens pinselected
 * @listens pinunselected
 * @listens pintranslated
 */
function selectablePins(reroutePlugin, selector, accumulating) {
  // eslint-disable-next-line max-statements
  reroutePlugin.addPipe(function (context) {
    if (!('type' in context)) return context;
    if (context.type === 'pinselected') {
      var id = context.data.id;
      selector.add({
        id: id,
        label: 'pin',
        translate: function translate(dx, dy) {
          reroutePlugin.translate(id, dx, dy);
        },
        unselect: function unselect() {
          reroutePlugin.unselect(id);
        }
      }, accumulating.active());
      selector.pick({
        id: id,
        label: 'pin'
      });
    }
    if (context.type === 'pinunselected') {
      var _id = context.data.id;
      selector.remove({
        id: _id,
        label: 'pin'
      });
    }
    if (context.type === 'pintranslated') {
      var _context$data = context.data,
        _id2 = _context$data.id,
        dx = _context$data.dx,
        dy = _context$data.dy;
      if (selector.isPicked({
        id: _id2,
        label: 'pin'
      })) selector.translate(dx, dy);
    }
    return context;
  });
}

/**
 * Extensions for the connection reroute plugin
 * @module
 */

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  selectablePins: selectablePins
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * Signal types consumed by the plugin
 */
/**
 * Signal types produced by the plugin
 * @priority 10
 */
/**
 * Reroute plugin
 * @listens rendered
 * @listens unmount
 * @listens reordered
 * @listens connectionpath
 * @listens pointerdown
 * @emits pintranslated
 * @emits pinselected
 * @emits pinunselected
 * @priority 9
 */
var ReroutePlugin = /*#__PURE__*/function (_Scope) {
  _inherits(ReroutePlugin, _Scope);
  var _super = _createSuper(ReroutePlugin);
  function ReroutePlugin() {
    var _this;
    _classCallCheck(this, ReroutePlugin);
    _this = _super.call(this, 'connection-reroute');
    _defineProperty(_assertThisInitialized(_this), "pinContainers", new Map());
    _defineProperty(_assertThisInitialized(_this), "pinParents", new Map());
    _defineProperty(_assertThisInitialized(_this), "pins", getPinsStorage());
    return _this;
  }
  _createClass(ReroutePlugin, [{
    key: "setParent",
    value: function setParent(scope) {
      var _this2 = this;
      _get(_getPrototypeOf(ReroutePlugin.prototype), "setParent", this).call(this, scope);
      // eslint-disable-next-line max-statements, complexity
      scope.addPipe(function (context) {
        if (!context || _typeof(context) !== 'object' || !('type' in context)) return context;
        if (context.type === 'rendered' && context.data.type === 'connection') {
          var area = scope.parentScope(BaseAreaPlugin);
          var _context$data = context.data,
            element = _context$data.element,
            id = _context$data.payload.id;
          if (!_this2.pinParents.has(element)) {
            var pinContainer = document.createElement('div');
            pinContainer.dataset['type'] = 'pin-container';
            _this2.pinContainers.set(id, {
              element: pinContainer
            });
            _this2.pinParents.set(element, {
              id: id,
              pinContainer: pinContainer
            });
            area.area.content.add(pinContainer);
            area.area.content.reorder(pinContainer, element.nextElementSibling);
          }
        }
        if (context.type === 'unmount') {
          var _area = scope.parentScope(BaseAreaPlugin);
          var _element = context.data.element;
          var record = _this2.pinParents.get(_element);
          if (record) {
            _this2.pinParents["delete"](_element);
            _this2.pinContainers["delete"](record.id);
            _area.emit({
              type: 'unmount',
              data: {
                element: record.pinContainer
              }
            });
            _area.area.content.remove(record.pinContainer);
          }
        }
        if (context.type === 'reordered') {
          var _area2 = scope.parentScope(BaseAreaPlugin);
          var _element2 = context.data.element;
          var _record = _this2.pinParents.get(_element2);
          if (_record) {
            _area2.area.content.reorder(_record.pinContainer, _element2.nextElementSibling);
          }
        }
        if (context.type === 'connectionpath') {
          var _area3 = scope.parentScope(BaseAreaPlugin);
          var _id = context.data.payload.id;
          var container = _this2.pinContainers.get(_id);
          var start = context.data.points[0];
          var end = context.data.points[context.data.points.length - 1];
          var pins = _this2.pins.getPins(_id);
          if (container) {
            _area3.emit({
              type: 'render',
              data: {
                type: 'reroute-pins',
                element: container.element,
                data: {
                  id: _id,
                  pins: pins
                }
              }
            });
          }
          var points = [start].concat(_toConsumableArray(pins.map(function (item) {
            return item.position;
          })), [end]);
          var path = '';
          for (var i = 1; i < points.length; i++) {
            var a = points[i - 1];
            var b = points[i];
            path += classicConnectionPath([a, b], 0.3) + ' ';
          }
          return _objectSpread(_objectSpread({}, context), {}, {
            data: _objectSpread(_objectSpread({}, context.data), {}, {
              points: points,
              path: path
            })
          });
        }
        if (context.type === 'pointerdown') {
          var _area4 = scope.parentScope(BaseAreaPlugin);
          var _path = context.data.event.composedPath();
          var views = Array.from(_area4.connectionViews.entries());
          var pickedConnection = views.find(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              view = _ref2[1];
            return _path.includes(view.element);
          });
          if (pickedConnection) {
            var _pickedConnection = _slicedToArray(pickedConnection, 2),
              _id2 = _pickedConnection[0],
              view = _pickedConnection[1];
            var svgPath = view.element.querySelector('path');
            var _pins = _this2.pins.getPins(_id2);
            if (svgPath && _pins) {
              var position = _objectSpread({}, _area4.area.pointer);
              var _start = svgPath.getPointAtLength(0);
              var _end = svgPath.getPointAtLength(1);
              var _points = [_start].concat(_toConsumableArray(_pins.map(function (p) {
                return p.position;
              })), [_end]);
              var index = findRightIndex(position, _points);
              _this2.add(_id2, position, index);
            }
          }
        }
        return context;
      });
    }

    /**
     * Add a new pin to the connection
     * @param connectionId Connection id
     * @param position Pin position
     * @param index Pin index, if not specified, the pin will be added to the end
     */
  }, {
    key: "add",
    value: function add(connectionId, position, index) {
      var area = this.parentScope().parentScope(BaseAreaPlugin);
      var pin = {
        id: getUID(),
        position: position
      };
      this.pins.add(connectionId, pin, index);
      area.update('connection', connectionId);
    }

    /**
     * Translate pin
     * @param pinId Pin id
     * @param dx Delta x
     * @param dy Delta y
     */
  }, {
    key: "translate",
    value: function () {
      var _translate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(pinId, dx, dy) {
        var pin;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              pin = this.pins.getPin(pinId);
              if (pin) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return");
            case 3:
              pin.position = {
                x: pin.position.x + dx,
                y: pin.position.y + dy
              };
              this.update(pin);
              _context.next = 7;
              return this.emit({
                type: 'pintranslated',
                data: {
                  id: pinId,
                  dx: dx,
                  dy: dy
                }
              });
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function translate(_x, _x2, _x3) {
        return _translate.apply(this, arguments);
      }
      return translate;
    }()
    /**
     * Remove pin
     * @param pinId Pin id
     */
  }, {
    key: "remove",
    value: function () {
      var _remove = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(pinId) {
        var pin;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              pin = this.pins.getPin(pinId);
              if (pin) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return");
            case 3:
              if (!pin.selected) {
                _context2.next = 6;
                break;
              }
              _context2.next = 6;
              return this.unselect(pinId);
            case 6:
              this.pins.remove(pinId);
              this.update(pin);
            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function remove(_x4) {
        return _remove.apply(this, arguments);
      }
      return remove;
    }()
    /**
     * Select pin
     * @param pinId Pin id
     */
  }, {
    key: "select",
    value: function () {
      var _select = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(pinId) {
        var pin;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              pin = this.pins.getPin(pinId);
              if (pin) {
                _context3.next = 3;
                break;
              }
              return _context3.abrupt("return");
            case 3:
              if (!pin.selected) {
                _context3.next = 5;
                break;
              }
              return _context3.abrupt("return");
            case 5:
              pin.selected = true;
              this.update(pin);
              _context3.next = 9;
              return this.emit({
                type: 'pinselected',
                data: {
                  id: pinId
                }
              });
            case 9:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function select(_x5) {
        return _select.apply(this, arguments);
      }
      return select;
    }()
    /**
     * Unselect pin
     * @param pinId Pin id
     */
  }, {
    key: "unselect",
    value: function () {
      var _unselect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(pinId) {
        var pin;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              pin = this.pins.getPin(pinId);
              if (pin) {
                _context4.next = 3;
                break;
              }
              return _context4.abrupt("return");
            case 3:
              if (pin.selected) {
                _context4.next = 5;
                break;
              }
              return _context4.abrupt("return");
            case 5:
              pin.selected = false;
              this.update(pin);
              _context4.next = 9;
              return this.emit({
                type: 'pinunselected',
                data: {
                  id: pinId
                }
              });
            case 9:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function unselect(_x6) {
        return _unselect.apply(this, arguments);
      }
      return unselect;
    }()
    /**
     * Update connection for the pin
     * @param pin Pin id or pin record
     */
  }, {
    key: "update",
    value: function update(pin) {
      var pinRecord = _typeof(pin) === 'object' ? pin : this.pins.getPin(pin);
      var area = this.parentScope().parentScope(BaseAreaPlugin);
      if (!pinRecord) return;
      area.update('connection', pinRecord.connectionId);
    }
  }]);
  return ReroutePlugin;
}(Scope);

export { index as RerouteExtensions, ReroutePlugin };
//# sourceMappingURL=rete-connection-reroute-plugin.esm.js.map
