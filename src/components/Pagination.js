import React from 'react';

const Pagination = ({totalItems, currentPage, pageSize = 10, onPageChange, maxPagesToShow = 5}) => {
    if(!totalItems || totalItems <= pageSize) {
        return null;
    }

    const totalPages = Math.ceil(totalItems / pageSize);
    const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

    let startPage = clamp(currentPage - Math.floor(maxPagesToShow / 2), 1, Math.max(1, totalPages - maxPagesToShow + 1));
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
    if(endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for(let p = startPage; p <= endPage; p += 1) {
        pages.push(p);
    }

    const goToPage = (p) => {
        if(p < 1 || p > totalPages || p === currentPage) return;
        onPageChange(p);
    };

    return (
        <nav aria-label="Pagination" className="mt-3">
            <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                        Prev
                    </button>
                </li>
                {startPage > 1 && (
                    <>
                        <li className="page-item">
                            <button className="page-link" onClick={() => goToPage(1)}>1</button>
                        </li>
                        {startPage > 2 && (
                            <li className="page-item disabled"><span className="page-link">…</span></li>
                        )}
                    </>
                )}
                {pages.map((p) => (
                    <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
                    </li>
                ))}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <li className="page-item disabled"><span className="page-link">…</span></li>
                        )}
                        <li className="page-item">
                            <button className="page-link" onClick={() => goToPage(totalPages)}>{totalPages}</button>
                        </li>
                    </>
                )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;

