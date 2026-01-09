import React from 'react';

export const Header = () => {
  return (
    <header className='bg-gradient-to-r from-white/90 via-purple-50/90 to-pink-50/90 backdrop-blur-sm shadow-xl border-b border-purple-200/50 relative z-10'>
      <div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          {/* Logo and Title Group */}
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
              <svg
                className='w-7 h-7 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div className='text-left'>
              <h1 className='text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-purple-800 to-pink-800 bg-clip-text text-transparent'>
                ATS CV Optimizer
              </h1>
              <p className='text-sm text-slate-600 font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                AI-Powered Resume Enhancement
              </p>
            </div>
          </div>

          {/* Right Side Content - Feature badges */}
          <div className='hidden md:flex items-center gap-3'>
            <span className='px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-bold rounded-full shadow-sm border border-emerald-200 hover:shadow-md transition-all duration-300 hover:scale-105'>
              ✨ AI-Powered
            </span>
            <span className='px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-bold rounded-full shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-105'>
              🎯 ATS Compatible
            </span>
            <span className='px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-bold rounded-full shadow-sm border border-purple-200 hover:shadow-md transition-all duration-300 hover:scale-105'>
              ⚡ Instant Results
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
