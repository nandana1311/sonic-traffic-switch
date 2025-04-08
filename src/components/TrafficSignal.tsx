
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lane } from "@/types/traffic";

interface TrafficSignalProps {
  lane: Lane;
  isActive: boolean;
  timeRemaining: number;
}

const TrafficSignal = ({ lane, isActive, timeRemaining }: TrafficSignalProps) => {
  const [countdown, setCountdown] = useState(timeRemaining);
  
  useEffect(() => {
    setCountdown(timeRemaining);
    
    if (!isActive || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-2">{lane === "lane1" ? "Lane 1" : "Lane 2"}</h3>
      
      <div className="relative w-16 h-40 bg-black rounded-lg p-2 flex flex-col items-center justify-between">
        {/* Red light */}
        <div 
          className={cn(
            "w-12 h-12 rounded-full",
            isActive ? "bg-red-900" : "bg-red-600 animate-pulse"
          )}
        />
        
        {/* Yellow light */}
        <div className="w-12 h-12 rounded-full bg-yellow-900" />
        
        {/* Green light */}
        <div 
          className={cn(
            "w-12 h-12 rounded-full",
            isActive ? "bg-green-600 animate-pulse" : "bg-green-900"
          )}
        />
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-lg font-bold">
          {isActive ? `${countdown}s` : "Waiting"}
        </div>
        <div className="text-sm text-gray-300">
          {isActive ? "Green Signal" : "Red Signal"}
        </div>
      </div>
    </div>
  );
};

export default TrafficSignal;
