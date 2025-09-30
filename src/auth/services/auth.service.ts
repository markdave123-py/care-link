import { AppError, Patient } from "../../core";

export class AuthService {
    static findOrCreatePatientUser = async ({email, password, firstname, lastname}: { email: string, password: string, firstname: string, lastname: string,}) => {
        const existingPatientUser = await Patient.findOne({ where: { email }});
        
        if (existingPatientUser) {
            if (existingPatientUser.password) {
                throw new AppError("You already have an account. Please use your email and password", 401)
            }
            return existingPatientUser
        } else {
            await Patient.create({
                email,
                password,
                email_verified: false,
                firstname,
                lastname,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        }
    }
    // const existingHpUser = await HealthPractitioner.findOne({ where: { email }});
}