import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Camera, RefreshCw, Image as ImageIcon } from 'lucide-react';

export default function FaceScanner() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 720, height: 1280 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or unavailabe.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    
    // Draw the current video frame onto the canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Flip horizontal for mirror effect
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate Face Embedding Analysis
    setTimeout(() => {
      stopCamera();
      navigate(`/event/${id}/results`);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] p-4 max-w-md mx-auto w-full animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Find Your Photos</h1>
        <p className="text-muted-foreground mt-1">Center your face in the frame.</p>
      </div>

      <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 ring-4 ring-muted">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <p className="font-medium text-red-500 mb-4">{error}</p>
            <Button onClick={startCamera} variant="outline" className="glass">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
            
            {/* Overlay grid / frame */}
            <div className="absolute inset-0 border-4 border-primary/30 m-8 rounded-full border-dashed animate-pulse opacity-50 pointer-events-none" />
            
            {/* Scanning Overlay Effect */}
            {scanning && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white font-medium drop-shadow-md">Analyzing Face Embeddings...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="py-8 flex justify-center mt-auto">
        <button 
          onClick={capturePhoto}
          disabled={!!error || scanning}
          className="w-20 h-20 rounded-full bg-white/10 border-[6px] border-primary flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          aria-label="Capture face"
        >
          <div className="w-14 h-14 bg-primary rounded-full" />
        </button>
      </div>
    </div>
  );
}
