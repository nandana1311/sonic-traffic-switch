
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Lane } from "@/types/traffic";

interface VideoDisplayProps {
  lane: Lane;
  isActive: boolean;
  hasEmergency: boolean;
}

const VideoDisplay = ({ lane, isActive, hasEmergency }: VideoDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // In a real implementation, we would update the canvas with video frames
  // Here we're just creating a placeholder that simulates a video feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw road background
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw lane markings
    ctx.strokeStyle = "#FFF";
    ctx.setLineDash([15, 15]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Draw some placeholder vehicles
    drawPlaceholderVehicles(ctx, canvas.width, canvas.height);
    
    // Add an emergency vehicle if needed
    if (hasEmergency) {
      drawEmergencyVehicle(ctx, canvas.width, canvas.height);
    }
    
    // Add a border to indicate the active lane
    if (isActive) {
      ctx.strokeStyle = "#4ADE80";
      ctx.setLineDash([]);
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
    
  }, [isActive, hasEmergency]);
  
  const drawPlaceholderVehicles = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ) => {
    // Just drawing some colorful rectangles to represent vehicles
    const colors = ["#3B82F6", "#EC4899", "#F97316", "#A855F7", "#14B8A6"];
    const vehicleCount = Math.floor(Math.random() * 6) + 2;
    
    for (let i = 0; i < vehicleCount; i++) {
      const carWidth = 40;
      const carHeight = 80;
      const x = Math.random() * (width - carWidth);
      const y = Math.random() * (height - carHeight);
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, y, carWidth, carHeight);
    }
  };
  
  const drawEmergencyVehicle = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ) => {
    // Draw an emergency vehicle with flashing light effect
    const x = width / 2 - 30;
    const y = height / 2 - 80;
    
    // Vehicle body
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x, y, 60, 100);
    
    // Flashing lights
    const flashingColor = Date.now() % 1000 < 500 ? "#FF0000" : "#0000FF";
    ctx.fillStyle = flashingColor;
    ctx.fillRect(x, y, 60, 15);
    
    // Add emergency text
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 16px Arial";
    ctx.fillText("EMERGENCY", x - 30, y + 130);
  };
  
  return (
    <div className={cn(
      "bg-gray-800 p-4 rounded-lg",
      hasEmergency && "ring-2 ring-red-500"
    )}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">
          {lane === "lane1" ? "Lane 1" : "Lane 2"}
        </h3>
        <div className={cn(
          "px-2 py-1 rounded text-sm",
          isActive 
            ? "bg-green-700 text-white" 
            : "bg-gray-700 text-gray-300"
        )}>
          {isActive ? "Active" : "Inactive"}
        </div>
      </div>
      
      <div className="relative aspect-video bg-gray-900 rounded overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full"
        />
        
        {hasEmergency && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-1 rounded-full animate-pulse">
            <span className="block w-2 h-2 rounded-full bg-white"></span>
            <span className="text-sm font-medium">Emergency</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-gray-400">
        Video feed with YOLO detection
      </div>
    </div>
  );
};

export default VideoDisplay;
