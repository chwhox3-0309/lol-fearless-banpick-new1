 // test-env.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    console.log('Checking RIOT_API_KEY:');
    console.log('process.env.RIOT_API_KEY:', process.env.RIOT_API_KEY);
if (!process.env.RIOT_API_KEY || process.env.RIOT_API_KEY === RGAPI-16744676-088d-40b8-9b56-f0941bddf613) {
    console.error('Error: RIOT_API_KEY is still not set correctly.');
    console.error('Please ensure it is in .env.local in the project root and has a valid value.');
} else {
console.log('RIOT_API_KEY seems to be loaded correctly!');
}
