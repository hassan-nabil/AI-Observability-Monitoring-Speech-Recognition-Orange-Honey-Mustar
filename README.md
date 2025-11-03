# 🎤 SparkVoice (reVoiced)

A DevOps-powered AI observability platform for speech recognition with real-time monitoring and accessibility features.

Built for **Canada DevOps Gen AI Hackathon 2025** by Team Orange Honey Mustard.

## ✨ Features

- 🎙️ **Voice Recording** - Record audio directly in browser
- 🗣️ **Speech-to-Text** - OpenAI Whisper API integration
- 📊 **API Usage Dashboard** - Real-time usage statistics
- 📈 **Prometheus Metrics** - Full observability stack
- ♿ **Accessibility** - Optimized for users with Parkinson's and motor impairments

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- OpenAI API Key

### Local Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Observability-Monitoring-Speech-Recognition-Orange-Honey-Mustar
   ```

2. **Set up backend**
   ```bash
   cd voiceops/voiceops-backend
   pip install -r requirements.txt
   # Create .env file with your OPENAI_API_KEY
   py -3.11 -m uvicorn main:app --reload --port 8000
   ```

3. **Set up frontend** (in a new terminal)
   ```bash
   cd voiceops/voiceops-frontend
   npm install
   npm run dev -- --port 3001
   ```

4. **Access the app**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Metrics: http://localhost:8000/metrics

### Docker (Optional)

If you have Docker installed:

```bash
docker compose up -d
```

Access:
- Frontend: http://localhost:3002
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## 📊 DevOps Features

- **Prometheus Metrics** - `/metrics` endpoint with full instrumentation
- **Health Checks** - `/health` endpoint for monitoring
- **API Usage Tracking** - Real-time dashboard with statistics
- **Containerization** - Docker support for all services
- **Observability Stack** - Prometheus + Grafana integration

## 🔌 API Endpoints

- `POST /api/v1/save-audio` - Save uploaded audio file
- `POST /api/v1/transcribe` - Transcribe audio to text
- `GET /api/v1/usage/stats` - Get usage statistics
- `GET /api/v1/usage/endpoints` - Get endpoint statistics
- `GET /api/v1/usage/activity` - Get recent activity
- `GET /metrics` - Prometheus metrics
- `GET /health` - Health check

See full API documentation at `/docs` when backend is running.

## 👥 Team

**Team Orange Honey Mustard**

- **Team Leads**: Hassan Nabil, Zain Rajpar
- **Team Members**: Hadi Khan, Mustafa Tamer, Ahmad Ayoub
- **Mentor**: Gurtej Pal Singh

---

**Built for Canada DevOps Gen AI Hackathon 2025** 🚀
