import { config } from 'dotenv';
import * as request from 'supertest';

config({ path: 'config/.env.local' });

const port = process.env.PORT || 4000;

const host = `localhost:${port}`;
const _request = request(host);

export default _request;
