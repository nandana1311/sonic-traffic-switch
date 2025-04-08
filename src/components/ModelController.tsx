
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Lane, ModelResult } from "@/types/traffic";

interface ModelControllerProps {
  activeLane: Lane;
  onVehicleCountUpdate: (lane: Lane, count: number) => void;
  onEmergencyDetection: (lane: Lane, isEmergency: boolean) => void;
  isRunning: boolean;
}

// This component would contain the actual model inference code in a real implementation
// Here we're just simulating the models' behavior
const ModelController = forwardRef<unknown, ModelControllerProps>(
  ({ activeLane, onVehicleCountUpdate, onEmergencyDetection, isRunning }, ref) => {
    const [modelStatus, setModelStatus] = useState({
      yolo: "idle",
      audio: "idle",
    });
    const [logs, setLogs] = useState<string[]>([]);
    
    const yoloIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      startProcessing: () => {
        startYoloProcessing();
        startAudioProcessing();
      },
      stopProcessing: () => {
        stopYoloProcessing();
        stopAudioProcessing();
      },
    }));
    
    const addLog = (message: string) => {
      setLogs(prev => [message, ...prev].slice(0, 10));
    };
    
    // Simulated YOLO processing for vehicle detection
    const startYoloProcessing = () => {
      setModelStatus(prev => ({ ...prev, yolo: "running" }));
      addLog("Starting YOLO vehicle detection model");
      
      // Simulate processing of the active lane
      yoloIntervalRef.current = setInterval(() => {
        const randomVehicleCount = Math.floor(Math.random() * 15) + 1;
        
        addLog(`YOLO detected ${randomVehicleCount} vehicles in ${activeLane}`);
        onVehicleCountUpdate(activeLane, randomVehicleCount);
        
      }, 3000);
    };
    
    // Simulated audio processing for emergency detection
    const startAudioProcessing = () => {
      setModelStatus(prev => ({ ...prev, audio: "running" }));
      addLog("Starting audio classification model for emergency detection");
      
      // Simulate emergency detection on both lanes
      audioIntervalRef.current = setInterval(() => {
        // 10% chance of emergency in each lane
        const lane1Emergency = Math.random() < 0.1;
        const lane2Emergency = Math.random() < 0.1;
        
        if (lane1Emergency) {
          addLog("⚠️ Emergency siren detected in Lane 1");
          onEmergencyDetection("lane1", true);
          
          // Clear emergency after 5 seconds
          setTimeout(() => {
            onEmergencyDetection("lane1", false);
            addLog("Emergency in Lane 1 cleared");
          }, 5000);
        }
        
        if (lane2Emergency) {
          addLog("⚠️ Emergency siren detected in Lane 2");
          onEmergencyDetection("lane2", true);
          
          // Clear emergency after 5 seconds
          setTimeout(() => {
            onEmergencyDetection("lane2", false);
            addLog("Emergency in Lane 2 cleared");
          }, 5000);
        }
      }, 8000);
    };
    
    const stopYoloProcessing = () => {
      if (yoloIntervalRef.current) {
        clearInterval(yoloIntervalRef.current);
        yoloIntervalRef.current = null;
      }
      setModelStatus(prev => ({ ...prev, yolo: "idle" }));
      addLog("Stopped YOLO vehicle detection model");
    };
    
    const stopAudioProcessing = () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      setModelStatus(prev => ({ ...prev, audio: "idle" }));
      addLog("Stopped audio classification model");
    };
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">YOLO Model</h3>
              <div className={`px-2 py-1 text-xs rounded-full ${
                modelStatus.yolo === "running" 
                  ? "bg-green-900 text-green-300" 
                  : "bg-gray-600 text-gray-300"
              }`}>
                {modelStatus.yolo === "running" ? "Running" : "Idle"}
              </div>
            </div>
            <div className="text-sm mt-1 text-gray-300">
              Current focus: {activeLane === "lane1" ? "Lane 1" : "Lane 2"}
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Audio Model</h3>
              <div className={`px-2 py-1 text-xs rounded-full ${
                modelStatus.audio === "running" 
                  ? "bg-green-900 text-green-300" 
                  : "bg-gray-600 text-gray-300"
              }`}>
                {modelStatus.audio === "running" ? "Running" : "Idle"}
              </div>
            </div>
            <div className="text-sm mt-1 text-gray-300">
              Monitoring both lanes for emergency sounds
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 p-2 rounded h-36 overflow-y-auto font-mono text-xs">
          <div className="text-gray-400 mb-1">Model processing logs:</div>
          {logs.map((log, index) => (
            <div key={index} className="py-1 border-b border-gray-800">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{" "}
              <span className="text-green-400">{log}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500 italic">No logs yet</div>
          )}
        </div>
        
        <div className="bg-yellow-950/30 border border-yellow-900/50 text-yellow-200 p-3 rounded text-sm">
          <p>
            <strong>Note:</strong> This is a simulation of the model behavior. In a real implementation, 
            this component would load and run the YOLOv5 and audio classification models to process 
            actual video and audio data.
          </p>
        </div>
      </div>
    );
  }
);

ModelController.displayName = "ModelController";

export default ModelController;
