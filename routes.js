"use strict";

const config = require("./config.json");

const app = require("./index.js").app;
const passport = require("./index.js").passport;
const Router = require("koa-router");

const routes = new Router();

const main = require("./controllers/main.js");
const account = require("./controllers/account.js");
const admin = require("./controllers/admin.js");
const mobile = require("./controllers/mobile.js");

// routes

routes.get("/", main.index);

// for passport
routes.get("/login", account.login);
routes.get("/logout", account.logout);
routes.get("/account", account.index);
routes.all("/test", account.test);
routes.all("/mobile", mobile.index);
routes.all("/admin", admin.index);
routes.all("/admin/manage", admin.manage);
routes.all("/admin/populate", admin.populate);
routes.get("/applicants", admin.getApplicants);
routes.all("/applicant/create", admin.createApplicant);
routes.all("/applicant/update", admin.updateApplicant);
routes.all("/mobile/applicants", mobile.viewApplicants);

// you can add as many strategies as you want
routes.get("/auth/github",
	passport.authenticate("github")
);

routes.get('/auth/local', passport.authenticate('local-login', {
     successRedirect : '/admin', // redirect to the secure profile section
     failureRedirect : '/admin/manage', // redirect back to the signup page if there is an error
     failureFlash : true // allow flash messages
 }));

routes.get("/auth/github/callback",
	passport.authenticate("github", {
		successRedirect: "/account",
		failureRedirect: "/"
	})
);

app.use(routes.middleware());
