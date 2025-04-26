// scripts/embed.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";

async function embedDocuments(texts) {
  const res = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-embeddings-550m",
      input: texts,
    }),
  });
  const { data } = await res.json();
  return data.map((d) => d.embedding);
}

async function embedQuery(text) {
  return (await embedDocuments([text]))[0];
}

;(async () => {
  // 1) charger les chunks
  const chunksDir = path.join(process.cwd(), "data/chunks");
  const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".json"));
  const docs = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(chunksDir, f), "utf-8"))
  );
  const texts = docs.map((d) => d.pageContent);
  const metadatas = docs.map((d) => d.metadata);

  // 2) se connecter à la collec’ déjà configurée
  const store = await AstraDBVectorStore.fromExistingIndex(
    { embedDocuments, embedQuery },
    {
      token: process.env.ASTRA_DB_APPLICATION_TOKEN,
      endpoint: process.env.ASTRA_DB_ENDPOINT,
      namespace: process.env.ASTRA_DB_NAMESPACE,
      collection: process.env.ASTRA_DB_COLLECTION,
    }
  );

  // 3) upsert les chunks
  await store.addDocuments(
    texts.map((t, i) => ({ pageContent: t, metadata: metadatas[i] }))
  );
  console.log("✅ Chunks upsertés dans AstraDB !");
})();
