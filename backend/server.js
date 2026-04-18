const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI;

  // 1. Validate URI
  const isValidUri = mongoUri && 
                     (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) &&
                     !mongoUri.includes('<db_password>');

  if (!isValidUri) {
    console.warn('⚠️  WARNING: Invalid or missing MONGO_URI in .env file.');
    if (mongoUri && mongoUri.includes('<db_password>')) {
      console.warn('   Detected placeholder "<db_password>". Please replace it with your actual password.');
    }
    console.log('   Falling back to In-Memory Database for development...');
    return startInMemoryDB();
  }

  try {
    // 2. Try connecting to the provided URI
    console.log('Attempting to connect to MongoDB Atlas/Local...');
    
    // Increase timeout to 10s to avoid premature timeouts on slow connections
    await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 5000 // 5 seconds
    });
    
    console.log('✅ MongoDB Connected to provided URI');
    
    // Check/Seed data even on real DB connection
    await seedData();
  } catch (err) {
    console.error('❌ Connection to provided MongoDB URI failed.');
    console.error(`   Error: ${err.message}`);
    
    // 3. Fallback logic
    if (!isProduction) {
      console.log('🔄 Starting In-Memory MongoDB instance as fallback...');
      await startInMemoryDB();
    } else {
      console.error('   Running in PRODUCTION mode. Exiting process.');
      process.exit(1);
    }
  }
};

const startInMemoryDB = async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log(`📦 In-Memory MongoDB URI: ${uri}`);
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected to In-Memory Server');
    
    // Seed data if using in-memory
    await seedData();
  } catch (memErr) {
    console.error('❌ Failed to start In-Memory MongoDB:', memErr);
  }
};

const seedData = async () => {
  const Event = require('./models/Event');
  const count = await Event.countDocuments();
  if (count === 0) {
    console.log('🌱 Seeding initial events...');
    await Event.create([
      {
        title: "Tech Symposium 2026",
        date: new Date("2026-03-15"),
        venue: "Main Auditorium",
        description: "Annual technology symposium featuring keynote speakers.",
        status: "Upcoming",
        category: "Academic"
      },
      {
        title: "Spring Music Festival",
        date: new Date("2026-04-10"),
        venue: "University Green",
        description: "A celebration of music and arts.",
        status: "Upcoming",
        category: "Entertainment"
      }
    ]);
    console.log('   Events seeded.');
  }
};

connectDB();

// Routes
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/forms', require('./routes/formRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.get("/", (req, res) => res.send("🚀 Backend is running successfully"));

