import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Terminal, Database, FolderOpen, Code, Rocket, ChevronDown, ChevronRight } from 'lucide-react';

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-bg-dark">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-surface/50 border-b border-border">
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">{lang}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-text-secondary font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-5 text-left hover:bg-bg-surface/30 transition-colors">
        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-text-primary flex-1">{title}</h3>
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

export default function SetupGuidePage() {
  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Link to="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl tracking-wide text-text-primary mb-3">DEVELOPER SETUP GUIDE</h1>
        <p className="text-text-secondary text-sm mb-2">Run CineBook locally in VS Code with MongoDB instead of Supabase</p>
        <div className="flex items-center gap-2 mb-8">
          <span className="px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded-full border border-accent/30">Vite + React + TypeScript</span>
          <span className="px-2 py-0.5 text-[10px] bg-success/10 text-success rounded-full border border-success/30">MongoDB</span>
          <span className="px-2 py-0.5 text-[10px] bg-blue-400/10 text-blue-400 rounded-full border border-blue-400/30">Express.js</span>
        </div>

        <div className="space-y-4">

          {/* Step 1 */}
          <Section title="STEP 1 — PREREQUISITES" icon={Terminal} defaultOpen={true}>
            <p className="text-text-secondary text-sm">Make sure you have these installed:</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><span className="text-accent mt-0.5">•</span><span><strong className="text-text-primary">Node.js 18+</strong> — <a href="https://nodejs.org" target="_blank" className="text-accent hover:underline">nodejs.org</a></span></li>
              <li className="flex items-start gap-2"><span className="text-accent mt-0.5">•</span><span><strong className="text-text-primary">MongoDB</strong> — <a href="https://www.mongodb.com/try/download/community" target="_blank" className="text-accent hover:underline">Download Community</a> or use <a href="https://www.mongodb.com/atlas" target="_blank" className="text-accent hover:underline">MongoDB Atlas</a> (free cloud)</span></li>
              <li className="flex items-start gap-2"><span className="text-accent mt-0.5">•</span><span><strong className="text-text-primary">VS Code</strong> — <a href="https://code.visualstudio.com" target="_blank" className="text-accent hover:underline">code.visualstudio.com</a></span></li>
              <li className="flex items-start gap-2"><span className="text-accent mt-0.5">•</span><span><strong className="text-text-primary">Git</strong> — <a href="https://git-scm.com" target="_blank" className="text-accent hover:underline">git-scm.com</a></span></li>
            </ul>
          </Section>

          {/* Step 2 */}
          <Section title="STEP 2 — PROJECT SETUP" icon={FolderOpen}>
            <p className="text-text-secondary text-sm">Create a new project and install dependencies:</p>
            <CodeBlock code={`# Create project
npm create vite@latest cinebook -- --template react-ts
cd cinebook

# Install frontend dependencies
npm install react-router-dom framer-motion lucide-react
npm install -D tailwindcss @tailwindcss/vite

# Install backend dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer
npm install -D nodemon concurrently @types/express`} />
            <p className="text-text-secondary text-sm mt-3">Your folder structure will be:</p>
            <CodeBlock lang="text" code={`cinebook/
├── server/              ← NEW: Express backend
│   ├── models/          ← Mongoose schemas
│   │   ├── Movie.js
│   │   ├── Showtime.js
│   │   ├── Booking.js
│   │   └── User.js
│   ├── routes/          ← API routes
│   │   ├── movies.js
│   │   ├── showtimes.js
│   │   ├── bookings.js
│   │   ├── auth.js
│   │   └── upload.js
│   ├── middleware/
│   │   └── auth.js      ← JWT middleware
│   └── index.js         ← Express entry point
├── src/                 ← React frontend (same as current)
│   ├── components/
│   ├── pages/
│   └── lib/
├── .env
└── package.json`} />
          </Section>

          {/* Step 3 */}
          <Section title="STEP 3 — MONGODB MODELS (MONGOOSE)" icon={Database}>
            <p className="text-text-secondary text-sm">Replace Supabase tables with Mongoose schemas. Create these files:</p>

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/models/Movie.js</p>
            <CodeBlock lang="javascript" code={`const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  genre:            { type: String, required: true },
  rating:           { type: Number, required: true },
  duration_minutes: { type: Number, required: true },
  description:      { type: String },
  poster_url:       { type: String },
  release_year:     { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/models/Showtime.js</p>
            <CodeBlock lang="javascript" code={`const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater:         { type: String, required: true },
  date:            { type: String, required: true },
  time:            { type: String, required: true },
  price:           { type: Number, required: true },
  available_seats: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/models/Booking.js</p>
            <CodeBlock lang="javascript" code={`const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  movie_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  showtime_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer_name:  { type: String, required: true },
  customer_email: { type: String, required: true },
  seats:          { type: Number, required: true },
  seat_labels:    { type: String, default: '' },
  total_price:    { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/models/User.js</p>
            <CodeBlock lang="javascript" code={`const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);`} />
          </Section>

          {/* Step 4 */}
          <Section title="STEP 4 — EXPRESS SERVER + ROUTES" icon={Code}>
            <p className="text-text-secondary text-sm">Create the Express backend that replaces Vercel serverless functions:</p>

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/index.js</p>
            <CodeBlock lang="javascript" code={`require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// API Routes
app.use('http://localhost:5000/api/auth',      require('./routes/auth'));
app.use('http://localhost:5000/api/movies',    require('./routes/movies'));
app.use('http://localhost:5000/api/showtimes', require('./routes/showtimes'));
app.use('http://localhost:5000/api/bookings',  require('./routes/bookings'));
app.use('http://localhost:5000/api/upload',    require('./routes/upload'));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(
  \`🎬 CineBook server running on http://localhost:\${PORT}\`
));`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/middleware/auth.js</p>
            <CodeBlock lang="javascript" code={`const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin only' });
  next();
};

module.exports = { auth, adminOnly };`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/routes/movies.js — Example route</p>
            <CodeBlock lang="javascript" code={`const router = require('express').Router();
const Movie = require('../models/Movie');
const { auth, adminOnly } = require('../middleware/auth');

// GET all movies (public)
router.get('/', async (req, res) => {
  const { id, genre } = req.query;
  if (id) {
    const movie = await Movie.findById(id);
    return res.json(movie);
  }
  let query = {};
  if (genre && genre !== 'All') query.genre = genre;
  const movies = await Movie.find(query).sort({ rating: -1 });
  res.json(movies);
});

// POST create movie (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
});

// PUT update movie (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  );
  res.json(movie);
});

// DELETE movie (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">server/routes/bookings.js — With seat tracking</p>
            <CodeBlock lang="javascript" code={`const router = require('express').Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { auth } = require('../middleware/auth');

// GET booked seats for a showtime (public)
router.get('/seats/:showtimeId', async (req, res) => {
  const bookings = await Booking.find(
    { showtime_id: req.params.showtimeId },
    'seat_labels'
  );
  const allSeats = bookings
    .flatMap(b => b.seat_labels?.split(',').map(s => s.trim()) || []);
  res.json({ booked_seats: allSeats });
});

// POST create booking (auth required)
router.post('/', auth, async (req, res) => {
  const { movie_id, showtime_id, customer_name,
          customer_email, seats, total_price, seat_labels } = req.body;

  const showtime = await Showtime.findById(showtime_id);
  if (showtime.available_seats < seats)
    return res.status(400).json({ error: 'Not enough seats' });

  const booking = await Booking.create({
    movie_id, showtime_id, customer_name,
    customer_email, seats, total_price,
    seat_labels: seat_labels || '',
    user_id: req.user._id,
  });

  showtime.available_seats -= seats;
  await showtime.save();

  // Populate movie info for response
  await booking.populate('movie_id', 'title poster_url genre');
  await booking.populate('showtime_id', 'theater date time price');

  res.status(201).json(booking);
});

// GET user's bookings
router.get('/', auth, async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user._id })
    .populate('movie_id', 'title poster_url genre')
    .populate('showtime_id', 'theater date time price')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

module.exports = router;`} />
          </Section>

          {/* Step 5 */}
          <Section title="STEP 5 — ENVIRONMENT & RUN" icon={Rocket}>
            <p className="text-text-secondary text-sm">Create a <code className="text-accent">.env</code> file in the project root:</p>
            <CodeBlock lang="env" code={`# .env
MONGODB_URI=mongodb://localhost:27017/cinebook
JWT_SECRET=your-super-secret-key-change-this
PORT=5000`} />

            <p className="text-text-secondary text-sm mt-3">If using <strong>MongoDB Atlas</strong> (cloud), your URI looks like:</p>
            <CodeBlock lang="env" code={`MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cinebook?retryWrites=true&w=majority`} />

            <p className="text-text-secondary text-sm mt-3">Update <code className="text-accent">package.json</code> scripts:</p>
            <CodeBlock lang="json" code={`"scripts": {
  "dev": "concurrently \\"nodemon server/index.js\\" \\"vite\\"",
  "build": "tsc -b && vite build",
  "start": "node server/index.js"
}`} />

            <p className="text-text-secondary text-sm mt-3">Update <code className="text-accent">vite.config.ts</code> to proxy API calls:</p>
            <CodeBlock lang="typescript" code={`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    }
  }
});`} />

            <p className="text-text-secondary text-sm mt-3">Now run it:</p>
            <CodeBlock code={`# Start MongoDB (if local)
