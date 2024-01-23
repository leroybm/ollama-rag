import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChromaClient } from "chromadb";

const persist_directory = process.env.PERSIST_DIRECTORY || 'db';
const source_directory = process.env.SOURCE_DIRECTORY || 'source_documents';
const embeddings_model_name = process.env.EMBEDDINGS_MODEL_NAME || 'all-MiniLM-L6-v2';
const chunk_size = 500
const chunk_overlap = 50

const LOADER_MAPPING: { [key: string]: typeof TextLoader } = {
    ".txt": TextLoader,
    ".ts": TextLoader,
    ".tsx": TextLoader,
}

async function loadSingleDocument(path: string): Promise<Document[]> {
    const ext = `.${path.split('.')[1]}`;
    if (LOADER_MAPPING[ext]) {
        const loader = new LOADER_MAPPING[ext](path);
        return await loader.load();
    }

    throw Error('Extension not supported');
}

async function processDocuments(): Promise<null | Document<Record<string, any>>[]> {
    console.log('Loading documents');
    // TODO replace with actual files
    const documents = await loadSingleDocument('source_documents/sample.txt');
    if (!documents) {
        console.log('No new documents to load')
        return null;
    }
    console.log(`Loaded ${documents.length} new documents from ${source_directory}`)

    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: chunk_size, chunkOverlap: chunk_overlap });
    const texts = await textSplitter.splitDocuments(documents);
    console.log(`Split into ${texts.length} chunks of text (max. ${chunk_size} tokens each)`)
    return texts;
}


async function main() {
    /**
     * TODO
     * - Load multiple documents
     * - Add ignored files
     * -
     */

    // https://github.com/xenova/transformers.js/issues/80#issuecomment-1638773862
    const TransformersApi = Function('return import("@xenova/transformers")')();
    const { pipeline } = await TransformersApi;

    const embeddingFunction = await pipeline('feature-extraction', embeddings_model_name);

    const documents = await processDocuments() || [];

    const client = new ChromaClient();
    const collection = await client.createCollection({
        name: "my_collection",
        embeddingFunction: embeddingFunction,
    });

    collection.add({
        ids: documents.map((_, i) => `ID${i}`),
        documents: documents.map(document => document.pageContent),
        metadatas: documents.map(document => document.metadata),
    });
}

main();