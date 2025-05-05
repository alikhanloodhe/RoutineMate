import React from 'react';
import RoutineItem from './RoutineItem';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const RoutineList = ({ 
  routines, 
  onEdit, 
  onDelete, 
  onComplete, 
  onToggleActive,
  onAddNew
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="space-y-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {routines.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
        >
          <div className="w-16 h-16 bg-[#4A2BAF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-[#4A2BAF]" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No routines found</h3>
          <p className="text-gray-500 mb-4">Create a new routine to build better habits</p>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors"
            >
              Create your first routine
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Your Routines</h3>
            <p className="text-sm text-gray-500">{routines.length} routine{routines.length !== 1 ? 's' : ''}</p>
          </div>
          {routines.map(routine => (
            <RoutineItem
              key={routine.id}
              routine={routine}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onToggleActive={onToggleActive}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default RoutineList; 