"use strict";

const config = require("../config.json");

let user = null;

module.exports.login = function* login() {
	if (this.isAuthenticated()) {
		user = this.session.passport.user;
	}
	yield this.render("login", {
		user: user
	});
};

module.exports.logout = function* logout() {
	this.logout();
	yield this.redirect("/");
};

module.exports.index = function* index() {
  if(this.passport.user != null){
    yield this.render("mobile", {title: config.site.name, user: JSON.stringify(user, null, 2), layout: "other.hbs"});
  } else {
    this.redirect('/login');
  }
};

module.exports.viewApplicants = function* viewApplicants() {
  if(this.passport.user != null){
    yield this.render("mobile-applicants", {title: config.site.name, user: JSON.stringify(user, null, 2)});  
  } else {
    this.redirect('/login');
  }
}
