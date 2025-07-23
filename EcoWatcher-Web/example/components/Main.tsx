import React from "react";

interface MainProps {
  children: React.ReactNode;
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <main className="h-full overflow-y-auto">
      <div className="container px-6 mx-auto grid">{children}</div>
    </main>
  );
};

export default Main;
