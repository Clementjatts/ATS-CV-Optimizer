import React from 'react';

export const HeroBackground = () => {
  return (
    <React.Fragment>
      {/* Colorful background elements */}
      <div className='absolute inset-0 opacity-40 pointer-events-none'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse'></div>
        <div className='absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000'></div>
        <div className='absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000'></div>

        {/* Floating geometric shapes */}
        <div className='absolute top-32 right-1/4 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-bounce delay-500'></div>
        <div className='absolute top-64 left-1/3 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-bounce delay-1000'></div>
        <div className='absolute bottom-32 right-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce delay-1500'></div>

        {/* Floating lines */}
        <div className='absolute top-1/4 left-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent rotate-45 animate-pulse delay-2000'></div>
        <div className='absolute bottom-1/4 right-1/4 w-24 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent -rotate-45 animate-pulse delay-3000'></div>
      </div>
    </React.Fragment>
  );
};
