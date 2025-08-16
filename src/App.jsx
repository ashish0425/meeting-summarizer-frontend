import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000'; // Change this to your deployed backend URL

function App() {
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleSummarize = async () => {
    if (!transcript.trim() || !prompt.trim()) {
      setMessage('Please provide both transcript and prompt');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
      setEditableSummary(data.summary);
      setMessage('Summary generated successfully!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Summarization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!editableSummary.trim()) {
      setMessage('No summary to send');
      return;
    }

    if (!emails.trim()) {
      setMessage('Please provide email addresses');
      return;
    }

    const emailList = emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emailList.length === 0) {
      setMessage('Please provide valid email addresses');
      return;
    }

    setEmailSending(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          summary: editableSummary.trim(),
          subject: 'Meeting Summary',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setMessage(`✅ ${data.message}`);
      setEmails('');
    } catch (error) {
      setMessage(`Email error: ${error.message}`);
      console.error('Email error:', error);
    } finally {
      setEmailSending(false);
    }
  };

  const clearAll = () => {
    setTranscript('');
    setPrompt('');
    setSummary('');
    setEditableSummary('');
    setEmails('');
    setMessage('');
  };

  return (
    <div className="App">
      <header className="header">
        <h1> AI Meeting Notes Summarizer</h1>
        <p>Upload transcript → Add prompt → Generate summary → Edit & Share</p>
      </header>

      <main className="main">
        {message && (
          <div className={`message ${message.includes('Error') || message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="section">
          <h2>1. Upload Meeting Transcript</h2>
          <textarea
            className="textarea large"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript or call notes here..."
            rows={8}
          />
        </div>

        <div className="section">
          <h2>2. Custom Instruction/Prompt</h2>
          <input
            type="text"
            className="input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
          />
          <div className="prompt-suggestions">
            <p>Quick prompts:</p>
            <button 
              className="suggestion-btn"
              onClick={() => setPrompt('Summarize in bullet points for executives')}
            >
              Executive Summary
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => setPrompt('List all action items with responsible persons')}
            >
              Action Items
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => setPrompt('Highlight key decisions made and next steps')}
            >
              Key Decisions
            </button>
          </div>
        </div>

        <div className="section">
          <button 
            className="btn primary"
            onClick={handleSummarize}
            disabled={loading || !transcript.trim() || !prompt.trim()}
          >
            {loading ? 'Generating Summary...' : ' Generate Summary'}
          </button>
          <button 
            className="btn secondary"
            onClick={clearAll}
          >
             Clear All
          </button>
        </div>

        {summary && (
          <>
            <div className="section">
              <h2>3. Generated Summary (Editable)</h2>
              <textarea
                className="textarea large"
                value={editableSummary}
                onChange={(e) => setEditableSummary(e.target.value)}
                rows={12}
              />
            </div>

            <div className="section">
              <h2>4. Share via Email</h2>
              <input
                type="text"
                className="input"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Enter email addresses (comma-separated): user1@example.com, user2@example.com"
              />
              <button 
                className="btn primary"
                onClick={handleSendEmail}
                disabled={emailSending || !editableSummary.trim() || !emails.trim()}
              >
                {emailSending ? 'Sending...' : ' Send Summary'}
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Built with React + Node.js + OpenAI API</p>
      </footer>
    </div>
  );
}

export default App;