mongod

# In another terminal, start the app
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000`} />

            <p className="text-text-secondary text-sm mt-3">Seed the database (create <code className="text-accent">server/seed.js</code>):</p>
            <CodeBlock lang="javascript" code={`require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin user
  await User.create({
    email: 'admin@cinebook.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin'
  });

  // Create demo user
  await User.create({
    email: 'demo@cinebook.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user'
  });

  // Create movies
  const movie = await Movie.create({
    title: 'Shadow Protocol',
    genre: 'Action',
    rating: 8.7,
    duration_minutes: 142,
    description: 'A former covert operative...',
    poster_url: '/posters/poster1.jpg',
    release_year: 2025
  });

  // Create showtimes
  await Showtime.create({
    movie_id: movie._id,
    theater: 'IMAX Grand Cinema',
    date: '2025-07-20',
    time: '6:30 PM',
    price: 300,
    available_seats: 96
  });

  console.log('✅ Database seeded!');
  process.exit();
}

seed();`} />
            <CodeBlock code={`node server/seed.js`} />
          </Section>

          {/* Key Differences */}
          <Section title="KEY DIFFERENCES: SUPABASE → MONGODB" icon={Database}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-text-muted font-medium">Feature</th>
                    <th className="text-left py-2 pr-4 text-text-muted font-medium">Supabase (Current)</th>
                    <th className="text-left py-2 text-text-muted font-medium">MongoDB (Local)</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border/50"><td className="py-2 pr-4 text-text-primary">Database</td><td className="py-2 pr-4">PostgreSQL (cloud)</td><td className="py-2">MongoDB (local/Atlas)</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4 text-text-primary">ORM/Client</td><td className="py-2 pr-4">@supabase/supabase-js</td><td className="py-2">Mongoose</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4 text-text-primary">API Layer</td><td className="py-2 pr-4">Vercel Serverless (api/)</td><td className="py-2">Express.js (server/)</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4 text-text-primary">Auth</td><td className="py-2 pr-4">Supabase Auth</td><td className="py-2">JWT + bcrypt</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4 text-text-primary">File Upload</td><td className="py-2 pr-4">Supabase Storage</td><td className="py-2">Multer → /uploads folder</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4 text-text-primary">IDs</td><td className="py-2 pr-4">serial (integer)</td><td className="py-2">ObjectId (string)</td></tr>
                  <tr><td className="py-2 pr-4 text-text-primary">Frontend</td><td className="py-2 pr-4">fetch('http://localhost:5000/api/...')</td><td className="py-2">fetch('http://localhost:5000/api/...') — same!</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-accent text-sm font-medium">💡 The frontend code stays almost identical!</p>
              <p className="text-text-secondary text-xs mt-1">Only the API routes change. The React components keep using <code>fetch('http://localhost:5000/api/...')</code> — just make sure your Express routes return the same JSON shape.</p>
            </div>
          </Section>

          {/* Frontend changes */}
          <Section title="FRONTEND CHANGES NEEDED" icon={Code}>
            <p className="text-text-secondary text-sm">Minimal changes — mainly auth and the Supabase client:</p>

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">1. Replace src/lib/supabase.ts → src/lib/api.ts</p>
            <CodeBlock lang="typescript" code={`// src/lib/api.ts
