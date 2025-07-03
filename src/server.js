// Express server of API
const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dbClient = require('./utils/db').dbClient;
const configSession = require('./middleware/session');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for file uploads
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(configSession.configSession);
app.use('/api/v1', authRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.json({message: 'Heard and responded'});
});

async function startServer() {
    try {
        await dbClient.connect();
        app.listen(PORT, () => {
            console.log(`API listening on port ${PORT}`,
                        '\n========== ==========');
        });
    } catch (err) {
        console.log(`Error starting server: ${err.message}`);
    }
};

startServer();