var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global, factory) {
	(typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.XmlDSigJs = {});
})(this, function (exports) {
	'use strict';

	function getParametersValue(parameters, name, defaultValue) {
		if (parameters instanceof Object === false) return defaultValue;

		if (name in parameters) return parameters[name];

		return defaultValue;
	}

	function bufferToHexCodes(inputBuffer) {
		var inputOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var inputLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : inputBuffer.byteLength - inputOffset;
		var insertSpace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		var result = "";

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = new Uint8Array(inputBuffer, inputOffset, inputLength)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				var str = item.toString(16).toUpperCase();

				if (str.length === 1) result += "0";

				result += str;

				if (insertSpace) result += " ";
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return result.trim();
	}

	function checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength) {
		if (inputBuffer instanceof ArrayBuffer === false) {
			baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";
			return false;
		}

		if (inputBuffer.byteLength === 0) {
			baseBlock.error = "Wrong parameter: inputBuffer has zero length";
			return false;
		}

		if (inputOffset < 0) {
			baseBlock.error = "Wrong parameter: inputOffset less than zero";
			return false;
		}

		if (inputLength < 0) {
			baseBlock.error = "Wrong parameter: inputLength less than zero";
			return false;
		}

		if (inputBuffer.byteLength - inputOffset - inputLength < 0) {
			baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
			return false;
		}

		return true;
	}

	function utilFromBase(inputBuffer, inputBase) {
		var result = 0;

		if (inputBuffer.length === 1) return inputBuffer[0];

		for (var i = inputBuffer.length - 1; i >= 0; i--) {
			result += inputBuffer[inputBuffer.length - 1 - i] * Math.pow(2, inputBase * i);
		}return result;
	}

	function utilToBase(value, base) {
		var reserved = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

		var internalReserved = reserved;
		var internalValue = value;

		var result = 0;
		var biggest = Math.pow(2, base);

		for (var i = 1; i < 8; i++) {
			if (value < biggest) {
				var retBuf = void 0;

				if (internalReserved < 0) {
					retBuf = new ArrayBuffer(i);
					result = i;
				} else {
					if (internalReserved < i) return new ArrayBuffer(0);

					retBuf = new ArrayBuffer(internalReserved);

					result = internalReserved;
				}

				var retView = new Uint8Array(retBuf);

				for (var j = i - 1; j >= 0; j--) {
					var basis = Math.pow(2, j * base);

					retView[result - j - 1] = Math.floor(internalValue / basis);
					internalValue -= retView[result - j - 1] * basis;
				}

				return retBuf;
			}

			biggest *= Math.pow(2, base);
		}

		return new ArrayBuffer(0);
	}

	function utilConcatBuf() {
		var outputLength = 0;
		var prevLength = 0;

		for (var _len = arguments.length, buffers = Array(_len), _key = 0; _key < _len; _key++) {
			buffers[_key] = arguments[_key];
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = buffers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var buffer = _step2.value;

				outputLength += buffer.byteLength;
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var retBuf = new ArrayBuffer(outputLength);
		var retView = new Uint8Array(retBuf);

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = buffers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _buffer = _step3.value;

				retView.set(new Uint8Array(_buffer), prevLength);
				prevLength += _buffer.byteLength;
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		return retBuf;
	}

	function utilConcatView() {
		var outputLength = 0;
		var prevLength = 0;

		for (var _len2 = arguments.length, views = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			views[_key2] = arguments[_key2];
		}

		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = views[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var view = _step4.value;

				outputLength += view.length;
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		var retBuf = new ArrayBuffer(outputLength);
		var retView = new Uint8Array(retBuf);

		var _iteratorNormalCompletion5 = true;
		var _didIteratorError5 = false;
		var _iteratorError5 = undefined;

		try {
			for (var _iterator5 = views[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
				var _view2 = _step5.value;

				retView.set(_view2, prevLength);
				prevLength += _view2.length;
			}
		} catch (err) {
			_didIteratorError5 = true;
			_iteratorError5 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion5 && _iterator5.return) {
					_iterator5.return();
				}
			} finally {
				if (_didIteratorError5) {
					throw _iteratorError5;
				}
			}
		}

		return retView;
	}

	function utilDecodeTC() {
		var buf = new Uint8Array(this.valueHex);

		if (this.valueHex.byteLength >= 2) {
			var condition1 = buf[0] === 0xFF && buf[1] & 0x80;

			var condition2 = buf[0] === 0x00 && (buf[1] & 0x80) === 0x00;

			if (condition1 || condition2) this.warnings.push("Needlessly long format");
		}

		var bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var bigIntView = new Uint8Array(bigIntBuffer);

		for (var i = 0; i < this.valueHex.byteLength; i++) {
			bigIntView[i] = 0;
		}
		bigIntView[0] = buf[0] & 0x80;

		var bigInt = utilFromBase(bigIntView, 8);

		var smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var smallIntView = new Uint8Array(smallIntBuffer);

		for (var j = 0; j < this.valueHex.byteLength; j++) {
			smallIntView[j] = buf[j];
		}
		smallIntView[0] &= 0x7F;

		var smallInt = utilFromBase(smallIntView, 8);


		return smallInt - bigInt;
	}

	function utilEncodeTC(value) {
		var modValue = value < 0 ? value * -1 : value;
		var bigInt = 128;

		for (var i = 1; i < 8; i++) {
			if (modValue <= bigInt) {
				if (value < 0) {
					var smallInt = bigInt - modValue;

					var _retBuf = utilToBase(smallInt, 8, i);
					var _retView = new Uint8Array(_retBuf);

					_retView[0] |= 0x80;

					return _retBuf;
				}

				var retBuf = utilToBase(modValue, 8, i);
				var retView = new Uint8Array(retBuf);

				if (retView[0] & 0x80) {
					var tempBuf = retBuf.slice(0);
					var tempView = new Uint8Array(tempBuf);

					retBuf = new ArrayBuffer(retBuf.byteLength + 1);

					retView = new Uint8Array(retBuf);

					for (var k = 0; k < tempBuf.byteLength; k++) {
						retView[k + 1] = tempView[k];
					}
					retView[0] = 0x00;
				}

				return retBuf;
			}

			bigInt *= Math.pow(2, 8);
		}

		return new ArrayBuffer(0);
	}

	function isEqualBuffer(inputBuffer1, inputBuffer2) {
		if (inputBuffer1.byteLength !== inputBuffer2.byteLength) return false;

		var view1 = new Uint8Array(inputBuffer1);

		var view2 = new Uint8Array(inputBuffer2);

		for (var i = 0; i < view1.length; i++) {
			if (view1[i] !== view2[i]) return false;
		}

		return true;
	}

	function padNumber(inputNumber, fullLength) {
		var str = inputNumber.toString(10);

		if (fullLength < str.length) return "";

		var dif = fullLength - str.length;

		var padding = new Array(dif);

		for (var i = 0; i < dif; i++) {
			padding[i] = "0";
		}var paddingString = padding.join("");

		return paddingString.concat(str);
	}

	var base64Template = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var base64UrlTemplate = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

	function toBase64(input) {
		var useUrlTemplate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
		var skipPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
		var skipLeadingZeros = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		var i = 0;

		var flag1 = 0;

		var flag2 = 0;

		var output = "";

		var template = useUrlTemplate ? base64UrlTemplate : base64Template;

		if (skipLeadingZeros) {
			var nonZeroPosition = 0;

			for (var _i2 = 0; _i2 < input.length; _i2++) {
				if (input.charCodeAt(_i2) !== 0) {
					nonZeroPosition = _i2;

					break;
				}
			}

			input = input.slice(nonZeroPosition);
		}

		while (i < input.length) {
			var chr1 = input.charCodeAt(i++);

			if (i >= input.length) flag1 = 1;

			var chr2 = input.charCodeAt(i++);

			if (i >= input.length) flag2 = 1;

			var chr3 = input.charCodeAt(i++);

			var enc1 = chr1 >> 2;

			var enc2 = (chr1 & 0x03) << 4 | chr2 >> 4;

			var enc3 = (chr2 & 0x0F) << 2 | chr3 >> 6;

			var enc4 = chr3 & 0x3F;

			if (flag1 === 1) {
				enc3 = enc4 = 64;
			} else {
				if (flag2 === 1) {
					enc4 = 64;
				}
			}

			if (skipPadding) {
				if (enc3 === 64) output += '' + template.charAt(enc1) + template.charAt(enc2);else {
					if (enc4 === 64) output += '' + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3);else output += '' + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3) + template.charAt(enc4);
				}
			} else output += '' + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3) + template.charAt(enc4);
		}

		return output;
	}

	function fromBase64(input) {
		var useUrlTemplate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
		var cutTailZeros = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

		var template = useUrlTemplate ? base64UrlTemplate : base64Template;

		function indexof(toSearch) {
			for (var _i3 = 0; _i3 < 64; _i3++) {
				if (template.charAt(_i3) === toSearch) return _i3;
			}

			return 64;
		}

		function test(incoming) {
			return incoming === 64 ? 0x00 : incoming;
		}


		var i = 0;

		var output = "";

		while (i < input.length) {
			var enc1 = indexof(input.charAt(i++));

			var enc2 = i >= input.length ? 0x00 : indexof(input.charAt(i++));

			var enc3 = i >= input.length ? 0x00 : indexof(input.charAt(i++));

			var enc4 = i >= input.length ? 0x00 : indexof(input.charAt(i++));

			var chr1 = test(enc1) << 2 | test(enc2) >> 4;

			var chr2 = (test(enc2) & 0x0F) << 4 | test(enc3) >> 2;

			var chr3 = (test(enc3) & 0x03) << 6 | test(enc4);

			output += String.fromCharCode(chr1);

			if (enc3 !== 64) output += String.fromCharCode(chr2);

			if (enc4 !== 64) output += String.fromCharCode(chr3);
		}

		if (cutTailZeros) {
			var outputLength = output.length;
			var nonZeroStart = -1;

			for (var _i4 = outputLength - 1; _i4 >= 0; _i4--) {
				if (output.charCodeAt(_i4) !== 0) {
					nonZeroStart = _i4;

					break;
				}
			}

			if (nonZeroStart !== -1) output = output.slice(0, nonZeroStart + 1);else output = "";
		}

		return output;
	}

	function arrayBufferToString(buffer) {
		var resultString = "";
		var view = new Uint8Array(buffer);

		var _iteratorNormalCompletion6 = true;
		var _didIteratorError6 = false;
		var _iteratorError6 = undefined;

		try {
			for (var _iterator6 = view[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
				var element = _step6.value;

				resultString += String.fromCharCode(element);
			}
		} catch (err) {
			_didIteratorError6 = true;
			_iteratorError6 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion6 && _iterator6.return) {
					_iterator6.return();
				}
			} finally {
				if (_didIteratorError6) {
					throw _iteratorError6;
				}
			}
		}

		return resultString;
	}

	function stringToArrayBuffer(str) {
		var stringLength = str.length;

		var resultBuffer = new ArrayBuffer(stringLength);
		var resultView = new Uint8Array(resultBuffer);

		for (var i = 0; i < stringLength; i++) {
			resultView[i] = str.charCodeAt(i);
		}return resultBuffer;
	}

	var log2 = Math.log(2);

	function nearestPowerOf2(length) {
		var base = Math.log(length) / log2;

		var floor = Math.floor(base);
		var round = Math.round(base);

		return floor === round ? floor : round;
	}

	function clearProps(object, propsArray) {
		var _iteratorNormalCompletion7 = true;
		var _didIteratorError7 = false;
		var _iteratorError7 = undefined;

		try {
			for (var _iterator7 = propsArray[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
				var prop = _step7.value;

				delete object[prop];
			}
		} catch (err) {
			_didIteratorError7 = true;
			_iteratorError7 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion7 && _iterator7.return) {
					_iterator7.return();
				}
			} finally {
				if (_didIteratorError7) {
					throw _iteratorError7;
				}
			}
		}
	}

	var powers2 = [new Uint8Array([1])];
	var digitsString = "0123456789";

	var LocalBaseBlock = function () {
		function LocalBaseBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBaseBlock);

			this.blockLength = getParametersValue(parameters, "blockLength", 0);

			this.error = getParametersValue(parameters, "error", "");

			this.warnings = getParametersValue(parameters, "warnings", []);

			if ("valueBeforeDecode" in parameters) this.valueBeforeDecode = parameters.valueBeforeDecode.slice(0);else this.valueBeforeDecode = new ArrayBuffer(0);
		}

		_createClass(LocalBaseBlock, [{
			key: 'toJSON',
			value: function toJSON() {
				return {
					blockName: this.constructor.blockName(),
					blockLength: this.blockLength,
					error: this.error,
					warnings: this.warnings,
					valueBeforeDecode: bufferToHexCodes(this.valueBeforeDecode, 0, this.valueBeforeDecode.byteLength)
				};
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "baseBlock";
			}
		}]);

		return LocalBaseBlock;
	}();

	var LocalHexBlock = function LocalHexBlock(BaseClass) {
		return function (_BaseClass) {
			_inherits(LocalHexBlockMixin, _BaseClass);

			function LocalHexBlockMixin() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				_classCallCheck(this, LocalHexBlockMixin);

				var _this2 = _possibleConstructorReturn(this, (LocalHexBlockMixin.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin)).call(this, parameters));

				_this2.isHexOnly = getParametersValue(parameters, "isHexOnly", false);

				if ("valueHex" in parameters) _this2.valueHex = parameters.valueHex.slice(0);else _this2.valueHex = new ArrayBuffer(0);
				return _this2;
			}

			_createClass(LocalHexBlockMixin, [{
				key: 'fromBER',
				value: function fromBER(inputBuffer, inputOffset, inputLength) {
					if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;

					var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

					if (intBuffer.length === 0) {
						this.warnings.push("Zero buffer length");
						return inputOffset;
					}

					this.valueHex = inputBuffer.slice(inputOffset, inputOffset + inputLength);


					this.blockLength = inputLength;

					return inputOffset + inputLength;
				}
			}, {
				key: 'toBER',
				value: function toBER() {
					var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

					if (this.isHexOnly !== true) {
						this.error = "Flag \"isHexOnly\" is not set, abort";
						return new ArrayBuffer(0);
					}

					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					return this.valueHex.slice(0);
				}
			}, {
				key: 'toJSON',
				value: function toJSON() {
					var object = {};

					try {
						object = _get(LocalHexBlockMixin.prototype.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin.prototype), 'toJSON', this).call(this);
					} catch (ex) {}


					object.blockName = this.constructor.blockName();
					object.isHexOnly = this.isHexOnly;
					object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

					return object;
				}
			}], [{
				key: 'blockName',
				value: function blockName() {
					return "hexBlock";
				}
			}]);

			return LocalHexBlockMixin;
		}(BaseClass);
	};

	var LocalIdentificationBlock = function (_LocalHexBlock) {
		_inherits(LocalIdentificationBlock, _LocalHexBlock);

		function LocalIdentificationBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalIdentificationBlock);

			var _this3 = _possibleConstructorReturn(this, (LocalIdentificationBlock.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock)).call(this));

			if ("idBlock" in parameters) {
				_this3.isHexOnly = getParametersValue(parameters.idBlock, "isHexOnly", false);
				_this3.valueHex = getParametersValue(parameters.idBlock, "valueHex", new ArrayBuffer(0));


				_this3.tagClass = getParametersValue(parameters.idBlock, "tagClass", -1);
				_this3.tagNumber = getParametersValue(parameters.idBlock, "tagNumber", -1);
				_this3.isConstructed = getParametersValue(parameters.idBlock, "isConstructed", false);
			} else {
				_this3.tagClass = -1;
				_this3.tagNumber = -1;
				_this3.isConstructed = false;
			}
			return _this3;
		}

		_createClass(LocalIdentificationBlock, [{
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var firstOctet = 0;
				var retBuf = void 0;
				var retView = void 0;


				switch (this.tagClass) {
					case 1:
						firstOctet |= 0x00;
						break;
					case 2:
						firstOctet |= 0x40;
						break;
					case 3:
						firstOctet |= 0x80;
						break;
					case 4:
						firstOctet |= 0xC0;
						break;
					default:
						this.error = "Unknown tag class";
						return new ArrayBuffer(0);
				}

				if (this.isConstructed) firstOctet |= 0x20;

				if (this.tagNumber < 31 && !this.isHexOnly) {
					retBuf = new ArrayBuffer(1);
					retView = new Uint8Array(retBuf);

					if (!sizeOnly) {
						var number = this.tagNumber;
						number &= 0x1F;
						firstOctet |= number;

						retView[0] = firstOctet;
					}

					return retBuf;
				}

				if (this.isHexOnly === false) {
					var encodedBuf = utilToBase(this.tagNumber, 7);
					var encodedView = new Uint8Array(encodedBuf);
					var size = encodedBuf.byteLength;

					retBuf = new ArrayBuffer(size + 1);
					retView = new Uint8Array(retBuf);
					retView[0] = firstOctet | 0x1F;

					if (!sizeOnly) {
						for (var i = 0; i < size - 1; i++) {
							retView[i + 1] = encodedView[i] | 0x80;
						}retView[size] = encodedView[size - 1];
					}

					return retBuf;
				}

				retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				retView = new Uint8Array(retBuf);

				retView[0] = firstOctet | 0x1F;

				if (sizeOnly === false) {
					var curView = new Uint8Array(this.valueHex);

					for (var _i5 = 0; _i5 < curView.length - 1; _i5++) {
						retView[_i5 + 1] = curView[_i5] | 0x80;
					}retView[this.valueHex.byteLength] = curView[curView.length - 1];
				}

				return retBuf;
			}
		}, {
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}

				var tagClassMask = intBuffer[0] & 0xC0;

				switch (tagClassMask) {
					case 0x00:
						this.tagClass = 1;
						break;
					case 0x40:
						this.tagClass = 2;
						break;
					case 0x80:
						this.tagClass = 3;
						break;
					case 0xC0:
						this.tagClass = 4;
						break;
					default:
						this.error = "Unknown tag class";
						return -1;
				}

				this.isConstructed = (intBuffer[0] & 0x20) === 0x20;

				this.isHexOnly = false;

				var tagNumberMask = intBuffer[0] & 0x1F;

				if (tagNumberMask !== 0x1F) {
					this.tagNumber = tagNumberMask;
					this.blockLength = 1;
				} else {
						var count = 1;

						this.valueHex = new ArrayBuffer(255);
						var tagNumberBufferMaxLength = 255;
						var intTagNumberBuffer = new Uint8Array(this.valueHex);

						while (intBuffer[count] & 0x80) {
							intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
							count++;

							if (count >= intBuffer.length) {
								this.error = "End of input reached before message was fully decoded";
								return -1;
							}

							if (count === tagNumberBufferMaxLength) {
								tagNumberBufferMaxLength += 255;

								var _tempBuffer = new ArrayBuffer(tagNumberBufferMaxLength);
								var _tempBufferView = new Uint8Array(_tempBuffer);

								for (var i = 0; i < intTagNumberBuffer.length; i++) {
									_tempBufferView[i] = intTagNumberBuffer[i];
								}this.valueHex = new ArrayBuffer(tagNumberBufferMaxLength);
								intTagNumberBuffer = new Uint8Array(this.valueHex);
							}
						}

						this.blockLength = count + 1;
						intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
						var tempBuffer = new ArrayBuffer(count);
						var tempBufferView = new Uint8Array(tempBuffer);

						for (var _i6 = 0; _i6 < count; _i6++) {
							tempBufferView[_i6] = intTagNumberBuffer[_i6];
						}this.valueHex = new ArrayBuffer(count);
						intTagNumberBuffer = new Uint8Array(this.valueHex);
						intTagNumberBuffer.set(tempBufferView);

						if (this.blockLength <= 9) this.tagNumber = utilFromBase(intTagNumberBuffer, 7);else {
							this.isHexOnly = true;
							this.warnings.push("Tag too long, represented as hex-coded");
						}
					}

				if (this.tagClass === 1 && this.isConstructed) {
					switch (this.tagNumber) {
						case 1:
						case 2:
						case 5:
						case 6:
						case 9:
						case 14:
						case 23:
						case 24:
						case 31:
						case 32:
						case 33:
						case 34:
							this.error = "Constructed encoding used for primitive type";
							return -1;
						default:
					}
				}


				return inputOffset + this.blockLength;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalIdentificationBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.blockName = this.constructor.blockName();
				object.tagClass = this.tagClass;
				object.tagNumber = this.tagNumber;
				object.isConstructed = this.isConstructed;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "identificationBlock";
			}
		}]);

		return LocalIdentificationBlock;
	}(LocalHexBlock(LocalBaseBlock));

	var LocalLengthBlock = function (_LocalBaseBlock) {
		_inherits(LocalLengthBlock, _LocalBaseBlock);

		function LocalLengthBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalLengthBlock);

			var _this4 = _possibleConstructorReturn(this, (LocalLengthBlock.__proto__ || Object.getPrototypeOf(LocalLengthBlock)).call(this));

			if ("lenBlock" in parameters) {
				_this4.isIndefiniteForm = getParametersValue(parameters.lenBlock, "isIndefiniteForm", false);
				_this4.longFormUsed = getParametersValue(parameters.lenBlock, "longFormUsed", false);
				_this4.length = getParametersValue(parameters.lenBlock, "length", 0);
			} else {
				_this4.isIndefiniteForm = false;
				_this4.longFormUsed = false;
				_this4.length = 0;
			}
			return _this4;
		}

		_createClass(LocalLengthBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}

				if (intBuffer[0] === 0xFF) {
					this.error = "Length block 0xFF is reserved by standard";
					return -1;
				}

				this.isIndefiniteForm = intBuffer[0] === 0x80;

				if (this.isIndefiniteForm === true) {
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}

				this.longFormUsed = !!(intBuffer[0] & 0x80);

				if (this.longFormUsed === false) {
					this.length = intBuffer[0];
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}

				var count = intBuffer[0] & 0x7F;

				if (count > 8) {
						this.error = "Too big integer";
						return -1;
					}

				if (count + 1 > intBuffer.length) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				var lengthBufferView = new Uint8Array(count);

				for (var i = 0; i < count; i++) {
					lengthBufferView[i] = intBuffer[i + 1];
				}if (lengthBufferView[count - 1] === 0x00) this.warnings.push("Needlessly long encoded length");

				this.length = utilFromBase(lengthBufferView, 8);

				if (this.longFormUsed && this.length <= 127) this.warnings.push("Unneccesary usage of long length form");

				this.blockLength = count + 1;


				return inputOffset + this.blockLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = void 0;
				var retView = void 0;


				if (this.length > 127) this.longFormUsed = true;

				if (this.isIndefiniteForm) {
					retBuf = new ArrayBuffer(1);

					if (sizeOnly === false) {
						retView = new Uint8Array(retBuf);
						retView[0] = 0x80;
					}

					return retBuf;
				}

				if (this.longFormUsed === true) {
					var encodedBuf = utilToBase(this.length, 8);

					if (encodedBuf.byteLength > 127) {
						this.error = "Too big length";
						return new ArrayBuffer(0);
					}

					retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);

					if (sizeOnly === true) return retBuf;

					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					retView[0] = encodedBuf.byteLength | 0x80;

					for (var i = 0; i < encodedBuf.byteLength; i++) {
						retView[i + 1] = encodedView[i];
					}return retBuf;
				}

				retBuf = new ArrayBuffer(1);

				if (sizeOnly === false) {
					retView = new Uint8Array(retBuf);

					retView[0] = this.length;
				}

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalLengthBlock.prototype.__proto__ || Object.getPrototypeOf(LocalLengthBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.blockName = this.constructor.blockName();
				object.isIndefiniteForm = this.isIndefiniteForm;
				object.longFormUsed = this.longFormUsed;
				object.length = this.length;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "lengthBlock";
			}
		}]);

		return LocalLengthBlock;
	}(LocalBaseBlock);

	var LocalValueBlock = function (_LocalBaseBlock2) {
		_inherits(LocalValueBlock, _LocalBaseBlock2);

		function LocalValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalValueBlock);

			return _possibleConstructorReturn(this, (LocalValueBlock.__proto__ || Object.getPrototypeOf(LocalValueBlock)).call(this, parameters));
		}

		_createClass(LocalValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "valueBlock";
			}
		}]);

		return LocalValueBlock;
	}(LocalBaseBlock);

	var BaseBlock = function (_LocalBaseBlock3) {
		_inherits(BaseBlock, _LocalBaseBlock3);

		function BaseBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var valueBlockType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : LocalValueBlock;

			_classCallCheck(this, BaseBlock);

			var _this6 = _possibleConstructorReturn(this, (BaseBlock.__proto__ || Object.getPrototypeOf(BaseBlock)).call(this, parameters));

			if ("name" in parameters) _this6.name = parameters.name;
			if ("optional" in parameters) _this6.optional = parameters.optional;
			if ("primitiveSchema" in parameters) _this6.primitiveSchema = parameters.primitiveSchema;

			_this6.idBlock = new LocalIdentificationBlock(parameters);
			_this6.lenBlock = new LocalLengthBlock(parameters);
			_this6.valueBlock = new valueBlockType(parameters);
			return _this6;
		}

		_createClass(BaseBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = void 0;

				var idBlockBuf = this.idBlock.toBER(sizeOnly);
				var valueBlockSizeBuf = this.valueBlock.toBER(true);

				this.lenBlock.length = valueBlockSizeBuf.byteLength;
				var lenBlockBuf = this.lenBlock.toBER(sizeOnly);

				retBuf = utilConcatBuf(idBlockBuf, lenBlockBuf);

				var valueBlockBuf = void 0;

				if (sizeOnly === false) valueBlockBuf = this.valueBlock.toBER(sizeOnly);else valueBlockBuf = new ArrayBuffer(this.lenBlock.length);

				retBuf = utilConcatBuf(retBuf, valueBlockBuf);

				if (this.lenBlock.isIndefiniteForm === true) {
					var indefBuf = new ArrayBuffer(2);

					if (sizeOnly === false) {
						var indefView = new Uint8Array(indefBuf);

						indefView[0] = 0x00;
						indefView[1] = 0x00;
					}

					retBuf = utilConcatBuf(retBuf, indefBuf);
				}

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(BaseBlock.prototype.__proto__ || Object.getPrototypeOf(BaseBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.idBlock = this.idBlock.toJSON();
				object.lenBlock = this.lenBlock.toJSON();
				object.valueBlock = this.valueBlock.toJSON();

				if ("name" in this) object.name = this.name;
				if ("optional" in this) object.optional = this.optional;
				if ("primitiveSchema" in this) object.primitiveSchema = this.primitiveSchema.toJSON();

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BaseBlock";
			}
		}]);

		return BaseBlock;
	}(LocalBaseBlock);

	var LocalPrimitiveValueBlock = function (_LocalValueBlock) {
		_inherits(LocalPrimitiveValueBlock, _LocalValueBlock);

		function LocalPrimitiveValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalPrimitiveValueBlock);

			var _this7 = _possibleConstructorReturn(this, (LocalPrimitiveValueBlock.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock)).call(this, parameters));

			if ("valueHex" in parameters) _this7.valueHex = parameters.valueHex.slice(0);else _this7.valueHex = new ArrayBuffer(0);

			_this7.isHexOnly = getParametersValue(parameters, "isHexOnly", true);
			return _this7;
		}

		_createClass(LocalPrimitiveValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}

				this.valueHex = new ArrayBuffer(intBuffer.length);
				var valueHexView = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					valueHexView[i] = intBuffer[i];
				}

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.valueHex.slice(0);
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalPrimitiveValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);
				object.isHexOnly = this.isHexOnly;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "PrimitiveValueBlock";
			}
		}]);

		return LocalPrimitiveValueBlock;
	}(LocalValueBlock);

	var Primitive = function (_BaseBlock) {
		_inherits(Primitive, _BaseBlock);

		function Primitive() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Primitive);

			var _this8 = _possibleConstructorReturn(this, (Primitive.__proto__ || Object.getPrototypeOf(Primitive)).call(this, parameters, LocalPrimitiveValueBlock));

			_this8.idBlock.isConstructed = false;
			return _this8;
		}

		_createClass(Primitive, null, [{
			key: 'blockName',
			value: function blockName() {
				return "PRIMITIVE";
			}
		}]);

		return Primitive;
	}(BaseBlock);

	var LocalConstructedValueBlock = function (_LocalValueBlock2) {
		_inherits(LocalConstructedValueBlock, _LocalValueBlock2);

		function LocalConstructedValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalConstructedValueBlock);

			var _this9 = _possibleConstructorReturn(this, (LocalConstructedValueBlock.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock)).call(this, parameters));

			_this9.value = getParametersValue(parameters, "value", []);
			_this9.isIndefiniteForm = getParametersValue(parameters, "isIndefiniteForm", false);
			return _this9;
		}

		_createClass(LocalConstructedValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var initialOffset = inputOffset;
				var initialLength = inputLength;

				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}

				function checkLen(indefiniteLength, length) {
					if (indefiniteLength === true) return 1;

					return length;
				}


				var currentOffset = inputOffset;

				while (checkLen(this.isIndefiniteForm, inputLength) > 0) {
					var returnObject = LocalFromBER(inputBuffer, currentOffset, inputLength);
					if (returnObject.offset === -1) {
						this.error = returnObject.result.error;
						this.warnings.concat(returnObject.result.warnings);
						return -1;
					}

					currentOffset = returnObject.offset;

					this.blockLength += returnObject.result.blockLength;
					inputLength -= returnObject.result.blockLength;

					this.value.push(returnObject.result);

					if (this.isIndefiniteForm === true && returnObject.result.constructor.blockName() === EndOfContent.blockName()) break;
				}

				if (this.isIndefiniteForm === true) {
					if (this.value[this.value.length - 1].constructor.blockName() === EndOfContent.blockName()) this.value.pop();else this.warnings.push("No EndOfContent block encoded");
				}

				this.valueBeforeDecode = inputBuffer.slice(initialOffset, initialOffset + initialLength);


				return currentOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					retBuf = utilConcatBuf(retBuf, valueBuf);
				}

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalConstructedValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.isIndefiniteForm = this.isIndefiniteForm;
				object.value = [];
				for (var i = 0; i < this.value.length; i++) {
					object.value.push(this.value[i].toJSON());
				}return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "ConstructedValueBlock";
			}
		}]);

		return LocalConstructedValueBlock;
	}(LocalValueBlock);

	var Constructed = function (_BaseBlock2) {
		_inherits(Constructed, _BaseBlock2);

		function Constructed() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Constructed);

			var _this10 = _possibleConstructorReturn(this, (Constructed.__proto__ || Object.getPrototypeOf(Constructed)).call(this, parameters, LocalConstructedValueBlock));

			_this10.idBlock.isConstructed = true;
			return _this10;
		}

		_createClass(Constructed, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "CONSTRUCTED";
			}
		}]);

		return Constructed;
	}(BaseBlock);

	var LocalEndOfContentValueBlock = function (_LocalValueBlock3) {
		_inherits(LocalEndOfContentValueBlock, _LocalValueBlock3);

		function LocalEndOfContentValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalEndOfContentValueBlock);

			return _possibleConstructorReturn(this, (LocalEndOfContentValueBlock.__proto__ || Object.getPrototypeOf(LocalEndOfContentValueBlock)).call(this, parameters));
		}

		_createClass(LocalEndOfContentValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				return inputOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return new ArrayBuffer(0);
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "EndOfContentValueBlock";
			}
		}]);

		return LocalEndOfContentValueBlock;
	}(LocalValueBlock);

	var EndOfContent = function (_BaseBlock3) {
		_inherits(EndOfContent, _BaseBlock3);

		function EndOfContent() {
			var paramaters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, EndOfContent);

			var _this12 = _possibleConstructorReturn(this, (EndOfContent.__proto__ || Object.getPrototypeOf(EndOfContent)).call(this, paramaters, LocalEndOfContentValueBlock));

			_this12.idBlock.tagClass = 1;
			_this12.idBlock.tagNumber = 0;return _this12;
		}

		_createClass(EndOfContent, null, [{
			key: 'blockName',
			value: function blockName() {
				return "EndOfContent";
			}
		}]);

		return EndOfContent;
	}(BaseBlock);

	var LocalBooleanValueBlock = function (_LocalValueBlock4) {
		_inherits(LocalBooleanValueBlock, _LocalValueBlock4);

		function LocalBooleanValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBooleanValueBlock);

			var _this13 = _possibleConstructorReturn(this, (LocalBooleanValueBlock.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock)).call(this, parameters));

			_this13.value = getParametersValue(parameters, "value", false);
			_this13.isHexOnly = getParametersValue(parameters, "isHexOnly", false);

			if ("valueHex" in parameters) _this13.valueHex = parameters.valueHex.slice(0);else {
				_this13.valueHex = new ArrayBuffer(1);
				if (_this13.value === true) {
					var view = new Uint8Array(_this13.valueHex);
					view[0] = 0xFF;
				}
			}
			return _this13;
		}

		_createClass(LocalBooleanValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);


				if (inputLength > 1) this.warnings.push("Boolean value encoded in more then 1 octet");

				this.isHexOnly = true;

				this.valueHex = new ArrayBuffer(intBuffer.length);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					view[i] = intBuffer[i];
				}

				if (utilDecodeTC.call(this) !== 0) this.value = true;else this.value = false;

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.valueHex;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalBooleanValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BooleanValueBlock";
			}
		}]);

		return LocalBooleanValueBlock;
	}(LocalValueBlock);

	var Boolean = function (_BaseBlock4) {
		_inherits(Boolean, _BaseBlock4);

		function Boolean() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Boolean);

			var _this14 = _possibleConstructorReturn(this, (Boolean.__proto__ || Object.getPrototypeOf(Boolean)).call(this, parameters, LocalBooleanValueBlock));

			_this14.idBlock.tagClass = 1;
			_this14.idBlock.tagNumber = 1;return _this14;
		}

		_createClass(Boolean, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Boolean";
			}
		}]);

		return Boolean;
	}(BaseBlock);

	var Sequence = function (_Constructed) {
		_inherits(Sequence, _Constructed);

		function Sequence() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Sequence);

			var _this15 = _possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this, parameters));

			_this15.idBlock.tagClass = 1;
			_this15.idBlock.tagNumber = 16;return _this15;
		}

		_createClass(Sequence, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Sequence";
			}
		}]);

		return Sequence;
	}(Constructed);

	var Set = function (_Constructed2) {
		_inherits(Set, _Constructed2);

		function Set() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Set);

			var _this16 = _possibleConstructorReturn(this, (Set.__proto__ || Object.getPrototypeOf(Set)).call(this, parameters));

			_this16.idBlock.tagClass = 1;
			_this16.idBlock.tagNumber = 17;return _this16;
		}

		_createClass(Set, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Set";
			}
		}]);

		return Set;
	}(Constructed);

	var Null = function (_BaseBlock5) {
		_inherits(Null, _BaseBlock5);

		function Null() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Null);

			var _this17 = _possibleConstructorReturn(this, (Null.__proto__ || Object.getPrototypeOf(Null)).call(this, parameters, LocalBaseBlock));

			_this17.idBlock.tagClass = 1;
			_this17.idBlock.tagNumber = 5;return _this17;
		}

		_createClass(Null, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (this.lenBlock.length > 0) this.warnings.push("Non-zero length of value block for Null type");

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				this.blockLength += inputLength;

				if (inputOffset + inputLength > inputBuffer.byteLength) {
					this.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
					return -1;
				}

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = new ArrayBuffer(2);

				if (sizeOnly === true) return retBuf;

				var retView = new Uint8Array(retBuf);
				retView[0] = 0x05;
				retView[1] = 0x00;

				return retBuf;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Null";
			}
		}]);

		return Null;
	}(BaseBlock);

	var LocalOctetStringValueBlock = function (_LocalHexBlock2) {
		_inherits(LocalOctetStringValueBlock, _LocalHexBlock2);

		function LocalOctetStringValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalOctetStringValueBlock);

			var _this18 = _possibleConstructorReturn(this, (LocalOctetStringValueBlock.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock)).call(this, parameters));

			_this18.isConstructed = getParametersValue(parameters, "isConstructed", false);
			return _this18;
		}

		_createClass(LocalOctetStringValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = 0;

				if (this.isConstructed === true) {
					this.isHexOnly = false;

					resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== OctetString.blockName()) {
							this.error = "OCTET STRING may consists of OCTET STRINGs only";
							return -1;
						}
					}
				} else {
					this.isHexOnly = true;

					resultOffset = _get(LocalOctetStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
					this.blockLength = inputLength;
				}

				return resultOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength);

				if (sizeOnly === true) return retBuf;

				if (this.valueHex.byteLength === 0) return retBuf;

				retBuf = this.valueHex.slice(0);

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalOctetStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "OctetStringValueBlock";
			}
		}]);

		return LocalOctetStringValueBlock;
	}(LocalHexBlock(LocalConstructedValueBlock));

	var OctetString = function (_BaseBlock6) {
		_inherits(OctetString, _BaseBlock6);

		function OctetString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, OctetString);

			var _this19 = _possibleConstructorReturn(this, (OctetString.__proto__ || Object.getPrototypeOf(OctetString)).call(this, parameters, LocalOctetStringValueBlock));

			_this19.idBlock.tagClass = 1;
			_this19.idBlock.tagNumber = 4;return _this19;
		}

		_createClass(OctetString, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				if (inputLength === 0) {
					if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

					if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

					return inputOffset;
				}


				return _get(OctetString.prototype.__proto__ || Object.getPrototypeOf(OctetString.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
			}
		}, {
			key: 'isEqual',
			value: function isEqual(octetString) {
				if (octetString instanceof OctetString === false) return false;

				if (JSON.stringify(this) !== JSON.stringify(octetString)) return false;


				return true;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "OctetString";
			}
		}]);

		return OctetString;
	}(BaseBlock);

	var LocalBitStringValueBlock = function (_LocalHexBlock3) {
		_inherits(LocalBitStringValueBlock, _LocalHexBlock3);

		function LocalBitStringValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBitStringValueBlock);

			var _this20 = _possibleConstructorReturn(this, (LocalBitStringValueBlock.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock)).call(this, parameters));

			_this20.unusedBits = getParametersValue(parameters, "unusedBits", 0);
			_this20.isConstructed = getParametersValue(parameters, "isConstructed", false);
			_this20.blockLength = _this20.valueHex.byteLength;
			return _this20;
		}

		_createClass(LocalBitStringValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;


				var resultOffset = -1;

				if (this.isConstructed === true) {
					resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== BitString.blockName()) {
							this.error = "BIT STRING may consists of BIT STRINGs only";
							return -1;
						}

						if (this.unusedBits > 0 && this.value[i].valueBlock.unusedBits > 0) {
							this.error = "Usign of \"unused bits\" inside constructive BIT STRING allowed for least one only";
							return -1;
						}

						this.unusedBits = this.value[i].valueBlock.unusedBits;
						if (this.unusedBits > 7) {
							this.error = "Unused bits for BitString must be in range 0-7";
							return -1;
						}
					}

					return resultOffset;
				}

				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;


				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.unusedBits = intBuffer[0];

				if (this.unusedBits > 7) {
					this.error = "Unused bits for BitString must be in range 0-7";
					return -1;
				}

				this.valueHex = new ArrayBuffer(intBuffer.length - 1);
				var view = new Uint8Array(this.valueHex);
				for (var _i7 = 0; _i7 < inputLength - 1; _i7++) {
					view[_i7] = intBuffer[_i7 + 1];
				}

				this.blockLength = intBuffer.length;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

				if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength + 1);

				if (this.valueHex.byteLength === 0) return new ArrayBuffer(0);

				var curView = new Uint8Array(this.valueHex);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				var retView = new Uint8Array(retBuf);

				retView[0] = this.unusedBits;

				for (var i = 0; i < this.valueHex.byteLength; i++) {
					retView[i + 1] = curView[i];
				}return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalBitStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.unusedBits = this.unusedBits;
				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BitStringValueBlock";
			}
		}]);

		return LocalBitStringValueBlock;
	}(LocalHexBlock(LocalConstructedValueBlock));

	var BitString = function (_BaseBlock7) {
		_inherits(BitString, _BaseBlock7);

		function BitString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, BitString);

			var _this21 = _possibleConstructorReturn(this, (BitString.__proto__ || Object.getPrototypeOf(BitString)).call(this, parameters, LocalBitStringValueBlock));

			_this21.idBlock.tagClass = 1;
			_this21.idBlock.tagNumber = 3;return _this21;
		}

		_createClass(BitString, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;


				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				return _get(BitString.prototype.__proto__ || Object.getPrototypeOf(BitString.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
			}
		}, {
			key: 'isEqual',
			value: function isEqual(bitString) {
				if (bitString instanceof BitString === false) return false;

				if (JSON.stringify(this) !== JSON.stringify(bitString)) return false;


				return true;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BitString";
			}
		}]);

		return BitString;
	}(BaseBlock);

	var LocalIntegerValueBlock = function (_LocalHexBlock4) {
		_inherits(LocalIntegerValueBlock, _LocalHexBlock4);

		function LocalIntegerValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalIntegerValueBlock);

			var _this22 = _possibleConstructorReturn(this, (LocalIntegerValueBlock.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock)).call(this, parameters));

			if ("value" in parameters) _this22.valueDec = parameters.value;
			return _this22;
		}

		_createClass(LocalIntegerValueBlock, [{
			key: 'fromDER',
			value: function fromDER(inputBuffer, inputOffset, inputLength) {
				var expectedLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

				var offset = this.fromBER(inputBuffer, inputOffset, inputLength);
				if (offset === -1) return offset;

				var view = new Uint8Array(this._valueHex);

				if (view[0] === 0x00 && (view[1] & 0x80) !== 0) {
					var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
					var updatedView = new Uint8Array(updatedValueHex);

					updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

					this._valueHex = updatedValueHex.slice(0);
				} else {
					if (expectedLength !== 0) {
						if (this._valueHex.byteLength < expectedLength) {
							if (expectedLength - this._valueHex.byteLength > 1) expectedLength = this._valueHex.byteLength + 1;

							var _updatedValueHex = new ArrayBuffer(expectedLength);
							var _updatedView = new Uint8Array(_updatedValueHex);

							_updatedView.set(view, expectedLength - this._valueHex.byteLength);

							this._valueHex = _updatedValueHex.slice(0);
						}
					}
				}

				return offset;
			}
		}, {
			key: 'toDER',
			value: function toDER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var view = new Uint8Array(this._valueHex);

				switch (true) {
					case (view[0] & 0x80) !== 0:
						{
							var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength + 1);
							var updatedView = new Uint8Array(updatedValueHex);

							updatedView[0] = 0x00;
							updatedView.set(view, 1);

							this._valueHex = updatedValueHex.slice(0);
						}
						break;
					case view[0] === 0x00 && (view[1] & 0x80) === 0:
						{
							var _updatedValueHex2 = new ArrayBuffer(this._valueHex.byteLength - 1);
							var _updatedView2 = new Uint8Array(_updatedValueHex2);

							_updatedView2.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

							this._valueHex = _updatedValueHex2.slice(0);
						}
						break;
					default:
				}

				return this.toBER(sizeOnly);
			}
		}, {
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = _get(LocalIntegerValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
				if (resultOffset === -1) return resultOffset;

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.valueHex.slice(0);
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalIntegerValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.valueDec = this.valueDec;

				return object;
			}
		}, {
			key: 'toString',
			value: function toString() {
				function viewAdd(first, second) {
					var c = new Uint8Array([0]);

					var firstView = new Uint8Array(first);
					var secondView = new Uint8Array(second);

					var firstViewCopy = firstView.slice(0);
					var firstViewCopyLength = firstViewCopy.length - 1;
					var secondViewCopy = secondView.slice(0);
					var secondViewCopyLength = secondViewCopy.length - 1;

					var value = 0;

					var max = secondViewCopyLength < firstViewCopyLength ? firstViewCopyLength : secondViewCopyLength;

					var counter = 0;


					for (var i = max; i >= 0; i--, counter++) {
						switch (true) {
							case counter < secondViewCopy.length:
								value = firstViewCopy[firstViewCopyLength - counter] + secondViewCopy[secondViewCopyLength - counter] + c[0];
								break;
							default:
								value = firstViewCopy[firstViewCopyLength - counter] + c[0];
						}

						c[0] = value / 10;

						switch (true) {
							case counter >= firstViewCopy.length:
								firstViewCopy = utilConcatView(new Uint8Array([value % 10]), firstViewCopy);
								break;
							default:
								firstViewCopy[firstViewCopyLength - counter] = value % 10;
						}
					}

					if (c[0] > 0) firstViewCopy = utilConcatView(c, firstViewCopy);

					return firstViewCopy.slice(0);
				}

				function power2(n) {
					if (n >= powers2.length) {
						for (var p = powers2.length; p <= n; p++) {
							var c = new Uint8Array([0]);
							var _digits = powers2[p - 1].slice(0);

							for (var i = _digits.length - 1; i >= 0; i--) {
								var newValue = new Uint8Array([(_digits[i] << 1) + c[0]]);
								c[0] = newValue[0] / 10;
								_digits[i] = newValue[0] % 10;
							}

							if (c[0] > 0) _digits = utilConcatView(c, _digits);

							powers2.push(_digits);
						}
					}

					return powers2[n];
				}

				function viewSub(first, second) {
					var b = 0;

					var firstView = new Uint8Array(first);
					var secondView = new Uint8Array(second);

					var firstViewCopy = firstView.slice(0);
					var firstViewCopyLength = firstViewCopy.length - 1;
					var secondViewCopy = secondView.slice(0);
					var secondViewCopyLength = secondViewCopy.length - 1;

					var value = void 0;

					var counter = 0;


					for (var i = secondViewCopyLength; i >= 0; i--, counter++) {
						value = firstViewCopy[firstViewCopyLength - counter] - secondViewCopy[secondViewCopyLength - counter] - b;

						switch (true) {
							case value < 0:
								b = 1;
								firstViewCopy[firstViewCopyLength - counter] = value + 10;
								break;
							default:
								b = 0;
								firstViewCopy[firstViewCopyLength - counter] = value;
						}
					}

					if (b > 0) {
						for (var _i8 = firstViewCopyLength - secondViewCopyLength + 1; _i8 >= 0; _i8--, counter++) {
							value = firstViewCopy[firstViewCopyLength - counter] - b;

							if (value < 0) {
								b = 1;
								firstViewCopy[firstViewCopyLength - counter] = value + 10;
							} else {
								b = 0;
								firstViewCopy[firstViewCopyLength - counter] = value;
								break;
							}
						}
					}

					return firstViewCopy.slice();
				}

				var firstBit = this._valueHex.byteLength * 8 - 1;

				var digits = new Uint8Array(this._valueHex.byteLength * 8 / 3);
				var bitNumber = 0;
				var currentByte = void 0;

				var asn1View = new Uint8Array(this._valueHex);

				var result = "";

				var flag = false;

				for (var byteNumber = this._valueHex.byteLength - 1; byteNumber >= 0; byteNumber--) {
					currentByte = asn1View[byteNumber];

					for (var i = 0; i < 8; i++) {
						if ((currentByte & 1) === 1) {
							switch (bitNumber) {
								case firstBit:
									digits = viewSub(power2(bitNumber), digits);
									result = "-";
									break;
								default:
									digits = viewAdd(digits, power2(bitNumber));
							}
						}

						bitNumber++;
						currentByte >>= 1;
					}
				}

				for (var _i9 = 0; _i9 < digits.length; _i9++) {
					if (digits[_i9]) flag = true;

					if (flag) result += digitsString.charAt(digits[_i9]);
				}

				if (flag === false) result += digitsString.charAt(0);


				return result;
			}
		}, {
			key: 'valueHex',
			set: function set(_value) {
				this._valueHex = _value.slice(0);

				if (_value.byteLength >= 4) {
					this.warnings.push("Too big Integer for decoding, hex only");
					this.isHexOnly = true;
					this._valueDec = 0;
				} else {
					this.isHexOnly = false;

					if (_value.byteLength > 0) this._valueDec = utilDecodeTC.call(this);
				}
			},
			get: function get() {
				return this._valueHex;
			}
		}, {
			key: 'valueDec',
			set: function set(_value) {
				this._valueDec = _value;

				this.isHexOnly = false;
				this._valueHex = utilEncodeTC(_value);
			},
			get: function get() {
				return this._valueDec;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "IntegerValueBlock";
			}
		}]);

		return LocalIntegerValueBlock;
	}(LocalHexBlock(LocalValueBlock));

	var Integer = function (_BaseBlock8) {
		_inherits(Integer, _BaseBlock8);

		function Integer() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Integer);

			var _this23 = _possibleConstructorReturn(this, (Integer.__proto__ || Object.getPrototypeOf(Integer)).call(this, parameters, LocalIntegerValueBlock));

			_this23.idBlock.tagClass = 1;
			_this23.idBlock.tagNumber = 2;return _this23;
		}

		_createClass(Integer, [{
			key: 'isEqual',
			value: function isEqual(otherValue) {
				if (otherValue instanceof Integer) {
					if (this.valueBlock.isHexOnly && otherValue.valueBlock.isHexOnly) return isEqualBuffer(this.valueBlock.valueHex, otherValue.valueBlock.valueHex);

					if (this.valueBlock.isHexOnly === otherValue.valueBlock.isHexOnly) return this.valueBlock.valueDec === otherValue.valueBlock.valueDec;

					return false;
				}

				if (otherValue instanceof ArrayBuffer) return isEqualBuffer(this.valueBlock.valueHex, otherValue);

				return false;
			}
		}, {
			key: 'convertToDER',
			value: function convertToDER() {
				var integer = new Integer({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.toDER();

				return integer;
			}
		}, {
			key: 'convertFromDER',
			value: function convertFromDER() {
				var expectedLength = this.valueBlock.valueHex.byteLength % 2 ? this.valueBlock.valueHex.byteLength + 1 : this.valueBlock.valueHex.byteLength;
				var integer = new Integer({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.fromDER(integer.valueBlock.valueHex, 0, integer.valueBlock.valueHex.byteLength, expectedLength);

				return integer;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Integer";
			}
		}]);

		return Integer;
	}(BaseBlock);

	var Enumerated = function (_Integer) {
		_inherits(Enumerated, _Integer);

		function Enumerated() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Enumerated);

			var _this24 = _possibleConstructorReturn(this, (Enumerated.__proto__ || Object.getPrototypeOf(Enumerated)).call(this, parameters));

			_this24.idBlock.tagClass = 1;
			_this24.idBlock.tagNumber = 10;return _this24;
		}

		_createClass(Enumerated, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Enumerated";
			}
		}]);

		return Enumerated;
	}(Integer);

	var LocalSidValueBlock = function (_LocalHexBlock5) {
		_inherits(LocalSidValueBlock, _LocalHexBlock5);

		function LocalSidValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalSidValueBlock);

			var _this25 = _possibleConstructorReturn(this, (LocalSidValueBlock.__proto__ || Object.getPrototypeOf(LocalSidValueBlock)).call(this, parameters));

			_this25.valueDec = getParametersValue(parameters, "valueDec", -1);
			_this25.isFirstSid = getParametersValue(parameters, "isFirstSid", false);
			return _this25;
		}

		_createClass(LocalSidValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;

				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;


				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.valueHex = new ArrayBuffer(inputLength);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < inputLength; i++) {
					view[i] = intBuffer[i] & 0x7F;

					this.blockLength++;

					if ((intBuffer[i] & 0x80) === 0x00) break;
				}

				var tempValueHex = new ArrayBuffer(this.blockLength);
				var tempView = new Uint8Array(tempValueHex);

				for (var _i10 = 0; _i10 < this.blockLength; _i10++) {
					tempView[_i10] = view[_i10];
				}
				this.valueHex = tempValueHex.slice(0);
				view = new Uint8Array(this.valueHex);


				if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				if (view[0] === 0x00) this.warnings.push("Needlessly long format of SID encoding");

				if (this.blockLength <= 8) this.valueDec = utilFromBase(view, 7);else {
					this.isHexOnly = true;
					this.warnings.push("Too big SID for decoding, hex only");
				}

				return inputOffset + this.blockLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = void 0;
				var retView = void 0;


				if (this.isHexOnly) {
					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					var curView = new Uint8Array(this.valueHex);

					retBuf = new ArrayBuffer(this.blockLength);
					retView = new Uint8Array(retBuf);

					for (var i = 0; i < this.blockLength - 1; i++) {
						retView[i] = curView[i] | 0x80;
					}retView[this.blockLength - 1] = curView[this.blockLength - 1];

					return retBuf;
				}

				var encodedBuf = utilToBase(this.valueDec, 7);
				if (encodedBuf.byteLength === 0) {
					this.error = "Error during encoding SID value";
					return new ArrayBuffer(0);
				}

				retBuf = new ArrayBuffer(encodedBuf.byteLength);

				if (sizeOnly === false) {
					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					for (var _i11 = 0; _i11 < encodedBuf.byteLength - 1; _i11++) {
						retView[_i11] = encodedView[_i11] | 0x80;
					}retView[encodedBuf.byteLength - 1] = encodedView[encodedBuf.byteLength - 1];
				}

				return retBuf;
			}
		}, {
			key: 'toString',
			value: function toString() {
				var result = "";

				if (this.isHexOnly === true) result = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);else {
					if (this.isFirstSid) {
						var sidValue = this.valueDec;

						if (this.valueDec <= 39) result = "0.";else {
							if (this.valueDec <= 79) {
								result = "1.";
								sidValue -= 40;
							} else {
								result = "2.";
								sidValue -= 80;
							}
						}

						result += sidValue.toString();
					} else result = this.valueDec.toString();
				}

				return result;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalSidValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalSidValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.valueDec = this.valueDec;
				object.isFirstSid = this.isFirstSid;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "sidBlock";
			}
		}]);

		return LocalSidValueBlock;
	}(LocalHexBlock(LocalBaseBlock));

	var LocalObjectIdentifierValueBlock = function (_LocalValueBlock5) {
		_inherits(LocalObjectIdentifierValueBlock, _LocalValueBlock5);

		function LocalObjectIdentifierValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalObjectIdentifierValueBlock);

			var _this26 = _possibleConstructorReturn(this, (LocalObjectIdentifierValueBlock.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock)).call(this, parameters));

			_this26.fromString(getParametersValue(parameters, "value", ""));
			return _this26;
		}

		_createClass(LocalObjectIdentifierValueBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = inputOffset;

				while (inputLength > 0) {
					var sidBlock = new LocalSidValueBlock();
					resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
					if (resultOffset === -1) {
						this.blockLength = 0;
						this.error = sidBlock.error;
						return resultOffset;
					}

					if (this.value.length === 0) sidBlock.isFirstSid = true;

					this.blockLength += sidBlock.blockLength;
					inputLength -= sidBlock.blockLength;

					this.value.push(sidBlock);
				}

				return resultOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					if (valueBuf.byteLength === 0) {
						this.error = this.value[i].error;
						return new ArrayBuffer(0);
					}

					retBuf = utilConcatBuf(retBuf, valueBuf);
				}

				return retBuf;
			}
		}, {
			key: 'fromString',
			value: function fromString(string) {
				this.value = [];

				var pos1 = 0;
				var pos2 = 0;

				var sid = "";

				var flag = false;

				do {
					pos2 = string.indexOf(".", pos1);
					if (pos2 === -1) sid = string.substr(pos1);else sid = string.substr(pos1, pos2 - pos1);

					pos1 = pos2 + 1;

					if (flag) {
						var sidBlock = this.value[0];

						var plus = 0;

						switch (sidBlock.valueDec) {
							case 0:
								break;
							case 1:
								plus = 40;
								break;
							case 2:
								plus = 80;
								break;
							default:
								this.value = [];
								return false;}

						var parsedSID = parseInt(sid, 10);
						if (isNaN(parsedSID)) return true;

						sidBlock.valueDec = parsedSID + plus;

						flag = false;
					} else {
						var _sidBlock = new LocalSidValueBlock();
						_sidBlock.valueDec = parseInt(sid, 10);
						if (isNaN(_sidBlock.valueDec)) return true;

						if (this.value.length === 0) {
							_sidBlock.isFirstSid = true;
							flag = true;
						}

						this.value.push(_sidBlock);
					}
				} while (pos2 !== -1);

				return true;
			}
		}, {
			key: 'toString',
			value: function toString() {
				var result = "";
				var isHexOnly = false;

				for (var i = 0; i < this.value.length; i++) {
					isHexOnly = this.value[i].isHexOnly;

					var sidStr = this.value[i].toString();

					if (i !== 0) result = result + '.';

					if (isHexOnly) {
						sidStr = '{' + sidStr + '}';

						if (this.value[i].isFirstSid) result = '2.{' + sidStr + ' - 80}';else result += sidStr;
					} else result += sidStr;
				}

				return result;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalObjectIdentifierValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.toString();
				object.sidArray = [];
				for (var i = 0; i < this.value.length; i++) {
					object.sidArray.push(this.value[i].toJSON());
				}return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "ObjectIdentifierValueBlock";
			}
		}]);

		return LocalObjectIdentifierValueBlock;
	}(LocalValueBlock);

	var ObjectIdentifier = function (_BaseBlock9) {
		_inherits(ObjectIdentifier, _BaseBlock9);

		function ObjectIdentifier() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, ObjectIdentifier);

			var _this27 = _possibleConstructorReturn(this, (ObjectIdentifier.__proto__ || Object.getPrototypeOf(ObjectIdentifier)).call(this, parameters, LocalObjectIdentifierValueBlock));

			_this27.idBlock.tagClass = 1;
			_this27.idBlock.tagNumber = 6;return _this27;
		}

		_createClass(ObjectIdentifier, null, [{
			key: 'blockName',
			value: function blockName() {
				return "ObjectIdentifier";
			}
		}]);

		return ObjectIdentifier;
	}(BaseBlock);

	var LocalUtf8StringValueBlock = function (_LocalHexBlock6) {
		_inherits(LocalUtf8StringValueBlock, _LocalHexBlock6);

		function LocalUtf8StringValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalUtf8StringValueBlock);

			var _this28 = _possibleConstructorReturn(this, (LocalUtf8StringValueBlock.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock)).call(this, parameters));

			_this28.isHexOnly = true;
			_this28.value = "";return _this28;
		}

		_createClass(LocalUtf8StringValueBlock, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalUtf8StringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Utf8StringValueBlock";
			}
		}]);

		return LocalUtf8StringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));

	var Utf8String = function (_BaseBlock10) {
		_inherits(Utf8String, _BaseBlock10);

		function Utf8String() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Utf8String);

			var _this29 = _possibleConstructorReturn(this, (Utf8String.__proto__ || Object.getPrototypeOf(Utf8String)).call(this, parameters, LocalUtf8StringValueBlock));

			if ("value" in parameters) _this29.fromString(parameters.value);

			_this29.idBlock.tagClass = 1;
			_this29.idBlock.tagNumber = 12;return _this29;
		}

		_createClass(Utf8String, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));

				try {
					this.valueBlock.value = decodeURIComponent(escape(this.valueBlock.value));
				} catch (ex) {
					this.warnings.push('Error during "decodeURIComponent": ' + ex + ', using raw string');
				}
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var str = unescape(encodeURIComponent(inputString));
				var strLen = str.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = str.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Utf8String";
			}
		}]);

		return Utf8String;
	}(BaseBlock);

	var LocalBmpStringValueBlock = function (_LocalHexBlock7) {
		_inherits(LocalBmpStringValueBlock, _LocalHexBlock7);

		function LocalBmpStringValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBmpStringValueBlock);

			var _this30 = _possibleConstructorReturn(this, (LocalBmpStringValueBlock.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock)).call(this, parameters));

			_this30.isHexOnly = true;
			_this30.value = "";
			return _this30;
		}

		_createClass(LocalBmpStringValueBlock, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalBmpStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BmpStringValueBlock";
			}
		}]);

		return LocalBmpStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));

	var BmpString = function (_BaseBlock11) {
		_inherits(BmpString, _BaseBlock11);

		function BmpString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, BmpString);

			var _this31 = _possibleConstructorReturn(this, (BmpString.__proto__ || Object.getPrototypeOf(BmpString)).call(this, parameters, LocalBmpStringValueBlock));

			if ("value" in parameters) _this31.fromString(parameters.value);

			_this31.idBlock.tagClass = 1;
			_this31.idBlock.tagNumber = 30;return _this31;
		}

		_createClass(BmpString, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i += 2) {
					var temp = valueView[i];

					valueView[i] = valueView[i + 1];
					valueView[i + 1] = temp;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint16Array(copyBuffer));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 2);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 2) continue;

					var dif = 2 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 2 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BmpString";
			}
		}]);

		return BmpString;
	}(BaseBlock);

	var LocalUniversalStringValueBlock = function (_LocalHexBlock8) {
		_inherits(LocalUniversalStringValueBlock, _LocalHexBlock8);

		function LocalUniversalStringValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalUniversalStringValueBlock);

			var _this32 = _possibleConstructorReturn(this, (LocalUniversalStringValueBlock.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock)).call(this, parameters));

			_this32.isHexOnly = true;
			_this32.value = "";
			return _this32;
		}

		_createClass(LocalUniversalStringValueBlock, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalUniversalStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "UniversalStringValueBlock";
			}
		}]);

		return LocalUniversalStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));

	var UniversalString = function (_BaseBlock12) {
		_inherits(UniversalString, _BaseBlock12);

		function UniversalString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, UniversalString);

			var _this33 = _possibleConstructorReturn(this, (UniversalString.__proto__ || Object.getPrototypeOf(UniversalString)).call(this, parameters, LocalUniversalStringValueBlock));

			if ("value" in parameters) _this33.fromString(parameters.value);

			_this33.idBlock.tagClass = 1;
			_this33.idBlock.tagNumber = 28;return _this33;
		}

		_createClass(UniversalString, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i += 4) {
					valueView[i] = valueView[i + 3];
					valueView[i + 1] = valueView[i + 2];
					valueView[i + 2] = 0x00;
					valueView[i + 3] = 0x00;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint32Array(copyBuffer));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 4);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 4) continue;

					var dif = 4 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 4 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "UniversalString";
			}
		}]);

		return UniversalString;
	}(BaseBlock);

	var LocalSimpleStringValueBlock = function (_LocalHexBlock9) {
		_inherits(LocalSimpleStringValueBlock, _LocalHexBlock9);

		function LocalSimpleStringValueBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalSimpleStringValueBlock);

			var _this34 = _possibleConstructorReturn(this, (LocalSimpleStringValueBlock.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock)).call(this, parameters));

			_this34.value = "";
			_this34.isHexOnly = true;
			return _this34;
		}

		_createClass(LocalSimpleStringValueBlock, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalSimpleStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "SimpleStringValueBlock";
			}
		}]);

		return LocalSimpleStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));

	var LocalSimpleStringBlock = function (_BaseBlock13) {
		_inherits(LocalSimpleStringBlock, _BaseBlock13);

		function LocalSimpleStringBlock() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalSimpleStringBlock);

			var _this35 = _possibleConstructorReturn(this, (LocalSimpleStringBlock.__proto__ || Object.getPrototypeOf(LocalSimpleStringBlock)).call(this, parameters, LocalSimpleStringValueBlock));

			if ("value" in parameters) _this35.fromString(parameters.value);
			return _this35;
		}

		_createClass(LocalSimpleStringBlock, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var strLen = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = inputString.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "SIMPLESTRING";
			}
		}]);

		return LocalSimpleStringBlock;
	}(BaseBlock);

	var NumericString = function (_LocalSimpleStringBlo) {
		_inherits(NumericString, _LocalSimpleStringBlo);

		function NumericString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, NumericString);

			var _this36 = _possibleConstructorReturn(this, (NumericString.__proto__ || Object.getPrototypeOf(NumericString)).call(this, parameters));

			_this36.idBlock.tagClass = 1;
			_this36.idBlock.tagNumber = 18;return _this36;
		}

		_createClass(NumericString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "NumericString";
			}
		}]);

		return NumericString;
	}(LocalSimpleStringBlock);

	var PrintableString = function (_LocalSimpleStringBlo2) {
		_inherits(PrintableString, _LocalSimpleStringBlo2);

		function PrintableString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PrintableString);

			var _this37 = _possibleConstructorReturn(this, (PrintableString.__proto__ || Object.getPrototypeOf(PrintableString)).call(this, parameters));

			_this37.idBlock.tagClass = 1;
			_this37.idBlock.tagNumber = 19;return _this37;
		}

		_createClass(PrintableString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "PrintableString";
			}
		}]);

		return PrintableString;
	}(LocalSimpleStringBlock);

	var TeletexString = function (_LocalSimpleStringBlo3) {
		_inherits(TeletexString, _LocalSimpleStringBlo3);

		function TeletexString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, TeletexString);

			var _this38 = _possibleConstructorReturn(this, (TeletexString.__proto__ || Object.getPrototypeOf(TeletexString)).call(this, parameters));

			_this38.idBlock.tagClass = 1;
			_this38.idBlock.tagNumber = 20;return _this38;
		}

		_createClass(TeletexString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "TeletexString";
			}
		}]);

		return TeletexString;
	}(LocalSimpleStringBlock);

	var VideotexString = function (_LocalSimpleStringBlo4) {
		_inherits(VideotexString, _LocalSimpleStringBlo4);

		function VideotexString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, VideotexString);

			var _this39 = _possibleConstructorReturn(this, (VideotexString.__proto__ || Object.getPrototypeOf(VideotexString)).call(this, parameters));

			_this39.idBlock.tagClass = 1;
			_this39.idBlock.tagNumber = 21;return _this39;
		}

		_createClass(VideotexString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "VideotexString";
			}
		}]);

		return VideotexString;
	}(LocalSimpleStringBlock);

	var IA5String = function (_LocalSimpleStringBlo5) {
		_inherits(IA5String, _LocalSimpleStringBlo5);

		function IA5String() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, IA5String);

			var _this40 = _possibleConstructorReturn(this, (IA5String.__proto__ || Object.getPrototypeOf(IA5String)).call(this, parameters));

			_this40.idBlock.tagClass = 1;
			_this40.idBlock.tagNumber = 22;return _this40;
		}

		_createClass(IA5String, null, [{
			key: 'blockName',
			value: function blockName() {
				return "IA5String";
			}
		}]);

		return IA5String;
	}(LocalSimpleStringBlock);

	var GraphicString = function (_LocalSimpleStringBlo6) {
		_inherits(GraphicString, _LocalSimpleStringBlo6);

		function GraphicString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GraphicString);

			var _this41 = _possibleConstructorReturn(this, (GraphicString.__proto__ || Object.getPrototypeOf(GraphicString)).call(this, parameters));

			_this41.idBlock.tagClass = 1;
			_this41.idBlock.tagNumber = 25;return _this41;
		}

		_createClass(GraphicString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "GraphicString";
			}
		}]);

		return GraphicString;
	}(LocalSimpleStringBlock);

	var VisibleString = function (_LocalSimpleStringBlo7) {
		_inherits(VisibleString, _LocalSimpleStringBlo7);

		function VisibleString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, VisibleString);

			var _this42 = _possibleConstructorReturn(this, (VisibleString.__proto__ || Object.getPrototypeOf(VisibleString)).call(this, parameters));

			_this42.idBlock.tagClass = 1;
			_this42.idBlock.tagNumber = 26;return _this42;
		}

		_createClass(VisibleString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "VisibleString";
			}
		}]);

		return VisibleString;
	}(LocalSimpleStringBlock);

	var GeneralString = function (_LocalSimpleStringBlo8) {
		_inherits(GeneralString, _LocalSimpleStringBlo8);

		function GeneralString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralString);

			var _this43 = _possibleConstructorReturn(this, (GeneralString.__proto__ || Object.getPrototypeOf(GeneralString)).call(this, parameters));

			_this43.idBlock.tagClass = 1;
			_this43.idBlock.tagNumber = 27;return _this43;
		}

		_createClass(GeneralString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "GeneralString";
			}
		}]);

		return GeneralString;
	}(LocalSimpleStringBlock);

	var CharacterString = function (_LocalSimpleStringBlo9) {
		_inherits(CharacterString, _LocalSimpleStringBlo9);

		function CharacterString() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, CharacterString);

			var _this44 = _possibleConstructorReturn(this, (CharacterString.__proto__ || Object.getPrototypeOf(CharacterString)).call(this, parameters));

			_this44.idBlock.tagClass = 1;
			_this44.idBlock.tagNumber = 29;return _this44;
		}

		_createClass(CharacterString, null, [{
			key: 'blockName',
			value: function blockName() {
				return "CharacterString";
			}
		}]);

		return CharacterString;
	}(LocalSimpleStringBlock);

	var UTCTime = function (_VisibleString) {
		_inherits(UTCTime, _VisibleString);

		function UTCTime() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, UTCTime);

			var _this45 = _possibleConstructorReturn(this, (UTCTime.__proto__ || Object.getPrototypeOf(UTCTime)).call(this, parameters));

			_this45.year = 0;
			_this45.month = 0;
			_this45.day = 0;
			_this45.hour = 0;
			_this45.minute = 0;
			_this45.second = 0;

			if ("value" in parameters) {
				_this45.fromString(parameters.value);

				_this45.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this45.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}

			if ("valueDate" in parameters) {
				_this45.fromDate(parameters.valueDate);
				_this45.valueBlock.valueHex = _this45.toBuffer();
			}


			_this45.idBlock.tagClass = 1;
			_this45.idBlock.tagNumber = 23;return _this45;
		}

		_createClass(UTCTime, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
		}, {
			key: 'toBuffer',
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
		}, {
			key: 'fromDate',
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
			}
		}, {
			key: 'toDate',
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
				var parserArray = parser.exec(inputString);
				if (parserArray === null) {
					this.error = "Wrong input string for convertion";
					return;
				}

				var year = parseInt(parserArray[1], 10);
				if (year >= 50) this.year = 1900 + year;else this.year = 2000 + year;

				this.month = parseInt(parserArray[2], 10);
				this.day = parseInt(parserArray[3], 10);
				this.hour = parseInt(parserArray[4], 10);
				this.minute = parseInt(parserArray[5], 10);
				this.second = parseInt(parserArray[6], 10);
			}
		}, {
			key: 'toString',
			value: function toString() {
				var outputArray = new Array(7);

				outputArray[0] = padNumber(this.year < 2000 ? this.year - 1900 : this.year - 2000, 2);
				outputArray[1] = padNumber(this.month, 2);
				outputArray[2] = padNumber(this.day, 2);
				outputArray[3] = padNumber(this.hour, 2);
				outputArray[4] = padNumber(this.minute, 2);
				outputArray[5] = padNumber(this.second, 2);
				outputArray[6] = "Z";

				return outputArray.join("");
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(UTCTime.prototype.__proto__ || Object.getPrototypeOf(UTCTime.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "UTCTime";
			}
		}]);

		return UTCTime;
	}(VisibleString);

	var GeneralizedTime = function (_VisibleString2) {
		_inherits(GeneralizedTime, _VisibleString2);

		function GeneralizedTime() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralizedTime);

			var _this46 = _possibleConstructorReturn(this, (GeneralizedTime.__proto__ || Object.getPrototypeOf(GeneralizedTime)).call(this, parameters));

			_this46.year = 0;
			_this46.month = 0;
			_this46.day = 0;
			_this46.hour = 0;
			_this46.minute = 0;
			_this46.second = 0;
			_this46.millisecond = 0;

			if ("value" in parameters) {
				_this46.fromString(parameters.value);

				_this46.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this46.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}

			if ("valueDate" in parameters) {
				_this46.fromDate(parameters.valueDate);
				_this46.valueBlock.valueHex = _this46.toBuffer();
			}


			_this46.idBlock.tagClass = 1;
			_this46.idBlock.tagNumber = 24;return _this46;
		}

		_createClass(GeneralizedTime, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
		}, {
			key: 'toBuffer',
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
		}, {
			key: 'fromDate',
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
				this.millisecond = inputDate.getUTCMilliseconds();
			}
		}, {
			key: 'toDate',
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var isUTC = false;

				var timeString = "";
				var dateTimeString = "";
				var fractionPart = 0;

				var parser = void 0;

				var hourDifference = 0;
				var minuteDifference = 0;

				if (inputString[inputString.length - 1] === "Z") {
					timeString = inputString.substr(0, inputString.length - 1);

					isUTC = true;
				} else {
						var number = new Number(inputString[inputString.length - 1]);

						if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");

						timeString = inputString;
					}

				if (isUTC) {
					if (timeString.indexOf("+") !== -1) throw new Error("Wrong input string for convertion");

					if (timeString.indexOf("-") !== -1) throw new Error("Wrong input string for convertion");
				} else {
						var multiplier = 1;
						var differencePosition = timeString.indexOf("+");
						var differenceString = "";

						if (differencePosition === -1) {
							differencePosition = timeString.indexOf("-");
							multiplier = -1;
						}

						if (differencePosition !== -1) {
							differenceString = timeString.substr(differencePosition + 1);
							timeString = timeString.substr(0, differencePosition);

							if (differenceString.length !== 2 && differenceString.length !== 4) throw new Error("Wrong input string for convertion");

							var _number = new Number(differenceString.substr(0, 2));

							if (isNaN(_number.valueOf())) throw new Error("Wrong input string for convertion");

							hourDifference = multiplier * _number;

							if (differenceString.length === 4) {
								_number = new Number(differenceString.substr(2, 2));

								if (isNaN(_number.valueOf())) throw new Error("Wrong input string for convertion");

								minuteDifference = multiplier * _number;
							}
						}
					}

				var fractionPointPosition = timeString.indexOf(".");
				if (fractionPointPosition === -1) fractionPointPosition = timeString.indexOf(",");
				if (fractionPointPosition !== -1) {
					var fractionPartCheck = new Number('0' + timeString.substr(fractionPointPosition));

					if (isNaN(fractionPartCheck.valueOf())) throw new Error("Wrong input string for convertion");

					fractionPart = fractionPartCheck.valueOf();

					dateTimeString = timeString.substr(0, fractionPointPosition);
				} else dateTimeString = timeString;

				switch (true) {
					case dateTimeString.length === 8:
						parser = /(\d{4})(\d{2})(\d{2})/ig;
						if (fractionPointPosition !== -1) throw new Error("Wrong input string for convertion");
						break;
					case dateTimeString.length === 10:
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var fractionResult = 60 * fractionPart;
							this.minute = Math.floor(fractionResult);

							fractionResult = 60 * (fractionResult - this.minute);
							this.second = Math.floor(fractionResult);

							fractionResult = 1000 * (fractionResult - this.second);
							this.millisecond = Math.floor(fractionResult);
						}
						break;
					case dateTimeString.length === 12:
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult = 60 * fractionPart;
							this.second = Math.floor(_fractionResult);

							_fractionResult = 1000 * (_fractionResult - this.second);
							this.millisecond = Math.floor(_fractionResult);
						}
						break;
					case dateTimeString.length === 14:
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult2 = 1000 * fractionPart;
							this.millisecond = Math.floor(_fractionResult2);
						}
						break;
					default:
						throw new Error("Wrong input string for convertion");
				}

				var parserArray = parser.exec(dateTimeString);
				if (parserArray === null) throw new Error("Wrong input string for convertion");

				for (var j = 1; j < parserArray.length; j++) {
					switch (j) {
						case 1:
							this.year = parseInt(parserArray[j], 10);
							break;
						case 2:
							this.month = parseInt(parserArray[j], 10);
							break;
						case 3:
							this.day = parseInt(parserArray[j], 10);
							break;
						case 4:
							this.hour = parseInt(parserArray[j], 10) + hourDifference;
							break;
						case 5:
							this.minute = parseInt(parserArray[j], 10) + minuteDifference;
							break;
						case 6:
							this.second = parseInt(parserArray[j], 10);
							break;
						default:
							throw new Error("Wrong input string for convertion");
					}
				}

				if (isUTC === false) {
					var tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);

					this.year = tempDate.getUTCFullYear();
					this.month = tempDate.getUTCMonth();
					this.day = tempDate.getUTCDay();
					this.hour = tempDate.getUTCHours();
					this.minute = tempDate.getUTCMinutes();
					this.second = tempDate.getUTCSeconds();
					this.millisecond = tempDate.getUTCMilliseconds();
				}
			}
		}, {
			key: 'toString',
			value: function toString() {
				var outputArray = [];

				outputArray.push(padNumber(this.year, 4));
				outputArray.push(padNumber(this.month, 2));
				outputArray.push(padNumber(this.day, 2));
				outputArray.push(padNumber(this.hour, 2));
				outputArray.push(padNumber(this.minute, 2));
				outputArray.push(padNumber(this.second, 2));
				if (this.millisecond !== 0) {
					outputArray.push(".");
					outputArray.push(padNumber(this.millisecond, 3));
				}
				outputArray.push("Z");

				return outputArray.join("");
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(GeneralizedTime.prototype.__proto__ || Object.getPrototypeOf(GeneralizedTime.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;
				object.millisecond = this.millisecond;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "GeneralizedTime";
			}
		}]);

		return GeneralizedTime;
	}(VisibleString);

	var DATE = function (_Utf8String) {
		_inherits(DATE, _Utf8String);

		function DATE() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, DATE);

			var _this47 = _possibleConstructorReturn(this, (DATE.__proto__ || Object.getPrototypeOf(DATE)).call(this, parameters));

			_this47.idBlock.tagClass = 1;
			_this47.idBlock.tagNumber = 31;return _this47;
		}

		_createClass(DATE, null, [{
			key: 'blockName',
			value: function blockName() {
				return "DATE";
			}
		}]);

		return DATE;
	}(Utf8String);

	var TimeOfDay = function (_Utf8String2) {
		_inherits(TimeOfDay, _Utf8String2);

		function TimeOfDay() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, TimeOfDay);

			var _this48 = _possibleConstructorReturn(this, (TimeOfDay.__proto__ || Object.getPrototypeOf(TimeOfDay)).call(this, parameters));

			_this48.idBlock.tagClass = 1;
			_this48.idBlock.tagNumber = 32;return _this48;
		}

		_createClass(TimeOfDay, null, [{
			key: 'blockName',
			value: function blockName() {
				return "TimeOfDay";
			}
		}]);

		return TimeOfDay;
	}(Utf8String);

	var DateTime = function (_Utf8String3) {
		_inherits(DateTime, _Utf8String3);

		function DateTime() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, DateTime);

			var _this49 = _possibleConstructorReturn(this, (DateTime.__proto__ || Object.getPrototypeOf(DateTime)).call(this, parameters));

			_this49.idBlock.tagClass = 1;
			_this49.idBlock.tagNumber = 33;return _this49;
		}

		_createClass(DateTime, null, [{
			key: 'blockName',
			value: function blockName() {
				return "DateTime";
			}
		}]);

		return DateTime;
	}(Utf8String);

	var Duration = function (_Utf8String4) {
		_inherits(Duration, _Utf8String4);

		function Duration() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Duration);

			var _this50 = _possibleConstructorReturn(this, (Duration.__proto__ || Object.getPrototypeOf(Duration)).call(this, parameters));

			_this50.idBlock.tagClass = 1;
			_this50.idBlock.tagNumber = 34;return _this50;
		}

		_createClass(Duration, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Duration";
			}
		}]);

		return Duration;
	}(Utf8String);

	var TIME = function (_Utf8String5) {
		_inherits(TIME, _Utf8String5);

		function TIME() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, TIME);

			var _this51 = _possibleConstructorReturn(this, (TIME.__proto__ || Object.getPrototypeOf(TIME)).call(this, parameters));

			_this51.idBlock.tagClass = 1;
			_this51.idBlock.tagNumber = 14;return _this51;
		}

		_createClass(TIME, null, [{
			key: 'blockName',
			value: function blockName() {
				return "TIME";
			}
		}]);

		return TIME;
	}(Utf8String);

	var Choice = function Choice() {
		var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Choice);

		this.value = getParametersValue(parameters, "value", []);
		this.optional = getParametersValue(parameters, "optional", false);
	};

	var Any = function Any() {
		var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Any);

		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
	};

	var Repeated = function Repeated() {
		var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Repeated);

		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
		this.value = getParametersValue(parameters, "value", new Any());
		this.local = getParametersValue(parameters, "local", false);
	};

	var RawData = function () {
		function RawData() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, RawData);

			this.data = getParametersValue(parameters, "data", new ArrayBuffer(0));
		}

		_createClass(RawData, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.data = inputBuffer.slice(inputOffset, inputLength);
				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.data;
			}
		}]);

		return RawData;
	}();

	function LocalFromBER(inputBuffer, inputOffset, inputLength) {
		var incomingOffset = inputOffset;
		function localChangeType(inputObject, newType) {
			if (inputObject instanceof newType) return inputObject;

			var newObject = new newType();
			newObject.idBlock = inputObject.idBlock;
			newObject.lenBlock = inputObject.lenBlock;
			newObject.warnings = inputObject.warnings;

			newObject.valueBeforeDecode = inputObject.valueBeforeDecode.slice(0);

			return newObject;
		}

		var returnObject = new BaseBlock({}, Object);

		if (checkBufferParams(new LocalBaseBlock(), inputBuffer, inputOffset, inputLength) === false) {
			returnObject.error = "Wrong input parameters";
			return {
				offset: -1,
				result: returnObject
			};
		}

		var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

		if (intBuffer.length === 0) {
			this.error = "Zero buffer length";
			return {
				offset: -1,
				result: returnObject
			};
		}

		var resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.idBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.idBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.idBlock.blockLength;

		resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.lenBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.lenBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.lenBlock.blockLength;

		if (returnObject.idBlock.isConstructed === false && returnObject.lenBlock.isIndefiniteForm === true) {
			returnObject.error = "Indefinite length form used for primitive encoding form";
			return {
				offset: -1,
				result: returnObject
			};
		}

		var newASN1Type = BaseBlock;

		switch (returnObject.idBlock.tagClass) {
			case 1:
				if (returnObject.idBlock.tagNumber >= 37 && returnObject.idBlock.isHexOnly === false) {
					returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
					return {
						offset: -1,
						result: returnObject
					};
				}


				switch (returnObject.idBlock.tagNumber) {
					case 0:
						if (returnObject.idBlock.isConstructed === true && returnObject.lenBlock.length > 0) {
							returnObject.error = "Type [UNIVERSAL 0] is reserved";
							return {
								offset: -1,
								result: returnObject
							};
						}


						newASN1Type = EndOfContent;

						break;

					case 1:
						newASN1Type = Boolean;
						break;

					case 2:
						newASN1Type = Integer;
						break;

					case 3:
						newASN1Type = BitString;
						break;

					case 4:
						newASN1Type = OctetString;
						break;

					case 5:
						newASN1Type = Null;
						break;

					case 6:
						newASN1Type = ObjectIdentifier;
						break;

					case 10:
						newASN1Type = Enumerated;
						break;

					case 12:
						newASN1Type = Utf8String;
						break;

					case 14:
						newASN1Type = TIME;
						break;

					case 15:
						returnObject.error = "[UNIVERSAL 15] is reserved by ASN.1 standard";
						return {
							offset: -1,
							result: returnObject
						};

					case 16:
						newASN1Type = Sequence;
						break;

					case 17:
						newASN1Type = Set;
						break;

					case 18:
						newASN1Type = NumericString;
						break;

					case 19:
						newASN1Type = PrintableString;
						break;

					case 20:
						newASN1Type = TeletexString;
						break;

					case 21:
						newASN1Type = VideotexString;
						break;

					case 22:
						newASN1Type = IA5String;
						break;

					case 23:
						newASN1Type = UTCTime;
						break;

					case 24:
						newASN1Type = GeneralizedTime;
						break;

					case 25:
						newASN1Type = GraphicString;
						break;

					case 26:
						newASN1Type = VisibleString;
						break;

					case 27:
						newASN1Type = GeneralString;
						break;

					case 28:
						newASN1Type = UniversalString;
						break;

					case 29:
						newASN1Type = CharacterString;
						break;

					case 30:
						newASN1Type = BmpString;
						break;

					case 31:
						newASN1Type = DATE;
						break;

					case 32:
						newASN1Type = TimeOfDay;
						break;

					case 33:
						newASN1Type = DateTime;
						break;

					case 34:
						newASN1Type = Duration;
						break;

					default:
						{
							var newObject = void 0;

							if (returnObject.idBlock.isConstructed === true) newObject = new Constructed();else newObject = new Primitive();

							newObject.idBlock = returnObject.idBlock;
							newObject.lenBlock = returnObject.lenBlock;
							newObject.warnings = returnObject.warnings;

							returnObject = newObject;

							resultOffset = returnObject.fromBER(inputBuffer, inputOffset, inputLength);
						}
				}
				break;

			case 2:
			case 3:
			case 4:
			default:
				{
					if (returnObject.idBlock.isConstructed === true) newASN1Type = Constructed;else newASN1Type = Primitive;
				}
		}

		returnObject = localChangeType(returnObject, newASN1Type);
		resultOffset = returnObject.fromBER(inputBuffer, inputOffset, returnObject.lenBlock.isIndefiniteForm === true ? inputLength : returnObject.lenBlock.length);

		returnObject.valueBeforeDecode = inputBuffer.slice(incomingOffset, incomingOffset + returnObject.blockLength);


		return {
			offset: resultOffset,
			result: returnObject
		};
	}

	function fromBER(inputBuffer) {
		if (inputBuffer.byteLength === 0) {
			var result = new BaseBlock({}, Object);
			result.error = "Input buffer has zero length";

			return {
				offset: -1,
				result: result
			};
		}

		return LocalFromBER(inputBuffer, 0, inputBuffer.byteLength);
	}

	function compareSchema(root, inputData, inputSchema) {
		if (inputSchema instanceof Choice) {

			for (var j = 0; j < inputSchema.value.length; j++) {
				var result = compareSchema(root, inputData, inputSchema.value[j]);
				if (result.verified === true) {
					return {
						verified: true,
						result: root
					};
				}
			}

			{
				var _result = {
					verified: false,
					result: {
						error: "Wrong values for Choice type"
					}
				};

				if (inputSchema.hasOwnProperty("name")) _result.name = inputSchema.name;

				return _result;
			}
		}

		if (inputSchema instanceof Any) {
			if (inputSchema.hasOwnProperty("name")) root[inputSchema.name] = inputData;


			return {
				verified: true,
				result: root
			};
		}

		if (root instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong root object" }
			};
		}

		if (inputData instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 data" }
			};
		}

		if (inputSchema instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("idBlock" in inputSchema === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("fromBER" in inputSchema.idBlock === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("toBER" in inputSchema.idBlock === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		var encodedId = inputSchema.idBlock.toBER(false);
		if (encodedId.byteLength === 0) {
			return {
				verified: false,
				result: { error: "Error encoding idBlock for ASN.1 schema" }
			};
		}

		var decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);
		if (decodedOffset === -1) {
			return {
				verified: false,
				result: { error: "Error decoding idBlock for ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.hasOwnProperty("tagClass") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass) {
			return {
				verified: false,
				result: root
			};
		}

		if (inputSchema.idBlock.hasOwnProperty("tagNumber") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber) {
			return {
				verified: false,
				result: root
			};
		}

		if (inputSchema.idBlock.hasOwnProperty("isConstructed") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed) {
			return {
				verified: false,
				result: root
			};
		}

		if ("isHexOnly" in inputSchema.idBlock === false) {
				return {
					verified: false,
					result: { error: "Wrong ASN.1 schema" }
				};
			}

		if (inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly) {
			return {
				verified: false,
				result: root
			};
		}

		if (inputSchema.idBlock.isHexOnly === true) {
			if ("valueHex" in inputSchema.idBlock === false) {
					return {
						verified: false,
						result: { error: "Wrong ASN.1 schema" }
					};
				}

			var schemaView = new Uint8Array(inputSchema.idBlock.valueHex);
			var asn1View = new Uint8Array(inputData.idBlock.valueHex);

			if (schemaView.length !== asn1View.length) {
				return {
					verified: false,
					result: root
				};
			}

			for (var i = 0; i < schemaView.length; i++) {
				if (schemaView[i] !== asn1View[1]) {
					return {
						verified: false,
						result: root
					};
				}
			}
		}

		if (inputSchema.hasOwnProperty("name")) {
			inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
			if (inputSchema.name !== "") root[inputSchema.name] = inputData;
		}

		if (inputSchema.idBlock.isConstructed === true) {
			var admission = 0;
			var _result2 = { verified: false };

			var maxLength = inputSchema.valueBlock.value.length;

			if (maxLength > 0) {
				if (inputSchema.valueBlock.value[0] instanceof Repeated) maxLength = inputData.valueBlock.value.length;
			}

			if (maxLength === 0) {
				return {
					verified: true,
					result: root
				};
			}

			if (inputData.valueBlock.value.length === 0 && inputSchema.valueBlock.value.length !== 0) {
				var _optional = true;

				for (var _i12 = 0; _i12 < inputSchema.valueBlock.value.length; _i12++) {
					_optional = _optional && (inputSchema.valueBlock.value[_i12].optional || false);
				}if (_optional === true) {
					return {
						verified: true,
						result: root
					};
				}

				if (inputSchema.hasOwnProperty("name")) {
					inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
					if (inputSchema.name !== "") delete root[inputSchema.name];
				}


				root.error = "Inconsistent object length";

				return {
					verified: false,
					result: root
				};
			}


			for (var _i13 = 0; _i13 < maxLength; _i13++) {
				if (_i13 - admission >= inputData.valueBlock.value.length) {
					if (inputSchema.valueBlock.value[_i13].optional === false) {
						var _result3 = {
							verified: false,
							result: root
						};

						root.error = "Inconsistent length between ASN.1 data and schema";

						if (inputSchema.hasOwnProperty("name")) {
							inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
							if (inputSchema.name !== "") {
								delete root[inputSchema.name];
								_result3.name = inputSchema.name;
							}
						}


						return _result3;
					}
				} else {
						if (inputSchema.valueBlock.value[0] instanceof Repeated) {
							_result2 = compareSchema(root, inputData.valueBlock.value[_i13], inputSchema.valueBlock.value[0].value);
							if (_result2.verified === false) {
								if (inputSchema.valueBlock.value[0].optional === true) admission++;else {
									if (inputSchema.hasOwnProperty("name")) {
										inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
										if (inputSchema.name !== "") delete root[inputSchema.name];
									}


									return _result2;
								}
							}

							if ("name" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].name.length > 0) {
								var arrayRoot = {};

								if ("local" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].local === true) arrayRoot = inputData;else arrayRoot = root;

								if (typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined") arrayRoot[inputSchema.valueBlock.value[0].name] = [];

								arrayRoot[inputSchema.valueBlock.value[0].name].push(inputData.valueBlock.value[_i13]);
							}
						} else {
								_result2 = compareSchema(root, inputData.valueBlock.value[_i13 - admission], inputSchema.valueBlock.value[_i13]);
								if (_result2.verified === false) {
									if (inputSchema.valueBlock.value[_i13].optional === true) admission++;else {
										if (inputSchema.hasOwnProperty("name")) {
											inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
											if (inputSchema.name !== "") delete root[inputSchema.name];
										}


										return _result2;
									}
								}
							}
					}
			}

			if (_result2.verified === false) {
					var _result4 = {
						verified: false,
						result: root
					};

					if (inputSchema.hasOwnProperty("name")) {
						inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
						if (inputSchema.name !== "") {
							delete root[inputSchema.name];
							_result4.name = inputSchema.name;
						}
					}


					return _result4;
				}

			return {
				verified: true,
				result: root
			};
		}

		if ("primitiveSchema" in inputSchema && "valueHex" in inputData.valueBlock) {
			var asn1 = fromBER(inputData.valueBlock.valueHex);
			if (asn1.offset === -1) {
				var _result5 = {
					verified: false,
					result: asn1.result
				};

				if (inputSchema.hasOwnProperty("name")) {
					inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
					if (inputSchema.name !== "") {
						delete root[inputSchema.name];
						_result5.name = inputSchema.name;
					}
				}


				return _result5;
			}


			return compareSchema(root, asn1.result, inputSchema.primitiveSchema);
		}

		return {
			verified: true,
			result: root
		};
	}

	var AlgorithmIdentifier = function () {
		function AlgorithmIdentifier() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, AlgorithmIdentifier);

			this.algorithmId = getParametersValue(parameters, "algorithmId", AlgorithmIdentifier.defaultValues("algorithmId"));

			if ("algorithmParams" in parameters) this.algorithmParams = getParametersValue(parameters, "algorithmParams", AlgorithmIdentifier.defaultValues("algorithmParams"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(AlgorithmIdentifier, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["algorithm", "params"]);

				var asn1 = compareSchema(schema, schema, AlgorithmIdentifier.schema({
					names: {
						algorithmIdentifier: "algorithm",
						algorithmParams: "params"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AlgorithmIdentifier");

				this.algorithmId = asn1.result.algorithm.valueBlock.toString();
				if ("params" in asn1.result) this.algorithmParams = asn1.result.params;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.algorithmId }));
				if ("algorithmParams" in this && this.algorithmParams instanceof Any === false) outputArray.push(this.algorithmParams);

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {
					algorithmId: this.algorithmId
				};

				if ("algorithmParams" in this && this.algorithmParams instanceof Any === false) object.algorithmParams = this.algorithmParams.toJSON();

				return object;
			}
		}, {
			key: 'isEqual',
			value: function isEqual(algorithmIdentifier) {
				if (algorithmIdentifier instanceof AlgorithmIdentifier === false) return false;

				if (this.algorithmId !== algorithmIdentifier.algorithmId) return false;

				if ("algorithmParams" in this) {
					if ("algorithmParams" in algorithmIdentifier) return JSON.stringify(this.algorithmParams) === JSON.stringify(algorithmIdentifier.algorithmParams);

					return false;
				}

				if ("algorithmParams" in algorithmIdentifier) return false;


				return true;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithmId":
						return "";
					case "algorithmParams":
						return new Any();
					default:
						throw new Error('Invalid member name for AlgorithmIdentifier class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "algorithmId":
						return memberValue === "";
					case "algorithmParams":
						return memberValue instanceof Any;
					default:
						throw new Error('Invalid member name for AlgorithmIdentifier class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					optional: names.optional || false,
					value: [new ObjectIdentifier({ name: names.algorithmIdentifier || "" }), new Any({ name: names.algorithmParams || "", optional: true })]
				});
			}
		}]);

		return AlgorithmIdentifier;
	}();

	var ECPublicKey = function () {
		function ECPublicKey() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, ECPublicKey);

			this.x = getParametersValue(parameters, "x", ECPublicKey.defaultValues("x"));

			this.y = getParametersValue(parameters, "y", ECPublicKey.defaultValues("y"));

			this.namedCurve = getParametersValue(parameters, "namedCurve", ECPublicKey.defaultValues("namedCurve"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(ECPublicKey, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				if (schema instanceof ArrayBuffer === false) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				var view = new Uint8Array(schema);
				if (view[0] !== 0x04) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				var coordinateLength = void 0;

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						coordinateLength = 32;
						break;
					case "1.3.132.0.34":
						coordinateLength = 48;
						break;
					case "1.3.132.0.35":
						coordinateLength = 66;
						break;
					default:
						throw new Error('Incorrect curve OID: ' + this.namedCurve);
				}

				if (schema.byteLength !== coordinateLength * 2 + 1) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				this.x = schema.slice(1, coordinateLength + 1);
				this.y = schema.slice(1 + coordinateLength, coordinateLength * 2 + 1);
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new RawData({ data: utilConcatBuf(new Uint8Array([0x04]).buffer, this.x, this.y)
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var crvName = "";

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						crvName = "P-256";
						break;
					case "1.3.132.0.34":
						crvName = "P-384";
						break;
					case "1.3.132.0.35":
						crvName = "P-521";
						break;
					default:
				}

				return {
					crv: crvName,
					x: toBase64(arrayBufferToString(this.x), true, true, false),
					y: toBase64(arrayBufferToString(this.y), true, true, false)
				};
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				var coodinateLength = 0;

				if ("crv" in json) {
					switch (json.crv.toUpperCase()) {
						case "P-256":
							this.namedCurve = "1.2.840.10045.3.1.7";
							coodinateLength = 32;
							break;
						case "P-384":
							this.namedCurve = "1.3.132.0.34";
							coodinateLength = 48;
							break;
						case "P-521":
							this.namedCurve = "1.3.132.0.35";
							coodinateLength = 66;
							break;
						default:
					}
				} else throw new Error("Absent mandatory parameter \"crv\"");

				if ("x" in json) {
					var convertBuffer = stringToArrayBuffer(fromBase64(json.x, true));

					if (convertBuffer.byteLength < coodinateLength) {
						this.x = new ArrayBuffer(coodinateLength);
						var view = new Uint8Array(this.x);
						var convertBufferView = new Uint8Array(convertBuffer);
						view.set(convertBufferView, 1);
					} else this.x = convertBuffer.slice(0, coodinateLength);
				} else throw new Error("Absent mandatory parameter \"x\"");

				if ("y" in json) {
					var _convertBuffer = stringToArrayBuffer(fromBase64(json.y, true));

					if (_convertBuffer.byteLength < coodinateLength) {
						this.y = new ArrayBuffer(coodinateLength);
						var _view3 = new Uint8Array(this.y);
						var _convertBufferView = new Uint8Array(_convertBuffer);
						_view3.set(_convertBufferView, 1);
					} else this.y = _convertBuffer.slice(0, coodinateLength);
				} else throw new Error("Absent mandatory parameter \"y\"");
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "x":
					case "y":
						return new ArrayBuffer(0);
					case "namedCurve":
						return "";
					default:
						throw new Error('Invalid member name for ECCPublicKey class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "x":
					case "y":
						return isEqualBuffer(memberValue, ECPublicKey.defaultValues(memberName));
					case "namedCurve":
						return memberValue === "";
					default:
						throw new Error('Invalid member name for ECCPublicKey class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				return new RawData();
			}
		}]);

		return ECPublicKey;
	}();

	var RSAPublicKey = function () {
		function RSAPublicKey() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, RSAPublicKey);

			this.modulus = getParametersValue(parameters, "modulus", RSAPublicKey.defaultValues("modulus"));

			this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPublicKey.defaultValues("publicExponent"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(RSAPublicKey, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["modulus", "publicExponent"]);

				var asn1 = compareSchema(schema, schema, RSAPublicKey.schema({
					names: {
						modulus: "modulus",
						publicExponent: "publicExponent"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAPublicKey");

				this.modulus = asn1.result.modulus.convertFromDER(256);
				this.publicExponent = asn1.result.publicExponent;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [this.modulus.convertToDER(), this.publicExponent]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
					e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true)
				};
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				if ("n" in json) {
					var array = stringToArrayBuffer(fromBase64(json.n, true));
					this.modulus = new Integer({ valueHex: array.slice(0, Math.pow(2, nearestPowerOf2(array.byteLength))) });
				} else throw new Error("Absent mandatory parameter \"n\"");

				if ("e" in json) this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true)).slice(0, 3) });else throw new Error("Absent mandatory parameter \"e\"");
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "modulus":
						return new Integer();
					case "publicExponent":
						return new Integer();
					default:
						throw new Error('Invalid member name for RSAPublicKey class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.modulus || "" }), new Integer({ name: names.publicExponent || "" })]
				});
			}
		}]);

		return RSAPublicKey;
	}();

	var PublicKeyInfo = function () {
		function PublicKeyInfo() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PublicKeyInfo);

			this.algorithm = getParametersValue(parameters, "algorithm", PublicKeyInfo.defaultValues("algorithm"));

			this.subjectPublicKey = getParametersValue(parameters, "subjectPublicKey", PublicKeyInfo.defaultValues("subjectPublicKey"));

			if ("parsedKey" in parameters) this.parsedKey = getParametersValue(parameters, "parsedKey", PublicKeyInfo.defaultValues("parsedKey"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(PublicKeyInfo, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["algorithm", "subjectPublicKey"]);

				var asn1 = compareSchema(schema, schema, PublicKeyInfo.schema({
					names: {
						algorithm: {
							names: {
								blockName: "algorithm"
							}
						},
						subjectPublicKey: "subjectPublicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PublicKeyInfo");

				this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
				this.subjectPublicKey = asn1.result.subjectPublicKey;

				switch (this.algorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						if ("algorithmParams" in this.algorithm) {
							if (this.algorithm.algorithmParams instanceof ObjectIdentifier) {
								try {
									this.parsedKey = new ECPublicKey({
										namedCurve: this.algorithm.algorithmParams.valueBlock.toString(),
										schema: this.subjectPublicKey.valueBlock.valueHex
									});
								} catch (ex) {}
							}
						}
						break;
					case "1.2.840.113549.1.1.1":
						{
							var publicKeyASN1 = fromBER(this.subjectPublicKey.valueBlock.valueHex);
							if (publicKeyASN1.offset !== -1) {
								try {
									this.parsedKey = new RSAPublicKey({ schema: publicKeyASN1.result });
								} catch (ex) {}
							}
						}
						break;
					default:
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [this.algorithm.toSchema(), this.subjectPublicKey]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				if ("parsedKey" in this === false) {
					return {
						algorithm: this.algorithm.toJSON(),
						subjectPublicKey: this.subjectPublicKey.toJSON()
					};
				}

				var jwk = {};

				switch (this.algorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						jwk.kty = "EC";
						break;
					case "1.2.840.113549.1.1.1":
						jwk.kty = "RSA";
						break;
					default:
				}

				var publicKeyJWK = this.parsedKey.toJSON();

				var _iteratorNormalCompletion8 = true;
				var _didIteratorError8 = false;
				var _iteratorError8 = undefined;

				try {
					for (var _iterator8 = Object.keys(publicKeyJWK)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
						var key = _step8.value;

						jwk[key] = publicKeyJWK[key];
					}
				} catch (err) {
					_didIteratorError8 = true;
					_iteratorError8 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion8 && _iterator8.return) {
							_iterator8.return();
						}
					} finally {
						if (_didIteratorError8) {
							throw _iteratorError8;
						}
					}
				}

				return jwk;
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				if ("kty" in json) {
					switch (json.kty.toUpperCase()) {
						case "EC":
							this.parsedKey = new ECPublicKey({ json: json });

							this.algorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.10045.2.1",
								algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
							});
							break;
						case "RSA":
							this.parsedKey = new RSAPublicKey({ json: json });

							this.algorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.1",
								algorithmParams: new Null()
							});
							break;
						default:
							throw new Error('Invalid value for "kty" parameter: ' + json.kty);
					}

					this.subjectPublicKey = new BitString({ valueHex: this.parsedKey.toSchema().toBER(false) });
				}
			}
		}, {
			key: 'importKey',
			value: function importKey(publicKey) {
				var sequence = Promise.resolve();
				var _this = this;

				if (typeof publicKey === "undefined") return Promise.reject("Need to provide publicKey input parameter");

				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");

				sequence = sequence.then(function () {
					return crypto.exportKey("spki", publicKey);
				});

				sequence = sequence.then(function (exportedKey) {
					var asn1 = fromBER(exportedKey);
					try {
						_this.fromSchema(asn1.result);
					} catch (exception) {
						return Promise.reject("Error during initializing object from schema");
					}

					return undefined;
				}, function (error) {
					return Promise.reject('Error during exporting public key: ' + error);
				});


				return sequence;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithm":
						return new AlgorithmIdentifier();
					case "subjectPublicKey":
						return new BitString();
					default:
						throw new Error('Invalid member name for PublicKeyInfo class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.algorithm || {}), new BitString({ name: names.subjectPublicKey || "" })]
				});
			}
		}]);

		return PublicKeyInfo;
	}();

	var Attribute = function () {
		function Attribute() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Attribute);

			this.type = getParametersValue(parameters, "type", Attribute.defaultValues("type"));

			this.values = getParametersValue(parameters, "values", Attribute.defaultValues("values"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(Attribute, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["type", "values"]);

				var asn1 = compareSchema(schema, schema, Attribute.schema({
					names: {
						type: "type",
						values: "values"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for Attribute");

				this.type = asn1.result.type.valueBlock.toString();
				this.values = asn1.result.values;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.type }), new Set({
						value: this.values
					})]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					type: this.type,
					values: Array.from(this.values, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return "";
					case "values":
						return [];
					default:
						throw new Error('Invalid member name for Attribute class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === "";
					case "values":
						return memberValue.length === 0;
					default:
						throw new Error('Invalid member name for Attribute class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.type || "" }), new Set({
						name: names.setName || "",
						value: [new Repeated({
							name: names.values || "",
							value: new Any()
						})]
					})]
				});
			}
		}]);

		return Attribute;
	}();

	var ECPrivateKey = function () {
		function ECPrivateKey() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, ECPrivateKey);

			this.version = getParametersValue(parameters, "version", ECPrivateKey.defaultValues("version"));

			this.privateKey = getParametersValue(parameters, "privateKey", ECPrivateKey.defaultValues("privateKey"));

			if ("namedCurve" in parameters) this.namedCurve = getParametersValue(parameters, "namedCurve", ECPrivateKey.defaultValues("namedCurve"));

			if ("publicKey" in parameters) this.publicKey = getParametersValue(parameters, "publicKey", ECPrivateKey.defaultValues("publicKey"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(ECPrivateKey, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["version", "privateKey", "namedCurve", "publicKey"]);

				var asn1 = compareSchema(schema, schema, ECPrivateKey.schema({
					names: {
						version: "version",
						privateKey: "privateKey",
						namedCurve: "namedCurve",
						publicKey: "publicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ECPrivateKey");

				this.version = asn1.result.version.valueBlock.valueDec;
				this.privateKey = asn1.result.privateKey;

				if ("namedCurve" in asn1.result) this.namedCurve = asn1.result.namedCurve.valueBlock.toString();

				if ("publicKey" in asn1.result) {
					var publicKeyData = { schema: asn1.result.publicKey.valueBlock.valueHex };
					if ("namedCurve" in this) publicKeyData.namedCurve = this.namedCurve;

					this.publicKey = new ECPublicKey(publicKeyData);
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [new Integer({ value: this.version }), this.privateKey];

				if ("namedCurve" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new ObjectIdentifier({ value: this.namedCurve })]
					}));
				}

				if ("publicKey" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [new BitString({ valueHex: this.publicKey.toSchema().toBER(false) })]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				if ("namedCurve" in this === false || ECPrivateKey.compareWithDefault("namedCurve", this.namedCurve)) throw new Error("Not enough information for making JSON: absent \"namedCurve\" value");

				var crvName = "";

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						crvName = "P-256";
						break;
					case "1.3.132.0.34":
						crvName = "P-384";
						break;
					case "1.3.132.0.35":
						crvName = "P-521";
						break;
					default:
				}

				var privateKeyJSON = {
					crv: crvName,
					d: toBase64(arrayBufferToString(this.privateKey.valueBlock.valueHex), true, true, false)
				};

				if ("publicKey" in this) {
					var publicKeyJSON = this.publicKey.toJSON();

					privateKeyJSON.x = publicKeyJSON.x;
					privateKeyJSON.y = publicKeyJSON.y;
				}

				return privateKeyJSON;
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				var coodinateLength = 0;

				if ("crv" in json) {
					switch (json.crv.toUpperCase()) {
						case "P-256":
							this.namedCurve = "1.2.840.10045.3.1.7";
							coodinateLength = 32;
							break;
						case "P-384":
							this.namedCurve = "1.3.132.0.34";
							coodinateLength = 48;
							break;
						case "P-521":
							this.namedCurve = "1.3.132.0.35";
							coodinateLength = 66;
							break;
						default:
					}
				} else throw new Error("Absent mandatory parameter \"crv\"");

				if ("d" in json) {
					var convertBuffer = stringToArrayBuffer(fromBase64(json.d, true));

					if (convertBuffer.byteLength < coodinateLength) {
						var buffer = new ArrayBuffer(coodinateLength);
						var view = new Uint8Array(buffer);
						var convertBufferView = new Uint8Array(convertBuffer);
						view.set(convertBufferView, 1);

						this.privateKey = new OctetString({ valueHex: buffer });
					} else this.privateKey = new OctetString({ valueHex: convertBuffer.slice(0, coodinateLength) });
				} else throw new Error("Absent mandatory parameter \"d\"");

				if ("x" in json && "y" in json) this.publicKey = new ECPublicKey({ json: json });
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 1;
					case "privateKey":
						return new OctetString();
					case "namedCurve":
						return "";
					case "publicKey":
						return new ECPublicKey();
					default:
						throw new Error('Invalid member name for ECCPrivateKey class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === ECPrivateKey.defaultValues(memberName);
					case "privateKey":
						return memberValue.isEqual(ECPrivateKey.defaultValues(memberName));
					case "namedCurve":
						return memberValue === "";
					case "publicKey":
						return ECPublicKey.compareWithDefault("namedCurve", memberValue.namedCurve) && ECPublicKey.compareWithDefault("x", memberValue.x) && ECPublicKey.compareWithDefault("y", memberValue.y);
					default:
						throw new Error('Invalid member name for ECCPrivateKey class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new OctetString({ name: names.privateKey || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new ObjectIdentifier({ name: names.namedCurve || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [new BitString({ name: names.publicKey || "" })]
					})]
				});
			}
		}]);

		return ECPrivateKey;
	}();

	var OtherPrimeInfo = function () {
		function OtherPrimeInfo() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, OtherPrimeInfo);

			this.prime = getParametersValue(parameters, "prime", OtherPrimeInfo.defaultValues("prime"));

			this.exponent = getParametersValue(parameters, "exponent", OtherPrimeInfo.defaultValues("exponent"));

			this.coefficient = getParametersValue(parameters, "coefficient", OtherPrimeInfo.defaultValues("coefficient"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(OtherPrimeInfo, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["prime", "exponent", "coefficient"]);

				var asn1 = compareSchema(schema, schema, OtherPrimeInfo.schema({
					names: {
						prime: "prime",
						exponent: "exponent",
						coefficient: "coefficient"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherPrimeInfo");

				this.prime = asn1.result.prime.convertFromDER();
				this.exponent = asn1.result.exponent.convertFromDER();
				this.coefficient = asn1.result.coefficient.convertFromDER();
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [this.prime.convertToDER(), this.exponent.convertToDER(), this.coefficient.convertToDER()]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					r: toBase64(arrayBufferToString(this.prime.valueBlock.valueHex), true, true),
					d: toBase64(arrayBufferToString(this.exponent.valueBlock.valueHex), true, true),
					t: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true)
				};
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				if ("r" in json) this.prime = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.r, true)) });else throw new Error("Absent mandatory parameter \"r\"");

				if ("d" in json) this.exponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true)) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("t" in json) this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.t, true)) });else throw new Error("Absent mandatory parameter \"t\"");
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "prime":
						return new Integer();
					case "exponent":
						return new Integer();
					case "coefficient":
						return new Integer();
					default:
						throw new Error('Invalid member name for OtherPrimeInfo class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.prime || "" }), new Integer({ name: names.exponent || "" }), new Integer({ name: names.coefficient || "" })]
				});
			}
		}]);

		return OtherPrimeInfo;
	}();

	var RSAPrivateKey = function () {
		function RSAPrivateKey() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, RSAPrivateKey);

			this.version = getParametersValue(parameters, "version", RSAPrivateKey.defaultValues("version"));

			this.modulus = getParametersValue(parameters, "modulus", RSAPrivateKey.defaultValues("modulus"));

			this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPrivateKey.defaultValues("publicExponent"));

			this.privateExponent = getParametersValue(parameters, "privateExponent", RSAPrivateKey.defaultValues("privateExponent"));

			this.prime1 = getParametersValue(parameters, "prime1", RSAPrivateKey.defaultValues("prime1"));

			this.prime2 = getParametersValue(parameters, "prime2", RSAPrivateKey.defaultValues("prime2"));

			this.exponent1 = getParametersValue(parameters, "exponent1", RSAPrivateKey.defaultValues("exponent1"));

			this.exponent2 = getParametersValue(parameters, "exponent2", RSAPrivateKey.defaultValues("exponent2"));

			this.coefficient = getParametersValue(parameters, "coefficient", RSAPrivateKey.defaultValues("coefficient"));

			if ("otherPrimeInfos" in parameters) this.otherPrimeInfos = getParametersValue(parameters, "otherPrimeInfos", RSAPrivateKey.defaultValues("otherPrimeInfos"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(RSAPrivateKey, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["version", "modulus", "publicExponent", "privateExponent", "prime1", "prime2", "exponent1", "exponent2", "coefficient", "otherPrimeInfos"]);

				var asn1 = compareSchema(schema, schema, RSAPrivateKey.schema({
					names: {
						version: "version",
						modulus: "modulus",
						publicExponent: "publicExponent",
						privateExponent: "privateExponent",
						prime1: "prime1",
						prime2: "prime2",
						exponent1: "exponent1",
						exponent2: "exponent2",
						coefficient: "coefficient",
						otherPrimeInfo: {
							names: {
								blockName: "otherPrimeInfos"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAPrivateKey");

				this.version = asn1.result.version.valueBlock.valueDec;
				this.modulus = asn1.result.modulus.convertFromDER(256);
				this.publicExponent = asn1.result.publicExponent;
				this.privateExponent = asn1.result.privateExponent.convertFromDER(256);
				this.prime1 = asn1.result.prime1.convertFromDER(128);
				this.prime2 = asn1.result.prime2.convertFromDER(128);
				this.exponent1 = asn1.result.exponent1.convertFromDER(128);
				this.exponent2 = asn1.result.exponent2.convertFromDER(128);
				this.coefficient = asn1.result.coefficient.convertFromDER(128);

				if ("otherPrimeInfos" in asn1.result) this.otherPrimeInfos = Array.from(asn1.result.otherPrimeInfos, function (element) {
					return new OtherPrimeInfo({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));
				outputArray.push(this.modulus.convertToDER());
				outputArray.push(this.publicExponent);
				outputArray.push(this.privateExponent.convertToDER());
				outputArray.push(this.prime1.convertToDER());
				outputArray.push(this.prime2.convertToDER());
				outputArray.push(this.exponent1.convertToDER());
				outputArray.push(this.exponent2.convertToDER());
				outputArray.push(this.coefficient.convertToDER());

				if ("otherPrimeInfos" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.otherPrimeInfos, function (element) {
							return element.toSchema();
						})
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var jwk = {
					n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
					e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true),
					d: toBase64(arrayBufferToString(this.privateExponent.valueBlock.valueHex), true, true, true),
					p: toBase64(arrayBufferToString(this.prime1.valueBlock.valueHex), true, true, true),
					q: toBase64(arrayBufferToString(this.prime2.valueBlock.valueHex), true, true, true),
					dp: toBase64(arrayBufferToString(this.exponent1.valueBlock.valueHex), true, true, true),
					dq: toBase64(arrayBufferToString(this.exponent2.valueBlock.valueHex), true, true, true),
					qi: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true, true)
				};

				if ("otherPrimeInfos" in this) jwk.oth = Array.from(this.otherPrimeInfos, function (element) {
					return element.toJSON();
				});

				return jwk;
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				if ("n" in json) this.modulus = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.n, true, true)) });else throw new Error("Absent mandatory parameter \"n\"");

				if ("e" in json) this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true, true)) });else throw new Error("Absent mandatory parameter \"e\"");

				if ("d" in json) this.privateExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true, true)) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("p" in json) this.prime1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.p, true, true)) });else throw new Error("Absent mandatory parameter \"p\"");

				if ("q" in json) this.prime2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.q, true, true)) });else throw new Error("Absent mandatory parameter \"q\"");

				if ("dp" in json) this.exponent1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dp, true, true)) });else throw new Error("Absent mandatory parameter \"dp\"");

				if ("dq" in json) this.exponent2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dq, true, true)) });else throw new Error("Absent mandatory parameter \"dq\"");

				if ("qi" in json) this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.qi, true, true)) });else throw new Error("Absent mandatory parameter \"qi\"");

				if ("oth" in json) this.otherPrimeInfos = Array.from(json.oth, function (element) {
					return new OtherPrimeInfo({ json: element });
				});
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "modulus":
						return new Integer();
					case "publicExponent":
						return new Integer();
					case "privateExponent":
						return new Integer();
					case "prime1":
						return new Integer();
					case "prime2":
						return new Integer();
					case "exponent1":
						return new Integer();
					case "exponent2":
						return new Integer();
					case "coefficient":
						return new Integer();
					case "otherPrimeInfos":
						return [];
					default:
						throw new Error('Invalid member name for RSAPrivateKey class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new Integer({ name: names.modulus || "" }), new Integer({ name: names.publicExponent || "" }), new Integer({ name: names.privateExponent || "" }), new Integer({ name: names.prime1 || "" }), new Integer({ name: names.prime2 || "" }), new Integer({ name: names.exponent1 || "" }), new Integer({ name: names.exponent2 || "" }), new Integer({ name: names.coefficient || "" }), new Sequence({
						optional: true,
						value: [new Repeated({
							name: names.otherPrimeInfosName || "",
							value: OtherPrimeInfo.schema(names.otherPrimeInfo || {})
						})]
					})]
				});
			}
		}]);

		return RSAPrivateKey;
	}();

	var PrivateKeyInfo = function () {
		function PrivateKeyInfo() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PrivateKeyInfo);

			this.version = getParametersValue(parameters, "version", PrivateKeyInfo.defaultValues("version"));

			this.privateKeyAlgorithm = getParametersValue(parameters, "privateKeyAlgorithm", PrivateKeyInfo.defaultValues("privateKeyAlgorithm"));

			this.privateKey = getParametersValue(parameters, "privateKey", PrivateKeyInfo.defaultValues("privateKey"));

			if ("attributes" in parameters) this.attributes = getParametersValue(parameters, "attributes", PrivateKeyInfo.defaultValues("attributes"));

			if ("parsedKey" in parameters) this.parsedKey = getParametersValue(parameters, "parsedKey", PrivateKeyInfo.defaultValues("parsedKey"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("json" in parameters) this.fromJSON(parameters.json);
		}

		_createClass(PrivateKeyInfo, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["version", "privateKeyAlgorithm", "privateKey", "attributes"]);

				var asn1 = compareSchema(schema, schema, PrivateKeyInfo.schema({
					names: {
						version: "version",
						privateKeyAlgorithm: {
							names: {
								blockName: "privateKeyAlgorithm"
							}
						},
						privateKey: "privateKey",
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PrivateKeyInfo");

				this.version = asn1.result.version.valueBlock.valueDec;
				this.privateKeyAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.privateKeyAlgorithm });
				this.privateKey = asn1.result.privateKey;

				if ("attributes" in asn1.result) this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});

				switch (this.privateKeyAlgorithm.algorithmId) {
					case "1.2.840.113549.1.1.1":
						{
							var privateKeyASN1 = fromBER(this.privateKey.valueBlock.valueHex);
							if (privateKeyASN1.offset !== -1) this.parsedKey = new RSAPrivateKey({ schema: privateKeyASN1.result });
						}
						break;
					case "1.2.840.10045.2.1":
						if ("algorithmParams" in this.privateKeyAlgorithm) {
							if (this.privateKeyAlgorithm.algorithmParams instanceof ObjectIdentifier) {
								var _privateKeyASN = fromBER(this.privateKey.valueBlock.valueHex);
								if (_privateKeyASN.offset !== -1) {
									this.parsedKey = new ECPrivateKey({
										namedCurve: this.privateKeyAlgorithm.algorithmParams.valueBlock.toString(),
										schema: _privateKeyASN.result
									});
								}
							}
						}
						break;
					default:
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [new Integer({ value: this.version }), this.privateKeyAlgorithm.toSchema(), this.privateKey];

				if ("attributes" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: Array.from(this.attributes, function (element) {
							return element.toSchema();
						})
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				if ("parsedKey" in this === false) {
					var object = {
						version: this.version,
						privateKeyAlgorithm: this.privateKeyAlgorithm.toJSON(),
						privateKey: this.privateKey.toJSON()
					};

					if ("attributes" in this) object.attributes = Array.from(this.attributes, function (element) {
						return element.toJSON();
					});

					return object;
				}

				var jwk = {};

				switch (this.privateKeyAlgorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						jwk.kty = "EC";
						break;
					case "1.2.840.113549.1.1.1":
						jwk.kty = "RSA";
						break;
					default:
				}

				var publicKeyJWK = this.parsedKey.toJSON();

				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = Object.keys(publicKeyJWK)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var key = _step9.value;

						jwk[key] = publicKeyJWK[key];
					}
				} catch (err) {
					_didIteratorError9 = true;
					_iteratorError9 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion9 && _iterator9.return) {
							_iterator9.return();
						}
					} finally {
						if (_didIteratorError9) {
							throw _iteratorError9;
						}
					}
				}

				return jwk;
			}
		}, {
			key: 'fromJSON',
			value: function fromJSON(json) {
				if ("kty" in json) {
					switch (json.kty.toUpperCase()) {
						case "EC":
							this.parsedKey = new ECPrivateKey({ json: json });

							this.privateKeyAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.10045.2.1",
								algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
							});
							break;
						case "RSA":
							this.parsedKey = new RSAPrivateKey({ json: json });

							this.privateKeyAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.1",
								algorithmParams: new Null()
							});
							break;
						default:
							throw new Error('Invalid value for "kty" parameter: ' + json.kty);
					}

					this.privateKey = new OctetString({ valueHex: this.parsedKey.toSchema().toBER(false) });
				}
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "privateKeyAlgorithm":
						return new AlgorithmIdentifier();
					case "privateKey":
						return new OctetString();
					case "attributes":
						return [];
					case "parsedKey":
						return {};
					default:
						throw new Error('Invalid member name for PrivateKeyInfo class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), AlgorithmIdentifier.schema(names.privateKeyAlgorithm || {}), new OctetString({ name: names.privateKey || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Repeated({
							name: names.attributes || "",
							value: Attribute.schema()
						})]
					})]
				});
			}
		}]);

		return PrivateKeyInfo;
	}();

	var EncryptedContentInfo = function () {
		function EncryptedContentInfo() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, EncryptedContentInfo);

			this.contentType = getParametersValue(parameters, "contentType", EncryptedContentInfo.defaultValues("contentType"));

			this.contentEncryptionAlgorithm = getParametersValue(parameters, "contentEncryptionAlgorithm", EncryptedContentInfo.defaultValues("contentEncryptionAlgorithm"));

			if ("encryptedContent" in parameters) {
				this.encryptedContent = parameters.encryptedContent;

				if (this.encryptedContent.idBlock.tagClass === 1 && this.encryptedContent.idBlock.tagNumber === 4) {
					if (this.encryptedContent.idBlock.isConstructed === false) {
						var constrString = new OctetString({
							idBlock: { isConstructed: true },
							isConstructed: true
						});

						var offset = 0;
						var length = this.encryptedContent.valueBlock.valueHex.byteLength;

						while (length > 0) {
							var pieceView = new Uint8Array(this.encryptedContent.valueBlock.valueHex, offset, offset + 1024 > this.encryptedContent.valueBlock.valueHex.byteLength ? this.encryptedContent.valueBlock.valueHex.byteLength - offset : 1024);
							var _array = new ArrayBuffer(pieceView.length);
							var _view = new Uint8Array(_array);

							for (var i = 0; i < _view.length; i++) {
								_view[i] = pieceView[i];
							}constrString.valueBlock.value.push(new OctetString({ valueHex: _array }));

							length -= pieceView.length;
							offset += pieceView.length;
						}

						this.encryptedContent = constrString;
					}
				}
			}

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(EncryptedContentInfo, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["contentType", "contentEncryptionAlgorithm", "encryptedContent"]);

				var asn1 = compareSchema(schema, schema, EncryptedContentInfo.schema({
					names: {
						contentType: "contentType",
						contentEncryptionAlgorithm: {
							names: {
								blockName: "contentEncryptionAlgorithm"
							}
						},
						encryptedContent: "encryptedContent"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EncryptedContentInfo");

				this.contentType = asn1.result.contentType.valueBlock.toString();
				this.contentEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.contentEncryptionAlgorithm });

				if ("encryptedContent" in asn1.result) {
					this.encryptedContent = asn1.result.encryptedContent;

					this.encryptedContent.idBlock.tagClass = 1;
					this.encryptedContent.idBlock.tagNumber = 4;
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var sequenceLengthBlock = {
					isIndefiniteForm: false
				};

				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.contentType }));
				outputArray.push(this.contentEncryptionAlgorithm.toSchema());

				if ("encryptedContent" in this) {
					sequenceLengthBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

					var encryptedValue = this.encryptedContent;

					encryptedValue.idBlock.tagClass = 3;
					encryptedValue.idBlock.tagNumber = 0;

					encryptedValue.lenBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

					outputArray.push(encryptedValue);
				}

				return new Sequence({
					lenBlock: sequenceLengthBlock,
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var _object = {
					contentType: this.contentType,
					contentEncryptionAlgorithm: this.contentEncryptionAlgorithm.toJSON()
				};

				if ("encryptedContent" in this) _object.encryptedContent = this.encryptedContent.toJSON();

				return _object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "contentType":
						return "";
					case "contentEncryptionAlgorithm":
						return new AlgorithmIdentifier();
					case "encryptedContent":
						return new OctetString();
					default:
						throw new Error('Invalid member name for EncryptedContentInfo class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "contentType":
						return memberValue === "";
					case "contentEncryptionAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "encryptedContent":
						return memberValue.isEqual(EncryptedContentInfo.defaultValues(memberName));
					default:
						throw new Error('Invalid member name for EncryptedContentInfo class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.contentType || "" }), AlgorithmIdentifier.schema(names.contentEncryptionAlgorithm || {}), new Choice({
						value: [new Constructed({
							name: names.encryptedContent || "",
							idBlock: {
								tagClass: 3,
								tagNumber: 0 },
							value: [new Repeated({
								value: new OctetString()
							})]
						}), new Primitive({
							name: names.encryptedContent || "",
							idBlock: {
								tagClass: 3,
								tagNumber: 0 }
						})]
					})]
				});
			}
		}]);

		return EncryptedContentInfo;
	}();

	var RSASSAPSSParams = function () {
		function RSASSAPSSParams() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, RSASSAPSSParams);

			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", RSASSAPSSParams.defaultValues("hashAlgorithm"));

			this.maskGenAlgorithm = getParametersValue(parameters, "maskGenAlgorithm", RSASSAPSSParams.defaultValues("maskGenAlgorithm"));

			this.saltLength = getParametersValue(parameters, "saltLength", RSASSAPSSParams.defaultValues("saltLength"));

			this.trailerField = getParametersValue(parameters, "trailerField", RSASSAPSSParams.defaultValues("trailerField"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(RSASSAPSSParams, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["hashAlgorithm", "maskGenAlgorithm", "saltLength", "trailerField"]);

				var asn1 = compareSchema(schema, schema, RSASSAPSSParams.schema({
					names: {
						hashAlgorithm: {
							names: {
								blockName: "hashAlgorithm"
							}
						},
						maskGenAlgorithm: {
							names: {
								blockName: "maskGenAlgorithm"
							}
						},
						saltLength: "saltLength",
						trailerField: "trailerField"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSASSAPSSParams");

				if ("hashAlgorithm" in asn1.result) this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

				if ("maskGenAlgorithm" in asn1.result) this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

				if ("saltLength" in asn1.result) this.saltLength = asn1.result.saltLength.valueBlock.valueDec;

				if ("trailerField" in asn1.result) this.trailerField = asn1.result.trailerField.valueBlock.valueDec;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if (!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [this.hashAlgorithm.toSchema()]
					}));
				}

				if (!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [this.maskGenAlgorithm.toSchema()]
					}));
				}

				if (this.saltLength !== RSASSAPSSParams.defaultValues("saltLength")) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						value: [new Integer({ value: this.saltLength })]
					}));
				}

				if (this.trailerField !== RSASSAPSSParams.defaultValues("trailerField")) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 3 },
						value: [new Integer({ value: this.trailerField })]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if (!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm"))) object.hashAlgorithm = this.hashAlgorithm.toJSON();

				if (!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm"))) object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();

				if (this.saltLength !== RSASSAPSSParams.defaultValues("saltLength")) object.saltLength = this.saltLength;

				if (this.trailerField !== RSASSAPSSParams.defaultValues("trailerField")) object.trailerField = this.trailerField;

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "hashAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.3.14.3.2.26",
							algorithmParams: new Null()
						});
					case "maskGenAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8",
							algorithmParams: new AlgorithmIdentifier({
								algorithmId: "1.3.14.3.2.26",
								algorithmParams: new Null()
							}).toSchema()
						});
					case "saltLength":
						return 20;
					case "trailerField":
						return 1;
					default:
						throw new Error('Invalid member name for RSASSAPSSParams class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						optional: true,
						value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						optional: true,
						value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						optional: true,
						value: [new Integer({ name: names.saltLength || "" })]
					}), new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 3 },
						optional: true,
						value: [new Integer({ name: names.trailerField || "" })]
					})]
				});
			}
		}]);

		return RSASSAPSSParams;
	}();

	var PBKDF2Params = function () {
		function PBKDF2Params() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PBKDF2Params);

			this.salt = getParametersValue(parameters, "salt", PBKDF2Params.defaultValues("salt"));

			this.iterationCount = getParametersValue(parameters, "iterationCount", PBKDF2Params.defaultValues("iterationCount"));

			if ("keyLength" in parameters) this.keyLength = getParametersValue(parameters, "keyLength", PBKDF2Params.defaultValues("keyLength"));

			if ("prf" in parameters) this.prf = getParametersValue(parameters, "prf", PBKDF2Params.defaultValues("prf"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PBKDF2Params, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["salt", "iterationCount", "keyLength", "prf"]);

				var asn1 = compareSchema(schema, schema, PBKDF2Params.schema({
					names: {
						saltPrimitive: "salt",
						saltConstructed: {
							names: {
								blockName: "salt"
							}
						},
						iterationCount: "iterationCount",
						keyLength: "keyLength",
						prf: {
							names: {
								blockName: "prf",
								optional: true
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PBKDF2Params");

				this.salt = asn1.result.salt;
				this.iterationCount = asn1.result.iterationCount.valueBlock.valueDec;

				if ("keyLength" in asn1.result) this.keyLength = asn1.result.keyLength.valueBlock.valueDec;

				if ("prf" in asn1.result) this.prf = new AlgorithmIdentifier({ schema: asn1.result.prf });
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				outputArray.push(this.salt);
				outputArray.push(new Integer({ value: this.iterationCount }));

				if ("keyLength" in this) {
					if (PBKDF2Params.defaultValues("keyLength") !== this.keyLength) outputArray.push(new Integer({ value: this.keyLength }));
				}

				if ("prf" in this) {
					if (PBKDF2Params.defaultValues("prf").isEqual(this.prf) === false) outputArray.push(this.prf.toSchema());
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var _object = {
					salt: this.salt.toJSON(),
					iterationCount: this.iterationCount
				};

				if ("keyLength" in this) {
					if (PBKDF2Params.defaultValues("keyLength") !== this.keyLength) _object.keyLength = this.keyLength;
				}

				if ("prf" in this) {
					if (PBKDF2Params.defaultValues("prf").isEqual(this.prf) === false) _object.prf = this.prf.toJSON();
				}

				return _object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "salt":
						return {};
					case "iterationCount":
						return -1;
					case "keyLength":
						return 0;
					case "prf":
						return new AlgorithmIdentifier({
							algorithmId: "1.3.14.3.2.26",
							algorithmParams: new Null()
						});
					default:
						throw new Error('Invalid member name for PBKDF2Params class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Choice({
						value: [new OctetString({ name: names.saltPrimitive || "" }), AlgorithmIdentifier.schema(names.saltConstructed || {})]
					}), new Integer({ name: names.iterationCount || "" }), new Integer({
						name: names.keyLength || "",
						optional: true
					}), AlgorithmIdentifier.schema(names.prf || {
						names: {
							optional: true
						}
					})]
				});
			}
		}]);

		return PBKDF2Params;
	}();

	var PBES2Params = function () {
		function PBES2Params() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PBES2Params);

			this.keyDerivationFunc = getParametersValue(parameters, "keyDerivationFunc", PBES2Params.defaultValues("keyDerivationFunc"));

			this.encryptionScheme = getParametersValue(parameters, "encryptionScheme", PBES2Params.defaultValues("encryptionScheme"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PBES2Params, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["keyDerivationFunc", "encryptionScheme"]);

				var asn1 = compareSchema(schema, schema, PBES2Params.schema({
					names: {
						keyDerivationFunc: {
							names: {
								blockName: "keyDerivationFunc"
							}
						},
						encryptionScheme: {
							names: {
								blockName: "encryptionScheme"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PBES2Params");

				this.keyDerivationFunc = new AlgorithmIdentifier({ schema: asn1.result.keyDerivationFunc });
				this.encryptionScheme = new AlgorithmIdentifier({ schema: asn1.result.encryptionScheme });
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [this.keyDerivationFunc.toSchema(), this.encryptionScheme.toSchema()]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					keyDerivationFunc: this.keyDerivationFunc.toJSON(),
					encryptionScheme: this.encryptionScheme.toJSON()
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyDerivationFunc":
						return new AlgorithmIdentifier();
					case "encryptionScheme":
						return new AlgorithmIdentifier();
					default:
						throw new Error('Invalid member name for PBES2Params class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.keyDerivationFunc || {}), AlgorithmIdentifier.schema(names.encryptionScheme || {})]
				});
			}
		}]);

		return PBES2Params;
	}();

	function makePKCS12B2Key(cryptoEngine, hashAlgorithm, keyLength, password, salt, iterationCount) {
		var u = void 0;
		var v = void 0;

		var result = [];

		switch (hashAlgorithm.toUpperCase()) {
			case "SHA-1":
				u = 20;
				v = 64;
				break;
			case "SHA-256":
				u = 32;
				v = 64;
				break;
			case "SHA-384":
				u = 48;
				v = 128;
				break;
			case "SHA-512":
				u = 64;
				v = 128;
				break;
			default:
				throw new Error("Unsupported hashing algorithm");
		}

		var passwordViewInitial = new Uint8Array(password);

		var passwordTransformed = new ArrayBuffer(password.byteLength * 2 + 2);
		var passwordTransformedView = new Uint8Array(passwordTransformed);

		for (var i = 0; i < passwordViewInitial.length; i++) {
			passwordTransformedView[i * 2] = 0x00;
			passwordTransformedView[i * 2 + 1] = passwordViewInitial[i];
		}

		passwordTransformedView[passwordTransformedView.length - 2] = 0x00;
		passwordTransformedView[passwordTransformedView.length - 1] = 0x00;

		password = passwordTransformed.slice(0);

		var D = new ArrayBuffer(v);
		var dView = new Uint8Array(D);

		for (var _i14 = 0; _i14 < D.byteLength; _i14++) {
			dView[_i14] = 3;
		}
		var saltLength = salt.byteLength;

		var sLen = v * Math.ceil(saltLength / v);
		var S = new ArrayBuffer(sLen);
		var sView = new Uint8Array(S);

		var saltView = new Uint8Array(salt);

		for (var _i15 = 0; _i15 < sLen; _i15++) {
			sView[_i15] = saltView[_i15 % saltLength];
		}
		var passwordLength = password.byteLength;

		var pLen = v * Math.ceil(passwordLength / v);
		var P = new ArrayBuffer(pLen);
		var pView = new Uint8Array(P);

		var passwordView = new Uint8Array(password);

		for (var _i16 = 0; _i16 < pLen; _i16++) {
			pView[_i16] = passwordView[_i16 % passwordLength];
		}
		var sPlusPLength = S.byteLength + P.byteLength;

		var I = new ArrayBuffer(sPlusPLength);
		var iView = new Uint8Array(I);

		iView.set(sView);
		iView.set(pView, sView.length);

		var c = Math.ceil((keyLength >> 3) / u);

		var internalSequence = Promise.resolve(I);

		for (var _i17 = 0; _i17 <= c; _i17++) {
			internalSequence = internalSequence.then(function (_I) {
				var dAndI = new ArrayBuffer(D.byteLength + _I.byteLength);
				var dAndIView = new Uint8Array(dAndI);

				dAndIView.set(dView);
				dAndIView.set(iView, dView.length);


				return dAndI;
			});

			for (var j = 0; j < iterationCount; j++) {
				internalSequence = internalSequence.then(function (roundBuffer) {
					return cryptoEngine.digest({ name: hashAlgorithm }, new Uint8Array(roundBuffer));
				});
			}

			internalSequence = internalSequence.then(function (roundBuffer) {
				var B = new ArrayBuffer(v);
				var bView = new Uint8Array(B);

				for (var _j = 0; _j < B.byteLength; _j++) {
					bView[_j] = roundBuffer[_j % roundBuffer.length];
				}
				var k = Math.ceil(saltLength / v) + Math.ceil(passwordLength / v);
				var iRound = [];

				var sliceStart = 0;
				var sliceLength = v;

				for (var _j2 = 0; _j2 < k; _j2++) {
					var chunk = Array.from(new Uint8Array(I.slice(sliceStart, sliceStart + sliceLength)));
					sliceStart += v;
					if (sliceStart + v > I.byteLength) sliceLength = I.byteLength - sliceStart;

					var x = 0x1ff;

					for (var l = B.byteLength - 1; l >= 0; l--) {
						x >>= 8;
						x += bView[l] + chunk[l];
						chunk[l] = x & 0xff;
					}

					iRound.push.apply(iRound, _toConsumableArray(chunk));
				}

				I = new ArrayBuffer(iRound.length);
				iView = new Uint8Array(I);

				iView.set(iRound);


				result.push.apply(result, _toConsumableArray(new Uint8Array(roundBuffer)));

				return I;
			});
		}

		internalSequence = internalSequence.then(function () {
			var resultBuffer = new ArrayBuffer(keyLength >> 3);
			var resultView = new Uint8Array(resultBuffer);

			resultView.set(new Uint8Array(result).slice(0, keyLength >> 3));

			return resultBuffer;
		});


		return internalSequence;
	}

	var CryptoEngine = function () {
		function CryptoEngine() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, CryptoEngine);

			this.crypto = getParametersValue(parameters, "crypto", {});

			this.subtle = getParametersValue(parameters, "subtle", {});

			this.name = getParametersValue(parameters, "name", "");
		}

		_createClass(CryptoEngine, [{
			key: 'importKey',
			value: function importKey(format, keyData, algorithm, extractable, keyUsages) {
				var _this52 = this;

				var jwk = {};

				if (keyData instanceof Uint8Array) keyData = keyData.buffer;


				switch (format.toLowerCase()) {
					case "raw":
						return this.subtle.importKey("raw", keyData, algorithm, extractable, keyUsages);
					case "spki":
						{
							var asn1 = fromBER(keyData);
							if (asn1.offset === -1) return Promise.reject("Incorrect keyData");

							var publicKeyInfo = new PublicKeyInfo();
							try {
								publicKeyInfo.fromSchema(asn1.result);
							} catch (ex) {
								return Promise.reject("Incorrect keyData");
							}

							switch (algorithm.name.toUpperCase()) {
								case "RSA-PSS":
									{
										switch (algorithm.hash.name.toUpperCase()) {
											case "SHA-1":
												jwk.alg = "PS1";
												break;
											case "SHA-256":
												jwk.alg = "PS256";
												break;
											case "SHA-384":
												jwk.alg = "PS384";
												break;
											case "SHA-512":
												jwk.alg = "PS512";
												break;
											default:
												return Promise.reject('Incorrect hash algorithm: ' + algorithm.hash.name.toUpperCase());
										}
									}

								case "RSASSA-PKCS1-V1_5":
									{
										keyUsages = ["verify"];

										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (publicKeyInfo.algorithm.algorithmId !== "1.2.840.113549.1.1.1") return Promise.reject('Incorrect public key algorithm: ' + publicKeyInfo.algorithm.algorithmId);

										if ("alg" in jwk === false) {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RS1";
													break;
												case "SHA-256":
													jwk.alg = "RS256";
													break;
												case "SHA-384":
													jwk.alg = "RS384";
													break;
												case "SHA-512":
													jwk.alg = "RS512";
													break;
												default:
													return Promise.reject('Incorrect public key algorithm: ' + publicKeyInfo.algorithm.algorithmId);
											}
										}

										var publicKeyJSON = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion10 = true;
										var _didIteratorError10 = false;
										var _iteratorError10 = undefined;

										try {
											for (var _iterator10 = Object.keys(publicKeyJSON)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
												var key = _step10.value;

												jwk[key] = publicKeyJSON[key];
											}
										} catch (err) {
											_didIteratorError10 = true;
											_iteratorError10 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion10 && _iterator10.return) {
													_iterator10.return();
												}
											} finally {
												if (_didIteratorError10) {
													throw _iteratorError10;
												}
											}
										}
									}
									break;
								case "ECDSA":
									keyUsages = ["verify"];
								case "ECDH":
									{
										jwk = {
											kty: "EC",
											ext: extractable,
											key_ops: keyUsages
										};

										if (publicKeyInfo.algorithm.algorithmId !== "1.2.840.10045.2.1") return Promise.reject('Incorrect public key algorithm: ' + publicKeyInfo.algorithm.algorithmId);

										var _publicKeyJSON = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion11 = true;
										var _didIteratorError11 = false;
										var _iteratorError11 = undefined;

										try {
											for (var _iterator11 = Object.keys(_publicKeyJSON)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
												var _key3 = _step11.value;

												jwk[_key3] = _publicKeyJSON[_key3];
											}
										} catch (err) {
											_didIteratorError11 = true;
											_iteratorError11 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion11 && _iterator11.return) {
													_iterator11.return();
												}
											} finally {
												if (_didIteratorError11) {
													throw _iteratorError11;
												}
											}
										}
									}
									break;
								case "RSA-OAEP":
									{
										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (this.name.toLowerCase() === "safari") jwk.alg = "RSA-OAEP";else {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RSA-OAEP";
													break;
												case "SHA-256":
													jwk.alg = "RSA-OAEP-256";
													break;
												case "SHA-384":
													jwk.alg = "RSA-OAEP-384";
													break;
												case "SHA-512":
													jwk.alg = "RSA-OAEP-512";
													break;
												default:
													return Promise.reject('Incorrect public key algorithm: ' + publicKeyInfo.algorithm.algorithmId);
											}
										}

										var _publicKeyJSON2 = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion12 = true;
										var _didIteratorError12 = false;
										var _iteratorError12 = undefined;

										try {
											for (var _iterator12 = Object.keys(_publicKeyJSON2)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
												var _key4 = _step12.value;

												jwk[_key4] = _publicKeyJSON2[_key4];
											}
										} catch (err) {
											_didIteratorError12 = true;
											_iteratorError12 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion12 && _iterator12.return) {
													_iterator12.return();
												}
											} finally {
												if (_didIteratorError12) {
													throw _iteratorError12;
												}
											}
										}
									}
									break;
								default:
									return Promise.reject('Incorrect algorithm name: ' + algorithm.name.toUpperCase());
							}
						}
						break;
					case "pkcs8":
						{
							var privateKeyInfo = new PrivateKeyInfo();

							var _asn = fromBER(keyData);
							if (_asn.offset === -1) return Promise.reject("Incorrect keyData");

							try {
								privateKeyInfo.fromSchema(_asn.result);
							} catch (ex) {
								return Promise.reject("Incorrect keyData");
							}

							if ("parsedKey" in privateKeyInfo === false) return Promise.reject("Incorrect keyData");

							switch (algorithm.name.toUpperCase()) {
								case "RSA-PSS":
									{
										switch (algorithm.hash.name.toUpperCase()) {
											case "SHA-1":
												jwk.alg = "PS1";
												break;
											case "SHA-256":
												jwk.alg = "PS256";
												break;
											case "SHA-384":
												jwk.alg = "PS384";
												break;
											case "SHA-512":
												jwk.alg = "PS512";
												break;
											default:
												return Promise.reject('Incorrect hash algorithm: ' + algorithm.hash.name.toUpperCase());
										}
									}

								case "RSASSA-PKCS1-V1_5":
									{
										keyUsages = ["sign"];

										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.113549.1.1.1") return Promise.reject('Incorrect private key algorithm: ' + privateKeyInfo.privateKeyAlgorithm.algorithmId);

										if ("alg" in jwk === false) {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RS1";
													break;
												case "SHA-256":
													jwk.alg = "RS256";
													break;
												case "SHA-384":
													jwk.alg = "RS384";
													break;
												case "SHA-512":
													jwk.alg = "RS512";
													break;
												default:
													return Promise.reject('Incorrect hash algorithm: ' + algorithm.hash.name.toUpperCase());
											}
										}

										var privateKeyJSON = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion13 = true;
										var _didIteratorError13 = false;
										var _iteratorError13 = undefined;

										try {
											for (var _iterator13 = Object.keys(privateKeyJSON)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
												var _key5 = _step13.value;

												jwk[_key5] = privateKeyJSON[_key5];
											}
										} catch (err) {
											_didIteratorError13 = true;
											_iteratorError13 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion13 && _iterator13.return) {
													_iterator13.return();
												}
											} finally {
												if (_didIteratorError13) {
													throw _iteratorError13;
												}
											}
										}
									}
									break;
								case "ECDSA":
									keyUsages = ["sign"];
								case "ECDH":
									{
										jwk = {
											kty: "EC",
											ext: extractable,
											key_ops: keyUsages
										};

										if (privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.10045.2.1") return Promise.reject('Incorrect algorithm: ' + privateKeyInfo.privateKeyAlgorithm.algorithmId);

										var _privateKeyJSON = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion14 = true;
										var _didIteratorError14 = false;
										var _iteratorError14 = undefined;

										try {
											for (var _iterator14 = Object.keys(_privateKeyJSON)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
												var _key6 = _step14.value;

												jwk[_key6] = _privateKeyJSON[_key6];
											}
										} catch (err) {
											_didIteratorError14 = true;
											_iteratorError14 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion14 && _iterator14.return) {
													_iterator14.return();
												}
											} finally {
												if (_didIteratorError14) {
													throw _iteratorError14;
												}
											}
										}
									}
									break;
								case "RSA-OAEP":
									{
										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (this.name.toLowerCase() === "safari") jwk.alg = "RSA-OAEP";else {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RSA-OAEP";
													break;
												case "SHA-256":
													jwk.alg = "RSA-OAEP-256";
													break;
												case "SHA-384":
													jwk.alg = "RSA-OAEP-384";
													break;
												case "SHA-512":
													jwk.alg = "RSA-OAEP-512";
													break;
												default:
													return Promise.reject('Incorrect hash algorithm: ' + algorithm.hash.name.toUpperCase());
											}
										}

										var _privateKeyJSON2 = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion15 = true;
										var _didIteratorError15 = false;
										var _iteratorError15 = undefined;

										try {
											for (var _iterator15 = Object.keys(_privateKeyJSON2)[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
												var _key7 = _step15.value;

												jwk[_key7] = _privateKeyJSON2[_key7];
											}
										} catch (err) {
											_didIteratorError15 = true;
											_iteratorError15 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion15 && _iterator15.return) {
													_iterator15.return();
												}
											} finally {
												if (_didIteratorError15) {
													throw _iteratorError15;
												}
											}
										}
									}
									break;
								default:
									return Promise.reject('Incorrect algorithm name: ' + algorithm.name.toUpperCase());
							}
						}
						break;
					case "jwk":
						jwk = keyData;
						break;
					default:
						return Promise.reject('Incorrect format: ' + format);
				}

				if (this.name.toLowerCase() === "safari") {
					return Promise.resolve().then(function () {
						return _this52.subtle.importKey("jwk", stringToArrayBuffer(JSON.stringify(jwk)), algorithm, extractable, keyUsages);
					}).then(function (result) {
						return result;
					}, function () {
						return _this52.subtle.importKey("jwk", jwk, algorithm, extractable, keyUsages);
					});
				}


				return this.subtle.importKey("jwk", jwk, algorithm, extractable, keyUsages);
			}
		}, {
			key: 'exportKey',
			value: function exportKey(format, key) {
				var sequence = this.subtle.exportKey("jwk", key);

				if (this.name.toLowerCase() === "safari") {
					sequence = sequence.then(function (result) {
						if (result instanceof ArrayBuffer) return JSON.parse(arrayBufferToString(result));

						return result;
					});
				}


				switch (format.toLowerCase()) {
					case "raw":
						return this.subtle.exportKey("raw", key);
					case "spki":
						sequence = sequence.then(function (result) {
							var publicKeyInfo = new PublicKeyInfo();

							try {
								publicKeyInfo.fromJSON(result);
							} catch (ex) {
								return Promise.reject("Incorrect key data");
							}

							return publicKeyInfo.toSchema().toBER(false);
						});
						break;
					case "pkcs8":
						sequence = sequence.then(function (result) {
							var privateKeyInfo = new PrivateKeyInfo();

							try {
								privateKeyInfo.fromJSON(result);
							} catch (ex) {
								return Promise.reject("Incorrect key data");
							}

							return privateKeyInfo.toSchema().toBER(false);
						});
						break;
					case "jwk":
						break;
					default:
						return Promise.reject('Incorrect format: ' + format);
				}

				return sequence;
			}
		}, {
			key: 'convert',
			value: function convert(inputFormat, outputFormat, keyData, algorithm, extractable, keyUsages) {
				var _this53 = this;

				switch (inputFormat.toLowerCase()) {
					case "raw":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve(keyData);
							case "spki":
								return Promise.resolve().then(function () {
									return _this53.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("spki", result);
								});
							case "pkcs8":
								return Promise.resolve().then(function () {
									return _this53.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("pkcs8", result);
								});
							case "jwk":
								return Promise.resolve().then(function () {
									return _this53.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("jwk", result);
								});
							default:
								return Promise.reject('Incorrect outputFormat: ' + outputFormat);
						}
					case "spki":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this53.importKey("spki", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("raw", result);
								});
							case "spki":
								return Promise.resolve(keyData);
							case "pkcs8":
								return Promise.reject("Impossible to convert between SPKI/PKCS8");
							case "jwk":
								return Promise.resolve().then(function () {
									return _this53.importKey("spki", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("jwk", result);
								});
							default:
								return Promise.reject('Incorrect outputFormat: ' + outputFormat);
						}
					case "pkcs8":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this53.importKey("pkcs8", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("raw", result);
								});
							case "spki":
								return Promise.reject("Impossible to convert between SPKI/PKCS8");
							case "pkcs8":
								return Promise.resolve(keyData);
							case "jwk":
								return Promise.resolve().then(function () {
									return _this53.importKey("pkcs8", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("jwk", result);
								});
							default:
								return Promise.reject('Incorrect outputFormat: ' + outputFormat);
						}
					case "jwk":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this53.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("raw", result);
								});
							case "spki":
								return Promise.resolve().then(function () {
									return _this53.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("spki", result);
								});
							case "pkcs8":
								return Promise.resolve().then(function () {
									return _this53.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this53.exportKey("pkcs8", result);
								});
							case "jwk":
								return Promise.resolve(keyData);
							default:
								return Promise.reject('Incorrect outputFormat: ' + outputFormat);
						}
					default:
						return Promise.reject('Incorrect inputFormat: ' + inputFormat);
				}
			}
		}, {
			key: 'encrypt',
			value: function encrypt() {
				var _subtle;

				return (_subtle = this.subtle).encrypt.apply(_subtle, arguments);
			}
		}, {
			key: 'decrypt',
			value: function decrypt() {
				var _subtle2;

				return (_subtle2 = this.subtle).decrypt.apply(_subtle2, arguments);
			}
		}, {
			key: 'sign',
			value: function sign() {
				var _subtle3;

				return (_subtle3 = this.subtle).sign.apply(_subtle3, arguments);
			}
		}, {
			key: 'verify',
			value: function verify() {
				var _subtle4;

				return (_subtle4 = this.subtle).verify.apply(_subtle4, arguments);
			}
		}, {
			key: 'digest',
			value: function digest() {
				var _subtle5;

				return (_subtle5 = this.subtle).digest.apply(_subtle5, arguments);
			}
		}, {
			key: 'generateKey',
			value: function generateKey() {
				var _subtle6;

				return (_subtle6 = this.subtle).generateKey.apply(_subtle6, arguments);
			}
		}, {
			key: 'deriveKey',
			value: function deriveKey() {
				var _subtle7;

				return (_subtle7 = this.subtle).deriveKey.apply(_subtle7, arguments);
			}
		}, {
			key: 'deriveBits',
			value: function deriveBits() {
				var _subtle8;

				return (_subtle8 = this.subtle).deriveBits.apply(_subtle8, arguments);
			}
		}, {
			key: 'wrapKey',
			value: function wrapKey() {
				var _subtle9;

				return (_subtle9 = this.subtle).wrapKey.apply(_subtle9, arguments);
			}
		}, {
			key: 'unwrapKey',
			value: function unwrapKey() {
				var _subtle10;

				return (_subtle10 = this.subtle).unwrapKey.apply(_subtle10, arguments);
			}
		}, {
			key: 'getRandomValues',
			value: function getRandomValues(view) {
				if ("getRandomValues" in this.crypto === false) throw new Error("No support for getRandomValues");

				return this.crypto.getRandomValues(view);
			}
		}, {
			key: 'getAlgorithmByOID',
			value: function getAlgorithmByOID(oid) {
				switch (oid) {
					case "1.2.840.113549.1.1.1":
					case "1.2.840.113549.1.1.5":
						return {
							name: "RSASSA-PKCS1-v1_5",
							hash: {
								name: "SHA-1"
							}
						};
					case "1.2.840.113549.1.1.11":
						return {
							name: "RSASSA-PKCS1-v1_5",
							hash: {
								name: "SHA-256"
							}
						};
					case "1.2.840.113549.1.1.12":
						return {
							name: "RSASSA-PKCS1-v1_5",
							hash: {
								name: "SHA-384"
							}
						};
					case "1.2.840.113549.1.1.13":
						return {
							name: "RSASSA-PKCS1-v1_5",
							hash: {
								name: "SHA-512"
							}
						};
					case "1.2.840.113549.1.1.10":
						return {
							name: "RSA-PSS"
						};
					case "1.2.840.113549.1.1.7":
						return {
							name: "RSA-OAEP"
						};
					case "1.2.840.10045.2.1":
					case "1.2.840.10045.4.1":
						return {
							name: "ECDSA",
							hash: {
								name: "SHA-1"
							}
						};
					case "1.2.840.10045.4.3.2":
						return {
							name: "ECDSA",
							hash: {
								name: "SHA-256"
							}
						};
					case "1.2.840.10045.4.3.3":
						return {
							name: "ECDSA",
							hash: {
								name: "SHA-384"
							}
						};
					case "1.2.840.10045.4.3.4":
						return {
							name: "ECDSA",
							hash: {
								name: "SHA-512"
							}
						};
					case "1.3.133.16.840.63.0.2":
						return {
							name: "ECDH",
							kdf: "SHA-1"
						};
					case "1.3.132.1.11.1":
						return {
							name: "ECDH",
							kdf: "SHA-256"
						};
					case "1.3.132.1.11.2":
						return {
							name: "ECDH",
							kdf: "SHA-384"
						};
					case "1.3.132.1.11.3":
						return {
							name: "ECDH",
							kdf: "SHA-512"
						};
					case "2.16.840.1.101.3.4.1.2":
						return {
							name: "AES-CBC",
							length: 128
						};
					case "2.16.840.1.101.3.4.1.22":
						return {
							name: "AES-CBC",
							length: 192
						};
					case "2.16.840.1.101.3.4.1.42":
						return {
							name: "AES-CBC",
							length: 256
						};
					case "2.16.840.1.101.3.4.1.6":
						return {
							name: "AES-GCM",
							length: 128
						};
					case "2.16.840.1.101.3.4.1.26":
						return {
							name: "AES-GCM",
							length: 192
						};
					case "2.16.840.1.101.3.4.1.46":
						return {
							name: "AES-GCM",
							length: 256
						};
					case "2.16.840.1.101.3.4.1.4":
						return {
							name: "AES-CFB",
							length: 128
						};
					case "2.16.840.1.101.3.4.1.24":
						return {
							name: "AES-CFB",
							length: 192
						};
					case "2.16.840.1.101.3.4.1.44":
						return {
							name: "AES-CFB",
							length: 256
						};
					case "2.16.840.1.101.3.4.1.5":
						return {
							name: "AES-KW",
							length: 128
						};
					case "2.16.840.1.101.3.4.1.25":
						return {
							name: "AES-KW",
							length: 192
						};
					case "2.16.840.1.101.3.4.1.45":
						return {
							name: "AES-KW",
							length: 256
						};
					case "1.2.840.113549.2.7":
						return {
							name: "HMAC",
							hash: {
								name: "SHA-1"
							}
						};
					case "1.2.840.113549.2.9":
						return {
							name: "HMAC",
							hash: {
								name: "SHA-256"
							}
						};
					case "1.2.840.113549.2.10":
						return {
							name: "HMAC",
							hash: {
								name: "SHA-384"
							}
						};
					case "1.2.840.113549.2.11":
						return {
							name: "HMAC",
							hash: {
								name: "SHA-512"
							}
						};
					case "1.2.840.113549.1.9.16.3.5":
						return {
							name: "DH"
						};
					case "1.3.14.3.2.26":
						return {
							name: "SHA-1"
						};
					case "2.16.840.1.101.3.4.2.1":
						return {
							name: "SHA-256"
						};
					case "2.16.840.1.101.3.4.2.2":
						return {
							name: "SHA-384"
						};
					case "2.16.840.1.101.3.4.2.3":
						return {
							name: "SHA-512"
						};
					case "1.2.840.113549.1.5.12":
						return {
							name: "PBKDF2"
						};

					case "1.2.840.10045.3.1.7":
						return {
							name: "P-256"
						};
					case "1.3.132.0.34":
						return {
							name: "P-384"
						};
					case "1.3.132.0.35":
						return {
							name: "P-521"
						};

					default:
				}

				return {};
			}
		}, {
			key: 'getOIDByAlgorithm',
			value: function getOIDByAlgorithm(algorithm) {
				var result = "";

				switch (algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
						switch (algorithm.hash.name.toUpperCase()) {
							case "SHA-1":
								result = "1.2.840.113549.1.1.5";
								break;
							case "SHA-256":
								result = "1.2.840.113549.1.1.11";
								break;
							case "SHA-384":
								result = "1.2.840.113549.1.1.12";
								break;
							case "SHA-512":
								result = "1.2.840.113549.1.1.13";
								break;
							default:
						}
						break;
					case "RSA-PSS":
						result = "1.2.840.113549.1.1.10";
						break;
					case "RSA-OAEP":
						result = "1.2.840.113549.1.1.7";
						break;
					case "ECDSA":
						switch (algorithm.hash.name.toUpperCase()) {
							case "SHA-1":
								result = "1.2.840.10045.4.1";
								break;
							case "SHA-256":
								result = "1.2.840.10045.4.3.2";
								break;
							case "SHA-384":
								result = "1.2.840.10045.4.3.3";
								break;
							case "SHA-512":
								result = "1.2.840.10045.4.3.4";
								break;
							default:
						}
						break;
					case "ECDH":
						switch (algorithm.kdf.toUpperCase()) {
							case "SHA-1":
								result = "1.3.133.16.840.63.0.2";
								break;
							case "SHA-256":
								result = "1.3.132.1.11.1";
								break;
							case "SHA-384":
								result = "1.3.132.1.11.2";
								break;
							case "SHA-512":
								result = "1.3.132.1.11.3";
								break;
							default:
						}
						break;
					case "AES-CTR":
						break;
					case "AES-CBC":
						switch (algorithm.length) {
							case 128:
								result = "2.16.840.1.101.3.4.1.2";
								break;
							case 192:
								result = "2.16.840.1.101.3.4.1.22";
								break;
							case 256:
								result = "2.16.840.1.101.3.4.1.42";
								break;
							default:
						}
						break;
					case "AES-CMAC":
						break;
					case "AES-GCM":
						switch (algorithm.length) {
							case 128:
								result = "2.16.840.1.101.3.4.1.6";
								break;
							case 192:
								result = "2.16.840.1.101.3.4.1.26";
								break;
							case 256:
								result = "2.16.840.1.101.3.4.1.46";
								break;
							default:
						}
						break;
					case "AES-CFB":
						switch (algorithm.length) {
							case 128:
								result = "2.16.840.1.101.3.4.1.4";
								break;
							case 192:
								result = "2.16.840.1.101.3.4.1.24";
								break;
							case 256:
								result = "2.16.840.1.101.3.4.1.44";
								break;
							default:
						}
						break;
					case "AES-KW":
						switch (algorithm.length) {
							case 128:
								result = "2.16.840.1.101.3.4.1.5";
								break;
							case 192:
								result = "2.16.840.1.101.3.4.1.25";
								break;
							case 256:
								result = "2.16.840.1.101.3.4.1.45";
								break;
							default:
						}
						break;
					case "HMAC":
						switch (algorithm.hash.name.toUpperCase()) {
							case "SHA-1":
								result = "1.2.840.113549.2.7";
								break;
							case "SHA-256":
								result = "1.2.840.113549.2.9";
								break;
							case "SHA-384":
								result = "1.2.840.113549.2.10";
								break;
							case "SHA-512":
								result = "1.2.840.113549.2.11";
								break;
							default:
						}
						break;
					case "DH":
						result = "1.2.840.113549.1.9.16.3.5";
						break;
					case "SHA-1":
						result = "1.3.14.3.2.26";
						break;
					case "SHA-256":
						result = "2.16.840.1.101.3.4.2.1";
						break;
					case "SHA-384":
						result = "2.16.840.1.101.3.4.2.2";
						break;
					case "SHA-512":
						result = "2.16.840.1.101.3.4.2.3";
						break;
					case "CONCAT":
						break;
					case "HKDF":
						break;
					case "PBKDF2":
						result = "1.2.840.113549.1.5.12";
						break;

					case "P-256":
						result = "1.2.840.10045.3.1.7";
						break;
					case "P-384":
						result = "1.3.132.0.34";
						break;
					case "P-521":
						result = "1.3.132.0.35";
						break;

					default:
				}

				return result;
			}
		}, {
			key: 'getAlgorithmParameters',
			value: function getAlgorithmParameters(algorithmName, operation) {
				var result = {
					algorithm: {},
					usages: []
				};

				switch (algorithmName.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
						switch (operation.toLowerCase()) {
							case "generatekey":
								result = {
									algorithm: {
										name: "RSASSA-PKCS1-v1_5",
										modulusLength: 2048,
										publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
										hash: {
											name: "SHA-256"
										}
									},
									usages: ["sign", "verify"]
								};
								break;
							case "verify":
							case "sign":
							case "importkey":
								result = {
									algorithm: {
										name: "RSASSA-PKCS1-v1_5",
										hash: {
											name: "SHA-256"
										}
									},
									usages: ["verify"] };
								break;
							case "exportkey":
							default:
								return {
									algorithm: {
										name: "RSASSA-PKCS1-v1_5"
									},
									usages: []
								};
						}
						break;
					case "RSA-PSS":
						switch (operation.toLowerCase()) {
							case "sign":
							case "verify":
								result = {
									algorithm: {
										name: "RSA-PSS",
										hash: {
											name: "SHA-1"
										},
										saltLength: 20
									},
									usages: ["sign", "verify"]
								};
								break;
							case "generatekey":
								result = {
									algorithm: {
										name: "RSA-PSS",
										modulusLength: 2048,
										publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
										hash: {
											name: "SHA-1"
										}
									},
									usages: ["sign", "verify"]
								};
								break;
							case "importkey":
								result = {
									algorithm: {
										name: "RSA-PSS",
										hash: {
											name: "SHA-1"
										}
									},
									usages: ["verify"] };
								break;
							case "exportkey":
							default:
								return {
									algorithm: {
										name: "RSA-PSS"
									},
									usages: []
								};
						}
						break;
					case "RSA-OAEP":
						switch (operation.toLowerCase()) {
							case "encrypt":
							case "decrypt":
								result = {
									algorithm: {
										name: "RSA-OAEP"
									},
									usages: ["encrypt", "decrypt"]
								};
								break;
							case "generatekey":
								result = {
									algorithm: {
										name: "RSA-OAEP",
										modulusLength: 2048,
										publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
										hash: {
											name: "SHA-256"
										}
									},
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							case "importkey":
								result = {
									algorithm: {
										name: "RSA-OAEP",
										hash: {
											name: "SHA-256"
										}
									},
									usages: ["encrypt"] };
								break;
							case "exportkey":
							default:
								return {
									algorithm: {
										name: "RSA-OAEP"
									},
									usages: []
								};
						}
						break;
					case "ECDSA":
						switch (operation.toLowerCase()) {
							case "generatekey":
								result = {
									algorithm: {
										name: "ECDSA",
										namedCurve: "P-256"
									},
									usages: ["sign", "verify"]
								};
								break;
							case "importkey":
								result = {
									algorithm: {
										name: "ECDSA",
										namedCurve: "P-256"
									},
									usages: ["verify"] };
								break;
							case "verify":
							case "sign":
								result = {
									algorithm: {
										name: "ECDSA",
										hash: {
											name: "SHA-256"
										}
									},
									usages: ["sign"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "ECDSA"
									},
									usages: []
								};
						}
						break;
					case "ECDH":
						switch (operation.toLowerCase()) {
							case "exportkey":
							case "importkey":
							case "generatekey":
								result = {
									algorithm: {
										name: "ECDH",
										namedCurve: "P-256"
									},
									usages: ["deriveKey", "deriveBits"]
								};
								break;
							case "derivekey":
							case "derivebits":
								result = {
									algorithm: {
										name: "ECDH",
										namedCurve: "P-256",
										public: [] },
									usages: ["encrypt", "decrypt"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "ECDH"
									},
									usages: []
								};
						}
						break;
					case "AES-CTR":
						switch (operation.toLowerCase()) {
							case "importkey":
							case "exportkey":
							case "generatekey":
								result = {
									algorithm: {
										name: "AES-CTR",
										length: 256
									},
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							case "decrypt":
							case "encrypt":
								result = {
									algorithm: {
										name: "AES-CTR",
										counter: new Uint8Array(16),
										length: 10
									},
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "AES-CTR"
									},
									usages: []
								};
						}
						break;
					case "AES-CBC":
						switch (operation.toLowerCase()) {
							case "importkey":
							case "exportkey":
							case "generatekey":
								result = {
									algorithm: {
										name: "AES-CBC",
										length: 256
									},
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							case "decrypt":
							case "encrypt":
								result = {
									algorithm: {
										name: "AES-CBC",
										iv: this.getRandomValues(new Uint8Array(16)) },
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "AES-CBC"
									},
									usages: []
								};
						}
						break;
					case "AES-GCM":
						switch (operation.toLowerCase()) {
							case "importkey":
							case "exportkey":
							case "generatekey":
								result = {
									algorithm: {
										name: "AES-GCM",
										length: 256
									},
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							case "decrypt":
							case "encrypt":
								result = {
									algorithm: {
										name: "AES-GCM",
										iv: this.getRandomValues(new Uint8Array(16)) },
									usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "AES-GCM"
									},
									usages: []
								};
						}
						break;
					case "AES-KW":
						switch (operation.toLowerCase()) {
							case "importkey":
							case "exportkey":
							case "generatekey":
							case "wrapkey":
							case "unwrapkey":
								result = {
									algorithm: {
										name: "AES-KW",
										length: 256
									},
									usages: ["wrapKey", "unwrapKey"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "AES-KW"
									},
									usages: []
								};
						}
						break;
					case "HMAC":
						switch (operation.toLowerCase()) {
							case "sign":
							case "verify":
								result = {
									algorithm: {
										name: "HMAC"
									},
									usages: ["sign", "verify"]
								};
								break;
							case "importkey":
							case "exportkey":
							case "generatekey":
								result = {
									algorithm: {
										name: "HMAC",
										length: 32,
										hash: {
											name: "SHA-256"
										}
									},
									usages: ["sign", "verify"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "HMAC"
									},
									usages: []
								};
						}
						break;
					case "HKDF":
						switch (operation.toLowerCase()) {
							case "derivekey":
								result = {
									algorithm: {
										name: "HKDF",
										hash: "SHA-256",
										salt: new Uint8Array([]),
										info: new Uint8Array([])
									},
									usages: ["encrypt", "decrypt"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "HKDF"
									},
									usages: []
								};
						}
						break;
					case "PBKDF2":
						switch (operation.toLowerCase()) {
							case "derivekey":
								result = {
									algorithm: {
										name: "PBKDF2",
										hash: { name: "SHA-256" },
										salt: new Uint8Array([]),
										iterations: 10000
									},
									usages: ["encrypt", "decrypt"]
								};
								break;
							default:
								return {
									algorithm: {
										name: "PBKDF2"
									},
									usages: []
								};
						}
						break;
					default:
				}

				return result;
			}
		}, {
			key: 'getHashAlgorithm',
			value: function getHashAlgorithm(signatureAlgorithm) {
				var result = "";

				switch (signatureAlgorithm.algorithmId) {
					case "1.2.840.10045.4.1":
					case "1.2.840.113549.1.1.5":
						result = "SHA-1";
						break;
					case "1.2.840.10045.4.3.2":
					case "1.2.840.113549.1.1.11":
						result = "SHA-256";
						break;
					case "1.2.840.10045.4.3.3":
					case "1.2.840.113549.1.1.12":
						result = "SHA-384";
						break;
					case "1.2.840.10045.4.3.4":
					case "1.2.840.113549.1.1.13":
						result = "SHA-512";
						break;
					case "1.2.840.113549.1.1.10":
						{
							try {
								var params = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
								if ("hashAlgorithm" in params) {
									var algorithm = this.getAlgorithmByOID(params.hashAlgorithm.algorithmId);
									if ("name" in algorithm === false) return "";

									result = algorithm.name;
								} else result = "SHA-1";
							} catch (ex) {}
						}
						break;
					default:
				}

				return result;
			}
		}, {
			key: 'encryptEncryptedContentInfo',
			value: function encryptEncryptedContentInfo(parameters) {
				var _this54 = this;

				if (parameters instanceof Object === false) return Promise.reject("Parameters must have type \"Object\"");

				if ("password" in parameters === false) return Promise.reject("Absent mandatory parameter \"password\"");

				if ("contentEncryptionAlgorithm" in parameters === false) return Promise.reject("Absent mandatory parameter \"contentEncryptionAlgorithm\"");

				if ("hmacHashAlgorithm" in parameters === false) return Promise.reject("Absent mandatory parameter \"hmacHashAlgorithm\"");

				if ("iterationCount" in parameters === false) return Promise.reject("Absent mandatory parameter \"iterationCount\"");

				if ("contentToEncrypt" in parameters === false) return Promise.reject("Absent mandatory parameter \"contentToEncrypt\"");

				if ("contentType" in parameters === false) return Promise.reject("Absent mandatory parameter \"contentType\"");

				var contentEncryptionOID = this.getOIDByAlgorithm(parameters.contentEncryptionAlgorithm);
				if (contentEncryptionOID === "") return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");

				var pbkdf2OID = this.getOIDByAlgorithm({
					name: "PBKDF2"
				});
				if (pbkdf2OID === "") return Promise.reject("Can not find OID for PBKDF2");

				var hmacOID = this.getOIDByAlgorithm({
					name: "HMAC",
					hash: {
						name: parameters.hmacHashAlgorithm
					}
				});
				if (hmacOID === "") return Promise.reject('Incorrect value for "hmacHashAlgorithm": ' + parameters.hmacHashAlgorithm);

				var sequence = Promise.resolve();

				var ivBuffer = new ArrayBuffer(16);
				var ivView = new Uint8Array(ivBuffer);
				this.getRandomValues(ivView);

				var saltBuffer = new ArrayBuffer(64);
				var saltView = new Uint8Array(saltBuffer);
				this.getRandomValues(saltView);

				var contentView = new Uint8Array(parameters.contentToEncrypt);

				var pbkdf2Params = new PBKDF2Params({
					salt: new OctetString({ valueHex: saltBuffer }),
					iterationCount: parameters.iterationCount,
					prf: new AlgorithmIdentifier({
						algorithmId: hmacOID,
						algorithmParams: new Null()
					})
				});

				sequence = sequence.then(function () {
					var passwordView = new Uint8Array(parameters.password);

					return _this54.importKey("raw", passwordView, "PBKDF2", false, ["deriveKey"]);
				}, function (error) {
					return Promise.reject(error);
				});

				sequence = sequence.then(function (result) {
					return _this54.deriveKey({
						name: "PBKDF2",
						hash: {
							name: parameters.hmacHashAlgorithm
						},
						salt: saltView,
						iterations: parameters.iterationCount
					}, result, parameters.contentEncryptionAlgorithm, false, ["encrypt"]);
				}, function (error) {
					return Promise.reject(error);
				});

				sequence = sequence.then(function (result) {
					return _this54.encrypt({
						name: parameters.contentEncryptionAlgorithm.name,
						iv: ivView
					}, result, contentView);
				}, function (error) {
					return Promise.reject(error);
				});

				sequence = sequence.then(function (result) {
					var pbes2Parameters = new PBES2Params({
						keyDerivationFunc: new AlgorithmIdentifier({
							algorithmId: pbkdf2OID,
							algorithmParams: pbkdf2Params.toSchema()
						}),
						encryptionScheme: new AlgorithmIdentifier({
							algorithmId: contentEncryptionOID,
							algorithmParams: new OctetString({ valueHex: ivBuffer })
						})
					});

					return new EncryptedContentInfo({
						contentType: parameters.contentType,
						contentEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.5.13",
							algorithmParams: pbes2Parameters.toSchema()
						}),
						encryptedContent: new OctetString({ valueHex: result })
					});
				}, function (error) {
					return Promise.reject(error);
				});


				return sequence;
			}
		}, {
			key: 'decryptEncryptedContentInfo',
			value: function decryptEncryptedContentInfo(parameters) {
				var _this55 = this;

				if (parameters instanceof Object === false) return Promise.reject("Parameters must have type \"Object\"");

				if ("password" in parameters === false) return Promise.reject("Absent mandatory parameter \"password\"");

				if ("encryptedContentInfo" in parameters === false) return Promise.reject("Absent mandatory parameter \"encryptedContentInfo\"");

				if (parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId !== "1.2.840.113549.1.5.13") return Promise.reject('Unknown "contentEncryptionAlgorithm": ' + parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);

				var sequence = Promise.resolve();

				var pbes2Parameters = void 0;

				try {
					pbes2Parameters = new PBES2Params({ schema: parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams });
				} catch (ex) {
					return Promise.reject("Incorrectly encoded \"pbes2Parameters\"");
				}

				var pbkdf2Params = void 0;

				try {
					pbkdf2Params = new PBKDF2Params({ schema: pbes2Parameters.keyDerivationFunc.algorithmParams });
				} catch (ex) {
					return Promise.reject("Incorrectly encoded \"pbkdf2Params\"");
				}

				var contentEncryptionAlgorithm = this.getAlgorithmByOID(pbes2Parameters.encryptionScheme.algorithmId);
				if ("name" in contentEncryptionAlgorithm === false) return Promise.reject('Incorrect OID for "contentEncryptionAlgorithm": ' + pbes2Parameters.encryptionScheme.algorithmId);

				var ivBuffer = pbes2Parameters.encryptionScheme.algorithmParams.valueBlock.valueHex;
				var ivView = new Uint8Array(ivBuffer);

				var saltBuffer = pbkdf2Params.salt.valueBlock.valueHex;
				var saltView = new Uint8Array(saltBuffer);

				var iterationCount = pbkdf2Params.iterationCount;

				var hmacHashAlgorithm = "SHA-1";

				if ("prf" in pbkdf2Params) {
					var algorithm = this.getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
					if ("name" in algorithm === false) return Promise.reject("Incorrect OID for HMAC hash algorithm");

					hmacHashAlgorithm = algorithm.hash.name;
				}

				sequence = sequence.then(function () {
					return _this55.importKey("raw", parameters.password, "PBKDF2", false, ["deriveKey"]);
				}, function (error) {
					return Promise.reject(error);
				});

				sequence = sequence.then(function (result) {
					return _this55.deriveKey({
						name: "PBKDF2",
						hash: {
							name: hmacHashAlgorithm
						},
						salt: saltView,
						iterations: iterationCount
					}, result, contentEncryptionAlgorithm, false, ["decrypt"]);
				}, function (error) {
					return Promise.reject(error);
				});

				sequence = sequence.then(function (result) {
					var dataBuffer = new ArrayBuffer(0);

					if (parameters.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false) dataBuffer = parameters.encryptedContentInfo.encryptedContent.valueBlock.valueHex;else {
						var _iteratorNormalCompletion16 = true;
						var _didIteratorError16 = false;
						var _iteratorError16 = undefined;

						try {
							for (var _iterator16 = parameters.encryptedContentInfo.encryptedContent.valueBlock.value[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
								var content = _step16.value;

								dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
							}
						} catch (err) {
							_didIteratorError16 = true;
							_iteratorError16 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion16 && _iterator16.return) {
									_iterator16.return();
								}
							} finally {
								if (_didIteratorError16) {
									throw _iteratorError16;
								}
							}
						}
					}


					return _this55.decrypt({
						name: contentEncryptionAlgorithm.name,
						iv: ivView
					}, result, dataBuffer);
				}, function (error) {
					return Promise.reject(error);
				});


				return sequence;
			}
		}, {
			key: 'stampDataWithPassword',
			value: function stampDataWithPassword(parameters) {
				var _this56 = this;

				if (parameters instanceof Object === false) return Promise.reject("Parameters must have type \"Object\"");

				if ("password" in parameters === false) return Promise.reject("Absent mandatory parameter \"password\"");

				if ("hashAlgorithm" in parameters === false) return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");

				if ("salt" in parameters === false) return Promise.reject("Absent mandatory parameter \"iterationCount\"");

				if ("iterationCount" in parameters === false) return Promise.reject("Absent mandatory parameter \"salt\"");

				if ("contentToStamp" in parameters === false) return Promise.reject("Absent mandatory parameter \"contentToStamp\"");

				var length = void 0;

				switch (parameters.hashAlgorithm.toLowerCase()) {
					case "sha-1":
						length = 160;
						break;
					case "sha-256":
						length = 256;
						break;
					case "sha-384":
						length = 384;
						break;
					case "sha-512":
						length = 512;
						break;
					default:
						return Promise.reject('Incorrect "parameters.hashAlgorithm" parameter: ' + parameters.hashAlgorithm);
				}

				var sequence = Promise.resolve();

				var hmacAlgorithm = {
					name: "HMAC",
					length: length,
					hash: {
						name: parameters.hashAlgorithm
					}
				};

				sequence = sequence.then(function () {
					return makePKCS12B2Key(_this56, parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount);
				});

				sequence = sequence.then(function (result) {
					return _this56.importKey("raw", new Uint8Array(result), hmacAlgorithm, false, ["sign"]);
				});

				sequence = sequence.then(function (result) {
					return _this56.sign(hmacAlgorithm, result, new Uint8Array(parameters.contentToStamp));
				}, function (error) {
					return Promise.reject(error);
				});


				return sequence;
			}
		}, {
			key: 'verifyDataStampedWithPassword',
			value: function verifyDataStampedWithPassword(parameters) {
				var _this57 = this;

				if (parameters instanceof Object === false) return Promise.reject("Parameters must have type \"Object\"");

				if ("password" in parameters === false) return Promise.reject("Absent mandatory parameter \"password\"");

				if ("hashAlgorithm" in parameters === false) return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");

				if ("salt" in parameters === false) return Promise.reject("Absent mandatory parameter \"iterationCount\"");

				if ("iterationCount" in parameters === false) return Promise.reject("Absent mandatory parameter \"salt\"");

				if ("contentToVerify" in parameters === false) return Promise.reject("Absent mandatory parameter \"contentToVerify\"");

				if ("signatureToVerify" in parameters === false) return Promise.reject("Absent mandatory parameter \"signatureToVerify\"");

				var length = void 0;

				switch (parameters.hashAlgorithm.toLowerCase()) {
					case "sha-1":
						length = 160;
						break;
					case "sha-256":
						length = 256;
						break;
					case "sha-384":
						length = 384;
						break;
					case "sha-512":
						length = 512;
						break;
					default:
						return Promise.reject('Incorrect "parameters.hashAlgorithm" parameter: ' + parameters.hashAlgorithm);
				}

				var sequence = Promise.resolve();

				var hmacAlgorithm = {
					name: "HMAC",
					length: length,
					hash: {
						name: parameters.hashAlgorithm
					}
				};

				sequence = sequence.then(function () {
					return makePKCS12B2Key(_this57, parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount);
				});

				sequence = sequence.then(function (result) {
					return _this57.importKey("raw", new Uint8Array(result), hmacAlgorithm, false, ["verify"]);
				});

				sequence = sequence.then(function (result) {
					return _this57.verify(hmacAlgorithm, result, new Uint8Array(parameters.signatureToVerify), new Uint8Array(parameters.contentToVerify));
				}, function (error) {
					return Promise.reject(error);
				});


				return sequence;
			}
		}, {
			key: 'getSignatureParameters',
			value: function getSignatureParameters(privateKey) {
				var hashAlgorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "SHA-1";

				var oid = this.getOIDByAlgorithm({ name: hashAlgorithm });
				if (oid === "") return Promise.reject('Unsupported hash algorithm: ' + hashAlgorithm);

				var signatureAlgorithm = new AlgorithmIdentifier();

				var parameters = this.getAlgorithmParameters(privateKey.algorithm.name, "sign");
				parameters.algorithm.hash.name = hashAlgorithm;

				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						signatureAlgorithm.algorithmId = this.getOIDByAlgorithm(parameters.algorithm);
						break;
					case "RSA-PSS":
						{
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									parameters.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									parameters.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									parameters.algorithm.saltLength = 64;
									break;
								default:
							}

							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								var hashAlgorithmOID = this.getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject('Unsupported hash algorithm: ' + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8",
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (parameters.algorithm.saltLength !== 20) paramsObject.saltLength = parameters.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);

							signatureAlgorithm.algorithmId = "1.2.840.113549.1.1.10";
							signatureAlgorithm.algorithmParams = pssParameters.toSchema();
						}
						break;
					default:
						return Promise.reject('Unsupported signature algorithm: ' + privateKey.algorithm.name);
				}


				return Promise.resolve().then(function () {
					return {
						signatureAlgorithm: signatureAlgorithm,
						parameters: parameters
					};
				});
			}
		}, {
			key: 'signWithPrivateKey',
			value: function signWithPrivateKey(data, privateKey, parameters) {
				return this.sign(parameters.algorithm, privateKey, new Uint8Array(data)).then(function (result) {
					if (parameters.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);


					return result;
				}, function (error) {
					return Promise.reject('Signing error: ' + error);
				});
			}
		}, {
			key: 'fillPublicKeyParameters',
			value: function fillPublicKeyParameters(publicKeyInfo, signatureAlgorithm) {
				var parameters = {};

				var shaAlgorithm = this.getHashAlgorithm(signatureAlgorithm);
				if (shaAlgorithm === "") return Promise.reject('Unsupported signature algorithm: ' + signatureAlgorithm.algorithmId);

				var algorithmId = void 0;
				if (signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = signatureAlgorithm.algorithmId;else algorithmId = publicKeyInfo.algorithm.algorithmId;

				var algorithmObject = this.getAlgorithmByOID(algorithmId);
				if ("name" in algorithmObject === "") return Promise.reject('Unsupported public key algorithm: ' + signatureAlgorithm.algorithmId);

				parameters.algorithm = this.getAlgorithmParameters(algorithmObject.name, "importkey");
				if ("hash" in parameters.algorithm.algorithm) parameters.algorithm.algorithm.hash.name = shaAlgorithm;

				if (algorithmObject.name === "ECDSA") {
					var algorithmParamsChecked = false;

					if ("algorithmParams" in publicKeyInfo.algorithm === true) {
						if ("idBlock" in publicKeyInfo.algorithm.algorithmParams) {
							if (publicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && publicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
						}
					}

					if (algorithmParamsChecked === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

					var curveObject = this.getAlgorithmByOID(publicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
					if ("name" in curveObject === false) return Promise.reject('Unsupported named curve algorithm: ' + publicKeyInfo.algorithm.algorithmParams.valueBlock.toString());


					parameters.algorithm.algorithm.namedCurve = curveObject.name;
				}


				return parameters;
			}
		}, {
			key: 'getPublicKey',
			value: function getPublicKey(publicKeyInfo, signatureAlgorithm) {
				var parameters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				if (parameters === null) parameters = this.fillPublicKeyParameters(publicKeyInfo, signatureAlgorithm);

				var publicKeyInfoSchema = publicKeyInfo.toSchema();
				var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
				var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

				return this.importKey("spki", publicKeyInfoView, parameters.algorithm.algorithm, true, parameters.algorithm.usages);
			}
		}, {
			key: 'verifyWithPublicKey',
			value: function verifyWithPublicKey(data, signature, publicKeyInfo, signatureAlgorithm) {
				var _this58 = this;

				var shaAlgorithm = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

				var sequence = Promise.resolve();

				if (shaAlgorithm === null) {
					shaAlgorithm = this.getHashAlgorithm(signatureAlgorithm);
					if (shaAlgorithm === "") return Promise.reject('Unsupported signature algorithm: ' + signatureAlgorithm.algorithmId);

					sequence = sequence.then(function () {
						return _this58.getPublicKey(publicKeyInfo, signatureAlgorithm);
					});
				} else {
					var parameters = {};

					var algorithmId = void 0;
					if (signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = signatureAlgorithm.algorithmId;else algorithmId = publicKeyInfo.algorithm.algorithmId;

					var algorithmObject = this.getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === "") return Promise.reject('Unsupported public key algorithm: ' + signatureAlgorithm.algorithmId);

					parameters.algorithm = this.getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in parameters.algorithm.algorithm) parameters.algorithm.algorithm.hash.name = shaAlgorithm;

					if (algorithmObject.name === "ECDSA") {
						var algorithmParamsChecked = false;

						if ("algorithmParams" in publicKeyInfo.algorithm === true) {
							if ("idBlock" in publicKeyInfo.algorithm.algorithmParams) {
								if (publicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1 && publicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6) algorithmParamsChecked = true;
							}
						}

						if (algorithmParamsChecked === false) return Promise.reject("Incorrect type for ECDSA public key parameters");

						var curveObject = this.getAlgorithmByOID(publicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
						if ("name" in curveObject === false) return Promise.reject('Unsupported named curve algorithm: ' + publicKeyInfo.algorithm.algorithmParams.valueBlock.toString());


						parameters.algorithm.algorithm.namedCurve = curveObject.name;
					}

					sequence = sequence.then(function () {
						return _this58.getPublicKey(publicKeyInfo, null, parameters);
					});
				}

				sequence = sequence.then(function (publicKey) {
					var algorithm = _this58.getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;

					var signatureValue = signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);

						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}

					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = _this58.getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject('Unrecognized hash algorithm: ' + pssParameters.hashAlgorithm.algorithmId);

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}


					return _this58.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(data));
				});


				return sequence;
			}
		}]);

		return CryptoEngine;
	}();

	var engine = {
		name: "none",
		crypto: null,
		subtle: null
	};

	function setEngine(name, crypto, subtle) {
		if (typeof process !== "undefined" && "pid" in process && typeof global !== "undefined") {
			if (typeof global[process.pid] === "undefined") {
				global[process.pid] = {};
			} else {
				if (_typeof(global[process.pid]) !== "object") {
					throw new Error('Name global.' + process.pid + ' already exists and it is not an object');
				}
			}

			if (typeof global[process.pid].pkijs === "undefined") {
				global[process.pid].pkijs = {};
			} else {
				if (_typeof(global[process.pid].pkijs) !== "object") {
					throw new Error('Name global.' + process.pid + '.pkijs already exists and it is not an object');
				}
			}

			global[process.pid].pkijs.engine = {
				name: name,
				crypto: crypto,
				subtle: subtle
			};
		} else {
				engine = {
					name: name,
					crypto: crypto,
					subtle: subtle
				};
			}
	}

	function getEngine() {
		if (typeof process !== "undefined" && "pid" in process && typeof global !== "undefined") {
			var _engine = void 0;

			try {
				_engine = global[process.pid].pkijs.engine;
			} catch (ex) {
				throw new Error("Please call \"setEngine\" before call to \"getEngine\"");
			}

			return _engine;
		}


		return engine;
	}

	(function initCryptoEngine() {
		if (typeof self !== "undefined") {
			if ("crypto" in self) {
				var engineName = "webcrypto";

				var cryptoObject = self.crypto;
				var subtleObject = null;

				if ("webkitSubtle" in self.crypto) {
					try {
						subtleObject = self.crypto.webkitSubtle;
					} catch (ex) {
						subtleObject = self.crypto.subtle;
					}

					engineName = "safari";
				}

				if ("subtle" in self.crypto) subtleObject = self.crypto.subtle;

				engine = {
					name: engineName,
					crypto: cryptoObject,
					subtle: new CryptoEngine({ name: engineName, crypto: self.crypto, subtle: subtleObject })
				};
			}
		}

		setEngine(engine.name, engine.crypto, engine.subtle);
	})();

	function getCrypto() {
		var _engine = getEngine();

		if (_engine.subtle !== null) return _engine.subtle;

		return undefined;
	}

	function createCMSECDSASignature(signatureBuffer) {
		if (signatureBuffer.byteLength % 2 !== 0) return new ArrayBuffer(0);

		var length = signatureBuffer.byteLength / 2;

		var rBuffer = new ArrayBuffer(length);
		var rView = new Uint8Array(rBuffer);
		rView.set(new Uint8Array(signatureBuffer, 0, length));

		var rInteger = new Integer({ valueHex: rBuffer });

		var sBuffer = new ArrayBuffer(length);
		var sView = new Uint8Array(sBuffer);
		sView.set(new Uint8Array(signatureBuffer, length, length));

		var sInteger = new Integer({ valueHex: sBuffer });


		return new Sequence({
			value: [rInteger.convertToDER(), sInteger.convertToDER()]
		}).toBER(false);
	}

	function stringPrep(inputString) {
		var isSpace = false;
		var cuttedResult = "";


		var result = inputString.trim();
		for (var i = 0; i < result.length; i++) {
			if (result.charCodeAt(i) === 32) {
				if (isSpace === false) isSpace = true;
			} else {
				if (isSpace) {
					cuttedResult += " ";
					isSpace = false;
				}

				cuttedResult += result[i];
			}
		}


		return cuttedResult.toLowerCase();
	}

	function createECDSASignatureFromCMS(cmsSignature) {
		if (cmsSignature instanceof Sequence === false) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value.length !== 2) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value[0] instanceof Integer === false) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value[1] instanceof Integer === false) return new ArrayBuffer(0);


		var rValue = cmsSignature.valueBlock.value[0].convertFromDER();
		var sValue = cmsSignature.valueBlock.value[1].convertFromDER();

		switch (true) {
			case rValue.valueBlock.valueHex.byteLength < sValue.valueBlock.valueHex.byteLength:
				{
					if (sValue.valueBlock.valueHex.byteLength - rValue.valueBlock.valueHex.byteLength !== 1) throw new Error("Incorrect DER integer decoding");

					var correctedLength = sValue.valueBlock.valueHex.byteLength;

					var rValueView = new Uint8Array(rValue.valueBlock.valueHex);

					var rValueBufferCorrected = new ArrayBuffer(correctedLength);
					var rValueViewCorrected = new Uint8Array(rValueBufferCorrected);

					rValueViewCorrected.set(rValueView, 1);
					rValueViewCorrected[0] = 0x00;

					return utilConcatBuf(rValueBufferCorrected, sValue.valueBlock.valueHex);
				}
			case rValue.valueBlock.valueHex.byteLength > sValue.valueBlock.valueHex.byteLength:
				{
					if (rValue.valueBlock.valueHex.byteLength - sValue.valueBlock.valueHex.byteLength !== 1) throw new Error("Incorrect DER integer decoding");

					var _correctedLength = rValue.valueBlock.valueHex.byteLength;

					var sValueView = new Uint8Array(sValue.valueBlock.valueHex);

					var sValueBufferCorrected = new ArrayBuffer(_correctedLength);
					var sValueViewCorrected = new Uint8Array(sValueBufferCorrected);

					sValueViewCorrected.set(sValueView, 1);
					sValueViewCorrected[0] = 0x00;

					return utilConcatBuf(rValue.valueBlock.valueHex, sValueBufferCorrected);
				}
			default:
				{
					if (rValue.valueBlock.valueHex.byteLength % 2) {
						var _correctedLength2 = rValue.valueBlock.valueHex.byteLength + 1;

						var _rValueView = new Uint8Array(rValue.valueBlock.valueHex);

						var _rValueBufferCorrected = new ArrayBuffer(_correctedLength2);
						var _rValueViewCorrected = new Uint8Array(_rValueBufferCorrected);

						_rValueViewCorrected.set(_rValueView, 1);
						_rValueViewCorrected[0] = 0x00;

						var _sValueView = new Uint8Array(sValue.valueBlock.valueHex);

						var _sValueBufferCorrected = new ArrayBuffer(_correctedLength2);
						var _sValueViewCorrected = new Uint8Array(_sValueBufferCorrected);

						_sValueViewCorrected.set(_sValueView, 1);
						_sValueViewCorrected[0] = 0x00;

						return utilConcatBuf(_rValueBufferCorrected, _sValueBufferCorrected);
					}
				}
		}


		return utilConcatBuf(rValue.valueBlock.valueHex, sValue.valueBlock.valueHex);
	}

	var AttributeTypeAndValue = function () {
		function AttributeTypeAndValue() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, AttributeTypeAndValue);

			this.type = getParametersValue(parameters, "type", AttributeTypeAndValue.defaultValues("type"));

			this.value = getParametersValue(parameters, "value", AttributeTypeAndValue.defaultValues("value"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(AttributeTypeAndValue, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["type", "typeValue"]);

				var asn1 = compareSchema(schema, schema, AttributeTypeAndValue.schema({
					names: {
						type: "type",
						value: "typeValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AttributeTypeAndValue");

				this.type = asn1.result.type.valueBlock.toString();

				this.value = asn1.result.typeValue;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.type }), this.value]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var _object = {
					type: this.type
				};

				if (Object.keys(this.value).length !== 0) _object.value = this.value.toJSON();else _object.value = this.value;

				return _object;
			}
		}, {
			key: 'isEqual',
			value: function isEqual(compareTo) {
				if (compareTo instanceof AttributeTypeAndValue) {
					if (this.type !== compareTo.type) return false;

					if (this.value instanceof Utf8String && compareTo.value instanceof Utf8String || this.value instanceof BmpString && compareTo.value instanceof BmpString || this.value instanceof UniversalString && compareTo.value instanceof UniversalString || this.value instanceof NumericString && compareTo.value instanceof NumericString || this.value instanceof PrintableString && compareTo.value instanceof PrintableString || this.value instanceof TeletexString && compareTo.value instanceof TeletexString || this.value instanceof VideotexString && compareTo.value instanceof VideotexString || this.value instanceof IA5String && compareTo.value instanceof IA5String || this.value instanceof GraphicString && compareTo.value instanceof GraphicString || this.value instanceof VisibleString && compareTo.value instanceof VisibleString || this.value instanceof GeneralString && compareTo.value instanceof GeneralString || this.value instanceof CharacterString && compareTo.value instanceof CharacterString) {
						var value1 = stringPrep(this.value.valueBlock.value);
						var value2 = stringPrep(compareTo.value.valueBlock.value);

						if (value1.localeCompare(value2) !== 0) return false;
					} else {
							if (isEqualBuffer(this.value.valueBeforeDecode, compareTo.value.valueBeforeDecode) === false) return false;
						}

					return true;
				}

				if (compareTo instanceof ArrayBuffer) return isEqualBuffer(this.value.valueBeforeDecode, compareTo);

				return false;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return "";
					case "value":
						return {};
					default:
						throw new Error('Invalid member name for AttributeTypeAndValue class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.type || "" }), new Any({ name: names.value || "" })]
				});
			}
		}]);

		return AttributeTypeAndValue;
	}();

	var RelativeDistinguishedNames = function () {
		function RelativeDistinguishedNames() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, RelativeDistinguishedNames);

			this.typesAndValues = getParametersValue(parameters, "typesAndValues", RelativeDistinguishedNames.defaultValues("typesAndValues"));

			this.valueBeforeDecode = getParametersValue(parameters, "valueBeforeDecode", RelativeDistinguishedNames.defaultValues("valueBeforeDecode"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(RelativeDistinguishedNames, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["RDN", "typesAndValues"]);

				var asn1 = compareSchema(schema, schema, RelativeDistinguishedNames.schema({
					names: {
						blockName: "RDN",
						repeatedSet: "typesAndValues"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RelativeDistinguishedNames");

				if ("typesAndValues" in asn1.result) this.typesAndValues = Array.from(asn1.result.typesAndValues, function (element) {
						return new AttributeTypeAndValue({ schema: element });
					});

				this.valueBeforeDecode = asn1.result.RDN.valueBeforeDecode;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				if (this.valueBeforeDecode.byteLength === 0) {
						return new Sequence({
							value: [new Set({
								value: Array.from(this.typesAndValues, function (element) {
									return element.toSchema();
								})
							})]
						});
					}

				var asn1 = fromBER(this.valueBeforeDecode);

				return asn1.result;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					typesAndValues: Array.from(this.typesAndValues, function (element) {
						return element.toJSON();
					})
				};
			}
		}, {
			key: 'isEqual',
			value: function isEqual(compareTo) {
				if (compareTo instanceof RelativeDistinguishedNames) {
					if (this.typesAndValues.length !== compareTo.typesAndValues.length) return false;

					var _iteratorNormalCompletion17 = true;
					var _didIteratorError17 = false;
					var _iteratorError17 = undefined;

					try {
						for (var _iterator17 = this.typesAndValues.entries()[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
							var _step17$value = _slicedToArray(_step17.value, 2),
							    index = _step17$value[0],
							    typeAndValue = _step17$value[1];

							if (typeAndValue.isEqual(compareTo.typesAndValues[index]) === false) return false;
						}
					} catch (err) {
						_didIteratorError17 = true;
						_iteratorError17 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion17 && _iterator17.return) {
								_iterator17.return();
							}
						} finally {
							if (_didIteratorError17) {
								throw _iteratorError17;
							}
						}
					}

					return true;
				}

				if (compareTo instanceof ArrayBuffer) return isEqualBuffer(this.valueBeforeDecode, compareTo);

				return false;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "typesAndValues":
						return [];
					case "valueBeforeDecode":
						return new ArrayBuffer(0);
					default:
						throw new Error('Invalid member name for RelativeDistinguishedNames class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "typesAndValues":
						return memberValue.length === 0;
					case "valueBeforeDecode":
						return memberValue.byteLength === 0;
					default:
						throw new Error('Invalid member name for RelativeDistinguishedNames class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.repeatedSequence || "",
						value: new Set({
							value: [new Repeated({
								name: names.repeatedSet || "",
								value: AttributeTypeAndValue.schema(names.typeAndValue || {})
							})]
						})
					})]
				});
			}
		}]);

		return RelativeDistinguishedNames;
	}();

	function builtInStandardAttributes() {
		var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var optional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			optional: optional,
			value: [new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2,
					tagNumber: 1 },
				name: names.country_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2,
					tagNumber: 2 },
				name: names.administration_domain_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 0 },
				name: names.network_address || "",
				isHexOnly: true
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 1 },
				name: names.terminal_identifier || "",
				isHexOnly: true
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 2 },
				name: names.private_domain_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 3 },
				name: names.organization_name || "",
				isHexOnly: true
			}), new Primitive({
				optional: true,
				name: names.numeric_user_identifier || "",
				idBlock: {
					tagClass: 3,
					tagNumber: 4 },
				isHexOnly: true
			}), new Constructed({
				optional: true,
				name: names.personal_name || "",
				idBlock: {
					tagClass: 3,
					tagNumber: 5 },
				value: [new Primitive({
					idBlock: {
						tagClass: 3,
						tagNumber: 0 },
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3,
						tagNumber: 1 },
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3,
						tagNumber: 2 },
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3,
						tagNumber: 3 },
					isHexOnly: true
				})]
			}), new Constructed({
				optional: true,
				name: names.organizational_unit_names || "",
				idBlock: {
					tagClass: 3,
					tagNumber: 6 },
				value: [new Repeated({
					value: new PrintableString()
				})]
			})]
		});
	}

	function builtInDomainDefinedAttributes() {
		var optional = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

		return new Sequence({
			optional: optional,
			value: [new PrintableString(), new PrintableString()]
		});
	}

	function extensionAttributes() {
		var optional = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

		return new Set({
			optional: optional,
			value: [new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 0 },
				isHexOnly: true
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 1 },
				value: [new Any()]
			})]
		});
	}

	var GeneralName = function () {
		function GeneralName() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralName);

			this.type = getParametersValue(parameters, "type", GeneralName.defaultValues("type"));

			this.value = getParametersValue(parameters, "value", GeneralName.defaultValues("value"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(GeneralName, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["blockName", "otherName", "rfc822Name", "dNSName", "x400Address", "directoryName", "ediPartyName", "uniformResourceIdentifier", "iPAddress", "registeredID"]);

				var asn1 = compareSchema(schema, schema, GeneralName.schema({
					names: {
						blockName: "blockName",
						otherName: "otherName",
						rfc822Name: "rfc822Name",
						dNSName: "dNSName",
						x400Address: "x400Address",
						directoryName: {
							names: {
								blockName: "directoryName"
							}
						},
						ediPartyName: "ediPartyName",
						uniformResourceIdentifier: "uniformResourceIdentifier",
						iPAddress: "iPAddress",
						registeredID: "registeredID"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GeneralName");

				this.type = asn1.result.blockName.idBlock.tagNumber;

				switch (this.type) {
					case 0:
						this.value = asn1.result.blockName;
						break;
					case 1:
					case 2:
					case 6:
						{
							var value = asn1.result.blockName;

							value.idBlock.tagClass = 1;
							value.idBlock.tagNumber = 22;

							var valueBER = value.toBER(false);

							this.value = fromBER(valueBER).result.valueBlock.value;
						}
						break;
					case 3:
						this.value = asn1.result.blockName;
						break;
					case 4:
						this.value = new RelativeDistinguishedNames({ schema: asn1.result.directoryName });
						break;
					case 5:
						this.value = asn1.result.ediPartyName;
						break;
					case 7:
						this.value = new OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex });
						break;
					case 8:
						{
							var _value2 = asn1.result.blockName;

							_value2.idBlock.tagClass = 1;
							_value2.idBlock.tagNumber = 6;

							var _valueBER = _value2.toBER(false);

							this.value = fromBER(_valueBER).result.valueBlock.toString();
						}
						break;
					default:
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				switch (this.type) {
					case 0:
					case 3:
					case 5:
						return new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: this.type
							},
							value: [this.value]
						});
					case 1:
					case 2:
					case 6:
						{
							var value = new IA5String({ value: this.value });

							value.idBlock.tagClass = 3;
							value.idBlock.tagNumber = this.type;

							return value;
						}
					case 4:
						return new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 4
							},
							value: [this.value.toSchema()]
						});
					case 7:
						{
							var _value3 = this.value;

							_value3.idBlock.tagClass = 3;
							_value3.idBlock.tagNumber = this.type;

							return _value3;
						}
					case 8:
						{
							var _value4 = new ObjectIdentifier({ value: this.value });

							_value4.idBlock.tagClass = 3;
							_value4.idBlock.tagNumber = this.type;

							return _value4;
						}
					default:
						return GeneralName.schema();
				}
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var _object = {
					type: this.type
				};

				if (typeof this.value === "string") _object.value = this.value;else _object.value = this.value.toJSON();

				return _object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return 9;
					case "value":
						return {};
					default:
						throw new Error('Invalid member name for GeneralName class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === GeneralName.defaultValues(memberName);
					case "value":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error('Invalid member name for GeneralName class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						name: names.blockName || "",
						value: [new ObjectIdentifier(), new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 0 },
							value: [new Any()]
						})]
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3,
							tagNumber: 1 }
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3,
							tagNumber: 2 }
					}), new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 3 },
						name: names.blockName || "",
						value: [builtInStandardAttributes(names.builtInStandardAttributes || {}, false), builtInDomainDefinedAttributes(true), extensionAttributes(true)]
					}), new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 4 },
						name: names.blockName || "",
						value: [RelativeDistinguishedNames.schema(names.directoryName || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 5 },
						name: names.blockName || "",
						value: [new Constructed({
							optional: true,
							idBlock: {
								tagClass: 3,
								tagNumber: 0 },
							value: [new Choice({
								value: [new TeletexString(), new PrintableString(), new UniversalString(), new Utf8String(), new BmpString()]
							})]
						}), new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 1 },
							value: [new Choice({
								value: [new TeletexString(), new PrintableString(), new UniversalString(), new Utf8String(), new BmpString()]
							})]
						})]
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3,
							tagNumber: 6 }
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3,
							tagNumber: 7 }
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3,
							tagNumber: 8 }
					})]
				});
			}
		}]);

		return GeneralName;
	}();

	var AccessDescription = function () {
		function AccessDescription() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, AccessDescription);

			this.accessMethod = getParametersValue(parameters, "accessMethod", AccessDescription.defaultValues("accessMethod"));

			this.accessLocation = getParametersValue(parameters, "accessLocation", AccessDescription.defaultValues("accessLocation"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(AccessDescription, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["accessMethod", "accessLocation"]);

				var asn1 = compareSchema(schema, schema, AccessDescription.schema({
					names: {
						accessMethod: "accessMethod",
						accessLocation: {
							names: {
								blockName: "accessLocation"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AccessDescription");

				this.accessMethod = asn1.result.accessMethod.valueBlock.toString();
				this.accessLocation = new GeneralName({ schema: asn1.result.accessLocation });
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.accessMethod }), this.accessLocation.toSchema()]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					accessMethod: this.accessMethod,
					accessLocation: this.accessLocation.toJSON()
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "accessMethod":
						return "";
					case "accessLocation":
						return new GeneralName();
					default:
						throw new Error('Invalid member name for AccessDescription class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.accessMethod || "" }), GeneralName.schema(names.accessLocation || {})]
				});
			}
		}]);

		return AccessDescription;
	}();

	var AltName = function () {
		function AltName() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, AltName);

			this.altNames = getParametersValue(parameters, "altNames", AltName.defaultValues("altNames"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(AltName, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["altNames"]);

				var asn1 = compareSchema(schema, schema, AltName.schema({
					names: {
						altNames: "altNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AltName");

				if ("altNames" in asn1.result) this.altNames = Array.from(asn1.result.altNames, function (element) {
					return new GeneralName({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.altNames, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					altNames: Array.from(this.altNames, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "altNames":
						return [];
					default:
						throw new Error('Invalid member name for AltName class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.altNames || "",
						value: GeneralName.schema()
					})]
				});
			}
		}]);

		return AltName;
	}();

	var Time = function () {
		function Time() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Time);

			this.type = getParametersValue(parameters, "type", Time.defaultValues("type"));

			this.value = getParametersValue(parameters, "value", Time.defaultValues("value"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(Time, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["utcTimeName", "generalTimeName"]);

				var asn1 = compareSchema(schema, schema, Time.schema({
					names: {
						utcTimeName: "utcTimeName",
						generalTimeName: "generalTimeName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for Time");

				if ("utcTimeName" in asn1.result) {
					this.type = 0;
					this.value = asn1.result.utcTimeName.toDate();
				}
				if ("generalTimeName" in asn1.result) {
					this.type = 1;
					this.value = asn1.result.generalTimeName.toDate();
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var result = {};

				if (this.type === 0) result = new UTCTime({ valueDate: this.value });
				if (this.type === 1) result = new GeneralizedTime({ valueDate: this.value });

				return result;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					type: this.type,
					value: this.value
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return 0;
					case "value":
						return new Date(0, 0, 0);
					default:
						throw new Error('Invalid member name for Time class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
				var optional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					optional: optional,
					value: [new UTCTime({ name: names.utcTimeName || "" }), new GeneralizedTime({ name: names.generalTimeName || "" })]
				});
			}
		}]);

		return Time;
	}();

	var SubjectDirectoryAttributes = function () {
		function SubjectDirectoryAttributes() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, SubjectDirectoryAttributes);

			this.attributes = getParametersValue(parameters, "attributes", SubjectDirectoryAttributes.defaultValues("attributes"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(SubjectDirectoryAttributes, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["attributes"]);

				var asn1 = compareSchema(schema, schema, SubjectDirectoryAttributes.schema({
					names: {
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SubjectDirectoryAttributes");

				this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.attributes, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					attributes: Array.from(this.attributes, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "attributes":
						return [];
					default:
						throw new Error('Invalid member name for SubjectDirectoryAttributes class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.attributes || "",
						value: Attribute.schema()
					})]
				});
			}
		}]);

		return SubjectDirectoryAttributes;
	}();

	var PrivateKeyUsagePeriod = function () {
		function PrivateKeyUsagePeriod() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PrivateKeyUsagePeriod);

			if ("notBefore" in parameters) this.notBefore = getParametersValue(parameters, "notBefore", PrivateKeyUsagePeriod.defaultValues("notBefore"));

			if ("notAfter" in parameters) this.notAfter = getParametersValue(parameters, "notAfter", PrivateKeyUsagePeriod.defaultValues("notAfter"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PrivateKeyUsagePeriod, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["notBefore", "notAfter"]);

				var asn1 = compareSchema(schema, schema, PrivateKeyUsagePeriod.schema({
					names: {
						notBefore: "notBefore",
						notAfter: "notAfter"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PrivateKeyUsagePeriod");

				if ("notBefore" in asn1.result) {
					var localNotBefore = new GeneralizedTime();
					localNotBefore.fromBuffer(asn1.result.notBefore.valueBlock.valueHex);
					this.notBefore = localNotBefore.toDate();
				}

				if ("notAfter" in asn1.result) {
					var localNotAfter = new GeneralizedTime({ valueHex: asn1.result.notAfter.valueBlock.valueHex });
					localNotAfter.fromBuffer(asn1.result.notAfter.valueBlock.valueHex);
					this.notAfter = localNotAfter.toDate();
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if ("notBefore" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						valueHex: new GeneralizedTime({ valueDate: this.notBefore }).valueBlock.valueHex
					}));
				}

				if ("notAfter" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						valueHex: new GeneralizedTime({ valueDate: this.notAfter }).valueBlock.valueHex
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if ("notBefore" in this) object.notBefore = this.notBefore;

				if ("notAfter" in this) object.notAfter = this.notAfter;

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "notBefore":
						return new Date();
					case "notAfter":
						return new Date();
					default:
						throw new Error('Invalid member name for PrivateKeyUsagePeriod class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.notBefore || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 }
					}), new Primitive({
						name: names.notAfter || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 }
					})]
				});
			}
		}]);

		return PrivateKeyUsagePeriod;
	}();

	var BasicConstraints = function () {
		function BasicConstraints() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, BasicConstraints);

			this.cA = getParametersValue(parameters, "cA", false);

			if ("pathLenConstraint" in parameters) this.pathLenConstraint = getParametersValue(parameters, "pathLenConstraint", 0);

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(BasicConstraints, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["cA", "pathLenConstraint"]);

				var asn1 = compareSchema(schema, schema, BasicConstraints.schema({
					names: {
						cA: "cA",
						pathLenConstraint: "pathLenConstraint"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for BasicConstraints");

				if ("cA" in asn1.result) this.cA = asn1.result.cA.valueBlock.value;

				if ("pathLenConstraint" in asn1.result) {
					if (asn1.result.pathLenConstraint.valueBlock.isHexOnly) this.pathLenConstraint = asn1.result.pathLenConstraint;else this.pathLenConstraint = asn1.result.pathLenConstraint.valueBlock.valueDec;
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if (this.cA !== BasicConstraints.defaultValues("cA")) outputArray.push(new Boolean({ value: this.cA }));

				if ("pathLenConstraint" in this) {
					if (this.pathLenConstraint instanceof Integer) outputArray.push(this.pathLenConstraint);else outputArray.push(new Integer({ value: this.pathLenConstraint }));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if (this.cA !== BasicConstraints.defaultValues("cA")) object.cA = this.cA;

				if ("pathLenConstraint" in this) {
					if (this.pathLenConstraint instanceof Integer) object.pathLenConstraint = this.pathLenConstraint.toJSON();else object.pathLenConstraint = this.pathLenConstraint;
				}

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "cA":
						return false;
					default:
						throw new Error('Invalid member name for BasicConstraints class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Boolean({
						optional: true,
						name: names.cA || ""
					}), new Integer({
						optional: true,
						name: names.pathLenConstraint || ""
					})]
				});
			}
		}]);

		return BasicConstraints;
	}();

	var IssuingDistributionPoint = function () {
		function IssuingDistributionPoint() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, IssuingDistributionPoint);

			if ("distributionPoint" in parameters) this.distributionPoint = getParametersValue(parameters, "distributionPoint", IssuingDistributionPoint.defaultValues("distributionPoint"));

			this.onlyContainsUserCerts = getParametersValue(parameters, "onlyContainsUserCerts", IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"));

			this.onlyContainsCACerts = getParametersValue(parameters, "onlyContainsCACerts", IssuingDistributionPoint.defaultValues("onlyContainsCACerts"));

			if ("onlySomeReasons" in parameters) this.onlySomeReasons = getParametersValue(parameters, "onlySomeReasons", IssuingDistributionPoint.defaultValues("onlySomeReasons"));

			this.indirectCRL = getParametersValue(parameters, "indirectCRL", IssuingDistributionPoint.defaultValues("indirectCRL"));

			this.onlyContainsAttributeCerts = getParametersValue(parameters, "onlyContainsAttributeCerts", IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(IssuingDistributionPoint, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["distributionPoint", "distributionPointNames", "onlyContainsUserCerts", "onlyContainsCACerts", "onlySomeReasons", "indirectCRL", "onlyContainsAttributeCerts"]);

				var asn1 = compareSchema(schema, schema, IssuingDistributionPoint.schema({
					names: {
						distributionPoint: "distributionPoint",
						distributionPointNames: "distributionPointNames",
						onlyContainsUserCerts: "onlyContainsUserCerts",
						onlyContainsCACerts: "onlyContainsCACerts",
						onlySomeReasons: "onlySomeReasons",
						indirectCRL: "indirectCRL",
						onlyContainsAttributeCerts: "onlyContainsAttributeCerts"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for IssuingDistributionPoint");

				if ("distributionPoint" in asn1.result) {
					switch (true) {
						case asn1.result.distributionPoint.idBlock.tagNumber === 0:
							this.distributionPoint = Array.from(asn1.result.distributionPointNames, function (element) {
								return new GeneralName({ schema: element });
							});
							break;
						case asn1.result.distributionPoint.idBlock.tagNumber === 1:
							{
								this.distributionPoint = new RelativeDistinguishedNames({
									schema: new Sequence({
										value: asn1.result.distributionPoint.valueBlock.value
									})
								});
							}
							break;
						default:
							throw new Error("Unknown tagNumber for distributionPoint: {$asn1.result.distributionPoint.idBlock.tagNumber}");
					}
				}

				if ("onlyContainsUserCerts" in asn1.result) {
					var view = new Uint8Array(asn1.result.onlyContainsUserCerts.valueBlock.valueHex);
					this.onlyContainsUserCerts = view[0] !== 0x00;
				}

				if ("onlyContainsCACerts" in asn1.result) {
					var _view4 = new Uint8Array(asn1.result.onlyContainsCACerts.valueBlock.valueHex);
					this.onlyContainsCACerts = _view4[0] !== 0x00;
				}

				if ("onlySomeReasons" in asn1.result) {
					var _view5 = new Uint8Array(asn1.result.onlySomeReasons.valueBlock.valueHex);
					this.onlySomeReasons = _view5[0];
				}

				if ("indirectCRL" in asn1.result) {
					var _view6 = new Uint8Array(asn1.result.indirectCRL.valueBlock.valueHex);
					this.indirectCRL = _view6[0] !== 0x00;
				}

				if ("onlyContainsAttributeCerts" in asn1.result) {
					var _view7 = new Uint8Array(asn1.result.onlyContainsAttributeCerts.valueBlock.valueHex);
					this.onlyContainsAttributeCerts = _view7[0] !== 0x00;
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if ("distributionPoint" in this) {
					var value = void 0;

					if (this.distributionPoint instanceof Array) {
						value = new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 0 },
							value: Array.from(this.distributionPoint, function (element) {
								return element.toSchema();
							})
						});
					} else {
						value = this.distributionPoint.toSchema();

						value.idBlock.tagClass = 3;
						value.idBlock.tagNumber = 1;
					}

					outputArray.push(value);
				}

				if (this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if (this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if ("onlySomeReasons" in this) {
					var buffer = new ArrayBuffer(1);
					var view = new Uint8Array(buffer);

					view[0] = this.onlySomeReasons;

					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 3 },
						valueHex: buffer
					}));
				}

				if (this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 4 },
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if (this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 5 },
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if ("distributionPoint" in this) {
					if (this.distributionPoint instanceof Array) object.distributionPoint = Array.from(this.distributionPoint, function (element) {
						return element.toJSON();
					});else object.distributionPoint = this.distributionPoint.toJSON();
				}

				if (this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts")) object.onlyContainsUserCerts = this.onlyContainsUserCerts;

				if (this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts")) object.onlyContainsCACerts = this.onlyContainsCACerts;

				if ("onlySomeReasons" in this) object.onlySomeReasons = this.onlySomeReasons;

				if (this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL")) object.indirectCRL = this.indirectCRL;

				if (this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts")) object.onlyContainsAttributeCerts = this.onlyContainsAttributeCerts;

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoint":
						return [];
					case "onlyContainsUserCerts":
						return false;
					case "onlyContainsCACerts":
						return false;
					case "onlySomeReasons":
						return 0;
					case "indirectCRL":
						return false;
					case "onlyContainsAttributeCerts":
						return false;
					default:
						throw new Error('Invalid member name for IssuingDistributionPoint class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Choice({
							value: [new Constructed({
								name: names.distributionPoint || "",
								idBlock: {
									tagClass: 3,
									tagNumber: 0 },
								value: [new Repeated({
									name: names.distributionPointNames || "",
									value: GeneralName.schema()
								})]
							}), new Constructed({
								name: names.distributionPoint || "",
								idBlock: {
									tagClass: 3,
									tagNumber: 1 },
								value: RelativeDistinguishedNames.schema().valueBlock.value
							})]
						})]
					}), new Primitive({
						name: names.onlyContainsUserCerts || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 }
					}), new Primitive({
						name: names.onlyContainsCACerts || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 2 }
					}), new Primitive({
						name: names.onlySomeReasons || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 3 }
					}), new Primitive({
						name: names.indirectCRL || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 4 }
					}), new Primitive({
						name: names.onlyContainsAttributeCerts || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 5 }
					})]
				});
			}
		}]);

		return IssuingDistributionPoint;
	}();

	var GeneralNames = function () {
		function GeneralNames() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralNames);

			this.names = getParametersValue(parameters, "names", GeneralNames.defaultValues("names"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(GeneralNames, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["names", "generalNames"]);

				var asn1 = compareSchema(schema, schema, GeneralNames.schema({
					names: {
						blockName: "names",
						generalNames: "generalNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GeneralNames");

				this.names = Array.from(asn1.result.generalNames, function (element) {
					return new GeneralName({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.names, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					names: Array.from(this.names, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "names":
						return [];
					default:
						throw new Error('Invalid member name for GeneralNames class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
				var optional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					optional: optional,
					name: names.blockName || "",
					value: [new Repeated({
						name: names.generalNames || "",
						value: GeneralName.schema()
					})]
				});
			}
		}]);

		return GeneralNames;
	}();

	var GeneralSubtree = function () {
		function GeneralSubtree() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralSubtree);

			this.base = getParametersValue(parameters, "base", GeneralSubtree.defaultValues("base"));

			this.minimum = getParametersValue(parameters, "minimum", GeneralSubtree.defaultValues("minimum"));

			if ("maximum" in parameters) this.maximum = getParametersValue(parameters, "maximum", GeneralSubtree.defaultValues("maximum"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(GeneralSubtree, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["base", "minimum", "maximum"]);

				var asn1 = compareSchema(schema, schema, GeneralSubtree.schema({
					names: {
						base: {
							names: {
								blockName: "base"
							}
						},
						minimum: "minimum",
						maximum: "maximum"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GeneralSubtree");

				this.base = new GeneralName({ schema: asn1.result.base });

				if ("minimum" in asn1.result) {
					if (asn1.result.minimum.valueBlock.isHexOnly) this.minimum = asn1.result.minimum;else this.minimum = asn1.result.minimum.valueBlock.valueDec;
				}

				if ("maximum" in asn1.result) {
					if (asn1.result.maximum.valueBlock.isHexOnly) this.maximum = asn1.result.maximum;else this.maximum = asn1.result.maximum.valueBlock.valueDec;
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				outputArray.push(this.base.toSchema());

				if (this.minimum !== 0) {
					var valueMinimum = 0;

					if (this.minimum instanceof Integer) valueMinimum = this.minimum;else valueMinimum = new Integer({ value: this.minimum });

					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [valueMinimum]
					}));
				}

				if ("maximum" in this) {
					var valueMaximum = 0;

					if (this.maximum instanceof Integer) valueMaximum = this.maximum;else valueMaximum = new Integer({ value: this.maximum });

					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [valueMaximum]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {
					base: this.base.toJSON()
				};

				if (this.minimum !== 0) {
					if (typeof this.minimum === "number") object.minimum = this.minimum;else object.minimum = this.minimum.toJSON();
				}

				if ("maximum" in this) {
					if (typeof this.maximum === "number") object.maximum = this.maximum;else object.maximum = this.maximum.toJSON();
				}

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "base":
						return new GeneralName();
					case "minimum":
						return 0;
					case "maximum":
						return 0;
					default:
						throw new Error('Invalid member name for GeneralSubtree class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [GeneralName.schema(names.base || {}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Integer({ name: names.minimum || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [new Integer({ name: names.maximum || "" })]
					})]
				});
			}
		}]);

		return GeneralSubtree;
	}();

	var NameConstraints = function () {
		function NameConstraints() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, NameConstraints);

			if ("permittedSubtrees" in parameters) this.permittedSubtrees = getParametersValue(parameters, "permittedSubtrees", NameConstraints.defaultValues("permittedSubtrees"));

			if ("excludedSubtrees" in parameters) this.excludedSubtrees = getParametersValue(parameters, "excludedSubtrees", NameConstraints.defaultValues("excludedSubtrees"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(NameConstraints, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["permittedSubtrees", "excludedSubtrees"]);

				var asn1 = compareSchema(schema, schema, NameConstraints.schema({
					names: {
						permittedSubtrees: "permittedSubtrees",
						excludedSubtrees: "excludedSubtrees"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for NameConstraints");

				if ("permittedSubtrees" in asn1.result) this.permittedSubtrees = Array.from(asn1.result.permittedSubtrees, function (element) {
					return new GeneralSubtree({ schema: element });
				});

				if ("excludedSubtrees" in asn1.result) this.excludedSubtrees = Array.from(asn1.result.excludedSubtrees, function (element) {
					return new GeneralSubtree({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if ("permittedSubtrees" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Sequence({
							value: Array.from(this.permittedSubtrees, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				if ("excludedSubtrees" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [new Sequence({
							value: Array.from(this.excludedSubtrees, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if ("permittedSubtrees" in this) object.permittedSubtrees = Array.from(this.permittedSubtrees, function (element) {
					return element.toJSON();
				});

				if ("excludedSubtrees" in this) object.excludedSubtrees = Array.from(this.excludedSubtrees, function (element) {
					return element.toJSON();
				});

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "permittedSubtrees":
						return [];
					case "excludedSubtrees":
						return [];
					default:
						throw new Error('Invalid member name for NameConstraints class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Repeated({
							name: names.permittedSubtrees || "",
							value: GeneralSubtree.schema()
						})]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [new Repeated({
							name: names.excludedSubtrees || "",
							value: GeneralSubtree.schema()
						})]
					})]
				});
			}
		}]);

		return NameConstraints;
	}();

	var DistributionPoint = function () {
		function DistributionPoint() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, DistributionPoint);

			if ("distributionPoint" in parameters) this.distributionPoint = getParametersValue(parameters, "distributionPoint", DistributionPoint.defaultValues("distributionPoint"));

			if ("reasons" in parameters) this.reasons = getParametersValue(parameters, "reasons", DistributionPoint.defaultValues("reasons"));

			if ("cRLIssuer" in parameters) this.cRLIssuer = getParametersValue(parameters, "cRLIssuer", DistributionPoint.defaultValues("cRLIssuer"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(DistributionPoint, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["distributionPoint", "distributionPointNames", "reasons", "cRLIssuer", "cRLIssuerNames"]);

				var asn1 = compareSchema(schema, schema, DistributionPoint.schema({
					names: {
						distributionPoint: "distributionPoint",
						distributionPointNames: "distributionPointNames",
						reasons: "reasons",
						cRLIssuer: "cRLIssuer",
						cRLIssuerNames: "cRLIssuerNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for DistributionPoint");

				if ("distributionPoint" in asn1.result) {
					if (asn1.result.distributionPoint.idBlock.tagNumber === 0) this.distributionPoint = Array.from(asn1.result.distributionPointNames, function (element) {
							return new GeneralName({ schema: element });
						});

					if (asn1.result.distributionPoint.idBlock.tagNumber === 1) {
							this.distributionPoint = new RelativeDistinguishedNames({
								schema: new Sequence({
									value: asn1.result.distributionPoint.valueBlock.value
								})
							});
						}
				}

				if ("reasons" in asn1.result) this.reasons = new BitString({ valueHex: asn1.result.reasons.valueBlock.valueHex });

				if ("cRLIssuer" in asn1.result) this.cRLIssuer = Array.from(asn1.result.cRLIssuerNames, function (element) {
					return new GeneralName({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if ("distributionPoint" in this) {
					var internalValue = void 0;

					if (this.distributionPoint instanceof Array) {
						internalValue = new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 0 },
							value: Array.from(this.distributionPoint, function (element) {
								return element.toSchema();
							})
						});
					} else {
						internalValue = new Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 1 },
							value: [this.distributionPoint.toSchema()]
						});
					}

					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [internalValue]
					}));
				}

				if ("reasons" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						valueHex: this.reasons.valueBlock.valueHex
					}));
				}

				if ("cRLIssuer" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						value: Array.from(this.cRLIssuer, function (element) {
							return element.toSchema();
						})
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if ("distributionPoint" in this) {
					if (this.distributionPoint instanceof Array) object.distributionPoint = Array.from(this.distributionPoint, function (element) {
						return element.toJSON();
					});else object.distributionPoint = this.distributionPoint.toJSON();
				}

				if ("reasons" in this) object.reasons = this.reasons.toJSON();

				if ("cRLIssuer" in this) object.cRLIssuer = Array.from(this.cRLIssuer, function (element) {
					return element.toJSON();
				});

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoint":
						return [];
					case "reasons":
						return new BitString();
					case "cRLIssuer":
						return [];
					default:
						throw new Error('Invalid member name for DistributionPoint class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Choice({
							value: [new Constructed({
								name: names.distributionPoint || "",
								optional: true,
								idBlock: {
									tagClass: 3,
									tagNumber: 0 },
								value: [new Repeated({
									name: names.distributionPointNames || "",
									value: GeneralName.schema()
								})]
							}), new Constructed({
								name: names.distributionPoint || "",
								optional: true,
								idBlock: {
									tagClass: 3,
									tagNumber: 1 },
								value: RelativeDistinguishedNames.schema().valueBlock.value
							})]
						})]
					}), new Primitive({
						name: names.reasons || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 }
					}), new Constructed({
						name: names.cRLIssuer || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						value: [new Repeated({
							name: names.cRLIssuerNames || "",
							value: GeneralName.schema()
						})]
					})]
				});
			}
		}]);

		return DistributionPoint;
	}();

	var CRLDistributionPoints = function () {
		function CRLDistributionPoints() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, CRLDistributionPoints);

			this.distributionPoints = getParametersValue(parameters, "distributionPoints", CRLDistributionPoints.defaultValues("distributionPoints"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(CRLDistributionPoints, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["distributionPoints"]);

				var asn1 = compareSchema(schema, schema, CRLDistributionPoints.schema({
					names: {
						distributionPoints: "distributionPoints"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CRLDistributionPoints");

				this.distributionPoints = Array.from(asn1.result.distributionPoints, function (element) {
					return new DistributionPoint({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.distributionPoints, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					distributionPoints: Array.from(this.distributionPoints, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoints":
						return [];
					default:
						throw new Error('Invalid member name for CRLDistributionPoints class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.distributionPoints || "",
						value: DistributionPoint.schema()
					})]
				});
			}
		}]);

		return CRLDistributionPoints;
	}();

	var PolicyQualifierInfo = function () {
		function PolicyQualifierInfo() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PolicyQualifierInfo);

			this.policyQualifierId = getParametersValue(parameters, "policyQualifierId", PolicyQualifierInfo.defaultValues("policyQualifierId"));

			this.qualifier = getParametersValue(parameters, "qualifier", PolicyQualifierInfo.defaultValues("qualifier"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PolicyQualifierInfo, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["policyQualifierId", "qualifier"]);

				var asn1 = compareSchema(schema, schema, PolicyQualifierInfo.schema({
					names: {
						policyQualifierId: "policyQualifierId",
						qualifier: "qualifier"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyQualifierInfo");

				this.policyQualifierId = asn1.result.policyQualifierId.valueBlock.toString();
				this.qualifier = asn1.result.qualifier;
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.policyQualifierId }), this.qualifier]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					policyQualifierId: this.policyQualifierId,
					qualifier: this.qualifier.toJSON()
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "policyQualifierId":
						return "";
					case "qualifier":
						return new Any();
					default:
						throw new Error('Invalid member name for PolicyQualifierInfo class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.policyQualifierId || "" }), new Any({ name: names.qualifier || "" })]
				});
			}
		}]);

		return PolicyQualifierInfo;
	}();

	var PolicyInformation = function () {
		function PolicyInformation() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PolicyInformation);

			this.policyIdentifier = getParametersValue(parameters, "policyIdentifier", PolicyInformation.defaultValues("policyIdentifier"));

			if ("policyQualifiers" in parameters) this.policyQualifiers = getParametersValue(parameters, "policyQualifiers", PolicyInformation.defaultValues("policyQualifiers"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PolicyInformation, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["policyIdentifier", "policyQualifiers"]);

				var asn1 = compareSchema(schema, schema, PolicyInformation.schema({
					names: {
						policyIdentifier: "policyIdentifier",
						policyQualifiers: "policyQualifiers"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyInformation");

				this.policyIdentifier = asn1.result.policyIdentifier.valueBlock.toString();

				if ("policyQualifiers" in asn1.result) this.policyQualifiers = Array.from(asn1.result.policyQualifiers, function (element) {
					return new PolicyQualifierInfo({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.policyIdentifier }));

				if ("policyQualifiers" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.policyQualifiers, function (element) {
							return element.toSchema();
						})
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {
					policyIdentifier: this.policyIdentifier
				};

				if ("policyQualifiers" in this) object.policyQualifiers = Array.from(this.policyQualifiers, function (element) {
					return element.toJSON();
				});

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "policyIdentifier":
						return "";
					case "policyQualifiers":
						return [];
					default:
						throw new Error('Invalid member name for PolicyInformation class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.policyIdentifier || "" }), new Sequence({
						optional: true,
						value: [new Repeated({
							name: names.policyQualifiers || "",
							value: PolicyQualifierInfo.schema()
						})]
					})]
				});
			}
		}]);

		return PolicyInformation;
	}();

	var CertificatePolicies = function () {
		function CertificatePolicies() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, CertificatePolicies);

			this.certificatePolicies = getParametersValue(parameters, "certificatePolicies", CertificatePolicies.defaultValues("certificatePolicies"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(CertificatePolicies, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["certificatePolicies"]);

				var asn1 = compareSchema(schema, schema, CertificatePolicies.schema({
					names: {
						certificatePolicies: "certificatePolicies"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CertificatePolicies");

				this.certificatePolicies = Array.from(asn1.result.certificatePolicies, function (element) {
					return new PolicyInformation({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.certificatePolicies, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					certificatePolicies: Array.from(this.certificatePolicies, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certificatePolicies":
						return [];
					default:
						throw new Error('Invalid member name for CertificatePolicies class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.certificatePolicies || "",
						value: PolicyInformation.schema()
					})]
				});
			}
		}]);

		return CertificatePolicies;
	}();

	var PolicyMapping = function () {
		function PolicyMapping() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PolicyMapping);

			this.issuerDomainPolicy = getParametersValue(parameters, "issuerDomainPolicy", PolicyMapping.defaultValues("issuerDomainPolicy"));

			this.subjectDomainPolicy = getParametersValue(parameters, "subjectDomainPolicy", PolicyMapping.defaultValues("subjectDomainPolicy"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PolicyMapping, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["issuerDomainPolicy", "subjectDomainPolicy"]);

				var asn1 = compareSchema(schema, schema, PolicyMapping.schema({
					names: {
						issuerDomainPolicy: "issuerDomainPolicy",
						subjectDomainPolicy: "subjectDomainPolicy"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyMapping");

				this.issuerDomainPolicy = asn1.result.issuerDomainPolicy.valueBlock.toString();
				this.subjectDomainPolicy = asn1.result.subjectDomainPolicy.valueBlock.toString();
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.issuerDomainPolicy }), new ObjectIdentifier({ value: this.subjectDomainPolicy })]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					issuerDomainPolicy: this.issuerDomainPolicy,
					subjectDomainPolicy: this.subjectDomainPolicy
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "issuerDomainPolicy":
						return "";
					case "subjectDomainPolicy":
						return "";
					default:
						throw new Error('Invalid member name for PolicyMapping class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.issuerDomainPolicy || "" }), new ObjectIdentifier({ name: names.subjectDomainPolicy || "" })]
				});
			}
		}]);

		return PolicyMapping;
	}();

	var PolicyMappings = function () {
		function PolicyMappings() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PolicyMappings);

			this.mappings = getParametersValue(parameters, "mappings", PolicyMappings.defaultValues("mappings"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PolicyMappings, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["mappings"]);

				var asn1 = compareSchema(schema, schema, PolicyMappings.schema({
					names: {
						mappings: "mappings"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyMappings");

				this.mappings = Array.from(asn1.result.mappings, function (element) {
					return new PolicyMapping({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.mappings, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					mappings: Array.from(this.mappings, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "mappings":
						return [];
					default:
						throw new Error('Invalid member name for PolicyMappings class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.mappings || "",
						value: PolicyMapping.schema()
					})]
				});
			}
		}]);

		return PolicyMappings;
	}();

	var AuthorityKeyIdentifier = function () {
		function AuthorityKeyIdentifier() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, AuthorityKeyIdentifier);

			if ("keyIdentifier" in parameters) this.keyIdentifier = getParametersValue(parameters, "keyIdentifier", AuthorityKeyIdentifier.defaultValues("keyIdentifier"));

			if ("authorityCertIssuer" in parameters) this.authorityCertIssuer = getParametersValue(parameters, "authorityCertIssuer", AuthorityKeyIdentifier.defaultValues("authorityCertIssuer"));

			if ("authorityCertSerialNumber" in parameters) this.authorityCertSerialNumber = getParametersValue(parameters, "authorityCertSerialNumber", AuthorityKeyIdentifier.defaultValues("authorityCertSerialNumber"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(AuthorityKeyIdentifier, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["keyIdentifier", "authorityCertIssuer", "authorityCertSerialNumber"]);

				var asn1 = compareSchema(schema, schema, AuthorityKeyIdentifier.schema({
					names: {
						keyIdentifier: "keyIdentifier",
						authorityCertIssuer: "authorityCertIssuer",
						authorityCertSerialNumber: "authorityCertSerialNumber"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AuthorityKeyIdentifier");

				if ("keyIdentifier" in asn1.result) this.keyIdentifier = new OctetString({ valueHex: asn1.result.keyIdentifier.valueBlock.valueHex });

				if ("authorityCertIssuer" in asn1.result) this.authorityCertIssuer = Array.from(asn1.result.authorityCertIssuer, function (element) {
					return new GeneralName({ schema: element });
				});

				if ("authorityCertSerialNumber" in asn1.result) this.authorityCertSerialNumber = new Integer({ valueHex: asn1.result.authorityCertSerialNumber.valueBlock.valueHex });
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if ("keyIdentifier" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: this.keyIdentifier.valueBlock.value
					}));
				}

				if ("authorityCertIssuer" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: Array.from(this.authorityCertIssuer, function (element) {
							return element.toSchema();
						})
					}));
				}

				if ("authorityCertSerialNumber" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						value: this.authorityCertSerialNumber.valueBlock.value
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if ("keyIdentifier" in this) object.keyIdentifier = this.keyIdentifier.toJSON();

				if ("authorityCertIssuer" in this) object.authorityCertIssuer = Array.from(this.authorityCertIssuer, function (element) {
					return element.toJSON();
				});

				if ("authorityCertSerialNumber" in this) object.authorityCertSerialNumber = this.authorityCertSerialNumber.toJSON();

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyIdentifier":
						return new OctetString();
					case "authorityCertIssuer":
						return [];
					case "authorityCertSerialNumber":
						return new Integer();
					default:
						throw new Error('Invalid member name for AuthorityKeyIdentifier class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.keyIdentifier || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 }
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						value: [new Repeated({
							name: names.authorityCertIssuer || "",
							value: GeneralName.schema()
						})]
					}), new Primitive({
						name: names.authorityCertSerialNumber || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 2 }
					})]
				});
			}
		}]);

		return AuthorityKeyIdentifier;
	}();

	var PolicyConstraints = function () {
		function PolicyConstraints() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PolicyConstraints);

			if ("requireExplicitPolicy" in parameters) this.requireExplicitPolicy = getParametersValue(parameters, "requireExplicitPolicy", PolicyConstraints.defaultValues("requireExplicitPolicy"));

			if ("inhibitPolicyMapping" in parameters) this.inhibitPolicyMapping = getParametersValue(parameters, "inhibitPolicyMapping", PolicyConstraints.defaultValues("inhibitPolicyMapping"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(PolicyConstraints, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["requireExplicitPolicy", "inhibitPolicyMapping"]);

				var asn1 = compareSchema(schema, schema, PolicyConstraints.schema({
					names: {
						requireExplicitPolicy: "requireExplicitPolicy",
						inhibitPolicyMapping: "inhibitPolicyMapping"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyConstraints");

				if ("requireExplicitPolicy" in asn1.result) {
					var field1 = asn1.result.requireExplicitPolicy;

					field1.idBlock.tagClass = 1;
					field1.idBlock.tagNumber = 2;

					var ber1 = field1.toBER(false);
					var int1 = fromBER(ber1);

					this.requireExplicitPolicy = int1.result.valueBlock.valueDec;
				}

				if ("inhibitPolicyMapping" in asn1.result) {
					var field2 = asn1.result.inhibitPolicyMapping;

					field2.idBlock.tagClass = 1;
					field2.idBlock.tagNumber = 2;

					var ber2 = field2.toBER(false);
					var int2 = fromBER(ber2);

					this.inhibitPolicyMapping = int2.result.valueBlock.valueDec;
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				if ("requireExplicitPolicy" in this) {
					var int1 = new Integer({ value: this.requireExplicitPolicy });

					int1.idBlock.tagClass = 3;
					int1.idBlock.tagNumber = 0;

					outputArray.push(int1);
				}

				if ("inhibitPolicyMapping" in this) {
					var int2 = new Integer({ value: this.inhibitPolicyMapping });

					int2.idBlock.tagClass = 3;
					int2.idBlock.tagNumber = 1;

					outputArray.push(int2);
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				if ("requireExplicitPolicy" in this) object.requireExplicitPolicy = this.requireExplicitPolicy;

				if ("inhibitPolicyMapping" in this) object.inhibitPolicyMapping = this.inhibitPolicyMapping;

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "requireExplicitPolicy":
						return 0;
					case "inhibitPolicyMapping":
						return 0;
					default:
						throw new Error('Invalid member name for PolicyConstraints class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.requireExplicitPolicy || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 }
					}), new Primitive({
						name: names.inhibitPolicyMapping || "",
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 }
					})]
				});
			}
		}]);

		return PolicyConstraints;
	}();

	var ExtKeyUsage = function () {
		function ExtKeyUsage() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, ExtKeyUsage);

			this.keyPurposes = getParametersValue(parameters, "keyPurposes", ExtKeyUsage.defaultValues("keyPurposes"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(ExtKeyUsage, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["keyPurposes"]);

				var asn1 = compareSchema(schema, schema, ExtKeyUsage.schema({
					names: {
						keyPurposes: "keyPurposes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ExtKeyUsage");

				this.keyPurposes = Array.from(asn1.result.keyPurposes, function (element) {
					return element.valueBlock.toString();
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.keyPurposes, function (element) {
						return new ObjectIdentifier({ value: element });
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					keyPurposes: Array.from(this.keyPurposes)
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyPurposes":
						return [];
					default:
						throw new Error('Invalid member name for ExtKeyUsage class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.keyPurposes || "",
						value: new ObjectIdentifier()
					})]
				});
			}
		}]);

		return ExtKeyUsage;
	}();

	var InfoAccess = function () {
		function InfoAccess() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, InfoAccess);

			this.accessDescriptions = getParametersValue(parameters, "accessDescriptions", InfoAccess.defaultValues("accessDescriptions"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(InfoAccess, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["accessDescriptions"]);

				var asn1 = compareSchema(schema, schema, InfoAccess.schema({
					names: {
						accessDescriptions: "accessDescriptions"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for InfoAccess");

				this.accessDescriptions = Array.from(asn1.result.accessDescriptions, function (element) {
					return new AccessDescription({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.accessDescriptions, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					accessDescriptions: Array.from(this.accessDescriptions, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "accessDescriptions":
						return [];
					default:
						throw new Error('Invalid member name for InfoAccess class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.accessDescriptions || "",
						value: AccessDescription.schema()
					})]
				});
			}
		}]);

		return InfoAccess;
	}();

	var ByteStream = function () {
		function ByteStream() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, ByteStream);

			this.clear();

			var _iteratorNormalCompletion18 = true;
			var _didIteratorError18 = false;
			var _iteratorError18 = undefined;

			try {
				for (var _iterator18 = Object.keys(parameters)[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
					var key = _step18.value;

					switch (key) {
						case "length":
							this.length = parameters.length;
							break;
						case "stub":
							for (var i = 0; i < this._view.length; i++) {
								this._view[i] = parameters.stub;
							}break;
						case "view":
							this.fromUint8Array(parameters.view);
							break;
						case "buffer":
							this.fromArrayBuffer(parameters.buffer);
							break;
						case "string":
							this.fromString(parameters.string);
							break;
						case "hexstring":
							this.fromHexString(parameters.hexstring);
							break;
						default:
					}
				}
			} catch (err) {
				_didIteratorError18 = true;
				_iteratorError18 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion18 && _iterator18.return) {
						_iterator18.return();
					}
				} finally {
					if (_didIteratorError18) {
						throw _iteratorError18;
					}
				}
			}
		}

		_createClass(ByteStream, [{
			key: 'clear',
			value: function clear() {
				this._buffer = new ArrayBuffer(0);
				this._view = new Uint8Array(this._buffer);
			}
		}, {
			key: 'fromArrayBuffer',
			value: function fromArrayBuffer(array) {
				this.buffer = array;
			}
		}, {
			key: 'fromUint8Array',
			value: function fromUint8Array(array) {
				this._buffer = new ArrayBuffer(array.length);
				this._view = new Uint8Array(this._buffer);

				this._view.set(array);
			}
		}, {
			key: 'fromString',
			value: function fromString(string) {
				var stringLength = string.length;

				this.length = stringLength;

				for (var i = 0; i < stringLength; i++) {
					this.view[i] = string.charCodeAt(i);
				}
			}
		}, {
			key: 'toString',
			value: function toString() {
				var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.view.length - start;

				var result = "";

				if (start >= this.view.length || start < 0) {
					start = 0;
				}

				if (length >= this.view.length || length < 0) {
					length = this.view.length - start;
				}

				for (var i = start; i < start + length; i++) {
					result += String.fromCharCode(this.view[i]);
				}

				return result;
			}
		}, {
			key: 'fromHexString',
			value: function fromHexString(hexString) {
				var stringLength = hexString.length;

				this.buffer = new ArrayBuffer(stringLength >> 1);
				this.view = new Uint8Array(this.buffer);

				var hexMap = new Map();

				hexMap.set("0", 0x00);

				hexMap.set("1", 0x01);

				hexMap.set("2", 0x02);

				hexMap.set("3", 0x03);

				hexMap.set("4", 0x04);

				hexMap.set("5", 0x05);

				hexMap.set("6", 0x06);

				hexMap.set("7", 0x07);

				hexMap.set("8", 0x08);

				hexMap.set("9", 0x09);

				hexMap.set("A", 0x0A);

				hexMap.set("a", 0x0A);

				hexMap.set("B", 0x0B);

				hexMap.set("b", 0x0B);

				hexMap.set("C", 0x0C);

				hexMap.set("c", 0x0C);

				hexMap.set("D", 0x0D);

				hexMap.set("d", 0x0D);

				hexMap.set("E", 0x0E);

				hexMap.set("e", 0x0E);

				hexMap.set("F", 0x0F);

				hexMap.set("f", 0x0F);

				var j = 0;

				var temp = 0x00;

				for (var i = 0; i < stringLength; i++) {
					if (!(i % 2)) {
						temp = hexMap.get(hexString.charAt(i)) << 4;
					} else {
						temp |= hexMap.get(hexString.charAt(i));

						this.view[j] = temp;
						j++;
					}
				}
			}
		}, {
			key: 'toHexString',
			value: function toHexString() {
				var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.view.length - start;

				var result = "";

				if (start >= this.view.length || start < 0) {
					start = 0;
				}

				if (length >= this.view.length || length < 0) {
					length = this.view.length - start;
				}


				for (var i = start; i < start + length; i++) {
					var str = this.view[i].toString(16).toUpperCase();

					result = result + (str.length == 1 ? "0" : "") + str;
				}

				return result;
			}
		}, {
			key: 'copy',
			value: function copy() {
				var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._buffer.byteLength - start;

				if (start === 0 && this._buffer.byteLength === 0) return new ByteStream();

				if (start < 0 || start > this._buffer.byteLength - 1) throw new Error('Wrong start position: ' + start);


				var stream = new ByteStream();

				stream._buffer = this._buffer.slice(start, start + length);
				stream._view = new Uint8Array(stream._buffer);

				return stream;
			}
		}, {
			key: 'slice',
			value: function slice() {
				var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._buffer.byteLength;

				if (start === 0 && this._buffer.byteLength === 0) return new ByteStream();

				if (start < 0 || start > this._buffer.byteLength - 1) throw new Error('Wrong start position: ' + start);


				var stream = new ByteStream();

				stream._buffer = this._buffer.slice(start, end);
				stream._view = new Uint8Array(stream._buffer);

				return stream;
			}
		}, {
			key: 'realloc',
			value: function realloc(size) {
				var buffer = new ArrayBuffer(size);
				var view = new Uint8Array(buffer);

				if (size > this._view.length) view.set(this._view);else {
					view.set(new Uint8Array(this._buffer, 0, size));
				}

				this._buffer = buffer.slice(0);
				this._view = new Uint8Array(this._buffer);
			}
		}, {
			key: 'append',
			value: function append(stream) {
				var initialSize = this._buffer.byteLength;
				var streamViewLength = stream._buffer.byteLength;

				var copyView = stream._view.slice();

				this.realloc(initialSize + streamViewLength);

				this._view.set(copyView, initialSize);
			}
		}, {
			key: 'insert',
			value: function insert(stream) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._buffer.byteLength - start;

				if (start > this._buffer.byteLength - 1) return false;

				if (length > this._buffer.byteLength - start) {
					length = this._buffer.byteLength - start;
				}

				if (length > stream._buffer.byteLength) {
					length = stream._buffer.byteLength;
				}

				if (length == stream._buffer.byteLength) this._view.set(stream._view, start);else {
					this._view.set(stream._view.slice(0, length), start);
				}


				return true;
			}
		}, {
			key: 'isEqual',
			value: function isEqual(stream) {
				if (this._buffer.byteLength != stream._buffer.byteLength) return false;

				for (var i = 0; i < stream._buffer.byteLength; i++) {
					if (this.view[i] != stream.view[i]) return false;
				}


				return true;
			}
		}, {
			key: 'isEqualView',
			value: function isEqualView(view) {
				if (view.length != this.view.length) return false;

				for (var i = 0; i < view.length; i++) {
					if (this.view[i] != view[i]) return false;
				}


				return true;
			}
		}, {
			key: 'findPattern',
			value: function findPattern(pattern) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var backward = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				if (start == null) {
					start = backward ? this.buffer.byteLength : 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (backward) {
					if (length == null) {
						length = start;
					}

					if (length > start) {
						length = start;
					}
				} else {
					if (length == null) {
						length = this.buffer.byteLength - start;
					}

					if (length > this.buffer.byteLength - start) {
						length = this.buffer.byteLength - start;
					}
				}

				var patternLength = pattern.buffer.byteLength;

				if (patternLength > length) return -1;

				var patternArray = [];

				for (var i = 0; i < patternLength; i++) {
					patternArray.push(pattern.view[i]);
				}
				for (var _i18 = 0; _i18 <= length - patternLength; _i18++) {
					var equal = true;

					var equalStart = backward ? start - patternLength - _i18 : start + _i18;

					for (var j = 0; j < patternLength; j++) {
						if (this.view[j + equalStart] != patternArray[j]) {
							equal = false;

							break;
						}
					}

					if (equal) {
						return backward ? start - patternLength - _i18 : start + patternLength + _i18;
					}
				}


				return -1;
			}
		}, {
			key: 'findFirstIn',
			value: function findFirstIn(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var backward = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				if (start == null) {
					start = backward ? this.buffer.byteLength : 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (backward) {
					if (length == null) {
						length = start;
					}

					if (length > start) {
						length = start;
					}
				} else {
					if (length == null) {
						length = this.buffer.byteLength - start;
					}

					if (length > this.buffer.byteLength - start) {
						length = this.buffer.byteLength - start;
					}
				}

				var result = {
					id: -1,
					position: backward ? 0 : start + length
				};


				for (var i = 0; i < patterns.length; i++) {
					var position = this.findPattern(patterns[i], start, length, backward);

					if (position != -1) {
						var valid = false;

						if (backward) {
							if (position >= result.position) valid = true;
						} else {
							if (position <= result.position) valid = true;
						}

						if (valid) {
							result.position = position;
							result.id = i;
						}
					}
				}

				return result;
			}
		}, {
			key: 'findAllIn',
			value: function findAllIn(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.buffer.byteLength - start;

				var result = [];

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength - 1) return result;

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				var patternFound = {
					id: -1,
					position: start
				};

				do {
					var position = patternFound.position;

					patternFound = this.findFirstIn(patterns, patternFound.position, length);

					if (patternFound.id == -1) {
						break;
					}

					length -= patternFound.position - position;

					result.push({
						id: patternFound.id,
						position: patternFound.position
					});
				} while (true);

				return result;
			}
		}, {
			key: 'findAllPatternIn',
			value: function findAllPatternIn(pattern) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.buffer.byteLength - start;

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				var result = [];

				var patternLength = pattern.buffer.byteLength;

				if (patternLength > length) return -1;

				var patternArray = Array.from(pattern.view);

				for (var i = 0; i <= length - patternLength; i++) {
					var equal = true;
					var equalStart = start + i;

					for (var j = 0; j < patternLength; j++) {
						if (this.view[j + equalStart] != patternArray[j]) {
							equal = false;

							break;
						}
					}

					if (equal) {
						result.push(start + patternLength + i);
						i += patternLength - 1;
					}
				}


				return result;
			}
		}, {
			key: 'findFirstNotIn',
			value: function findFirstNotIn(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var backward = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				if (start == null) {
					start = backward ? this.buffer.byteLength : 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (backward) {
					if (length == null) {
						length = start;
					}

					if (length > start) {
						length = start;
					}
				} else {
					if (length == null) {
						length = this.buffer.byteLength - start;
					}

					if (length > this.buffer.byteLength - start) {
						length = this.buffer.byteLength - start;
					}
				}

				var result = {
					left: {
						id: -1,
						position: start
					},
					right: {
						id: -1,
						position: 0
					},
					value: new ByteStream()
				};

				var currentLength = length;

				while (currentLength > 0) {
					result.right = this.findFirstIn(patterns, backward ? start - length + currentLength : start + length - currentLength, currentLength, backward);

					if (result.right.id == -1) {
						length = currentLength;

						if (backward) {
							start -= length;
						} else {
							start = result.left.position;
						}

						result.value = new ByteStream();

						result.value._buffer = this._buffer.slice(start, start + length);
						result.value._view = new Uint8Array(result.value._buffer);

						break;
					}

					if (result.right.position != (backward ? result.left.position - patterns[result.right.id].buffer.byteLength : result.left.position + patterns[result.right.id].buffer.byteLength)) {
						if (backward) {
							start = result.right.position + patterns[result.right.id].buffer.byteLength;

							length = result.left.position - result.right.position - patterns[result.right.id].buffer.byteLength;
						} else {
							start = result.left.position;

							length = result.right.position - result.left.position - patterns[result.right.id].buffer.byteLength;
						}

						result.value = new ByteStream();

						result.value._buffer = this._buffer.slice(start, start + length);
						result.value._view = new Uint8Array(result.value._buffer);

						break;
					}

					result.left = result.right;

					currentLength -= patterns[result.right.id]._buffer.byteLength;
				}

				if (backward) {
					var temp = result.right;
					result.right = result.left;
					result.left = temp;
				}


				return result;
			}
		}, {
			key: 'findAllNotIn',
			value: function findAllNotIn(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				var result = [];

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength - 1) return result;

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				var patternFound = {
					left: {
						id: -1,
						position: start
					},
					right: {
						id: -1,
						position: start
					},
					value: new ByteStream()
				};

				do {
					var position = patternFound.right.position;

					patternFound = this.findFirstNotIn(patterns, patternFound.right.position, length);

					length -= patternFound.right.position - position;

					result.push({
						left: {
							id: patternFound.left.id,
							position: patternFound.left.position
						},
						right: {
							id: patternFound.right.id,
							position: patternFound.right.position
						},
						value: patternFound.value
					});
				} while (patternFound.right.id != -1);


				return result;
			}
		}, {
			key: 'findFirstSequence',
			value: function findFirstSequence(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var backward = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				if (start == null) {
					start = backward ? this.buffer.byteLength : 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (backward) {
					if (length == null) {
						length = start;
					}

					if (length > start) {
						length = start;
					}
				} else {
					if (length == null) {
						length = this.buffer.byteLength - start;
					}

					if (length > this.buffer.byteLength - start) {
						length = this.buffer.byteLength - start;
					}
				}

				var firstIn = this.skipNotPatterns(patterns, start, length, backward);

				if (firstIn == -1) {
					return {
						position: -1,
						value: new ByteStream()
					};
				}

				var firstNotIn = this.skipPatterns(patterns, firstIn, length - (backward ? start - firstIn : firstIn - start), backward);

				if (backward) {
					start = firstNotIn;

					length = firstIn - firstNotIn;
				} else {
					start = firstIn;

					length = firstNotIn - firstIn;
				}

				var value = new ByteStream();

				value._buffer = this._buffer.slice(start, start + length);
				value._view = new Uint8Array(value._buffer);


				return {
					position: firstNotIn,
					value: value
				};
			}
		}, {
			key: 'findAllSequences',
			value: function findAllSequences(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				var result = [];

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength - 1) return result;

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				var patternFound = {
					position: start,
					value: new ByteStream()
				};

				do {
					var position = patternFound.position;

					patternFound = this.findFirstSequence(patterns, patternFound.position, length);

					if (patternFound.position != -1) {
						length -= patternFound.position - position;

						result.push({
							position: patternFound.position,
							value: patternFound.value
						});
					}
				} while (patternFound.position != -1);


				return result;
			}
		}, {
			key: 'findPairedPatterns',
			value: function findPairedPatterns(leftPattern, rightPattern) {
				var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

				var result = [];

				if (leftPattern.isEqual(rightPattern)) return result;

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength - 1) return result;

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				var currentPositionLeft = 0;

				var leftPatterns = this.findAllPatternIn(leftPattern, start, length);

				if (leftPatterns.length == 0) return result;

				var rightPatterns = this.findAllPatternIn(rightPattern, start, length);

				if (rightPatterns.length == 0) return result;

				while (currentPositionLeft < leftPatterns.length) {
					if (rightPatterns.length == 0) {
						break;
					}

					if (leftPatterns[0] == rightPatterns[0]) {

						result.push({
							left: leftPatterns[0],
							right: rightPatterns[0]
						});

						leftPatterns.splice(0, 1);
						rightPatterns.splice(0, 1);

						continue;
					}

					if (leftPatterns[currentPositionLeft] > rightPatterns[0]) {
						break;
					}

					while (leftPatterns[currentPositionLeft] < rightPatterns[0]) {
						currentPositionLeft++;

						if (currentPositionLeft >= leftPatterns.length) {
							break;
						}
					}

					result.push({
						left: leftPatterns[currentPositionLeft - 1],
						right: rightPatterns[0]
					});

					leftPatterns.splice(currentPositionLeft - 1, 1);
					rightPatterns.splice(0, 1);

					currentPositionLeft = 0;
				}

				result.sort(function (a, b) {
					return a.left - b.left;
				});


				return result;
			}
		}, {
			key: 'findPairedArrays',
			value: function findPairedArrays(inputLeftPatterns, inputRightPatterns) {
				var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

				var result = [];

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength - 1) return result;

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				var currentPositionLeft = 0;

				var leftPatterns = this.findAllIn(inputLeftPatterns, start, length);

				if (leftPatterns.length == 0) return result;

				var rightPatterns = this.findAllIn(inputRightPatterns, start, length);

				if (rightPatterns.length == 0) return result;

				while (currentPositionLeft < leftPatterns.length) {
					if (rightPatterns.length == 0) {
						break;
					}

					if (leftPatterns[0].position == rightPatterns[0].position) {

						result.push({
							left: leftPatterns[0],
							right: rightPatterns[0]
						});

						leftPatterns.splice(0, 1);
						rightPatterns.splice(0, 1);

						continue;
					}

					if (leftPatterns[currentPositionLeft].position > rightPatterns[0].position) {
						break;
					}

					while (leftPatterns[currentPositionLeft].position < rightPatterns[0].position) {
						currentPositionLeft++;

						if (currentPositionLeft >= leftPatterns.length) {
							break;
						}
					}

					result.push({
						left: leftPatterns[currentPositionLeft - 1],
						right: rightPatterns[0]
					});

					leftPatterns.splice(currentPositionLeft - 1, 1);
					rightPatterns.splice(0, 1);

					currentPositionLeft = 0;
				}

				result.sort(function (a, b) {
					return a.left.position - b.left.position;
				});


				return result;
			}
		}, {
			key: 'replacePattern',
			value: function replacePattern(searchPattern, _replacePattern) {
				var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				var _output$searchPattern;

				var length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
				var findAllResult = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

				var result = void 0;

				var i = void 0;
				var output = {
					status: -1,
					searchPatternPositions: [],
					replacePatternPositions: []
				};

				if (start == null) {
					start = 0;
				}

				if (start > this.buffer.byteLength - 1) return false;

				if (length == null) {
					length = this.buffer.byteLength - start;
				}

				if (length > this.buffer.byteLength - start) {
					length = this.buffer.byteLength - start;
				}

				if (findAllResult == null) {
					result = this.findAllIn([searchPattern], start, length);

					if (result.length == 0) return output;
				} else result = findAllResult;

				(_output$searchPattern = output.searchPatternPositions).push.apply(_output$searchPattern, _toConsumableArray(Array.from(result, function (element) {
					return element.position;
				})));

				var patternDifference = searchPattern.buffer.byteLength - _replacePattern.buffer.byteLength;

				var changedBuffer = new ArrayBuffer(this.view.length - result.length * patternDifference);
				var changedView = new Uint8Array(changedBuffer);

				changedView.set(new Uint8Array(this.buffer, 0, start));

				for (i = 0; i < result.length; i++) {
					var currentPosition = i == 0 ? start : result[i - 1].position;

					changedView.set(new Uint8Array(this.buffer, currentPosition, result[i].position - searchPattern.buffer.byteLength - currentPosition), currentPosition - i * patternDifference);

					changedView.set(_replacePattern.view, result[i].position - searchPattern.buffer.byteLength - i * patternDifference);

					output.replacePatternPositions.push(result[i].position - searchPattern.buffer.byteLength - i * patternDifference);
				}

				i--;

				changedView.set(new Uint8Array(this.buffer, result[i].position, this.buffer.byteLength - result[i].position), result[i].position - searchPattern.buffer.byteLength + _replacePattern.buffer.byteLength - i * patternDifference);

				this.buffer = changedBuffer;
				this.view = new Uint8Array(this.buffer);


				output.status = 1;

				return output;
			}
		}, {
			key: 'skipPatterns',
			value: function skipPatterns(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var backward = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				if (start == null) {
					start = backward ? this.buffer.byteLength : 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (backward) {
					if (length == null) {
						length = start;
					}

					if (length > start) {
						length = start;
					}
				} else {
					if (length == null) {
						length = this.buffer.byteLength - start;
					}

					if (length > this.buffer.byteLength - start) {
						length = this.buffer.byteLength - start;
					}
				}

				var result = start;

				for (var k = 0; k < patterns.length; k++) {
					var patternLength = patterns[k].buffer.byteLength;

					var equalStart = backward ? result - patternLength : result;
					var equal = true;

					for (var j = 0; j < patternLength; j++) {
						if (this.view[j + equalStart] != patterns[k].view[j]) {
							equal = false;

							break;
						}
					}

					if (equal) {
						k = -1;

						if (backward) {
							result -= patternLength;

							if (result <= 0) return result;
						} else {
							result += patternLength;

							if (result >= start + length) return result;
						}
					}
				}


				return result;
			}
		}, {
			key: 'skipNotPatterns',
			value: function skipNotPatterns(patterns) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var backward = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				if (start == null) {
					start = backward ? this.buffer.byteLength : 0;
				}

				if (start > this.buffer.byteLength) {
					start = this.buffer.byteLength;
				}

				if (backward) {
					if (length == null) {
						length = start;
					}

					if (length > start) {
						length = start;
					}
				} else {
					if (length == null) {
						length = this.buffer.byteLength - start;
					}

					if (length > this.buffer.byteLength - start) {
						length = this.buffer.byteLength - start;
					}
				}

				var result = -1;

				for (var i = 0; i < length; i++) {
					for (var k = 0; k < patterns.length; k++) {
						var patternLength = patterns[k].buffer.byteLength;

						var equalStart = backward ? start - i - patternLength : start + i;
						var equal = true;

						for (var j = 0; j < patternLength; j++) {
							if (this.view[j + equalStart] != patterns[k].view[j]) {
								equal = false;

								break;
							}
						}

						if (equal) {
							result = backward ? start - i : start + i;
							break;
						}
					}

					if (result != -1) {
						break;
					}
				}


				return result;
			}
		}, {
			key: 'buffer',
			set: function set(value) {
				this._buffer = value.slice(0);
				this._view = new Uint8Array(this._buffer);
			},
			get: function get() {
				return this._buffer;
			}
		}, {
			key: 'view',
			set: function set(value) {
				this._buffer = new ArrayBuffer(value.length);
				this._view = new Uint8Array(this._buffer);

				this._view.set(value);
			},
			get: function get() {
				return this._view;
			}
		}, {
			key: 'length',
			get: function get() {
				return this._buffer.byteLength;
			},
			set: function set(value) {
				this._buffer = new ArrayBuffer(value);
				this._view = new Uint8Array(this._buffer);
			}
		}]);

		return ByteStream;
	}();

	var SeqStream = function () {
		function SeqStream() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, SeqStream);

			this.stream = new ByteStream();

			this._length = 0;

			this.backward = false;

			this._start = 0;

			this.appendBlock = 0;

			this.prevLength = 0;
			this.prevStart = 0;

			var _iteratorNormalCompletion19 = true;
			var _didIteratorError19 = false;
			var _iteratorError19 = undefined;

			try {
				for (var _iterator19 = Object.keys(parameters)[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
					var key = _step19.value;

					switch (key) {
						case "stream":
							this.stream = parameters.stream;
							break;
						case "backward":
							this.backward = parameters.backward;

							this._start = this.stream.buffer.byteLength;
							break;
						case "length":
							this._length = parameters.length;
							break;
						case "start":
							this._start = parameters.start;
							break;
						case "appendBlock":
							this.appendBlock = parameters.appendBlock;
							break;
						case "view":
							this.stream = new ByteStream({ view: parameters.view });
							break;
						case "buffer":
							this.stream = new ByteStream({ buffer: parameters.buffer });
							break;
						case "string":
							this.stream = new ByteStream({ string: parameters.string });
							break;
						case "hexstring":
							this.stream = new ByteStream({ hexstring: parameters.hexstring });
							break;
						default:
					}
				}
			} catch (err) {
				_didIteratorError19 = true;
				_iteratorError19 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion19 && _iterator19.return) {
						_iterator19.return();
					}
				} finally {
					if (_didIteratorError19) {
						throw _iteratorError19;
					}
				}
			}
		}

		_createClass(SeqStream, [{
			key: 'resetPosition',
			value: function resetPosition() {
				this._start = this.prevStart;

				this._length = this.prevLength;
			}
		}, {
			key: 'findPattern',
			value: function findPattern(pattern) {
				var gap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				if (gap == null || gap > this.length) {
					gap = this.length;
				}

				var result = this.stream.findPattern(pattern, this.start, this.length, this.backward);

				if (result == -1) return result;

				if (this.backward) {
					if (result < this.start - pattern.buffer.byteLength - gap) return -1;
				} else {
					if (result > this.start + pattern.buffer.byteLength + gap) return -1;
				}

				this.start = result;


				return result;
			}
		}, {
			key: 'findFirstIn',
			value: function findFirstIn(patterns) {
				var gap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				if (gap == null || gap > this.length) {
					gap = this.length;
				}

				var result = this.stream.findFirstIn(patterns, this.start, this.length, this.backward);

				if (result.id == -1) return result;

				if (this.backward) {
					if (result.position < this.start - patterns[result.id].buffer.byteLength - gap) {
						return {
							id: -1,
							position: this.backward ? 0 : this.start + this.length
						};
					}
				} else {
					if (result.position > this.start + patterns[result.id].buffer.byteLength + gap) {
						return {
							id: -1,
							position: this.backward ? 0 : this.start + this.length
						};
					}
				}

				this.start = result.position;


				return result;
			}
		}, {
			key: 'findAllIn',
			value: function findAllIn(patterns) {
				var start = this.backward ? this.start - this.length : this.start;

				return this.stream.findAllIn(patterns, start, this.length);
			}
		}, {
			key: 'findFirstNotIn',
			value: function findFirstNotIn(patterns) {
				var gap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				if (gap == null || gap > this._length) {
					gap = this._length;
				}

				var result = this._stream.findFirstNotIn(patterns, this._start, this._length, this.backward);

				if (result.left.id == -1 && result.right.id == -1) return result;

				if (this.backward) {
					if (result.right.id != -1) {
						if (result.right.position < this._start - patterns[result.right.id]._buffer.byteLength - gap) {
							return {
								left: {
									id: -1,
									position: this._start
								},
								right: {
									id: -1,
									position: 0
								},
								value: new ByteStream()
							};
						}
					}
				} else {
					if (result.left.id != -1) {
						if (result.left.position > this._start + patterns[result.left.id]._buffer.byteLength + gap) {
							return {
								left: {
									id: -1,
									position: this._start
								},
								right: {
									id: -1,
									position: 0
								},
								value: new ByteStream()
							};
						}
					}
				}

				if (this.backward) {
					if (result.left.id == -1) this.start = 0;else this.start = result.left.position;
				} else {
					if (result.right.id == -1) this.start = this._start + this._length;else this.start = result.right.position;
				}


				return result;
			}
		}, {
			key: 'findAllNotIn',
			value: function findAllNotIn(patterns) {
				var start = this.backward ? this._start - this._length : this._start;

				return this._stream.findAllNotIn(patterns, start, this._length);
			}
		}, {
			key: 'findFirstSequence',
			value: function findFirstSequence(patterns) {
				var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var gap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				if (length == null || length > this._length) {
					length = this._length;
				}

				if (gap == null || gap > length) {
					gap = length;
				}

				var result = this._stream.findFirstSequence(patterns, this._start, length, this.backward);

				if (result.value.buffer.byteLength == 0) return result;

				if (this.backward) {
					if (result.position < this._start - result.value._buffer.byteLength - gap) {
						return {
							position: -1,
							value: new ByteStream()
						};
					}
				} else {
					if (result.position > this._start + result.value._buffer.byteLength + gap) {
						return {
							position: -1,
							value: new ByteStream()
						};
					}
				}

				this.start = result.position;


				return result;
			}
		}, {
			key: 'findAllSequences',
			value: function findAllSequences(patterns) {
				var start = this.backward ? this.start - this.length : this.start;

				return this.stream.findAllSequences(patterns, start, this.length);
			}
		}, {
			key: 'findPairedPatterns',
			value: function findPairedPatterns(leftPattern, rightPattern) {
				var gap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				if (gap == null || gap > this.length) {
					gap = this.length;
				}

				var start = this.backward ? this.start - this.length : this.start;

				var result = this.stream.findPairedPatterns(leftPattern, rightPattern, start, this.length);
				if (result.length) {
					if (this.backward) {
						if (result[0].right < this.start - rightPattern.buffer.byteLength - gap) return [];
					} else {
						if (result[0].left > this.start + leftPattern.buffer.byteLength + gap) return [];
					}
				}


				return result;
			}
		}, {
			key: 'findPairedArrays',
			value: function findPairedArrays(leftPatterns, rightPatterns) {
				var gap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				if (gap == null || gap > this.length) {
					gap = this.length;
				}

				var start = this.backward ? this.start - this.length : this.start;

				var result = this.stream.findPairedArrays(leftPatterns, rightPatterns, start, this.length);
				if (result.length) {
					if (this.backward) {
						if (result[0].right.position < this.start - rightPatterns[result[0].right.id].buffer.byteLength - gap) return [];
					} else {
						if (result[0].left.position > this.start + leftPatterns[result[0].left.id].buffer.byteLength + gap) return [];
					}
				}


				return result;
			}
		}, {
			key: 'replacePattern',
			value: function replacePattern(searchPattern, _replacePattern2) {
				var start = this.backward ? this.start - this.length : this.start;

				return this.stream.replacePattern(searchPattern, _replacePattern2, start, this.length);
			}
		}, {
			key: 'skipPatterns',
			value: function skipPatterns(patterns) {
				var result = this.stream.skipPatterns(patterns, this.start, this.length, this.backward);

				this.start = result;


				return result;
			}
		}, {
			key: 'skipNotPatterns',
			value: function skipNotPatterns(patterns) {
				var result = this.stream.skipNotPatterns(patterns, this.start, this.length, this.backward);

				if (result == -1) return -1;

				this.start = result;


				return result;
			}
		}, {
			key: 'append',
			value: function append(stream) {
				if (this._start + stream._buffer.byteLength > this._stream._buffer.byteLength) {
					if (stream._buffer.byteLength > this.appendBlock) {
						this.appendBlock = stream._buffer.byteLength + 1000;
					}

					this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
				}

				this._stream._view.set(stream._view, this._start);

				this._length += stream._buffer.byteLength * 2;
				this.start = this._start + stream._buffer.byteLength;
				this.prevLength -= stream._buffer.byteLength * 2;
			}
		}, {
			key: 'appendView',
			value: function appendView(view) {
				if (this._start + view.length > this._stream._buffer.byteLength) {
					if (view.length > this.appendBlock) {
						this.appendBlock = view.length + 1000;
					}

					this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
				}

				this._stream._view.set(view, this._start);

				this._length += view.length * 2;
				this.start = this._start + view.length;
				this.prevLength -= view.length * 2;
			}
		}, {
			key: 'appendChar',
			value: function appendChar(char) {
				if (this._start + 1 > this._stream._buffer.byteLength) {
					if (1 > this.appendBlock) {
						this.appendBlock = 1000;
					}

					this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
				}

				this._stream._view[this._start] = char;

				this._length += 2;
				this.start = this._start + 1;
				this.prevLength -= 2;
			}
		}, {
			key: 'appendUint16',
			value: function appendUint16(number) {
				if (this._start + 2 > this._stream._buffer.byteLength) {
					if (2 > this.appendBlock) {
						this.appendBlock = 1000;
					}

					this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
				}

				var value = new Uint16Array([number]);
				var view = new Uint8Array(value.buffer);

				this._stream._view[this._start] = view[1];
				this._stream._view[this._start + 1] = view[0];

				this._length += 4;
				this.start = this._start + 2;
				this.prevLength -= 4;
			}
		}, {
			key: 'appendUint24',
			value: function appendUint24(number) {
				if (this._start + 3 > this._stream._buffer.byteLength) {
					if (3 > this.appendBlock) {
						this.appendBlock = 1000;
					}

					this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
				}

				var value = new Uint32Array([number]);
				var view = new Uint8Array(value.buffer);

				this._stream._view[this._start] = view[2];
				this._stream._view[this._start + 1] = view[1];
				this._stream._view[this._start + 2] = view[0];

				this._length += 6;
				this.start = this._start + 3;
				this.prevLength -= 6;
			}
		}, {
			key: 'appendUint32',
			value: function appendUint32(number) {
				if (this._start + 4 > this._stream._buffer.byteLength) {
					if (4 > this.appendBlock) {
						this.appendBlock = 1000;
					}

					this._stream.realloc(this._stream._buffer.byteLength + this.appendBlock);
				}

				var value = new Uint32Array([number]);
				var view = new Uint8Array(value.buffer);

				this._stream._view[this._start] = view[3];
				this._stream._view[this._start + 1] = view[2];
				this._stream._view[this._start + 2] = view[1];
				this._stream._view[this._start + 3] = view[0];

				this._length += 8;
				this.start = this._start + 4;
				this.prevLength -= 8;
			}
		}, {
			key: 'getBlock',
			value: function getBlock(size) {
				var changeLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				if (this._length <= 0) return [];

				if (this._length < size) {
					size = this._length;
				}

				var result = void 0;

				if (this.backward) {
					var buffer = this._stream._buffer.slice(this._length - size, this._length);
					var view = new Uint8Array(buffer);

					result = new Array(size);

					for (var i = 0; i < size; i++) {
						result[size - 1 - i] = view[i];
					}
				} else {
					var _buffer2 = this._stream._buffer.slice(this._start, this._start + size);

					result = Array.from(new Uint8Array(_buffer2));
				}

				if (changeLength) {
					this.start += this.backward ? -1 * size : size;
				}


				return result;
			}
		}, {
			key: 'getUint16',
			value: function getUint16() {
				var changeLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

				var block = this.getBlock(2, changeLength);

				if (block.length < 2) return 0;

				var value = new Uint16Array(1);
				var view = new Uint8Array(value.buffer);

				view[0] = block[1];
				view[1] = block[0];


				return value[0];
			}
		}, {
			key: 'getUint24',
			value: function getUint24() {
				var changeLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

				var block = this.getBlock(3, changeLength);

				if (block.length < 3) return 0;

				var value = new Uint32Array(1);
				var view = new Uint8Array(value.buffer);

				for (var i = 3; i >= 1; i--) {
					view[3 - i] = block[i - 1];
				}

				return value[0];
			}
		}, {
			key: 'getUint32',
			value: function getUint32() {
				var changeLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

				var block = this.getBlock(4, changeLength);

				if (block.length < 4) return 0;

				var value = new Uint32Array(1);
				var view = new Uint8Array(value.buffer);

				for (var i = 3; i >= 0; i--) {
					view[3 - i] = block[i];
				}

				return value[0];
			}
		}, {
			key: 'stream',
			set: function set(value) {
				this._stream = value;

				this.prevLength = this._length;

				this._length = value._buffer.byteLength;

				this.prevStart = this._start;

				this._start = 0;
			},
			get: function get() {
				return this._stream;
			}
		}, {
			key: 'length',
			set: function set(value) {
				this.prevLength = this._length;

				this._length = value;
			},
			get: function get() {
				if (this.appendBlock) return this.start;

				return this._length;
			}
		}, {
			key: 'start',
			set: function set(value) {
				if (value > this.stream.buffer.byteLength) return;

				this.prevStart = this._start;
				this.prevLength = this._length;

				this._length -= this.backward ? this._start - value : value - this._start;

				this._start = value;
			},
			get: function get() {
				return this._start;
			}
		}, {
			key: 'buffer',
			get: function get() {
				return this._stream._buffer.slice(0, this._length);
			}
		}]);

		return SeqStream;
	}();

	var SignedCertificateTimestamp = function () {
		function SignedCertificateTimestamp() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, SignedCertificateTimestamp);

			this.version = getParametersValue(parameters, "version", SignedCertificateTimestamp.defaultValues("version"));

			this.logID = getParametersValue(parameters, "logID", SignedCertificateTimestamp.defaultValues("logID"));

			this.timestamp = getParametersValue(parameters, "timestamp", SignedCertificateTimestamp.defaultValues("timestamp"));

			this.extensions = getParametersValue(parameters, "extensions", SignedCertificateTimestamp.defaultValues("extensions"));

			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", SignedCertificateTimestamp.defaultValues("hashAlgorithm"));

			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", SignedCertificateTimestamp.defaultValues("signatureAlgorithm"));

			this.signature = getParametersValue(parameters, "signature", SignedCertificateTimestamp.defaultValues("signature"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);

			if ("stream" in parameters) this.fromStream(parameters.stream);
		}

		_createClass(SignedCertificateTimestamp, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				if (schema instanceof RawData === false) throw new Error("Object's schema was not verified against input data for SignedCertificateTimestamp");

				var seqStream = new SeqStream({
					stream: new ByteStream({
						buffer: schema.data
					})
				});

				this.fromStream(seqStream);
			}
		}, {
			key: 'fromStream',
			value: function fromStream(stream) {
				var blockLength = stream.getUint16();

				this.version = stream.getBlock(1)[0];

				if (this.version === 0) {
					this.logID = new Uint8Array(stream.getBlock(32)).buffer.slice(0);
					this.timestamp = new Date(utilFromBase(new Uint8Array(stream.getBlock(8)), 8));

					var extensionsLength = stream.getUint16();
					this.extensions = new Uint8Array(stream.getBlock(extensionsLength)).buffer.slice(0);

					switch (stream.getBlock(1)[0]) {
						case 0:
							this.hashAlgorithm = "none";
							break;
						case 1:
							this.hashAlgorithm = "md5";
							break;
						case 2:
							this.hashAlgorithm = "sha1";
							break;
						case 3:
							this.hashAlgorithm = "sha224";
							break;
						case 4:
							this.hashAlgorithm = "sha256";
							break;
						case 5:
							this.hashAlgorithm = "sha384";
							break;
						case 6:
							this.hashAlgorithm = "sha512";
							break;
						default:
							throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
					}

					switch (stream.getBlock(1)[0]) {
						case 0:
							this.signatureAlgorithm = "anonymous";
							break;
						case 1:
							this.signatureAlgorithm = "rsa";
							break;
						case 2:
							this.signatureAlgorithm = "dsa";
							break;
						case 3:
							this.signatureAlgorithm = "ecdsa";
							break;
						default:
							throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
					}

					var signatureLength = stream.getUint16();
					var signatureData = new Uint8Array(stream.getBlock(signatureLength)).buffer.slice(0);

					var asn1 = fromBER(signatureData);
					if (asn1.offset === -1) throw new Error("Object's stream was not correct for SignedCertificateTimestamp");

					this.signature = asn1.result;


					if (blockLength !== 47 + extensionsLength + signatureLength) throw new Error("Object's stream was not correct for SignedCertificateTimestamp");
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var stream = this.toStream();

				return new RawData({ data: stream.stream.buffer });
			}
		}, {
			key: 'toStream',
			value: function toStream() {
				var stream = new SeqStream();

				stream.appendUint16(47 + this.extensions.byteLength + this.signature.valueBeforeDecode.byteLength);
				stream.appendChar(this.version);
				stream.appendView(new Uint8Array(this.logID));

				var timeBuffer = new ArrayBuffer(8);
				var timeView = new Uint8Array(timeBuffer);

				var baseArray = utilToBase(this.timestamp.valueOf(), 8);
				timeView.set(new Uint8Array(baseArray), 8 - baseArray.byteLength);

				stream.appendView(timeView);
				stream.appendUint16(this.extensions.byteLength);

				if (this.extensions.byteLength) stream.appendView(new Uint8Array(this.extensions));

				var _hashAlgorithm = void 0;

				switch (this.hashAlgorithm.toLowerCase()) {
					case "none":
						_hashAlgorithm = 0;
						break;
					case "md5":
						_hashAlgorithm = 1;
						break;
					case "sha1":
						_hashAlgorithm = 2;
						break;
					case "sha224":
						_hashAlgorithm = 3;
						break;
					case "sha256":
						_hashAlgorithm = 4;
						break;
					case "sha384":
						_hashAlgorithm = 5;
						break;
					case "sha512":
						_hashAlgorithm = 6;
						break;
					default:
						throw new Error('Incorrect data for hashAlgorithm: ' + this.hashAlgorithm);
				}

				stream.appendChar(_hashAlgorithm);

				var _signatureAlgorithm = void 0;

				switch (this.signatureAlgorithm.toLowerCase()) {
					case "anonymous":
						_signatureAlgorithm = 0;
						break;
					case "rsa":
						_signatureAlgorithm = 1;
						break;
					case "dsa":
						_signatureAlgorithm = 2;
						break;
					case "ecdsa":
						_signatureAlgorithm = 3;
						break;
					default:
						throw new Error('Incorrect data for signatureAlgorithm: ' + this.signatureAlgorithm);
				}

				stream.appendChar(_signatureAlgorithm);

				var _signature = this.signature.toBER(false);

				stream.appendUint16(_signature.byteLength);
				stream.appendView(new Uint8Array(_signature));

				return stream;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					version: this.version,
					logID: bufferToHexCodes(this.logID),
					timestamp: this.timestamp,
					extensions: bufferToHexCodes(this.extensions),
					hashAlgorithm: this.hashAlgorithm,
					signatureAlgorithm: this.signatureAlgorithm,
					signature: this.signature.toJSON()
				};
			}
		}, {
			key: 'verify',
			value: async function verify(logs, data) {
				var dataType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				var logId = toBase64(arrayBufferToString(this.logID));

				var publicKeyBase64 = null;
				var publicKeyInfo = void 0;

				var stream = new SeqStream();
				var _iteratorNormalCompletion20 = true;
				var _didIteratorError20 = false;
				var _iteratorError20 = undefined;

				try {
					for (var _iterator20 = logs[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
						var log = _step20.value;

						if (log.log_id === logId) {
							publicKeyBase64 = log.key;
							break;
						}
					}
				} catch (err) {
					_didIteratorError20 = true;
					_iteratorError20 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion20 && _iterator20.return) {
							_iterator20.return();
						}
					} finally {
						if (_didIteratorError20) {
							throw _iteratorError20;
						}
					}
				}

				if (publicKeyBase64 === null) throw new Error('Public key not found for CT with logId: ' + logId);

				var asn1 = fromBER(stringToArrayBuffer(fromBase64(publicKeyBase64)));
				if (asn1.offset === -1) throw new Error('Incorrect key value for CT Log with logId: ' + logId);

				publicKeyInfo = new PublicKeyInfo({ schema: asn1.result });

				stream.appendChar(0x00);
				stream.appendChar(0x00);

				var timeBuffer = new ArrayBuffer(8);
				var timeView = new Uint8Array(timeBuffer);

				var baseArray = utilToBase(this.timestamp.valueOf(), 8);
				timeView.set(new Uint8Array(baseArray), 8 - baseArray.byteLength);

				stream.appendView(timeView);

				stream.appendUint16(dataType);

				if (dataType === 0) stream.appendUint24(data.byteLength);

				stream.appendView(new Uint8Array(data));

				stream.appendUint16(this.extensions.byteLength);

				if (this.extensions.byteLength !== 0) stream.appendView(new Uint8Array(this.extensions));

				return getEngine().subtle.verifyWithPublicKey(stream._stream._buffer.slice(0, stream._length), { valueBlock: { valueHex: this.signature.toBER(false) } }, publicKeyInfo, { algorithmId: "" }, "SHA-256");
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "logID":
					case "extensions":
						return new ArrayBuffer(0);
					case "timestamp":
						return new Date(0);
					case "hashAlgorithm":
					case "signatureAlgorithm":
						return "";
					case "signature":
						return new Any();
					default:
						throw new Error('Invalid member name for SignedCertificateTimestamp class: ' + memberName);
				}
			}
		}]);

		return SignedCertificateTimestamp;
	}();

	var SignedCertificateTimestampList = function () {
		function SignedCertificateTimestampList() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, SignedCertificateTimestampList);

			this.timestamps = getParametersValue(parameters, "timestamps", SignedCertificateTimestampList.defaultValues("timestamps"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(SignedCertificateTimestampList, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				if (schema instanceof OctetString === false) throw new Error("Object's schema was not verified against input data for SignedCertificateTimestampList");

				var seqStream = new SeqStream({
					stream: new ByteStream({
						buffer: schema.valueBlock.valueHex
					})
				});

				var dataLength = seqStream.getUint16();
				if (dataLength !== seqStream.length) throw new Error("Object's schema was not verified against input data for SignedCertificateTimestampList");

				while (seqStream.length) {
					this.timestamps.push(new SignedCertificateTimestamp({ stream: seqStream }));
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var stream = new SeqStream();

				var overallLength = 0;

				var timestampsData = [];
				var _iteratorNormalCompletion21 = true;
				var _didIteratorError21 = false;
				var _iteratorError21 = undefined;

				try {
					for (var _iterator21 = this.timestamps[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
						var timestamp = _step21.value;

						var timestampStream = timestamp.toStream();
						timestampsData.push(timestampStream);
						overallLength += timestampStream.stream.buffer.byteLength;
					}
				} catch (err) {
					_didIteratorError21 = true;
					_iteratorError21 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion21 && _iterator21.return) {
							_iterator21.return();
						}
					} finally {
						if (_didIteratorError21) {
							throw _iteratorError21;
						}
					}
				}

				stream.appendUint16(overallLength);

				var _iteratorNormalCompletion22 = true;
				var _didIteratorError22 = false;
				var _iteratorError22 = undefined;

				try {
					for (var _iterator22 = timestampsData[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
						var _timestamp = _step22.value;

						stream.appendView(_timestamp.stream.view);
					}
				} catch (err) {
					_didIteratorError22 = true;
					_iteratorError22 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion22 && _iterator22.return) {
							_iterator22.return();
						}
					} finally {
						if (_didIteratorError22) {
							throw _iteratorError22;
						}
					}
				}

				return new OctetString({ valueHex: stream.stream.buffer.slice(0) });
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					timestamps: Array.from(this.timestamps, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "timestamps":
						return [];
					default:
						throw new Error('Invalid member name for SignedCertificateTimestampList class: ' + memberName);
				}
			}
		}, {
			key: 'compareWithDefault',
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "timestamps":
						return memberValue.length === 0;
					default:
						throw new Error('Invalid member name for SignedCertificateTimestampList class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				if ("optional" in names === false) names.optional = false;

				return new OctetString({
					name: names.blockName || "SignedCertificateTimestampList",
					optional: names.optional
				});
			}
		}]);

		return SignedCertificateTimestampList;
	}();

	var Extension = function () {
		function Extension() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Extension);

			this.extnID = getParametersValue(parameters, "extnID", Extension.defaultValues("extnID"));

			this.critical = getParametersValue(parameters, "critical", Extension.defaultValues("critical"));

			if ("extnValue" in parameters) this.extnValue = new OctetString({ valueHex: parameters.extnValue });else this.extnValue = Extension.defaultValues("extnValue");

			if ("parsedValue" in parameters) this.parsedValue = getParametersValue(parameters, "parsedValue", Extension.defaultValues("parsedValue"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(Extension, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["extnID", "critical", "extnValue"]);

				var asn1 = compareSchema(schema, schema, Extension.schema({
					names: {
						extnID: "extnID",
						critical: "critical",
						extnValue: "extnValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for Extension");

				this.extnID = asn1.result.extnID.valueBlock.toString();
				if ("critical" in asn1.result) this.critical = asn1.result.critical.valueBlock.value;
				this.extnValue = asn1.result.extnValue;

				asn1 = fromBER(this.extnValue.valueBlock.valueHex);
				if (asn1.offset === -1) return;

				switch (this.extnID) {
					case "2.5.29.9":
						try {
							this.parsedValue = new SubjectDirectoryAttributes({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new SubjectDirectoryAttributes();
							this.parsedValue.parsingError = "Incorrectly formated SubjectDirectoryAttributes";
						}
						break;
					case "2.5.29.14":
						this.parsedValue = asn1.result;
						break;
					case "2.5.29.15":
						this.parsedValue = asn1.result;
						break;
					case "2.5.29.16":
						try {
							this.parsedValue = new PrivateKeyUsagePeriod({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new PrivateKeyUsagePeriod();
							this.parsedValue.parsingError = "Incorrectly formated PrivateKeyUsagePeriod";
						}
						break;
					case "2.5.29.17":
					case "2.5.29.18":
						try {
							this.parsedValue = new AltName({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new AltName();
							this.parsedValue.parsingError = "Incorrectly formated AltName";
						}
						break;
					case "2.5.29.19":
						try {
							this.parsedValue = new BasicConstraints({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new BasicConstraints();
							this.parsedValue.parsingError = "Incorrectly formated BasicConstraints";
						}
						break;
					case "2.5.29.20":
					case "2.5.29.27":
						this.parsedValue = asn1.result;
						break;
					case "2.5.29.21":
						this.parsedValue = asn1.result;
						break;
					case "2.5.29.24":
						this.parsedValue = asn1.result;
						break;
					case "2.5.29.28":
						try {
							this.parsedValue = new IssuingDistributionPoint({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new IssuingDistributionPoint();
							this.parsedValue.parsingError = "Incorrectly formated IssuingDistributionPoint";
						}
						break;
					case "2.5.29.29":
						try {
							this.parsedValue = new GeneralNames({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new GeneralNames();
							this.parsedValue.parsingError = "Incorrectly formated GeneralNames";
						}
						break;
					case "2.5.29.30":
						try {
							this.parsedValue = new NameConstraints({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new NameConstraints();
							this.parsedValue.parsingError = "Incorrectly formated NameConstraints";
						}
						break;
					case "2.5.29.31":
					case "2.5.29.46":
						try {
							this.parsedValue = new CRLDistributionPoints({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new CRLDistributionPoints();
							this.parsedValue.parsingError = "Incorrectly formated CRLDistributionPoints";
						}
						break;
					case "2.5.29.32":
						try {
							this.parsedValue = new CertificatePolicies({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new CertificatePolicies();
							this.parsedValue.parsingError = "Incorrectly formated CertificatePolicies";
						}
						break;
					case "2.5.29.33":
						try {
							this.parsedValue = new PolicyMappings({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new PolicyMappings();
							this.parsedValue.parsingError = "Incorrectly formated CertificatePolicies";
						}
						break;
					case "2.5.29.35":
						try {
							this.parsedValue = new AuthorityKeyIdentifier({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new AuthorityKeyIdentifier();
							this.parsedValue.parsingError = "Incorrectly formated AuthorityKeyIdentifier";
						}
						break;
					case "2.5.29.36":
						try {
							this.parsedValue = new PolicyConstraints({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new PolicyConstraints();
							this.parsedValue.parsingError = "Incorrectly formated PolicyConstraints";
						}
						break;
					case "2.5.29.37":
						try {
							this.parsedValue = new ExtKeyUsage({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new ExtKeyUsage();
							this.parsedValue.parsingError = "Incorrectly formated ExtKeyUsage";
						}
						break;
					case "2.5.29.54":
						this.parsedValue = asn1.result;
						break;
					case "1.3.6.1.5.5.7.1.1":
					case "1.3.6.1.5.5.7.1.11":
						try {
							this.parsedValue = new InfoAccess({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new InfoAccess();
							this.parsedValue.parsingError = "Incorrectly formated InfoAccess";
						}
						break;
					case "1.3.6.1.4.1.11129.2.4.2":
						try {
							this.parsedValue = new SignedCertificateTimestampList({ schema: asn1.result });
						} catch (ex) {
							this.parsedValue = new SignedCertificateTimestampList();
							this.parsedValue.parsingError = "Incorrectly formated SignedCertificateTimestampList";
						}
						break;
					default:
				}
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.extnID }));

				if (this.critical !== Extension.defaultValues("critical")) outputArray.push(new Boolean({ value: this.critical }));

				outputArray.push(this.extnValue);

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {
					extnID: this.extnID,
					extnValue: this.extnValue.toJSON()
				};

				if (this.critical !== Extension.defaultValues("critical")) object.critical = this.critical;

				if ("parsedValue" in this) {
					if ("toJSON" in this.parsedValue) object.parsedValue = this.parsedValue.toJSON();
				}

				return object;
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "extnID":
						return "";
					case "critical":
						return false;
					case "extnValue":
						return new OctetString();
					case "parsedValue":
						return {};
					default:
						throw new Error('Invalid member name for Extension class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.extnID || "" }), new Boolean({
						name: names.critical || "",
						optional: true
					}), new OctetString({ name: names.extnValue || "" })]
				});
			}
		}]);

		return Extension;
	}();

	var Extensions = function () {
		function Extensions() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Extensions);

			this.extensions = getParametersValue(parameters, "extensions", Extensions.defaultValues("extensions"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(Extensions, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["extensions"]);

				var asn1 = compareSchema(schema, schema, Extensions.schema({
					names: {
						extensions: "extensions"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for Extensions");

				this.extensions = Array.from(asn1.result.extensions, function (element) {
					return new Extension({ schema: element });
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				return new Sequence({
					value: Array.from(this.extensions, function (element) {
						return element.toSchema();
					})
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				return {
					extensions: Array.from(this.extensions, function (element) {
						return element.toJSON();
					})
				};
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "extensions":
						return [];
					default:
						throw new Error('Invalid member name for Extensions class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
				var optional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					optional: optional,
					name: names.blockName || "",
					value: [new Repeated({
						name: names.extensions || "",
						value: Extension.schema(names.extension || {})
					})]
				});
			}
		}]);

		return Extensions;
	}();

	function tbsCertificate() {
		var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			name: names.blockName || "tbsCertificate",
			value: [new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 0 },
				value: [new Integer({ name: names.tbsCertificateVersion || "tbsCertificate.version" })]
			}), new Integer({ name: names.tbsCertificateSerialNumber || "tbsCertificate.serialNumber" }), AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertificate.signature"
				}
			}), RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertificate.issuer"
				}
			}), new Sequence({
				name: names.tbsCertificateValidity || "tbsCertificate.validity",
				value: [Time.schema(names.notBefore || {
					names: {
						utcTimeName: "tbsCertificate.notBefore",
						generalTimeName: "tbsCertificate.notBefore"
					}
				}), Time.schema(names.notAfter || {
					names: {
						utcTimeName: "tbsCertificate.notAfter",
						generalTimeName: "tbsCertificate.notAfter"
					}
				})]
			}), RelativeDistinguishedNames.schema(names.subject || {
				names: {
					blockName: "tbsCertificate.subject"
				}
			}), PublicKeyInfo.schema(names.subjectPublicKeyInfo || {
				names: {
					blockName: "tbsCertificate.subjectPublicKeyInfo"
				}
			}), new Primitive({
				name: names.tbsCertificateIssuerUniqueID || "tbsCertificate.issuerUniqueID",
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 1 }
			}), new Primitive({
				name: names.tbsCertificateSubjectUniqueID || "tbsCertificate.subjectUniqueID",
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 2 }
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3,
					tagNumber: 3 },
				value: [Extensions.schema(names.extensions || {
					names: {
						blockName: "tbsCertificate.extensions"
					}
				})]
			})]
		});
	}

	var Certificate = function () {
		function Certificate() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Certificate);

			this.tbs = getParametersValue(parameters, "tbs", Certificate.defaultValues("tbs"));

			this.version = getParametersValue(parameters, "version", Certificate.defaultValues("version"));

			this.serialNumber = getParametersValue(parameters, "serialNumber", Certificate.defaultValues("serialNumber"));

			this.signature = getParametersValue(parameters, "signature", Certificate.defaultValues("signature"));

			this.issuer = getParametersValue(parameters, "issuer", Certificate.defaultValues("issuer"));

			this.notBefore = getParametersValue(parameters, "notBefore", Certificate.defaultValues("notBefore"));

			this.notAfter = getParametersValue(parameters, "notAfter", Certificate.defaultValues("notAfter"));

			this.subject = getParametersValue(parameters, "subject", Certificate.defaultValues("subject"));

			this.subjectPublicKeyInfo = getParametersValue(parameters, "subjectPublicKeyInfo", Certificate.defaultValues("subjectPublicKeyInfo"));

			if ("issuerUniqueID" in parameters) this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", Certificate.defaultValues("issuerUniqueID"));

			if ("subjectUniqueID" in parameters) this.subjectUniqueID = getParametersValue(parameters, "subjectUniqueID", Certificate.defaultValues("subjectUniqueID"));

			if ("extensions" in parameters) this.extensions = getParametersValue(parameters, "extensions", Certificate.defaultValues("extensions"));

			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", Certificate.defaultValues("signatureAlgorithm"));

			this.signatureValue = getParametersValue(parameters, "signatureValue", Certificate.defaultValues("signatureValue"));

			if ("schema" in parameters) this.fromSchema(parameters.schema);
		}

		_createClass(Certificate, [{
			key: 'fromSchema',
			value: function fromSchema(schema) {
				clearProps(schema, ["tbsCertificate", "tbsCertificate.extensions", "tbsCertificate.version", "tbsCertificate.serialNumber", "tbsCertificate.signature", "tbsCertificate.issuer", "tbsCertificate.notBefore", "tbsCertificate.notAfter", "tbsCertificate.subject", "tbsCertificate.subjectPublicKeyInfo", "tbsCertificate.issuerUniqueID", "tbsCertificate.subjectUniqueID", "signatureAlgorithm", "signatureValue"]);

				var asn1 = compareSchema(schema, schema, Certificate.schema({
					names: {
						tbsCertificate: {
							names: {
								extensions: {
									names: {
										extensions: "tbsCertificate.extensions"
									}
								}
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for Certificate");

				this.tbs = asn1.result.tbsCertificate.valueBeforeDecode;

				if ("tbsCertificate.version" in asn1.result) this.version = asn1.result["tbsCertificate.version"].valueBlock.valueDec;
				this.serialNumber = asn1.result["tbsCertificate.serialNumber"];
				this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertificate.signature"] });
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.issuer"] });
				this.notBefore = new Time({ schema: asn1.result["tbsCertificate.notBefore"] });
				this.notAfter = new Time({ schema: asn1.result["tbsCertificate.notAfter"] });
				this.subject = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.subject"] });
				this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["tbsCertificate.subjectPublicKeyInfo"] });
				if ("tbsCertificate.issuerUniqueID" in asn1.result) this.issuerUniqueID = asn1.result["tbsCertificate.issuerUniqueID"].valueBlock.valueHex;
				if ("tbsCertificate.subjectUniqueID" in asn1.result) this.subjectUniqueID = asn1.result["tbsCertificate.subjectUniqueID"].valueBlock.valueHex;
				if ("tbsCertificate.extensions" in asn1.result) this.extensions = Array.from(asn1.result["tbsCertificate.extensions"], function (element) {
					return new Extension({ schema: element });
				});

				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
				this.signatureValue = asn1.result.signatureValue;
			}
		}, {
			key: 'encodeTBS',
			value: function encodeTBS() {
				var outputArray = [];

				if ("version" in this && this.version !== Certificate.defaultValues("version")) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 0 },
						value: [new Integer({ value: this.version })]
					}));
				}

				outputArray.push(this.serialNumber);
				outputArray.push(this.signature.toSchema());
				outputArray.push(this.issuer.toSchema());

				outputArray.push(new Sequence({
					value: [this.notBefore.toSchema(), this.notAfter.toSchema()]
				}));

				outputArray.push(this.subject.toSchema());
				outputArray.push(this.subjectPublicKeyInfo.toSchema());

				if ("issuerUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 1 },
						valueHex: this.issuerUniqueID
					}));
				}
				if ("subjectUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 2 },
						valueHex: this.subjectUniqueID
					}));
				}

				if ("extensions" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3,
							tagNumber: 3 },
						value: [new Sequence({
							value: Array.from(this.extensions, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
		}, {
			key: 'toSchema',
			value: function toSchema() {
				var encodeFlag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var tbsSchema = {};

				if (encodeFlag === false) {
					if (this.tbs.length === 0) return Certificate.schema().value[0];

					tbsSchema = fromBER(this.tbs).result;
				} else tbsSchema = this.encodeTBS();

				return new Sequence({
					value: [tbsSchema, this.signatureAlgorithm.toSchema(), this.signatureValue]
				});
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {
					tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
					serialNumber: this.serialNumber.toJSON(),
					signature: this.signature.toJSON(),
					issuer: this.issuer.toJSON(),
					notBefore: this.notBefore.toJSON(),
					notAfter: this.notAfter.toJSON(),
					subject: this.subject.toJSON(),
					subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
					signatureAlgorithm: this.signatureAlgorithm.toJSON(),
					signatureValue: this.signatureValue.toJSON()
				};

				if ("version" in this && this.version !== Certificate.defaultValues("version")) object.version = this.version;

				if ("issuerUniqueID" in this) object.issuerUniqueID = bufferToHexCodes(this.issuerUniqueID, 0, this.issuerUniqueID.byteLength);

				if ("subjectUniqueID" in this) object.subjectUniqueID = bufferToHexCodes(this.subjectUniqueID, 0, this.subjectUniqueID.byteLength);

				if ("extensions" in this) object.extensions = Array.from(this.extensions, function (element) {
					return element.toJSON();
				});

				return object;
			}
		}, {
			key: 'getPublicKey',
			value: function getPublicKey() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

				return getEngine().subtle.getPublicKey(this.subjectPublicKeyInfo, this.signatureAlgorithm, parameters);
			}
		}, {
			key: 'getKeyHash',
			value: function getKeyHash() {
				var hashAlgorithm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "SHA-1";

				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");


				return crypto.digest({ name: hashAlgorithm }, new Uint8Array(this.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
			}
		}, {
			key: 'sign',
			value: function sign(privateKey) {
				var _this59 = this;

				var hashAlgorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "SHA-1";

				if (typeof privateKey === "undefined") return Promise.reject("Need to provide a private key for signing");

				var sequence = Promise.resolve();
				var parameters = void 0;

				var engine = getEngine();

				sequence = sequence.then(function () {
					return engine.subtle.getSignatureParameters(privateKey, hashAlgorithm);
				});

				sequence = sequence.then(function (result) {
					parameters = result.parameters;
					_this59.signature = result.signatureAlgorithm;
					_this59.signatureAlgorithm = result.signatureAlgorithm;
				});

				sequence = sequence.then(function () {
					_this59.tbs = _this59.encodeTBS().toBER(false);
				});

				sequence = sequence.then(function () {
					return engine.subtle.signWithPrivateKey(_this59.tbs, privateKey, parameters);
				});

				sequence = sequence.then(function (result) {
					_this59.signatureValue = new BitString({ valueHex: result });
				});


				return sequence;
			}
		}, {
			key: 'verify',
			value: function verify() {
				var issuerCertificate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

				var subjectPublicKeyInfo = {};

				if (issuerCertificate !== null) subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;else {
					if (this.issuer.isEqual(this.subject)) subjectPublicKeyInfo = this.subjectPublicKeyInfo;
				}

				if (subjectPublicKeyInfo instanceof PublicKeyInfo === false) return Promise.reject("Please provide issuer certificate as a parameter");


				return getEngine().subtle.verifyWithPublicKey(this.tbs, this.signatureValue, subjectPublicKeyInfo, this.signatureAlgorithm);
			}
		}], [{
			key: 'defaultValues',
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbs":
						return new ArrayBuffer(0);
					case "version":
						return 0;
					case "serialNumber":
						return new Integer();
					case "signature":
						return new AlgorithmIdentifier();
					case "issuer":
						return new RelativeDistinguishedNames();
					case "notBefore":
						return new Time();
					case "notAfter":
						return new Time();
					case "subject":
						return new RelativeDistinguishedNames();
					case "subjectPublicKeyInfo":
						return new PublicKeyInfo();
					case "issuerUniqueID":
						return new ArrayBuffer(0);
					case "subjectUniqueID":
						return new ArrayBuffer(0);
					case "extensions":
						return [];
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signatureValue":
						return new BitString();
					default:
						throw new Error('Invalid member name for Certificate class: ' + memberName);
				}
			}
		}, {
			key: 'schema',
			value: function schema() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [tbsCertificate(names.tbsCertificate), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "signatureAlgorithm"
						}
					}), new BitString({ name: names.signatureValue || "signatureValue" })]
				});
			}
		}]);

		return Certificate;
	}();

	var ELEMENT = "element";
	var ATTRIBUTE = "attribute";
	var CONTENT = "content";

	var MAX = 1e9;
	function assign(target) {
		for (var _len3 = arguments.length, sources = Array(_len3 > 1 ? _len3 - 1 : 0), _key8 = 1; _key8 < _len3; _key8++) {
			sources[_key8 - 1] = arguments[_key8];
		}

		var res = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			for (var prop in obj) {
				if (!obj.hasOwnProperty(prop)) {
					continue;
				}
				res[prop] = obj[prop];
			}
		}
		return res;
	}
	function XmlElement(params) {
		return function (target) {
			var t = target;
			t.localName = params.localName || t.name;
			t.namespaceURI = params.namespaceURI || t.namespaceURI || null;
			t.prefix = params.prefix || t.prefix || null;
			t.parser = params.parser || t.parser;
			if (t.target !== t) {
				t.items = assign({}, t.items);
			}
			t.target = target;
		};
	}
	function XmlChildElement() {
		var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		return function (target, propertyKey) {
			var t = target.constructor;
			var key = propertyKey;
			if (!t.items) {
				t.items = {};
			}
			if (t.target !== t) {
				t.items = assign({}, t.items);
			}
			t.target = target;
			if (params.parser) {
				t.items[key] = {
					parser: params.parser,
					required: params.required || false,
					maxOccurs: params.maxOccurs || MAX,
					minOccurs: params.minOccurs === void 0 ? 0 : params.minOccurs,
					noRoot: params.noRoot || false
				};
			} else {
				t.items[key] = {
					namespaceURI: params.namespaceURI || null,
					required: params.required || false,
					prefix: params.prefix || null,
					defaultValue: params.defaultValue,
					converter: params.converter
				};
			}
			params.localName = params.localName || params.parser && params.parser.localName || key;
			t.items[key].namespaceURI = params.namespaceURI || params.parser && params.parser.namespaceURI || null;
			t.items[key].prefix = params.prefix || params.parser && params.parser.prefix || null;
			t.items[key].localName = params.localName;
			t.items[key].type = ELEMENT;
			defineProperty(target, key, params);
		};
	}
	function XmlAttribute() {
		var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { required: false, namespaceURI: null };

		return function (target, propertyKey) {
			var t = target.constructor;
			var key = propertyKey;
			if (!params.localName) {
				params.localName = propertyKey;
			}
			if (!t.items) {
				t.items = {};
			}
			if (t.target !== t) {
				t.items = assign({}, t.items);
			}
			t.target = target;
			t.items[propertyKey] = params;
			t.items[propertyKey].type = ATTRIBUTE;
			defineProperty(target, key, params);
		};
	}
	function XmlContent() {
		var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { required: false };

		return function (target, propertyKey) {
			var t = target.constructor;
			var key = propertyKey;
			if (!t.items) {
				t.items = {};
			}
			if (t.target !== t) {
				t.items = assign({}, t.items);
			}
			t.target = target;
			t.items[propertyKey] = params;
			t.items[propertyKey].type = CONTENT;
			defineProperty(target, key, params);
		};
	}
	function defineProperty(target, key, params) {
		var key2 = '_' + key;
		var opt = {
			set: function set(v) {
				if (this[key2] !== v) {
					this.element = null;
					this[key2] = v;
				}
			},
			get: function get() {
				if (this[key2] === void 0) {
					var defaultValue = params.defaultValue;
					if (params.parser) {
						defaultValue = new params.parser();
						defaultValue.localName = params.localName;
					}
					this[key2] = defaultValue;
				}
				return this[key2];
			}
		};
		Object.defineProperty(target, key2, { writable: true, enumerable: false });
		Object.defineProperty(target, key, opt);
	}

	var Collection = function () {
		function Collection(items) {
			_classCallCheck(this, Collection);

			this.items = new Array();
			if (items) {
				this.items = items;
			}
		}

		_createClass(Collection, [{
			key: 'Item',
			value: function Item(index) {
				return this.items[index] || null;
			}
		}, {
			key: 'Add',
			value: function Add(item) {
				this.items.push(item);
			}
		}, {
			key: 'Pop',
			value: function Pop() {
				return this.items.pop();
			}
		}, {
			key: 'RemoveAt',
			value: function RemoveAt(index) {
				this.items = this.items.filter(function (item, index2) {
					return index2 !== index;
				});
			}
		}, {
			key: 'Clear',
			value: function Clear() {
				this.items = new Array();
			}
		}, {
			key: 'GetIterator',
			value: function GetIterator() {
				return this.items;
			}
		}, {
			key: 'ForEach',
			value: function ForEach(cb) {
				this.GetIterator().forEach(cb);
			}
		}, {
			key: 'Map',
			value: function Map(cb) {
				return new Collection(this.GetIterator().map(cb));
			}
		}, {
			key: 'Filter',
			value: function Filter(cb) {
				return new Collection(this.GetIterator().filter(cb));
			}
		}, {
			key: 'Sort',
			value: function Sort(cb) {
				return new Collection(this.GetIterator().sort(cb));
			}
		}, {
			key: 'Every',
			value: function Every(cb) {
				return this.GetIterator().every(cb);
			}
		}, {
			key: 'Some',
			value: function Some(cb) {
				return this.GetIterator().some(cb);
			}
		}, {
			key: 'IsEmpty',
			value: function IsEmpty() {
				return this.Count === 0;
			}
		}, {
			key: 'Count',
			get: function get() {
				return this.items.length;
			}
		}]);

		return Collection;
	}();

	function printf(text) {
		for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key9 = 1; _key9 < _len4; _key9++) {
			args[_key9 - 1] = arguments[_key9];
		}

		var msg = text;
		var regFind = /[^%](%\d+)/g;
		var match = null;
		var matches = [];
		while (match = regFind.exec(msg)) {
			matches.push({ arg: match[1], index: match.index });
		}
		for (var i = matches.length - 1; i >= 0; i--) {
			var item = matches[i];
			var arg = item.arg.substring(1);
			var index = item.index + 1;
			msg = msg.substring(0, index) + arguments[+arg] + msg.substring(index + 1 + arg.length);
		}
		msg = msg.replace("%%", "%");
		return msg;
	}
	function padNum(num, size) {
		var s = num + "";
		while (s.length < size) {
			s = "0" + s;
		}
		return s;
	}

	var XmlError = function XmlError(code) {
		for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key10 = 1; _key10 < _len5; _key10++) {
			args[_key10 - 1] = arguments[_key10];
		}

		_classCallCheck(this, XmlError);

		this.prefix = "XMLJS";
		this.code = code;
		this.name = this.constructor.name;
		arguments[0] = xes[code];
		var message = printf.apply(this, arguments);
		this.message = '' + this.prefix + padNum(code, 4) + ': ' + message;
		this.stack = new Error(this.message).stack;
	};

	var XE;
	(function (XE) {
		XE[XE["NONE"] = 0] = "NONE";
		XE[XE["NULL_REFERENCE"] = 1] = "NULL_REFERENCE";
		XE[XE["NULL_PARAM"] = 2] = "NULL_PARAM";
		XE[XE["DECORATOR_NULL_PARAM"] = 3] = "DECORATOR_NULL_PARAM";
		XE[XE["COLLECTION_LIMIT"] = 4] = "COLLECTION_LIMIT";
		XE[XE["METHOD_NOT_IMPLEMENTED"] = 5] = "METHOD_NOT_IMPLEMENTED";
		XE[XE["METHOD_NOT_SUPPORTED"] = 6] = "METHOD_NOT_SUPPORTED";
		XE[XE["PARAM_REQUIRED"] = 7] = "PARAM_REQUIRED";
		XE[XE["CONVERTER_UNSUPPORTED"] = 8] = "CONVERTER_UNSUPPORTED";
		XE[XE["ELEMENT_MALFORMED"] = 9] = "ELEMENT_MALFORMED";
		XE[XE["ELEMENT_MISSING"] = 10] = "ELEMENT_MISSING";
		XE[XE["ATTRIBUTE_MISSING"] = 11] = "ATTRIBUTE_MISSING";
		XE[XE["CONTENT_MISSING"] = 12] = "CONTENT_MISSING";
		XE[XE["CRYPTOGRAPHIC"] = 13] = "CRYPTOGRAPHIC";
		XE[XE["CRYPTOGRAPHIC_NO_MODULE"] = 14] = "CRYPTOGRAPHIC_NO_MODULE";
		XE[XE["CRYPTOGRAPHIC_UNKNOWN_TRANSFORM"] = 15] = "CRYPTOGRAPHIC_UNKNOWN_TRANSFORM";
		XE[XE["ALGORITHM_NOT_SUPPORTED"] = 16] = "ALGORITHM_NOT_SUPPORTED";
		XE[XE["ALGORITHM_WRONG_NAME"] = 17] = "ALGORITHM_WRONG_NAME";
		XE[XE["XML_EXCEPTION"] = 18] = "XML_EXCEPTION";
	})(XE || (XE = {}));
	var xes = {};
	xes[XE.NONE] = "No decription";
	xes[XE.NULL_REFERENCE] = "Null reference";
	xes[XE.NULL_PARAM] = "'%1' has empty '%2' object";
	xes[XE.DECORATOR_NULL_PARAM] = "Decorator '%1' has empty '%2' parameter";
	xes[XE.COLLECTION_LIMIT] = "Collection of '%1' in element '%2' has wrong amount of items";
	xes[XE.METHOD_NOT_IMPLEMENTED] = "Method is not implemented";
	xes[XE.METHOD_NOT_SUPPORTED] = "Method is not supported";
	xes[XE.PARAM_REQUIRED] = "Required parameter is missing '%1'";
	xes[XE.CONVERTER_UNSUPPORTED] = "Converter is not supported";
	xes[XE.ELEMENT_MALFORMED] = "Malformed element '%1'";
	xes[XE.ELEMENT_MISSING] = "Element '%1' is missing in '%2'";
	xes[XE.ATTRIBUTE_MISSING] = "Attribute '%1' is missing in '%2'";
	xes[XE.CONTENT_MISSING] = "Content is missing in '%1'";
	xes[XE.CRYPTOGRAPHIC] = "Cryptographic error: %1";
	xes[XE.CRYPTOGRAPHIC_NO_MODULE] = "WebCrypto module is not found";
	xes[XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM] = "Unknown transform %1";
	xes[XE.ALGORITHM_NOT_SUPPORTED] = "Algorithm is not supported '%1'";
	xes[XE.ALGORITHM_WRONG_NAME] = "Algorithm wrong name in use '%1'";
	xes[XE.XML_EXCEPTION] = "XML exception: %1";

	var Convert = function () {
		function Convert() {
			_classCallCheck(this, Convert);
		}

		_createClass(Convert, null, [{
			key: 'ToString',
			value: function ToString(buffer) {
				var enc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";

				var buf = new Uint8Array(buffer);
				switch (enc.toLowerCase()) {
					case "utf8":
						return this.ToUtf8String(buf);
					case "binary":
						return this.ToBinary(buf);
					case "hex":
						return this.ToHex(buf);
					case "base64":
						return this.ToBase64(buf);
					case "base64url":
						return this.ToBase64Url(buf);
					default:
						throw new XmlError(XE.CONVERTER_UNSUPPORTED);
				}
			}
		}, {
			key: 'FromString',
			value: function FromString(str) {
				var enc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";

				switch (enc.toLowerCase()) {
					case "utf8":
						return this.FromUtf8String(str);
					case "binary":
						return this.FromBinary(str);
					case "hex":
						return this.FromHex(str);
					case "base64":
						return this.FromBase64(str);
					case "base64url":
						return this.FromBase64Url(str);
					default:
						throw new XmlError(XE.CONVERTER_UNSUPPORTED);
				}
			}
		}, {
			key: 'ToBase64',
			value: function ToBase64(buf) {
				if (typeof btoa !== "undefined") {
					var binary = this.ToString(buf, "binary");
					return btoa(binary);
				} else if (typeof Buffer !== "undefined") {
					return new Buffer(buf).toString("base64");
				} else {
					throw new XmlError(XE.CONVERTER_UNSUPPORTED);
				}
			}
		}, {
			key: 'FromBase64',
			value: function FromBase64(base64Text) {
				base64Text = base64Text.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/\s/g, "");
				if (typeof atob !== "undefined") {
					return this.FromBinary(atob(base64Text));
				} else if (typeof Buffer !== "undefined") {
					return new Buffer(base64Text, "base64");
				} else {
					throw new XmlError(XE.CONVERTER_UNSUPPORTED);
				}
			}
		}, {
			key: 'FromBase64Url',
			value: function FromBase64Url(base64url) {
				return this.FromBase64(this.Base64Padding(base64url.replace(/\-/g, "+").replace(/\_/g, "/")));
			}
		}, {
			key: 'ToBase64Url',
			value: function ToBase64Url(data) {
				return this.ToBase64(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
			}
		}, {
			key: 'FromUtf8String',
			value: function FromUtf8String(text) {
				var s = unescape(encodeURIComponent(text));
				var uintArray = new Uint8Array(s.length);
				for (var i = 0; i < s.length; i++) {
					uintArray[i] = s.charCodeAt(i);
				}
				return uintArray;
			}
		}, {
			key: 'ToUtf8String',
			value: function ToUtf8String(buffer) {
				var encodedString = String.fromCharCode.apply(null, buffer);
				var decodedString = decodeURIComponent(escape(encodedString));
				return decodedString;
			}
		}, {
			key: 'FromBinary',
			value: function FromBinary(text) {
				var stringLength = text.length;
				var resultView = new Uint8Array(stringLength);
				for (var i = 0; i < stringLength; i++) {
					resultView[i] = text.charCodeAt(i);
				}
				return resultView;
			}
		}, {
			key: 'ToBinary',
			value: function ToBinary(buffer) {
				var resultString = "";
				for (var i = 0; i < buffer.length; i++) {
					resultString = resultString + String.fromCharCode(buffer[i]);
				}
				return resultString;
			}
		}, {
			key: 'ToHex',
			value: function ToHex(buffer) {
				var splitter = "";
				var res = [];
				for (var i = 0; i < buffer.length; i++) {
					var char = buffer[i].toString(16);
					res.push(char.length === 1 ? "0" + char : char);
				}
				return res.join(splitter);
			}
		}, {
			key: 'FromHex',
			value: function FromHex(hexString) {
				var res = new Uint8Array(hexString.length / 2);
				for (var i = 0; i < hexString.length; i = i + 2) {
					var c = hexString.slice(i, i + 2);
					res[i / 2] = parseInt(c, 16);
				}
				return res;
			}
		}, {
			key: 'ToDateTime',
			value: function ToDateTime(dateTime) {
				return new Date(dateTime);
			}
		}, {
			key: 'FromDateTime',
			value: function FromDateTime(dateTime) {
				var str = dateTime.toISOString();
				return str;
			}
		}, {
			key: 'Base64Padding',
			value: function Base64Padding(base64) {
				var padCount = 4 - base64.length % 4;
				if (padCount < 4) {
					for (var i = 0; i < padCount; i++) {
						base64 += "=";
					}
				}
				return base64;
			}
		}]);

		return Convert;
	}();

	var APPLICATION_XML = "application/xml";
	var XmlNodeType;
	(function (XmlNodeType) {
		XmlNodeType[XmlNodeType["None"] = 0] = "None";
		XmlNodeType[XmlNodeType["Element"] = 1] = "Element";
		XmlNodeType[XmlNodeType["Attribute"] = 2] = "Attribute";
		XmlNodeType[XmlNodeType["Text"] = 3] = "Text";
		XmlNodeType[XmlNodeType["CDATA"] = 4] = "CDATA";
		XmlNodeType[XmlNodeType["EntityReference"] = 5] = "EntityReference";
		XmlNodeType[XmlNodeType["Entity"] = 6] = "Entity";
		XmlNodeType[XmlNodeType["ProcessingInstruction"] = 7] = "ProcessingInstruction";
		XmlNodeType[XmlNodeType["Comment"] = 8] = "Comment";
		XmlNodeType[XmlNodeType["Document"] = 9] = "Document";
		XmlNodeType[XmlNodeType["DocumentType"] = 10] = "DocumentType";
		XmlNodeType[XmlNodeType["DocumentFragment"] = 11] = "DocumentFragment";
		XmlNodeType[XmlNodeType["Notation"] = 12] = "Notation";
		XmlNodeType[XmlNodeType["Whitespace"] = 13] = "Whitespace";
		XmlNodeType[XmlNodeType["SignificantWhitespace"] = 14] = "SignificantWhitespace";
		XmlNodeType[XmlNodeType["EndElement"] = 15] = "EndElement";
		XmlNodeType[XmlNodeType["EndEntity"] = 16] = "EndEntity";
		XmlNodeType[XmlNodeType["XmlDeclaration"] = 17] = "XmlDeclaration";
	})(XmlNodeType || (XmlNodeType = {}));

	var xpath = function xpath(node, xPath) {
		throw new Error("Not implemented");
	};
	var sWindow = void 0;
	if (typeof self === "undefined") {
		sWindow = global;
		var xmldom = require("xmldom-alpha");
		xpath = require("xpath.js");
		sWindow.XMLSerializer = xmldom.XMLSerializer;
		sWindow.DOMParser = xmldom.DOMParser;
		sWindow.DOMImplementation = xmldom.DOMImplementation;
		sWindow.document = new DOMImplementation().createDocument("http://www.w3.org/1999/xhtml", "html", null);
	} else {
		sWindow = self;
	}
	function SelectNodesEx(node, xPath) {
		var doc = node.ownerDocument == null ? node : node.ownerDocument;
		var nsResolver = document.createNSResolver(node.ownerDocument == null ? node.documentElement : node.ownerDocument.documentElement);
		var personIterator = doc.evaluate(xPath, node, nsResolver, XPathResult.ANY_TYPE, null);
		var ns = [];
		var n = void 0;
		while (n = personIterator.iterateNext()) {
			ns.push(n);
		}
		return ns;
	}
	var Select = typeof self !== "undefined" ? SelectNodesEx : xpath;
	function Parse(xmlString) {
		xmlString = xmlString.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		return new DOMParser().parseFromString(xmlString, APPLICATION_XML);
	}
	function Stringify(target) {
		return new XMLSerializer().serializeToString(target);
	}
	function SelectSingleNode(node, path) {
		var ns = Select(node, path);
		if (ns && ns.length > 0) {
			return ns[0];
		}
		return null;
	}
	function _SelectNamespaces(node) {
		var selectedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		if (node && node.nodeType === XmlNodeType.Element) {
			var el = node;
			if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace" && !selectedNodes[el.prefix || ""]) {
				selectedNodes[el.prefix ? el.prefix : ""] = node.namespaceURI;
			}
			for (var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes.item(i);
				if (childNode && childNode.nodeType === XmlNodeType.Element) {
					_SelectNamespaces(childNode, selectedNodes);
				}
			}
		}
	}
	function SelectNamespaces(node) {
		var attrs = {};
		_SelectNamespaces(node, attrs);
		return attrs;
	}
	function assign$1(target) {
		for (var _len6 = arguments.length, sources = Array(_len6 > 1 ? _len6 - 1 : 0), _key11 = 1; _key11 < _len6; _key11++) {
			sources[_key11 - 1] = arguments[_key11];
		}

		var res = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			for (var prop in obj) {
				if (!obj.hasOwnProperty(prop)) {
					continue;
				}
				res[prop] = obj[prop];
			}
		}
		return res;
	}

	var XmlBase64Converter = {
		get: function get(value) {
			if (value) {
				return Convert.ToBase64(value);
			}
			return void 0;
		},
		set: function set(value) {
			return Convert.FromBase64(value);
		}
	};
	var XmlNumberConverter = {
		get: function get(value) {
			if (value) {
				return value.toString();
			}
			return "0";
		},
		set: function set(value) {
			return Number(value);
		}
	};

	var DEFAULT_ROOT_NAME = "xml_root";

	var XmlObject = function () {
		function XmlObject() {
			_classCallCheck(this, XmlObject);

			this.prefix = this.GetStatic().prefix || null;
			this.localName = this.GetStatic().localName;
			this.namespaceURI = this.GetStatic().namespaceURI;
		}

		_createClass(XmlObject, [{
			key: 'HasChanged',
			value: function HasChanged() {
				var self = this.GetStatic();
				if (self.items) {
					for (var key in self.items) {
						if (!self.items.hasOwnProperty(key)) {
							continue;
						}
						var item = self.items[key];
						var value = this[key];
						if (item.parser && value && value.HasChanged()) {
							return true;
						}
					}
				}
				return this.element === null;
			}
		}, {
			key: 'GetXml',
			value: function GetXml(hard) {
				if (!(hard || this.HasChanged())) {
					return this.element || null;
				}
				var doc = this.CreateDocument();
				var el = this.CreateElement();
				var self = this.GetStatic();
				var localName = this.localName;
				if (self.items) {
					for (var key in self.items) {
						if (!self.items.hasOwnProperty(key)) {
							continue;
						}
						var parser = this[key];
						var selfItem = self.items[key];
						switch (selfItem.type) {
							case CONTENT:
								{
									var schema = selfItem;
									var value = schema.converter ? schema.converter.get(parser) : parser;
									if (schema.required && (value === null || value === void 0)) {
										throw new XmlError(XE.CONTENT_MISSING, localName);
									}
									if (schema.defaultValue !== parser || schema.required) {
										el.textContent = value;
									}
									break;
								}
							case ATTRIBUTE:
								{
									var _schema = selfItem;
									var _value5 = _schema.converter ? _schema.converter.get(parser) : parser;
									if (_schema.required && (_value5 === null || _value5 === void 0)) {
										throw new XmlError(XE.ATTRIBUTE_MISSING, _schema.localName, localName);
									}
									if (_schema.defaultValue !== parser || _schema.required) {
										if (!_schema.namespaceURI) {
											el.setAttribute(_schema.localName, _value5);
										} else {
											el.setAttributeNS(_schema.namespaceURI, _schema.localName, _value5);
										}
									}
									break;
								}
							case ELEMENT:
								{
									var _schema2 = selfItem;
									var node = null;
									if (_schema2.parser) {
										if (_schema2.required && !parser || _schema2.minOccurs && !parser.Count) {
											throw new XmlError(XE.ELEMENT_MISSING, parser.localName, localName);
										}
										if (parser) {
											node = parser.GetXml(parser.element === void 0 && (_schema2.required || parser.Count));
										}
									} else {
										var _value6 = _schema2.converter ? _schema2.converter.get(parser) : parser;
										if (_schema2.required && _value6 === void 0) {
											throw new XmlError(XE.ELEMENT_MISSING, _schema2.localName, localName);
										}
										if (parser !== _schema2.defaultValue || _schema2.required) {
											if (!_schema2.namespaceURI) {
												node = doc.createElement('' + (_schema2.prefix ? _schema2.prefix + ":" : "") + _schema2.localName);
											} else {
												node = doc.createElementNS(_schema2.namespaceURI, '' + (_schema2.prefix ? _schema2.prefix + ":" : "") + _schema2.localName);
											}
											node.textContent = _value6;
										}
									}
									if (node) {
										if (_schema2.noRoot) {
											var els = [];
											for (var i = 0; i < node.childNodes.length; i++) {
												var colNode = node.childNodes.item(i);
												if (colNode.nodeType === XmlNodeType.Element) {
													els.push(colNode);
												}
											}
											if (els.length < _schema2.minOccurs || els.length > _schema2.maxOccurs) {
												throw new XmlError(XE.COLLECTION_LIMIT, parser.localName, self.localName);
											}
											els.forEach(function (e) {
												return el.appendChild(e.cloneNode(true));
											});
										} else if (node.childNodes.length < _schema2.minOccurs || node.childNodes.length > _schema2.maxOccurs) {
											throw new XmlError(XE.COLLECTION_LIMIT, parser.localName, self.localName);
										} else {
											el.appendChild(node);
										}
									}
									break;
								}
						}
					}
				}
				this.OnGetXml(el);
				this.element = el;
				return el;
			}
		}, {
			key: 'LoadXml',
			value: function LoadXml(param) {
				var element = void 0;
				if (typeof param === "string") {
					var doc = Parse(param);
					element = doc.documentElement;
				} else {
					element = param;
				}
				if (!element) {
					throw new XmlError(XE.PARAM_REQUIRED, "element");
				}
				var self = this.GetStatic();
				var localName = this.localName;
				if (!(element.localName === localName && element.namespaceURI == this.NamespaceURI)) {
					throw new XmlError(XE.ELEMENT_MALFORMED, localName);
				}
				if (self.items) {
					for (var key in self.items) {
						if (!self.items.hasOwnProperty(key)) {
							continue;
						}
						var selfItem = self.items[key];
						switch (selfItem.type) {
							case CONTENT:
								{
									var schema = selfItem;
									if (schema.required && !element.textContent) {
										throw new XmlError(XE.CONTENT_MISSING, localName);
									}
									if (!element.textContent) {
										this[key] = schema.defaultValue;
									} else {
										var value = schema.converter ? schema.converter.set(element.textContent) : element.textContent;
										this[key] = value;
									}
									break;
								}
							case ATTRIBUTE:
								{
									var _schema3 = selfItem;
									var hasAttribute = void 0;
									var getAttribute = void 0;
									if (_schema3.namespaceURI) {
										hasAttribute = element.hasAttributeNS.bind(element, _schema3.namespaceURI, _schema3.localName);
										getAttribute = element.getAttributeNS.bind(element, _schema3.namespaceURI, _schema3.localName);
									} else {
										hasAttribute = element.hasAttribute.bind(element, _schema3.localName);
										getAttribute = element.getAttribute.bind(element, _schema3.localName);
									}
									if (_schema3.required && !hasAttribute()) {
										throw new XmlError(XE.ATTRIBUTE_MISSING, _schema3.localName, localName);
									}
									if (!hasAttribute()) {
										this[key] = _schema3.defaultValue;
									} else {
										var _value7 = _schema3.converter ? _schema3.converter.set(getAttribute()) : getAttribute();
										this[key] = _value7;
									}
									break;
								}
							case ELEMENT:
								{
									var _schema4 = selfItem;
									if (_schema4.noRoot) {
										if (!_schema4.parser) {
											throw new XmlError(XE.XML_EXCEPTION, 'Schema for \'' + _schema4.localName + '\' with flag noRoot must have \'parser\'');
										}
										var col = new _schema4.parser();
										if (!(col instanceof XmlCollection)) {
											throw new XmlError(XE.XML_EXCEPTION, 'Schema for \'' + _schema4.localName + '\' with flag noRoot must have \'parser\' like instance of XmlCollection');
										}
										col.OnLoadXml(element);
										delete col.element;
										if (col.Count < _schema4.minOccurs || col.Count > _schema4.maxOccurs) {
											throw new XmlError(XE.COLLECTION_LIMIT, _schema4.parser.localName, localName);
										}
										this[key] = col;
										continue;
									}
									var foundElement = null;
									for (var i = 0; i < element.childNodes.length; i++) {
										var node = element.childNodes.item(i);
										if (node.nodeType !== XmlNodeType.Element) {
											continue;
										}
										var el = node;
										if (el.localName === _schema4.localName && el.namespaceURI == _schema4.namespaceURI) {
											foundElement = el;
											break;
										}
									}
									if (_schema4.required && !foundElement) {
										throw new XmlError(XE.ELEMENT_MISSING, _schema4.parser ? _schema4.parser.localName : _schema4.localName, localName);
									}
									if (!_schema4.parser) {
										if (!foundElement) {
											this[key] = _schema4.defaultValue;
										} else {
											var _value8 = _schema4.converter ? _schema4.converter.set(foundElement.textContent) : foundElement.textContent;
											this[key] = _value8;
										}
									} else {
										if (foundElement) {
											var _value9 = new _schema4.parser();
											_value9.localName = _schema4.localName;
											_value9.namespaceURI = _schema4.namespaceURI;
											this[key] = _value9;
											_value9.LoadXml(foundElement);
										}
									}
									break;
								}
						}
					}
				}
				this.OnLoadXml(element);
				this.prefix = element.prefix || "";
				this.element = element;
			}
		}, {
			key: 'toString',
			value: function toString() {
				var xml = this.GetXml();
				return xml ? new XMLSerializer().serializeToString(xml) : "";
			}
		}, {
			key: 'GetElement',
			value: function GetElement(name) {
				var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				if (!this.element) {
					throw new XmlError(XE.NULL_PARAM, this.localName);
				}
				return XmlObject.GetElement(this.element, name, required);
			}
		}, {
			key: 'GetChildren',
			value: function GetChildren(localName, nameSpace) {
				if (!this.element) {
					throw new XmlError(XE.NULL_PARAM, this.localName);
				}
				return XmlObject.GetChildren(this.element, localName, nameSpace || this.NamespaceURI || undefined);
			}
		}, {
			key: 'GetChild',
			value: function GetChild(localName) {
				var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				if (!this.element) {
					throw new XmlError(XE.NULL_PARAM, this.localName);
				}
				return XmlObject.GetChild(this.element, localName, this.NamespaceURI || undefined, required);
			}
		}, {
			key: 'GetFirstChild',
			value: function GetFirstChild(localName, namespace) {
				if (!this.element) {
					throw new XmlError(XE.NULL_PARAM, this.localName);
				}
				return XmlObject.GetFirstChild(this.element, localName, namespace);
			}
		}, {
			key: 'GetAttribute',
			value: function GetAttribute(name, defaultValue) {
				var required = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

				if (!this.element) {
					throw new XmlError(XE.NULL_PARAM, this.localName);
				}
				return XmlObject.GetAttribute(this.element, name, defaultValue, required);
			}
		}, {
			key: 'IsEmpty',
			value: function IsEmpty() {
				return this.Element === void 0;
			}
		}, {
			key: 'OnLoadXml',
			value: function OnLoadXml(element) {}
		}, {
			key: 'GetStatic',
			value: function GetStatic() {
				return this.constructor;
			}
		}, {
			key: 'GetPrefix',
			value: function GetPrefix() {
				return this.Prefix ? this.prefix + ":" : "";
			}
		}, {
			key: 'OnGetXml',
			value: function OnGetXml(element) {}
		}, {
			key: 'CreateElement',
			value: function CreateElement(document, localName) {
				var namespaceUri = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				var prefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

				if (!document) {
					document = this.CreateDocument();
				}
				localName = localName || this.localName;
				namespaceUri = namespaceUri || this.NamespaceURI;
				prefix = prefix || this.prefix;
				var xn = document.createElementNS(this.NamespaceURI, (prefix ? prefix + ':' : "") + localName);
				document.importNode(xn, true);
				return xn;
			}
		}, {
			key: 'CreateDocument',
			value: function CreateDocument() {
				return XmlObject.CreateDocument(this.localName, this.NamespaceURI, this.Prefix);
			}
		}, {
			key: 'Element',
			get: function get() {
				return this.element;
			}
		}, {
			key: 'Prefix',
			get: function get() {
				return this.prefix;
			},
			set: function set(value) {
				this.prefix = value;
			}
		}, {
			key: 'LocalName',
			get: function get() {
				return this.localName;
			}
		}, {
			key: 'NamespaceURI',
			get: function get() {
				return this.namespaceURI || null;
			}
		}], [{
			key: 'LoadXml',
			value: function LoadXml(param) {
				var xml = new this();
				xml.LoadXml(param);
				return xml;
			}
		}, {
			key: 'GetElement',
			value: function GetElement(element, name) {
				var required = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

				var xmlNodeList = element.getElementsByTagName(name);
				if (required && xmlNodeList.length === 0) {
					throw new XmlError(XE.ELEMENT_MISSING, name, element.localName);
				}
				return xmlNodeList[0] || null;
			}
		}, {
			key: 'GetAttribute',
			value: function GetAttribute(element, attrName, defaultValue) {
				var required = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

				if (element.hasAttribute(attrName)) {
					return element.getAttribute(attrName);
				} else {
					if (required) {
						throw new XmlError(XE.ATTRIBUTE_MISSING, attrName, element.localName);
					}
					return defaultValue;
				}
			}
		}, {
			key: 'GetElementById',
			value: function GetElementById(node, idValue) {
				if (node == null || idValue == null) {
					return null;
				}
				var xel = null;
				if (node.nodeType === XmlNodeType.Document) {
					xel = node.getElementById(idValue);
				}
				if (xel == null) {
					xel = SelectSingleNode(node, '//*[@Id=\'' + idValue + '\']');
					if (xel == null) {
						xel = SelectSingleNode(node, '//*[@ID=\'' + idValue + '\']');
						if (xel == null) {
							xel = SelectSingleNode(node, '//*[@id=\'' + idValue + '\']');
						}
					}
				}
				return xel;
			}
		}, {
			key: 'CreateDocument',
			value: function CreateDocument() {
				var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_NAME;
				var namespaceUri = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				var namePrefix = "";
				var nsPrefix = "";
				var namespaceUri2 = "";
				if (prefix) {
					namePrefix = prefix + ":";
					nsPrefix = ":" + prefix;
				}
				if (namespaceUri) {
					namespaceUri2 = ' xmlns' + nsPrefix + '="' + namespaceUri + '"';
				}
				var name = '' + namePrefix + root;
				var doc = new DOMParser().parseFromString('<' + name + namespaceUri2 + '></' + name + '>', APPLICATION_XML);
				return doc;
			}
		}, {
			key: 'GetChildren',
			value: function GetChildren(node, localName, nameSpace) {
				node = node.documentElement || node;
				var res = [];
				for (var i = 0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
						res.push(child);
					}
				}
				return res;
			}
		}, {
			key: 'GetFirstChild',
			value: function GetFirstChild(node, localName, nameSpace) {
				node = node.documentElement || node;
				for (var i = 0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
						return child;
					}
				}
				return null;
			}
		}, {
			key: 'GetChild',
			value: function GetChild(node, localName, nameSpace) {
				var required = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

				for (var i = 0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
						return child;
					}
				}
				if (required) {
					throw new XmlError(XE.ELEMENT_MISSING, localName, node.localName);
				}
				return null;
			}
		}]);

		return XmlObject;
	}();

	var XmlCollection = function (_XmlObject) {
		_inherits(XmlCollection, _XmlObject);

		function XmlCollection() {
			_classCallCheck(this, XmlCollection);

			var _this60 = _possibleConstructorReturn(this, (XmlCollection.__proto__ || Object.getPrototypeOf(XmlCollection)).apply(this, arguments));

			_this60.items = new Array();
			return _this60;
		}

		_createClass(XmlCollection, [{
			key: 'HasChanged',
			value: function HasChanged() {
				var res = _get(XmlCollection.prototype.__proto__ || Object.getPrototypeOf(XmlCollection.prototype), 'HasChanged', this).call(this);
				var changed = this.Some(function (item) {
					return item.HasChanged();
				});
				return res || changed;
			}
		}, {
			key: 'Item',
			value: function Item(index) {
				return this.items[index] || null;
			}
		}, {
			key: 'Add',
			value: function Add(item) {
				this.items.push(item);
				this.element = null;
			}
		}, {
			key: 'Pop',
			value: function Pop() {
				this.element = null;
				return this.items.pop();
			}
		}, {
			key: 'RemoveAt',
			value: function RemoveAt(index) {
				this.items = this.items.filter(function (item, index2) {
					return index2 !== index;
				});
				this.element = null;
			}
		}, {
			key: 'Clear',
			value: function Clear() {
				this.items = new Array();
				this.element = null;
			}
		}, {
			key: 'GetIterator',
			value: function GetIterator() {
				return this.items;
			}
		}, {
			key: 'ForEach',
			value: function ForEach(cb) {
				this.GetIterator().forEach(cb);
			}
		}, {
			key: 'Map',
			value: function Map(cb) {
				return new Collection(this.GetIterator().map(cb));
			}
		}, {
			key: 'Filter',
			value: function Filter(cb) {
				return new Collection(this.GetIterator().filter(cb));
			}
		}, {
			key: 'Sort',
			value: function Sort(cb) {
				return new Collection(this.GetIterator().sort(cb));
			}
		}, {
			key: 'Every',
			value: function Every(cb) {
				return this.GetIterator().every(cb);
			}
		}, {
			key: 'Some',
			value: function Some(cb) {
				return this.GetIterator().some(cb);
			}
		}, {
			key: 'IsEmpty',
			value: function IsEmpty() {
				return this.Count === 0;
			}
		}, {
			key: 'OnGetXml',
			value: function OnGetXml(element) {
				var _iteratorNormalCompletion23 = true;
				var _didIteratorError23 = false;
				var _iteratorError23 = undefined;

				try {
					for (var _iterator23 = this.GetIterator()[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
						var item = _step23.value;

						var el = item.GetXml();
						if (el) {
							element.appendChild(el);
						}
					}
				} catch (err) {
					_didIteratorError23 = true;
					_iteratorError23 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion23 && _iterator23.return) {
							_iterator23.return();
						}
					} finally {
						if (_didIteratorError23) {
							throw _iteratorError23;
						}
					}
				}
			}
		}, {
			key: 'OnLoadXml',
			value: function OnLoadXml(element) {
				var self = this.GetStatic();
				if (!self.parser) {
					throw new XmlError(XE.XML_EXCEPTION, self.localName + ' doesn\'t have required \'parser\' in @XmlElement');
				}
				for (var i = 0; i < element.childNodes.length; i++) {
					var node = element.childNodes.item(i);
					if (!(node.nodeType === XmlNodeType.Element && node.localName === self.parser.localName && node.namespaceURI == self.namespaceURI)) {
						continue;
					}
					var el = node;
					var item = new self.parser();
					item.LoadXml(el);
					this.Add(item);
				}
			}
		}, {
			key: 'Count',
			get: function get() {
				return this.items.length;
			}
		}]);

		return XmlCollection;
	}(XmlObject);

	var NamespaceManager = function (_Collection) {
		_inherits(NamespaceManager, _Collection);

		function NamespaceManager() {
			_classCallCheck(this, NamespaceManager);

			return _possibleConstructorReturn(this, (NamespaceManager.__proto__ || Object.getPrototypeOf(NamespaceManager)).apply(this, arguments));
		}

		_createClass(NamespaceManager, [{
			key: 'Add',
			value: function Add(item) {
				item.prefix = item.prefix || "";
				item.namespace = item.namespace || "";
				_get(NamespaceManager.prototype.__proto__ || Object.getPrototypeOf(NamespaceManager.prototype), 'Add', this).call(this, item);
			}
		}, {
			key: 'GetPrefix',
			value: function GetPrefix(prefix) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.Count - 1;

				var lim = this.Count - 1;
				prefix = prefix || "";
				if (start > lim) {
					start = lim;
				}
				for (var i = start; i >= 0; i--) {
					var item = this.items[i];
					if (item.prefix === prefix) {
						return item;
					}
				}
				return null;
			}
		}, {
			key: 'GetNamespace',
			value: function GetNamespace(namespaceUrl) {
				var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.Count - 1;

				var lim = this.Count - 1;
				namespaceUrl = namespaceUrl || "";
				if (start > lim) {
					start = lim;
				}
				for (var i = start; i >= 0; i--) {
					var item = this.items[i];
					if (item.namespace === namespaceUrl) {
						return item;
					}
				}
				return null;
			}
		}]);

		return NamespaceManager;
	}(Collection);

	var engineCrypto = null;
	var Application = function () {
		function Application() {}

		Application.setEngine = function (name, crypto) {
			engineCrypto = {
				getRandomValues: crypto.getRandomValues.bind(crypto),
				subtle: crypto.subtle,
				name: name
			};
			setEngine(name, new CryptoEngine({ name: name, crypto: crypto, subtle: crypto.subtle }), new CryptoEngine({ name: name, crypto: crypto, subtle: crypto.subtle }));
		};
		Object.defineProperty(Application, "crypto", {
			get: function get() {
				if (!engineCrypto) {
					throw new XmlError(XE.CRYPTOGRAPHIC_NO_MODULE);
				}
				return engineCrypto;
			},
			enumerable: true,
			configurable: true
		});
		Application.isNodePlugin = function () {
			return typeof self === "undefined" && typeof window === "undefined";
		};
		return Application;
	}();

	function init() {
		if (!Application.isNodePlugin()) {
			Application.setEngine("W3 WebCrypto module", self.crypto);
		}
	}
	init();

	(function (XmlCanonicalizerState) {
		XmlCanonicalizerState[XmlCanonicalizerState["BeforeDocElement"] = 0] = "BeforeDocElement";
		XmlCanonicalizerState[XmlCanonicalizerState["InsideDocElement"] = 1] = "InsideDocElement";
		XmlCanonicalizerState[XmlCanonicalizerState["AfterDocElement"] = 2] = "AfterDocElement";
	})(exports.XmlCanonicalizerState || (exports.XmlCanonicalizerState = {}));
	var XmlCanonicalizer = function () {
		function XmlCanonicalizer(withComments, excC14N, propagatedNamespaces) {
			if (propagatedNamespaces === void 0) {
				propagatedNamespaces = new NamespaceManager();
			}
			this.propagatedNamespaces = new NamespaceManager();
			this.result = [];
			this.visibleNamespaces = new NamespaceManager();
			this.inclusiveNamespacesPrefixList = [];
			this.state = exports.XmlCanonicalizerState.BeforeDocElement;
			this.withComments = withComments;
			this.exclusive = excC14N;
			this.propagatedNamespaces = propagatedNamespaces;
		}
		Object.defineProperty(XmlCanonicalizer.prototype, "InclusiveNamespacesPrefixList", {
			get: function get() {
				return this.inclusiveNamespacesPrefixList.join(" ");
			},
			set: function set(value) {
				this.inclusiveNamespacesPrefixList = value.split(" ");
			},
			enumerable: true,
			configurable: true
		});
		XmlCanonicalizer.prototype.Canonicalize = function (node) {
			if (!node) {
				throw new XmlError(XE.CRYPTOGRAPHIC, "Parameter 1 is not Node");
			}
			var node2;
			if (node.nodeType === XmlNodeType.Document) {
				this.document = node;
				node2 = this.document.documentElement;
			} else {
				this.document = node.ownerDocument;
				node2 = node;
			}

			this.WriteNode(node2);
			var res = this.result.join("");
			return res;
		};
		XmlCanonicalizer.prototype.WriteNode = function (node) {
			switch (node.nodeType) {
				case XmlNodeType.Document:
				case XmlNodeType.DocumentFragment:
					this.WriteDocumentNode(node);
					break;
				case XmlNodeType.Element:
					this.WriteElementNode(node);
					break;
				case XmlNodeType.CDATA:
				case XmlNodeType.SignificantWhitespace:
				case XmlNodeType.Text:
					this.WriteTextNode(node);
					break;
				case XmlNodeType.Whitespace:
					if (this.state === exports.XmlCanonicalizerState.InsideDocElement) {
						this.WriteTextNode(node);
					}
					break;
				case XmlNodeType.Comment:
					this.WriteCommentNode(node);
					break;
				case XmlNodeType.ProcessingInstruction:
					this.WriteProcessingInstructionNode(node);
					break;
				case XmlNodeType.EntityReference:
					for (var i = 0; i < node.childNodes.length; i++) {
						this.WriteNode(node.childNodes[i]);
					}
					break;
				case XmlNodeType.Attribute:
					throw new XmlError(XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
				case XmlNodeType.EndElement:
					throw new XmlError(XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
				case XmlNodeType.EndEntity:
					throw new XmlError(XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
				case XmlNodeType.DocumentType:
				case XmlNodeType.Entity:
				case XmlNodeType.Notation:
				case XmlNodeType.XmlDeclaration:
					break;
			}
		};
		XmlCanonicalizer.prototype.WriteDocumentNode = function (node) {
			this.state = exports.XmlCanonicalizerState.BeforeDocElement;
			for (var child = node.firstChild; child != null; child = child.nextSibling) {
				this.WriteNode(child);
			}
		};
		XmlCanonicalizer.prototype.WriteCommentNode = function (node) {
			if (this.withComments) {
				if (this.state === exports.XmlCanonicalizerState.AfterDocElement) {
					this.result.push(String.fromCharCode(10) + "<!--");
				} else {
					this.result.push("<!--");
				}
				this.result.push(this.NormalizeString(node.nodeValue, XmlNodeType.Comment));
				if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
					this.result.push("-->" + String.fromCharCode(10));
				} else {
					this.result.push("-->");
				}
			}
		};

		XmlCanonicalizer.prototype.WriteTextNode = function (node) {
			this.result.push(this.NormalizeString(node.nodeValue, node.nodeType));
		};

		XmlCanonicalizer.prototype.WriteProcessingInstructionNode = function (node) {
			if (this.state === exports.XmlCanonicalizerState.AfterDocElement) {
				this.result.push('\n<?');
			} else {
				this.result.push("<?");
			}
			this.result.push(node.nodeName);
			if (node.nodeValue) {
				this.result.push(" ");
				this.result.push(this.NormalizeString(node.nodeValue, XmlNodeType.ProcessingInstruction));
			}
			if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
				this.result.push('?>\n');
			} else {
				this.result.push("?>");
			}
		};
		XmlCanonicalizer.prototype.WriteElementNode = function (node) {
			if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
				this.state = exports.XmlCanonicalizerState.InsideDocElement;
			}

			this.result.push("<");
			this.result.push(node.nodeName);

			var visibleNamespacesCount = this.WriteNamespacesAxis(node);

			this.WriteAttributesAxis(node);
			this.result.push(">");
			for (var n = node.firstChild; n != null; n = n.nextSibling) {
				this.WriteNode(n);
			}

			this.result.push("</");
			this.result.push(node.nodeName);
			this.result.push(">");
			if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
				this.state = exports.XmlCanonicalizerState.AfterDocElement;
			}

			while (visibleNamespacesCount--) {
				this.visibleNamespaces.Pop();
			}
		};
		XmlCanonicalizer.prototype.WriteNamespacesAxis = function (node) {
			var _this = this;
			var list = [];
			var visibleNamespacesCount = 0;
			for (var i = 0; i < node.attributes.length; i++) {
				var attribute = node.attributes[i];
				if (!IsNamespaceNode(attribute)) {
					if (attribute.prefix && !this.IsNamespaceRendered(attribute.prefix, attribute.namespaceURI)) {
						var ns = { prefix: attribute.prefix, namespace: attribute.namespaceURI };
						list.push(ns);
						this.visibleNamespaces.Add(ns);
						visibleNamespacesCount++;
					}
					continue;
				}
				if (attribute.localName === "xmlns" && !attribute.prefix && !attribute.nodeValue) {
					var ns = { prefix: attribute.prefix, namespace: attribute.nodeValue };
					list.push(ns);
					this.visibleNamespaces.Add(ns);
					visibleNamespacesCount++;
				}

				var prefix = null;
				var matches = void 0;
				if (matches = /xmlns:([\w\.]+)/.exec(attribute.nodeName)) {
					prefix = matches[1];
				}
				var printable = true;
				if (this.exclusive && !this.IsNamespaceInclusive(node, prefix)) {
					var used = IsNamespaceUsed(node, prefix);
					if (used > 1) {
						printable = false;
					} else if (used === 0) {
						continue;
					}
				}
				if (this.IsNamespaceRendered(prefix, attribute.nodeValue)) {
					continue;
				}
				if (printable) {
					var ns = { prefix: prefix, namespace: attribute.nodeValue };
					list.push(ns);
					this.visibleNamespaces.Add(ns);
					visibleNamespacesCount++;
				}
			}
			if (!this.IsNamespaceRendered(node.prefix, node.namespaceURI) && node.namespaceURI !== "http://www.w3.org/2000/xmlns/") {
				var ns = { prefix: node.prefix, namespace: node.namespaceURI };
				list.push(ns);
				this.visibleNamespaces.Add(ns);
				visibleNamespacesCount++;
			}

			list.sort(XmlDsigC14NTransformNamespacesComparer);
			var prevPrefix = null;
			list.forEach(function (n) {
				if (n.prefix === prevPrefix) {
					return;
				}
				prevPrefix = n.prefix;
				_this.result.push(" xmlns");
				if (n.prefix) {
					_this.result.push(":" + n.prefix);
				}
				_this.result.push("=\"");
				_this.result.push(n.namespace);
				_this.result.push("\"");
			});
			return visibleNamespacesCount;
		};
		XmlCanonicalizer.prototype.WriteAttributesAxis = function (node) {
			var _this = this;
			var list = [];
			for (var i = 0; i < node.attributes.length; i++) {
				var attribute = node.attributes[i];
				if (!IsNamespaceNode(attribute)) {
					list.push(attribute);
				}
			}

			list.sort(XmlDsigC14NTransformAttributesComparer);
			list.forEach(function (attribute) {
				if (attribute != null) {
					_this.result.push(" ");
					_this.result.push(attribute.nodeName);
					_this.result.push("=\"");
					_this.result.push(_this.NormalizeString(attribute.nodeValue, XmlNodeType.Attribute));
					_this.result.push("\"");
				}
			});
		};
		XmlCanonicalizer.prototype.NormalizeString = function (input, type) {
			var sb = [];
			if (input) {
				for (var i = 0; i < input.length; i++) {
					var ch = input[i];
					if (ch === "<" && (type === XmlNodeType.Attribute || this.IsTextNode(type))) {
						sb.push("&lt;");
					} else if (ch === ">" && this.IsTextNode(type)) {
						sb.push("&gt;");
					} else if (ch === "&" && (type === XmlNodeType.Attribute || this.IsTextNode(type))) {
						sb.push("&amp;");
					} else if (ch === "\"" && type === XmlNodeType.Attribute) {
						sb.push("&quot;");
					} else if (ch === '\t' && type === XmlNodeType.Attribute) {
						sb.push("&#x9;");
					} else if (ch === '\n' && type === XmlNodeType.Attribute) {
						sb.push("&#xA;");
					} else if (ch === '\r') {
						sb.push("&#xD;");
					} else {
						sb.push(ch);
					}
				}
			}
			return sb.join("");
		};
		XmlCanonicalizer.prototype.IsTextNode = function (type) {
			switch (type) {
				case XmlNodeType.Text:
				case XmlNodeType.CDATA:
				case XmlNodeType.SignificantWhitespace:
				case XmlNodeType.Whitespace:
					return true;
			}
			return false;
		};
		XmlCanonicalizer.prototype.IsNamespaceInclusive = function (node, prefix) {
			var prefix2 = prefix || null;
			if (node.prefix === prefix2) {
				return false;
			}
			return this.inclusiveNamespacesPrefixList.indexOf(prefix2 || "") !== -1;
		};
		XmlCanonicalizer.prototype.IsNamespaceRendered = function (prefix, uri) {
			prefix = prefix || "";
			uri = uri || "";
			if (!prefix && !uri) {
				return true;
			}
			if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace") {
				return true;
			}
			var ns = this.visibleNamespaces.GetPrefix(prefix);
			if (ns) {
				return ns.namespace === uri;
			}
			return false;
		};
		return XmlCanonicalizer;
	}();
	function XmlDsigC14NTransformNamespacesComparer(x, y) {
		if (x == y) {
			return 0;
		} else if (!x) {
			return -1;
		} else if (!y) {
			return 1;
		} else if (!x.prefix) {
			return -1;
		} else if (!y.prefix) {
			return 1;
		}
		return x.prefix.localeCompare(y.prefix);
	}
	function XmlDsigC14NTransformAttributesComparer(x, y) {
		if (!x.namespaceURI && y.namespaceURI) {
			return -1;
		}
		if (!y.namespaceURI && x.namespaceURI) {
			return 1;
		}
		var left = x.namespaceURI + x.localName;
		var right = y.namespaceURI + y.localName;
		if (left === right) {
			return 0;
		} else if (left < right) {
			return -1;
		} else {
			return 1;
		}
	}
	function IsNamespaceUsed(node, prefix, result) {
		if (result === void 0) {
			result = 0;
		}
		var prefix2 = prefix || null;
		if (node.prefix === prefix2) {
			return ++result;
		}

		if (node.attributes) {
			for (var i = 0; i < node.attributes.length; i++) {
				var attr = node.attributes[i];
				if (!IsNamespaceNode(attr) && prefix && node.attributes[i].prefix === prefix) {
					return ++result;
				}
			}
		}

		for (var n = node.firstChild; !!n; n = n.nextSibling) {
			if (n.nodeType === XmlNodeType.Element) {
				var el = n;
				var res = IsNamespaceUsed(el, prefix, result);
				if (n.nodeType === XmlNodeType.Element && res) {
					return ++result + res;
				}
			}
		}
		return result;
	}
	function IsNamespaceNode(node) {
		var reg = /xmlns:/;
		if (node !== null && node.nodeType === XmlNodeType.Attribute && (node.nodeName === "xmlns" || reg.test(node.nodeName))) {
			return true;
		}
		return false;
	}

	var _extendStatics = function extendStatics(d, b) {
		_extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
			d.__proto__ = b;
		} || function (d, b) {
			for (var p in b) {
				if (b.hasOwnProperty(p)) d[p] = b[p];
			}
		};
		return _extendStatics(d, b);
	};

	function __extends$1(d, b) {
		_extendStatics(d, b);
		function __() {
			this.constructor = d;
		}
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	function __decorate$1(decorators, target, key, desc) {
		var c = arguments.length,
		    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
		    d;
		if ((typeof Reflect === 'undefined' ? 'undefined' : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
			if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
		}return c > 3 && r && Object.defineProperty(target, key, r), r;
	}

	var XmlSignature = {
		DefaultCanonMethod: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
		DefaultDigestMethod: "http://www.w3.org/2001/04/xmlenc#sha256",
		DefaultPrefix: " ",
		ElementNames: {
			CanonicalizationMethod: "CanonicalizationMethod",
			DigestMethod: "DigestMethod",
			DigestValue: "DigestValue",
			DSAKeyValue: "DSAKeyValue",
			DomainParameters: "DomainParameters",
			EncryptedKey: "EncryptedKey",
			HMACOutputLength: "HMACOutputLength",
			RSAPSSParams: "RSAPSSParams",
			MaskGenerationFunction: "MaskGenerationFunction",
			SaltLength: "SaltLength",
			KeyInfo: "KeyInfo",
			KeyName: "KeyName",
			KeyValue: "KeyValue",
			Modulus: "Modulus",
			Exponent: "Exponent",
			Manifest: "Manifest",
			Object: "Object",
			Reference: "Reference",
			RetrievalMethod: "RetrievalMethod",
			RSAKeyValue: "RSAKeyValue",
			ECDSAKeyValue: "ECDSAKeyValue",
			NamedCurve: "NamedCurve",
			PublicKey: "PublicKey",
			Signature: "Signature",
			SignatureMethod: "SignatureMethod",
			SignatureValue: "SignatureValue",
			SignedInfo: "SignedInfo",
			Transform: "Transform",
			Transforms: "Transforms",
			X509Data: "X509Data",
			PGPData: "PGPData",
			SPKIData: "SPKIData",
			SPKIexp: "SPKIexp",
			MgmtData: "MgmtData",
			X509IssuerSerial: "X509IssuerSerial",
			X509IssuerName: "X509IssuerName",
			X509SerialNumber: "X509SerialNumber",
			X509SKI: "X509SKI",
			X509SubjectName: "X509SubjectName",
			X509Certificate: "X509Certificate",
			X509CRL: "X509CRL",
			XPath: "XPath",
			X: "X",
			Y: "Y"
		},
		AttributeNames: {
			Algorithm: "Algorithm",
			Encoding: "Encoding",
			Id: "Id",
			MimeType: "MimeType",
			Type: "Type",
			URI: "URI",
			Filter: "Filter"
		},
		AlgorithmNamespaces: {
			XmlDsigBase64Transform: "http://www.w3.org/2000/09/xmldsig#base64",
			XmlDsigC14NTransform: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
			XmlDsigC14NWithCommentsTransform: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments",
			XmlDsigEnvelopedSignatureTransform: "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
			XmlDsigXPathTransform: "http://www.w3.org/TR/1999/REC-xpath-19991116",
			XmlDsigXsltTransform: "http://www.w3.org/TR/1999/REC-xslt-19991116",
			XmlDsigExcC14NTransform: "http://www.w3.org/2001/10/xml-exc-c14n#",
			XmlDsigExcC14NWithCommentsTransform: "http://www.w3.org/2001/10/xml-exc-c14n#WithComments",
			XmlDecryptionTransform: "http://www.w3.org/2002/07/decrypt#XML",
			XmlLicenseTransform: "urn:mpeg:mpeg21:2003:01-REL-R-NS:licenseTransform",
			XmlDsigFilterTransform: "http://www.w3.org/2002/06/xmldsig-filter2"
		},
		Uri: {
			Manifest: "http://www.w3.org/2000/09/xmldsig#Manifest"
		},
		NamespaceURI: "http://www.w3.org/2000/09/xmldsig#",
		NamespaceURIMore: "http://www.w3.org/2007/05/xmldsig-more#",
		NamespaceURIPss: "http://www.example.org/xmldsig-pss/#"
	};

	var XmlSignatureObject = function (_super) {
		__extends$1(XmlSignatureObject, _super);
		function XmlSignatureObject() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		XmlSignatureObject = __decorate$1([XmlElement({
			localName: "xmldsig",
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix
		})], XmlSignatureObject);
		return XmlSignatureObject;
	}(XmlObject);
	var XmlSignatureCollection = function (_super) {
		__extends$1(XmlSignatureCollection, _super);
		function XmlSignatureCollection() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		XmlSignatureCollection = __decorate$1([XmlElement({
			localName: "xmldsig_collection",
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix
		})], XmlSignatureCollection);
		return XmlSignatureCollection;
	}(XmlCollection);

	var KeyInfoClause = function (_super) {
		__extends$1(KeyInfoClause, _super);
		function KeyInfoClause() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		return KeyInfoClause;
	}(XmlSignatureObject);

	var XmlAlgorithm = function () {
		function XmlAlgorithm() {}
		XmlAlgorithm.prototype.getAlgorithmName = function () {
			return this.namespaceURI;
		};
		return XmlAlgorithm;
	}();
	var HashAlgorithm = function (_super) {
		__extends$1(HashAlgorithm, _super);
		function HashAlgorithm() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		HashAlgorithm.prototype.Digest = function (xml) {
			var _this = this;
			return Promise.resolve().then(function () {
				var buf;
				if (typeof xml === "string") {
					buf = Convert.FromString(xml, "utf8");
				} else if (ArrayBuffer.isView(xml) || xml instanceof ArrayBuffer) {
					buf = xml;
				} else {
					var txt = new XMLSerializer().serializeToString(xml);
					buf = Convert.FromString(txt, "utf8");
				}
				return Application.crypto.subtle.digest(_this.algorithm, buf);
			}).then(function (hash) {
				return new Uint8Array(hash);
			});
		};
		return HashAlgorithm;
	}(XmlAlgorithm);
	var SignatureAlgorithm = function (_super) {
		__extends$1(SignatureAlgorithm, _super);
		function SignatureAlgorithm() {
			return _super !== null && _super.apply(this, arguments) || this;
		}

		SignatureAlgorithm.prototype.Sign = function (signedInfo, signingKey, algorithm) {
			var info = Convert.FromString(signedInfo, "utf8");
			return Application.crypto.subtle.sign(algorithm, signingKey, info);
		};

		SignatureAlgorithm.prototype.Verify = function (signedInfo, key, signatureValue, algorithm) {
			var info = Convert.FromString(signedInfo, "utf8");
			return Application.crypto.subtle.verify(algorithm || this.algorithm, key, signatureValue, info);
		};
		return SignatureAlgorithm;
	}(XmlAlgorithm);

	var SHA1 = "SHA-1";
	var SHA256 = "SHA-256";
	var SHA384 = "SHA-384";
	var SHA512 = "SHA-512";
	var SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#sha1";
	var SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha256";
	var SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#sha384";
	var SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha512";
	var Sha1 = function (_super) {
		__extends$1(Sha1, _super);
		function Sha1() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = { name: SHA1 };
			_this.namespaceURI = SHA1_NAMESPACE;
			return _this;
		}
		return Sha1;
	}(HashAlgorithm);
	var Sha256 = function (_super) {
		__extends$1(Sha256, _super);
		function Sha256() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = { name: SHA256 };
			_this.namespaceURI = SHA256_NAMESPACE;
			return _this;
		}
		return Sha256;
	}(HashAlgorithm);
	var Sha384 = function (_super) {
		__extends$1(Sha384, _super);
		function Sha384() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = { name: SHA384 };
			_this.namespaceURI = SHA384_NAMESPACE;
			return _this;
		}
		return Sha384;
	}(HashAlgorithm);
	var Sha512 = function (_super) {
		__extends$1(Sha512, _super);
		function Sha512() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = { name: SHA512 };
			_this.namespaceURI = SHA512_NAMESPACE;
			return _this;
		}
		return Sha512;
	}(HashAlgorithm);

	var ECDSA = "ECDSA";
	var ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
	var ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
	var ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
	var ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";
	var EcdsaSha1 = function (_super) {
		__extends$1(EcdsaSha1, _super);
		function EcdsaSha1() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: ECDSA,
				hash: {
					name: SHA1
				}
			};
			_this.namespaceURI = ECDSA_SHA1_NAMESPACE;
			return _this;
		}
		return EcdsaSha1;
	}(SignatureAlgorithm);
	var EcdsaSha256 = function (_super) {
		__extends$1(EcdsaSha256, _super);
		function EcdsaSha256() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: ECDSA,
				hash: {
					name: SHA256
				}
			};
			_this.namespaceURI = ECDSA_SHA256_NAMESPACE;
			return _this;
		}
		return EcdsaSha256;
	}(SignatureAlgorithm);
	var EcdsaSha384 = function (_super) {
		__extends$1(EcdsaSha384, _super);
		function EcdsaSha384() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: ECDSA,
				hash: {
					name: SHA384
				}
			};
			_this.namespaceURI = ECDSA_SHA384_NAMESPACE;
			return _this;
		}
		return EcdsaSha384;
	}(SignatureAlgorithm);
	var EcdsaSha512 = function (_super) {
		__extends$1(EcdsaSha512, _super);
		function EcdsaSha512() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: ECDSA,
				hash: {
					name: SHA512
				}
			};
			_this.namespaceURI = ECDSA_SHA512_NAMESPACE;
			return _this;
		}
		return EcdsaSha512;
	}(SignatureAlgorithm);

	var HMAC = "HMAC";
	var HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
	var HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
	var HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
	var HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
	var HmacSha1 = function (_super) {
		__extends$1(HmacSha1, _super);
		function HmacSha1() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: HMAC,
				hash: {
					name: SHA1
				}
			};
			_this.namespaceURI = HMAC_SHA1_NAMESPACE;
			return _this;
		}
		return HmacSha1;
	}(SignatureAlgorithm);
	var HmacSha256 = function (_super) {
		__extends$1(HmacSha256, _super);
		function HmacSha256() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: HMAC,
				hash: {
					name: SHA256
				}
			};
			_this.namespaceURI = HMAC_SHA256_NAMESPACE;
			return _this;
		}
		return HmacSha256;
	}(SignatureAlgorithm);
	var HmacSha384 = function (_super) {
		__extends$1(HmacSha384, _super);
		function HmacSha384() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: HMAC,
				hash: {
					name: SHA384
				}
			};
			_this.namespaceURI = HMAC_SHA384_NAMESPACE;
			return _this;
		}
		return HmacSha384;
	}(SignatureAlgorithm);
	var HmacSha512 = function (_super) {
		__extends$1(HmacSha512, _super);
		function HmacSha512() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: HMAC,
				hash: {
					name: SHA512
				}
			};
			_this.namespaceURI = HMAC_SHA512_NAMESPACE;
			return _this;
		}
		return HmacSha512;
	}(SignatureAlgorithm);

	var RSA_PKCS1 = "RSASSA-PKCS1-v1_5";
	var RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
	var RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
	var RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
	var RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
	var RsaPkcs1Sha1 = function (_super) {
		__extends$1(RsaPkcs1Sha1, _super);
		function RsaPkcs1Sha1() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: RSA_PKCS1,
				hash: {
					name: SHA1
				}
			};
			_this.namespaceURI = RSA_PKCS1_SHA1_NAMESPACE;
			return _this;
		}
		return RsaPkcs1Sha1;
	}(SignatureAlgorithm);
	var RsaPkcs1Sha256 = function (_super) {
		__extends$1(RsaPkcs1Sha256, _super);
		function RsaPkcs1Sha256() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: RSA_PKCS1,
				hash: {
					name: SHA256
				}
			};
			_this.namespaceURI = RSA_PKCS1_SHA256_NAMESPACE;
			return _this;
		}
		return RsaPkcs1Sha256;
	}(SignatureAlgorithm);
	var RsaPkcs1Sha384 = function (_super) {
		__extends$1(RsaPkcs1Sha384, _super);
		function RsaPkcs1Sha384() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: RSA_PKCS1,
				hash: {
					name: SHA384
				}
			};
			_this.namespaceURI = RSA_PKCS1_SHA384_NAMESPACE;
			return _this;
		}
		return RsaPkcs1Sha384;
	}(SignatureAlgorithm);
	var RsaPkcs1Sha512 = function (_super) {
		__extends$1(RsaPkcs1Sha512, _super);
		function RsaPkcs1Sha512() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.algorithm = {
				name: RSA_PKCS1,
				hash: {
					name: SHA512
				}
			};
			_this.namespaceURI = RSA_PKCS1_SHA512_NAMESPACE;
			return _this;
		}
		return RsaPkcs1Sha512;
	}(SignatureAlgorithm);

	var RSA_PSS = "RSA-PSS";
	var RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
	var RsaPssBase = function (_super) {
		__extends$1(RsaPssBase, _super);
		function RsaPssBase(saltLength) {
			var _this = _super.call(this) || this;
			_this.algorithm = {
				name: RSA_PSS,
				hash: {
					name: SHA1
				}
			};
			_this.namespaceURI = RSA_PSS_WITH_PARAMS_NAMESPACE;
			if (saltLength) {
				_this.algorithm.saltLength = saltLength;
			}
			return _this;
		}
		return RsaPssBase;
	}(SignatureAlgorithm);
	var RsaPssSha1 = function (_super) {
		__extends$1(RsaPssSha1, _super);
		function RsaPssSha1(saltLength) {
			var _this = _super.call(this, saltLength) || this;
			_this.algorithm.hash.name = SHA1;
			return _this;
		}
		return RsaPssSha1;
	}(RsaPssBase);
	var RsaPssSha256 = function (_super) {
		__extends$1(RsaPssSha256, _super);
		function RsaPssSha256(saltLength) {
			var _this = _super.call(this, saltLength) || this;
			_this.algorithm.hash.name = SHA256;
			return _this;
		}
		return RsaPssSha256;
	}(RsaPssBase);
	var RsaPssSha384 = function (_super) {
		__extends$1(RsaPssSha384, _super);
		function RsaPssSha384(saltLength) {
			var _this = _super.call(this, saltLength) || this;
			_this.algorithm.hash.name = SHA384;
			return _this;
		}
		return RsaPssSha384;
	}(RsaPssBase);
	var RsaPssSha512 = function (_super) {
		__extends$1(RsaPssSha512, _super);
		function RsaPssSha512(saltLength) {
			var _this = _super.call(this, saltLength) || this;
			_this.algorithm.hash.name = SHA512;
			return _this;
		}
		return RsaPssSha512;
	}(RsaPssBase);

	var CanonicalizationMethod = function (_super) {
		__extends$1(CanonicalizationMethod, _super);
		function CanonicalizationMethod() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Algorithm,
			required: true,
			defaultValue: XmlSignature.DefaultCanonMethod
		})], CanonicalizationMethod.prototype, "Algorithm", void 0);
		CanonicalizationMethod = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.CanonicalizationMethod
		})], CanonicalizationMethod);
		return CanonicalizationMethod;
	}(XmlSignatureObject);

	var DataObject = function (_super) {
		__extends$1(DataObject, _super);
		function DataObject() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Id,
			defaultValue: ""
		})], DataObject.prototype, "Id", void 0);
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.MimeType,
			defaultValue: ""
		})], DataObject.prototype, "MimeType", void 0);
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Encoding,
			defaultValue: ""
		})], DataObject.prototype, "Encoding", void 0);
		DataObject = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.Object
		})], DataObject);
		return DataObject;
	}(XmlSignatureObject);
	var DataObjects = function (_super) {
		__extends$1(DataObjects, _super);
		function DataObjects() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		DataObjects = __decorate$1([XmlElement({
			localName: "xmldsig_objects",
			parser: DataObject
		})], DataObjects);
		return DataObjects;
	}(XmlSignatureCollection);

	var DigestMethod = function (_super) {
		__extends$1(DigestMethod, _super);
		function DigestMethod() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Algorithm,
			required: true,
			defaultValue: XmlSignature.DefaultDigestMethod
		})], DigestMethod.prototype, "Algorithm", void 0);
		DigestMethod = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.DigestMethod
		})], DigestMethod);
		return DigestMethod;
	}(XmlSignatureObject);

	var KeyInfo = function (_super) {
		__extends$1(KeyInfo, _super);
		function KeyInfo() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		KeyInfo.prototype.OnLoadXml = function (element) {
			var _loop_1 = function _loop_1(i) {
				var node = element.childNodes.item(i);
				if (node.nodeType !== XmlNodeType.Element) {
					return "continue";
				}
				var KeyInfoClass = null;
				switch (node.localName) {
					case XmlSignature.ElementNames.KeyValue:
						KeyInfoClass = KeyValue;
						break;
					case XmlSignature.ElementNames.X509Data:
						KeyInfoClass = KeyInfoX509Data;
						break;
					case XmlSignature.ElementNames.SPKIData:
						KeyInfoClass = SPKIData;
						break;
					case XmlSignature.ElementNames.KeyName:
					case XmlSignature.ElementNames.RetrievalMethod:
					case XmlSignature.ElementNames.PGPData:
					case XmlSignature.ElementNames.MgmtData:
				}
				if (KeyInfoClass) {
					var item = new KeyInfoClass();
					item.LoadXml(node);
					if (item instanceof KeyValue) {
						var keyValue_1 = null;
						[RsaKeyValue, EcdsaKeyValue].some(function (KeyClass) {
							try {
								var k = new KeyClass();
								for (var j = 0; j < node.childNodes.length; j++) {
									var nodeKey = node.childNodes.item(j);
									if (nodeKey.nodeType !== XmlNodeType.Element) {
										continue;
									}
									k.LoadXml(nodeKey);
									keyValue_1 = k;
									return true;
								}
							} catch (e) {}
							return false;
						});
						if (keyValue_1) {
							item.Value = keyValue_1;
						} else {
							throw new XmlError(XE.CRYPTOGRAPHIC, "Unsupported KeyValue in use");
						}
						item.GetXml();
					}
					this_1.Add(item);
				}
			};
			var this_1 = this;
			for (var i = 0; i < element.childNodes.length; i++) {
				_loop_1(i);
			}
		};
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Id,
			defaultValue: ""
		})], KeyInfo.prototype, "Id", void 0);
		KeyInfo = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.KeyInfo
		})], KeyInfo);
		return KeyInfo;
	}(XmlSignatureCollection);

	var Transform = function (_super) {
		__extends$1(Transform, _super);
		function Transform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.innerXml = null;
			return _this;
		}

		Transform.prototype.GetOutput = function () {
			throw new XmlError(XE.METHOD_NOT_IMPLEMENTED);
		};
		Transform.prototype.LoadInnerXml = function (node) {
			if (!node) {
				throw new XmlError(XE.PARAM_REQUIRED, "node");
			}
			this.innerXml = node;
		};
		Transform.prototype.GetInnerXml = function () {
			return this.innerXml;
		};
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Algorithm,
			defaultValue: ""
		})], Transform.prototype, "Algorithm", void 0);
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.XPath,
			defaultValue: ""
		})], Transform.prototype, "XPath", void 0);
		Transform = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.Transform
		})], Transform);
		return Transform;
	}(XmlSignatureObject);

	var XmlDsigBase64Transform = function (_super) {
		__extends$1(XmlDsigBase64Transform, _super);
		function XmlDsigBase64Transform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform;
			return _this;
		}

		XmlDsigBase64Transform.prototype.GetOutput = function () {
			if (!this.innerXml) {
				throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
			}
			return Convert.FromString(this.innerXml.textContent || "", "base64");
		};
		return XmlDsigBase64Transform;
	}(Transform);

	var XmlDsigC14NTransform = function (_super) {
		__extends$1(XmlDsigC14NTransform, _super);
		function XmlDsigC14NTransform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
			_this.xmlCanonicalizer = new XmlCanonicalizer(false, false);
			return _this;
		}

		XmlDsigC14NTransform.prototype.GetOutput = function () {
			if (!this.innerXml) {
				throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
			}
			return this.xmlCanonicalizer.Canonicalize(this.innerXml);
		};
		return XmlDsigC14NTransform;
	}(Transform);

	var XmlDsigC14NWithCommentsTransform = function (_super) {
		__extends$1(XmlDsigC14NWithCommentsTransform, _super);
		function XmlDsigC14NWithCommentsTransform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments";
			_this.xmlCanonicalizer = new XmlCanonicalizer(true, false);
			return _this;
		}
		return XmlDsigC14NWithCommentsTransform;
	}(XmlDsigC14NTransform);

	var XmlDsigEnvelopedSignatureTransform = function (_super) {
		__extends$1(XmlDsigEnvelopedSignatureTransform, _super);
		function XmlDsigEnvelopedSignatureTransform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.Algorithm = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
			return _this;
		}

		XmlDsigEnvelopedSignatureTransform.prototype.GetOutput = function () {
			if (!this.innerXml) {
				throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
			}
			var signature = Select(this.innerXml, ".//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
			if (signature) {
				signature.parentNode.removeChild(signature);
			}
			return this.innerXml;
		};
		return XmlDsigEnvelopedSignatureTransform;
	}(Transform);

	var XmlDsigExcC14NTransform = function (_super) {
		__extends$1(XmlDsigExcC14NTransform, _super);
		function XmlDsigExcC14NTransform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
			_this.xmlCanonicalizer = new XmlCanonicalizer(false, true);
			return _this;
		}
		Object.defineProperty(XmlDsigExcC14NTransform.prototype, "InclusiveNamespacesPrefixList", {
			get: function get() {
				return this.xmlCanonicalizer.InclusiveNamespacesPrefixList;
			},
			set: function set(value) {
				this.xmlCanonicalizer.InclusiveNamespacesPrefixList = value;
			},
			enumerable: true,
			configurable: true
		});

		XmlDsigExcC14NTransform.prototype.GetOutput = function () {
			if (!this.innerXml) {
				throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
			}
			return this.xmlCanonicalizer.Canonicalize(this.innerXml);
		};
		return XmlDsigExcC14NTransform;
	}(Transform);

	var XmlDsigExcC14NWithCommentsTransform = function (_super) {
		__extends$1(XmlDsigExcC14NWithCommentsTransform, _super);
		function XmlDsigExcC14NWithCommentsTransform() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#WithComments";
			_this.xmlCanonicalizer = new XmlCanonicalizer(true, true);
			return _this;
		}
		return XmlDsigExcC14NWithCommentsTransform;
	}(XmlDsigExcC14NTransform);

	var XPathDisplayFilterObject = function (_super) {
		__extends$1(XPathDisplayFilterObject, _super);
		function XPathDisplayFilterObject() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Filter,
			required: true
		})], XPathDisplayFilterObject.prototype, "Filter", void 0);
		__decorate$1([XmlContent({
			required: true
		})], XPathDisplayFilterObject.prototype, "XPath", void 0);
		XPathDisplayFilterObject = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.XPath,
			prefix: "",
			namespaceURI: "http://www.w3.org/2002/06/xmldsig-filter2"
		})], XPathDisplayFilterObject);
		return XPathDisplayFilterObject;
	}(XmlSignatureObject);

	var XmlDsigDisplayFilterTransform = function (_super) {
		__extends$1(XmlDsigDisplayFilterTransform, _super);
		function XmlDsigDisplayFilterTransform(params) {
			var _this = _super.call(this) || this;
			_this.Algorithm = "http://www.w3.org/2002/06/xmldsig-filter2";
			if (params == null) throw Error("params is undefined");
			_this.XPathFilter = new XPathDisplayFilterObject();
			_this.XPathFilter.Prefix = "";
			_this.XPathFilter.XPath = params.XPath;
			_this.XPathFilter.Filter = params.Filter;
			return _this;
		}

		XmlDsigDisplayFilterTransform.prototype.GetOutput = function () {
			if (!this.innerXml) {
				throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
			}
			return this.innerXml;
		};
		__decorate$1([XmlChildElement({
			localName: "XPath",
			required: true,
			parser: XPathDisplayFilterObject,
			prefix: "",
			namespaceURI: XmlSignature.NamespaceURI
		})], XmlDsigDisplayFilterTransform.prototype, "XPathFilter", void 0);
		return XmlDsigDisplayFilterTransform;
	}(Transform);

	var Transforms = function (_super) {
		__extends$1(Transforms, _super);
		function Transforms() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		Transforms.prototype.OnLoadXml = function (element) {
			_super.prototype.OnLoadXml.call(this, element);

			this.items = this.GetIterator().map(function (item) {
				switch (item.Algorithm) {
					case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
						return ChangeTransform(item, XmlDsigEnvelopedSignatureTransform);
					case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
						return ChangeTransform(item, XmlDsigC14NTransform);
					case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
						return ChangeTransform(item, XmlDsigC14NWithCommentsTransform);
					case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
						return ChangeTransform(item, XmlDsigExcC14NTransform);
					case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
						return ChangeTransform(item, XmlDsigExcC14NWithCommentsTransform);
					case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
						return ChangeTransform(item, XmlDsigBase64Transform);
					case XmlSignature.AlgorithmNamespaces.XmlDsigFilterTransform:
						return ChangeTransform(item, XmlDsigDisplayFilterTransform);
					default:
						throw new XmlError(XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, item.Algorithm);
				}
			});
		};
		Transforms = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.Transforms,
			parser: Transform
		})], Transforms);
		return Transforms;
	}(XmlSignatureCollection);
	function ChangeTransform(t1, t2) {
		var t = new t2();
		t.element = t1.Element;
		return t;
	}

	var Reference = function (_super) {
		__extends$1(Reference, _super);
		function Reference(uri) {
			var _this = _super.call(this) || this;
			if (uri) {
				_this.Uri = uri;
			}
			return _this;
		}
		__decorate$1([XmlAttribute({
			defaultValue: ""
		})], Reference.prototype, "Id", void 0);
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.URI
		})], Reference.prototype, "Uri", void 0);
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Type,
			defaultValue: ""
		})], Reference.prototype, "Type", void 0);
		__decorate$1([XmlChildElement({
			parser: Transforms
		})], Reference.prototype, "Transforms", void 0);
		__decorate$1([XmlChildElement({
			required: true,
			parser: DigestMethod
		})], Reference.prototype, "DigestMethod", void 0);
		__decorate$1([XmlChildElement({
			required: true,
			localName: XmlSignature.ElementNames.DigestValue,
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix,
			converter: XmlBase64Converter
		})], Reference.prototype, "DigestValue", void 0);
		Reference = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.Reference
		})], Reference);
		return Reference;
	}(XmlSignatureObject);
	var References = function (_super) {
		__extends$1(References, _super);
		function References() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		References = __decorate$1([XmlElement({
			localName: "References",
			parser: Reference
		})], References);
		return References;
	}(XmlSignatureCollection);

	var SignatureMethodOther = function (_super) {
		__extends$1(SignatureMethodOther, _super);
		function SignatureMethodOther() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		SignatureMethodOther.prototype.OnLoadXml = function (element) {
			for (var i = 0; i < element.childNodes.length; i++) {
				var node = element.childNodes.item(i);
				if (node.nodeType !== XmlNodeType.Element || node.nodeName === XmlSignature.ElementNames.HMACOutputLength) {
					continue;
				}
				var ParserClass = void 0;
				switch (node.localName) {
					case XmlSignature.ElementNames.RSAPSSParams:
						ParserClass = PssAlgorithmParams;
						break;
					default:
						break;
				}
				if (ParserClass) {
					var xml = new ParserClass();
					xml.LoadXml(node);
					this.Add(xml);
				}
			}
		};
		SignatureMethodOther = __decorate$1([XmlElement({
			localName: "Other"
		})], SignatureMethodOther);
		return SignatureMethodOther;
	}(XmlSignatureCollection);
	var SignatureMethod = function (_super) {
		__extends$1(SignatureMethod, _super);
		function SignatureMethod() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Algorithm,
			required: true,
			defaultValue: ""
		})], SignatureMethod.prototype, "Algorithm", void 0);
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.HMACOutputLength,
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix,
			converter: XmlNumberConverter
		})], SignatureMethod.prototype, "HMACOutputLength", void 0);
		__decorate$1([XmlChildElement({
			parser: SignatureMethodOther,
			noRoot: true,
			minOccurs: 0
		})], SignatureMethod.prototype, "Any", void 0);
		SignatureMethod = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.SignatureMethod
		})], SignatureMethod);
		return SignatureMethod;
	}(XmlSignatureObject);

	var SignedInfo = function (_super) {
		__extends$1(SignedInfo, _super);
		function SignedInfo() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Id,
			defaultValue: ""
		})], SignedInfo.prototype, "Id", void 0);
		__decorate$1([XmlChildElement({
			parser: CanonicalizationMethod,
			required: true
		})], SignedInfo.prototype, "CanonicalizationMethod", void 0);
		__decorate$1([XmlChildElement({
			parser: SignatureMethod,
			required: true
		})], SignedInfo.prototype, "SignatureMethod", void 0);
		__decorate$1([XmlChildElement({
			parser: References,
			minOccurs: 1,
			noRoot: true
		})], SignedInfo.prototype, "References", void 0);
		SignedInfo = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.SignedInfo
		})], SignedInfo);
		return SignedInfo;
	}(XmlSignatureObject);

	var Signature$1 = function (_super) {
		__extends$1(Signature, _super);
		function Signature() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Id,
			defaultValue: ""
		})], Signature.prototype, "Id", void 0);
		__decorate$1([XmlChildElement({
			parser: SignedInfo,
			required: true
		})], Signature.prototype, "SignedInfo", void 0);
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.SignatureValue,
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix,
			required: true,
			converter: XmlBase64Converter,
			defaultValue: null
		})], Signature.prototype, "SignatureValue", void 0);
		__decorate$1([XmlChildElement({
			parser: KeyInfo
		})], Signature.prototype, "KeyInfo", void 0);
		__decorate$1([XmlChildElement({
			parser: DataObjects,
			noRoot: true
		})], Signature.prototype, "ObjectList", void 0);
		Signature = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.Signature
		})], Signature);
		return Signature;
	}(XmlSignatureObject);

	var NAMESPACE_URI = "http://www.w3.org/2001/04/xmldsig-more#";
	var PREFIX = "ecdsa";
	var EcdsaPublicKey = function (_super) {
		__extends$1(EcdsaPublicKey, _super);
		function EcdsaPublicKey() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.X,
			namespaceURI: NAMESPACE_URI,
			prefix: PREFIX,
			required: true,
			converter: XmlBase64Converter
		})], EcdsaPublicKey.prototype, "X", void 0);
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.Y,
			namespaceURI: NAMESPACE_URI,
			prefix: PREFIX,
			required: true,
			converter: XmlBase64Converter
		})], EcdsaPublicKey.prototype, "Y", void 0);
		EcdsaPublicKey = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.PublicKey,
			namespaceURI: NAMESPACE_URI,
			prefix: PREFIX
		})], EcdsaPublicKey);
		return EcdsaPublicKey;
	}(XmlObject);
	var NamedCurve = function (_super) {
		__extends$1(NamedCurve, _super);
		function NamedCurve() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.URI,
			required: true
		})], NamedCurve.prototype, "Uri", void 0);
		NamedCurve = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.NamedCurve,
			namespaceURI: NAMESPACE_URI,
			prefix: PREFIX
		})], NamedCurve);
		return NamedCurve;
	}(XmlObject);
	var DomainParameters = function (_super) {
		__extends$1(DomainParameters, _super);
		function DomainParameters() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlChildElement({
			parser: NamedCurve
		})], DomainParameters.prototype, "NamedCurve", void 0);
		DomainParameters = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.DomainParameters,
			namespaceURI: NAMESPACE_URI,
			prefix: PREFIX
		})], DomainParameters);
		return DomainParameters;
	}(XmlObject);

	var EcdsaKeyValue = function (_super) {
		__extends$1(EcdsaKeyValue, _super);
		function EcdsaKeyValue() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.name = XmlSignature.ElementNames.ECDSAKeyValue;
			_this.key = null;
			_this.jwk = null;
			_this.keyUsage = null;
			return _this;
		}
		Object.defineProperty(EcdsaKeyValue.prototype, "NamedCurve", {
			get: function get() {
				return GetNamedCurveOid(this.DomainParameters.NamedCurve.Uri);
			},
			enumerable: true,
			configurable: true
		});

		EcdsaKeyValue.prototype.importKey = function (key) {
			var _this = this;
			return new Promise(function (resolve, reject) {
				if (key.algorithm.name.toUpperCase() !== "ECDSA") {
					throw new XmlError(XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
				}
				_this.key = key;
				Application.crypto.subtle.exportKey("jwk", key).then(function (jwk) {
					_this.jwk = jwk;
					_this.PublicKey = new EcdsaPublicKey();
					_this.PublicKey.X = Convert.FromString(jwk.x, "base64url");
					_this.PublicKey.Y = Convert.FromString(jwk.y, "base64url");
					if (!_this.DomainParameters) {
						_this.DomainParameters = new DomainParameters();
					}
					if (!_this.DomainParameters.NamedCurve) {
						_this.DomainParameters.NamedCurve = new NamedCurve();
					}
					_this.DomainParameters.NamedCurve.Uri = GetNamedCurveOid(jwk.crv);
					_this.keyUsage = key.usages;
					return Promise.resolve(_this);
				}).then(resolve, reject);
			});
		};

		EcdsaKeyValue.prototype.exportKey = function (alg) {
			var _this = this;
			return Promise.resolve().then(function () {
				if (_this.key) {
					return _this.key;
				}

				var x = Convert.ToBase64Url(_this.PublicKey.X);
				var y = Convert.ToBase64Url(_this.PublicKey.Y);
				var crv = GetNamedCurveFromOid(_this.DomainParameters.NamedCurve.Uri);
				var jwk = {
					kty: "EC",
					crv: crv,
					x: x,
					y: y,
					ext: true
				};
				_this.keyUsage = ["verify"];
				return Application.crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: crv }, true, _this.keyUsage);
			}).then(function (key) {
				_this.key = key;
				return _this.key;
			});
		};
		__decorate$1([XmlChildElement({
			parser: DomainParameters
		})], EcdsaKeyValue.prototype, "DomainParameters", void 0);
		__decorate$1([XmlChildElement({
			parser: EcdsaPublicKey,
			required: true
		})], EcdsaKeyValue.prototype, "PublicKey", void 0);
		EcdsaKeyValue = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.ECDSAKeyValue,
			namespaceURI: NAMESPACE_URI,
			prefix: PREFIX
		})], EcdsaKeyValue);
		return EcdsaKeyValue;
	}(KeyInfoClause);
	function GetNamedCurveOid(namedCurve) {
		switch (namedCurve) {
			case "P-256":
				return "urn:oid:1.2.840.10045.3.1.7";
			case "P-384":
				return "urn:oid:1.3.132.0.34";
			case "P-521":
				return "urn:oid:1.3.132.0.35";
		}
		throw new XmlError(XE.CRYPTOGRAPHIC, "Unknown NamedCurve");
	}
	function GetNamedCurveFromOid(oid) {
		switch (oid) {
			case "urn:oid:1.2.840.10045.3.1.7":
				return "P-256";
			case "urn:oid:1.3.132.0.34":
				return "P-384";
			case "urn:oid:1.3.132.0.35":
				return "P-521";
		}
		throw new XmlError(XE.CRYPTOGRAPHIC, "Unknown NamedCurve OID");
	}

	var RsaKeyValue = function (_super) {
		__extends$1(RsaKeyValue, _super);
		function RsaKeyValue() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.key = null;
			_this.jwk = null;
			_this.keyUsage = [];
			return _this;
		}

		RsaKeyValue.prototype.importKey = function (key) {
			var _this = this;
			return new Promise(function (resolve, reject) {
				var algName = key.algorithm.name.toUpperCase();
				if (algName !== RSA_PKCS1.toUpperCase() && algName !== RSA_PSS.toUpperCase()) {
					throw new XmlError(XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
				}
				_this.key = key;
				Application.crypto.subtle.exportKey("jwk", key).then(function (jwk) {
					_this.jwk = jwk;
					_this.Modulus = Convert.FromBase64Url(jwk.n);
					_this.Exponent = Convert.FromBase64Url(jwk.e);
					_this.keyUsage = key.usages;
					return Promise.resolve(_this);
				}).then(resolve, reject);
			});
		};

		RsaKeyValue.prototype.exportKey = function (alg) {
			var _this = this;
			return new Promise(function (resolve, reject) {
				if (_this.key) {
					return resolve(_this.key);
				}

				if (!_this.Modulus) {
					throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKeyValue has no Modulus");
				}
				var modulus = Convert.ToBase64Url(_this.Modulus);
				if (!_this.Exponent) {
					throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKeyValue has no Exponent");
				}
				var exponent = Convert.ToBase64Url(_this.Exponent);
				var algJwk;
				switch (alg.name.toUpperCase()) {
					case RSA_PKCS1.toUpperCase():
						algJwk = "R";
						break;
					case RSA_PSS.toUpperCase():
						algJwk = "P";
						break;
					default:
						throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, alg.name);
				}

				switch (alg.hash.name.toUpperCase()) {
					case SHA1:
						algJwk += "S1";
						break;
					case SHA256:
						algJwk += "S256";
						break;
					case SHA384:
						algJwk += "S384";
						break;
					case SHA512:
						algJwk += "S512";
						break;
				}
				var jwk = {
					kty: "RSA",
					alg: algJwk,
					n: modulus,
					e: exponent,
					ext: true
				};
				Application.crypto.subtle.importKey("jwk", jwk, alg, true, _this.keyUsage).then(resolve, reject);
			});
		};

		RsaKeyValue.prototype.LoadXml = function (node) {
			_super.prototype.LoadXml.call(this, node);
			this.keyUsage = ["verify"];
		};
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.Modulus,
			prefix: XmlSignature.DefaultPrefix,
			namespaceURI: XmlSignature.NamespaceURI,
			required: true,
			converter: XmlBase64Converter
		})], RsaKeyValue.prototype, "Modulus", void 0);
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.Exponent,
			prefix: XmlSignature.DefaultPrefix,
			namespaceURI: XmlSignature.NamespaceURI,
			required: true,
			converter: XmlBase64Converter
		})], RsaKeyValue.prototype, "Exponent", void 0);
		RsaKeyValue = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.RSAKeyValue
		})], RsaKeyValue);
		return RsaKeyValue;
	}(KeyInfoClause);

	var NAMESPACE_URI$1 = "http://www.w3.org/2007/05/xmldsig-more#";
	var PREFIX$1 = "pss";
	var MaskGenerationFunction = function (_super) {
		__extends$1(MaskGenerationFunction, _super);
		function MaskGenerationFunction() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlChildElement({
			parser: DigestMethod
		})], MaskGenerationFunction.prototype, "DigestMethod", void 0);
		__decorate$1([XmlAttribute({
			localName: XmlSignature.AttributeNames.Algorithm,
			defaultValue: "http://www.w3.org/2007/05/xmldsig-more#MGF1"
		})], MaskGenerationFunction.prototype, "Algorithm", void 0);
		MaskGenerationFunction = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.MaskGenerationFunction,
			prefix: PREFIX$1,
			namespaceURI: NAMESPACE_URI$1
		})], MaskGenerationFunction);
		return MaskGenerationFunction;
	}(XmlObject);
	var PssAlgorithmParams = function (_super) {
		__extends$1(PssAlgorithmParams, _super);
		function PssAlgorithmParams(algorithm) {
			var _this = _super.call(this) || this;
			if (algorithm) {
				_this.FromAlgorithm(algorithm);
			}
			return _this;
		}
		PssAlgorithmParams_1 = PssAlgorithmParams;
		PssAlgorithmParams.FromAlgorithm = function (algorithm) {
			return new PssAlgorithmParams_1(algorithm);
		};
		PssAlgorithmParams.prototype.FromAlgorithm = function (algorithm) {
			this.DigestMethod = new DigestMethod();
			var digest = CryptoConfig.GetHashAlgorithm(algorithm.hash);
			this.DigestMethod.Algorithm = digest.namespaceURI;
			if (algorithm.saltLength) {
				this.SaltLength = algorithm.saltLength;
			}
		};
		var PssAlgorithmParams_1;
		__decorate$1([XmlChildElement({
			parser: DigestMethod
		})], PssAlgorithmParams.prototype, "DigestMethod", void 0);
		__decorate$1([XmlChildElement({
			parser: MaskGenerationFunction
		})], PssAlgorithmParams.prototype, "MGF", void 0);
		__decorate$1([XmlChildElement({
			converter: XmlNumberConverter,
			prefix: PREFIX$1,
			namespaceURI: NAMESPACE_URI$1
		})], PssAlgorithmParams.prototype, "SaltLength", void 0);
		__decorate$1([XmlChildElement({
			converter: XmlNumberConverter
		})], PssAlgorithmParams.prototype, "TrailerField", void 0);
		PssAlgorithmParams = PssAlgorithmParams_1 = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.RSAPSSParams,
			prefix: PREFIX$1,
			namespaceURI: NAMESPACE_URI$1
		})], PssAlgorithmParams);
		return PssAlgorithmParams;
	}(XmlObject);

	var KeyValue = function (_super) {
		__extends$1(KeyValue, _super);
		function KeyValue(value) {
			var _this = _super.call(this) || this;
			if (value) {
				_this.Value = value;
			}
			return _this;
		}
		Object.defineProperty(KeyValue.prototype, "Value", {
			get: function get() {
				return this.value;
			},
			set: function set(v) {
				this.element = null;
				this.value = v;
			},
			enumerable: true,
			configurable: true
		});
		KeyValue.prototype.importKey = function (key) {
			var _this = this;
			return Promise.resolve().then(function () {
				switch (key.algorithm.name.toUpperCase()) {
					case RSA_PSS.toUpperCase():
					case RSA_PKCS1.toUpperCase():
						_this.Value = new RsaKeyValue();
						return _this.Value.importKey(key);
					case ECDSA.toUpperCase():
						_this.Value = new EcdsaKeyValue();
						return _this.Value.importKey(key);
					default:
						throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, key.algorithm.name);
				}
			}).then(function () {
				return _this;
			});
		};
		KeyValue.prototype.exportKey = function (alg) {
			var _this = this;
			return Promise.resolve().then(function () {
				if (!_this.Value) {
					throw new XmlError(XE.NULL_REFERENCE);
				}
				return _this.Value.exportKey(alg);
			});
		};
		KeyValue.prototype.OnGetXml = function (element) {
			if (!this.Value) {
				throw new XmlError(XE.CRYPTOGRAPHIC, "KeyValue has empty value");
			}
			var node = this.Value.GetXml();
			if (node) {
				element.appendChild(node);
			}
		};
		KeyValue = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.KeyValue
		})], KeyValue);
		return KeyValue;
	}(KeyInfoClause);

	function getParametersValue$1(parameters, name, defaultValue) {
		if (parameters instanceof Object === false) return defaultValue;

		if (name in parameters) return parameters[name];

		return defaultValue;
	}

	function bufferToHexCodes$1(inputBuffer) {
		var inputOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var inputLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : inputBuffer.byteLength - inputOffset;
		var insertSpace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		var result = "";

		var _iteratorNormalCompletion24 = true;
		var _didIteratorError24 = false;
		var _iteratorError24 = undefined;

		try {
			for (var _iterator24 = new Uint8Array(inputBuffer, inputOffset, inputLength)[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
				var item = _step24.value;

				var str = item.toString(16).toUpperCase();

				if (str.length === 1) result += "0";

				result += str;

				if (insertSpace) result += " ";
			}
		} catch (err) {
			_didIteratorError24 = true;
			_iteratorError24 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion24 && _iterator24.return) {
					_iterator24.return();
				}
			} finally {
				if (_didIteratorError24) {
					throw _iteratorError24;
				}
			}
		}

		return result.trim();
	}

	function checkBufferParams$1(baseBlock, inputBuffer, inputOffset, inputLength) {
		if (inputBuffer instanceof ArrayBuffer === false) {
			baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";
			return false;
		}

		if (inputBuffer.byteLength === 0) {
			baseBlock.error = "Wrong parameter: inputBuffer has zero length";
			return false;
		}

		if (inputOffset < 0) {
			baseBlock.error = "Wrong parameter: inputOffset less than zero";
			return false;
		}

		if (inputLength < 0) {
			baseBlock.error = "Wrong parameter: inputLength less than zero";
			return false;
		}

		if (inputBuffer.byteLength - inputOffset - inputLength < 0) {
			baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
			return false;
		}

		return true;
	}

	function utilFromBase$1(inputBuffer, inputBase) {
		var result = 0;

		if (inputBuffer.length === 1) return inputBuffer[0];

		for (var i = inputBuffer.length - 1; i >= 0; i--) {
			result += inputBuffer[inputBuffer.length - 1 - i] * Math.pow(2, inputBase * i);
		}return result;
	}

	function utilToBase$1(value, base) {
		var reserved = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

		var internalReserved = reserved;
		var internalValue = value;

		var result = 0;
		var biggest = Math.pow(2, base);

		for (var i = 1; i < 8; i++) {
			if (value < biggest) {
				var retBuf = void 0;

				if (internalReserved < 0) {
					retBuf = new ArrayBuffer(i);
					result = i;
				} else {
					if (internalReserved < i) return new ArrayBuffer(0);

					retBuf = new ArrayBuffer(internalReserved);

					result = internalReserved;
				}

				var retView = new Uint8Array(retBuf);

				for (var j = i - 1; j >= 0; j--) {
					var basis = Math.pow(2, j * base);

					retView[result - j - 1] = Math.floor(internalValue / basis);
					internalValue -= retView[result - j - 1] * basis;
				}

				return retBuf;
			}

			biggest *= Math.pow(2, base);
		}

		return new ArrayBuffer(0);
	}

	function utilConcatBuf$1() {
		var outputLength = 0;
		var prevLength = 0;

		for (var _len7 = arguments.length, buffers = Array(_len7), _key12 = 0; _key12 < _len7; _key12++) {
			buffers[_key12] = arguments[_key12];
		}

		var _iteratorNormalCompletion25 = true;
		var _didIteratorError25 = false;
		var _iteratorError25 = undefined;

		try {
			for (var _iterator25 = buffers[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
				var buffer = _step25.value;

				outputLength += buffer.byteLength;
			}
		} catch (err) {
			_didIteratorError25 = true;
			_iteratorError25 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion25 && _iterator25.return) {
					_iterator25.return();
				}
			} finally {
				if (_didIteratorError25) {
					throw _iteratorError25;
				}
			}
		}

		var retBuf = new ArrayBuffer(outputLength);
		var retView = new Uint8Array(retBuf);

		var _iteratorNormalCompletion26 = true;
		var _didIteratorError26 = false;
		var _iteratorError26 = undefined;

		try {
			for (var _iterator26 = buffers[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
				var _buffer3 = _step26.value;

				retView.set(new Uint8Array(_buffer3), prevLength);
				prevLength += _buffer3.byteLength;
			}
		} catch (err) {
			_didIteratorError26 = true;
			_iteratorError26 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion26 && _iterator26.return) {
					_iterator26.return();
				}
			} finally {
				if (_didIteratorError26) {
					throw _iteratorError26;
				}
			}
		}

		return retBuf;
	}

	function utilConcatView$1() {
		var outputLength = 0;
		var prevLength = 0;

		for (var _len8 = arguments.length, views = Array(_len8), _key13 = 0; _key13 < _len8; _key13++) {
			views[_key13] = arguments[_key13];
		}

		var _iteratorNormalCompletion27 = true;
		var _didIteratorError27 = false;
		var _iteratorError27 = undefined;

		try {
			for (var _iterator27 = views[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
				var view = _step27.value;

				outputLength += view.length;
			}
		} catch (err) {
			_didIteratorError27 = true;
			_iteratorError27 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion27 && _iterator27.return) {
					_iterator27.return();
				}
			} finally {
				if (_didIteratorError27) {
					throw _iteratorError27;
				}
			}
		}

		var retBuf = new ArrayBuffer(outputLength);
		var retView = new Uint8Array(retBuf);

		var _iteratorNormalCompletion28 = true;
		var _didIteratorError28 = false;
		var _iteratorError28 = undefined;

		try {
			for (var _iterator28 = views[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
				var _view8 = _step28.value;

				retView.set(_view8, prevLength);
				prevLength += _view8.length;
			}
		} catch (err) {
			_didIteratorError28 = true;
			_iteratorError28 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion28 && _iterator28.return) {
					_iterator28.return();
				}
			} finally {
				if (_didIteratorError28) {
					throw _iteratorError28;
				}
			}
		}

		return retView;
	}

	function utilDecodeTC$1() {
		var buf = new Uint8Array(this.valueHex);

		if (this.valueHex.byteLength >= 2) {
			var condition1 = buf[0] === 0xFF && buf[1] & 0x80;

			var condition2 = buf[0] === 0x00 && (buf[1] & 0x80) === 0x00;

			if (condition1 || condition2) this.warnings.push("Needlessly long format");
		}

		var bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var bigIntView = new Uint8Array(bigIntBuffer);

		for (var i = 0; i < this.valueHex.byteLength; i++) {
			bigIntView[i] = 0;
		}
		bigIntView[0] = buf[0] & 0x80;

		var bigInt = utilFromBase$1(bigIntView, 8);

		var smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var smallIntView = new Uint8Array(smallIntBuffer);

		for (var j = 0; j < this.valueHex.byteLength; j++) {
			smallIntView[j] = buf[j];
		}
		smallIntView[0] &= 0x7F;

		var smallInt = utilFromBase$1(smallIntView, 8);


		return smallInt - bigInt;
	}

	function utilEncodeTC$1(value) {
		var modValue = value < 0 ? value * -1 : value;
		var bigInt = 128;

		for (var i = 1; i < 8; i++) {
			if (modValue <= bigInt) {
				if (value < 0) {
					var smallInt = bigInt - modValue;

					var _retBuf2 = utilToBase$1(smallInt, 8, i);
					var _retView2 = new Uint8Array(_retBuf2);

					_retView2[0] |= 0x80;

					return _retBuf2;
				}

				var retBuf = utilToBase$1(modValue, 8, i);
				var retView = new Uint8Array(retBuf);

				if (retView[0] & 0x80) {
					var tempBuf = retBuf.slice(0);
					var tempView = new Uint8Array(tempBuf);

					retBuf = new ArrayBuffer(retBuf.byteLength + 1);

					retView = new Uint8Array(retBuf);

					for (var k = 0; k < tempBuf.byteLength; k++) {
						retView[k + 1] = tempView[k];
					}
					retView[0] = 0x00;
				}

				return retBuf;
			}

			bigInt *= Math.pow(2, 8);
		}

		return new ArrayBuffer(0);
	}

	function isEqualBuffer$1(inputBuffer1, inputBuffer2) {
		if (inputBuffer1.byteLength !== inputBuffer2.byteLength) return false;

		var view1 = new Uint8Array(inputBuffer1);

		var view2 = new Uint8Array(inputBuffer2);

		for (var i = 0; i < view1.length; i++) {
			if (view1[i] !== view2[i]) return false;
		}

		return true;
	}

	function padNumber$1(inputNumber, fullLength) {
		var str = inputNumber.toString(10);

		if (fullLength < str.length) return "";

		var dif = fullLength - str.length;

		var padding = new Array(dif);

		for (var i = 0; i < dif; i++) {
			padding[i] = "0";
		}var paddingString = padding.join("");

		return paddingString.concat(str);
	}

	var powers2$1 = [new Uint8Array([1])];
	var digitsString$1 = "0123456789";

	var LocalBaseBlock$1 = function () {
		function LocalBaseBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBaseBlock$1);

			this.blockLength = getParametersValue$1(parameters, "blockLength", 0);

			this.error = getParametersValue$1(parameters, "error", "");

			this.warnings = getParametersValue$1(parameters, "warnings", []);

			if ("valueBeforeDecode" in parameters) this.valueBeforeDecode = parameters.valueBeforeDecode.slice(0);else this.valueBeforeDecode = new ArrayBuffer(0);
		}

		_createClass(LocalBaseBlock$1, [{
			key: 'toJSON',
			value: function toJSON() {
				return {
					blockName: this.constructor.blockName(),
					blockLength: this.blockLength,
					error: this.error,
					warnings: this.warnings,
					valueBeforeDecode: bufferToHexCodes$1(this.valueBeforeDecode, 0, this.valueBeforeDecode.byteLength)
				};
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "baseBlock";
			}
		}]);

		return LocalBaseBlock$1;
	}();

	var LocalHexBlock$1 = function LocalHexBlock$1(BaseClass) {
		return function (_BaseClass2) {
			_inherits(LocalHexBlockMixin, _BaseClass2);

			function LocalHexBlockMixin() {
				var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				_classCallCheck(this, LocalHexBlockMixin);

				var _this62 = _possibleConstructorReturn(this, (LocalHexBlockMixin.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin)).call(this, parameters));

				_this62.isHexOnly = getParametersValue$1(parameters, "isHexOnly", false);

				if ("valueHex" in parameters) _this62.valueHex = parameters.valueHex.slice(0);else _this62.valueHex = new ArrayBuffer(0);
				return _this62;
			}

			_createClass(LocalHexBlockMixin, [{
				key: 'fromBER',
				value: function fromBER(inputBuffer, inputOffset, inputLength) {
					if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;

					var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

					if (intBuffer.length === 0) {
						this.warnings.push("Zero buffer length");
						return inputOffset;
					}

					this.valueHex = inputBuffer.slice(inputOffset, inputOffset + inputLength);


					this.blockLength = inputLength;

					return inputOffset + inputLength;
				}
			}, {
				key: 'toBER',
				value: function toBER() {
					var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

					if (this.isHexOnly !== true) {
						this.error = "Flag \"isHexOnly\" is not set, abort";
						return new ArrayBuffer(0);
					}

					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					return this.valueHex.slice(0);
				}
			}, {
				key: 'toJSON',
				value: function toJSON() {
					var object = {};

					try {
						object = _get(LocalHexBlockMixin.prototype.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin.prototype), 'toJSON', this).call(this);
					} catch (ex) {}


					object.blockName = this.constructor.blockName();
					object.isHexOnly = this.isHexOnly;
					object.valueHex = bufferToHexCodes$1(this.valueHex, 0, this.valueHex.byteLength);

					return object;
				}
			}], [{
				key: 'blockName',
				value: function blockName() {
					return "hexBlock";
				}
			}]);

			return LocalHexBlockMixin;
		}(BaseClass);
	};

	var LocalIdentificationBlock$1 = function (_LocalHexBlock$) {
		_inherits(LocalIdentificationBlock$1, _LocalHexBlock$);

		function LocalIdentificationBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalIdentificationBlock$1);

			var _this63 = _possibleConstructorReturn(this, (LocalIdentificationBlock$1.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock$1)).call(this));

			if ("idBlock" in parameters) {
				_this63.isHexOnly = getParametersValue$1(parameters.idBlock, "isHexOnly", false);
				_this63.valueHex = getParametersValue$1(parameters.idBlock, "valueHex", new ArrayBuffer(0));


				_this63.tagClass = getParametersValue$1(parameters.idBlock, "tagClass", -1);
				_this63.tagNumber = getParametersValue$1(parameters.idBlock, "tagNumber", -1);
				_this63.isConstructed = getParametersValue$1(parameters.idBlock, "isConstructed", false);
			} else {
				_this63.tagClass = -1;
				_this63.tagNumber = -1;
				_this63.isConstructed = false;
			}
			return _this63;
		}

		_createClass(LocalIdentificationBlock$1, [{
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var firstOctet = 0;
				var retBuf = void 0;
				var retView = void 0;


				switch (this.tagClass) {
					case 1:
						firstOctet |= 0x00;
						break;
					case 2:
						firstOctet |= 0x40;
						break;
					case 3:
						firstOctet |= 0x80;
						break;
					case 4:
						firstOctet |= 0xC0;
						break;
					default:
						this.error = "Unknown tag class";
						return new ArrayBuffer(0);
				}

				if (this.isConstructed) firstOctet |= 0x20;

				if (this.tagNumber < 31 && !this.isHexOnly) {
					retBuf = new ArrayBuffer(1);
					retView = new Uint8Array(retBuf);

					if (!sizeOnly) {
						var number = this.tagNumber;
						number &= 0x1F;
						firstOctet |= number;

						retView[0] = firstOctet;
					}

					return retBuf;
				}

				if (this.isHexOnly === false) {
					var encodedBuf = utilToBase$1(this.tagNumber, 7);
					var encodedView = new Uint8Array(encodedBuf);
					var size = encodedBuf.byteLength;

					retBuf = new ArrayBuffer(size + 1);
					retView = new Uint8Array(retBuf);
					retView[0] = firstOctet | 0x1F;

					if (!sizeOnly) {
						for (var i = 0; i < size - 1; i++) {
							retView[i + 1] = encodedView[i] | 0x80;
						}retView[size] = encodedView[size - 1];
					}

					return retBuf;
				}

				retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				retView = new Uint8Array(retBuf);

				retView[0] = firstOctet | 0x1F;

				if (sizeOnly === false) {
					var curView = new Uint8Array(this.valueHex);

					for (var _i19 = 0; _i19 < curView.length - 1; _i19++) {
						retView[_i19 + 1] = curView[_i19] | 0x80;
					}retView[this.valueHex.byteLength] = curView[curView.length - 1];
				}

				return retBuf;
			}
		}, {
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}

				var tagClassMask = intBuffer[0] & 0xC0;

				switch (tagClassMask) {
					case 0x00:
						this.tagClass = 1;
						break;
					case 0x40:
						this.tagClass = 2;
						break;
					case 0x80:
						this.tagClass = 3;
						break;
					case 0xC0:
						this.tagClass = 4;
						break;
					default:
						this.error = "Unknown tag class";
						return -1;
				}

				this.isConstructed = (intBuffer[0] & 0x20) === 0x20;

				this.isHexOnly = false;

				var tagNumberMask = intBuffer[0] & 0x1F;

				if (tagNumberMask !== 0x1F) {
					this.tagNumber = tagNumberMask;
					this.blockLength = 1;
				} else {
						var count = 1;

						this.valueHex = new ArrayBuffer(255);
						var tagNumberBufferMaxLength = 255;
						var intTagNumberBuffer = new Uint8Array(this.valueHex);

						while (intBuffer[count] & 0x80) {
							intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
							count++;

							if (count >= intBuffer.length) {
								this.error = "End of input reached before message was fully decoded";
								return -1;
							}

							if (count === tagNumberBufferMaxLength) {
								tagNumberBufferMaxLength += 255;

								var _tempBuffer2 = new ArrayBuffer(tagNumberBufferMaxLength);
								var _tempBufferView2 = new Uint8Array(_tempBuffer2);

								for (var i = 0; i < intTagNumberBuffer.length; i++) {
									_tempBufferView2[i] = intTagNumberBuffer[i];
								}this.valueHex = new ArrayBuffer(tagNumberBufferMaxLength);
								intTagNumberBuffer = new Uint8Array(this.valueHex);
							}
						}

						this.blockLength = count + 1;
						intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
						var tempBuffer = new ArrayBuffer(count);
						var tempBufferView = new Uint8Array(tempBuffer);

						for (var _i20 = 0; _i20 < count; _i20++) {
							tempBufferView[_i20] = intTagNumberBuffer[_i20];
						}this.valueHex = new ArrayBuffer(count);
						intTagNumberBuffer = new Uint8Array(this.valueHex);
						intTagNumberBuffer.set(tempBufferView);

						if (this.blockLength <= 9) this.tagNumber = utilFromBase$1(intTagNumberBuffer, 7);else {
							this.isHexOnly = true;
							this.warnings.push("Tag too long, represented as hex-coded");
						}
					}

				if (this.tagClass === 1 && this.isConstructed) {
					switch (this.tagNumber) {
						case 1:
						case 2:
						case 5:
						case 6:
						case 9:
						case 14:
						case 23:
						case 24:
						case 31:
						case 32:
						case 33:
						case 34:
							this.error = "Constructed encoding used for primitive type";
							return -1;
						default:
					}
				}


				return inputOffset + this.blockLength;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalIdentificationBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.blockName = this.constructor.blockName();
				object.tagClass = this.tagClass;
				object.tagNumber = this.tagNumber;
				object.isConstructed = this.isConstructed;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "identificationBlock";
			}
		}]);

		return LocalIdentificationBlock$1;
	}(LocalHexBlock$1(LocalBaseBlock$1));

	var LocalLengthBlock$1 = function (_LocalBaseBlock$) {
		_inherits(LocalLengthBlock$1, _LocalBaseBlock$);

		function LocalLengthBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalLengthBlock$1);

			var _this64 = _possibleConstructorReturn(this, (LocalLengthBlock$1.__proto__ || Object.getPrototypeOf(LocalLengthBlock$1)).call(this));

			if ("lenBlock" in parameters) {
				_this64.isIndefiniteForm = getParametersValue$1(parameters.lenBlock, "isIndefiniteForm", false);
				_this64.longFormUsed = getParametersValue$1(parameters.lenBlock, "longFormUsed", false);
				_this64.length = getParametersValue$1(parameters.lenBlock, "length", 0);
			} else {
				_this64.isIndefiniteForm = false;
				_this64.longFormUsed = false;
				_this64.length = 0;
			}
			return _this64;
		}

		_createClass(LocalLengthBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}

				if (intBuffer[0] === 0xFF) {
					this.error = "Length block 0xFF is reserved by standard";
					return -1;
				}

				this.isIndefiniteForm = intBuffer[0] === 0x80;

				if (this.isIndefiniteForm === true) {
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}

				this.longFormUsed = !!(intBuffer[0] & 0x80);

				if (this.longFormUsed === false) {
					this.length = intBuffer[0];
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}

				var count = intBuffer[0] & 0x7F;

				if (count > 8) {
						this.error = "Too big integer";
						return -1;
					}

				if (count + 1 > intBuffer.length) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				var lengthBufferView = new Uint8Array(count);

				for (var i = 0; i < count; i++) {
					lengthBufferView[i] = intBuffer[i + 1];
				}if (lengthBufferView[count - 1] === 0x00) this.warnings.push("Needlessly long encoded length");

				this.length = utilFromBase$1(lengthBufferView, 8);

				if (this.longFormUsed && this.length <= 127) this.warnings.push("Unneccesary usage of long length form");

				this.blockLength = count + 1;


				return inputOffset + this.blockLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = void 0;
				var retView = void 0;


				if (this.length > 127) this.longFormUsed = true;

				if (this.isIndefiniteForm) {
					retBuf = new ArrayBuffer(1);

					if (sizeOnly === false) {
						retView = new Uint8Array(retBuf);
						retView[0] = 0x80;
					}

					return retBuf;
				}

				if (this.longFormUsed === true) {
					var encodedBuf = utilToBase$1(this.length, 8);

					if (encodedBuf.byteLength > 127) {
						this.error = "Too big length";
						return new ArrayBuffer(0);
					}

					retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);

					if (sizeOnly === true) return retBuf;

					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					retView[0] = encodedBuf.byteLength | 0x80;

					for (var i = 0; i < encodedBuf.byteLength; i++) {
						retView[i + 1] = encodedView[i];
					}return retBuf;
				}

				retBuf = new ArrayBuffer(1);

				if (sizeOnly === false) {
					retView = new Uint8Array(retBuf);

					retView[0] = this.length;
				}

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalLengthBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalLengthBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.blockName = this.constructor.blockName();
				object.isIndefiniteForm = this.isIndefiniteForm;
				object.longFormUsed = this.longFormUsed;
				object.length = this.length;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "lengthBlock";
			}
		}]);

		return LocalLengthBlock$1;
	}(LocalBaseBlock$1);

	var LocalValueBlock$1 = function (_LocalBaseBlock$2) {
		_inherits(LocalValueBlock$1, _LocalBaseBlock$2);

		function LocalValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalValueBlock$1);

			return _possibleConstructorReturn(this, (LocalValueBlock$1.__proto__ || Object.getPrototypeOf(LocalValueBlock$1)).call(this, parameters));
		}

		_createClass(LocalValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "valueBlock";
			}
		}]);

		return LocalValueBlock$1;
	}(LocalBaseBlock$1);

	var BaseBlock$1 = function (_LocalBaseBlock$3) {
		_inherits(BaseBlock$1, _LocalBaseBlock$3);

		function BaseBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var valueBlockType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : LocalValueBlock$1;

			_classCallCheck(this, BaseBlock$1);

			var _this66 = _possibleConstructorReturn(this, (BaseBlock$1.__proto__ || Object.getPrototypeOf(BaseBlock$1)).call(this, parameters));

			if ("name" in parameters) _this66.name = parameters.name;
			if ("optional" in parameters) _this66.optional = parameters.optional;
			if ("primitiveSchema" in parameters) _this66.primitiveSchema = parameters.primitiveSchema;

			_this66.idBlock = new LocalIdentificationBlock$1(parameters);
			_this66.lenBlock = new LocalLengthBlock$1(parameters);
			_this66.valueBlock = new valueBlockType(parameters);
			return _this66;
		}

		_createClass(BaseBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = void 0;

				var idBlockBuf = this.idBlock.toBER(sizeOnly);
				var valueBlockSizeBuf = this.valueBlock.toBER(true);

				this.lenBlock.length = valueBlockSizeBuf.byteLength;
				var lenBlockBuf = this.lenBlock.toBER(sizeOnly);

				retBuf = utilConcatBuf$1(idBlockBuf, lenBlockBuf);

				var valueBlockBuf = void 0;

				if (sizeOnly === false) valueBlockBuf = this.valueBlock.toBER(sizeOnly);else valueBlockBuf = new ArrayBuffer(this.lenBlock.length);

				retBuf = utilConcatBuf$1(retBuf, valueBlockBuf);

				if (this.lenBlock.isIndefiniteForm === true) {
					var indefBuf = new ArrayBuffer(2);

					if (sizeOnly === false) {
						var indefView = new Uint8Array(indefBuf);

						indefView[0] = 0x00;
						indefView[1] = 0x00;
					}

					retBuf = utilConcatBuf$1(retBuf, indefBuf);
				}

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(BaseBlock$1.prototype.__proto__ || Object.getPrototypeOf(BaseBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.idBlock = this.idBlock.toJSON();
				object.lenBlock = this.lenBlock.toJSON();
				object.valueBlock = this.valueBlock.toJSON();

				if ("name" in this) object.name = this.name;
				if ("optional" in this) object.optional = this.optional;
				if ("primitiveSchema" in this) object.primitiveSchema = this.primitiveSchema.toJSON();

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BaseBlock";
			}
		}]);

		return BaseBlock$1;
	}(LocalBaseBlock$1);

	var LocalPrimitiveValueBlock$1 = function (_LocalValueBlock$) {
		_inherits(LocalPrimitiveValueBlock$1, _LocalValueBlock$);

		function LocalPrimitiveValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalPrimitiveValueBlock$1);

			var _this67 = _possibleConstructorReturn(this, (LocalPrimitiveValueBlock$1.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock$1)).call(this, parameters));

			if ("valueHex" in parameters) _this67.valueHex = parameters.valueHex.slice(0);else _this67.valueHex = new ArrayBuffer(0);

			_this67.isHexOnly = getParametersValue$1(parameters, "isHexOnly", true);
			return _this67;
		}

		_createClass(LocalPrimitiveValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}

				this.valueHex = new ArrayBuffer(intBuffer.length);
				var valueHexView = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					valueHexView[i] = intBuffer[i];
				}

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.valueHex.slice(0);
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalPrimitiveValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.valueHex = bufferToHexCodes$1(this.valueHex, 0, this.valueHex.byteLength);
				object.isHexOnly = this.isHexOnly;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "PrimitiveValueBlock";
			}
		}]);

		return LocalPrimitiveValueBlock$1;
	}(LocalValueBlock$1);

	var Primitive$1 = function (_BaseBlock$) {
		_inherits(Primitive$1, _BaseBlock$);

		function Primitive$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Primitive$1);

			var _this68 = _possibleConstructorReturn(this, (Primitive$1.__proto__ || Object.getPrototypeOf(Primitive$1)).call(this, parameters, LocalPrimitiveValueBlock$1));

			_this68.idBlock.isConstructed = false;
			return _this68;
		}

		_createClass(Primitive$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "PRIMITIVE";
			}
		}]);

		return Primitive$1;
	}(BaseBlock$1);

	var LocalConstructedValueBlock$1 = function (_LocalValueBlock$2) {
		_inherits(LocalConstructedValueBlock$1, _LocalValueBlock$2);

		function LocalConstructedValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalConstructedValueBlock$1);

			var _this69 = _possibleConstructorReturn(this, (LocalConstructedValueBlock$1.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock$1)).call(this, parameters));

			_this69.value = getParametersValue$1(parameters, "value", []);
			_this69.isIndefiniteForm = getParametersValue$1(parameters, "isIndefiniteForm", false);
			return _this69;
		}

		_createClass(LocalConstructedValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var initialOffset = inputOffset;
				var initialLength = inputLength;

				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}

				function checkLen(indefiniteLength, length) {
					if (indefiniteLength === true) return 1;

					return length;
				}


				var currentOffset = inputOffset;

				while (checkLen(this.isIndefiniteForm, inputLength) > 0) {
					var returnObject = LocalFromBER$1(inputBuffer, currentOffset, inputLength);
					if (returnObject.offset === -1) {
						this.error = returnObject.result.error;
						this.warnings.concat(returnObject.result.warnings);
						return -1;
					}

					currentOffset = returnObject.offset;

					this.blockLength += returnObject.result.blockLength;
					inputLength -= returnObject.result.blockLength;

					this.value.push(returnObject.result);

					if (this.isIndefiniteForm === true && returnObject.result.constructor.blockName() === EndOfContent$1.blockName()) break;
				}

				if (this.isIndefiniteForm === true) {
					if (this.value[this.value.length - 1].constructor.blockName() === EndOfContent$1.blockName()) this.value.pop();else this.warnings.push("No EndOfContent block encoded");
				}

				this.valueBeforeDecode = inputBuffer.slice(initialOffset, initialOffset + initialLength);


				return currentOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					retBuf = utilConcatBuf$1(retBuf, valueBuf);
				}

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalConstructedValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.isIndefiniteForm = this.isIndefiniteForm;
				object.value = [];
				for (var i = 0; i < this.value.length; i++) {
					object.value.push(this.value[i].toJSON());
				}return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "ConstructedValueBlock";
			}
		}]);

		return LocalConstructedValueBlock$1;
	}(LocalValueBlock$1);

	var Constructed$1 = function (_BaseBlock$2) {
		_inherits(Constructed$1, _BaseBlock$2);

		function Constructed$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Constructed$1);

			var _this70 = _possibleConstructorReturn(this, (Constructed$1.__proto__ || Object.getPrototypeOf(Constructed$1)).call(this, parameters, LocalConstructedValueBlock$1));

			_this70.idBlock.isConstructed = true;
			return _this70;
		}

		_createClass(Constructed$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "CONSTRUCTED";
			}
		}]);

		return Constructed$1;
	}(BaseBlock$1);

	var LocalEndOfContentValueBlock$1 = function (_LocalValueBlock$3) {
		_inherits(LocalEndOfContentValueBlock$1, _LocalValueBlock$3);

		function LocalEndOfContentValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalEndOfContentValueBlock$1);

			return _possibleConstructorReturn(this, (LocalEndOfContentValueBlock$1.__proto__ || Object.getPrototypeOf(LocalEndOfContentValueBlock$1)).call(this, parameters));
		}

		_createClass(LocalEndOfContentValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				return inputOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return new ArrayBuffer(0);
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "EndOfContentValueBlock";
			}
		}]);

		return LocalEndOfContentValueBlock$1;
	}(LocalValueBlock$1);

	var EndOfContent$1 = function (_BaseBlock$3) {
		_inherits(EndOfContent$1, _BaseBlock$3);

		function EndOfContent$1() {
			var paramaters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, EndOfContent$1);

			var _this72 = _possibleConstructorReturn(this, (EndOfContent$1.__proto__ || Object.getPrototypeOf(EndOfContent$1)).call(this, paramaters, LocalEndOfContentValueBlock$1));

			_this72.idBlock.tagClass = 1;
			_this72.idBlock.tagNumber = 0;return _this72;
		}

		_createClass(EndOfContent$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "EndOfContent";
			}
		}]);

		return EndOfContent$1;
	}(BaseBlock$1);

	var LocalBooleanValueBlock$1 = function (_LocalValueBlock$4) {
		_inherits(LocalBooleanValueBlock$1, _LocalValueBlock$4);

		function LocalBooleanValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBooleanValueBlock$1);

			var _this73 = _possibleConstructorReturn(this, (LocalBooleanValueBlock$1.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock$1)).call(this, parameters));

			_this73.value = getParametersValue$1(parameters, "value", false);
			_this73.isHexOnly = getParametersValue$1(parameters, "isHexOnly", false);

			if ("valueHex" in parameters) _this73.valueHex = parameters.valueHex.slice(0);else {
				_this73.valueHex = new ArrayBuffer(1);
				if (_this73.value === true) {
					var view = new Uint8Array(_this73.valueHex);
					view[0] = 0xFF;
				}
			}
			return _this73;
		}

		_createClass(LocalBooleanValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);


				if (inputLength > 1) this.warnings.push("Boolean value encoded in more then 1 octet");

				this.isHexOnly = true;

				this.valueHex = new ArrayBuffer(intBuffer.length);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					view[i] = intBuffer[i];
				}

				if (utilDecodeTC$1.call(this) !== 0) this.value = true;else this.value = false;

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.valueHex;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalBooleanValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes$1(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BooleanValueBlock";
			}
		}]);

		return LocalBooleanValueBlock$1;
	}(LocalValueBlock$1);

	var Boolean$1 = function (_BaseBlock$4) {
		_inherits(Boolean$1, _BaseBlock$4);

		function Boolean$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Boolean$1);

			var _this74 = _possibleConstructorReturn(this, (Boolean$1.__proto__ || Object.getPrototypeOf(Boolean$1)).call(this, parameters, LocalBooleanValueBlock$1));

			_this74.idBlock.tagClass = 1;
			_this74.idBlock.tagNumber = 1;return _this74;
		}

		_createClass(Boolean$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Boolean";
			}
		}]);

		return Boolean$1;
	}(BaseBlock$1);

	var Sequence$1 = function (_Constructed$) {
		_inherits(Sequence$1, _Constructed$);

		function Sequence$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Sequence$1);

			var _this75 = _possibleConstructorReturn(this, (Sequence$1.__proto__ || Object.getPrototypeOf(Sequence$1)).call(this, parameters));

			_this75.idBlock.tagClass = 1;
			_this75.idBlock.tagNumber = 16;return _this75;
		}

		_createClass(Sequence$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Sequence";
			}
		}]);

		return Sequence$1;
	}(Constructed$1);

	var Set$1 = function (_Constructed$2) {
		_inherits(Set$1, _Constructed$2);

		function Set$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Set$1);

			var _this76 = _possibleConstructorReturn(this, (Set$1.__proto__ || Object.getPrototypeOf(Set$1)).call(this, parameters));

			_this76.idBlock.tagClass = 1;
			_this76.idBlock.tagNumber = 17;return _this76;
		}

		_createClass(Set$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Set";
			}
		}]);

		return Set$1;
	}(Constructed$1);

	var Null$1 = function (_BaseBlock$5) {
		_inherits(Null$1, _BaseBlock$5);

		function Null$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Null$1);

			var _this77 = _possibleConstructorReturn(this, (Null$1.__proto__ || Object.getPrototypeOf(Null$1)).call(this, parameters, LocalBaseBlock$1));

			_this77.idBlock.tagClass = 1;
			_this77.idBlock.tagNumber = 5;return _this77;
		}

		_createClass(Null$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (this.lenBlock.length > 0) this.warnings.push("Non-zero length of value block for Null type");

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				this.blockLength += inputLength;

				if (inputOffset + inputLength > inputBuffer.byteLength) {
					this.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
					return -1;
				}

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = new ArrayBuffer(2);

				if (sizeOnly === true) return retBuf;

				var retView = new Uint8Array(retBuf);
				retView[0] = 0x05;
				retView[1] = 0x00;

				return retBuf;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Null";
			}
		}]);

		return Null$1;
	}(BaseBlock$1);

	var LocalOctetStringValueBlock$1 = function (_LocalHexBlock$2) {
		_inherits(LocalOctetStringValueBlock$1, _LocalHexBlock$2);

		function LocalOctetStringValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalOctetStringValueBlock$1);

			var _this78 = _possibleConstructorReturn(this, (LocalOctetStringValueBlock$1.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock$1)).call(this, parameters));

			_this78.isConstructed = getParametersValue$1(parameters, "isConstructed", false);
			return _this78;
		}

		_createClass(LocalOctetStringValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = 0;

				if (this.isConstructed === true) {
					this.isHexOnly = false;

					resultOffset = LocalConstructedValueBlock$1.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent$1.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== OctetString$1.blockName()) {
							this.error = "OCTET STRING may consists of OCTET STRINGs only";
							return -1;
						}
					}
				} else {
					this.isHexOnly = true;

					resultOffset = _get(LocalOctetStringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock$1.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
					this.blockLength = inputLength;
				}

				return resultOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				if (this.isConstructed === true) return LocalConstructedValueBlock$1.prototype.toBER.call(this, sizeOnly);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength);

				if (sizeOnly === true) return retBuf;

				if (this.valueHex.byteLength === 0) return retBuf;

				retBuf = this.valueHex.slice(0);

				return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalOctetStringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes$1(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "OctetStringValueBlock";
			}
		}]);

		return LocalOctetStringValueBlock$1;
	}(LocalHexBlock$1(LocalConstructedValueBlock$1));

	var OctetString$1 = function (_BaseBlock$6) {
		_inherits(OctetString$1, _BaseBlock$6);

		function OctetString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, OctetString$1);

			var _this79 = _possibleConstructorReturn(this, (OctetString$1.__proto__ || Object.getPrototypeOf(OctetString$1)).call(this, parameters, LocalOctetStringValueBlock$1));

			_this79.idBlock.tagClass = 1;
			_this79.idBlock.tagNumber = 4;return _this79;
		}

		_createClass(OctetString$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				if (inputLength === 0) {
					if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

					if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

					return inputOffset;
				}


				return _get(OctetString$1.prototype.__proto__ || Object.getPrototypeOf(OctetString$1.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
			}
		}, {
			key: 'isEqual',
			value: function isEqual(octetString) {
				if (octetString instanceof OctetString$1 === false) return false;

				if (JSON.stringify(this) !== JSON.stringify(octetString)) return false;


				return true;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "OctetString";
			}
		}]);

		return OctetString$1;
	}(BaseBlock$1);

	var LocalBitStringValueBlock$1 = function (_LocalHexBlock$3) {
		_inherits(LocalBitStringValueBlock$1, _LocalHexBlock$3);

		function LocalBitStringValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBitStringValueBlock$1);

			var _this80 = _possibleConstructorReturn(this, (LocalBitStringValueBlock$1.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock$1)).call(this, parameters));

			_this80.unusedBits = getParametersValue$1(parameters, "unusedBits", 0);
			_this80.isConstructed = getParametersValue$1(parameters, "isConstructed", false);
			_this80.blockLength = _this80.valueHex.byteLength;
			return _this80;
		}

		_createClass(LocalBitStringValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;


				var resultOffset = -1;

				if (this.isConstructed === true) {
					resultOffset = LocalConstructedValueBlock$1.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent$1.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== BitString$1.blockName()) {
							this.error = "BIT STRING may consists of BIT STRINGs only";
							return -1;
						}

						if (this.unusedBits > 0 && this.value[i].valueBlock.unusedBits > 0) {
							this.error = "Usign of \"unused bits\" inside constructive BIT STRING allowed for least one only";
							return -1;
						}

						this.unusedBits = this.value[i].valueBlock.unusedBits;
						if (this.unusedBits > 7) {
							this.error = "Unused bits for BitString must be in range 0-7";
							return -1;
						}
					}

					return resultOffset;
				}

				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;


				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.unusedBits = intBuffer[0];

				if (this.unusedBits > 7) {
					this.error = "Unused bits for BitString must be in range 0-7";
					return -1;
				}

				this.valueHex = new ArrayBuffer(intBuffer.length - 1);
				var view = new Uint8Array(this.valueHex);
				for (var _i21 = 0; _i21 < inputLength - 1; _i21++) {
					view[_i21] = intBuffer[_i21 + 1];
				}

				this.blockLength = intBuffer.length;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				if (this.isConstructed === true) return LocalConstructedValueBlock$1.prototype.toBER.call(this, sizeOnly);

				if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength + 1);

				if (this.valueHex.byteLength === 0) return new ArrayBuffer(0);

				var curView = new Uint8Array(this.valueHex);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				var retView = new Uint8Array(retBuf);

				retView[0] = this.unusedBits;

				for (var i = 0; i < this.valueHex.byteLength; i++) {
					retView[i + 1] = curView[i];
				}return retBuf;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalBitStringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.unusedBits = this.unusedBits;
				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes$1(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BitStringValueBlock";
			}
		}]);

		return LocalBitStringValueBlock$1;
	}(LocalHexBlock$1(LocalConstructedValueBlock$1));

	var BitString$1 = function (_BaseBlock$7) {
		_inherits(BitString$1, _BaseBlock$7);

		function BitString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, BitString$1);

			var _this81 = _possibleConstructorReturn(this, (BitString$1.__proto__ || Object.getPrototypeOf(BitString$1)).call(this, parameters, LocalBitStringValueBlock$1));

			_this81.idBlock.tagClass = 1;
			_this81.idBlock.tagNumber = 3;return _this81;
		}

		_createClass(BitString$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;


				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				return _get(BitString$1.prototype.__proto__ || Object.getPrototypeOf(BitString$1.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
			}
		}, {
			key: 'isEqual',
			value: function isEqual(bitString) {
				if (bitString instanceof BitString$1 === false) return false;

				if (JSON.stringify(this) !== JSON.stringify(bitString)) return false;


				return true;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BitString";
			}
		}]);

		return BitString$1;
	}(BaseBlock$1);

	var LocalIntegerValueBlock$1 = function (_LocalHexBlock$4) {
		_inherits(LocalIntegerValueBlock$1, _LocalHexBlock$4);

		function LocalIntegerValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalIntegerValueBlock$1);

			var _this82 = _possibleConstructorReturn(this, (LocalIntegerValueBlock$1.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock$1)).call(this, parameters));

			if ("value" in parameters) _this82.valueDec = parameters.value;
			return _this82;
		}

		_createClass(LocalIntegerValueBlock$1, [{
			key: 'fromDER',
			value: function fromDER(inputBuffer, inputOffset, inputLength) {
				var expectedLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

				var offset = this.fromBER(inputBuffer, inputOffset, inputLength);
				if (offset === -1) return offset;

				var view = new Uint8Array(this._valueHex);

				if (view[0] === 0x00 && (view[1] & 0x80) !== 0) {
					var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
					var updatedView = new Uint8Array(updatedValueHex);

					updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

					this._valueHex = updatedValueHex.slice(0);
				} else {
					if (expectedLength !== 0) {
						if (this._valueHex.byteLength < expectedLength) {
							if (expectedLength - this._valueHex.byteLength > 1) expectedLength = this._valueHex.byteLength + 1;

							var _updatedValueHex3 = new ArrayBuffer(expectedLength);
							var _updatedView3 = new Uint8Array(_updatedValueHex3);

							_updatedView3.set(view, expectedLength - this._valueHex.byteLength);

							this._valueHex = _updatedValueHex3.slice(0);
						}
					}
				}

				return offset;
			}
		}, {
			key: 'toDER',
			value: function toDER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var view = new Uint8Array(this._valueHex);

				switch (true) {
					case (view[0] & 0x80) !== 0:
						{
							var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength + 1);
							var updatedView = new Uint8Array(updatedValueHex);

							updatedView[0] = 0x00;
							updatedView.set(view, 1);

							this._valueHex = updatedValueHex.slice(0);
						}
						break;
					case view[0] === 0x00 && (view[1] & 0x80) === 0:
						{
							var _updatedValueHex4 = new ArrayBuffer(this._valueHex.byteLength - 1);
							var _updatedView4 = new Uint8Array(_updatedValueHex4);

							_updatedView4.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

							this._valueHex = _updatedValueHex4.slice(0);
						}
						break;
					default:
				}

				return this.toBER(sizeOnly);
			}
		}, {
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = _get(LocalIntegerValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock$1.prototype), 'fromBER', this).call(this, inputBuffer, inputOffset, inputLength);
				if (resultOffset === -1) return resultOffset;

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				return this.valueHex.slice(0);
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalIntegerValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.valueDec = this.valueDec;

				return object;
			}
		}, {
			key: 'toString',
			value: function toString() {
				function viewAdd(first, second) {
					var c = new Uint8Array([0]);

					var firstView = new Uint8Array(first);
					var secondView = new Uint8Array(second);

					var firstViewCopy = firstView.slice(0);
					var firstViewCopyLength = firstViewCopy.length - 1;
					var secondViewCopy = secondView.slice(0);
					var secondViewCopyLength = secondViewCopy.length - 1;

					var value = 0;

					var max = secondViewCopyLength < firstViewCopyLength ? firstViewCopyLength : secondViewCopyLength;

					var counter = 0;


					for (var i = max; i >= 0; i--, counter++) {
						switch (true) {
							case counter < secondViewCopy.length:
								value = firstViewCopy[firstViewCopyLength - counter] + secondViewCopy[secondViewCopyLength - counter] + c[0];
								break;
							default:
								value = firstViewCopy[firstViewCopyLength - counter] + c[0];
						}

						c[0] = value / 10;

						switch (true) {
							case counter >= firstViewCopy.length:
								firstViewCopy = utilConcatView$1(new Uint8Array([value % 10]), firstViewCopy);
								break;
							default:
								firstViewCopy[firstViewCopyLength - counter] = value % 10;
						}
					}

					if (c[0] > 0) firstViewCopy = utilConcatView$1(c, firstViewCopy);

					return firstViewCopy.slice(0);
				}

				function power2(n) {
					if (n >= powers2$1.length) {
						for (var p = powers2$1.length; p <= n; p++) {
							var c = new Uint8Array([0]);
							var _digits2 = powers2$1[p - 1].slice(0);

							for (var i = _digits2.length - 1; i >= 0; i--) {
								var newValue = new Uint8Array([(_digits2[i] << 1) + c[0]]);
								c[0] = newValue[0] / 10;
								_digits2[i] = newValue[0] % 10;
							}

							if (c[0] > 0) _digits2 = utilConcatView$1(c, _digits2);

							powers2$1.push(_digits2);
						}
					}

					return powers2$1[n];
				}

				function viewSub(first, second) {
					var b = 0;

					var firstView = new Uint8Array(first);
					var secondView = new Uint8Array(second);

					var firstViewCopy = firstView.slice(0);
					var firstViewCopyLength = firstViewCopy.length - 1;
					var secondViewCopy = secondView.slice(0);
					var secondViewCopyLength = secondViewCopy.length - 1;

					var value = void 0;

					var counter = 0;


					for (var i = secondViewCopyLength; i >= 0; i--, counter++) {
						value = firstViewCopy[firstViewCopyLength - counter] - secondViewCopy[secondViewCopyLength - counter] - b;

						switch (true) {
							case value < 0:
								b = 1;
								firstViewCopy[firstViewCopyLength - counter] = value + 10;
								break;
							default:
								b = 0;
								firstViewCopy[firstViewCopyLength - counter] = value;
						}
					}

					if (b > 0) {
						for (var _i22 = firstViewCopyLength - secondViewCopyLength + 1; _i22 >= 0; _i22--, counter++) {
							value = firstViewCopy[firstViewCopyLength - counter] - b;

							if (value < 0) {
								b = 1;
								firstViewCopy[firstViewCopyLength - counter] = value + 10;
							} else {
								b = 0;
								firstViewCopy[firstViewCopyLength - counter] = value;
								break;
							}
						}
					}

					return firstViewCopy.slice();
				}

				var firstBit = this._valueHex.byteLength * 8 - 1;

				var digits = new Uint8Array(this._valueHex.byteLength * 8 / 3);
				var bitNumber = 0;
				var currentByte = void 0;

				var asn1View = new Uint8Array(this._valueHex);

				var result = "";

				var flag = false;

				for (var byteNumber = this._valueHex.byteLength - 1; byteNumber >= 0; byteNumber--) {
					currentByte = asn1View[byteNumber];

					for (var i = 0; i < 8; i++) {
						if ((currentByte & 1) === 1) {
							switch (bitNumber) {
								case firstBit:
									digits = viewSub(power2(bitNumber), digits);
									result = "-";
									break;
								default:
									digits = viewAdd(digits, power2(bitNumber));
							}
						}

						bitNumber++;
						currentByte >>= 1;
					}
				}

				for (var _i23 = 0; _i23 < digits.length; _i23++) {
					if (digits[_i23]) flag = true;

					if (flag) result += digitsString$1.charAt(digits[_i23]);
				}

				if (flag === false) result += digitsString$1.charAt(0);


				return result;
			}
		}, {
			key: 'valueHex',
			set: function set(_value) {
				this._valueHex = _value.slice(0);

				if (_value.byteLength >= 4) {
					this.warnings.push("Too big Integer for decoding, hex only");
					this.isHexOnly = true;
					this._valueDec = 0;
				} else {
					this.isHexOnly = false;

					if (_value.byteLength > 0) this._valueDec = utilDecodeTC$1.call(this);
				}
			},
			get: function get() {
				return this._valueHex;
			}
		}, {
			key: 'valueDec',
			set: function set(_value) {
				this._valueDec = _value;

				this.isHexOnly = false;
				this._valueHex = utilEncodeTC$1(_value);
			},
			get: function get() {
				return this._valueDec;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "IntegerValueBlock";
			}
		}]);

		return LocalIntegerValueBlock$1;
	}(LocalHexBlock$1(LocalValueBlock$1));

	var Integer$1 = function (_BaseBlock$8) {
		_inherits(Integer$1, _BaseBlock$8);

		function Integer$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Integer$1);

			var _this83 = _possibleConstructorReturn(this, (Integer$1.__proto__ || Object.getPrototypeOf(Integer$1)).call(this, parameters, LocalIntegerValueBlock$1));

			_this83.idBlock.tagClass = 1;
			_this83.idBlock.tagNumber = 2;return _this83;
		}

		_createClass(Integer$1, [{
			key: 'isEqual',
			value: function isEqual(otherValue) {
				if (otherValue instanceof Integer$1) {
					if (this.valueBlock.isHexOnly && otherValue.valueBlock.isHexOnly) return isEqualBuffer$1(this.valueBlock.valueHex, otherValue.valueBlock.valueHex);

					if (this.valueBlock.isHexOnly === otherValue.valueBlock.isHexOnly) return this.valueBlock.valueDec === otherValue.valueBlock.valueDec;

					return false;
				}

				if (otherValue instanceof ArrayBuffer) return isEqualBuffer$1(this.valueBlock.valueHex, otherValue);

				return false;
			}
		}, {
			key: 'convertToDER',
			value: function convertToDER() {
				var integer = new Integer$1({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.toDER();

				return integer;
			}
		}, {
			key: 'convertFromDER',
			value: function convertFromDER() {
				var expectedLength = this.valueBlock.valueHex.byteLength % 2 ? this.valueBlock.valueHex.byteLength + 1 : this.valueBlock.valueHex.byteLength;
				var integer = new Integer$1({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.fromDER(integer.valueBlock.valueHex, 0, integer.valueBlock.valueHex.byteLength, expectedLength);

				return integer;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Integer";
			}
		}]);

		return Integer$1;
	}(BaseBlock$1);

	var Enumerated$1 = function (_Integer$) {
		_inherits(Enumerated$1, _Integer$);

		function Enumerated$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Enumerated$1);

			var _this84 = _possibleConstructorReturn(this, (Enumerated$1.__proto__ || Object.getPrototypeOf(Enumerated$1)).call(this, parameters));

			_this84.idBlock.tagClass = 1;
			_this84.idBlock.tagNumber = 10;return _this84;
		}

		_createClass(Enumerated$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Enumerated";
			}
		}]);

		return Enumerated$1;
	}(Integer$1);

	var LocalSidValueBlock$1 = function (_LocalHexBlock$5) {
		_inherits(LocalSidValueBlock$1, _LocalHexBlock$5);

		function LocalSidValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalSidValueBlock$1);

			var _this85 = _possibleConstructorReturn(this, (LocalSidValueBlock$1.__proto__ || Object.getPrototypeOf(LocalSidValueBlock$1)).call(this, parameters));

			_this85.valueDec = getParametersValue$1(parameters, "valueDec", -1);
			_this85.isFirstSid = getParametersValue$1(parameters, "isFirstSid", false);
			return _this85;
		}

		_createClass(LocalSidValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;

				if (checkBufferParams$1(this, inputBuffer, inputOffset, inputLength) === false) return -1;


				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.valueHex = new ArrayBuffer(inputLength);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < inputLength; i++) {
					view[i] = intBuffer[i] & 0x7F;

					this.blockLength++;

					if ((intBuffer[i] & 0x80) === 0x00) break;
				}

				var tempValueHex = new ArrayBuffer(this.blockLength);
				var tempView = new Uint8Array(tempValueHex);

				for (var _i24 = 0; _i24 < this.blockLength; _i24++) {
					tempView[_i24] = view[_i24];
				}
				this.valueHex = tempValueHex.slice(0);
				view = new Uint8Array(this.valueHex);


				if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				if (view[0] === 0x00) this.warnings.push("Needlessly long format of SID encoding");

				if (this.blockLength <= 8) this.valueDec = utilFromBase$1(view, 7);else {
					this.isHexOnly = true;
					this.warnings.push("Too big SID for decoding, hex only");
				}

				return inputOffset + this.blockLength;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = void 0;
				var retView = void 0;


				if (this.isHexOnly) {
					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					var curView = new Uint8Array(this.valueHex);

					retBuf = new ArrayBuffer(this.blockLength);
					retView = new Uint8Array(retBuf);

					for (var i = 0; i < this.blockLength - 1; i++) {
						retView[i] = curView[i] | 0x80;
					}retView[this.blockLength - 1] = curView[this.blockLength - 1];

					return retBuf;
				}

				var encodedBuf = utilToBase$1(this.valueDec, 7);
				if (encodedBuf.byteLength === 0) {
					this.error = "Error during encoding SID value";
					return new ArrayBuffer(0);
				}

				retBuf = new ArrayBuffer(encodedBuf.byteLength);

				if (sizeOnly === false) {
					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					for (var _i25 = 0; _i25 < encodedBuf.byteLength - 1; _i25++) {
						retView[_i25] = encodedView[_i25] | 0x80;
					}retView[encodedBuf.byteLength - 1] = encodedView[encodedBuf.byteLength - 1];
				}

				return retBuf;
			}
		}, {
			key: 'toString',
			value: function toString() {
				var result = "";

				if (this.isHexOnly === true) result = bufferToHexCodes$1(this.valueHex, 0, this.valueHex.byteLength);else {
					if (this.isFirstSid) {
						var sidValue = this.valueDec;

						if (this.valueDec <= 39) result = "0.";else {
							if (this.valueDec <= 79) {
								result = "1.";
								sidValue -= 40;
							} else {
								result = "2.";
								sidValue -= 80;
							}
						}

						result += sidValue.toString();
					} else result = this.valueDec.toString();
				}

				return result;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalSidValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalSidValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.valueDec = this.valueDec;
				object.isFirstSid = this.isFirstSid;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "sidBlock";
			}
		}]);

		return LocalSidValueBlock$1;
	}(LocalHexBlock$1(LocalBaseBlock$1));

	var LocalObjectIdentifierValueBlock$1 = function (_LocalValueBlock$5) {
		_inherits(LocalObjectIdentifierValueBlock$1, _LocalValueBlock$5);

		function LocalObjectIdentifierValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalObjectIdentifierValueBlock$1);

			var _this86 = _possibleConstructorReturn(this, (LocalObjectIdentifierValueBlock$1.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock$1)).call(this, parameters));

			_this86.fromString(getParametersValue$1(parameters, "value", ""));
			return _this86;
		}

		_createClass(LocalObjectIdentifierValueBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = inputOffset;

				while (inputLength > 0) {
					var sidBlock = new LocalSidValueBlock$1();
					resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
					if (resultOffset === -1) {
						this.blockLength = 0;
						this.error = sidBlock.error;
						return resultOffset;
					}

					if (this.value.length === 0) sidBlock.isFirstSid = true;

					this.blockLength += sidBlock.blockLength;
					inputLength -= sidBlock.blockLength;

					this.value.push(sidBlock);
				}

				return resultOffset;
			}
		}, {
			key: 'toBER',
			value: function toBER() {
				var sizeOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					if (valueBuf.byteLength === 0) {
						this.error = this.value[i].error;
						return new ArrayBuffer(0);
					}

					retBuf = utilConcatBuf$1(retBuf, valueBuf);
				}

				return retBuf;
			}
		}, {
			key: 'fromString',
			value: function fromString(string) {
				this.value = [];

				var pos1 = 0;
				var pos2 = 0;

				var sid = "";

				var flag = false;

				do {
					pos2 = string.indexOf(".", pos1);
					if (pos2 === -1) sid = string.substr(pos1);else sid = string.substr(pos1, pos2 - pos1);

					pos1 = pos2 + 1;

					if (flag) {
						var sidBlock = this.value[0];

						var plus = 0;

						switch (sidBlock.valueDec) {
							case 0:
								break;
							case 1:
								plus = 40;
								break;
							case 2:
								plus = 80;
								break;
							default:
								this.value = [];
								return false;}

						var parsedSID = parseInt(sid, 10);
						if (isNaN(parsedSID)) return true;

						sidBlock.valueDec = parsedSID + plus;

						flag = false;
					} else {
						var _sidBlock2 = new LocalSidValueBlock$1();
						_sidBlock2.valueDec = parseInt(sid, 10);
						if (isNaN(_sidBlock2.valueDec)) return true;

						if (this.value.length === 0) {
							_sidBlock2.isFirstSid = true;
							flag = true;
						}

						this.value.push(_sidBlock2);
					}
				} while (pos2 !== -1);

				return true;
			}
		}, {
			key: 'toString',
			value: function toString() {
				var result = "";
				var isHexOnly = false;

				for (var i = 0; i < this.value.length; i++) {
					isHexOnly = this.value[i].isHexOnly;

					var sidStr = this.value[i].toString();

					if (i !== 0) result = result + '.';

					if (isHexOnly) {
						sidStr = '{' + sidStr + '}';

						if (this.value[i].isFirstSid) result = '2.{' + sidStr + ' - 80}';else result += sidStr;
					} else result += sidStr;
				}

				return result;
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalObjectIdentifierValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.toString();
				object.sidArray = [];
				for (var i = 0; i < this.value.length; i++) {
					object.sidArray.push(this.value[i].toJSON());
				}return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "ObjectIdentifierValueBlock";
			}
		}]);

		return LocalObjectIdentifierValueBlock$1;
	}(LocalValueBlock$1);

	var ObjectIdentifier$1 = function (_BaseBlock$9) {
		_inherits(ObjectIdentifier$1, _BaseBlock$9);

		function ObjectIdentifier$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, ObjectIdentifier$1);

			var _this87 = _possibleConstructorReturn(this, (ObjectIdentifier$1.__proto__ || Object.getPrototypeOf(ObjectIdentifier$1)).call(this, parameters, LocalObjectIdentifierValueBlock$1));

			_this87.idBlock.tagClass = 1;
			_this87.idBlock.tagNumber = 6;return _this87;
		}

		_createClass(ObjectIdentifier$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "ObjectIdentifier";
			}
		}]);

		return ObjectIdentifier$1;
	}(BaseBlock$1);

	var LocalUtf8StringValueBlock$1 = function (_LocalHexBlock$6) {
		_inherits(LocalUtf8StringValueBlock$1, _LocalHexBlock$6);

		function LocalUtf8StringValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalUtf8StringValueBlock$1);

			var _this88 = _possibleConstructorReturn(this, (LocalUtf8StringValueBlock$1.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock$1)).call(this, parameters));

			_this88.isHexOnly = true;
			_this88.value = "";return _this88;
		}

		_createClass(LocalUtf8StringValueBlock$1, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalUtf8StringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Utf8StringValueBlock";
			}
		}]);

		return LocalUtf8StringValueBlock$1;
	}(LocalHexBlock$1(LocalBaseBlock$1));

	var Utf8String$1 = function (_BaseBlock$10) {
		_inherits(Utf8String$1, _BaseBlock$10);

		function Utf8String$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Utf8String$1);

			var _this89 = _possibleConstructorReturn(this, (Utf8String$1.__proto__ || Object.getPrototypeOf(Utf8String$1)).call(this, parameters, LocalUtf8StringValueBlock$1));

			if ("value" in parameters) _this89.fromString(parameters.value);

			_this89.idBlock.tagClass = 1;
			_this89.idBlock.tagNumber = 12;return _this89;
		}

		_createClass(Utf8String$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));

				try {
					this.valueBlock.value = decodeURIComponent(escape(this.valueBlock.value));
				} catch (ex) {
					this.warnings.push('Error during "decodeURIComponent": ' + ex + ', using raw string');
				}
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var str = unescape(encodeURIComponent(inputString));
				var strLen = str.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = str.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "Utf8String";
			}
		}]);

		return Utf8String$1;
	}(BaseBlock$1);

	var LocalBmpStringValueBlock$1 = function (_LocalHexBlock$7) {
		_inherits(LocalBmpStringValueBlock$1, _LocalHexBlock$7);

		function LocalBmpStringValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalBmpStringValueBlock$1);

			var _this90 = _possibleConstructorReturn(this, (LocalBmpStringValueBlock$1.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock$1)).call(this, parameters));

			_this90.isHexOnly = true;
			_this90.value = "";
			return _this90;
		}

		_createClass(LocalBmpStringValueBlock$1, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalBmpStringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BmpStringValueBlock";
			}
		}]);

		return LocalBmpStringValueBlock$1;
	}(LocalHexBlock$1(LocalBaseBlock$1));

	var BmpString$1 = function (_BaseBlock$11) {
		_inherits(BmpString$1, _BaseBlock$11);

		function BmpString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, BmpString$1);

			var _this91 = _possibleConstructorReturn(this, (BmpString$1.__proto__ || Object.getPrototypeOf(BmpString$1)).call(this, parameters, LocalBmpStringValueBlock$1));

			if ("value" in parameters) _this91.fromString(parameters.value);

			_this91.idBlock.tagClass = 1;
			_this91.idBlock.tagNumber = 30;return _this91;
		}

		_createClass(BmpString$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i += 2) {
					var temp = valueView[i];

					valueView[i] = valueView[i + 1];
					valueView[i + 1] = temp;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint16Array(copyBuffer));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 2);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase$1(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 2) continue;

					var dif = 2 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 2 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "BmpString";
			}
		}]);

		return BmpString$1;
	}(BaseBlock$1);

	var LocalUniversalStringValueBlock$1 = function (_LocalHexBlock$8) {
		_inherits(LocalUniversalStringValueBlock$1, _LocalHexBlock$8);

		function LocalUniversalStringValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalUniversalStringValueBlock$1);

			var _this92 = _possibleConstructorReturn(this, (LocalUniversalStringValueBlock$1.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock$1)).call(this, parameters));

			_this92.isHexOnly = true;
			_this92.value = "";
			return _this92;
		}

		_createClass(LocalUniversalStringValueBlock$1, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalUniversalStringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "UniversalStringValueBlock";
			}
		}]);

		return LocalUniversalStringValueBlock$1;
	}(LocalHexBlock$1(LocalBaseBlock$1));

	var UniversalString$1 = function (_BaseBlock$12) {
		_inherits(UniversalString$1, _BaseBlock$12);

		function UniversalString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, UniversalString$1);

			var _this93 = _possibleConstructorReturn(this, (UniversalString$1.__proto__ || Object.getPrototypeOf(UniversalString$1)).call(this, parameters, LocalUniversalStringValueBlock$1));

			if ("value" in parameters) _this93.fromString(parameters.value);

			_this93.idBlock.tagClass = 1;
			_this93.idBlock.tagNumber = 28;return _this93;
		}

		_createClass(UniversalString$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i += 4) {
					valueView[i] = valueView[i + 3];
					valueView[i + 1] = valueView[i + 2];
					valueView[i + 2] = 0x00;
					valueView[i + 3] = 0x00;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint32Array(copyBuffer));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 4);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase$1(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 4) continue;

					var dif = 4 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 4 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "UniversalString";
			}
		}]);

		return UniversalString$1;
	}(BaseBlock$1);

	var LocalSimpleStringValueBlock$1 = function (_LocalHexBlock$9) {
		_inherits(LocalSimpleStringValueBlock$1, _LocalHexBlock$9);

		function LocalSimpleStringValueBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalSimpleStringValueBlock$1);

			var _this94 = _possibleConstructorReturn(this, (LocalSimpleStringValueBlock$1.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock$1)).call(this, parameters));

			_this94.value = "";
			_this94.isHexOnly = true;
			return _this94;
		}

		_createClass(LocalSimpleStringValueBlock$1, [{
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(LocalSimpleStringValueBlock$1.prototype.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.value = this.value;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "SimpleStringValueBlock";
			}
		}]);

		return LocalSimpleStringValueBlock$1;
	}(LocalHexBlock$1(LocalBaseBlock$1));

	var LocalSimpleStringBlock$1 = function (_BaseBlock$13) {
		_inherits(LocalSimpleStringBlock$1, _BaseBlock$13);

		function LocalSimpleStringBlock$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, LocalSimpleStringBlock$1);

			var _this95 = _possibleConstructorReturn(this, (LocalSimpleStringBlock$1.__proto__ || Object.getPrototypeOf(LocalSimpleStringBlock$1)).call(this, parameters, LocalSimpleStringValueBlock$1));

			if ("value" in parameters) _this95.fromString(parameters.value);
			return _this95;
		}

		_createClass(LocalSimpleStringBlock$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var strLen = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = inputString.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "SIMPLESTRING";
			}
		}]);

		return LocalSimpleStringBlock$1;
	}(BaseBlock$1);

	var NumericString$1 = function (_LocalSimpleStringBlo10) {
		_inherits(NumericString$1, _LocalSimpleStringBlo10);

		function NumericString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, NumericString$1);

			var _this96 = _possibleConstructorReturn(this, (NumericString$1.__proto__ || Object.getPrototypeOf(NumericString$1)).call(this, parameters));

			_this96.idBlock.tagClass = 1;
			_this96.idBlock.tagNumber = 18;return _this96;
		}

		_createClass(NumericString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "NumericString";
			}
		}]);

		return NumericString$1;
	}(LocalSimpleStringBlock$1);

	var PrintableString$1 = function (_LocalSimpleStringBlo11) {
		_inherits(PrintableString$1, _LocalSimpleStringBlo11);

		function PrintableString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, PrintableString$1);

			var _this97 = _possibleConstructorReturn(this, (PrintableString$1.__proto__ || Object.getPrototypeOf(PrintableString$1)).call(this, parameters));

			_this97.idBlock.tagClass = 1;
			_this97.idBlock.tagNumber = 19;return _this97;
		}

		_createClass(PrintableString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "PrintableString";
			}
		}]);

		return PrintableString$1;
	}(LocalSimpleStringBlock$1);

	var TeletexString$1 = function (_LocalSimpleStringBlo12) {
		_inherits(TeletexString$1, _LocalSimpleStringBlo12);

		function TeletexString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, TeletexString$1);

			var _this98 = _possibleConstructorReturn(this, (TeletexString$1.__proto__ || Object.getPrototypeOf(TeletexString$1)).call(this, parameters));

			_this98.idBlock.tagClass = 1;
			_this98.idBlock.tagNumber = 20;return _this98;
		}

		_createClass(TeletexString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "TeletexString";
			}
		}]);

		return TeletexString$1;
	}(LocalSimpleStringBlock$1);

	var VideotexString$1 = function (_LocalSimpleStringBlo13) {
		_inherits(VideotexString$1, _LocalSimpleStringBlo13);

		function VideotexString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, VideotexString$1);

			var _this99 = _possibleConstructorReturn(this, (VideotexString$1.__proto__ || Object.getPrototypeOf(VideotexString$1)).call(this, parameters));

			_this99.idBlock.tagClass = 1;
			_this99.idBlock.tagNumber = 21;return _this99;
		}

		_createClass(VideotexString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "VideotexString";
			}
		}]);

		return VideotexString$1;
	}(LocalSimpleStringBlock$1);

	var IA5String$1 = function (_LocalSimpleStringBlo14) {
		_inherits(IA5String$1, _LocalSimpleStringBlo14);

		function IA5String$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, IA5String$1);

			var _this100 = _possibleConstructorReturn(this, (IA5String$1.__proto__ || Object.getPrototypeOf(IA5String$1)).call(this, parameters));

			_this100.idBlock.tagClass = 1;
			_this100.idBlock.tagNumber = 22;return _this100;
		}

		_createClass(IA5String$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "IA5String";
			}
		}]);

		return IA5String$1;
	}(LocalSimpleStringBlock$1);

	var GraphicString$1 = function (_LocalSimpleStringBlo15) {
		_inherits(GraphicString$1, _LocalSimpleStringBlo15);

		function GraphicString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GraphicString$1);

			var _this101 = _possibleConstructorReturn(this, (GraphicString$1.__proto__ || Object.getPrototypeOf(GraphicString$1)).call(this, parameters));

			_this101.idBlock.tagClass = 1;
			_this101.idBlock.tagNumber = 25;return _this101;
		}

		_createClass(GraphicString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "GraphicString";
			}
		}]);

		return GraphicString$1;
	}(LocalSimpleStringBlock$1);

	var VisibleString$1 = function (_LocalSimpleStringBlo16) {
		_inherits(VisibleString$1, _LocalSimpleStringBlo16);

		function VisibleString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, VisibleString$1);

			var _this102 = _possibleConstructorReturn(this, (VisibleString$1.__proto__ || Object.getPrototypeOf(VisibleString$1)).call(this, parameters));

			_this102.idBlock.tagClass = 1;
			_this102.idBlock.tagNumber = 26;return _this102;
		}

		_createClass(VisibleString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "VisibleString";
			}
		}]);

		return VisibleString$1;
	}(LocalSimpleStringBlock$1);

	var GeneralString$1 = function (_LocalSimpleStringBlo17) {
		_inherits(GeneralString$1, _LocalSimpleStringBlo17);

		function GeneralString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralString$1);

			var _this103 = _possibleConstructorReturn(this, (GeneralString$1.__proto__ || Object.getPrototypeOf(GeneralString$1)).call(this, parameters));

			_this103.idBlock.tagClass = 1;
			_this103.idBlock.tagNumber = 27;return _this103;
		}

		_createClass(GeneralString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "GeneralString";
			}
		}]);

		return GeneralString$1;
	}(LocalSimpleStringBlock$1);

	var CharacterString$1 = function (_LocalSimpleStringBlo18) {
		_inherits(CharacterString$1, _LocalSimpleStringBlo18);

		function CharacterString$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, CharacterString$1);

			var _this104 = _possibleConstructorReturn(this, (CharacterString$1.__proto__ || Object.getPrototypeOf(CharacterString$1)).call(this, parameters));

			_this104.idBlock.tagClass = 1;
			_this104.idBlock.tagNumber = 29;return _this104;
		}

		_createClass(CharacterString$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "CharacterString";
			}
		}]);

		return CharacterString$1;
	}(LocalSimpleStringBlock$1);

	var UTCTime$1 = function (_VisibleString$) {
		_inherits(UTCTime$1, _VisibleString$);

		function UTCTime$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, UTCTime$1);

			var _this105 = _possibleConstructorReturn(this, (UTCTime$1.__proto__ || Object.getPrototypeOf(UTCTime$1)).call(this, parameters));

			_this105.year = 0;
			_this105.month = 0;
			_this105.day = 0;
			_this105.hour = 0;
			_this105.minute = 0;
			_this105.second = 0;

			if ("value" in parameters) {
				_this105.fromString(parameters.value);

				_this105.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this105.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}

			if ("valueDate" in parameters) {
				_this105.fromDate(parameters.valueDate);
				_this105.valueBlock.valueHex = _this105.toBuffer();
			}


			_this105.idBlock.tagClass = 1;
			_this105.idBlock.tagNumber = 23;return _this105;
		}

		_createClass(UTCTime$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
		}, {
			key: 'toBuffer',
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
		}, {
			key: 'fromDate',
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
			}
		}, {
			key: 'toDate',
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
				var parserArray = parser.exec(inputString);
				if (parserArray === null) {
					this.error = "Wrong input string for convertion";
					return;
				}

				var year = parseInt(parserArray[1], 10);
				if (year >= 50) this.year = 1900 + year;else this.year = 2000 + year;

				this.month = parseInt(parserArray[2], 10);
				this.day = parseInt(parserArray[3], 10);
				this.hour = parseInt(parserArray[4], 10);
				this.minute = parseInt(parserArray[5], 10);
				this.second = parseInt(parserArray[6], 10);
			}
		}, {
			key: 'toString',
			value: function toString() {
				var outputArray = new Array(7);

				outputArray[0] = padNumber$1(this.year < 2000 ? this.year - 1900 : this.year - 2000, 2);
				outputArray[1] = padNumber$1(this.month, 2);
				outputArray[2] = padNumber$1(this.day, 2);
				outputArray[3] = padNumber$1(this.hour, 2);
				outputArray[4] = padNumber$1(this.minute, 2);
				outputArray[5] = padNumber$1(this.second, 2);
				outputArray[6] = "Z";

				return outputArray.join("");
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(UTCTime$1.prototype.__proto__ || Object.getPrototypeOf(UTCTime$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "UTCTime";
			}
		}]);

		return UTCTime$1;
	}(VisibleString$1);

	var GeneralizedTime$1 = function (_VisibleString$2) {
		_inherits(GeneralizedTime$1, _VisibleString$2);

		function GeneralizedTime$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, GeneralizedTime$1);

			var _this106 = _possibleConstructorReturn(this, (GeneralizedTime$1.__proto__ || Object.getPrototypeOf(GeneralizedTime$1)).call(this, parameters));

			_this106.year = 0;
			_this106.month = 0;
			_this106.day = 0;
			_this106.hour = 0;
			_this106.minute = 0;
			_this106.second = 0;
			_this106.millisecond = 0;

			if ("value" in parameters) {
				_this106.fromString(parameters.value);

				_this106.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this106.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}

			if ("valueDate" in parameters) {
				_this106.fromDate(parameters.valueDate);
				_this106.valueBlock.valueHex = _this106.toBuffer();
			}


			_this106.idBlock.tagClass = 1;
			_this106.idBlock.tagNumber = 24;return _this106;
		}

		_createClass(GeneralizedTime$1, [{
			key: 'fromBER',
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
		}, {
			key: 'fromBuffer',
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
		}, {
			key: 'toBuffer',
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
		}, {
			key: 'fromDate',
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
				this.millisecond = inputDate.getUTCMilliseconds();
			}
		}, {
			key: 'toDate',
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond));
			}
		}, {
			key: 'fromString',
			value: function fromString(inputString) {
				var isUTC = false;

				var timeString = "";
				var dateTimeString = "";
				var fractionPart = 0;

				var parser = void 0;

				var hourDifference = 0;
				var minuteDifference = 0;

				if (inputString[inputString.length - 1] === "Z") {
					timeString = inputString.substr(0, inputString.length - 1);

					isUTC = true;
				} else {
						var number = new Number(inputString[inputString.length - 1]);

						if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");

						timeString = inputString;
					}

				if (isUTC) {
					if (timeString.indexOf("+") !== -1) throw new Error("Wrong input string for convertion");

					if (timeString.indexOf("-") !== -1) throw new Error("Wrong input string for convertion");
				} else {
						var multiplier = 1;
						var differencePosition = timeString.indexOf("+");
						var differenceString = "";

						if (differencePosition === -1) {
							differencePosition = timeString.indexOf("-");
							multiplier = -1;
						}

						if (differencePosition !== -1) {
							differenceString = timeString.substr(differencePosition + 1);
							timeString = timeString.substr(0, differencePosition);

							if (differenceString.length !== 2 && differenceString.length !== 4) throw new Error("Wrong input string for convertion");

							var _number2 = new Number(differenceString.substr(0, 2));

							if (isNaN(_number2.valueOf())) throw new Error("Wrong input string for convertion");

							hourDifference = multiplier * _number2;

							if (differenceString.length === 4) {
								_number2 = new Number(differenceString.substr(2, 2));

								if (isNaN(_number2.valueOf())) throw new Error("Wrong input string for convertion");

								minuteDifference = multiplier * _number2;
							}
						}
					}

				var fractionPointPosition = timeString.indexOf(".");
				if (fractionPointPosition === -1) fractionPointPosition = timeString.indexOf(",");
				if (fractionPointPosition !== -1) {
					var fractionPartCheck = new Number('0' + timeString.substr(fractionPointPosition));

					if (isNaN(fractionPartCheck.valueOf())) throw new Error("Wrong input string for convertion");

					fractionPart = fractionPartCheck.valueOf();

					dateTimeString = timeString.substr(0, fractionPointPosition);
				} else dateTimeString = timeString;

				switch (true) {
					case dateTimeString.length === 8:
						parser = /(\d{4})(\d{2})(\d{2})/ig;
						if (fractionPointPosition !== -1) throw new Error("Wrong input string for convertion");
						break;
					case dateTimeString.length === 10:
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var fractionResult = 60 * fractionPart;
							this.minute = Math.floor(fractionResult);

							fractionResult = 60 * (fractionResult - this.minute);
							this.second = Math.floor(fractionResult);

							fractionResult = 1000 * (fractionResult - this.second);
							this.millisecond = Math.floor(fractionResult);
						}
						break;
					case dateTimeString.length === 12:
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult3 = 60 * fractionPart;
							this.second = Math.floor(_fractionResult3);

							_fractionResult3 = 1000 * (_fractionResult3 - this.second);
							this.millisecond = Math.floor(_fractionResult3);
						}
						break;
					case dateTimeString.length === 14:
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult4 = 1000 * fractionPart;
							this.millisecond = Math.floor(_fractionResult4);
						}
						break;
					default:
						throw new Error("Wrong input string for convertion");
				}

				var parserArray = parser.exec(dateTimeString);
				if (parserArray === null) throw new Error("Wrong input string for convertion");

				for (var j = 1; j < parserArray.length; j++) {
					switch (j) {
						case 1:
							this.year = parseInt(parserArray[j], 10);
							break;
						case 2:
							this.month = parseInt(parserArray[j], 10);
							break;
						case 3:
							this.day = parseInt(parserArray[j], 10);
							break;
						case 4:
							this.hour = parseInt(parserArray[j], 10) + hourDifference;
							break;
						case 5:
							this.minute = parseInt(parserArray[j], 10) + minuteDifference;
							break;
						case 6:
							this.second = parseInt(parserArray[j], 10);
							break;
						default:
							throw new Error("Wrong input string for convertion");
					}
				}

				if (isUTC === false) {
					var tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);

					this.year = tempDate.getUTCFullYear();
					this.month = tempDate.getUTCMonth();
					this.day = tempDate.getUTCDay();
					this.hour = tempDate.getUTCHours();
					this.minute = tempDate.getUTCMinutes();
					this.second = tempDate.getUTCSeconds();
					this.millisecond = tempDate.getUTCMilliseconds();
				}
			}
		}, {
			key: 'toString',
			value: function toString() {
				var outputArray = [];

				outputArray.push(padNumber$1(this.year, 4));
				outputArray.push(padNumber$1(this.month, 2));
				outputArray.push(padNumber$1(this.day, 2));
				outputArray.push(padNumber$1(this.hour, 2));
				outputArray.push(padNumber$1(this.minute, 2));
				outputArray.push(padNumber$1(this.second, 2));
				if (this.millisecond !== 0) {
					outputArray.push(".");
					outputArray.push(padNumber$1(this.millisecond, 3));
				}
				outputArray.push("Z");

				return outputArray.join("");
			}
		}, {
			key: 'toJSON',
			value: function toJSON() {
				var object = {};

				try {
					object = _get(GeneralizedTime$1.prototype.__proto__ || Object.getPrototypeOf(GeneralizedTime$1.prototype), 'toJSON', this).call(this);
				} catch (ex) {}


				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;
				object.millisecond = this.millisecond;

				return object;
			}
		}], [{
			key: 'blockName',
			value: function blockName() {
				return "GeneralizedTime";
			}
		}]);

		return GeneralizedTime$1;
	}(VisibleString$1);

	var DATE$1 = function (_Utf8String$) {
		_inherits(DATE$1, _Utf8String$);

		function DATE$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, DATE$1);

			var _this107 = _possibleConstructorReturn(this, (DATE$1.__proto__ || Object.getPrototypeOf(DATE$1)).call(this, parameters));

			_this107.idBlock.tagClass = 1;
			_this107.idBlock.tagNumber = 31;return _this107;
		}

		_createClass(DATE$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "DATE";
			}
		}]);

		return DATE$1;
	}(Utf8String$1);

	var TimeOfDay$1 = function (_Utf8String$2) {
		_inherits(TimeOfDay$1, _Utf8String$2);

		function TimeOfDay$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, TimeOfDay$1);

			var _this108 = _possibleConstructorReturn(this, (TimeOfDay$1.__proto__ || Object.getPrototypeOf(TimeOfDay$1)).call(this, parameters));

			_this108.idBlock.tagClass = 1;
			_this108.idBlock.tagNumber = 32;return _this108;
		}

		_createClass(TimeOfDay$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "TimeOfDay";
			}
		}]);

		return TimeOfDay$1;
	}(Utf8String$1);

	var DateTime$1 = function (_Utf8String$3) {
		_inherits(DateTime$1, _Utf8String$3);

		function DateTime$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, DateTime$1);

			var _this109 = _possibleConstructorReturn(this, (DateTime$1.__proto__ || Object.getPrototypeOf(DateTime$1)).call(this, parameters));

			_this109.idBlock.tagClass = 1;
			_this109.idBlock.tagNumber = 33;return _this109;
		}

		_createClass(DateTime$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "DateTime";
			}
		}]);

		return DateTime$1;
	}(Utf8String$1);

	var Duration$1 = function (_Utf8String$4) {
		_inherits(Duration$1, _Utf8String$4);

		function Duration$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Duration$1);

			var _this110 = _possibleConstructorReturn(this, (Duration$1.__proto__ || Object.getPrototypeOf(Duration$1)).call(this, parameters));

			_this110.idBlock.tagClass = 1;
			_this110.idBlock.tagNumber = 34;return _this110;
		}

		_createClass(Duration$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "Duration";
			}
		}]);

		return Duration$1;
	}(Utf8String$1);

	var TIME$1 = function (_Utf8String$5) {
		_inherits(TIME$1, _Utf8String$5);

		function TIME$1() {
			var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, TIME$1);

			var _this111 = _possibleConstructorReturn(this, (TIME$1.__proto__ || Object.getPrototypeOf(TIME$1)).call(this, parameters));

			_this111.idBlock.tagClass = 1;
			_this111.idBlock.tagNumber = 14;return _this111;
		}

		_createClass(TIME$1, null, [{
			key: 'blockName',
			value: function blockName() {
				return "TIME";
			}
		}]);

		return TIME$1;
	}(Utf8String$1);

	function LocalFromBER$1(inputBuffer, inputOffset, inputLength) {
		var incomingOffset = inputOffset;
		function localChangeType(inputObject, newType) {
			if (inputObject instanceof newType) return inputObject;

			var newObject = new newType();
			newObject.idBlock = inputObject.idBlock;
			newObject.lenBlock = inputObject.lenBlock;
			newObject.warnings = inputObject.warnings;

			newObject.valueBeforeDecode = inputObject.valueBeforeDecode.slice(0);

			return newObject;
		}

		var returnObject = new BaseBlock$1({}, Object);

		if (checkBufferParams$1(new LocalBaseBlock$1(), inputBuffer, inputOffset, inputLength) === false) {
			returnObject.error = "Wrong input parameters";
			return {
				offset: -1,
				result: returnObject
			};
		}

		var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

		if (intBuffer.length === 0) {
			this.error = "Zero buffer length";
			return {
				offset: -1,
				result: returnObject
			};
		}

		var resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.idBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.idBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.idBlock.blockLength;

		resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.lenBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.lenBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.lenBlock.blockLength;

		if (returnObject.idBlock.isConstructed === false && returnObject.lenBlock.isIndefiniteForm === true) {
			returnObject.error = "Indefinite length form used for primitive encoding form";
			return {
				offset: -1,
				result: returnObject
			};
		}

		var newASN1Type = BaseBlock$1;

		switch (returnObject.idBlock.tagClass) {
			case 1:
				if (returnObject.idBlock.tagNumber >= 37 && returnObject.idBlock.isHexOnly === false) {
					returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
					return {
						offset: -1,
						result: returnObject
					};
				}


				switch (returnObject.idBlock.tagNumber) {
					case 0:
						if (returnObject.idBlock.isConstructed === true && returnObject.lenBlock.length > 0) {
							returnObject.error = "Type [UNIVERSAL 0] is reserved";
							return {
								offset: -1,
								result: returnObject
							};
						}


						newASN1Type = EndOfContent$1;

						break;

					case 1:
						newASN1Type = Boolean$1;
						break;

					case 2:
						newASN1Type = Integer$1;
						break;

					case 3:
						newASN1Type = BitString$1;
						break;

					case 4:
						newASN1Type = OctetString$1;
						break;

					case 5:
						newASN1Type = Null$1;
						break;

					case 6:
						newASN1Type = ObjectIdentifier$1;
						break;

					case 10:
						newASN1Type = Enumerated$1;
						break;

					case 12:
						newASN1Type = Utf8String$1;
						break;

					case 14:
						newASN1Type = TIME$1;
						break;

					case 15:
						returnObject.error = "[UNIVERSAL 15] is reserved by ASN.1 standard";
						return {
							offset: -1,
							result: returnObject
						};

					case 16:
						newASN1Type = Sequence$1;
						break;

					case 17:
						newASN1Type = Set$1;
						break;

					case 18:
						newASN1Type = NumericString$1;
						break;

					case 19:
						newASN1Type = PrintableString$1;
						break;

					case 20:
						newASN1Type = TeletexString$1;
						break;

					case 21:
						newASN1Type = VideotexString$1;
						break;

					case 22:
						newASN1Type = IA5String$1;
						break;

					case 23:
						newASN1Type = UTCTime$1;
						break;

					case 24:
						newASN1Type = GeneralizedTime$1;
						break;

					case 25:
						newASN1Type = GraphicString$1;
						break;

					case 26:
						newASN1Type = VisibleString$1;
						break;

					case 27:
						newASN1Type = GeneralString$1;
						break;

					case 28:
						newASN1Type = UniversalString$1;
						break;

					case 29:
						newASN1Type = CharacterString$1;
						break;

					case 30:
						newASN1Type = BmpString$1;
						break;

					case 31:
						newASN1Type = DATE$1;
						break;

					case 32:
						newASN1Type = TimeOfDay$1;
						break;

					case 33:
						newASN1Type = DateTime$1;
						break;

					case 34:
						newASN1Type = Duration$1;
						break;

					default:
						{
							var newObject = void 0;

							if (returnObject.idBlock.isConstructed === true) newObject = new Constructed$1();else newObject = new Primitive$1();

							newObject.idBlock = returnObject.idBlock;
							newObject.lenBlock = returnObject.lenBlock;
							newObject.warnings = returnObject.warnings;

							returnObject = newObject;

							resultOffset = returnObject.fromBER(inputBuffer, inputOffset, inputLength);
						}
				}
				break;

			case 2:
			case 3:
			case 4:
			default:
				{
					if (returnObject.idBlock.isConstructed === true) newASN1Type = Constructed$1;else newASN1Type = Primitive$1;
				}
		}

		returnObject = localChangeType(returnObject, newASN1Type);
		resultOffset = returnObject.fromBER(inputBuffer, inputOffset, returnObject.lenBlock.isIndefiniteForm === true ? inputLength : returnObject.lenBlock.length);

		returnObject.valueBeforeDecode = inputBuffer.slice(incomingOffset, incomingOffset + returnObject.blockLength);


		return {
			offset: resultOffset,
			result: returnObject
		};
	}

	function fromBER$1(inputBuffer) {
		if (inputBuffer.byteLength === 0) {
			var result = new BaseBlock$1({}, Object);
			result.error = "Input buffer has zero length";

			return {
				offset: -1,
				result: result
			};
		}

		return LocalFromBER$1(inputBuffer, 0, inputBuffer.byteLength);
	}

	var OID = {
		"2.5.4.3": {
			short: "CN",
			long: "CommonName"
		},
		"2.5.4.6": {
			short: "C",
			long: "Country"
		},
		"2.5.4.5": {
			long: "DeviceSerialNumber"
		},
		"0.9.2342.19200300.100.1.25": {
			short: "DC",
			long: "DomainComponent"
		},
		"1.2.840.113549.1.9.1": {
			short: "E",
			long: "EMail"
		},
		"2.5.4.42": {
			short: "G",
			long: "GivenName"
		},
		"2.5.4.43": {
			short: "I",
			long: "Initials"
		},
		"2.5.4.7": {
			short: "L",
			long: "Locality"
		},
		"2.5.4.10": {
			short: "O",
			long: "Organization"
		},
		"2.5.4.11": {
			short: "OU",
			long: "OrganizationUnit"
		},
		"2.5.4.8": {
			short: "ST",
			long: "State"
		},
		"2.5.4.9": {
			short: "Street",
			long: "StreetAddress"
		},
		"2.5.4.4": {
			short: "SN",
			long: "SurName"
		},
		"2.5.4.12": {
			short: "T",
			long: "Title"
		},
		"1.2.840.113549.1.9.8": {
			long: "UnstructuredAddress"
		},
		"1.2.840.113549.1.9.2": {
			long: "UnstructuredName"
		}
	};

	var X509Certificate = function () {
		function X509Certificate(rawData) {
			this.publicKey = null;
			if (rawData) {
				var buf = new Uint8Array(rawData);
				this.LoadRaw(buf);
				this.raw = buf;
			}
		}
		Object.defineProperty(X509Certificate.prototype, "SerialNumber", {
			get: function get() {
				return this.simpl.serialNumber.valueBlock.toString();
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(X509Certificate.prototype, "Issuer", {
			get: function get() {
				return this.NameToString(this.simpl.issuer);
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(X509Certificate.prototype, "Subject", {
			get: function get() {
				return this.NameToString(this.simpl.subject);
			},
			enumerable: true,
			configurable: true
		});

		X509Certificate.prototype.Thumbprint = function (algName) {
			if (algName === void 0) {
				algName = "SHA-1";
			}
			return Application.crypto.subtle.digest(algName, this.raw);
		};
		Object.defineProperty(X509Certificate.prototype, "PublicKey", {
			get: function get() {
				return this.publicKey;
			},
			enumerable: true,
			configurable: true
		});

		X509Certificate.prototype.GetRaw = function () {
			return this.raw;
		};

		X509Certificate.prototype.exportKey = function (algorithm) {
			var _this = this;
			return Promise.resolve().then(function () {
				var alg = {
					algorithm: algorithm,
					usages: ["verify"]
				};
				if (alg.algorithm.name.toUpperCase() === ECDSA) {
					var namedCurveOid = _this.simpl.subjectPublicKeyInfo.toJSON().algorithm.algorithmParams.valueBlock.value;
					switch (namedCurveOid) {
						case "1.2.840.10045.3.1.7":
							alg.algorithm.namedCurve = "P-256";
							break;
						case "1.3.132.0.34":
							alg.algorithm.namedCurve = "P-384";
							break;
						case "1.3.132.0.35":
							alg.algorithm.namedCurve = "P-521";
							break;
						default:
							throw new Error("Unsupported named curve OID '" + namedCurveOid + "'");
					}
				}
				return _this.simpl.getPublicKey({ algorithm: alg }).then(function (key) {
					_this.publicKey = key;
					return key;
				});
			});
		};

		X509Certificate.prototype.NameToString = function (name, splitter) {
			if (splitter === void 0) {
				splitter = ",";
			}
			var res = [];
			name.typesAndValues.forEach(function (typeAndValue) {
				var type = typeAndValue.type;
				var oid = OID[type.toString()];
				var name2 = oid ? oid.short : null;
				res.push((name2 ? name2 : type) + "=" + typeAndValue.value.valueBlock.value);
			});
			return res.join(splitter + " ");
		};

		X509Certificate.prototype.LoadRaw = function (rawData) {
			this.raw = new Uint8Array(rawData);
			var asn1 = fromBER$1(this.raw.buffer);
			this.simpl = new Certificate({ schema: asn1.result });
		};
		return X509Certificate;
	}();

	var X509IssuerSerial = function (_super) {
		__extends$1(X509IssuerSerial, _super);
		function X509IssuerSerial() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.X509IssuerName,
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix,
			required: true
		})], X509IssuerSerial.prototype, "X509IssuerName", void 0);
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.X509SerialNumber,
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix,
			required: true
		})], X509IssuerSerial.prototype, "X509SerialNumber", void 0);
		X509IssuerSerial = __decorate$1([XmlElement({ localName: XmlSignature.ElementNames.X509IssuerSerial })], X509IssuerSerial);
		return X509IssuerSerial;
	}(XmlSignatureObject);
	(function (X509IncludeOption) {
		X509IncludeOption[X509IncludeOption["None"] = 0] = "None";
		X509IncludeOption[X509IncludeOption["EndCertOnly"] = 1] = "EndCertOnly";
		X509IncludeOption[X509IncludeOption["ExcludeRoot"] = 2] = "ExcludeRoot";
		X509IncludeOption[X509IncludeOption["WholeChain"] = 3] = "WholeChain";
	})(exports.X509IncludeOption || (exports.X509IncludeOption = {}));

	var KeyInfoX509Data = function (_super) {
		__extends$1(KeyInfoX509Data, _super);
		function KeyInfoX509Data(cert, includeOptions) {
			if (includeOptions === void 0) {
				includeOptions = exports.X509IncludeOption.None;
			}
			var _this = _super.call(this) || this;
			_this.x509crl = null;
			_this.SubjectKeyIdList = [];
			_this.key = null;
			if (cert) {
				if (cert instanceof Uint8Array) {
					_this.AddCertificate(new X509Certificate(cert));
				} else if (cert instanceof X509Certificate) {
					switch (includeOptions) {
						case exports.X509IncludeOption.None:
						case exports.X509IncludeOption.EndCertOnly:
							_this.AddCertificate(cert);
							break;
						case exports.X509IncludeOption.ExcludeRoot:
							_this.AddCertificatesChainFrom(cert, false);
							break;
						case exports.X509IncludeOption.WholeChain:
							_this.AddCertificatesChainFrom(cert, true);
							break;
					}
				}
			}
			return _this;
		}
		Object.defineProperty(KeyInfoX509Data.prototype, "Key", {
			get: function get() {
				return this.key;
			},
			enumerable: true,
			configurable: true
		});
		KeyInfoX509Data.prototype.importKey = function (key) {
			return Promise.reject(new XmlError(XE.METHOD_NOT_SUPPORTED));
		};

		KeyInfoX509Data.prototype.exportKey = function (alg) {
			var _this = this;
			return Promise.resolve().then(function () {
				if (_this.Certificates.length) {
					return _this.Certificates[0].exportKey(alg);
				}
				throw new XmlError(XE.NULL_REFERENCE);
			}).then(function (key) {
				_this.key = key;
				return key;
			});
		};
		Object.defineProperty(KeyInfoX509Data.prototype, "Certificates", {
			get: function get() {
				return this.X509CertificateList;
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(KeyInfoX509Data.prototype, "CRL", {
			get: function get() {
				return this.x509crl;
			},
			set: function set(value) {
				this.x509crl = value;
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(KeyInfoX509Data.prototype, "IssuerSerials", {
			get: function get() {
				return this.IssuerSerialList;
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(KeyInfoX509Data.prototype, "SubjectKeyIds", {
			get: function get() {
				return this.SubjectKeyIdList;
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(KeyInfoX509Data.prototype, "SubjectNames", {
			get: function get() {
				return this.SubjectNameList;
			},
			enumerable: true,
			configurable: true
		});

		KeyInfoX509Data.prototype.AddCertificate = function (certificate) {
			if (!certificate) {
				throw new XmlError(XE.PARAM_REQUIRED, "certificate");
			}
			if (!this.X509CertificateList) {
				this.X509CertificateList = [];
			}
			this.X509CertificateList.push(certificate);
		};

		KeyInfoX509Data.prototype.AddIssuerSerial = function (issuerName, serialNumber) {
			if (issuerName == null) {
				throw new XmlError(XE.PARAM_REQUIRED, "issuerName");
			}
			if (this.IssuerSerialList == null) {
				this.IssuerSerialList = [];
			}
			var xis = { issuerName: issuerName, serialNumber: serialNumber };
			this.IssuerSerialList.push(xis);
		};

		KeyInfoX509Data.prototype.AddSubjectKeyId = function (subjectKeyId) {
			if (this.SubjectKeyIdList) {
				this.SubjectKeyIdList = [];
			}
			if (typeof subjectKeyId === "string") {
				if (subjectKeyId != null) {
					var id = void 0;
					id = Convert.FromBase64(subjectKeyId);
					this.SubjectKeyIdList.push(id);
				}
			} else {
				this.SubjectKeyIdList.push(subjectKeyId);
			}
		};

		KeyInfoX509Data.prototype.AddSubjectName = function (subjectName) {
			if (this.SubjectNameList == null) {
				this.SubjectNameList = [];
			}
			this.SubjectNameList.push(subjectName);
		};

		KeyInfoX509Data.prototype.GetXml = function () {
			var doc = this.CreateDocument();
			var xel = this.CreateElement(doc);
			var prefix = this.GetPrefix();

			if (this.IssuerSerialList != null && this.IssuerSerialList.length > 0) {
				this.IssuerSerialList.forEach(function (iser) {
					var isl = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509IssuerSerial);
					var xin = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509IssuerName);
					xin.textContent = iser.issuerName;
					isl.appendChild(xin);
					var xsn = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SerialNumber);
					xsn.textContent = iser.serialNumber;
					isl.appendChild(xsn);
					xel.appendChild(isl);
				});
			}

			if (this.SubjectKeyIdList != null && this.SubjectKeyIdList.length > 0) {
				this.SubjectKeyIdList.forEach(function (skid) {
					var ski = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SKI);
					ski.textContent = Convert.ToBase64(skid);
					xel.appendChild(ski);
				});
			}

			if (this.SubjectNameList != null && this.SubjectNameList.length > 0) {
				this.SubjectNameList.forEach(function (subject) {
					var sn = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SubjectName);
					sn.textContent = subject;
					xel.appendChild(sn);
				});
			}

			if (this.X509CertificateList != null && this.X509CertificateList.length > 0) {
				this.X509CertificateList.forEach(function (x509) {
					var cert = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509Certificate);
					cert.textContent = Convert.ToBase64(x509.GetRaw());
					xel.appendChild(cert);
				});
			}

			if (this.x509crl != null) {
				var crl = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509CRL);
				crl.textContent = Convert.ToBase64(this.x509crl);
				xel.appendChild(crl);
			}
			return xel;
		};

		KeyInfoX509Data.prototype.LoadXml = function (element) {
			var _this = this;
			_super.prototype.LoadXml.call(this, element);
			if (this.IssuerSerialList) {
				this.IssuerSerialList = [];
			}
			if (this.SubjectKeyIdList) {
				this.SubjectKeyIdList = [];
			}
			if (this.SubjectNameList) {
				this.SubjectNameList = [];
			}
			if (this.X509CertificateList) {
				this.X509CertificateList = [];
			}
			this.x509crl = null;

			var xnl = this.GetChildren(XmlSignature.ElementNames.X509IssuerSerial);
			if (xnl) {
				xnl.forEach(function (xel) {
					var issuer = XmlSignatureObject.GetChild(xel, XmlSignature.ElementNames.X509IssuerName, XmlSignature.NamespaceURI, true);
					var serial = XmlSignatureObject.GetChild(xel, XmlSignature.ElementNames.X509SerialNumber, XmlSignature.NamespaceURI, true);
					if (issuer && issuer.textContent && serial && serial.textContent) {
						_this.AddIssuerSerial(issuer.textContent, serial.textContent);
					}
				});
			}

			xnl = this.GetChildren(XmlSignature.ElementNames.X509SKI);
			if (xnl) {
				xnl.forEach(function (xel) {
					if (xel.textContent) {
						var skid = Convert.FromBase64(xel.textContent);
						_this.AddSubjectKeyId(skid);
					}
				});
			}

			xnl = this.GetChildren(XmlSignature.ElementNames.X509SubjectName);
			if (xnl != null) {
				xnl.forEach(function (xel) {
					if (xel.textContent) {
						_this.AddSubjectName(xel.textContent);
					}
				});
			}

			xnl = this.GetChildren(XmlSignature.ElementNames.X509Certificate);
			if (xnl) {
				xnl.forEach(function (xel) {
					if (xel.textContent) {
						var cert = Convert.FromBase64(xel.textContent);
						_this.AddCertificate(new X509Certificate(cert));
					}
				});
			}

			var x509el = this.GetChild(XmlSignature.ElementNames.X509CRL, false);
			if (x509el && x509el.textContent) {
				this.x509crl = Convert.FromBase64(x509el.textContent);
			}
		};

		KeyInfoX509Data.prototype.AddCertificatesChainFrom = function (cert, root) {
			throw new XmlError(XE.METHOD_NOT_IMPLEMENTED);
		};
		KeyInfoX509Data = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.X509Data
		})], KeyInfoX509Data);
		return KeyInfoX509Data;
	}(KeyInfoClause);

	var SPKIData = function (_super) {
		__extends$1(SPKIData, _super);
		function SPKIData() {
			return _super !== null && _super.apply(this, arguments) || this;
		}
		SPKIData.prototype.importKey = function (key) {
			var _this = this;
			return Promise.resolve().then(function () {
				return Application.crypto.subtle.exportKey("spki", key);
			}).then(function (spki) {
				_this.SPKIexp = new Uint8Array(spki);
				_this.Key = key;
				return _this;
			});
		};
		SPKIData.prototype.exportKey = function (alg) {
			var _this = this;
			return Promise.resolve().then(function () {
				return Application.crypto.subtle.importKey("spki", _this.SPKIexp, alg, true, ["verify"]);
			}).then(function (key) {
				_this.Key = key;
				return key;
			});
		};
		__decorate$1([XmlChildElement({
			localName: XmlSignature.ElementNames.SPKIexp,
			namespaceURI: XmlSignature.NamespaceURI,
			prefix: XmlSignature.DefaultPrefix,
			required: true,
			converter: XmlBase64Converter
		})], SPKIData.prototype, "SPKIexp", void 0);
		SPKIData = __decorate$1([XmlElement({
			localName: XmlSignature.ElementNames.SPKIData
		})], SPKIData);
		return SPKIData;
	}(KeyInfoClause);

	var SignatureAlgorithms = {};
	SignatureAlgorithms[RSA_PKCS1_SHA1_NAMESPACE] = RsaPkcs1Sha1;
	SignatureAlgorithms[RSA_PKCS1_SHA256_NAMESPACE] = RsaPkcs1Sha256;
	SignatureAlgorithms[RSA_PKCS1_SHA384_NAMESPACE] = RsaPkcs1Sha384;
	SignatureAlgorithms[RSA_PKCS1_SHA512_NAMESPACE] = RsaPkcs1Sha512;
	SignatureAlgorithms[ECDSA_SHA1_NAMESPACE] = EcdsaSha1;
	SignatureAlgorithms[ECDSA_SHA256_NAMESPACE] = EcdsaSha256;
	SignatureAlgorithms[ECDSA_SHA384_NAMESPACE] = EcdsaSha384;
	SignatureAlgorithms[ECDSA_SHA512_NAMESPACE] = EcdsaSha512;
	SignatureAlgorithms[HMAC_SHA1_NAMESPACE] = HmacSha1;
	SignatureAlgorithms[HMAC_SHA256_NAMESPACE] = HmacSha256;
	SignatureAlgorithms[HMAC_SHA384_NAMESPACE] = HmacSha384;
	SignatureAlgorithms[HMAC_SHA512_NAMESPACE] = HmacSha512;
	var HashAlgorithms = {};
	HashAlgorithms[SHA1_NAMESPACE] = Sha1;
	HashAlgorithms[SHA256_NAMESPACE] = Sha256;
	HashAlgorithms[SHA384_NAMESPACE] = Sha384;
	HashAlgorithms[SHA512_NAMESPACE] = Sha512;
	var CryptoConfig = function () {
		function CryptoConfig() {}

		CryptoConfig.CreateFromName = function (name) {
			var transform;
			switch (name) {
				case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
					transform = new XmlDsigBase64Transform();
					break;
				case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
					transform = new XmlDsigC14NTransform();
					break;
				case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
					transform = new XmlDsigC14NWithCommentsTransform();
					break;
				case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
					transform = new XmlDsigEnvelopedSignatureTransform();
					break;
				case XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform:
					throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);

				case XmlSignature.AlgorithmNamespaces.XmlDsigXsltTransform:
					throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);

				case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
					transform = new XmlDsigExcC14NTransform();
					break;
				case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
					transform = new XmlDsigExcC14NWithCommentsTransform();
					break;
				case XmlSignature.AlgorithmNamespaces.XmlDecryptionTransform:
					throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);

				default:
					throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
			}
			return transform;
		};
		CryptoConfig.CreateSignatureAlgorithm = function (method) {
			var alg = SignatureAlgorithms[method.Algorithm] || null;
			if (alg) {
				return new alg();
			} else if (method.Algorithm === RSA_PSS_WITH_PARAMS_NAMESPACE) {
				var pssParams_1;
				method.Any.Some(function (item) {
					if (item instanceof PssAlgorithmParams) {
						pssParams_1 = item;
					}
					return !!pssParams_1;
				});
				if (pssParams_1) {
					switch (pssParams_1.DigestMethod.Algorithm) {
						case SHA1_NAMESPACE:
							return new RsaPssSha1(pssParams_1.SaltLength);
						case SHA256_NAMESPACE:
							return new RsaPssSha256(pssParams_1.SaltLength);
						case SHA384_NAMESPACE:
							return new RsaPssSha384(pssParams_1.SaltLength);
						case SHA512_NAMESPACE:
							return new RsaPssSha512(pssParams_1.SaltLength);
					}
				}
				throw new XmlError(XE.CRYPTOGRAPHIC, "Cannot get params for RSA-PSS algoriithm");
			}
			throw new Error("signature algorithm '" + method.Algorithm + "' is not supported");
		};
		CryptoConfig.CreateHashAlgorithm = function (namespace) {
			var alg = HashAlgorithms[namespace];
			if (alg) {
				return new alg();
			} else {
				throw new Error("hash algorithm '" + namespace + "' is not supported");
			}
		};
		CryptoConfig.GetHashAlgorithm = function (algorithm) {
			var alg = typeof algorithm === "string" ? { name: algorithm } : algorithm;
			switch (alg.name.toUpperCase()) {
				case SHA1:
					return new Sha1();
				case SHA256:
					return new Sha256();
				case SHA384:
					return new Sha384();
				case SHA512:
					return new Sha512();
				default:
					throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, alg.name);
			}
		};
		CryptoConfig.GetSignatureAlgorithm = function (algorithm) {
			if (typeof algorithm.hash === "string") {
				algorithm.hash = {
					name: algorithm.hash
				};
			}
			var hashName = algorithm.hash.name;
			if (!hashName) {
				throw new Error("Signing algorithm doesn't have name for hash");
			}
			var alg;
			switch (algorithm.name.toUpperCase()) {
				case RSA_PKCS1.toUpperCase():
					switch (hashName.toUpperCase()) {
						case SHA1:
							alg = new RsaPkcs1Sha1();
							break;
						case SHA256:
							alg = new RsaPkcs1Sha256();
							break;
						case SHA384:
							alg = new RsaPkcs1Sha384();
							break;
						case SHA512:
							alg = new RsaPkcs1Sha512();
							break;
						default:
							throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
					}
					break;
				case RSA_PSS.toUpperCase():
					var saltLength = algorithm.saltLength;
					switch (hashName.toUpperCase()) {
						case SHA1:
							alg = new RsaPssSha1(saltLength);
							break;
						case SHA256:
							alg = new RsaPssSha256(saltLength);
							break;
						case SHA384:
							alg = new RsaPssSha384(saltLength);
							break;
						case SHA512:
							alg = new RsaPssSha512(saltLength);
							break;
						default:
							throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
					}
					break;
				case ECDSA:
					switch (hashName.toUpperCase()) {
						case SHA1:
							alg = new EcdsaSha1();
							break;
						case SHA256:
							alg = new EcdsaSha256();
							break;
						case SHA384:
							alg = new EcdsaSha384();
							break;
						case SHA512:
							alg = new EcdsaSha512();
							break;
						default:
							throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
					}
					break;
				case HMAC:
					switch (hashName.toUpperCase()) {
						case SHA1:
							alg = new HmacSha1();
							break;
						case SHA256:
							alg = new HmacSha256();
							break;
						case SHA384:
							alg = new HmacSha384();
							break;
						case SHA512:
							alg = new HmacSha512();
							break;
						default:
							throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
					}
					break;
				default:
					throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, algorithm.name);
			}
			return alg;
		};
		return CryptoConfig;
	}();

	var SignedXml = function () {
		function SignedXml(node) {
			this.signature = new Signature$1();

			if (node && node.nodeType === XmlNodeType.Document) {
				this.document = node;
			} else if (node && node.nodeType === XmlNodeType.Element) {
				var xmlText = new XMLSerializer().serializeToString(node);
				this.document = new DOMParser().parseFromString(xmlText, APPLICATION_XML);
			}
		}
		Object.defineProperty(SignedXml.prototype, "XmlSignature", {
			get: function get() {
				return this.signature;
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(SignedXml.prototype, "Signature", {
			get: function get() {
				return this.XmlSignature.SignatureValue;
			},
			enumerable: true,
			configurable: true
		});
		SignedXml.prototype.Sign = function (algorithm, key, data, options) {
			var _this = this;
			var alg;
			var signedInfo;
			return Promise.resolve().then(function () {
				var signingAlg = assign$1({}, key.algorithm, algorithm);
				alg = CryptoConfig.GetSignatureAlgorithm(signingAlg);
				return _this.ApplySignOptions(_this.XmlSignature, algorithm, key, options);
			}).then(function () {
				signedInfo = _this.XmlSignature.SignedInfo;
				return _this.DigestReferences(data.documentElement);
			}).then(function () {
				signedInfo.SignatureMethod.Algorithm = alg.namespaceURI;
				if (RSA_PSS.toUpperCase() === algorithm.name.toUpperCase()) {
					var alg2 = assign$1({}, key.algorithm, algorithm);
					if (typeof alg2.hash === "string") {
						alg2.hash = { name: alg2.hash };
					}
					var params = new PssAlgorithmParams(alg2);
					_this.XmlSignature.SignedInfo.SignatureMethod.Any.Add(params);
				} else if (HMAC.toUpperCase() === algorithm.name.toUpperCase()) {
					var outputLength = 0;
					var hmacAlg = key.algorithm;
					switch (hmacAlg.hash.name.toUpperCase()) {
						case SHA1:
							outputLength = hmacAlg.length || 160;
							break;
						case SHA256:
							outputLength = hmacAlg.length || 256;
							break;
						case SHA384:
							outputLength = hmacAlg.length || 384;
							break;
						case SHA512:
							outputLength = hmacAlg.length || 512;
							break;
					}
					_this.XmlSignature.SignedInfo.SignatureMethod.HMACOutputLength = outputLength;
				}
				var si = _this.TransformSignedInfo(data);
				return alg.Sign(si, key, algorithm);
			}).then(function (signature) {
				_this.Key = key;
				_this.XmlSignature.SignatureValue = new Uint8Array(signature);
				_this.document = data;
				return _this.XmlSignature;
			});
		};
		SignedXml.prototype.Verify = function (key) {
			var _this = this;
			return Promise.resolve().then(function () {
				var xml = _this.document;
				if (!(xml && xml.documentElement)) {
					throw new XmlError(XE.NULL_PARAM, "SignedXml", "document");
				}
				return _this.ValidateReferences(xml.documentElement);
			}).then(function (res) {
				if (res) {
					var promise = Promise.resolve([]);
					if (key) {
						promise = promise.then(function () {
							return [key];
						});
					} else {
						promise = promise.then(function () {
							return _this.GetPublicKeys();
						});
					}
					return promise.then(function (keys) {
						return _this.ValidateSignatureValue(keys);
					});
				} else {
					return false;
				}
			});
		};
		SignedXml.prototype.GetXml = function () {
			return this.signature.GetXml();
		};

		SignedXml.prototype.LoadXml = function (value) {
			this.signature = Signature$1.LoadXml(value);
		};
		SignedXml.prototype.toString = function () {
			var signature = this.XmlSignature;
			var enveloped = signature.SignedInfo.References && signature.SignedInfo.References.Some(function (r) {
				return r.Transforms && r.Transforms.Some(function (t) {
					return t instanceof XmlDsigEnvelopedSignatureTransform;
				});
			});
			if (enveloped) {
				var doc = this.document.documentElement.cloneNode(true);
				var node = this.XmlSignature.GetXml();
				if (!node) {
					throw new XmlError(XE.XML_EXCEPTION, "Cannot get Xml element from Signature");
				}
				var sig = node.cloneNode(true);
				doc.appendChild(sig);
				return new XMLSerializer().serializeToString(doc);
			}
			return this.XmlSignature.toString();
		};

		SignedXml.prototype.GetPublicKeys = function () {
			var _this = this;
			var keys = [];
			return Promise.resolve().then(function () {
				var pkEnumerator = _this.XmlSignature.KeyInfo.GetIterator();
				var promises = [];
				pkEnumerator.forEach(function (kic) {
					var alg = CryptoConfig.CreateSignatureAlgorithm(_this.XmlSignature.SignedInfo.SignatureMethod);
					if (kic instanceof KeyInfoX509Data) {
						kic.Certificates.forEach(function (cert) {
							promises.push(cert.exportKey(alg.algorithm).then(function (key) {
								keys.push(key);
							}));
						});
					} else {
						promises.push(kic.exportKey(alg.algorithm).then(function (key) {
							keys.push(key);
						}));
					}
				});
				return Promise.all(promises);
			}).then(function () {
				return keys;
			});
		};

		SignedXml.prototype.GetSignatureNamespaces = function () {
			var namespaces = {};
			if (this.XmlSignature.NamespaceURI) {
				namespaces[this.XmlSignature.Prefix || ""] = this.XmlSignature.NamespaceURI;
			}
			return namespaces;
		};

		SignedXml.prototype.CopyNamespaces = function (src, dst, ignoreDefault) {
			this.InjectNamespaces(SelectRootNamespaces(src), dst, ignoreDefault);
		};

		SignedXml.prototype.InjectNamespaces = function (namespaces, target, ignoreDefault) {
			for (var i in namespaces) {
				var uri = namespaces[i];
				if (ignoreDefault && i === "") {
					continue;
				}
				target.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
			}
		};
		SignedXml.prototype.DigestReference = function (doc, reference, checkHmac) {
			var _this = this;
			return Promise.resolve().then(function () {
				if (reference.Uri) {
					var objectName = void 0;
					if (!reference.Uri.indexOf("#xpointer")) {
						var uri = reference.Uri;
						uri = uri.substring(9).replace(/[\r\n\t\s]/g, "");
						if (uri.length < 2 || uri[0] !== "(" || uri[uri.length - 1] !== ")") {
							uri = "";
						} else {
							uri = uri.substring(1, uri.length - 1);
						}
						if (uri.length > 6 && uri.indexOf("id(") === 0 && uri[uri.length - 1] === ")") {
							objectName = uri.substring(4, uri.length - 2);
						}
					} else if (reference.Uri[0] === "#") {
						objectName = reference.Uri.substring(1);
					}
					if (objectName) {
						var found = null;
						var xmlSignatureObjects_2 = [_this.XmlSignature.KeyInfo.GetXml()];
						_this.XmlSignature.ObjectList.ForEach(function (object) {
							xmlSignatureObjects_2.push(object.GetXml());
						});
						for (var _i = 0, xmlSignatureObjects_1 = xmlSignatureObjects_2; _i < xmlSignatureObjects_1.length; _i++) {
							var xmlSignatureObject = xmlSignatureObjects_1[_i];
							if (xmlSignatureObject) {
								found = findById(xmlSignatureObject, objectName);
								if (found) {
									var el = found.cloneNode(true);

									_this.CopyNamespaces(doc, el, false);

									if (_this.Parent) {
										var parent = _this.Parent instanceof XmlObject ? _this.Parent.GetXml() : _this.Parent;
										_this.CopyNamespaces(parent, el, true);
									}
									_this.CopyNamespaces(found, el, false);
									_this.InjectNamespaces(_this.GetSignatureNamespaces(), el, true);
									doc = el;
									break;
								}
							}
						}
						if (!found && doc) {
							found = XmlObject.GetElementById(doc, objectName);
							if (found) {
								var el = found.cloneNode(true);
								_this.CopyNamespaces(found, el, false);
								_this.CopyNamespaces(doc, el, false);
								doc = el;
							}
						}
						if (found == null) {
							throw new XmlError(XE.CRYPTOGRAPHIC, "Cannot get object by reference: " + objectName);
						}
					}
				}
				var canonOutput = null;
				if (reference.Transforms && reference.Transforms.Count) {
					canonOutput = _this.ApplyTransforms(reference.Transforms, doc);
				} else {
					if (reference.Uri && reference.Uri[0] !== "#") {
						canonOutput = new XMLSerializer().serializeToString(doc.ownerDocument);
					} else {
						var excC14N = new XmlDsigC14NTransform();
						excC14N.LoadInnerXml(doc);
						canonOutput = excC14N.GetOutput();
					}
				}
				if (!reference.DigestMethod.Algorithm) {
					throw new XmlError(XE.NULL_PARAM, "Reference", "DigestMethod");
				}
				var digest = CryptoConfig.CreateHashAlgorithm(reference.DigestMethod.Algorithm);
				return digest.Digest(canonOutput);
			});
		};
		SignedXml.prototype.DigestReferences = function (data) {
			var _this = this;
			return Promise.resolve().then(function () {
				var promises = _this.XmlSignature.SignedInfo.References.Map(function (ref) {
					if (!ref.DigestMethod.Algorithm) {
						ref.DigestMethod.Algorithm = new Sha256().namespaceURI;
					}
					return _this.DigestReference(data, ref, false).then(function (hashValue) {
						ref.DigestValue = hashValue;
					});
				}).GetIterator();
				return Promise.all(promises);
			});
		};
		SignedXml.prototype.TransformSignedInfo = function (data) {
			var t = CryptoConfig.CreateFromName(this.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm);
			var xml = this.XmlSignature.SignedInfo.GetXml();
			if (!xml) {
				throw new XmlError(XE.XML_EXCEPTION, "Cannot get Xml element from SignedInfo");
			}
			var node = xml.cloneNode(true);

			this.CopyNamespaces(xml, node, false);
			if (data) {
				if (data.nodeType === XmlNodeType.Document) {
					this.CopyNamespaces(data.documentElement, node, false);
				} else {
					this.CopyNamespaces(data, node, false);
				}
			}
			if (this.Parent) {
				var parentXml = this.Parent instanceof XmlObject ? this.Parent.GetXml() : this.Parent;
				if (parentXml) {
					this.CopyNamespaces(parentXml, node, false);
				}
			}

			var childNamespaces = SelectNamespaces(xml);
			for (var i in childNamespaces) {
				var uri = childNamespaces[i];
				if (i === node.prefix) {
					continue;
				}
				node.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
			}
			t.LoadInnerXml(node);
			var res = t.GetOutput();
			return res;
		};
		SignedXml.prototype.ResolveFilterTransform = function (transform) {
			var split = transform.split(" ");
			if (split.length != 3) throw new XmlError(XE.CRYPTOGRAPHIC_TRANSFORM_FILTER, transform);
			var filterMethod = split[1].trim();
			var xPath = split[2].trim();
			return new XmlDsigDisplayFilterTransform({
				Filter: filterMethod,
				XPath: xPath
			});
		};
		SignedXml.prototype.ResolveTransform = function (transform) {
			switch (transform) {
				case "enveloped":
					return new XmlDsigEnvelopedSignatureTransform();
				case "c14n":
					return new XmlDsigC14NTransform();
				case "c14n-com":
					return new XmlDsigC14NWithCommentsTransform();
				case "exc-c14n":
					return new XmlDsigExcC14NTransform();
				case "exc-c14n-com":
					return new XmlDsigExcC14NWithCommentsTransform();
				case "base64":
					return new XmlDsigBase64Transform();
				default:
					throw new XmlError(XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, transform);
			}
		};
		SignedXml.prototype.ApplyTransforms = function (transforms, input) {
			var output = null;

			transforms.Sort(function (a, b) {
				if (a instanceof XmlDsigDisplayFilterTransform) {
					return -1;
				}
				if (b instanceof XmlDsigDisplayFilterTransform) {
					return 1;
				}

				if (b instanceof XmlDsigEnvelopedSignatureTransform) {
					return -1;
				}
				if (b instanceof XmlDsigEnvelopedSignatureTransform) {
					return 1;
				}
				return 0;
			}).ForEach(function (transform) {
				if (transform instanceof XmlDsigC14NWithCommentsTransform) {
					transform = new XmlDsigC14NTransform();
				}
				if (transform instanceof XmlDsigExcC14NWithCommentsTransform) {
					transform = new XmlDsigExcC14NTransform();
				}
				transform.LoadInnerXml(input);
				output = transform.GetOutput();
			});

			if (transforms.Count === 1 && transforms.Item(0) instanceof XmlDsigEnvelopedSignatureTransform) {
				var c14n = new XmlDsigC14NTransform();
				c14n.LoadInnerXml(input);
				output = c14n.GetOutput();
			}
			return output;
		};
		SignedXml.prototype.ApplySignOptions = function (signature, algorithm, key, options) {
			var _this = this;
			if (options === void 0) {
				options = {};
			}
			return Promise.resolve().then(function () {
				if (options.id) {
					_this.XmlSignature.Id = options.id;
				}

				if (options.keyValue && key.algorithm.name.toUpperCase() !== HMAC) {
					if (!signature.KeyInfo) {
						signature.KeyInfo = new KeyInfo();
					}
					var keyInfo = signature.KeyInfo;
					var keyValue = new KeyValue();
					keyInfo.Add(keyValue);
					return keyValue.importKey(options.keyValue);
				} else {
					return Promise.resolve();
				}
			}).then(function () {
				if (options.x509) {
					if (!signature.KeyInfo) {
						signature.KeyInfo = new KeyInfo();
					}
					var keyInfo_1 = signature.KeyInfo;
					options.x509.forEach(function (x509) {
						var raw = Convert.FromBase64(x509);
						var x509Data = new KeyInfoX509Data(raw);
						keyInfo_1.Add(x509Data);
					});
				}
				return Promise.resolve();
			}).then(function () {
				if (options.references) {
					options.references.forEach(function (item) {
						var reference = new Reference();

						if (item.id) {
							reference.Id = item.id;
						}

						if (item.uri !== null && item.uri !== undefined) {
							reference.Uri = item.uri;
						}

						if (item.type) {
							reference.Type = item.type;
						}

						var digestAlgorithm = CryptoConfig.GetHashAlgorithm(item.hash);
						reference.DigestMethod.Algorithm = digestAlgorithm.namespaceURI;

						if (item.transforms && item.transforms.length) {
							var transforms_1 = new Transforms();
							item.transforms.forEach(function (transform) {
								if (transform.startsWith("filter")) {
									transforms_1.Add(_this.ResolveFilterTransform(transform));
								} else {
									transforms_1.Add(_this.ResolveTransform(transform));
								}
							});
							reference.Transforms = transforms_1;
						}
						if (!signature.SignedInfo.References) {
							signature.SignedInfo.References = new References();
						}
						signature.SignedInfo.References.Add(reference);
					});
				}

				if (!signature.SignedInfo.References.Count) {
					var reference = new Reference();
					signature.SignedInfo.References.Add(reference);
				}
				return Promise.resolve();
			});
		};
		SignedXml.prototype.ValidateReferences = function (doc) {
			var _this = this;
			return Promise.resolve().then(function () {
				return Promise.all(_this.XmlSignature.SignedInfo.References.Map(function (ref) {
					return _this.DigestReference(doc, ref, false).then(function (digest) {
						var b64Digest = Convert.ToBase64(digest);
						var b64DigestValue = Convert.ToString(ref.DigestValue, "base64");
						if (b64Digest !== b64DigestValue) {
							var errText = "Invalid digest for uri '" + ref.Uri + "'. Calculated digest is " + b64Digest + " but the xml to validate supplies digest " + b64DigestValue;
							throw new XmlError(XE.CRYPTOGRAPHIC, errText);
						}
						return Promise.resolve(true);
					});
				}).GetIterator());
			}).then(function () {
				return true;
			});
		};
		SignedXml.prototype.ValidateSignatureValue = function (keys) {
			var _this = this;
			var signer;
			var signedInfoCanon;
			return Promise.resolve().then(function () {
				signedInfoCanon = _this.TransformSignedInfo(_this.document);
				signer = CryptoConfig.CreateSignatureAlgorithm(_this.XmlSignature.SignedInfo.SignatureMethod);

				var chain = Promise.resolve(false);
				keys.forEach(function (key) {
					chain = chain.then(function (v) {
						if (!v) {
							return signer.Verify(signedInfoCanon, key, _this.Signature);
						}
						return Promise.resolve(v);
					});
				});
				return chain;
			});
		};
		return SignedXml;
	}();
	function findById(element, id) {
		if (element.nodeType !== XmlNodeType.Element) {
			return null;
		}
		if (element.hasAttribute("Id") && element.getAttribute("Id") === id) {
			return element;
		}
		if (element.childNodes && element.childNodes.length) {
			for (var i = 0; i < element.childNodes.length; i++) {
				var el = findById(element.childNodes[i], id);
				if (el) {
					return el;
				}
			}
		}
		return null;
	}

	function addNamespace(selectedNodes, name, namespace) {
		if (!(name in selectedNodes)) {
			selectedNodes[name] = namespace;
		}
	}

	function _SelectRootNamespaces(node, selectedNodes) {
		if (selectedNodes === void 0) {
			selectedNodes = {};
		}
		if (node && node.nodeType === XmlNodeType.Element) {
			var el = node;
			if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace") {
				addNamespace(selectedNodes, el.prefix ? el.prefix : "", node.namespaceURI);
			}

			for (var i = 0; i < el.attributes.length; i++) {
				var attr = el.attributes.item(i);
				if (attr && attr.prefix === "xmlns") {
					addNamespace(selectedNodes, attr.localName ? attr.localName : "", attr.value);
				}
			}

			if (node.parentNode) {
				_SelectRootNamespaces(node.parentNode, selectedNodes);
			}
		}
	}
	function SelectRootNamespaces(node) {
		var attrs = {};
		_SelectRootNamespaces(node, attrs);
		return attrs;
	}

	exports.Select = Select;
	exports.Parse = Parse;
	exports.Stringify = Stringify;
	exports.Application = Application;
	exports.XmlCanonicalizer = XmlCanonicalizer;
	exports.CryptoConfig = CryptoConfig;
	exports.XmlSignature = XmlSignature;
	exports.XmlSignatureObject = XmlSignatureObject;
	exports.XmlSignatureCollection = XmlSignatureCollection;
	exports.CanonicalizationMethod = CanonicalizationMethod;
	exports.DataObject = DataObject;
	exports.DataObjects = DataObjects;
	exports.DigestMethod = DigestMethod;
	exports.KeyInfo = KeyInfo;
	exports.Reference = Reference;
	exports.References = References;
	exports.Signature = Signature$1;
	exports.SignatureMethodOther = SignatureMethodOther;
	exports.SignatureMethod = SignatureMethod;
	exports.SignedInfo = SignedInfo;
	exports.XmlDsigBase64Transform = XmlDsigBase64Transform;
	exports.XmlDsigC14NTransform = XmlDsigC14NTransform;
	exports.XmlDsigC14NWithCommentsTransform = XmlDsigC14NWithCommentsTransform;
	exports.XmlDsigEnvelopedSignatureTransform = XmlDsigEnvelopedSignatureTransform;
	exports.XmlDsigExcC14NTransform = XmlDsigExcC14NTransform;
	exports.XmlDsigExcC14NWithCommentsTransform = XmlDsigExcC14NWithCommentsTransform;
	exports.XmlDsigDisplayFilterTransform = XmlDsigDisplayFilterTransform;
	exports.Transform = Transform;
	exports.Transforms = Transforms;
	exports.X509Certificate = X509Certificate;
	exports.KeyInfoClause = KeyInfoClause;
	exports.KeyValue = KeyValue;
	exports.EcdsaPublicKey = EcdsaPublicKey;
	exports.NamedCurve = NamedCurve;
	exports.DomainParameters = DomainParameters;
	exports.EcdsaKeyValue = EcdsaKeyValue;
	exports.RsaKeyValue = RsaKeyValue;
	exports.MaskGenerationFunction = MaskGenerationFunction;
	exports.PssAlgorithmParams = PssAlgorithmParams;
	exports.X509IssuerSerial = X509IssuerSerial;
	exports.KeyInfoX509Data = KeyInfoX509Data;
	exports.SPKIData = SPKIData;
	exports.SelectRootNamespaces = SelectRootNamespaces;
	exports.SignedXml = SignedXml;

	Object.defineProperty(exports, '__esModule', { value: true });
});
