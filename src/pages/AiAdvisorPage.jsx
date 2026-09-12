// AI Dealership Business & Margin Advisor Page
import React, { useState } from 'react';
import { api } from '../services/api.js';
import { Bot, Send, Sparkles } from 'lucide-react';

export function AiAdvisorPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (qText) => {
    const q = qText || question;
    if (!q) return;
    setLoading(true);
    try {
      const res = await api.ai.query(q);
      setResponse(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container ai-advisor-page">
      <div className="page-header">
        <div>
          <h2>AI Dealership Business Advisor</h2>
          <p>Grounded intelligence analyzing live bills, landed costs, lead intent, and cashflow</p>
        </div>
      </div>

      <div className="ai-chat-card">
        {/* Quick Prompt Chips */}
        <div className="prompt-chips-row">
          <button
            className="chip-btn"
            onClick={() => {
              setQuestion('What are my dealership net margins and expenses?');
              handleQuery('What are my dealership net margins and expenses?');
            }}
          >
            <Sparkles size={13} /> Check Showroom Margins
          </button>
          <button
            className="chip-btn"
            onClick={() => {
              setQuestion('Who should I call first today from the sales queue?');
              handleQuery('Who should I call first today from the sales queue?');
            }}
          >
            <Sparkles size={13} /> Daily Calling Priority
          </button>
        </div>

        {/* Query Input */}
        <div className="ai-input-row">
          <input
            type="text"
            className="form-control"
            placeholder="Ask anything about showroom ledger, margins, or customer leads..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleQuery(); }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleQuery()}
            disabled={loading}
          >
            <Send size={16} /> {loading ? 'Analyzing...' : 'Ask Advisor'}
          </button>
        </div>

        {/* Advisor Response */}
        {response && (
          <div className="advisor-response-box">
            <div className="res-header">
              <Bot size={20} className="text-emerald" />
              <h4>{response.title}</h4>
            </div>
            <p className="res-summary">{response.summary}</p>

            <div className="res-findings">
              <h5>Key Dealership Insights:</h5>
              <ul>
                {(response.keyFindings || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {response.recommendation && (
              <div className="res-rec">
                <strong>Showroom Recommendation:</strong> {response.recommendation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
