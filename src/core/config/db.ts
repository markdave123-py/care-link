import { Sequelize } from 'sequelize';
import { env } from '../../auth/config';

export const sequelize = new Sequelize(env.POSTGRES_URI);

export default sequelize;