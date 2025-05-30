import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OneBook = () => {
  const { category, bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageText, setPageText] = useState('');
  const [freePagesRead, setFreePagesRead] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [purchaseForm, setPurchaseForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/${category}/${bookId}`);
        setBook(res.data);
        fetchPageText(res.data.id, 1);
      } catch (err) {
        setError('Ошибка загрузки книги');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [category, bookId]);

  const fetchPageText = async (bookId, page) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books/${bookId}/pages`, {
        params: { page }
      });
      
      setPageText(res.data.text);
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);

      if (book.isPaid) {
        setFreePagesRead((prev) => new Set(prev).add(page));
      }
    } catch (err) {
      setPageText('Ошибка загрузки страницы');
      console.error(err);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handlePageChange = (newPage) => {
    if (book.isPaid && !freePagesRead.has(newPage) && freePagesRead.size >= 20) {
      setShowPurchaseModal(true); 
      return;
    }

    fetchPageText(book.id, newPage);
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/purchase-requests', {
        bookId: book.id,
        ...purchaseForm
      });
      alert('Спасибо! Мы свяжемся с вами.');
      setShowPurchaseModal(false);
    } catch (err) {
      alert('Ошибка при отправке заявки');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setPurchaseForm({ ...purchaseForm, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!book) return <div>Книга не найдена</div>;

  return (
    <div className="container mt-4">
      <h2>{book.title}</h2>
      <p><strong>Автор:</strong> {book.author}</p>
      <p><strong>Описание:</strong> {book.description}</p>

      {/* Виджет чтения */}
      <ReadingWidget
        currentPage={currentPage}
        totalPages={totalPages}
        pageText={pageText}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onGoToPage={handlePageChange}
        isPaid={book.isPaid}
        freePagesReadCount={freePagesRead.size}
        maxFreePages={20}
        showPurchaseModal={showPurchaseModal}
        purchaseForm={purchaseForm}
        onInputChange={handleInputChange}
        onSubmit={handlePurchaseSubmit}
        onCloseModal={() => setShowPurchaseModal(false)}
      />
    </div>
  );
};

const ReadingWidget = ({
  currentPage,
  totalPages,
  pageText,
  onNextPage,
  onPrevPage,
  onGoToPage,
  isPaid,
  freePagesReadCount,
  maxFreePages,
  showPurchaseModal,
  purchaseForm,
  onInputChange,
  onSubmit,
  onCloseModal
}) => {
  return (
    <div className="border p-3 rounded mt-4 bg-light">
      <h5>Страница {currentPage} из {totalPages}</h5>
      <div className="border rounded p-3 bg-white" style={{ minHeight: "300px", whiteSpace: "pre-wrap" }}>
        {pageText}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-outline-primary" onClick={onPrevPage} disabled={currentPage === 1}>
          ← Предыдущая
        </button>
        <button className="btn btn-outline-primary" onClick={onNextPage} disabled={currentPage === totalPages}>
          Следующая →
        </button>
      </div>

      {showPurchaseModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Купить книгу</h5>
                <button className="btn-close" onClick={onCloseModal}></button>
              </div>
              <div className="modal-body">
                <p>Вы уже прочитали {maxFreePages} бесплатных страниц.</p>
                <form onSubmit={onSubmit}>
                  <div className="mb-2">
                    <label>Имя</label>
                    <input type="text" name="name" className="form-control" onChange={onInputChange} required />
                  </div>
                  <div className="mb-2">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" onChange={onInputChange} required />
                  </div>
                  <div className="mb-2">
                    <label>Телефон</label>
                    <input type="tel" name="phone" className="form-control" onChange={onInputChange} required />
                  </div>
                  <button type="submit" className="btn btn-success w-100 mt-3">Отправить заявку</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneBook;