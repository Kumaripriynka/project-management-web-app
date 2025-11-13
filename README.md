#  Project Management SaaS

A complete, production-ready project management application with AI-powered features.

##  Features

### Core Features
-  **User Authentication** - Signup, Login, Logout with Firebase
-  **Project Management** - Full CRUD with user isolation
 **Section Organization** - Organize tasks within projects
-  **Task Tracking** - Complete task management with all fields
-  **Advanced Filtering** - Filter by status, priority, assignee, due date
-  **Smart Grouping** - Group tasks by status or priority

### AI-Powered Features
-  **Effort Estimation** - Auto-suggest Low/Medium/High effort based on task complexity
-  **Priority Prediction** - Smart priority suggestions using keyword detection
-  **Project Summaries** - AI-generated project overviews
-  **Real-time Suggestions** - Instant AI analysis as you type

### UI/UX
-  **Fu lly Responsive** - Works on mobile, tablet, and desktop
-  **Modern Design** - Beautiful gradients and animations
-  **Intuitive Interface** - Easy to use and navigate

## Tech Stack

**Frontend:**
- React 18 (Vite)
- TailwindCSS
- Context API
- Axios
- React Router v6
- Firebase Authentication

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- OpenAI SDK (optional)
- CORS + Helmet

**Database:**
- Firebase Firestore

##  Quick Start

### Prerequisites
- Node.js v16+
- Firebase account
- OpenAI API key (optional, for AI summaries)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
PORT=5001
```

Start server:
```bash
npm start
```

Backend runs on `http://localhost:5001`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `src/firebase.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Start dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

##  Usage

1. **Sign up** with email and password
2. **Create a project** using the "+ Add" button
3. **Add sections** to organize your work
4. **Create tasks** with all details
5. **Use AI suggestions** - Type a task title and get automatic priority/effort suggestions
6. **Filter and group** tasks to focus on what matters
7. **Generate AI summaries** to get project insights

##  AI Features

### Effort Estimation
When creating a task, AI analyzes the title and description to suggest effort level:
- **High**: Complex tasks (refactor, architecture, integration)
- **Medium**: Standard tasks (implement, develop, create)
- **Low**: Simple tasks (fix, typo, small changes)

### Priority Prediction
AI detects urgency keywords and due dates to suggest priority:
- **High**: urgent, critical, security, production issues
- **Medium**: features, enhancements, updates
- **Low**: nice-to-have, documentation, cleanup

### Project Summary
Click " AI Summary" to get an intelligent overview of your project with task statistics and completion rates.

##  API Endpoints

### Authentication
All routes require Firebase JWT token in Authorization header.

### Projects
- `GET /api/projects` - List all user projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sections
- `GET /api/sections/project/:projectId` - Get sections
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

### Tasks
- `GET /api/tasks/section/:sectionId` - Get tasks
- `GET /api/tasks/project/:projectId` - Get all project tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### AI
- `POST /api/ai/suggest` - Get AI suggestions for task
- `POST /api/ai/summary` - Generate project summary

##  Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render/Railway)
1. Push to GitHub
2. Connect repository
3. Add environment variables
4. Deploy

##  Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Get Firebase config from Project Settings
5. Generate service account key

### OpenAI Setup (Optional)
1. Get API key from https://platform.openai.com/api-keys
2. Add to backend `.env` file
3. AI features will work with or without OpenAI (fallback mode available)

##  Responsive Design

The app is fully responsive and works on:
-  Mobile phones (< 640px)
-  Tablets (640px - 1024px)
-  Laptops and desktops (> 1024px)

Features:
- Hamburger menu on mobile
- Touch-friendly buttons
- Adaptive layouts
- Optimized typography

##  Security

- JWT token authentication
- User data isolation
- CORS protection
- Helmet security headers
- Environment variable protection
- Input validation

##  Troubleshooting

### Backend won't start
- Check `.env` file exists with correct values
- Verify Firebase private key format (should have `\n` for newlines)
- Ensure port 5001 is available

### Frontend auth errors
- Verify `firebase.js` config matches your Firebase project
- Check Firebase Authentication is enabled

### AI suggestions not working
- Check backend is running
- Verify API calls in browser Network tab
- Check backend console for errors

### Port already in use
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

##  License

MIT

##  Contributing

Contributions welcome! Feel free to submit issues and pull requests.

##  Support

For issues or questions, please check:
1. Backend console logs
2. Browser console errors
3. Network tab for failed requests
4. Firebase Console for auth/database issues

---

**Built with ❤️ by priyanka singh using React, Node.js, Firebase, and AI integration**


