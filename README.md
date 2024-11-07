# File Upload API with MongoDB GridFS

This backend API, built with Node.js and Express, enables file uploads to a MongoDB database using GridFS. It supports multiple file uploads, stores metadata for each file, and allows retrieval of file metadata.

## Features
- **Multiple File Uploads**: Users can upload multiple files in a single request.
- **GridFS Storage**: Files are stored in MongoDB's GridFS, enabling efficient handling of large files.
- **Metadata Storage**: Metadata for each uploaded file (like filename, content type, and upload date) is stored in a MongoDB collection.
- **File Metadata Retrieval**: An endpoint is available to retrieve metadata for all uploaded files.

## Project Structure

- **server.js**: The main server file containing API routes and MongoDB configurations.
- **.env**: Stores environment variables like MongoDB credentials.
- **uploads folder**: GridFS within MongoDB is used for storage, eliminating the need for a local uploads folder.
  ## [Live-Site-Link](https://jade-tanuki-6bb9d7.netlify.app/)
## Prerequisites
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
- MongoDB connection credentials (MongoDB Atlas recommended).

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/backend-file-upload.git
cd backend-file-upload
