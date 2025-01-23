const express = require('express');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
    console.log('Created downloads directory at:', downloadsDir);
}

app.post('/convert', async (req, res) => {
    console.log('Received request body:', req.body);
    const { url } = req.body;

    if (!url) {
        console.log('Invalid URL received:', url);
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        console.log('Getting video info for:', url);
        
        // Generate a unique filename
        const timestamp = Date.now();
        const outputPath = path.join(downloadsDir, `audio_${timestamp}.mp3`);

        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath
        });

        console.log('Download complete:', outputPath);
        
        res.json({
            success: true,
            downloadPath: `http://localhost:3001/download/audio_${timestamp}.mp3`
        });

    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadsDir, filename);
    console.log('Download requested for:', filePath);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to download the file' });
                }
            }
            // Delete file after download
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        });
    } else {
        console.log('File not found:', filePath);
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});