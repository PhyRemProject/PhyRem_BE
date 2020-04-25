///////// User Routes
//  Here are the all the available functions related to User.
//  These functions are responsible for receiving and interpreting the incomming requests
//  and produce appropriate responses based on other system functions

import express from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import UserController from '../controllers/user.ctl';
import { UserInterface, UserLoginInterface } from '../schemas/UsersSchema';
const router = express.Router();
const users = new UserController();


/**
 * @typedef LoginInfo
 * @property {string} username
 * @property {string} password - This is a secret shh 🤫
 */

/**
 * @typedef UserInfo
 * @property {string} username
 * @property {string} password
 * @property {string} name
 * @property {string} role
 * @property {string} address
 * @property {string} email
 * @property {string} phone
 */

/**
 * Lists all users registered in the system
 * 
 * @route GET /
 * @group Users - The actions and informations related to the system's users
 * @operationId List all Users
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users
 * @returns {string}  500 - Unexpected error
 */
router.get("/", (req, res) => {
  // Get the list of available users from the controller
  users.listUsers()
    .then((data) => (res.status(200).send(data)))
    .catch((data) => (res.status(500).send(data)));
})


/**
 * Lists users of a specific role
 * 
 * @route GET /role/:role
 * @param {string} role - The role of users to retrieve
 * @group Users
 * @operationId List Users with Role
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users with role
 * @returns {string}  500 - Unexpected error
 */
router.get("/role/:role", (req, res) => {

  // Get the list of users with role from the controller
  users.listWithRole(req.params.role as string)
    .then((data) => (res.status(200).send(data)))
    .catch((data) => (res.status(500).send(data)));

})


/**
 * Creates a new user in the system
 * 
 * @route POST /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/create", passport.authenticate('signup', { session: false }), (req, res) => {

  //Review this method with clearer eyes
  res.status(200).json(req.user);

});


/**
 * Creates a new user in the system
 * 
 * @route POST /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/login", (req, res, next) => {

  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user)
        return res.status(500).send("An error occured");

      // Custom callback, login func at auth.ts
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)
        
        const body = { 
          _id: user._id,
          username: user.username
        };

        const token = jwt.sign({
          user: body
        }, process.env.JWT_SECRET as string);

        return res.status(200).json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);

});



module.exports = router;