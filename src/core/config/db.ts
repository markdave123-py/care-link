import { Sequelize } from 'sequelize';
import { env } from '../../auth/config';

export const sequelize = new Sequelize(env.POSTGRES_URI, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          require: true, // This ensures SSL is required
        }
      }
});

export default sequelize;