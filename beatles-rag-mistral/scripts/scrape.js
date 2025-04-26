// scripts/scrape.js
// Assure-toi que "type": "module" est défini dans ton package.json pour utiliser les imports ESM.

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const urls = [
  "https://fr.wikipedia.org/wiki/The_Beatles",
  "https://fr.wikipedia.org/wiki/Discographie_des_Beatles",
  // ajoute d'autres pages si tu veux
];

async function scrapeUrl(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Récupère tout le texte de la page
  const content = await page.evaluate(() => document.body.innerText);
  await browser.close();

  return {
    pageContent: content,
    metadata: { source: url }
  };
}

async function main() {
  const allDocs = [];
  for (const url of urls) {
    console.log(`→ Scraping ${url}`);
    const doc = await scrapeUrl(url);
    allDocs.push(doc);
  }

  // Crée le dossier data/ s'il n'existe pas
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const outputPath = path.join(dataDir, "beatles_raw.json");
  fs.writeFileSync(outputPath, JSON.stringify(allDocs, null, 2), "utf-8");
  console.log(`✅ Scraping terminé : ${outputPath}`);
}

main().catch((err) => {
  console.error("Erreur lors du scraping :", err);
  process.exit(1);
});
