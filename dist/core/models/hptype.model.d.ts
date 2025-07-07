import { Model } from 'sequelize';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
export declare class HPType extends Model<InferAttributes<HPType>, InferCreationAttributes<HPType>> {
    id: CreationOptional<string>;
    name: string;
    embedding: number[] | null;
}
