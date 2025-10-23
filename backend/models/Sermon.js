const mongoose = require("mongoose");

const sermonSchema = new mongoose.Schema(
  {
    title: String,
    videoId: String,
    thumbnail: String,
    description: String,
    publishedAt: Date,
    permalink: String,
    source: {
      type: String,
      enum: ["youtube", "facebook"],
      required: true,
    },
  },
  { timestamps: true }
);

sermonSchema.index({ publishedAt: -1 });
sermonSchema.index({ source: 1 });

module.exports = mongoose.model("Sermon", sermonSchema);
