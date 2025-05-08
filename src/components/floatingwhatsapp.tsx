"use client";

import React, { useState } from "react";

export function WhatsApp() {
  const [isHovering, setIsHovering] = useState(false);
  
  const handleClick = () => {
    const phoneNumber = "7827303575";
    const formattedNumber = `+91${phoneNumber}`;
    const message = "Hello! I have a question about your services.";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div 
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Tooltip that appears on hover */}
        <div 
          className={`
            absolute bottom-full right-0 mb-3 bg-white rounded-lg shadow-lg p-3
            text-gray-800 whitespace-nowrap pointer-events-none
            transition-all duration-300 ease-in-out transform
            ${isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
        >
          <div className="text-sm font-medium">Chat with us</div>
          <div className="text-xs text-gray-600">Get instant help</div>
          {/* Triangle pointer */}
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white transform rotate-45"></div>
        </div>
        
        {/* WhatsApp button - now the click handler is here */}
        <button
          onClick={handleClick}
          className="flex items-center z-20 justify-center w-14 h-14 cursor-pointer bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          aria-label="Chat on WhatsApp"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            className="w-10 h-10 z-40 fill-white"
          >
            <path d="M17.6 6.32A7.85 7.85 0 0 0 12.025 4c-4.4 0-7.975 3.58-7.975 7.98a7.93 7.93 0 0 0 1.226 4.26L4 20.5l4.342-1.137a7.922 7.922 0 0 0 3.683.9h.003c4.4 0 7.975-3.58 7.975-7.98a7.95 7.95 0 0 0-2.403-5.963zm-5.578 12.28h-.002a6.597 6.597 0 0 1-3.356-.918l-.24-.144-2.5.653.667-2.431-.156-.252a6.533 6.533 0 0 1-1.005-3.53A6.578 6.578 0 0 1 12.024 5.4a6.538 6.538 0 0 1 4.64 1.928 6.566 6.566 0 0 1 1.988 4.652c0 3.637-2.96 6.62-6.63 6.62zm3.626-4.95c-.199-.1-1.177-.583-1.36-.65-.182-.065-.315-.099-.448.1-.133.197-.513.65-.628.783-.115.134-.231.15-.43.05-.198-.099-.839-.308-1.596-.985-.59-.525-.987-1.175-1.103-1.372-.116-.198-.012-.304.087-.403.09-.088.199-.232.299-.348.098-.117.131-.2.197-.332.067-.134.034-.25-.016-.349-.05-.099-.448-1.083-.614-1.482-.162-.388-.326-.336-.448-.343-.115-.006-.249-.008-.382-.008-.133 0-.349.05-.532.249-.182.198-.697.68-.697 1.664 0 .983.714 1.932.813 2.065.1.134 1.402 2.132 3.396 2.992.475.205.845.326 1.133.418.476.152.91.13 1.253.08.382-.057 1.177-.48 1.343-.943.166-.464.166-.86.116-.943-.049-.083-.182-.133-.38-.232z"/>
          </svg>
        </button>
        
       
        {/* Hover ring effect */}
        <span 
          className={`
            absolute inset-0 rounded-full border-2 border-green-300
            transition-all duration-300 ease-out
            ${isHovering ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}
          `}
        ></span>
      </div>
    </div>
  );
}