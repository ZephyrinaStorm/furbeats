const fs = require("fs");
const path = require("path");

class JsonStore {
  constructor({ name, dataDir }) {
    this._name = name;
    this._dir = dataDir || path.join(process.cwd(), "data");
    this._file = path.join(this._dir, `${name}.json`);
    this._data = {};
    this._load();
  }

  _load() {
    try {
      if (!fs.existsSync(this._dir)) fs.mkdirSync(this._dir, { recursive: true });
      if (fs.existsSync(this._file)) {
        this._data = JSON.parse(fs.readFileSync(this._file, "utf8"));
      }
    } catch {}
  }

  _save() {
    try {
      fs.writeFileSync(this._file, JSON.stringify(this._data, null, 2));
    } catch {}
  }

  ensure(key, defaultValue) {
    if (!this._data[key]) {
      this._data[key] = JSON.parse(JSON.stringify(defaultValue));
      this._save();
    }
    return this._data[key];
  }

  get(key, prop) {
    const val = this._data[key];
    if (prop !== undefined && val !== undefined) return val[prop];
    return val;
  }

  set(key, value, prop) {
    if (prop !== undefined) {
      if (!this._data[key]) this._data[key] = {};
      this._data[key][prop] = value;
    } else {
      this._data[key] = value;
    }
    this._save();
    return this;
  }

  has(key) {
    return key in this._data;
  }

  delete(key) {
    delete this._data[key];
    this._save();
  }
}

module.exports = JsonStore;
