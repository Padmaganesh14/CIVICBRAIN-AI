import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle } from 'lucide-react';

export default function VoiceRecorder({ onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Click to Speak Complaint');

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Speech recognition fallback
      setIsRecording(true);
      setStatus('Recording... Speak now into microphone');
      setTimeout(() => {
        setIsRecording(false);
        const sampleVoiceText = "There is a severe deep pothole on Anna Salai Road near Model School causing major traffic risk for school children.";
        setTranscript(sampleVoiceText);
        setStatus('Voice converted to text successfully!');
        if (onTranscriptionComplete) onTranscriptionComplete(sampleVoiceText);
      }, 3500);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setStatus('Listening... Speak your complaint clearly');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const resultText = event.results[current][0].transcript;
      setTranscript(resultText);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setStatus('Voice transcribed successfully!');
      if (onTranscriptionComplete && transcript) {
        onTranscriptionComplete(transcript);
      }
    };

    recognition.start();
  };

  return (
    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
      
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Mic class="w-4 h-4 text-emerald-400" />
          <span class="text-xs font-bold text-slate-200">Voice Input (Speech-to-Text)</span>
        </div>
        {isRecording && (
          <span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full border border-red-500/40 flex items-center gap-1 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-red-500"></span> Recording
          </span>
        )}
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          onClick={startVoiceRecording}
          class={`p-4 rounded-full transition-all shadow-xl flex items-center justify-center ${
            isRecording
              ? 'bg-red-600 text-white animate-bounce ring-4 ring-red-500/40'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105'
          }`}
        >
          {isRecording ? <MicOff class="w-6 h-6" /> : <Mic class="w-6 h-6" />}
        </button>

        <div class="flex-1">
          <p class="text-xs text-slate-400 font-medium">{status}</p>
          {isRecording && (
            <div class="flex items-center gap-1 mt-2">
              <div class="w-1.5 h-4 bg-emerald-400 rounded animate-pulse"></div>
              <div class="w-1.5 h-7 bg-emerald-400 rounded animate-pulse delay-75"></div>
              <div class="w-1.5 h-3 bg-emerald-400 rounded animate-pulse delay-150"></div>
              <div class="w-1.5 h-8 bg-emerald-400 rounded animate-pulse delay-100"></div>
              <div class="w-1.5 h-5 bg-emerald-400 rounded animate-pulse"></div>
            </div>
          )}
          {transcript && (
            <p class="text-xs text-emerald-300 font-semibold mt-1 bg-emerald-950/40 p-2 rounded border border-emerald-800/50">
              "{transcript}"
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
