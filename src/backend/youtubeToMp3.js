const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Path for storing temporary MP3 files
const downloadsDir = path.join(__dirname, 'downloads');

// Ensure the `downloads` folder exists
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
    console.log('Created downloads folder!');
}

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to convert YouTube to MP3
app.post('/convert', async (req, res) => {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const videoInfo = await ytdl.getInfo(url);
        const title = videoInfo.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, ''); // Sanitize title
        const outputPath = path.join(downloadsDir, `${title}.mp3`);

        // Start converting to MP3
        const audioStream = ytdl(url, { quality: 'highestaudio' });
        const ffmpegProcess = ffmpeg(audioStream)
            .audioBitrate(128)
            .toFormat('mp3')
            .save(outputPath);

        ffmpegProcess.on('end', () => {
            console.log(`MP3 created: ${outputPath}`);
            res.json({ success: true, downloadPath: `/download/${path.basename(outputPath)}` });
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
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ error: 'Failed to download the file' });
            }

            // Optionally, delete the file after download to save space
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
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
