import { useState, useRef } from 'react';
import { Camera, RefreshCw, Crosshair } from 'lucide-react';
import { analyzeShot, ShotAnalysis } from './services/gemini';
import { motion } from 'motion/react';

export default function App() {
  const [team, setTeam] = useState<'stripes' | 'solids'>('solids');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [analysis, setAnalysis] = useState<ShotAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      setFileUrl(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
      await processImage(selectedFile, team);
    }
  };

  const processImage = async (imageFile: File, selectedTeam: 'stripes' | 'solids') => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    const steps = [
      "Scanning table geometry...",
      "Identifying ball positions...",
      "Mapping cue and target balls...",
      "Calculating physics & trajectories...",
      "Finalizing optimal shot..."
    ];
    setLoadingMessage(steps[0]);

    let progress = 0;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      progress += (90 - progress) * 0.15;
      setLoadingProgress(progress);
      
      const expectedStep = Math.min(Math.floor(progress / 18), steps.length - 1);
      if (expectedStep > stepIndex) {
        stepIndex = expectedStep;
        setLoadingMessage(steps[stepIndex]);
      }
    }, 400);

    try {
      const result = await analyzeShot(imageFile, selectedTeam);
      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingMessage("Analysis complete!");
      
      // Short delay so the user sees 100% completion
      await new Promise(resolve => setTimeout(resolve, 600));
      setAnalysis(result);
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setError(err.message || "Failed to analyze shot. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      {/* Decor lighting effects */}
      <div className="absolute -top-24 -left-32 w-64 h-64 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full"></div>
      <div className="absolute -bottom-24 -right-32 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full"></div>

      <header className="px-6 py-4 flex flex-col gap-4 relative z-10 border-b border-white/5">
        <div className="max-w-md mx-auto w-full flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">PoolPro <span className="text-cyan-400">AI</span></h1>
          <div className="p-2 bg-white/5 rounded-full">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-20 relative z-10">
        {/* Team selector */}
        <div className="bg-black/40 p-1 rounded-2xl flex gap-1 mb-6 border border-white/10 relative z-10">
          <button
            onClick={() => { 
              setTeam('solids'); 
              if (fileUrl && team !== 'solids') {
                setAnalysis(null); 
              }
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              team === 'solids' 
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg text-white' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Solids
          </button>
          <button
            onClick={() => { 
              setTeam('stripes'); 
              if (fileUrl && team !== 'stripes') {
                setAnalysis(null); 
              }
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              team === 'stripes' 
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg text-white' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Stripes
          </button>
        </div>

        {/* Action Area */}
        {!fileUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <label className="flex flex-col items-center justify-center w-full h-64 border border-white/5 rounded-[32px] bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group shadow-inner relative overflow-hidden backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform mb-4">
                <div className="w-12 h-12 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center">
                   <Camera className="w-6 h-6 text-black" />
                </div>
              </div>
              <span className="text-sm font-medium tracking-wide text-white/80 uppercase">Tap to Capture Table</span>
              <span className="text-xs text-white/40 mt-2 max-w-[200px] text-center">Take a wide overhead photo of the entire table</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
            </label>
          </motion.div>
        )}

        {/* Preview & Analysis Area */}
        {fileUrl && (
          <div className="space-y-6">
            {!analysis && (
              <div className="relative w-full rounded-[32px] overflow-hidden bg-black/40 border border-white/5 shadow-inner flex items-center justify-center min-h-[300px] backdrop-blur-sm">
                <img 
                  src={fileUrl} 
                  alt="Pool table" 
                  className={`w-full max-h-[65vh] object-contain block transition-opacity duration-500 ${loading ? 'opacity-30 blur-sm' : 'opacity-100'}`} 
                />

                {/* Loading overlay indicator */}
                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm">
                    {/* Scanner line effect */}
                    <motion.div 
                      animate={{ y: ["-150px", "150px"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatType: "reverse" }}
                      className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-0 opacity-70"
                    />
                    
                    <div className="relative z-10 w-full max-w-[85%] bg-black/60 backdrop-blur-xl p-6 rounded-[24px] border border-cyan-500/30 shadow-2xl flex flex-col items-center">
                      <div className="relative mb-5">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-cyan-400 rounded-full blur-[6px]"></div>
                      </div>
                      
                      <span className="text-[11px] font-medium text-cyan-100 tracking-[0.2em] uppercase mb-1 h-4 text-center">
                        {loadingMessage}
                      </span>
                      
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-4 mb-2">
                         <motion.div 
                           className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                           animate={{ width: `${loadingProgress}%` }}
                           transition={{ duration: 0.3, ease: 'easeOut' }}
                         />
                      </div>
                      
                      <div className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">
                         {Math.round(loadingProgress)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simulated 2D Table View */}
            {analysis && !loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col pt-2"
              >
                <div className="flex justify-between items-end mb-6 text-sm px-2">
                   <div className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                     Virtual Map Generated
                   </div>
                   <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1.5 border border-white/10 pr-3 shadow-lg">
                      <img src={fileUrl} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                      <span className="text-[9px] text-white/50 font-medium uppercase tracking-widest leading-tight">Source<br/>Photo</span>
                   </div>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="relative w-full aspect-[1/2] max-w-[260px] bg-[#27272a] rounded-[32px] p-4 mx-auto border-[4px] border-[#18181b] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                    <div className="relative w-full h-full bg-[#064e3b] rounded-[16px] shadow-[inset_0_0_24px_rgba(0,0,0,0.8)] border-[2px] border-[#022c22]">
                      
                      <svg viewBox="-10 -10 120 220" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        <defs>
                          <pattern id="stripePattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <rect width="10" height="10" fill="#ffffff" />
                            <rect width="4" height="10" fill="#f59e0b" x="3" />
                          </pattern>
                          <radialGradient id="pocketGlow">
                            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        
                        {/* Pockets */}
                        {[
                          {x:0, y:0}, {x:100, y:0},
                          {x:0, y:100}, {x:100, y:100},
                          {x:0, y:200}, {x:100, y:200}
                        ].map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="8" fill="#09090b" stroke="#27272a" strokeWidth="1" />
                            <circle cx={p.x} cy={p.y} r="6" fill="#000000" />
                          </g>
                        ))}
  
                        {/* Pocket Glow target */}
                        <circle 
                          cx={analysis.trajectory.pocket_x} cy={analysis.trajectory.pocket_y} 
                          r="15" fill="url(#pocketGlow)" className="animate-pulse"
                        />
  
                        {/* Trajectory */}
                        <line 
                          x1={analysis.trajectory.cue_x} y1={analysis.trajectory.cue_y} 
                          x2={analysis.trajectory.target_x} y2={analysis.trajectory.target_y} 
                          stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3,3" 
                        />
                        <line 
                          x1={analysis.trajectory.target_x} y1={analysis.trajectory.target_y} 
                          x2={analysis.trajectory.pocket_x} y2={analysis.trajectory.pocket_y} 
                          stroke="#4ade80" strokeWidth="2.5" opacity="0.9" 
                        />
  
                        {/* All Balls Output by Gemini */}
                        {analysis.balls.map((ball, i) => {
                          let fill = '#ffffff'; // cue
                          if (ball.type === '8ball') fill = '#171717';
                          else if (ball.type === 'solid') fill = '#3b82f6';
                          else if (ball.type === 'stripe') fill = 'url(#stripePattern)';
                          
                          return (
                            <circle 
                              key={i}
                              cx={ball.x} cy={ball.y} r="4.5"
                              fill={fill}
                              stroke="#e2e8f0" strokeWidth="0.5"
                              className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
                            />
                          )
                        })}
  
                        {/* Highlight Cue and Target Balls explicitly for visual clarity */}
                        <circle cx={analysis.trajectory.cue_x} cy={analysis.trajectory.cue_y} r="6" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="animate-pulse" />
                        <circle cx={analysis.trajectory.target_x} cy={analysis.trajectory.target_y} r="6" fill="none" stroke="#4ade80" strokeWidth="1.5" className="animate-pulse" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Explanation card */}
                <div className="bg-black/40 rounded-[24px] p-6 border border-white/5 shadow-xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                     <Crosshair className="w-32 h-32 text-cyan-400" />
                  </div>
                  <h3 className="text-cyan-400 text-xs tracking-widest uppercase mb-3 flex items-center gap-2 relative z-10">
                    Strategic Analysis
                  </h3>
                  <p className="text-white/80 leading-relaxed text-[15px] relative z-10 font-light">
                    {analysis.explanation}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-950/40 border border-red-900/50 rounded-2xl p-5"
              >
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Input Action Controls */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
                disabled={loading}
              >
                <Camera className="w-4 h-4 text-white/70" /> Retake
              </button>
              
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
              
              {fileUrl && !loading && (
                <button
                  onClick={() => processImage(file!, team)}
                  className="flex-1 bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-medium py-3.5 px-4 rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Recalculate
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
