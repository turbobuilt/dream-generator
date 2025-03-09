"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbObject = void 0;
var mysql_1 = require("mysql");
var db = mysql_1.default.createConnection({
    host: "127.0.0.1",
});
var DbObject = /** @class */ (function () {
    function DbObject(input) {
        if (typeof input === "number" || typeof input === "string") {
            this.get(parseInt(input));
        }
        else if (typeof input === "object") {
            Object.assign(this, input);
        }
    }
    DbObject.prototype.save = function () {
        if (this.id) {
            return this.update();
        }
        else {
            return this.insert();
        }
    };
    DbObject.getAll = function (page, perPage) {
        var _this = this;
        if (page === void 0) { page = 0; }
        page = parseInt(page);
        perPage = parseInt(perPage) || null;
        var query = "SELECT * FROM ".concat(this.constructor.name, " ORDER BY created");
        if (page && perPage) {
            query += " LIMIT ?, ?";
        }
        return new Promise(function (resolve, reject) {
            db.query(query, [page * perPage, perPage], function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ items: result.map(function (row) { return new _this(row); }) });
                }
            });
        });
    };
    DbObject.prototype.get = function (id) {
        var _this = this;
        var query = "SELECT * FROM ".concat(this.constructor.name, " WHERE id = ?");
        return new Promise(function (resolve, reject) {
            db.query(query, [id], function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    Object.assign(_this, result[0]);
                    resolve(_this);
                }
            });
        });
    };
    DbObject.prototype.update = function (updatedBy) {
        var _this = this;
        var keys = Object.keys(this);
        var values = Object.values(this);
        var now = Date.now();
        this.updated = now;
        this.updatedBy = updatedBy;
        var query = "UPDATE ".concat(this.constructor.name, " SET ").concat(keys.map(function (key) { return key + " = ?"; }).join(", "), " WHERE id = ?");
        return new Promise(function (resolve, reject) {
            db.query(query, __spreadArray(__spreadArray([], values, true), [_this.id], false), function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(_this);
                }
            });
        });
    };
    DbObject.prototype.delete = function () {
        var _this = this;
        var query = "DELETE FROM ".concat(this.constructor.name, " WHERE id = ?");
        return new Promise(function (resolve, reject) {
            db.query(query, [_this.id], function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    DbObject.prototype.insert = function (createdBy) {
        var obj = this;
        var keys = Object.keys(obj);
        var values = Object.values(obj);
        var placeholders = values.map(function () { return "?"; });
        var now = Date.now();
        obj.created = now;
        obj.updated = now;
        obj.createdBy = createdBy;
        obj.updatedBy = createdBy;
        var query = "INSERT INTO ".concat(this.constructor.name, " (").concat(keys.join(", "), ") VALUES (").concat(placeholders.join(", "), ")");
        return new Promise(function (resolve, reject) {
            db.query(query, values, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    obj.id = result.insertId;
                    resolve(obj);
                }
            });
        });
    };
    return DbObject;
}());
exports.DbObject = DbObject;
