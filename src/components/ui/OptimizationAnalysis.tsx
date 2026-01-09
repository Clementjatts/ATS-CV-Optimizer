import { useState } from 'react';
import { CvData } from '../../services/geminiService';

interface OptimizationAnalysisProps {
  optimizedCvData: CvData;
}

export const OptimizationAnalysis = ({ optimizedCvData }: OptimizationAnalysisProps) => {
  const [isAnalysisMinimized, setIsAnalysisMinimized] = useState(false);

  return (
    <div className='bg-gradient-to-br from-white/95 via-emerald-50/95 to-teal-50/95 p-8 rounded-2xl shadow-xl border border-emerald-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-2'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <h2 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent'>
            Optimization Analysis
          </h2>
        </div>
        <button
          onClick={() => setIsAnalysisMinimized(!isAnalysisMinimized)}
          className='text-emerald-600 hover:text-emerald-800 transition-colors duration-200 p-2 rounded-lg hover:bg-emerald-50'
          title={isAnalysisMinimized ? 'Expand Analysis' : 'Minimize Analysis'}
        >
          {isAnalysisMinimized ? (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          ) : (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 15l7-7 7 7'
              />
            </svg>
          )}
        </button>
      </div>

      {/* Success Banner */}
      {!isAnalysisMinimized && (
        <div className='bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-emerald-800'>
              CV Successfully Optimized for ATS
            </h3>
          </div>

          {/* Main Content Grid */}
          <div className='space-y-8'>
            {/* ATS Optimization Section */}
            <div className='bg-white/70 rounded-xl p-6 border border-emerald-100'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-sm'>📋</span>
                </div>
                <h4 className='text-lg font-bold text-slate-800'>ATS Optimization</h4>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-4 h-4 text-white'
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
                    <p className='font-bold text-blue-800'>Format & Structure</p>
                  </div>
                  <ul className='optimization-list optimization-list--blue space-y-2 text-sm text-blue-700'>
                    <li>Clean, scannable format for ATS systems</li>
                    <li>Standard section headers for easy parsing</li>
                    <li>Consistent formatting and structure</li>
                  </ul>
                </div>

                <div className='bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-100'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-4 h-4 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                      </svg>
                    </div>
                    <p className='font-bold text-purple-800'>Content Quality</p>
                  </div>
                  <ul className='optimization-list optimization-list--purple space-y-2 text-sm text-purple-700'>
                    <li>Professional language and action verbs</li>
                    <li>Quantified achievements where possible</li>
                    <li>Industry-standard terminology</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Job Description Matching Section */}
            <div className='bg-white/70 rounded-xl p-6 border border-emerald-100'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-sm'>🎯</span>
                </div>
                <h4 className='text-lg font-bold text-slate-800'>Job Description Matching</h4>
              </div>

              <div className='space-y-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Keywords Section */}
                  <div className='bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-100'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                          />
                        </svg>
                      </div>
                      <p className='font-bold text-amber-800'>Keywords Integrated</p>
                    </div>
                    <p className='text-sm text-amber-700 leading-relaxed'>
                      {optimizedCvData.optimizationDetails.keywordsIntegrated.join(', ')}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className='bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl border border-teal-100'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                          />
                        </svg>
                      </div>
                      <p className='font-bold text-teal-800'>Skills Aligned</p>
                    </div>
                    <p className='text-sm text-teal-700 leading-relaxed'>
                      {optimizedCvData.optimizationDetails.skillsAligned.join(', ')}
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Experience Section */}
                  <div className='bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-100'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6'
                          />
                        </svg>
                      </div>
                      <p className='font-bold text-rose-800'>Experience Optimizations</p>
                    </div>
                    <ul className='optimization-list optimization-list--rose space-y-2 text-sm text-rose-700'>
                      {optimizedCvData.optimizationDetails.experienceOptimizations.map(
                        (optimization, index) => (
                          <li key={index}>{optimization}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Summary Section */}
                  <div className='bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                          />
                        </svg>
                      </div>
                      <p className='font-bold text-indigo-800'>Summary Tailoring</p>
                    </div>
                    <p className='text-sm text-indigo-700 leading-relaxed'>
                      {optimizedCvData.optimizationDetails.summaryTailoring}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className='mt-8 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-xl p-5 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-white text-sm'>💡</span>
              </div>
              <div>
                <p className='text-sm text-emerald-800 leading-relaxed'>
                  <span className='font-bold'>Pro Tip:</span> Your CV has been restructured using a
                  modern template that maximizes ATS compatibility while highlighting your most
                  relevant qualifications for this specific role.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
