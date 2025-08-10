import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Constants & Data ---
const WEEKS_IN_YEAR = 52;
const TOTAL_YEARS = 90;
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_IN_YEAR;

const US_PRESIDENTS = [
    { name: 'Jimmy Carter', start: 1977, end: 1981 },
    { name: 'Ronald Reagan', start: 1981, end: 1989 },
    { name: 'George H. W. Bush', start: 1989, end: 1993 },
    { name: 'Bill Clinton', start: 1993, end: 2001 },
    { name: 'George W. Bush', start: 2001, end: 2009 },
    { name: 'Barack Obama', start: 2009, end: 2017 },
    { name: 'Donald Trump', start: 2017, end: 2021 },
    { name: 'Joe Biden', start: 2021, end: 2025 },
];

const IPHONE_RELEASES = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// --- Helper Functions ---
const calculateLifeStats = (birthDateStr) => {
    if (!birthDateStr) return null;
    const now = new Date();
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null;

    const msLived = now.getTime() - birthDate.getTime();
    if (msLived < 0) return { isFuture: true };

    const daysLived = Math.floor(msLived / (1000 * 60 * 60 * 24));
    const weeksLived = Math.floor(daysLived / 7);
    const birthYear = birthDate.getFullYear();
    const yearsLived = now.getFullYear() - birthYear;

    // Core Stats
    const heartbeats = Math.floor(daysLived * 24 * 60 * 70); // Avg 70 bpm
    const fullMoons = Math.floor(daysLived / 29.53);
    const earthRevolutions = yearsLived;
    const kmTraveledAroundSun = Math.floor(daysLived * 24 * 60 * 60 * 29.78);
    const presidentsInLifetime = US_PRESIDENTS.filter(p => p.start >= birthYear || (p.start < birthYear && p.end > birthYear)).map(p => p.name);

    // Fun Estimates
    const mealsEaten = daysLived * 3;
    const hoursSlept = yearsLived * 365 * 8; // Avg 8 hours
    const dreams = hoursSlept * 2; // Avg 2 dreams per hour of REM
    const peopleMet = Math.min(80000, Math.floor(yearsLived * (80000 / 80))); // Capped at 80k people over 80 years
    const iphoneModels = IPHONE_RELEASES.filter(year => year >= birthYear).length;

    return {
        weeksLived, heartbeats, fullMoons, earthRevolutions, kmTraveledAroundSun, presidentsInLifetime,
        mealsEaten, hoursSlept, dreams, peopleMet, iphoneModels, isFuture: false
    };
};

// --- SVG Icons ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

