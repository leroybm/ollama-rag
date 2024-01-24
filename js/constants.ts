import { ChromaClient } from 'chromadb';

const persist_directory = process.env.PERSIST_DIRECTORY || 'db';

export const chromaClient = new ChromaClient({ path: persist_directory })