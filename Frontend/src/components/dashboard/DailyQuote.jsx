import React from 'react';
import { FiSun } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DailyQuote = ({ quote }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] p-6 rounded-xl shadow-sm text-white mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="p-3 bg-white/10 rounded-xl mr-4">
          <FiSun className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-medium">Daily Inspiration</h2>
          <p className="text-white/90 mt-2 italic">"{quote.text}"</p>
          <p className="text-white/70 text-sm mt-1">— {quote.author}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyQuote; 