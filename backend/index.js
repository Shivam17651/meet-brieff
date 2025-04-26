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

<<<<<<< HEAD
}))
app.use (express.json());
app.use('/user',userRouter);
=======
app.use(express.json({
    limit: '50mb' // Increased limit for large transcripts
}));
>>>>>>> b2a3d725f398e7c7ca40919893c3774f605c85a6

app.use('/users', userRouter);
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