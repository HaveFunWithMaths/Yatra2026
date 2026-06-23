import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

import '../components/ceremony/ceremony.css';
import IntroSlide from '../components/ceremony/IntroSlide';
import DividerSlide from '../components/ceremony/DividerSlide';
import ContentSlide from '../components/ceremony/ContentSlide';
import ThankYouSlide from '../components/ceremony/ThankYouSlide';
import SlideNavigation from '../components/ceremony/SlideNavigation';
const COMMITMENT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1mMEN0UGh9ZCeCg_hcWCpbMhhXcQGtDsb/export?format=xlsx';

export default function CommitmentCeremony() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load and parse Hampi Yatra Google Sheet on mount
  useEffect(() => {
    const loadExcel = async () => {
      try {
        setLoading(true);
        const response = await fetch(COMMITMENT_SHEET_URL);
        if (!response.ok) {
          throw new Error(`Failed to load Hampi Yatra Google Sheet (HTTP status: ${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const expectedSheets = [
          { key: 'prabhupada', match: 'prabhupada', name: 'Prabhupada Ashray', image: '/assets/Commitment/PrabhupadaAshray.jpeg' },
          { key: 'sadhak', match: 'sadhak', name: 'Krishna Sadhak', image: '/assets/Commitment/KrishnaSadhak.webp' },
          { key: 'sevak', match: 'sevak', name: 'Krishna Sevak', image: '/assets/Commitment/KrishnaSevak.jpg' },
          { key: 'shraddhavan', match: 'shraddhavan', name: 'Shraddhavan', image: '/assets/Commitment/Shraddhavan.jpg' }
        ];

        const parsedSlides = [];

        // 1. Add Intro Slide
        parsedSlides.push({
          id: 'intro',
          type: 'intro',
          title: 'Commitment Ceremony',
          subtitle: 'Hampi Yatra 2026'
        });

        // Find sheet matches in order
        const sheetsToProcess = [];
        expectedSheets.forEach(expected => {
          const matchedName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes(expected.match)
          );
          if (matchedName) {
            sheetsToProcess.push({
              rawName: matchedName,
              displayName: expected.name,
              image: expected.image
            });
          }
        });

        // Fallback: if no expected sheets matched, process all sheets in order
        if (sheetsToProcess.length === 0) {
          workbook.SheetNames.forEach(name => {
            const cleanName = name.replace(/\s*\(.*\)/g, '').trim();
            let img = '/assets/Commitment/PrabhupadaAshray.jpeg';
            if (name.toLowerCase().includes('sadhak')) img = '/assets/Commitment/KrishnaSadhak.webp';
            else if (name.toLowerCase().includes('sevak')) img = '/assets/Commitment/KrishnaSevak.jpg';
            else if (name.toLowerCase().includes('shraddhavan')) img = '/assets/Commitment/Shraddhavan.jpg';

            sheetsToProcess.push({
              rawName: name,
              displayName: cleanName,
              image: img
            });
          });
        }

        sheetsToProcess.forEach((sheetInfo) => {
          const worksheet = workbook.Sheets[sheetInfo.rawName];
          if (!worksheet) return;

          // Read sheet as 2D array
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const parsedParticipants = [];
          let currentGroup = [];

          rows.forEach((row, rowIndex) => {
            const colA = row[0] ? String(row[0]).trim() : '';
            const colB = row[1] ? String(row[1]).trim() : '';

            // Skip header row
            if (rowIndex === 0 && (
              colA.toLowerCase().includes('participant') || 
              colA.toLowerCase().includes('name') || 
              colB.toLowerCase().includes('round')
            )) {
              return;
            }

            const isEmptyRow = !colA && !colB;

            if (isEmptyRow) {
              if (currentGroup.length > 0) {
                parsedParticipants.push([...currentGroup]);
                currentGroup = [];
              }
            } else {
              const name = colA;
              const rounds = colB;
              
              if (name) {
                // Format rounds as "X Rounds"
                let roundsStr = '16 Rounds';
                if (rounds) {
                  const numOnly = rounds.replace(/[^0-9]/g, '');
                  roundsStr = numOnly ? `${numOnly} Rounds` : `${rounds} Rounds`;
                }
                currentGroup.push({ name, rounds: roundsStr });
              }
            }
          });

          // Add last group
          if (currentGroup.length > 0) {
            parsedParticipants.push([...currentGroup]);
          }

          if (parsedParticipants.length > 0) {
            // 2. Add Section Divider Slide
            parsedSlides.push({
              id: `divider-${sheetInfo.displayName}`,
              type: 'divider',
              section: sheetInfo.displayName
            });

            // 3. Add Content Slides (Chunked to max 5 participants per slide for visual readability)
            parsedParticipants.forEach((group, idx) => {
              const maxItemsPerSlide = 5;
              for (let i = 0; i < group.length; i += maxItemsPerSlide) {
                const chunk = group.slice(i, i + maxItemsPerSlide);
                parsedSlides.push({
                  id: `content-${sheetInfo.displayName}-${idx}-${i}`,
                  type: 'content',
                  section: sheetInfo.displayName,
                  image: sheetInfo.image,
                  participants: chunk
                });
              }
            });
          }
        });

        // 4. Add Thank You Slide
        parsedSlides.push({
          id: 'thankyou',
          type: 'thankyou'
        });

        setSlides(parsedSlides);
        setError(null);
      } catch (err) {
        console.error("Error reading Commitment.xlsx:", err);
        setError(err.message || "Failed to load commitment presentation data.");
      } finally {
        setLoading(false);
      }
    };

    loadExcel();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (slides.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides, currentIndex]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const renderActiveSlide = () => {
    if (slides.length === 0) return null;
    const activeSlide = slides[currentIndex];

    switch (activeSlide.type) {
      case 'intro':
        return <IntroSlide key="intro" />;
      case 'divider':
        return <DividerSlide key={activeSlide.id} section={activeSlide.section} />;
      case 'content':
        return (
          <ContentSlide 
            key={activeSlide.id} 
            section={activeSlide.section}
            image={activeSlide.image}
            participants={activeSlide.participants}
            direction={direction}
          />
        );
      case 'thankyou':
        return <ThankYouSlide key="thankyou" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="ceremony-fullscreen-container animate-fade-in">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 size={48} className="text-yellow-500 animate-spin" />
          <p className="text-lg text-ceremony-text-muted font-medium">Preparing Hampi Yatra Commitment Ceremony...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ceremony-fullscreen-container animate-fade-in">
        <div className="bg-red-950/50 border border-red-500/40 p-8 rounded-2xl max-w-md text-center shadow-xl">
          <p className="text-red-200 text-lg font-bold mb-2">Error Loading Presentation</p>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <p className="text-xs text-ceremony-text-muted">Please check that Commitment.xlsx exists in src/components/Commitment/ and contains the required tabs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ceremony-fullscreen-container">
      {/* Fixed Logo overlay: outside of slides so it persists */}
      {slides.length > 0 && (
        <div className="ceremony-logo-overlay">
          <img 
            src="/assets/GNHLogo.png" 
            alt="GNH Logo" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {slides.length > 0 && (
        <div className="ceremony-slide-wrapper">
          <AnimatePresence mode="wait" initial={false}>
            {renderActiveSlide()}
          </AnimatePresence>

          <SlideNavigation 
            currentIndex={currentIndex}
            totalSlides={slides.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          <button 
            className="ceremony-fullscreen-btn" 
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      )}
    </div>
  );
}

