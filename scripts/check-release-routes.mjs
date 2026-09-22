import { existsSync, readFileSync } from 'node:fs';

// A marketing/SEO deployment must preserve the live registration and learning system.
const routes = [
  '/(website)/training-center/[[...path]]/page',
  '/(website)/vanuatu-training/page',
  '/(admin)/admin/training-center/page',
  '/api/lms/[action]/route',
  '/api/training/register/route',
  '/(website)/services/[slug]/page',
];
const built = process.argv.includes('--built');
const manifest = built ? JSON.parse(readFileSync('.next/server/app-paths-manifest.json', 'utf8')) : null;
const missing = routes.filter(route => built ? !manifest[route] : !existsSync(`src/app${route}.tsx`) && !existsSync(`src/app${route}.ts`));
if (missing.length) throw new Error(`Release blocked: required website routes missing: ${missing.join(', ')}`);
console.log(`Release guard: all ${routes.length} training/admin/API/service routes ${built ? 'built' : 'present'}.`);
