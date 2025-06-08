import Joi from "joi";

export const registerUserSchema = Joi.object({
    username: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    profilePicture: Joi.string().uri(),
    birthDate: Joi.date().required(),
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
})
//.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) will put that later for secure password