
import { Lane } from "@/types/traffic";

interface VehicleCounterProps {
  lane: Lane;
  count: number;
}

const VehicleCounter = ({ lane, count }: VehicleCounterProps) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-2">
        {lane === "lane1" ? "Lane 1" : "Lane 2"}
      </h3>
      
      <div className="flex items-center justify-center">
        <div className="text-4xl font-bold">{count}</div>
      </div>
      
      <div className="text-center mt-2 text-sm text-gray-300">
        vehicles detected
      </div>
      
      <div className="mt-3 h-2 bg-gray-600 rounded overflow-hidden">
        <div 
          className="h-full bg-blue-500"
          style={{ width: `${Math.min(100, count * 5)}%` }}
        />
      </div>
    </div>
  );
};

export default VehicleCounter;
