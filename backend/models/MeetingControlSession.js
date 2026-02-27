const mongoose = require('mongoose');

const meetingControlSessionSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, index: true },
    hostUserId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    hostDeviceId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

meetingControlSessionSchema.index({ meetingId: 1, isActive: 1 });

module.exports = mongoose.model('MeetingControlSession', meetingControlSessionSchema);
