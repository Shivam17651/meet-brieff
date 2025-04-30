require('dotenv').config();
const express = require('express');
const userRouter = require('./routers/userRouter');
const meetingRouter = require('./routers/meetingRouter');
const transcriptRouter = require('./routers/transcriptRouter');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 5000;

app.use(cors({
    origin: '*'
}));

app.use(express.json({
    limit: '50mb' // Increased limit for large transcripts
}));

app.use('/user', userRouter);
app.use('/meetings', meetingRouter);
app.use('/transcripts', transcriptRouter);

app.get('/', (req, res) => {
    res.send('MeetSummary API - Automatic meeting transcript summarization');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

