import { useEffect, useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";

export function useVoiceRecording(value: string, onChange: (value: string) => void) {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  } = useSpeechRecognition();

  const [recordingTime, setRecordingTime] = useState(0);

  // Contador de tiempo mientras graba
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isListening) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Auto-ocultar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Agregar transcripción al input cuando se detiene la grabación
  useEffect(() => {
    if (transcript && !isListening) {
      onChange(value + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, value, onChange, resetTranscript]);

  const handleVoiceToggle = () => {
    clearError();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isListening,
    isSupported,
    error,
    recordingTime,
    handleVoiceToggle,
    formatTime,
    clearError,
  };
}