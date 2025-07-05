// FavoritesPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Favorites.css";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  const removeQuote = (index) => {
    const updated = [...favorites];
    updated.splice(index, 1);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="fav-container">
      <h1>💖 Your Favorite Quotes</h1>
      <Link to="/" className="back-btn">⬅️ Back to Generator</Link>

      {favorites.length === 0 ? (
        <p>No favorites yet...</p>
      ) : (
        <ul className="quote-list">
          {favorites.map((item, index) => (
            <li key={index} className="quote-card">
              <p>"{item.quote}"</p>
              <span>— {item.author}</span>
              <button onClick={() => removeQuote(index)}>❌ Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;
