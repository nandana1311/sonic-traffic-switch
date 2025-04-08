
import { cn } from "@/lib/utils";
import { Lane } from "@/types/traffic";

interface EmergencyIndicatorProps {
  lane: Lane;
  isActive: boolean;
}

const EmergencyIndicator = ({ lane, isActive }: EmergencyIndicatorProps) => {
  return (
    <div className={cn(
      "bg-gray-700 p-4 rounded-lg border-2",
      isActive ? "border-red-500" : "border-transparent"
    )}>
      <h3 className="text-lg font-medium mb-2">
        {lane === "lane1" ? "Lane 1" : "Lane 2"}
      </h3>
      
      <div className={cn(
        "flex flex-col items-center justify-center p-4",
        isActive ? "bg-red-900/20" : "bg-gray-800"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full mb-2",
          isActive ? "bg-red-500 animate-pulse" : "bg-gray-600"
        )} />
        
        <span className="text-lg font-semibold">
          {isActive ? "EMERGENCY" : "No Emergency"}
        </span>
        
        <span className="text-sm text-gray-300 mt-1">
          {isActive 
            ? "Siren detected" 
            : "No siren detected"
          }
        </span>
      </div>
    </div>
  );
};

export default EmergencyIndicator;
