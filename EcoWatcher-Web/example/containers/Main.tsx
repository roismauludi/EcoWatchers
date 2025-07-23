import React from "react";

interface IMain {
  children: React.ReactNode;
}

function Main({ children }: IMain) {
  return (
    <main className="h-full min-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}

export default Main;
