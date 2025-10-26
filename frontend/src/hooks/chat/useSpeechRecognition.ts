import { useState, useEffect, useRef } from 'react';

// Tipos para la Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type SpeechRecognitionHook = {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  clearError: () => void;
};

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Verificar si el navegador soporta Speech Recognition
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      
      // Configuración
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false; // ← Solo resultados finales
      recognitionRef.current.lang = 'es-ES';

      // Evento cuando empieza
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        finalTranscriptRef.current = '';
      };

      // Evento cuando se recibe transcripción
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        // Solo agregar transcripciones finales
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
          setTranscript(finalTranscriptRef.current);
        }
      };

      // Evento cuando termina (SIEMPRE resetear estado aquí)
      recognitionRef.current.onend = () => {
        console.log('🎙️ Recognition ended, resetting isListening to false');
        setIsListening(false);
      };

      // Evento de error con mensajes más amigables
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('🎙️ Error occurred, resetting isListening to false');
        setIsListening(false); // ← CRITICAL: Resetear estado inmediatamente

        // Mensajes personalizados según el tipo de error
        switch (event.error) {
          case 'no-speech':
            // Silencioso - solo mostrar mensaje amigable
            setError('No se detectó tu voz. Intenta de nuevo.');
            break;
          case 'network':
            console.error('Speech recognition network error');
            setError('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
            break;
          case 'not-allowed':
          case 'permission-denied':
            console.error('Speech recognition permission denied');
            setError('Permisos de micrófono denegados. Habilita el acceso al micrófono.');
            break;
          case 'aborted':
            // Usuario canceló manualmente - no mostrar error
            setError(null);
            break;
          case 'audio-capture':
            console.error('Speech recognition audio capture error');
            setError('No se encontró ningún micrófono. Conecta uno e intenta de nuevo.');
            break;
          case 'service-not-allowed':
            console.error('Speech recognition service not allowed');
            setError('El servicio de reconocimiento de voz está bloqueado.');
            break;
          default:
            console.error('Speech recognition error:', event.error);
            setError(`Error de reconocimiento de voz: ${event.error}`);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignorar errores al limpiar
        }
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        finalTranscriptRef.current = '';
        setTranscript('');
        setError(null);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError('No se pudo iniciar el reconocimiento de voz.');
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    finalTranscriptRef.current = '';
  };

  const clearError = () => {
    setError(null);
  };

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  };
}