const API = '';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = \`Bearer \${token}\`;
  const res = await fetch(\`\${API}\${path}\`, { ...options, headers });
  return res;
}`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">2. Replace AuthContext — use JWT instead of Supabase Auth</p>
            <CodeBlock lang="typescript" code={`// Login function
const login = async (email: string, password: string) => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { token, user } = await res.json();
  localStorage.setItem('token', token);
  setUser(user);
};

// Signup function
const signup = async (email: string, password: string, name: string) => {
  const res = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const { token, user } = await res.json();
  localStorage.setItem('token', token);
  setUser(user);
};

// Check auth on load
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: \`Bearer \${token}\` }
    })
    .then(r => r.json())
    .then(data => setUser(data))
    .catch(() => localStorage.removeItem('token'));
  }
}, []);`} />

            <p className="text-text-primary text-xs uppercase tracking-wider mt-4 mb-2 font-medium">3. IDs change from numbers to strings</p>
            <p className="text-text-secondary text-sm">MongoDB uses ObjectId strings like <code className="text-accent">"507f1f77bcf86cd799439011"</code> instead of integers. Update your TypeScript interfaces:</p>
            <CodeBlock lang="typescript" code={`// Before (Supabase)
interface Movie { id: number; title: string; ... }

// After (MongoDB)
interface Movie { _id: string; title: string; ... }`} />
          </Section>

        </div>
      </motion.div>
    </div>
  );
}
