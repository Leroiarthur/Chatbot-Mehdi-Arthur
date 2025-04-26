# scripts/embed_astra.py
import os
import json
import uuid
import requests
from dotenv import load_dotenv
from astrapy import DataAPIClient

load_dotenv()  # charge MISTRAL_API_KEY, ASTRA_* depuis .env

# 1) Connect to Astra DB
client = DataAPIClient(os.getenv("ASTRA_DB_APPLICATION_TOKEN"))
# Use the API endpoint and keyspace from .env
db = client.get_database_by_api_endpoint(
    os.getenv("ASTRA_DB_ENDPOINT"),
    keyspace=os.getenv("ASTRA_DB_NAMESPACE"),
)
col = db.get_collection(os.getenv("ASTRA_DB_COLLECTION"))

# 2) Read chunk files
CHUNKS_DIR = "data/chunks"
files = [f for f in os.listdir(CHUNKS_DIR) if f.endswith(".json")]

# 3) Process each chunk
for fname in files:
    # Load chunk JSON
    path = os.path.join(CHUNKS_DIR, fname)
    with open(path, "r", encoding="utf-8") as f:
        doc = json.load(f)
    text = doc.get("pageContent", "")
    meta = doc.get("metadata", {})

    # 3a) Fetch embedding from Mistral API
    resp = requests.post(
        "https://api.mistral.ai/v1/embeddings",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('MISTRAL_API_KEY')}"
        },
        json={
            "model": "mistral-embed",
            "input": text
        },
    )
    print("STATUS:", resp.status_code)
    print("BODY:", resp.text)
    resp.raise_for_status()

    # Extract the embedding vector
    vector = resp.json()["data"][0]["embedding"]

    # 4) Upsert into Astra
    item = {
        # Use _id for custom document ID; AstraDB will generate one if omitted
        "_id": str(uuid.uuid4()),
        "pageContent": text,
        "metadata": meta,
        "embedding": vector,
    }
    col.insert_one(item)
    print(f"☑️  Chunk {fname} upserted")

print("✅ All chunks have been upserted to Astra DB!")
