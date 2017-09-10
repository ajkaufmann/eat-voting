"use strict";

const config = require("../config.json");
const db = require("../db.js");
const Applicant = db.model("Applicant");

let user = null;

module.exports.index = function* index() {
  if(this.passport.user.isAdmin) {
    yield this.render("admin", {title: config.site.name, name: this.query.name, id: this.query.id});
  } else {
    this.redirect('/mobile');
  }
};

module.exports.manage = function* manage() {
  if(this.passport.user.isAdmin) {
    yield this.render("manage", {title: config.site.name});
  } else {
    this.redirect('/login');
  }
};

module.exports.populate = function* populate() {
  if(this.passport.user.isAdmin) {
    yield this.render("populate", {title: config.site.name});
  } else {
      this.redirect('/login');
  }
};

module.exports.getApplicants = function* getApplicants() {
  if(this.passport.user != null) {
    var applicants = yield Applicant.findAll({
      where: {},
      order: [
        ['numYes', 'DESC']
      ]
    });
    this.response.status = 201;
    this.response.body = {
      applicants: applicants
    };
  }
};

module.exports.createApplicant = function* createApplicant(data) {
  if(this.passport.user.isAdmin) {
    var _applicant = this.request.body;
    var applicant = yield Applicant.create({
      firstName: _applicant.firstName,
      lastName: _applicant.lastName
    });
    this.response.body = {
      applicant: applicant
    };
  } else {
    this.response.status = 401;
  }
  
};

module.exports.updateApplicant = function* updateApplicant(data) {
  var data = this.request.body;
  var applicant = null;
  if(this.passport.user.isAdmin) {
    applicant = yield Applicant.findById(data.id);
    if (applicant == null){
      var _name = data.name.split(" ");
      console.log(_name[0]);
      applicant = yield Applicant.find({
        where: {
          firstName: _name[0],
          lastName: _name[1],
          isAnchored: false
        }
      });
    }
    if (applicant == null){
      this.response.status = 400;
      this.response.body = {
        message: "Could not find a valid applicant with the name " + data.name
      };
      return;
    }
    if (data.numYes != null) {
      applicant.numYes = data.numYes;
    }
    if (data.numNo != null) {
      applicant.numNo = data.numNo;
    }
    if (data.isAnchored != null) {
      applicant.isAnchored = data.isAnchored;
    }
    yield applicant.save();
    this.response.body = {
      applicant: applicant
    };
  }
  else {
    this.response.status = 401;
  }
  
};

