import React from 'react';
import './CategoryItem.css';

function CategoryItem({ name, imageUrl, hasImage, onClick }) {
    return (
        <div className="category-item" onClick={onClick}>
                {hasImage ? (
                    <div className='image-container'>
                    <img 
                        src={imageUrl} 
                        alt={name}
                        className="category-image"
                        onError={(e) => {
                            e.target.src = '/default-category.png';
                        }}
                    />
                     <div className='item-overlay'></div>
                     </div>
                ) : (
                    <div className="category-image-placeholder">
                        <span className="placeholder-text">{name.charAt(0)}</span>
                    </div>
                )}
            <h3 className="category-title">{name}</h3>
        </div>
    );
}

export default CategoryItem;