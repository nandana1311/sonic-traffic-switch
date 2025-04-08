
import { cn } from "@/lib/utils";
import { Lane } from "@/types/traffic";
import { useEffect, useRef } from "react";

interface VideoDisplayProps {
  lane: Lane;
  isActive: boolean;
  hasEmergency: boolean;
}

const VideoDisplay = ({ lane, isActive, hasEmergency }: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Update to use the GitHub raw video URLs
  const videoSources = {
    lane1: "https://raw.githubusercontent.com/nandana1311/sonic-traffic-switch/main/lane1.mp4",
    lane2: "https://raw.githubusercontent.com/nandana1311/sonic-traffic-switch/main/lane2.mp4",
  };
  
  // Load and play video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  }, [lane]);
  
  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border-4",
      isActive 
        ? "border-green-500" 
        : "border-gray-700",
      hasEmergency && "border-red-500"
    )}>
      <div className="absolute top-2 left-2 z-10 bg-black/70 px-3 py-1 rounded-full text-sm">
        {lane === "lane1" ? "Lane 1" : "Lane 2"}
        {isActive && <span className="ml-2 text-green-500">(Active)</span>}
        {hasEmergency && <span className="ml-2 text-red-500">(Emergency)</span>}
      </div>
      
      <video 
        ref={videoRef}
        className="w-full h-56 object-cover"
        muted
        loop
        playsInline
      >
        <source src={videoSources[lane]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {!isActive && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-black/70 px-4 py-2 rounded">
            Waiting for green light
          </div>
        </div>
      )}
      
      {hasEmergency && (
        <div className="absolute inset-0 bg-red-900/20 animate-pulse"></div>
      )}
    </div>
  );
};

export default VideoDisplay;
