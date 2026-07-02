import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Download, Upload, Sliders, 
  List, FileSpreadsheet, Eye, Maximize2, Minimize2, 
  Search, RotateCcw, Edit3, ArrowLeft, Check, Sparkles 
} from 'lucide-react';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

// Constant default paths
const DEFAULT_XLSX_PATH = '/assets/Welcome/Welcome.xlsx';
const HAMPI_BG_PATH = '/assets/Hampi.jpg';
const GNH_LOGO_PATH = '/assets/GNHLogo.png';

// Font mapping presets
const FONT_PRESETS = [
  { name: 'Serif (Georgia)', value: "'Cormorant Garamond', Georgia, serif", pptValue: 'Georgia' },
  { name: 'Classic (Times)', value: "'Cinzel', 'Times New Roman', serif", pptValue: 'Times New Roman' },
  { name: 'Modern (Arial)', value: "'Lato', Arial, sans-serif", pptValue: 'Arial' },
  { name: 'Clean (Trebuchet)', value: "'Trebuchet MS', sans-serif", pptValue: 'Trebuchet MS' }
];

// Color presets
const COLOR_PRESETS = [
  { name: 'Elegant Gold', value: '#e2b43b' },
  { name: 'Pure White', value: '#faf5eb' },
  { name: 'Saffron Orange', value: '#ff9933' },
  { name: 'Yellow Sun', value: '#ffd700' }
];

// Logo positions
const LOGO_POSITIONS = [
  { name: 'Top-Right', value: 'top-right', x: 11.8, y: 0.3, w: 1.2, h: 1.2 },
  { name: 'Top-Left', value: 'top-left', x: 0.3, y: 0.3, w: 1.2, h: 1.2 },
  { name: 'Top-Center', value: 'top-center', x: 6.06, y: 0.3, w: 1.2, h: 1.2 },
  { name: 'Bottom-Right', value: 'bottom-right', x: 11.8, y: 6.0, w: 1.2, h: 1.2 }
];

