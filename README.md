**Beatles RAG Mistral**

Un chatbot spécialisé Beatles qui utilise Mistral AI (embed + chat) et DataStax Astra DB pour le RAG (Retrieval Augmented Generation).

🔧 Prérequis

Node.js ≥ 18

Python 3.11 (pour le script d’indexation alternatif)

Un compte Mistral AI + clé API

Un compte DataStax Astra DB (free tier suffit) avec un keyspace et une collection vectorisée

**🚀 Installation**

Clone ce repo : https://github.com/Leroiarthur/Chatbot-Mehdi-Arthur.git

git clone 
cd beatles-rag-mistral

Installe les dépendances JS :

npm install

(Optionnel) Crée et active un venv Python 3.11 :

python3.11 -m venv venv
source venv/bin/activate

**🔑 Configuration des clés**

À la racine, crée un fichier .env :

MISTRAL_API_KEY=ta_clef_mistral
ASTRA_DB_APPLICATION_TOKEN=ton_token_astra
ASTRA_DB_ENDPOINT=https://<DB-ID>-<REGION>.apps.astra.datastax.com
ASTRA_DB_NAMESPACE=chatbot
ASTRA_DB_COLLECTION=beatles_chunks

Ajoute .env à ton .gitignore pour ne pas le committer.

**⚙️ Scripts**

Scraper (pages Wikipédia Beatles) :

node scripts/scrape.js

Produit data/beatles_raw.json.

Splitter (découpe en chunks) :

node scripts/split.js

Génère data/chunks/chunk_*.json (~500 tokens chacun).

Embed + upsert (JS) :

node scripts/embed.js

OU avec Python/AstraPy :

python scripts/embed_astra.py

Stocke les embeddings dans Astra DB.

Dev server Next.js :

npx next dev

Ouvre http://localhost:3000.

Build / Start :

npm run build
npm run start

**🖥️ Utilisation**

Lancer le scrapper, le splitter, l’indexation.

Démarrer Next.js en dev.

Pose tes questions Beatles, le bot répond avec du contexte à jour.

**💡 Conseils**

Garde ta DB Astra éveillée (ping périodique) pour éviter la mise en veille.

Teste différents modèles Mistral (open-mistral-nemo, mistral-large-2.1).

Ajoute un système de streaming responses si tu veux plus de réactivité.

_Amuse-toi bien et rock’n’roll!_
