import React, { useState } from 'react';

export default function App() {
  const [message, setMessage] = useState('Hello World');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ATS CV Optimizer</h1>
          <p className="mt-2 text-md text-slate-600">Simple test version</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Test</h2>
          <p>{message}</p>
          <button 
            onClick={() => setMessage('PDF system integration test')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Test Button
          </button>
        </div>
      </main>
    </div>
  );
}