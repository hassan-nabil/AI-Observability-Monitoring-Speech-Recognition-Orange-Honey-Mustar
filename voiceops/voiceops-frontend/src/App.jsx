import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const intervalRef = useRef(null)

  // Fetch Prometheus metrics
  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics`, {
        responseType: 'text'
      })
      parseMetrics(response.data)
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
    }
  }

  // Parse Prometheus metrics text format
  const parseMetrics = (metricsText) => {
    const lines = metricsText.split('\n')
    const parsed = {
      requestsTotal: { success: 0, error: 0 },
      avgProcessingTime: 0,
      totalAudioSize: 0
    }

    lines.forEach(line => {
      if (line.startsWith('speech_requests_total')) {
        const match = line.match(/status="(\w+)"} (\d+)/)
        if (match) {
          const status = match[1]
          const value = parseInt(match[2])
          parsed.requestsTotal[status] = value
        }
      }
      if (line.startsWith('speech_processing_duration_seconds_sum')) {
        const match = line.match(/status="success"} ([0-9.]+)/)
        if (match) {
          const sum = parseFloat(match[1])
          const count = parsed.requestsTotal.success || 1
          parsed.avgProcessingTime = count > 0 ? (sum / count).toFixed(3) : 0
        }
      }
    })

    setMetrics(parsed)
  }

  useEffect(() => {
    // Fetch metrics every 5 seconds
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const startRecording = async () => {
    try {
      setError('')
      setTranscription('')
      audioChunksRef.current = []
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setTranscription(response.data.text)
      // Refresh metrics after successful transcription
      setTimeout(fetchMetrics, 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to transcribe audio. Please try again.')
      console.error('Transcription error:', err)
    } finally {
      setIsProcessing(false)
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎤 SparkVoice</h1>
        <p className="subtitle">AI Observability & Speech Recognition Platform</p>
        <p className="tagline">DevOps-powered accessibility for inclusive AI interaction</p>
      </header>

      <main className="main-content">
        <section className="recording-section">
          <div className="recording-controls">
            {!isRecording && !isProcessing ? (
              <button
                className="btn btn-primary btn-large"
                onClick={startRecording}
                aria-label="Start recording"
              >
                🎙️ Start Recording
              </button>
            ) : (
              <button
                className="btn btn-danger btn-large"
                onClick={stopRecording}
                disabled={!isRecording}
                aria-label="Stop recording"
              >
                ⏹️ Stop Recording {isRecording && `(${formatTime(recordingTime)})`}
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Processing your speech...</p>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              ⚠️ {error}
            </div>
          )}

          {transcription && (
            <div className="transcription-box">
              <h2>Transcription</h2>
              <div className="transcription-text">{transcription}</div>
            </div>
          )}
        </section>

        <section className="metrics-section">
          <h2>📊 System Metrics</h2>
          {metrics ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Requests</div>
                <div className="metric-value">
                  <span className="success">{metrics.requestsTotal.success}</span>
                  <span className="separator">/</span>
                  <span className="error">{metrics.requestsTotal.error}</span>
                </div>
                <div className="metric-subtext">Success / Errors</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Avg Processing Time</div>
                <div className="metric-value">{metrics.avgProcessingTime}s</div>
                <div className="metric-subtext">Seconds</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Total Requests</div>
                <div className="metric-value">
                  {metrics.requestsTotal.success + metrics.requestsTotal.error}
                </div>
                <div className="metric-subtext">All Time</div>
              </div>
            </div>
          ) : (
            <div className="metrics-loading">Loading metrics...</div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Built for Canada DevOps Gen AI Hackathon 2025 | Team Orange Honey Mustard</p>
        <p>Designed with accessibility in mind for Parkinson's users</p>
      </footer>
    </div>
  )
}

export default App
