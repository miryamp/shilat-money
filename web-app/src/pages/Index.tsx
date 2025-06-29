
import React from 'react';
import Categories from '@/components/Categories';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Shilat Money
          </h1>
          <p className="text-gray-600 text-lg">
            Categories
          </p>
        </header>
        <Categories />
      </div>
    </div>
  );
};

export default Index;
