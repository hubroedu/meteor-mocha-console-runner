import {describe, it } from "meteor/hubroedu:mocha"
import {expect} from "chai"

describe("Server Test", function(){

  it("this test is server side only", function(){
    expect(Meteor.isServer).to.be.true
    expect(Meteor.isClient).to.be.false
  })
});
