import { Sequelize } from 'sequelize';
import { env } from '../config';

const sequelize = new Sequelize(env.POSTGRES_URI);

const connecToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
connecToDb();

export default sequelize;