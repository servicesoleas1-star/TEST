import React from 'react';

/**
 * WhatsApp Floating Button
 * Displays a floating WhatsApp button on the bottom-right
 * Links to WhatsApp chat with the support number
 */

export default function WhatsAppFloatingButton({ phoneNumber = '237697123456' }) {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
      aria-label="WhatsApp Support"
      title="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M12.03 2.5c-5.24 0-9.5 4.26-9.5 9.5 0 1.68.44 3.25 1.2 4.62L2.5 21.5l5.02-1.19a9.44 9.44 0 004.51 1.15h.01c5.24 0 9.5-4.26 9.5-9.5s-4.26-9.46-9.51-9.46z" opacity=".15"/>
        <path d="M16.9 14.4c-.23.65-1.15 1.19-1.88 1.34-.5.1-1.16.19-3.38-.73-2.84-1.17-4.66-4.04-4.8-4.22-.14-.19-1.15-1.53-1.15-2.92s.73-2.07.99-2.36c.23-.25.5-.31.67-.31h.48c.15 0 .36-.01.56.43.23.55.78 1.93.85 2.07.07.14.11.3.02.48-.09.19-.14.3-.27.46-.13.16-.28.36-.4.49-.14.14-.27.29-.12.57.16.28.7 1.15 1.5 1.86 1.04.92 1.9 1.21 2.18 1.34.28.14.44.12.6-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.63.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.16 1.34z"/>
      </svg>
    </a>
  );
}
