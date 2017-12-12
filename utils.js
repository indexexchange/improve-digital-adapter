'use strict';

/* utility method to get incremental integer starting from 1 */
var getIncrementalInteger = function () {
    var count = 0;
    return function () {
        count++;
        return count;
    };
}();

function _getUniqueIdentifierStr() {
    return getIncrementalInteger() + Math.random().toString(16).substr(2);
}

// generate a random string (to be used as a dynamic JSONP callback)
exports.getUniqueIdentifierStr = _getUniqueIdentifierStr;

var t_Arr = 'Array';
/**
 * Return if the object is of the
 * given type.
 * @param {*} object to test
 * @param {String} _t type string (e.g., Array)
 * @return {Boolean} if object is of type _t
 */
exports.isA = function (object, _t) {
    return Object.prototype.toString.call(object) === '[object ' + _t + ']';
};

exports.isArray = function (object) {
    return this.isA(object, t_Arr);
};