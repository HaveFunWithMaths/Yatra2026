import React from 'react';
import { motion } from 'framer-motion';

export default function ContentSlide({ section, image, participants, direction }) {
  // Stagger variants for participant names list items
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100vw' : '-100vw',
      opacity: 0.5
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 18 },
        opacity: { duration: 0.4 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? '-100vw' : '100vw',
      opacity: 0.5,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 18 },
        opacity: { duration: 0.4 }
      }
    })
  };

  return (
    <motion.div 
      className="ceremony-slide"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <div className="ceremony-content-grid">
        {/* Left column - Names list */}
        <div className="ceremony-content-left">
          <div className="ceremony-content-header">
            <h3 className="ceremony-content-section-title">{section}</h3>
            <span className="ceremony-content-tagline">Commitment</span>
          </div>

          <motion.ul 
            className="ceremony-participants-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {participants.map((p, idx) => (
              <motion.li 
                key={`${p.name}-${idx}`} 
                className="ceremony-participant-item"
                variants={itemVariants}
              >
                <span className="ceremony-participant-bullet">❀</span>
                <span className="ceremony-participant-name">{p.name}</span>
                <span className="ceremony-participant-rounds-badge">{p.rounds}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Right column - Accent Image */}
        <div className="ceremony-content-right">
          <motion.div 
            className="ceremony-section-image-wrapper"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            <img 
              src={image} 
              alt={section} 
              className="ceremony-section-image" 
              onError={(e) => {
                // If specific section image fails, fall back gracefully
                e.target.src = "/assets/Commitment/PrabhupadaAshray.jpeg";
              }}
            />
            <div className="ceremony-section-image-overlay" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
