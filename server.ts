import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './server/db.ts';
import { errorHandler } from './server/errors.ts';
import { studentsRouter } from './server/routes/students.ts';
import { companiesRouter } from './server/routes/companies.ts';
import { internshipsRouter } from './server/routes/internships.ts';
import { applicationsRouter } from './server/routes/applications.ts';
import { skillsRouter } from './server/routes/skills.ts';
import { certificatesRouter } from './server/routes/certificates.ts';
import { analyticsRouter } from './server/routes/analytics.ts';
import { databaseRouter } from './server/routes/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize Relational Database
  console.log('[Server] Initializing Relational MySQL/SQLite Database Engine...');
  await initDatabase();
  console.log('[Server] Database initialized with relational schema and seeds.');

  // Global parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API Endpoints
  app.use('/api/students', studentsRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/internships', internshipsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/skills', skillsRouter);
  app.use('/api/certificates', certificatesRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/db', databaseRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Student Internship & Skill Tracking Portal',
      timestamp: new Date().toISOString(),
      database: 'Connected',
    });
  });

  // Centralized API Error Handling Middleware (must be after /api routes)
  app.use('/api', errorHandler);

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Final catch-all error handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portal server live at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
