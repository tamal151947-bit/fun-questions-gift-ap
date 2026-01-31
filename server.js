const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

// MongoDB Connection
let db;
let submissionsCollection;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fun-questions';

async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        db = client.db();
        submissionsCollection = db.collection('submissions');
        console.log('✅ Connected to MongoDB successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Allow app to run without DB for local testing
        console.log('⚠️ Running without database connection');
    }
}

connectToDatabase();

// API Routes

// Save submission
app.post('/api/submit', async (req, res) => {
    try {
        const submissionData = {
            ...req.body,
            submittedAt: new Date(),
            ip: req.ip || req.connection.remoteAddress
        };

        if (submissionsCollection) {
            const result = await submissionsCollection.insertOne(submissionData);
            res.json({ 
                success: true, 
                message: 'Data saved successfully!',
                id: result.insertedId 
            });
        } else {
            // Fallback if DB not connected
            res.json({ 
                success: true, 
                message: 'Data received (DB not connected)' 
            });
        }
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error saving data' 
        });
    }
});

// Get all submissions (Admin endpoint)
app.get('/api/submissions', async (req, res) => {
    try {
        // Simple password protection
        const password = req.query.password;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Invalid password' 
            });
        }

        if (submissionsCollection) {
            const submissions = await submissionsCollection
                .find({})
                .sort({ submittedAt: -1 })
                .toArray();

            res.json({ 
                success: true, 
                count: submissions.length,
                data: submissions 
            });
        } else {
            res.json({ 
                success: false, 
                message: 'Database not connected' 
            });
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching data' 
        });
    }
});

// Delete submission (Admin endpoint)
app.delete('/api/submissions/:id', async (req, res) => {
    try {
        const password = req.query.password;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        if (submissionsCollection) {
            const result = await submissionsCollection.deleteOne({ 
                _id: new ObjectId(req.params.id) 
            });

            res.json({ 
                success: true, 
                message: 'Submission deleted',
                deletedCount: result.deletedCount
            });
        } else {
            res.json({ 
                success: false, 
                message: 'Database not connected' 
            });
        }
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting data' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: submissionsCollection ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Main App: http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
});
