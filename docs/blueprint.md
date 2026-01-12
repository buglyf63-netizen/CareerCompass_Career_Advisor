# **App Name**: CareerCompass.ai

## Core Features:

- User Authentication: Secure user login and registration using Firebase Authentication, allowing users to sign in with their Google account.
- Resume Upload and Parsing: Allow users to upload their resume, which is then parsed to extract relevant skills and experience. Stores resume data in Firestore.
- Skill/Interest Assessment: Interactive assessment to gather information about user skills and career interests.  Stores assessment data in Firestore.
- AI-Powered Career Path Recommendation: Leverage the Gemini API to analyze user data (resume, skills, interests) and provide personalized career path recommendations, including required skills and potential job titles. This feature will use tool use to reason over when a given piece of information from the resume and/or assessment is suitable to include in the suggestion.
- Personalized Learning Roadmap Generation: Generate tailored learning roadmaps based on identified skill gaps, recommending specific courses, projects, or internships using the Gemini API. The AI tool will use search to provide suitable links and details of online training. Roadmaps will be outputted in clear markdown format and available to save/share/print.
- Job Listing Integration: Display relevant job listings from platforms like LinkedIn (via API or web scraping) with 'Apply Now' buttons, linked to recommended career paths.
- Data Persistence and Profile Management: Store user data, resumes, assessment results, and career path recommendations in Firestore. Enables users to save and manage their profile information and generated roadmaps.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5), embodying knowledge and trust.
- Background color: Light Indigo (#E8EAF6), a soft and unobtrusive backdrop.
- Accent color: Vibrant Orange (#FF9800), for calls to action and important UI elements, ensuring high visibility.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines, 'Inter' (sans-serif) for body text.
- Code Font: 'Source Code Pro' for any displayed code snippets
- Use clean, modern icons from Material Design to represent different skills, career paths, and learning resources.
- A clean, intuitive layout that is easy to navigate with clear sections for resume upload, skill assessment, career recommendations, and learning roadmaps.