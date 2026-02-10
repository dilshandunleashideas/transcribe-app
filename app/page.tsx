"use client";

import { useState, useRef } from "react";
import { Upload, FileAudio, Loader2, Copy, Check, Mic } from "lucide-react";

export default function Transcriber() {
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setTranscript("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json();
      setTranscript(data.text);
    } catch (error) {
      console.error(error);
      setTranscript("Error: Failed to transcribe audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      handleFileSelect(file);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Audio <span className="text-blue-600">Transcriber</span>
        </h1>
        <p className="text-lg text-gray-600">
          Transform your audio files into accurate text instantly. Powered by advanced AI.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Upload Area */}
        <div className="p-8 border-b border-gray-100">
          <div 
            className={`
              relative group cursor-pointer
              flex flex-col items-center justify-center 
              w-full h-64 rounded-xl border-2 border-dashed 
              transition-all duration-300 ease-in-out
              ${isDragging 
                ? "border-blue-500 bg-blue-50/50" 
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
            `}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            
            <div className="flex flex-col items-center space-y-4 text-center p-6">
              <div className={`
                p-4 rounded-full bg-blue-100 text-blue-600 mb-2
                transform transition-transform duration-300 group-hover:scale-110
              `}>
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-700">
                   {loading ? "Processing your audio..." : "Click to upload or drag and drop"}
                </p>
                {!loading && (
                  <p className="text-sm text-gray-500">
                    MP3, WAV, M4A (max 25MB)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="bg-gray-50/50 p-8 min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-blue-500" />
              Transcript
            </h2>
            {transcript && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[200px] relative">
            {transcript ? (
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {transcript}
              </p>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Mic className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Your transcription will appear here.</p>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                 <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-blue-600 animate-pulse">Transcribing...</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer / Info */}
      <footer className="mt-12 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Unleash Transcribe. Ready when you are.</p>
      </footer>
    </div>
  );
}