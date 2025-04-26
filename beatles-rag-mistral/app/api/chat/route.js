// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { DataAPIClient } from '@datastax/astra-db-ts';

// Helper: embed a query via Mistral API
async function embedQuery(text) {
  const res = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-embed',
      input: text,
    }),
  });
  if (!res.ok) throw new Error(`Embedding error ${res.status}`);
  const { data } = await res.json();
  return data[0].embedding;
}

// Helper: ask chat completion via Mistral Nemo
async function askMistral(question, context) {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: 'Tu es un assistant expert des Beatles. Tu fournis des réponses courtes' },
        { role: 'user', content: context },
        { role: 'user', content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Chat error ${res.status}`);
  const { choices } = await res.json();
  return choices[0].message.content;
}

export async function POST(req) {
  try {
    const { question } = await req.json();

    // 1) Embed question
    const qEmbedding = await embedQuery(question);

    // 2) Retrieve from Astra DB
    const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
    const db = client.db(process.env.ASTRA_DB_ENDPOINT, {
      keyspace: process.env.ASTRA_DB_NAMESPACE,
    });
    const col = db.collection(process.env.ASTRA_DB_COLLECTION);
    // query by vector similarity
    const response = await col.find({
      vector: {
        $vector: qEmbedding,
        $topK: 5,
        $metric: 'cosine',
      },
    });
    const docs = response.documents || [];

    // 3) Build context
    const context = docs.map(d => d.pageContent).join('\n\n---\n\n');

    // 4) Ask Mistral
    const answer = await askMistral(question, context);

    return NextResponse.json({ answer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
