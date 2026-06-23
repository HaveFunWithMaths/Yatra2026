import React from 'react';

export default function SlideNavigation({ currentIndex, totalSlides }) {
  if (totalSlides <= 0) return null;

  return (
    <div className="ceremony-bottom-bar">
      <div className="ceremony-counter">
        {currentIndex + 1} / {totalSlides}
      </div>
    </div>
  );
}
