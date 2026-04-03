# AI Code Mentor  
AI Code Mentor is a full-stack web application designed to transform traditional code review into an interactive and educational experience.  

Unlike conventional tools that only highlight issues, this platform acts as an AI mentor by providing meaningful explanations, guiding improvements, and helping developers build strong coding practices.

---

## Key Features  

- Code Smell Detection  
  Identify bad practices and potential issues in code  

- Readability Scoring  
  Evaluate code quality and maintainability  

- AI-Powered Refactor Suggestions  
  Receive optimized and cleaner code recommendations  

- Conceptual Explanations  
  Understand why improvements are necessary  

- Progress Tracking  
  Monitor weak areas and improvement over time  

- Concept Mapping  
  Link mistakes to fundamental programming concepts  

- History and Reports  
  Access previous code reviews and insights  

---

## Problem Statement  

Existing tools primarily focus on fixing code, but they often fail to help beginners understand:

- Why the code is incorrect  
- Which programming concepts were violated  
- How to improve in future implementations  

---

## Novelty  

Unlike traditional code review tools, this system functions as an AI mentor by providing conceptual explanations, personalized feedback, and continuous learning support instead of only technical corrections.

---

## Tech Stack  

<p align="left">
  <img src="https://skillicons.dev/icons?i=react,nodejs,tailwindcss,sqlite&theme=dark" alt="Tech Stack" />
</p>

- Frontend: React.js, Tailwind CSS  
- Backend: Node.js  
- Database: SQLite  
- AI Model: Google Gemini API  
---

## How It Works  

1. User pastes code or provides a repository  
2. Backend processes the request  
3. AI analyzes the code  
4. System generates:  
   - Code smell detection  
   - Readability score  
   - Refactor suggestions  
   - Conceptual explanations  
5. Results are stored for future tracking and analysis  

---

## Installation and Setup  

### Clone the Repository  
```bash
git clone https://github.com/tarunkumar1307/AI-Code-Mentor.git
cd AI-Code-Mentor
```

### 2️⃣ Install Dependencies  

#### Frontend  
```bash
cd frontend
npm install
npm run dev
```

#### Backend  
```bash
cd backend
npm install
npm start
```

---

## 🔐 Environment Variables  

Create `.env` files based on the provided `.env.example` files.

### Backend (`/backend`)
```js
PORT=3001
GEMINI_API_KEY=your_api_key
```


### Frontend (`/frontend`)
```js
VITE_API_URL = http://localhost:3001/api
```

---

## 🔒 Security Note

- Never commit `.env` files to version control  
- Use `.env.example` as a reference for required variables  
- All sensitive keys (e.g., API keys) must be stored securely in environment variables  
- If a key is exposed, it should be immediately revoked and regenerated   

---

## 📈 Future Improvements  
  
- 🧪 Test Case Suggestions  
- 📊 Advanced Analytics Dashboard  
- 🧑‍🏫 Personalized Learning Paths  

---

## 📄 Research Angle  

**Title:**  
*Improving Code Readability and Maintainability for Novice Programmers using AI-Assisted Web Tools*  
