import express from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import { roleAuthorization } from "../auth/auth"
import PatientController from '../controllers/patient.ctl';
import { check, validationResult } from 'express-validator';
import PhysioEvalController from '../controllers/physioEval.ctl';
import { specialtyAuthorization } from '../schemas/PhysicianSchema';
const router = express.Router();
const physioEvals = new PhysioEvalController();

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
 * Create a new patient evaluation
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    specialtyAuthorization(['PHYSIATRIST', 'PHYSIOTHERAPIST']),
    physioEvals.createPhysioEval
);


/**
 * Get a Patient's patient evaluations
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/:patientID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    specialtyAuthorization(['PHYSIATRIST', 'PHYSIOTHERAPIST']),
    physioEvals.listPhysioEvals
);


/**
 * Get a Patient's patient evaluations
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/eval/:physioEvalID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN', 'PATIENT']),
    specialtyAuthorization(['PHYSIATRIST', 'PHYSIOTHERAPIST']),
    physioEvals.getPhysioEval
);



export default router;