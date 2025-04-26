// scripts/split.js
// Découpage des documents Beatles en chunks (~500 tokens) pour RAG

import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

async function main() {
  const rawPath = path.resolve(process.cwd(), "data/beatles_raw.json");
  const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

  // Récupère les contenus
  const docs = raw.map(doc => ({
    pageContent: doc.pageContent,
    metadata: doc.metadata
  }));

  // Splitter LangChain.js
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50
  });
  const chunks = await splitter.splitDocuments(docs);

  // Crée le dossier chunks/ s'il n'existe pas
  const outDir = path.resolve(process.cwd(), "data/chunks");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Sauvegarde chaque chunk dans un fichier JSON séparé
  chunks.forEach((chunk, i) => {
    const file = path.join(outDir, `chunk_${i + 1}.json`);
    fs.writeFileSync(file, JSON.stringify(chunk, null, 2), "utf-8");
  });

  console.log(`✅ Découpage terminé : ${chunks.length} fichiers dans data/chunks/`);
}

main().catch(err => {
  console.error("Erreur lors du découpage :", err);
  process.exit(1);
});