export default function Welcome() {
  const navigate = useNavigate();

  // Settings & Customization States
  const [titleText, setTitleText] = useState('Welcome to GNH Hampi Yatra');
  const [subtitleText, setSubtitleText] = useState('Hampi Yatra 2026');
  const [thankYouText, setThankYouText] = useState('Thank You');
  const [thankYouSubtitle, setThankYouSubtitle] = useState('All Glories to Srila Prabhupada');
  
  const [textColor, setTextColor] = useState('#e2b43b');
  const [fontFamily, setFontFamily] = useState(FONT_PRESETS[0]);
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(0.4); // 0 to 0.8
  const [logoPosition, setLogoPosition] = useState(LOGO_POSITIONS[0]);
  const [customFileLoaded, setCustomFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('Welcome.xlsx (Default)');

  // Slides / Names states
  const [contentSlides, setContentSlides] = useState([]); // List of slide objects: { id, names: [] }
  const [currentIndex, setCurrentIndex] = useState(0); // active slide index (0 = intro, 1..N = content, N+1 = thank you)
  const [direction, setDirection] = useState(0); // for framer-motion transition
  
  // Navigation & playback states
  const [activeTab, setActiveTab] = useState('design'); // 'design' | 'slides' | 'source'
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playDuration, setPlayDuration] = useState(3000); // 3 seconds per slide
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Pre-loaded base64 assets for pptxgenjs
  const [hampiBase64, setHampiBase64] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // References
  const autoplayTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const slideshowContainerRef = useRef(null);

  // Load Hampi BG and Logo as Base64 on mount
  useEffect(() => {
    const loadBase64Assets = async () => {
      try {
        setIsAssetsLoading(true);
        const toBase64 = async (url) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        };
        const h64 = await toBase64(HAMPI_BG_PATH);
        setHampiBase64(h64);
        const l64 = await toBase64(GNH_LOGO_PATH);
        setLogoBase64(l64);
      } catch (err) {
        console.error('Failed to pre-load base64 presentation assets:', err);
      } finally {
        setIsAssetsLoading(false);
      }
    };
    loadBase64Assets();
  }, []);

  // Parse default sheet or uploaded Excel
  const loadExcelFile = async (fileOrUrl, isFile = false) => {
    try {
      let arrayBuffer;
      if (isFile) {
        arrayBuffer = await fileOrUrl.arrayBuffer();
        setFileName(fileOrUrl.name);
        setCustomFileLoaded(true);
      } else {
        const response = await fetch(fileOrUrl);
        arrayBuffer = await response.arrayBuffer();
        setFileName('Welcome.xlsx (Default)');
        setCustomFileLoaded(false);
      }

      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      const parsedGroups = [];
      let currentGroup = [];

      rows.forEach((row, idx) => {
        const cellVal = row[0] ? String(row[0]).trim() : '';
        const lowerVal = cellVal.toLowerCase();
        
        // Skip header lines if present
        if (idx === 0 && (lowerVal === 'name' || lowerVal === 'names' || lowerVal === 'devotee name' || lowerVal === 'devotee names' || lowerVal === 'participant')) {
          return;
        }

        if (cellVal === '') {
          if (currentGroup.length > 0) {
            parsedGroups.push(currentGroup);
            currentGroup = [];
          }
        } else {
          currentGroup.push(cellVal);
        }
      });

      if (currentGroup.length > 0) {
        parsedGroups.push(currentGroup);
      }

      // Map to Slide format
      const formattedSlides = parsedGroups.map((group, idx) => ({
        id: `slide-${idx + 1}-${Date.now()}`,
        names: group
      }));

      setContentSlides(formattedSlides);
      setCurrentIndex(0); // reset player to start slide
    } catch (err) {
      console.error('Error reading/parsing Welcome Excel file:', err);
      alert('Failed to parse Excel file. Please verify it is a valid Excel spreadsheet.');
    }
  };

  // Load default welcome spreadsheet on mount
  useEffect(() => {
    loadExcelFile(DEFAULT_XLSX_PATH, false);
  }, []);

  // Assemble full slideshow slides in order
  const allSlides = useMemo(() => {
    const slides = [];
    
    // 1. Intro slide
    slides.push({
      id: 'intro',
      type: 'intro',
      title: titleText,
      subtitle: subtitleText
    });

    // 2. Content slides
    contentSlides.forEach((slide, idx) => {
      slides.push({
        id: slide.id,
        type: 'content',
        names: slide.names,
        slideNumber: idx + 1
      });
    });

    // 3. Thank you slide
    slides.push({
      id: 'thankyou',
      type: 'thankyou',
      title: thankYouText,
      subtitle: thankYouSubtitle
    });

    return slides;
  }, [contentSlides, titleText, subtitleText, thankYouText, thankYouSubtitle]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      autoplayTimerRef.current = setTimeout(() => {
        handleNext();
      }, playDuration);
    } else {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    }
    return () => clearTimeout(autoplayTimerRef.current);
  }, [isPlaying, currentIndex, playDuration, allSlides.length]);

  // Keyboard navigation inside slideshow container or fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allSlides.length, isFullscreen]);

  // Listen to browser fullscreen event
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleNext = () => {
    if (currentIndex < allSlides.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false); // Stop autoplay when last slide reached
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJump = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const toggleFullscreen = () => {
    const element = slideshowContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Handle slide edit
  const handleEditActiveSlideNames = (text) => {
    const namesList = text.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (currentIndex === 0 || currentIndex === allSlides.length - 1) return;
    
    const contentSlideIdx = currentIndex - 1;
    const updated = [...contentSlides];
    updated[contentSlideIdx] = {
      ...updated[contentSlideIdx],
      names: namesList
    };
    setContentSlides(updated);
  };

  const activeSlide = allSlides[currentIndex] || { type: 'intro' };

  // Calculate dynamic font size based on vertical names list count
  const dynamicFontSize = useMemo(() => {
    if (activeSlide.type !== 'content' || !activeSlide.names) return '3rem';
    const count = activeSlide.names.length;
    if (count <= 2) return '4.2rem';
    if (count <= 4) return '3.4rem';
    if (count <= 6) return '2.6rem';
    return '2.0rem';
  }, [activeSlide]);

  // Quick search and filter slides list
  const filteredSlidesList = useMemo(() => {
    if (!searchTerm) return contentSlides;
    return contentSlides.filter(slide => 
      slide.names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contentSlides, searchTerm]);

  // File Upload Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadExcelFile(file, true);
    }
  };

  const handleResetToDefaultFile = () => {
    loadExcelFile(DEFAULT_XLSX_PATH, false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // PPTX Generation using PptxGenJS
  const handleDownloadPPT = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Create presentation instance
      const pres = new PptxGenJS();
      pres.layout = 'LAYOUT_169'; // Widescreen 16:9 ratio

      // 2. Loop and build slides
      allSlides.forEach((slide) => {
        const pptSlide = pres.addSlide();

        // Background Pic
        if (hampiBase64) {
          pptSlide.background = { data: hampiBase64 };
        }

        // Overlay transparent color rectangle if overlay > 0
        if (bgOverlayOpacity > 0) {
          // Transparency is 0 (solid) to 100 (clear). Opacity is 0 to 1
          const pptTransparency = Math.round((1 - bgOverlayOpacity) * 100);
          pptSlide.addShape(pres.ShapeType.rect, {
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            fill: { color: '000000', transparency: pptTransparency }
          });
        }

        // GNH Logo Overlay
        if (logoBase64) {
          pptSlide.addImage({
            data: logoBase64,
            x: logoPosition.x,
            y: logoPosition.y,
            w: logoPosition.w,
            h: logoPosition.h
          });
        }

        // Prepare fonts/colors without '#' prefix
        const cleanColor = textColor.replace('#', '');
        const cleanFont = fontFamily.pptValue;

        // Slide Header alignment and coords to avoid logo collision
        const isLogoLeft = logoPosition.value === 'top-left';
        const headerX = isLogoLeft ? 8.5 : 0.5;
        const headerW = isLogoLeft ? 4.5 : 8.0;
        const headerAlign = isLogoLeft ? 'right' : 'left';

        pptSlide.addText('GNH Hampi Yatra', {
          x: headerX,
          y: 0.3,
          w: headerW,
          h: 0.4,
          align: headerAlign,
          fontSize: 14,
          fontFace: cleanFont,
          color: cleanColor,
          bold: true
        });

        if (slide.type === 'intro') {
          // Title
          pptSlide.addText(slide.title, {
            x: 1.0,
            y: 2.2,
            w: 11.33,
            h: 1.5,
            align: 'center',
            fontSize: 48,
            fontFace: cleanFont,
            color: cleanColor,
            bold: true
          });
          // Ornament
          pptSlide.addText('🪷', {
            x: 1.0,
            y: 3.8,
            w: 11.33,
            h: 0.6,
            align: 'center',
            fontSize: 28,
            fontFace: cleanFont,
            color: cleanColor
          });
          // Subtitle
          pptSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 4.6,
            w: 11.33,
            h: 1.2,
            align: 'center',
            fontSize: 26,
            fontFace: cleanFont,
            color: 'ffffff',
            italic: true
          });
        } else if (slide.type === 'content') {
          // Names listed vertically
          const listText = slide.names.join('\n');
          const count = slide.names.length;
          
          // Determine PPT size matching dynamicFontSize
          let pptFontSize = 32;
          if (count <= 2) pptFontSize = 46;
          else if (count <= 4) pptFontSize = 38;
          else if (count <= 6) pptFontSize = 30;
          else pptFontSize = 24;

          pptSlide.addText(listText, {
            x: 1.5,
            y: 1.2,
            w: 10.33,
            h: 5.1,
            align: 'center',
            valign: 'middle',
            fontSize: pptFontSize,
            fontFace: cleanFont,
            color: cleanColor,
            bold: true,
            lineSpacing: 1.25
          });
        } else if (slide.type === 'thankyou') {
          // Thank You Text
          pptSlide.addText(slide.title, {
            x: 1.0,
            y: 2.2,
            w: 11.33,
            h: 1.5,
            align: 'center',
            fontSize: 54,
            fontFace: cleanFont,
            color: cleanColor,
            bold: true
          });
          // Ornament
          pptSlide.addText('🪷', {
            x: 1.0,
            y: 3.8,
            w: 11.33,
            h: 0.6,
            align: 'center',
            fontSize: 28,
            fontFace: cleanFont,
            color: cleanColor
          });
          // Subtitle
          pptSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 4.6,
            w: 11.33,
            h: 1.2,
            align: 'center',
            fontSize: 26,
            fontFace: cleanFont,
            color: 'ffffff',
            italic: true
          });
        }
      });

      // 3. Trigger write
      const formattedTitle = titleText.replace(/\s+/g, '_');
      await pres.writeFile({ fileName: `Welcome_${formattedTitle || 'Yatra'}.pptx` });
    } catch (err) {
      console.error('Failed to generate PowerPoint file:', err);
      alert('Error building PowerPoint presentation. Please check your console logs.');
    } finally {
      setIsExporting(false);
    }
  };

  // Sliding transitions configurations
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-grow pt-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-6 pb-12">
        
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl mt-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Yatra Welcome Utility
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide mt-1">
              Welcome PPT & Slideshow Generator
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={handleDownloadPPT}
              disabled={isExporting || isAssetsLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-bold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download PPTX
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Settings */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
            
            {/* Sidebar Tabs */}
            <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'design' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Sliders className="w-4 h-4" />
                Design
              </button>
              <button
                onClick={() => setActiveTab('slides')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'slides' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <List className="w-4 h-4" />
                Slides ({contentSlides.length})
              </button>
              <button
                onClick={() => setActiveTab('source')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'source' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>

            {/* TAB CONTENT: DESIGN SETTINGS */}
            {activeTab === 'design' && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h3 className="text-md font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🎨</span> Custom Styling Preset
                </h3>

                {/* Fonts Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-400">Typography Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_PRESETS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setFontFamily(f)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${fontFamily.name === f.name ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-inner' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300'}`}
                      >
                        <div className="text-[10px] text-slate-500">FONT FACE</div>
                        <div style={{ fontFamily: f.value }} className="truncate mt-0.5">{f.name.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Presets */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-400">Title & Name Color</label>
                  <div className="flex gap-2">
                    {COLOR_PRESETS.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setTextColor(col.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${textColor === col.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: col.value }}
                        title={col.name}
                      >
                        {textColor === col.value && <Check className="w-5 h-5 text-slate-950 font-bold" />}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                </div>

                {/* BG Darkness Overlay */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <label className="font-semibold text-slate-400">Background Overlay Darkness</label>
                    <span className="text-indigo-400 font-bold">{Math.round(bgOverlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={bgOverlayOpacity}
                    onChange={(e) => setBgOverlayOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 italic">Darkens background Hampi photo for optimal legibility.</span>
                </div>

                {/* Logo Placement */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-400">GNH Logo Placement</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LOGO_POSITIONS.map((pos) => (
                      <button
                        key={pos.name}
                        onClick={() => setLogoPosition(pos)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${logoPosition.name === pos.name ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'}`}
                      >
                        {pos.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text customization panels */}
                <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-slate-300">Presentation Banner Slides</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Intro Title</label>
                      <input
                        type="text"
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)}
                        className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Intro Subtitle</label>
                      <input
                        type="text"
                        value={subtitleText}
                        onChange={(e) => setSubtitleText(e.target.value)}
                        className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Thank You Title</label>
                      <input
                        type="text"
                        value={thankYouText}
                        onChange={(e) => setThankYouText(e.target.value)}
                        className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Thank You Subtitle</label>
                      <input
                        type="text"
                        value={thankYouSubtitle}
                        onChange={(e) => setThankYouSubtitle(e.target.value)}
                        className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: SLIDES LIST */}
            {activeTab === 'slides' && (
              <div className="flex flex-col gap-4 max-h-[550px] animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-bold text-indigo-300 uppercase tracking-wider">
                    Slide Indices
                  </h3>
                  <span className="text-xs bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                    Total: {allSlides.length} slides
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search devotee name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleJump(0); // reset preview to show first/intro during filter
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Slides List Scrollable Container */}
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin">
                  
                  {/* Title/Intro slide shortcut */}
                  <button
                    onClick={() => handleJump(0)}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${currentIndex === 0 ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950 hover:border-slate-700 text-slate-300'}`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">BANNER SLIDE</div>
                      <div className="text-sm font-bold truncate">1. Intro Slide</div>
                    </div>
                    <Eye className="w-4 h-4 opacity-40" />
                  </button>

                  {/* Dynamic parsed slides */}
                  {filteredSlidesList.map((slide, listIdx) => {
                    const actualSlideIdx = contentSlides.findIndex(s => s.id === slide.id) + 1;
                    const isActive = currentIndex === actualSlideIdx;
                    return (
                      <button
                        key={slide.id}
                        onClick={() => handleJump(actualSlideIdx)}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${isActive ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950 hover:border-slate-700 text-slate-300'}`}
                      >
                        <div className="truncate flex-grow mr-2">
                          <div className="text-[10px] text-slate-500 font-bold">SLIDE {actualSlideIdx} ({slide.names.length} names)</div>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5 truncate">
                            {slide.names.join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md">
                            {slide.names.length}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Thank you slide shortcut */}
                  <button
                    onClick={() => handleJump(allSlides.length - 1)}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${currentIndex === allSlides.length - 1 ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950 hover:border-slate-700 text-slate-300'}`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">BANNER SLIDE</div>
                      <div className="text-sm font-bold truncate">{allSlides.length}. Thank You Slide</div>
                    </div>
                    <Eye className="w-4 h-4 opacity-40" />
                  </button>

                  {filteredSlidesList.length === 0 && searchTerm && (
                    <div className="text-center py-6 text-slate-500 font-bold text-sm">
                      No names matching search filter.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: SOURCE SELECTOR */}
            {activeTab === 'source' && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h3 className="text-md font-bold text-indigo-300 uppercase tracking-wider">
                  Spreadsheet Source
                </h3>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                  <div className="text-xs text-slate-500 font-bold">CURRENT SOURCE</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="truncate">{fileName}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Slides generated: <span className="text-indigo-400 font-bold">{contentSlides.length}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
                  <label className="text-sm font-semibold text-slate-400">Load Custom Excel File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                    {customFileLoaded && (
                      <button
                        onClick={handleResetToDefaultFile}
                        className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-red-400 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Default
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 leading-normal mt-1 italic">
                    Upload an Excel (.xlsx) file containing devotee names in the first column. Empty rows will create slide breaks.
                  </span>
                </div>
              </div>
            )}

            {/* Quick Name Editor Panel for Active Slide */}
            {currentIndex > 0 && currentIndex < allSlides.length - 1 && (
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    Quick Edit Active Slide Names
                  </label>
                  <span className="text-[10px] text-slate-500">One name per line</span>
                </div>
                <textarea
                  rows={4}
                  value={activeSlide.names ? activeSlide.names.join('\n') : ''}
                  onChange={(e) => handleEditActiveSlideNames(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  placeholder="Type names, one per line..."
                />
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Slide Live Widescreen Preview (referencing Commitments style) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Widescreen 16:9 Presentation Frame Container */}
            <div 
              ref={slideshowContainerRef}
              className={`relative overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl group transition-all duration-300 ${isFullscreen ? 'w-screen h-screen !border-0 !rounded-none z-[1000] fixed inset-0 flex items-center justify-center bg-slate-950' : 'aspect-video w-full'}`}
            >
              
              {/* Background Photo */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.01]"
                style={{ backgroundImage: `url(${HAMPI_BG_PATH})` }}
              />

              {/* Darkening Overlay mask */}
              <div 
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: bgOverlayOpacity }}
              />

              {/* Ambient radial lighting glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,180,59,0.08)_0%,rgba(15,10,36,0)_70%)] pointer-events-none" />

              {/* Dynamic Logo Overlay based on position */}
              <div 
                className={`absolute z-10 transition-all duration-300 flex items-center p-4 md:p-6 ${
                  logoPosition.value === 'top-right' ? 'top-0 right-0' :
                  logoPosition.value === 'top-left' ? 'top-0 left-0' :
                  logoPosition.value === 'top-center' ? 'top-0 left-1/2 -translate-x-1/2' :
                  logoPosition.value === 'bottom-right' ? 'bottom-0 right-0' : 'bottom-0 left-0'
                }`}
              >
                <img 
                  src={GNH_LOGO_PATH} 
                  alt="GNH Logo" 
                  className={`object-contain pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${isFullscreen ? 'h-24 w-24' : 'h-12 w-12 md:h-16 md:w-16'}`}
                />
              </div>

              {/* Slide Header */}
              <div 
                style={{ 
                  fontFamily: fontFamily.value, 
                  color: textColor 
                }}
                className={`absolute z-10 font-bold uppercase tracking-widest opacity-80 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                  isFullscreen ? 'top-6 text-base md:text-lg' : 'top-4 text-[10px] md:text-xs'
                } ${
                  logoPosition.value === 'top-left' ? 'right-6 md:right-8' : 'left-6 md:left-8'
                }`}
              >
                GNH Hampi Yatra
              </div>

              {/* SLIDESHOW CONTENT RENDER WITH ANIMATION */}
              <div className="absolute inset-0 flex flex-col justify-center items-center px-8 md:px-16 text-center select-none">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  {activeSlide.type === 'intro' && (
                    <motion.div
                      key="intro-slide"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col items-center gap-3 md:gap-5"
                    >
                      <span 
                        style={{ fontFamily: fontFamily.value, color: textColor }} 
                        className={`text-xl md:text-3xl font-extrabold tracking-widest block`}
                      >
                        हरे कृष्ण
                      </span>
                      <h2 
                        style={{ fontFamily: fontFamily.value, color: textColor }}
                        className={`text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wider filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
                      >
                        {activeSlide.title}
                      </h2>
                      <div style={{ color: textColor }} className="text-xl md:text-3xl mt-1">🪷</div>
                      <p 
                        style={{ fontFamily: fontFamily.value }}
                        className="text-white text-lg md:text-2xl font-bold tracking-wide italic mt-1 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      >
                        {activeSlide.subtitle}
                      </p>
                    </motion.div>
                  )}

                  {activeSlide.type === 'content' && (
                    <motion.div
                      key={activeSlide.id}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col items-center justify-center w-full h-full max-w-4xl"
                    >
                      <ul className="flex flex-col justify-center items-center gap-1 md:gap-2 leading-relaxed">
                        {activeSlide.names.map((name, nameIdx) => (
                          <li
                            key={`${name}-${nameIdx}`}
                            style={{ 
                              fontFamily: fontFamily.value, 
                              color: textColor,
                              fontSize: isFullscreen ? `calc(${dynamicFontSize} * 1.35)` : dynamicFontSize
                            }}
                            className="font-extrabold filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] tracking-wide select-text cursor-default"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeSlide.type === 'thankyou' && (
                    <motion.div
                      key="thankyou-slide"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col items-center gap-3 md:gap-5"
                    >
                      <span 
                        style={{ fontFamily: fontFamily.value, color: textColor }} 
                        className={`text-xl md:text-3xl font-extrabold tracking-widest block`}
                      >
                        हरे कृष्ण
                      </span>
                      <h2 
                        style={{ fontFamily: fontFamily.value, color: textColor }}
                        className={`text-4xl md:text-6xl font-extrabold leading-tight tracking-wider filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
                      >
                        {activeSlide.title}
                      </h2>
                      <div style={{ color: textColor }} className="text-xl md:text-3xl mt-1">🪷</div>
                      <p 
                        style={{ fontFamily: fontFamily.value }}
                        className="text-white text-lg md:text-2xl font-bold tracking-wide italic mt-1 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      >
                        {activeSlide.subtitle}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom slide counter status bar */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-3 z-10 pointer-events-none select-none">
                <span className="bg-black/75 border border-slate-800 text-[10px] md:text-xs font-bold text-indigo-400 px-3 py-1 rounded-full backdrop-blur-md">
                  Slide {currentIndex + 1} / {allSlides.length} 
                  {activeSlide.type === 'content' && ` (Welcome Group ${activeSlide.slideNumber})`}
                </span>
              </div>

              {/* Left Navigation Overlay Button (visible on hover) */}
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-indigo-600/70 border border-slate-700/60 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Right Navigation Overlay Button (visible on hover) */}
              {currentIndex < allSlides.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-indigo-600/70 border border-slate-700/60 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Fullscreen Button Overlay */}
              <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 bg-black/50 border border-slate-700/60 text-white p-2 rounded-xl hover:bg-indigo-600/75 hover:scale-105 transition-all z-20"
                title={isFullscreen ? 'Exit Fullscreen' : 'Present / Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
              </button>

            </div>

            {/* PLAYER CONTROLS BAR BELOW CANVAS */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              
              {/* Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleJump(0)}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all"
                  title="First Slide"
                >
                  First
                </button>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-2.5 rounded-lg font-bold text-white transition-all ${isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  title={isPlaying ? 'Pause Presentation' : 'Auto Play Presentation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === allSlides.length - 1}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleJump(allSlides.length - 1)}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all"
                  title="Last Slide"
                >
                  Last
                </button>
              </div>

              {/* Slider for Playback Speed */}
              {isPlaying && (
                <div className="flex items-center gap-2 flex-grow max-w-xs justify-end">
                  <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Auto Duration</span>
                  <input
                    type="range"
                    min="1500"
                    max="6000"
                    step="500"
                    value={playDuration}
                    onChange={(e) => setPlayDuration(parseInt(e.target.value))}
                    className="w-24 sm:w-32 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-800"
                  />
                  <span className="text-xs font-bold text-indigo-400">{(playDuration / 1000).toFixed(1)}s</span>
                </div>
              )}

              {/* Short guidelines overlay */}
              <div className="text-[11px] text-slate-500 font-semibold italic text-right sm:ml-auto">
                Press <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono">F</kbd> for fullscreen slideshow. Navigation via <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono">→</kbd>.
              </div>

            </div>

            {/* QUICK PREVIEW & SUMMARY STATISTICS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Devotee Columns</div>
                <div className="text-xl font-black text-indigo-400 mt-1">1</div>
              </div>
              <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Names Count</div>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {contentSlides.reduce((acc, curr) => acc + curr.names.length, 0)}
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Slides Count</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{allSlides.length}</div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
