// server.js
const express = require("express");
const multer = require("multer");
const { MongoClient, GridFSBucket } = require("mongodb");
const { Readable } = require("stream");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT;
app.use(cors());

// MongoDB configuration
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB and set up GridFS bucket and file metadata collection
let db, bucket, metadataCollection;
client
  .connect()
  .then(() => {
    db = client.db();
    bucket = new GridFSBucket(db);
    metadataCollection = db.collection("fileMetadata"); // Create or get the metadata collection
    console.log("Connected to MongoDB");
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];

    // Loop through each uploaded file
    for (const file of req.files) {
      const readableStream = Readable.from(file.buffer);

      // Upload file to GridFS
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      readableStream.pipe(uploadStream);

      // Wait for the file to finish uploading to GridFS
      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
      });

      // Save file metadata to the collection
      const metadata = {
        filename: file.originalname,
        contentType: file.mimetype,
        uploadDate: new Date(),
        originalFilename: file.originalname,
      };
      await metadataCollection.insertOne(metadata);

      uploadedFiles.push(metadata);
    }

    res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
});

app.get("/api/files", async (req, res) => {
  try {
    const files = await metadataCollection.find({}).toArray();
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    res.status(500).json({ error: "Error fetching file metadata" });
  }
});

// Endpoint to download a specific file by filename
app.get("/api/files/:filename", async (req, res) => {
  try {
    const file = await metadataCollection.findOne({
      filename: req.params.filename,
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`
    );

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
