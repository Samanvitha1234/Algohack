import React from "react";

type ProgressBarProps = {
  progress: number; // 0-100
  color?: string; // optional, e.g. "blue", "green"
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = "blue" }) => {
  return (
    <div className="w-full h-2 bg-gray-700 rounded overflow-hidden mt-2">
      <div
        className={`h-full transition-all duration-300 ease-out`}
        style={{
          width: `${progress}%`,
          backgroundColor:
            color === "green"
              ? "#22c55e"
              : color === "blue"
              ? "#3b82f6"
              : "#f97316", // fallback orange
        }}
      />
    </div>
  );
};

export default ProgressBar;
