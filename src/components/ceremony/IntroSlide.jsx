import React from 'react';
import { motion } from 'framer-motion';

export default function IntroSlide() {
  return (
    <div className="ceremony-slide">
      <motion.div 
        className="ceremony-intro-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <span className="ceremony-title-decorative">Hare Krishna</span>
        
        <h1 className="ceremony-main-title">
          Commitment Ceremony
        </h1>
        
        <div className="ceremony-divider-ornament">🪷</div>
        
        <p className="ceremony-subtitle">
          Hampi Yatra • 2026
        </p>
      </motion.div>
    </div>
  );
}
