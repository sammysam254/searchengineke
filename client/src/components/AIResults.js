import React, { useState } from 'react';

const AIResults = ({ results, onSearch }) => {
  const [expandedSections, setExpandedSections] = useState({});

  if (!results) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFollowUp = (question) => {
    onSearch(question, 1, 'ai');
  };

  return (
    <div className="ai-results-container">
      {/* AI Response Header */}
      <div className="ai-response-header">
        <div className="ai-avatar">🤖</div>
        <div className="ai-info">
          <h3>INFINITUM AI</h3>
          <p>Powered by advanced AI models</p>
        </div>
        <div className="ai-status">
          <span className="status-indicator active"></span>
          Online
        </div>
      </div>

      {/* Main AI Answer */}
      {results.aiAnswer && (
        <div className="ai-main-answer">
          <div className="answer-content">
            <div className="answer-text" dangerouslySetInnerHTML={{ __html: results.aiAnswer }} />
          </div>
          
          {results.confidence && (
            <div className="confidence-meter">
              <span className="confidence-label">Confidence:</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${results.confidence}%` }}
                ></div>
              </div>
              <span className="confidence-value">{results.confidence}%</span>
            </div>
          )}
        </div>
      )}

      {/* Key Points */}
      {results.keyPoints && results.keyPoints.length > 0 && (
        <div className="ai-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('keyPoints')}
          >
            <span className="section-icon">🔑</span>
            <span className="section-title">Key Points</span>
            <span className={`expand-icon ${expandedSections.keyPoints ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedSections.keyPoints && (
            <div className="section-content">
              <ul className="key-points-list">
                {results.keyPoints.map((point, index) => (
                  <li key={index} className="key-point">
                    <span className="point-bullet">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Related Topics */}
      {results.relatedTopics && results.relatedTopics.length > 0 && (
        <div className="ai-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('relatedTopics')}
          >
            <span className="section-icon">🔗</span>
            <span className="section-title">Related Topics</span>
            <span className={`expand-icon ${expandedSections.relatedTopics ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedSections.relatedTopics && (
            <div className="section-content">
              <div className="related-topics-grid">
                {results.relatedTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="related-topic-chip"
                    onClick={() => handleFollowUp(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      {results.sources && results.sources.length > 0 && (
        <div className="ai-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('sources')}
          >
            <span className="section-icon">📚</span>
            <span className="section-title">Sources</span>
            <span className={`expand-icon ${expandedSections.sources ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedSections.sources && (
            <div className="section-content">
              <div className="sources-list">
                {results.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-item"
                  >
                    <div className="source-title">{source.title}</div>
                    <div className="source-url">{source.domain}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {results.followUpQuestions && results.followUpQuestions.length > 0 && (
        <div className="ai-section">
          <div className="section-header">
            <span className="section-icon">❓</span>
            <span className="section-title">Ask More</span>
          </div>
          <div className="section-content">
            <div className="followup-questions">
              {results.followUpQuestions.map((question, index) => (
                <button
                  key={index}
                  className="followup-question"
                  onClick={() => handleFollowUp(question)}
                >
                  <span className="question-icon">💭</span>
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="ai-disclaimer">
        <span className="disclaimer-icon">ℹ️</span>
        AI responses are generated and may not always be accurate. Please verify important information.
      </div>
    </div>
  );
};

export default AIResults;