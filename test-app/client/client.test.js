import {describe, it} from "meteor/hubroedu:mocha"
import {expect} from "chai"

describe("Client Test", function(){

  it("this test is client side only", function(){
    expect(Meteor.isClient).to.be.true
    expect(Meteor.isServer).to.be.false
  })
});
