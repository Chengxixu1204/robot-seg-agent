# TESTROBOT

###  Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your OpenAI API key (replace with your real key)
export OPENAI_API_KEY=sk-...your-key-here...

# Run the FastAPI server
uvicorn app.main:app --reload


# Frontend
cd frontend
npm install
npm run dev
