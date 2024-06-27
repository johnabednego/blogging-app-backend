import { Schema, model, Document } from 'mongoose';

interface IComment extends Document {
  content: string;
  author: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
}, { timestamps: true });

export const Comment = model<IComment>('Comment', commentSchema);
