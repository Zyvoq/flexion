# Flexion

Flexion is your AI-powered pocket personal trainer. By transforming your device’s camera into a real-time motion tracker, Flexion measures joint angles, overlays live movement skeletons, and delivers instant form corrections to prevent injury and maximize every rep.
=======

**Flexion is your AI-powered pocket personal trainer.** By transforming your device's camera into a real-time motion tracker, Flexion measures joint angles, overlays live movement skeletons, and delivers instant form corrections to prevent injury and maximize every rep.

Trainers can't watch everyone in the gym at once — especially beginners. Flexion uses computer vision to track your body position and joint angles while you work out, and gives you instant, plain-language corrections the moment your form breaks down. No wearables, no special equipment — just a camera and a browser.

---

## What it does

- Tracks 33 body landmarks in real time using your phone or laptop camera
- Calculates joint angles (knee, hip, back, elbow, shoulder) during each exercise
- Detects rep phases and counts reps automatically
- Flags form deviations at the exact moment they happen — not after the fact
- Sends structured deviation data to an LLM, which turns it into simple, actionable coaching cues
- Offers a deeper, research-informed feedback tier for advanced users and competitors

All pose detection and angle math run **client-side in the browser**. Your camera feed never leaves your device — only anonymized joint-angle data is used to generate feedback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Pose detection | MediaPipe Pose (`@mediapipe/tasks-vision`) — runs in-browser via WASM |
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python) |
| LLM | Ollama (local/offline) or Claude API (production) |
| Database & Auth | Supabase (Postgres + Auth) |
| Advanced feedback | FAISS-based retrieval over a small fitness research corpus |
| Hosting | Vercel (frontend) + Railway/Render (backend) |

---

## Currently Supported Exercises

- Squat
- Deadlift
- Pushup

More coming — see [Contributing](CONTRIBUTING.md) if you'd like to add one.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase project (free tier works) — for auth and data persistence
- [Ollama](https://ollama.com) installed locally (for offline LLM feedback), or a Claude API key for production-quality feedback

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # add your Supabase URL/anon key and backend API URL
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # add your LLM provider config
uvicorn app.main:app --reload
```

### Running Locally

1. Start the backend (`uvicorn` command above) — runs on `http://localhost:8000`
2. Start the frontend (`npm run dev`) — runs on `http://localhost:5173`
3. Open the app, allow camera access, select an exercise, and start your set

---

## Project Structure

```
flexion/
├── frontend/       # React + Vite app — camera, pose detection, UI
├── backend/        # FastAPI app — LLM orchestration, auth, data
├── docs/           # Reference docs (landmark maps, architecture notes)
└── README.md
```

See [`docs/landmark_reference.md`](docs/landmark_reference.md) for the MediaPipe landmark index reference used throughout the codebase.

---

## Roadmap

- [ ] Additional exercises (lunges, overhead press, rows)
- [ ] Voice-based real-time feedback (not just on-screen text)
- [ ] Mobile app wrapper
- [ ] Multi-angle camera support for more accurate depth estimation
- [ ] Expanded research corpus for advanced-tier feedback

---

## Contributing

We welcome contributions of all sizes — new exercises, bug fixes, UI polish, documentation, or research references for the feedback layer. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## Maintainers

- [@thearjunl](https://github.com/thearjunl)
- [@Saint006](https://github.com/Saint006)
- [@deriiinjv](https://github.com/deriiinjv)

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Disclaimer

Flexion is a form-checking aid, not a substitute for a certified trainer or medical advice. Always warm up properly and stop if you feel pain. If you're new to an exercise, consider learning the basics from a qualified coach before relying solely on automated feedback.
>>>>>>> 3821bab (docs(repo): add open-source governance documentation, licenses, and GitHub templates)

<!-- Test PR Template -->
