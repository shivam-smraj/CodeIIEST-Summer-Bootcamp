import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IAnalytics extends Document {
  views: number;
  uniqueIpHashes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    views: { type: Number, default: 0 },
    uniqueIpHashes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Analytics: Model<IAnalytics> =
  (mongoose.models.Analytics as Model<IAnalytics>) ??
  mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
