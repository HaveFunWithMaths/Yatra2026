import React from 'react';
import { motion } from 'framer-motion';

export default function DividerSlide({ section }) {
  return (
    <div className="ceremony-slide">
      <motion.div 
        className="ceremony-divider-slide"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="ceremony-divider-prefix">Category</span>
        <h2 className="ceremony-divider-title">
          {section}
        </h2>
        <div className="ceremony-divider-line" />
      </motion.div>
    </div>
  );
}
