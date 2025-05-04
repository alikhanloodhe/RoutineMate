// components/habit/CalendarView.jsx
import React from 'react';

const CalendarView = ({ habit, trackingData = [] }) => {
  // Calculate the date range (current month by default)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Create an array of dates for the current month
  const daysInMonth = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate()+ 1)) {
    daysInMonth.push(new Date(d));
  }
  
  // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  
  // Days of the week header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create a lookup for completed dates
  const completedDates = {};
  if (Array.isArray(trackingData)) {
    trackingData.forEach(item => {
      if (item && item.completed) {
        // const dateStr = new Date(item.date).toISOString().split('T')[0];
        const dateStr = new Date(item.date).toLocaleDateString('en-CA');

        console.log("Date String:",dateStr);
        completedDates[dateStr] = true;
        
      }
    });
  }
  
  // Format month name
  const monthName = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  
  return (
    <div className="mb-8">
  
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <div className="text-center mb-4">
          <h4 className="text-lg font-medium text-gray-700">{monthName} {year}</h4>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10" />
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(date => {
            const dateStr = date.toLocaleDateString('en-CA');

            const isCompleted = completedDates[dateStr];
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today && !isToday;
            
            return (
              <div 
                key={dateStr}
                className={`
                  h-10 flex items-center justify-center rounded-lg transition-all duration-200
                  ${isCompleted ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-sm' : 
                    isPast ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-gray-700'}
                  ${isToday ? 'ring-2 ring-blue-500 font-bold' : ''}
                `}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;