const mongoose = require("mongoose");

const sermonSchema = new mongoose.Schema(
  {
    title: String,
    videoId: { type: String, index: true },
    thumbnail: String,
    description: String,
    publishedAt: { type: Date, index: true },
    permalink: String,
    source: {
      type: String,
      enum: ["youtube", "facebook"],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ Compound index for pagination performance
sermonSchema.index({ source: 1, publishedAt: -1 });

module.exports = mongoose.model("Sermon", sermonSchema);
