import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import projectsRouter from './routes/projects';
import { mockApiService } from './services/mockApiService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BobForge Backend',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/projects', projectsRouter);

// Mock HR API routes (for testing)
app.use('/api/mock/hr', mockApiService.createRouter());

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🔨 BobForge Backend Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Mock HR API: http://localhost:${PORT}/api/mock/hr`);
  console.log('='.repeat(50));
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST   /api/projects');
  console.log('  GET    /api/projects');
  console.log('  GET    /api/projects/:id');
  console.log('  PUT    /api/projects/:id');
  console.log('  DELETE /api/projects/:id');
  console.log('  POST   /api/projects/:id/parse');
  console.log('  GET    /api/projects/:id/endpoints');
  console.log('  POST   /api/projects/:id/generate-tools');
  console.log('  GET    /api/projects/:id/tools');
  console.log('  POST   /api/projects/:id/assess-risk');
  console.log('  GET    /api/projects/:id/policy');
  console.log('  POST   /api/projects/:id/generate');
  console.log('  GET    /api/projects/:id/preview');
  console.log('  GET    /api/projects/:id/export');
  console.log('  POST   /api/projects/:id/agent/query');
  console.log('  GET    /api/projects/:id/approvals');
  console.log('  POST   /api/approvals/:id/approve');
  console.log('  POST   /api/approvals/:id/reject');
  console.log('  GET    /api/projects/:id/statistics');
  console.log('');
  console.log('Mock HR API endpoints:');
  console.log('  GET    /api/mock/hr/employees');
  console.log('  GET    /api/mock/hr/employees/:id');
  console.log('  GET    /api/mock/hr/employees/:id/leave-balance');
  console.log('  POST   /api/mock/hr/employees/:id/leave-request');
  console.log('  GET    /api/mock/hr/employees/:id/payroll');
  console.log('  POST   /api/mock/hr/tickets');
  console.log('  GET    /api/mock/hr/tickets');
  console.log('  GET    /api/mock/hr/tickets/:id');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;

// Made with Bob
