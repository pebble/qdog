'use strict';

var assert = require('assert');
var expect = require('expect');
var PushQueue = require('../../main.js');


describe('PushQueue', function(){
  describe('#post()', function(){
    it('should throw if JSON serializable things are not supplied', function(){
      [ 1234
      , 'some string'
      , null
      , function(){}
      ].forEach(function(badvalue){
        assert.throws(function(){
          PushQueue.post(badvalue);
        });
      });
    });

    it('should not throw if JSON serializable things are supplied', function(){
      ['{ "good": "strings" }'
      , {good: "object"}
      , ["strings", "in array"]
      , '["string", "array"]'
      ].forEach(function(goodvalue){
        assert.doesNotThrow(function(){
          PushQueue.post(goodvalue);
        });
      });
    });

  });
});
