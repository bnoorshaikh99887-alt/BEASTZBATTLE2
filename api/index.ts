import express from 'express';
import { apiRouter } from '../src/server/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle API requests
app.use('/api', apiRouter);
// Fallback for root api invocation
app.use('/', apiRouter);

export default app;
