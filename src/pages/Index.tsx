
import { useEffect, useState, useRef } from "react";
import TrafficSignal from "@/components/TrafficSignal";
import VideoDisplay from "@/components/VideoDisplay";
import VehicleCounter from "@/components/VehicleCounter";
import EmergencyIndicator from "@/components/EmergencyIndicator";
import ModelController from "@/components/ModelController";
import { Lane, EmergencyStatus } from "@/types/traffic";

const Index = () => {
  const [activeLane, setActiveLane] = useState<Lane>("lane1");
  const [vehicleCounts, setVehicleCounts] = useState({ lane1: 0, lane2: 0 });
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>({
    lane1: false,
    lane2: false,
  });
  const [signalTimes, setSignalTimes] = useState({ lane1: 30, lane2: 30 });
  const [isRunning, setIsRunning] = useState(false);
  const modelController = useRef<any>(null);

  // Start processing when user clicks start
  const handleStart = () => {
    setIsRunning(true);
    if (modelController.current) {
      modelController.current.startProcessing();
    }
  };

  // Stop processing
  const handleStop = () => {
    setIsRunning(false);
    if (modelController.current) {
      modelController.current.stopProcessing();
    }
  };

  // Handle lane switching based on timer or emergency
  useEffect(() => {
    if (!isRunning) return;

    let timer: NodeJS.Timeout;
    
    // Switch lanes if emergency is detected in inactive lane
    if ((activeLane === "lane1" && emergencyStatus.lane2) || 
        (activeLane === "lane2" && emergencyStatus.lane1)) {
      const newLane = activeLane === "lane1" ? "lane2" : "lane1";
      console.log(`Emergency detected! Switching to ${newLane}`);
      setActiveLane(newLane);
    } else {
      // Normal timer-based switching
      const currentTime = signalTimes[activeLane];
      timer = setTimeout(() => {
        const newLane = activeLane === "lane1" ? "lane2" : "lane1";
        console.log(`Timer completed. Switching to ${newLane}`);
        setActiveLane(newLane);
      }, currentTime * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeLane, emergencyStatus, isRunning, signalTimes]);

  // Update signal times based on vehicle counts
  useEffect(() => {
    if (!isRunning) return;
    
    const totalVehicles = vehicleCounts.lane1 + vehicleCounts.lane2;
    if (totalVehicles === 0) return;

    // Calculate dynamic signal times based on vehicle proportions
    // Minimum 15 seconds, maximum 60 seconds
    const lane1Time = Math.max(15, Math.min(60, Math.round(30 * (vehicleCounts.lane1 / totalVehicles))));
    const lane2Time = Math.max(15, Math.min(60, Math.round(30 * (vehicleCounts.lane2 / totalVehicles))));
    
    setSignalTimes({ lane1: lane1Time, lane2: lane2Time });
    
    console.log(`Updated signal times: Lane 1: ${lane1Time}s, Lane 2: ${lane2Time}s`);
  }, [vehicleCounts, isRunning]);

  // Handle vehicle count updates
  const handleVehicleCountUpdate = (lane: Lane, count: number) => {
    setVehicleCounts(prev => ({ ...prev, [lane]: count }));
  };

  // Handle emergency detection
  const handleEmergencyDetection = (lane: Lane, isEmergency: boolean) => {
    setEmergencyStatus(prev => ({ ...prev, [lane]: isEmergency }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Intelligent Traffic Management System
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Video Displays */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VideoDisplay 
                lane="lane1" 
                isActive={activeLane === "lane1"}
                hasEmergency={emergencyStatus.lane1}
              />
              <VideoDisplay 
                lane="lane2" 
                isActive={activeLane === "lane2"}
                hasEmergency={emergencyStatus.lane2}
              />
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Model Controller</h2>
              <ModelController 
                ref={modelController}
                activeLane={activeLane}
                onVehicleCountUpdate={handleVehicleCountUpdate}
                onEmergencyDetection={handleEmergencyDetection}
                isRunning={isRunning}
              />
              
              <div className="flex justify-center mt-4 space-x-4">
                <button 
                  onClick={handleStart}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md disabled:opacity-50"
                >
                  Start Processing
                </button>
                <button 
                  onClick={handleStop}
                  disabled={!isRunning}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md disabled:opacity-50"
                >
                  Stop Processing
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Stats and Controls */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Traffic Signals</h2>
              <div className="grid grid-cols-2 gap-4">
                <TrafficSignal 
                  lane="lane1" 
                  isActive={activeLane === "lane1"} 
                  timeRemaining={activeLane === "lane1" ? signalTimes.lane1 : 0}
                />
                <TrafficSignal 
                  lane="lane2" 
                  isActive={activeLane === "lane2"} 
                  timeRemaining={activeLane === "lane2" ? signalTimes.lane2 : 0}
                />
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Vehicle Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <VehicleCounter lane="lane1" count={vehicleCounts.lane1} />
                <VehicleCounter lane="lane2" count={vehicleCounts.lane2} />
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Emergency Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <EmergencyIndicator lane="lane1" isActive={emergencyStatus.lane1} />
                <EmergencyIndicator lane="lane2" isActive={emergencyStatus.lane2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
