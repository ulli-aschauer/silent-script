import React from 'react';

// Beckett-style label: "First|Rest..." — first bold, rest italic accent
const SectionKicker = ({ text, onDark = false }) => {
  const [first, rest = ''] = text.split('|');
  return (
    <div className="mb-6">
      <span className={`font-serif text-3xl md:text-4xl ${onDark ? 'text-[#F7F3ED]' : 'text-[#14110F]'}`}>{first}</span>
      <span className="font-serif italic text-2xl md:text-3xl text-[#C1613E] ml-2">{rest}</span>
    </div>
  );
};

export default SectionKicker;
