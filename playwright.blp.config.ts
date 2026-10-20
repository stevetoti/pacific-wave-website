import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, timeout: 60000, workers: 1, use: { ...base.use, channel: 'chrome' } });
