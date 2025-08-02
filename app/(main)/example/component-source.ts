export const componentString = `
"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ChevronsDown } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registering Chart.js components.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper component for styled lesson cards
const LessonCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className={\`bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm \${className}\`}
  >
    {children}
  </motion.div>
);

// Helper component for section titles
const SectionTitle = ({ children }) => (
  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">{children}</h2>
);

// Helper component for body text
const BodyText = ({ children }) => (
  <p className="text-slate-600 text-base md:text-lg leading-relaxed">{children}</p>
);

// The main JSX Learning Module Component
const GravityAccelerationModule = () => {
  const G = 9.8; // Earth's gravitational acceleration in m/s²
  const MAX_TIME = 5; // Max time for our simulation in seconds
  const [time, setTime] = useState(2); // Initial time for the interactive slider

  // Memoize chart data
  const chartData = useMemo(() => {
    const labels = Array.from({ length: MAX_TIME + 1 }, (_, i) => \`\${i}s\`);
    const velocityLineData = labels.map((_, i) => i * G);
    const interactivePointData = Array(MAX_TIME + 1).fill(null);
    if (time >= 0 && time <= MAX_TIME) {
        interactivePointData[time] = time * G;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Velocity',
          data: velocityLineData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.1,
          borderWidth: 3,
        },
        {
          label: 'Current Velocity',
          data: interactivePointData,
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgb(236, 72, 153)',
          pointRadius: 8,
          pointHoverRadius: 10,
          type: 'line',
        },
      ],
    };
  }, [time]);

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Free-Fall Velocity vs. Time',
        font: { size: 16, family: 'sans-serif' },
        color: '#475569',
      },
      tooltip: {
        enabled: true,
        callbacks: {
            label: (context) => \`Velocity: \${context.parsed.y.toFixed(1)} m/s\`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Velocity (m/s)',
          font: { size: 14, family: 'sans-serif' },
          color: '#64748b'
        },
        grid: { color: '#e2e8f0' }
      },
      x: {
        title: {
          display: true,
          text: 'Time (seconds)',
          font: { size: 14, family: 'sans-serif' },
          color: '#64748b'
        },
        grid: { color: '#f8fafc' }
      },
    },
  }), []);

  return (
    <div className="bg-slate-50 min-h-screen w-full font-sans text-slate-800 flex items-center justify-center p-4">
      <main className="w-full max-w-3xl mx-auto space-y-8">
        <LessonCard>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex justify-center">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-blue-100/70 p-6 rounded-full"
              >
                <ChevronsDown className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
              </motion.div>
            </div>
            <div className="md:col-span-2">
              <SectionTitle>The Magic Number: 9.8 m/s²</SectionTitle>
              <BodyText>
                Here on Earth, gravity gives falling objects a consistent "push". This push is an acceleration, causing an object's speed to increase by about{' '}
                <strong className="text-blue-600 font-semibold">9.8 meters per second</strong> for every second it falls.
                Amazingly, this is true for a bowling ball or a feather (if we ignore air resistance!).
              </BodyText>
            </div>
          </div>
        </LessonCard>

        <LessonCard>
          <SectionTitle>Watching Speed Grow 🌱</SectionTitle>
          <BodyText>
            Because acceleration is constant, the velocity (or speed) of a falling object increases in a perfectly straight line over time. After 1 second, it's going 9.8 m/s. After 2 seconds, 19.6 m/s, and so on.
          </BodyText>
          
          <div className="mt-6">
            <div className="w-full h-64 md:h-80 mb-6">
              <Line options={chartOptions} data={chartData} />
            </div>
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200/80">
                <label htmlFor="time-slider" className="block text-center font-medium text-slate-700 mb-2">
                    Scrub through time to see the velocity change!
                </label>
                <input
                    id="time-slider"
                    type="range"
                    min="0"
                    max={MAX_TIME}
                    step="1"
                    value={time}
                    onChange={(e) => setTime(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={time}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center mt-3 text-center bg-white p-3 rounded-lg shadow-inner-sm"
                    >
                        <div className="w-1/2">
                            <div className="text-xs text-slate-500 uppercase">TIME</div>
                            <div className="text-xl font-bold text-slate-800">{time.toFixed(1)}s</div>
                        </div>
                        <div className="w-1/2 border-l border-slate-200">
                            <div className="text-xs text-slate-500 uppercase">VELOCITY</div>
                            <div className="text-xl font-bold text-blue-600">{(time * G).toFixed(1)} m/s</div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 text-center text-slate-500 text-sm">
            <p>Pretty neat, right? This linear relationship is a fundamental part of how gravity works near a planet's surface. 🎉</p>
          </div>
        </LessonCard>
      </main>
    </div>
  );
};

export default GravityAccelerationModule;
`;