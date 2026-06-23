import React from 'react';
import { motion } from 'framer-motion';

export default function IntroSlide() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1,
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="ceremony-slide">
      <motion.div 
        className="ceremony-intro-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.span className="ceremony-title-decorative" variants={itemVariants}>
          हरे कृष्ण
        </motion.span>
        
        <motion.h1 className="ceremony-main-title" variants={itemVariants}>
          Hampi Yatra 2026
        </motion.h1>
        
        <motion.div className="ceremony-divider-ornament" variants={itemVariants}>
          🪷
        </motion.div>
        
        <motion.div className="ceremony-subtitle-group" variants={itemVariants}>
          <p className="ceremony-subtitle" style={{ fontSize: '2.8rem', fontWeight: 600, margin: '0 0 0.8rem 0', fontFamily: 'var(--ceremony-font-title)' }}>
            Commitment Ceremony
          </p>
          <p className="ceremony-tagline" style={{ fontSize: '1.8rem', color: 'var(--ceremony-gold)', fontStyle: 'italic', margin: 0, opacity: 0.9 }}>
            Taking a Sacred Step Forward
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

