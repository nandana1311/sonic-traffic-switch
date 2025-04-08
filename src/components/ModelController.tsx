
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { Lane, ModelResult, ModelStatus } from "@/types/traffic";
import { runYoloModel, runAudioModel } from "@/lib/modelUtils";
import { cn } from "@/lib/utils";

interface ModelControllerProps {
  activeLane: Lane;
  onVehicleCountUpdate: (lane: Lane, count: number) => void;
  onEmergencyDetection: (lane: Lane, isEmergency: boolean) => void;
  isRunning: boolean;
}

// This component handles loading and running the ML models
const ModelController = forwardRef<unknown, ModelControllerProps>(
  ({ activeLane, onVehicleCountUpdate, onEmergencyDetection, isRunning }, ref) => {
    const [modelStatus, setModelStatus] = useState<ModelStatus>({
      yolo: "idle",
      audio: "idle",
    });
    const [logs, setLogs] = useState<string[]>([]);
    
    // References to video elements where we'll get frames for processing
    const lane1VideoRef = useRef<HTMLVideoElement | null>(null);
    const lane2VideoRef = useRef<HTMLVideoElement | null>(null);
    
    // Audio context for processing audio
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioAnalyserRef = useRef<AnalyserNode | null>(null);
    
    // Intervals for processing
    const yoloIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Flag to track if we're using simulation due to model errors
    const [isSimulation, setIsSimulation] = useState(false);
    
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
    
    // Initialize audio context if supported
    useEffect(() => {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          audioContextRef.current = new AudioContext();
          audioAnalyserRef.current = audioContextRef.current.createAnalyser();
          audioAnalyserRef.current.fftSize = 2048;
        } catch (error) {
          console.error("Error creating AudioContext:", error);
          setIsSimulation(true);
          addLog("⚠️ Audio processing not available - using simulation");
        }
      } else {
        setIsSimulation(true);
        addLog("⚠️ Audio API not supported in this browser - using simulation");
      }
      
      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }, []);
    
    // Start YOLOv5 processing for vehicle detection
    const startYoloProcessing = async () => {
      setModelStatus(prev => ({ ...prev, yolo: "loading" }));
      addLog("Loading YOLOv5 vehicle detection model...");
      
      try {
        // Indicate model is loading
        setModelStatus(prev => ({ ...prev, yolo: "loading" }));
        
        // Attempt to get a frame from video to initialize model
        await runYoloModel(document.createElement('video'));
        
        // If successful, set status to running
        setModelStatus(prev => ({ ...prev, yolo: "running" }));
        addLog("YOLOv5 model loaded successfully");
        
        // Start processing video frames
        yoloIntervalRef.current = setInterval(async () => {
          try {
            // Get video element for active lane
            const videoElement = activeLane === "lane1" 
              ? lane1VideoRef.current 
              : lane2VideoRef.current;
            
            if (!videoElement) {
              // If no video element, use simulation
              const simulatedData = await runYoloModel(document.createElement('video'));
              addLog(`YOLOv5 detected ${simulatedData.count} vehicles in ${activeLane} (simulated)`);
              onVehicleCountUpdate(activeLane, simulatedData.count);
              return;
            }
            
            // Run YOLOv5 on video frame
            const vehicleData = await runYoloModel(videoElement);
            addLog(`YOLOv5 detected ${vehicleData.count} vehicles in ${activeLane}`);
            onVehicleCountUpdate(activeLane, vehicleData.count);
          } catch (error) {
            console.error("Error in YOLOv5 processing interval:", error);
            setIsSimulation(true);
          }
        }, 3000);
      } catch (error) {
        console.error("Error starting YOLOv5:", error);
        setModelStatus(prev => ({ 
          ...prev, 
          yolo: "error",
          error: "Failed to load YOLOv5 model" 
        }));
        setIsSimulation(true);
        addLog("⚠️ YOLOv5 model failed to load - using simulation instead");
        
        // Fall back to simulation
        yoloIntervalRef.current = setInterval(() => {
          const randomVehicleCount = Math.floor(Math.random() * 15) + 1;
          addLog(`YOLOv5 detected ${randomVehicleCount} vehicles in ${activeLane} (simulated)`);
          onVehicleCountUpdate(activeLane, randomVehicleCount);
        }, 3000);
      }
    };
    
    // Process audio for emergency vehicle detection
    const startAudioProcessing = async () => {
      setModelStatus(prev => ({ ...prev, audio: "loading" }));
      addLog("Loading audio classification model...");
      
      try {
        // Attempt to initialize audio model
        const dummyAudioData = new Float32Array(44100);
        await runAudioModel(dummyAudioData);
        
        setModelStatus(prev => ({ ...prev, audio: "running" }));
        addLog("Audio model loaded successfully");
        
        // Start processing audio
        audioIntervalRef.current = setInterval(async () => {
          try {
            // Get audio data if available
            if (audioAnalyserRef.current) {
              const dataArray = new Float32Array(audioAnalyserRef.current.fftSize);
              audioAnalyserRef.current.getFloatTimeDomainData(dataArray);
              
              // Process audio data to detect emergency sirens
              const hasEmergency = await runAudioModel(dataArray);
              
              // Check emergency for both lanes (in real implementation, 
              // you might have separate audio sources for each lane)
              const lane1Emergency = hasEmergency && Math.random() < 0.5;
              const lane2Emergency = hasEmergency && !lane1Emergency;
              
              handleEmergencyUpdate("lane1", lane1Emergency);
              handleEmergencyUpdate("lane2", lane2Emergency);
            } else {
              // Fallback to simulation
              simulateEmergencyDetection();
            }
          } catch (error) {
            console.error("Error in audio processing interval:", error);
            simulateEmergencyDetection();
          }
        }, 5000);
      } catch (error) {
        console.error("Error starting audio processing:", error);
        setModelStatus(prev => ({ 
          ...prev, 
          audio: "error",
          error: "Failed to load audio model" 
        }));
        setIsSimulation(true);
        addLog("⚠️ Audio model failed to load - using simulation instead");
        
        // Fall back to simulation
        audioIntervalRef.current = setInterval(() => {
          simulateEmergencyDetection();
        }, 8000);
      }
    };
    
    const simulateEmergencyDetection = () => {
      // 10% chance of emergency in each lane
      const lane1Emergency = Math.random() < 0.1;
      const lane2Emergency = Math.random() < 0.1;
      
      handleEmergencyUpdate("lane1", lane1Emergency);
      handleEmergencyUpdate("lane2", lane2Emergency);
    };
    
    const handleEmergencyUpdate = (lane: Lane, isEmergency: boolean) => {
      if (isEmergency) {
        addLog(`⚠️ Emergency siren detected in ${lane === "lane1" ? "Lane 1" : "Lane 2"} ${isSimulation ? "(simulated)" : ""}`);
        onEmergencyDetection(lane, true);
        
        // Clear emergency after 5 seconds
        setTimeout(() => {
          onEmergencyDetection(lane, false);
          addLog(`Emergency in ${lane === "lane1" ? "Lane 1" : "Lane 2"} cleared`);
        }, 5000);
      }
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
              <div className={cn(
                "px-2 py-1 text-xs rounded-full",
                modelStatus.yolo === "running" 
                  ? "bg-green-900 text-green-300" 
                  : modelStatus.yolo === "loading"
                  ? "bg-yellow-900 text-yellow-300"
                  : modelStatus.yolo === "error"
                  ? "bg-red-900 text-red-300"
                  : "bg-gray-600 text-gray-300"
              )}>
                {modelStatus.yolo === "running" ? "Running" : 
                 modelStatus.yolo === "loading" ? "Loading..." :
                 modelStatus.yolo === "error" ? "Error" : "Idle"}
              </div>
            </div>
            <div className="text-sm mt-1 text-gray-300">
              Current focus: {activeLane === "lane1" ? "Lane 1" : "Lane 2"}
              {isSimulation && modelStatus.yolo === "running" && (
                <span className="ml-2 text-yellow-400">(Simulation mode)</span>
              )}
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Audio Model</h3>
              <div className={cn(
                "px-2 py-1 text-xs rounded-full",
                modelStatus.audio === "running" 
                  ? "bg-green-900 text-green-300" 
                  : modelStatus.audio === "loading" 
                  ? "bg-yellow-900 text-yellow-300"
                  : modelStatus.audio === "error"
                  ? "bg-red-900 text-red-300"
                  : "bg-gray-600 text-gray-300"
              )}>
                {modelStatus.audio === "running" ? "Running" : 
                 modelStatus.audio === "loading" ? "Loading..." :
                 modelStatus.audio === "error" ? "Error" : "Idle"}
              </div>
            </div>
            <div className="text-sm mt-1 text-gray-300">
              Monitoring both lanes for emergency sounds
              {isSimulation && modelStatus.audio === "running" && (
                <span className="ml-2 text-yellow-400">(Simulation mode)</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 p-2 rounded h-36 overflow-y-auto font-mono text-xs">
          <div className="text-gray-400 mb-1">Model processing logs:</div>
          {logs.map((log, index) => (
            <div key={index} className="py-1 border-b border-gray-800">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{" "}
              <span className={cn(
                log.includes("⚠️") ? "text-yellow-400" : "text-green-400"
              )}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500 italic">No logs yet</div>
          )}
        </div>
        
        {modelStatus.yolo === "error" || modelStatus.audio === "error" ? (
          <div className="bg-red-950/30 border border-red-900/50 text-red-200 p-3 rounded text-sm">
            <p>
              <strong>Error:</strong> {modelStatus.error || "Failed to load one or more models. Using simulation instead."}
            </p>
          </div>
        ) : isSimulation ? (
          <div className="bg-yellow-950/30 border border-yellow-900/50 text-yellow-200 p-3 rounded text-sm">
            <p>
              <strong>Note:</strong> Using simulation mode. Some browser features required for model inference 
              may not be available or supported in your browser.
            </p>
          </div>
        ) : (
          <div className="bg-green-950/30 border border-green-900/50 text-green-200 p-3 rounded text-sm">
            <p>
              <strong>Note:</strong> This implementation attempts to use real YOLOv5 and audio classification models 
              to process video and audio data. Performance may vary depending on your device capabilities.
            </p>
          </div>
        )}
      </div>
    );
  }
);

ModelController.displayName = "ModelController";

export default ModelController;
