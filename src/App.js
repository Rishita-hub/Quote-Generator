import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import quotesData from "./quote";

function App() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [dailyQuote, setDailyQuote] = useState("");
  const [dailyAuthor, setDailyAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [fade, setFade] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getDailyQuote = useCallback(async () => {
    const stored = JSON.parse(localStorage.getItem("quoteOfTheDay"));
    const today = new Date().toDateString();

    if (stored && stored.date === today) {
      setDailyQuote(stored.quote);
      setDailyAuthor(stored.author);
    } else {
      try {
        const res = await fetch(`https://type.fit/api/quotes`);
        const data = await res.json();
        const random = data[Math.floor(Math.random() * data.length)];
        setDailyQuote(random.text);
        setDailyAuthor(random.author || "Unknown");

        const todayQuote = {
          quote: random.text,
          author: random.author || "Unknown",
          date: today,
        };
        localStorage.setItem("quoteOfTheDay", JSON.stringify(todayQuote));
      } catch {
        setDailyQuote("Could not fetch quote of the day.");
        setDailyAuthor("System");
      }
    }
  }, []);

  const getQuote = useCallback(async () => {
    setLoading(true);
    setFade(false);

    try {
      if (language === "en") {
        const res = await fetch("https://type.fit/api/quotes");
        const data = await res.json();
        const random = data[Math.floor(Math.random() * data.length)];
        setQuote(random.text);
        setAuthor(random.author || "Unknown");
      } else {
        const hindiList = quotesData["hi"]["motivational"] || [];
        const random = hindiList[Math.floor(Math.random() * hindiList.length)];
        setQuote(random?.quote || "कोई उद्धरण नहीं मिला।");
        setAuthor(random?.author || "Anonymous");
      }
    } catch {
      setQuote("Error fetching quote.");
      setAuthor("System");
    }

    setTimeout(() => {
      setFade(true);
      setLoading(false);
    }, 100);
  }, [language]);

  useEffect(() => {
    getDailyQuote();
    getQuote();
  }, [getDailyQuote, getQuote]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "hi" : "en"));

  const copyQuote = () => {
    navigator.clipboard.writeText(`${quote} — ${author}`);
    alert("Quote copied to clipboard ✅");
  };

  const tweetQuote = () => {
    const tweet = `"${quote}" — ${author}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(url, "_blank");
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (language === "en") {
        try {
          const res = await fetch("https://type.fit/api/quotes");
          const data = await res.json();
          const result = data.find((q) =>
            q.text.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (result) {
            setQuote(result.text);
            setAuthor(result.author || "Unknown");
          } else {
            setQuote("No results found.");
            setAuthor("Try another word");
          }
        } catch {
          setQuote("Error during search.");
          setAuthor("System");
        }
      } else {
        const matches = quotesData["hi"]["motivational"]?.filter((q) =>
          q.quote.includes(searchTerm)
        );
        const result = matches?.[0];
        if (result) {
          setQuote(result.quote);
          setAuthor(result.author);
        } else {
          setQuote("कोई परिणाम नहीं मिला।");
          setAuthor("Try again");
        }
      }
    }
  };

  const saveToFavorites = () => {
    if (!quote || quote === "No quote found.") return;
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs.push({ quote, author });
    localStorage.setItem("favorites", JSON.stringify(favs));
    alert("Saved to favorites 💖");
  };

  const speakQuote = () => {
    const speech = new SpeechSynthesisUtterance(`${quote} by ${author}`);
    speech.lang = language === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className={darkMode ? "container dark" : "container"}>
      <h1>🌟 Quote Generator 🌟</h1>

      <div className="daily-quote">
        <h3>🗓️ Quote of the Day</h3>
        <p>"{dailyQuote}"</p>
        <span>— {dailyAuthor}</span>
      </div>

      <div className="top-controls">
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button onClick={toggleLanguage}>
          {language === "en" ? "हिंदी 🔁" : "English 🔁"}
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search keyword"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
        className="search-bar"
      />

      <div className="controls">
        <button onClick={speakQuote}>🔊 Speak</button>
        <button onClick={getQuote}>🎯 New Quote</button>
        <button onClick={copyQuote}>📋 Copy</button>
        <button onClick={tweetQuote}>🐦 Tweet</button>
        <button onClick={saveToFavorites}>💖 Save</button>
        <Link to="/favorites">
          <button>📚 Favorites</button>
        </Link>
      </div>

      <div className={`quote-box ${fade ? "fade" : ""}`}>
        {loading ? <p>Loading...</p> : <><p>"{quote}"</p><span>— {author}</span></>}
      </div>
    </div>
  );
}

export default App;

//         <select onChange={(e) => setCategory(e.target.value)} value={category}>
//           <option value="inspirational">Motivational</option>
//           <option value="wisdom">Wisdom</option>
//           <option value="life">Life</option>
//           <option value="love">Love</option>
//           <option value="philosophy">Philosophy</option>
//           <option value="leadership">Leadership</option>
//           <option value="success">Success</option>
//           <option value="gratitude">Gratitude</option>
//           <option value="famous-quotes">Famous Quotes</option>
//           <option value="freedom">Freedom</option>
//           <option value="friendship">Friendship</option>
//           <option value="future">Future</option>
//           <option value="happiness">Happiness</option>
//           <option value="spirituality">Spirituality</option>
//           <option value="technology">Technology</option>
//         </select>


// import React, { useEffect, useState, useCallback } from "react";
// import "./App.css";
// import { Link } from "react-router-dom";
// import quotesData from "./quote"; // ✅ use your quotes.js file

// function App() {
//   const [quote, setQuote] = useState("");
//   const [author, setAuthor] = useState("");
//   const [dailyQuote, setDailyQuote] = useState("");
//   const [dailyAuthor, setDailyAuthor] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [darkMode, setDarkMode] = useState(false);
//   const [category, setCategory] = useState("motivational");
//   const [language, setLanguage] = useState("en");
//   const [fade, setFade] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const getDailyQuote = useCallback(async () => {
//     const stored = JSON.parse(localStorage.getItem("quoteOfTheDay"));
//     const today = new Date().toDateString();

//     if (stored && stored.date === today) {
//       setDailyQuote(stored.quote);
//       setDailyAuthor(stored.author);
//     } else {
//       const res = await fetch(`https://api.quotable.io/random?tags=inspirational`);
//       const data = await res.json();
//       if (data && data.content) {
//         setDailyQuote(data.content);
//         setDailyAuthor(data.author);
//         const todayQuote = {
//           quote: data.content,
//           author: data.author,
//           date: today,
//         };
//         localStorage.setItem("quoteOfTheDay", JSON.stringify(todayQuote));
//       }
//     }
//   }, []);

//   const getQuote = useCallback(async () => {
//     setLoading(true);
//     setFade(false);

//     try {
//       if (language === "en") {
//         const res = await fetch(`https://api.quotable.io/random?tags=${category}`);
//         const data = await res.json();
//         setQuote(data.content || "No quote found.");
//         setAuthor(data.author || "API");
//       } else {
//         const selectedQuotes = quotesData["hi"][category] || [];
//         const random = selectedQuotes[Math.floor(Math.random() * selectedQuotes.length)];
//         setQuote(random?.quote || "कोई उद्धरण नहीं मिला।");
//         setAuthor(random?.author || "Anonymous");
//       }
//     } catch {
//       setQuote("Error fetching quote.");
//       setAuthor("System");
//     }

//     setTimeout(() => {
//       setFade(true);
//       setLoading(false);
//     }, 100);
//   }, [language, category]);

//   useEffect(() => {
//     getDailyQuote();
//     getQuote();
//   }, [getDailyQuote, getQuote]);

//   const toggleDarkMode = () => setDarkMode((prev) => !prev);
//   const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "hi" : "en"));

//   const copyQuote = () => {
//     navigator.clipboard.writeText(`${quote} — ${author}`);
//     alert("Quote copied to clipboard ✅");
//   };

//   const tweetQuote = () => {
//     const tweet = `"${quote}" — ${author}`;
//     const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
//     window.open(url, "_blank");
//   };

//   const handleSearch = async (e) => {
//     if (e.key === "Enter") {
//       if (language === "en") {
//         const res = await fetch(`https://api.quotable.io/search/quotes?query=${searchTerm}`);
//         const data = await res.json();
//         if (data.count > 0) {
//           const q = data.results[0];
//           setQuote(q.content);
//           setAuthor(q.author);
//         } else {
//           setQuote("No results found.");
//           setAuthor("Try another word");
//         }
//       } else {
//         const matches = quotesData["hi"][category]?.filter((q) =>
//           q.quote.includes(searchTerm)
//         );
//         const result = matches?.[0];
//         if (result) {
//           setQuote(result.quote);
//           setAuthor(result.author);
//         } else {
//           setQuote("कोई परिणाम नहीं मिला।");
//           setAuthor("Try again");
//         }
//       }
//     }
//   };

//   const saveToFavorites = () => {
//     if (!quote || quote === "No quote found.") return;
//     const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
//     favs.push({ quote, author });
//     localStorage.setItem("favorites", JSON.stringify(favs));
//     alert("Saved to favorites 💖");
//   };

//   const speakQuote = () => {
//   const speech = new SpeechSynthesisUtterance(`${quote} by ${author}`);
//   speech.lang = language === "hi" ? "hi-IN" : "en-US";
//   window.speechSynthesis.speak(speech);
// };

//   return (
//     <div className={darkMode ? "container dark" : "container"}>
//       <h1>🌟 Quote Generator 🌟</h1>

//       <div className="daily-quote">
//         <h3>🗓️ Quote of the Day</h3>
//         <p>"{dailyQuote}"</p>
//         <span>— {dailyAuthor}</span>
//       </div>

//       <div className="top-controls">
//         <button onClick={toggleDarkMode}>
//           {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
//         </button>
//         <button onClick={toggleLanguage}>
//           {language === "en" ? "हिंदी 🔁" : "English 🔁"}
//         </button>
//       </div>

//       <input
//         type="text"
//         placeholder="🔍 Search keyword (e.g. love)"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         onKeyDown={handleSearch}
//         className="search-bar"
//       />

//       <div className="controls">
//         <select onChange={(e) => setCategory(e.target.value)} value={category}>
//           {/* <option value="motivational">Motivational</option>
//           <option value="wisdom">Wisdom</option>
//           <option value="life">Life</option>
//           <option value="love">Love</option>
//           <option value="philosophy">Philosophy</option>
//           <option value="leadership">Leadership</option>
//           <option value="success">Success</option>
//           <option value="sad">Sad</option>
//           <option value="funny">Funny</option> */}       
//                <option value="inspirational">Motivational</option>
//            <option value="wisdom">Wisdom</option>
//            <option value="life">Life</option>
//            <option value="love">Love</option>
//            <option value="philosophy">Philosophy</option>
//            <option value="leadership">Leadership</option>
//            <option value="success">Success</option>
//            <option value="gratitude">Gratitude</option>
//            <option value="famous-quotes">Famous Quotes</option>
//            <option value="freedom">Freedom</option>
//            <option value="friendship">Friendship</option>
//            <option value="future">Future</option>
//        <option value="happiness">Happiness</option>
//        <option value="spirituality">Spirituality</option>
//          <option value="technology">Technology</option>
//         </select>
// <button onClick={speakQuote}>🔊 Speak</button>

//         <button onClick={getQuote}>🎯 New Quote</button>
//         <button onClick={copyQuote}>📋 Copy</button>
//         <button onClick={tweetQuote}>🐦 Tweet</button>
//         <button onClick={saveToFavorites}>💖 Save</button>

//         <Link to="/favorites">
//           <button>📚 Favorites</button>
//         </Link>
//       </div>

//       <div className={`quote-box ${fade ? "fade" : ""}`}>
//         {loading ? <p>Loading...</p> : <><p>"{quote}"</p><span>— {author}</span></>}
//       </div>
//     </div>
//   );
// }

// export default App;
