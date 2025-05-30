import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/BookCard.css';

const BookCard = ({ book }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => setIsClicked(!isClicked);

  return (
    <div 
      className={`book-card ${isClicked ? 'clicked' : ''}`} 
      onClick={handleClick}
    >
      <div className="book-card-body">
        <h5 className="book-title">{book.title}</h5>
        <p className="book-author">Автор: {book.author}</p>
        <p className="book-access">Доступ: {book.access || 'Полный'}</p>

        <Link
          to={`/allbooks/${book.category}/${book.id}`}
          className="details-link"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookCard;