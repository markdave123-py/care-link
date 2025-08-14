import * as Joi from "joi";

export const registerPatientSchema = Joi.object({
    firstname: Joi.string().min(3).max(25).required(),
    lastname: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    // profile_picture: Joi.string().uri(),
    // date_of_birth: Joi.date().required(),
    // phone_number: Joi.string().required(),
    // address: Joi.string().required(),
    // allergies: Joi.array().items(Joi.string()).required(),
    // emergency_contact: Joi.string().required(),
    // bio: Joi.string().required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
});
//.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) will put that later for secure password

export const registerHpSchema = Joi.object({
    firstname: Joi.string().min(3).max(25).required(),
    lastname: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    hp_type_id: Joi.string().min(6).max(100).required(),
});

export const hpTypeSchema = Joi.object({
    profession: Joi.string().min(3).max(50).required(),
})