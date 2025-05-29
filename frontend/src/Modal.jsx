import React from 'react';

// The Modal component displays a message and a close button.

export const Modal = ({ message, onClose }) => {
  return (
    // Fixed overlay that covers the entire screen, with a semi-transparent black background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
     
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full flex flex-col items-center justify-center space-y-4">
       
        <p className="text-xl font-semibold text-gray-800 text-center">{message}</p>
        
        <button
          onClick={onClose} // Calls the onClose function passed as a prop
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
