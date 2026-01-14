import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`scroll-to-top ${!isVisible ? 'hidden' : ''}`}
            aria-label="Scroll to top"
        >
            <ChevronDownIcon className="w-6 h-6 rotate-180" />
        </button>
    );
};

export default ScrollToTop;
