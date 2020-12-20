//
// File
//
// http://www.w3.org/TR/FileAPI/#dfn-file
// https://developer.mozilla.org/en/DOM/File
(function () {
  "use strict";

  var fs = require("fs"),
    path = require("path"),
    mime = require("mime");

  // string
  // stream
  // buffer
  function File(input) {
    var self = this;

    function updateStat(stat) {
      self.stat = stat;
      self.lastModifiedDate = self.stat.mtime;
      self.size = self.stat.size;
    }

    if ('string' === typeof input) {
      self.path = input;
    } else if (arguments.length > 1) {
      // bits
      // name
      // options
      let bits = arguments[0];
      if (bits instanceof Array) {
        self.buffer = Buffer.concat(bits.map(x => Buffer.from(x)));
      } else if (bits instanceof Buffer) {
        self.buffer = bits;
      } else {
        throw new Error('Invalid bits argument.');
      }

      self.name = arguments[1];

      if (arguments.length > 2) {
        let options = arguments[2];
        if (options instanceof Object) {
          self.type = arguments[2].type;
          self.lastModifiedDate = arguments[2].lastModified
            || Math.floor(Date.now() / 1000);
        }
      }
    } else {
      Object.keys(input).forEach(function (k) {
        self[k] = input[k];
      });
    }

    self.name = self.name || path.basename(self.path||'');
    if (!self.name) {
      throw new Error("No name");
    }
    self.type = self.type || mime.getType(self.name);

    if (!self.path) {
      if (self.buffer) {
        self.size = self.buffer.length;
      } else if (!self.stream) {
        throw new Error('No input, nor stream, nor buffer.');
      }
      return;
    }

    if (!self.jsdom) {
      return;
    }

    if (!self.async) {
      updateStat(fs.statSync(self.path));
    } else {
      fs.stat(self.path, function (err, stat) {
        updateStat(stat);
      });
    }
  }

  module.exports = File;
}());
