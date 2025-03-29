# ✨ CollegeEssayAI – Smart College Essay Planning Tool

**CollegeEssayAI** is an AI-driven web platform that helps students brainstorm and plan their college essays. It analyzes uploaded resumes and essay prompts to suggest relevant experiences, extract key themes, and provide interactive brainstorming support through a built-in AI assistant.

---

## 📘 What It Does

- 📝 **Resume Analysis** – Upload a PDF or DOCX resume and receive your most relevant experiences for any prompt.
- 🧠 **Prompt Breakdown** – Automatically extract keywords, themes, and main ideas from your essay prompt.
- 🤖 **AI Brainstorm Assistant** – Chat with an intelligent assistant that helps you ideate essay topics and structure responses.

---

## 🧩 How It Works

The system is built around three main modules:

### 📂 Resume Module
- Supports PDF and DOCX uploads
- Extracts sentences/experiences
- Scores relevance using:
  - TF-IDF + Cosine Similarity
  - Sentence-BERT (all-MiniLM-L6-v2)

### 🔍 Prompt Analyzer
- Extracts keywords, noun chunks, named entities
- Finds subject-verb-object relationships
- Identifies 3 main topics per prompt

### 💬 Chat Assistant
- Uses OpenRouter for LLM-based conversation
- Responds based on user prompt/resume
- Tailored toward college essay brainstorming

---

## 🛠 Tech Stack

- **Backend**: Flask, Python 3.10
- **NLP**: spaCy, NLTK, Sentence-BERT
- **AI Assistant**: OpenRouter API (chat interface)
- **Parsing**: PyPDF2, python-docx
- **Frontend**: HTML, CSS, JavaScript

---

## 🎓 Who It's For

- High school students writing college essays
- Anyone needing help turning a resume into a story
- Students looking for topic inspiration and guidance

---

## 👤 Author

Built by **Yujun Ge**
