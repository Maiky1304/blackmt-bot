import {Document, model, Schema} from 'mongoose';

export interface Variable extends Document {
    key: string,
    value: string
}

const VariableSchema: Schema = new Schema<Variable>({
    key: { type: String, required: true },
    value: { type: String, required: true }
});

export const VariableModel = model<Variable>('variables', VariableSchema);