// --- Components ---

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const end = value;
                    if (start === end) return;
                    
                    const duration = 1500;
                    const startTime = performance.now();

                    const animate = (currentTime) => {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const currentVal = Math.floor(progress * (end - start) + start);
                        setDisplayValue(currentVal);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setDisplayValue(end); // Ensure it ends on the exact value
                        }
                    };
                    requestAnimationFrame(animate);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [value]);

    const formatValue = (val) => {
        if (val > 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
        if (val > 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
        if (val > 1000) return val.toLocaleString();
        return val;
    };

    return <span ref={ref}>{formatValue(displayValue)}</span>;
};


const LifeGrid = ({ weeksLived }) => {
    const [isRendered, setIsRendered] = useState(false);
    useEffect(() => { setIsRendered(true); }, []);

    const grid = useMemo(() => Array.from({ length: TOTAL_WEEKS }, (_, i) => {
        const isLived = i < weeksLived;
        const year = Math.floor(i / WEEKS_IN_YEAR);
        const isDecadeMarker = (year + 1) % 10 === 0 && i % WEEKS_IN_YEAR === WEEKS_IN_YEAR - 1;
        
        return (
            <div 
                key={i} 
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-500 ${isLived ? 'bg-gray-800 dark:bg-gray-300' : 'bg-gray-200 dark:bg-gray-700/50'} ${isDecadeMarker ? 'mr-1 md:mr-2' : ''}`}
                style={{ opacity: isRendered ? 1 : 0, transform: isRendered ? 'scale(1)' : 'scale(0)', transitionDelay: `${i * 0.2}ms` }}
                title={`Week ${i + 1}`}
            ></div>
        );
    }), [weeksLived, isRendered]);

    return (
        <div className="flex flex-wrap gap-1 p-4 md:p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg justify-center max-w-4xl mx-auto backdrop-blur-sm">
            {grid}
        </div>
    );
};

const StatCard = ({ label, value, unit, delay = 0 }) => {
    const [isRendered, setIsRendered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsRendered(true);
                        observer.disconnect();
                    }, delay);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);
    
    return (
        <div ref={ref} className={`bg-gray-100/80 dark:bg-gray-800/80 p-5 rounded-lg text-center flex-1 min-w-[160px] backdrop-blur-sm transition-all duration-700 [transform-style:preserve-3d] ${isRendered ? 'opacity-100 [transform:rotateX(0)]' : 'opacity-0 [transform:rotateX(-90deg)]'}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                <AnimatedNumber value={value} />
            </p>
            {unit && <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>}
        </div>
    );
};

const DateInputScreen = ({ onDateSubmit }) => {
    const [birthDate, setBirthDate] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (birthDate) onDateSubmit(birthDate); };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="max-w-md w-full">
                <h1 className="text-3xl md:text-4xl font-light text-gray-800 dark:text-gray-200 mb-2">your life in weeks</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">enter your date of birth to see your life from a new perspective.</p>
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full max-w-xs p-4 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:outline-none transition-shadow" required aria-label="your date of birth" />
                    <button type="submit" className="w-full max-w-xs p-4 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900">visualize</button>
                </form>
            </div>
        </div>
    );
};

const VisualizationScreen = ({ birthDate, onReset, theme, toggleTheme }) => {
    const stats = useMemo(() => calculateLifeStats(birthDate), [birthDate]);
    if (!stats) return <div className="flex items-center justify-center min-h-screen"><p>calculating...</p></div>;
    if (stats.isFuture) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-4">the future is unwritten.</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">please select a date in the past.</p>
            <button onClick={onReset} className="p-3 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-white transition-colors">go back</button>
        </div>
    );

    return (
        <div className="min-h-screen w-full p-4 md:p-8 transition-colors duration-500">
            <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <h1 className="text-xl font-light text-gray-800 dark:text-gray-200">your life in weeks</h1>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" aria-label="toggle theme">{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>
                    <button onClick={onReset} className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">change date</button>
                </div>
            </header>
            
            <main>
                <div className="mb-12">
                    <LifeGrid weeksLived={stats.weeksLived} />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2 px-2 max-w-4xl mx-auto"><span>age 0</span><span>age 90</span></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-lg font-light text-gray-700 dark:text-gray-300 mb-4 text-center">your journey so far</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                           <StatCard label="weeks lived" value={stats.weeksLived} unit="approx." delay={100} />
                           <StatCard label="heartbeats" value={stats.heartbeats} unit="approx." delay={200} />
                           <StatCard label="full moons seen" value={stats.fullMoons} delay={300} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-light text-gray-700 dark:text-gray-300 mb-4 text-center">fun estimates & quirky stats</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                           <StatCard label="meals eaten" value={stats.mealsEaten} unit="approx." delay={100} />
                           <StatCard label="hours slept" value={stats.hoursSlept} unit="approx." delay={200} />
                           <StatCard label="dreams dreamt" value={stats.dreams} unit="approx." delay={300} />
                           <StatCard label="people met" value={stats.peopleMet} unit="estimate" delay={400} />
                        </div>
                    </div>
                     <div>
                        <h2 className="text-lg font-light text-gray-700 dark:text-gray-300 mb-4 text-center">your place in time</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                           <StatCard label="orbits of the sun" value={stats.earthRevolutions} delay={100} />
                           <StatCard label="iphone models released" value={stats.iphoneModels} unit="in your lifetime" delay={200} />
                        </div>
                         <div className="bg-gray-100/80 dark:bg-gray-800/80 p-5 mt-4 rounded-lg text-center backdrop-blur-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">u.s. presidents during your lifetime</p>
                            <p className="text-lg text-gray-900 dark:text-white leading-relaxed">{stats.presidentsInLifetime.join(' • ')}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default function App() {
    const [birthDate, setBirthDate] = useState(null);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleDateSubmit = (date) => setBirthDate(date);
    const handleReset = () => setBirthDate(null);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 font-sans">
            {birthDate ? (
                <VisualizationScreen birthDate={birthDate} onReset={handleReset} theme={theme} toggleTheme={toggleTheme} />
            ) : (
                <DateInputScreen onDateSubmit={handleDateSubmit} />
            )}
        </div>
    );
}