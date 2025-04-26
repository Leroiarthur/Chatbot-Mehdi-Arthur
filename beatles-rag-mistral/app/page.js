"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const question = input;
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const { answer } = await res.json();
    setMessages((prev) => [...prev, { role: "bot", content: answer }]);
  };

  return (
    <main className="container">
      <header className="header">
  <div className="logo-container">
    <Image src="/logo.png" alt="Logo" width={318} height={159} />
  </div>
</header>
      <div className="chat-container">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pose ta question..."
        />
        <button onClick={send}>Envoyer</button>
      </div>
      <style jsx>{`
        .container {
          max-width: 894px;
          margin: 2rem auto;
          display: flex;
          flex-direction: column;
          font-family: sans-serif;
          background: url('/background.jpg') center/cover no-repeat;
          filter: brightness(0.86);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }
        .header h1 {
          margin: 0 0 0 1rem;
          font-size: 1.5rem;
          color: #333;
        }
        .chat-container {
          flex: 1;
          border-top: 1px solidrgba(229, 231, 235, 0);
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
          height: 60vh;
          overflow-y: auto;
          background: rgba(255,255,255,0.7);
        }
        .message {
          display: flex;
          margin-bottom: 0.5rem;
        }
        .message.user {
          justify-content: flex-end;
        }
        .message.bot {
          justify-content: flex-start;
        }
        .bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: #f3f4f6;
        }
        .message.user .bubble {
          background: #d1fae5;
        }
        .message.bot .bubble {
          background:rgb(255, 255, 255);
        }
        .input-container {
          display: flex;
          background: rgba(255,255,255,0.8);
          padding: 1rem;
        }
        input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px 0 0 8px;
          outline: none;
        }
        button {
          width: 40px;
          height: 40px;
          background: url('/vinyl.png') center/cover no-repeat;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          margin-left: 8px;
          text-indent: -9999px; /* Masque le texte à l’intérieur */
        }
        button:hover {
          background:rgb(0, 0, 0);
        }
      `}</style>
    </main>
  );
}
