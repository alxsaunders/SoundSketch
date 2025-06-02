const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Added CORS

const app = express();
const port = 3001;

// Path for storing temporary MP3 files
const downloadsDir = path.join(__dirname, 'downloads');

// Ensure the `downloads` folder exists
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
    console.log('Created downloads folder!');
}

// Middleware
app.use(cors()); // Added CORS middleware
app.use(express.json());

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[\/\\?%*:|"<>]/g, '') // Remove invalid characters
        .replace(/[🎵🎶🎤🎧🔥💯👑]/g, '') // Remove emojis
        .replace(/["'"]/g, '') // Remove quotes
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 80); // Limit length
}

// Endpoint to convert YouTube to MP3
app.post('/convert', async (req, res) => {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const videoInfo = await ytdl.getInfo(url);
        const title = sanitizeFilename(videoInfo.videoDetails.title); // Use sanitize function
        const timestamp = Date.now(); // Add timestamp for uniqueness
        const filename = `${title}_${timestamp}.mp3`; // Better filename format
        const outputPath = path.join(downloadsDir, filename);

        console.log('Converting:', videoInfo.videoDetails.title); // Log original title

        // Start converting to MP3
        const audioStream = ytdl(url, { quality: 'highestaudio' });
        const ffmpegProcess = ffmpeg(audioStream)
            .audioBitrate(128)
            .toFormat('mp3')
            .save(outputPath);

        ffmpegProcess.on('end', () => {
            console.log(`MP3 created: ${outputPath}`);
            res.json({ 
                success: true, 
                downloadPath: `http://localhost:3001/download/${filename}`, // Fixed: full URL
                title: videoInfo.videoDetails.title, // Send original title to frontend
                filename: filename
            });
        });

        ffmpegProcess.on('error', (err) => {
            console.error('Error during MP3 conversion:', err);
            res.status(500).json({ error: 'Failed to convert YouTube video to MP3' });
        });
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Endpoint to serve the MP3 file for download
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadsDir, filename);

    if (fs.existsSync(filePath)) {
        // Create a cleaner download name (remove timestamp and clean up)
        const cleanName = filename
            .replace(/_\d+\.mp3$/, '.mp3') // Remove timestamp
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim(); // Remove leading/trailing spaces
        
        console.log('Download filename:', cleanName); // Debug log
        
        // Set proper headers for download
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(cleanName)}`);
        res.setHeader('Content-Type', 'audio/mpeg');
        
        res.download(filePath, cleanName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to download the file' });
                }
            }

            // Delete the file after download to save space
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
                else console.log('File deleted after download:', filePath);
            });
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});