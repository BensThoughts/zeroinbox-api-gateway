process.env.NODE_ENV = 'test';

const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();

function greaterThanTw(num) {
  if (num > 20) return true;
  return false;
}

function Person(givenName, familyName) {
  this.givenName = givenName;
  this.familyName = familyName;
}

Person.prototype.getFullName = function() {
  return `${this.givenName} ${this.familyName}`;
};


describe('basic sinon tests', function() {
  it('should pass', (done) => {
      const greaterThanTw = sinon.stub().returns('something');
      greaterThanTw(0).should.eql('something');
      greaterThanTw(0).should.not.eql(false);
      const name = new Person('Michael', 'Herman');
      name.getFullName().should.eql('Michael Herman');
      sinon.stub(Person.prototype, 'getFullName').returns('John Doe');
      name.getFullName().should.eql('John Doe');
      done();
  })
})