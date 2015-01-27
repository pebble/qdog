'use strict';

var assert = require('assert');
var expect = require('expect');
var PushQueue = require('../../main.js');


describe('PushQueue', function(){
  describe('#post()', function(){
    it('should publish an item to the SQS queue', function(done){
    assert.doesNotThrow(function(){
      PushQueue.post({test: "things"})
        .then(function(data){
          expect(data)
          done();
        });
      });
    });
  });

  describe('#receive()', function(){
    it('should receive the item from the queue', function(done){
    assert.doesNotThrow(function(){
      PushQueue.post({test: "things"})
        .then(function(data){
          expect(data)
          done();
        });
      });
    });
  });

});
