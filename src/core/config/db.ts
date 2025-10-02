import { Sequelize } from 'sequelize';
import { env } from '../../auth/config';

const isProduction = process.env.NODE_ENV === 'production';
// const isLocalDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

export const sequelize = new Sequelize(env.POSTGRES_URI, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
        ssl: isProduction ? {
            require: true,
            rejectUnauthorized: false
        } : false // Disable SSL for local development
    }
});

export default sequelize;