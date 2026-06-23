import React from 'react';
import { motion } from 'framer-motion';

export default function ThankYouSlide() {
  return (
    <div className="ceremony-slide">
      <motion.div 
        className="ceremony-intro-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <span className="ceremony-title-decorative">हरे कृष्ण</span>
        
        <h1 className="ceremony-main-title">
          Thank You
        </h1>
        
        <div className="ceremony-divider-ornament">🪷</div>
        
        <p className="ceremony-subtitle">
          All Glories to Srila Prabhupada
        </p>
      </motion.div>
    </div>
  );
}
