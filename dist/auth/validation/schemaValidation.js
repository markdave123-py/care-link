"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hpTypeSchema = exports.registerHpSchema = exports.loginSchema = exports.registerPatientSchema = void 0;
const Joi = require("joi");
exports.registerPatientSchema = Joi.object({
    firstname: Joi.string().min(3).max(25).required(),
    lastname: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
});
exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
});
exports.registerHpSchema = Joi.object({
    firstname: Joi.string().min(3).max(25).required(),
    lastname: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    hp_type_id: Joi.string().min(6).max(100).required(),
});
exports.hpTypeSchema = Joi.object({
    profession: Joi.string().min(3).max(50).required(),
});
//# sourceMappingURL=schemaValidation.js.map