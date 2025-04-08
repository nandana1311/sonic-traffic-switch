
import { pipeline, env } from "@huggingface/transformers";
import { VehicleData } from "@/types/traffic";

// Configure backends with correct type
env.backends = { onnx: { preferredBackend: 'webgpu', fallbackBackends: ['webgl', 'wasm'] } };

// Model types and configurations
export type ModelType = "yolo" | "audio";

export interface ModelConfig {
  modelPath: string;
  inputShape: number[];
  threshold: number;
}

// YOLOv5 model configuration
// Replace this URL with your GitHub raw model file URL
// Example: https://raw.githubusercontent.com/yourusername/yourrepo/main/models/yolov5s.onnx
export const yoloConfig: ModelConfig = {
  modelPath: "onnx-community/yolov5s", // Replace with your GitHub URL
  inputShape: [1, 3, 640, 640],
  threshold: 0.5,
};

// Audio classification model configuration
// Replace this URL with your GitHub raw model file URL
// Example: https://raw.githubusercontent.com/yourusername/yourrepo/main/models/audio-model.onnx
export const audioConfig: ModelConfig = {
  modelPath: "onnx-community/audio-classification", // Replace with your GitHub URL
  inputShape: [1, 1, 44100], // 1 second of audio at 44.1kHz
  threshold: 0.7,
};

// Model instances cache
let yoloModel: any = null;
let audioModel: any = null;

// Load the YOLOv5 model
// You can manually call this function to preload the model at startup
export const loadYoloModel = async () => {
  try {
    if (!yoloModel) {
      console.log("Loading YOLOv5 model...");
      
      // If using a GitHub URL, you'll need to load the model slightly differently
      // For Hugging Face model IDs, use pipeline as shown
      // For direct URLs to ONNX files, you can use the 'local' option with the URL
      if (yoloConfig.modelPath.startsWith('http')) {
        // Loading from direct URL
        yoloModel = await pipeline("object-detection", {
          model: yoloConfig.modelPath,
          local: true
        });
      } else {
        // Loading from Hugging Face model ID
        yoloModel = await pipeline("object-detection", yoloConfig.modelPath);
      }
      
      console.log("YOLOv5 model loaded successfully");
    }
    return yoloModel;
  } catch (error) {
    console.error("Error loading YOLOv5 model:", error);
    throw error;
  }
};

// Load the audio classification model
// You can manually call this function to preload the model at startup
export const loadAudioModel = async () => {
  try {
    if (!audioModel) {
      console.log("Loading audio classification model...");
      
      // Similar to YOLO model loading, handle both model IDs and direct URLs
      if (audioConfig.modelPath.startsWith('http')) {
        // Loading from direct URL
        audioModel = await pipeline("audio-classification", {
          model: audioConfig.modelPath,
          local: true
        });
      } else {
        // Loading from Hugging Face model ID
        audioModel = await pipeline("audio-classification", audioConfig.modelPath);
      }
      
      console.log("Audio model loaded successfully");
    }
    return audioModel;
  } catch (error) {
    console.error("Error loading audio model:", error);
    throw error;
  }
};

// Process video frame and run YOLOv5 inference
export const runYoloModel = async (videoElement: HTMLVideoElement): Promise<VehicleData> => {
  try {
    const model = await loadYoloModel();
    
    // If we have the model, run detection
    if (model) {
      const result = await model(videoElement, {
        threshold: yoloConfig.threshold,
      });
      
      // Filter for vehicle classes (car, truck, bus, etc.)
      const vehicleClasses = ["car", "truck", "bus", "motorcycle"];
      const vehicleDetections = result.filter((detection: any) => 
        vehicleClasses.includes(detection.label.toLowerCase())
      );
      
      // Transform to our format
      const boxes = vehicleDetections.map((detection: any) => [
        detection.box.xmin,
        detection.box.ymin,
        detection.box.xmax,
        detection.box.ymax
      ] as [number, number, number, number]);
      
      return {
        count: boxes.length,
        boxes
      };
    }
    
    // Fallback to simulation if model isn't available
    return fallbackYoloSimulation();
  } catch (error) {
    console.error("Error running YOLOv5 inference:", error);
    // Return simulated data when error occurs
    return fallbackYoloSimulation();
  }
};

// Process audio data and run audio classification
export const runAudioModel = async (audioData: Float32Array): Promise<boolean> => {
  try {
    const model = await loadAudioModel();
    
    if (model) {
      const result = await model(audioData);
      
      // Check if any of the classifications include emergency vehicle sounds
      const emergencyClasses = ["siren", "emergency vehicle", "ambulance", "police car"];
      
      for (const classification of result) {
        if (emergencyClasses.some(c => classification.label.toLowerCase().includes(c)) && 
            classification.score > audioConfig.threshold) {
          return true;
        }
      }
      
      return false;
    }
    
    // Fallback
    return fallbackAudioSimulation();
  } catch (error) {
    console.error("Error running audio classification:", error);
    // Return simulated data when error occurs
    return fallbackAudioSimulation();
  }
};

// Fallback simulations if models fail to load or process
const fallbackYoloSimulation = (): VehicleData => {
  console.log("Using fallback simulation for vehicle detection");
  // Simulate vehicle detection with random data
  const count = Math.floor(Math.random() * 10) + 1;
  const boxes: Array<[number, number, number, number]> = [];
  
  for (let i = 0; i < count; i++) {
    const x1 = Math.floor(Math.random() * 400);
    const y1 = Math.floor(Math.random() * 300);
    boxes.push([x1, y1, x1 + 100, y1 + 80]);
  }
  
  return { count, boxes };
};

const fallbackAudioSimulation = (): boolean => {
  console.log("Using fallback simulation for emergency detection");
  // 10% chance of simulating emergency siren
  return Math.random() < 0.1;
};
