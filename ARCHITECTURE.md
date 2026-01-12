# CareerCompass.ai - System Architecture

This document outlines the technical architecture of the CareerCompass.ai platform. The system is designed with a modern, scalable, and AI-native stack, primarily leveraging Next.js for the frontend, Firebase for backend services, and Google's Gemini models via Genkit for AI-powered features.

## Three-Layer Architecture

The architecture can be visualized in three main layers:

1.  **Frontend (Client)**: The user interface that users interact with.
2.  **Backend (Server & Services)**: The core infrastructure for data, authentication, and business logic.
3.  **AI Layer (Genkit Flows)**: The specialized AI services that provide the "intelligence" for the platform's core features.

---

### **1. Frontend Layer (The User Interface)**

This is the web application that runs in the user's browser.

-   **Framework**: **Next.js (with React)**
    -   Handles all rendering, both server-side and client-side.
    -   Provides the routing structure for the entire application (e.g., `/dashboard`, `/resume`, `/login`).
-   **UI Components**: **ShadCN UI & Tailwind CSS**
    -   A library of pre-built, accessible, and themeable React components (`Button`, `Card`, `Tabs`, etc.).
    -   Tailwind CSS is used for all styling, enabling a consistent and modern design.
-   **State Management**: **React Context API (`AppContext`)**
    -   A global state manager that holds user authentication status, profile information, and the results from AI analyses (resume recommendations, psychometric reports). This makes data available across all pages of the dashboard.
-   **Key Pages & Components**:
    -   **Public Pages**: `(page.tsx, login, signup)` - The public-facing marketing and authentication pages.
    -   **Dashboard Pages**: `(dashboard/*)` - The authenticated user experience where all features are accessed.
    -   **UI Components**: `(components/ui/*)` - Reusable components that form the building blocks of the interface.

### **2. Backend Layer (Core Services)**

This layer handles data persistence, user management, and hosting.

-   **Hosting**: **Firebase App Hosting**
    -   Hosts the Next.js application, providing a scalable, serverless environment. Configuration is managed in `apphosting.yaml`.
-   **Authentication**: **Firebase Authentication**
    -   Manages user sign-up and login, currently configured for Google Sign-In. It securely handles user sessions.
-   **Database**: **Cloud Firestore**
    -   A NoSQL database used to store all persistent user data.
    -   A single `users` collection holds documents for each user, containing:
        -   User Profile (name, email, etc.)
        -   Resume Analysis Results
        -   Psychometric Test Results & Reports
        -   Progress Tracker Data (completed milestones)
    -   All database interactions are managed via functions in `src/lib/firestore.ts`.

### **3. AI Layer (Genkit & Google AI)**

This is the intelligent core of the platform, where all AI-powered analysis takes place.

-   **AI Framework**: **Genkit**
    -   Acts as the orchestrator for all AI operations. It defines the structure for AI flows, prompts, and tools.
    -   The global Genkit instance is configured in `src/ai/genkit.ts`.
-   **AI Model**: **Google Gemini**
    -   The primary Large Language Model (LLM) used for all generative tasks, such as generating reports, analyzing text, and powering the chatbot.
-   **AI Flows (`src/ai/flows/*`)**:
    -   These are server-side TypeScript functions that define specific AI tasks. Each flow encapsulates a prompt, input/output schemas (using Zod), and the logic for calling the Gemini model.
    -   **`generatePersonalizedCareerPaths`**: Analyzes resume text.
    -   **`generatePsychometricTest`**: Creates a custom test.
    -   **`evaluatePsychometricTest`**: Evaluates test answers and generates a 3-part report.
    -   **`techMitraChatbot`**: Powers the AI mentor chat.
    -   ...and others.
-   **AI Tools (`src/ai/tools/*`)**:
    -   Functions that the AI can decide to use as part of its reasoning process. For example, `searchWebForAbroadInfo` allows the "Abroad" chatbot to fetch real-time information from the web to answer user questions.

## **Data Flow Example: Resume Analysis**

To illustrate how these layers work together:

1.  **User Action (Frontend)**: The user uploads a PDF on the `/dashboard/resume` page.
2.  **Client-Side Processing (Frontend)**: The client extracts text from the PDF.
3.  **API Call (Frontend -> AI Layer)**: The frontend calls the `analyzeResumeAction`, which in turn invokes the `generatePersonalizedCareerPaths` Genkit flow with the resume text.
4.  **AI Processing (AI Layer)**: The Genkit flow sends the text to the Gemini model with a specific prompt, asking it to generate career paths, skill gaps, and a learning roadmap.
5.  **Database Write (Frontend -> Backend)**: The AI-generated results are returned to the client, which then saves them to the user's document in **Firestore** via the `saveRecommendations` function.
6.  **State Update (Frontend)**: The results are also saved in the global `AppContext`, and the UI updates to display the personalized recommendations to the user.