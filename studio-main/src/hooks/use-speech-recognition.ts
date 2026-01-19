'use client';

import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasRecognitionSupport, setHasSupport] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                setHasSupport(true);
            }
        }
    }, []);

    const startListening = (language: string = 'en-US') => {
        if (recognitionRef.current) {
            // Map basic language names to BCP 47 tags
            const langMap: Record<string, string> = {
                'English': 'en-US',
                'Assamese': 'as-IN',
                'Bengali': 'bn-IN',
                'Bodo': 'brx-IN',
                'Dogri': 'doi-IN',
                'Gujarati': 'gu-IN',
                'Hindi': 'hi-IN',
                'Kannada': 'kn-IN',
                'Kashmiri': 'ks-IN',
                'Konkani': 'kok-IN',
                'Maithili': 'mai-IN',
                'Malayalam': 'ml-IN',
                'Manipuri': 'mni-IN',
                'Marathi': 'mr-IN',
                'Nepali': 'ne-NP',
                'Odia': 'or-IN',
                'Punjabi': 'pa-IN',
                'Sanskrit': 'sa-IN',
                'Santali': 'sat-IN',
                'Sindhi': 'sd-IN',
                'Tamil': 'ta-IN',
                'Telugu': 'te-IN',
                'Urdu': 'ur-IN',
            };

            recognitionRef.current.lang = langMap[language] || 'en-US';
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Error starting speech recognition:", error);
                setIsListening(false);
            }

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // We return the concatenated result. The component can decide how to use it.
                // Note: For a chat input, we usually want the latest full sentence.
                // This simple implementation passes the latest perceived text.
                setTranscript(finalTranscript + interimTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasRecognitionSupport
    };
};
