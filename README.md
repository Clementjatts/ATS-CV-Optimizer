# ATS CV Optimizer powered by Gemini AI

Instantly tailor your resume to specific job requirements to beat Applicant Tracking Systems (ATS) and land more interviews. Powered by the Google Gemini API.

**GitHub Repository:** [https://github.com/Clementjatts/ATS-CV-Optimizer](https://github.com/Clementjatts/ATS-CV-Optimizer)

---

## ✨ Key Features

- **AI-Powered Optimization**: Leverages the `gemini-2.5-flash` model to analyze your CV and a target job description, then rewrites your CV to highlight relevant skills and experience.
- **ATS-Friendly Formatting**: Generates a clean, professionally structured CV layout that is easily parsable by modern Applicant Tracking Systems.
- **Multi-Format File Support**: Accepts your current CV in both `.docx` and `.pdf` formats.
- **Advanced OCR for Scanned PDFs**: Automatically detects image-based or scanned PDFs and uses Gemini's multimodal capabilities to perform Optical Character Recognition (OCR) to extract the text.
- **5 Professional Templates**: Choose from Standard, Classic, Modern, Creative, or Minimal CV templates.
- **CV Database**: Save and manage your optimized CVs with Firebase for easy reuse.
- **Multi-CV Selection**: Combine content from multiple saved CVs for comprehensive applications.
- **AI Chat Assistant**: Make quick modifications to your CV through natural language commands.
- **Download as PDF**: Easily save your newly optimized CV as a high-quality PDF with a single click.
- **Intuitive UI**: A modern, responsive user interface with drag-and-drop support and smooth animations.

## 🚀 Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite
- **File Parsing**: `pdfjs-dist` (for PDFs), `mammoth` (for DOCX)
- **PDF Generation**: `@react-pdf/renderer`
- **Backend/Storage**: Firebase (Firestore, Storage, Authentication)
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky (pre-commit hooks)

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API Key
- Firebase project (for CV database features)

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Clementjatts/ATS-CV-Optimizer.git
   cd ATS-CV-Optimizer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Build for production     |
| `npm run preview`  | Preview production build |
| `npm run lint`     | Run ESLint               |
| `npm run test`     | Run tests in watch mode  |
| `npm run test:run` | Run tests once           |

## 📋 How to Use

1. **Upload Your CV**: Drag and drop your current CV (`.docx` or `.pdf`) into the upload area, or click to select a file. The application will parse the content. If it's a scanned PDF, it will automatically use AI-powered OCR.

2. **Choose a Template**: Select from 5 professional CV templates (Standard, Classic, Modern, Creative, Minimal).

3. **Paste the Job Description**: Copy the full text of the job description for the role you're targeting and paste it into the corresponding text area.

4. **Optimize!**: Click the "Optimize CV" button. The Gemini API will process your information and generate a new, tailored CV.

5. **Review & Refine**: Use the AI Chat feature to make quick modifications like "Add Python to my skills" or "Make the summary more concise".

6. **Save & Download**: Save your CV to the database for future use, or download it directly as a PDF.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Header, HeroBackground
│   ├── templates/       # PDF templates (5 variants)
│   └── ui/              # Feature-specific components
├── hooks/               # Custom React hooks
├── services/            # API and Firebase services
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## 🧪 Testing

The project includes unit tests for key components and hooks:

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test
```

## 📄 License

This project is open source and available under the MIT License.
