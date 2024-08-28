import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sentiment, setSentiment] = useState("");

  const surpriseOptions = [
    "moon",
    "sun",
    "love",
    "childhood",
    "superheroes",
    "money",
    "family",
    "mother",
    "beach",
    // other options...
  ];

  const sentimentGifMap = {
    joy: "/assets/joy.gif",
    sadness: "/assets/sadness.gif",
    anger: "/assets/anger.gif",
    fear: "/assets/fear.gif",
    surprise: "/assets/surprise.gif",
    love: "/assets/love.gif",
    // Add other sentiment mappings as needed
  };

  const surprise = () => {
    const randomValue = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setValue(randomValue);
  };

  const getReponse = async () => {
    if (!value) {
      setError("Error: Please ask a question");
      return;
    }
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: 'write a poem on ' + value + ' in around 200 words'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await fetch('http://localhost:8000/gemini', options);
      const data = await response.json();

      if (data.error) {
        setError("Error: " + data.error);
        return;
      }

      const dominantSentiment = data.sentiment; // Updated to handle the single object
      const formattedText = `${data.poem}\n\nSentiment: ${dominantSentiment.label} (Score: ${dominantSentiment.score.toFixed(2)})`;

      setChatHistory(oldChatHistory => {
        const newHistory = [...oldChatHistory, {
          role: "user",
          parts: value
        },
        {
          role: "model",
          parts: formattedText
        }];
        return newHistory.slice(-5); // keep only the last 5 entries
      });
      setSentiment(dominantSentiment.label); // Directly set the dominant sentiment
      setValue("");
    } catch (error) {
      console.error(error);
      setError("Error: Something went wrong");
    }
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      getReponse();
    }
  };

  return (
    <>
      <style>
        {`
          .background-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('/assets/sun.jpeg');
            background-size: cover;
            background-position: 50% 18%; /* Horizontal center, 30% from the top */
            background-repeat: no-repeat;
            opacity: 0.3;
            z-index: -1;
          }

          .app {
            position: relative;
            z-index: 1;
            min-height: 100vh; /* Ensure the app content takes at least full viewport height */
          }
        `}
      </style>
      <div className="background-container"></div>
      <div className="app">
        <p>What do you want to know?
          <button className="surprise" onClick={surprise}>Surprise me</button>
        </p>
        <div className="input-container">
          <input 
            value={value}
            placeholder="Type your question here"
            onChange={(e) => setValue(e.target.value)} 
            onKeyDown={handleKeyDown} />

          {!error && <button onClick={getReponse}>Ask Me</button>}
          {error && <button onClick={clear}>Clear</button>}
        </div>
        {error && <p>{error}</p>}
        <div className="search-result">
          {chatHistory.map((chatItem, _index) => (
            <div key={_index}>
              <p className="answer">
                <span style={{ color: '#00ffa2', fontWeight: 600 }}>
                  {chatItem.role.charAt(0).toUpperCase() + chatItem.role.slice(1)} :
                </span>
                <ReactMarkdown>{chatItem.parts}</ReactMarkdown>
              </p>
            </div>
          ))}
          
          {sentiment && (
            <div className="sentiment-gif"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img 
                src={sentimentGifMap[sentiment]} 
                alt={`${sentiment} sentiment`} 
                style={{ width: '200px', marginBottom: '10px' }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
