# Sanjaya Medical AI

An AI-powered medical image-analysis agent. A modern, responsive React application for medical image analysis powered by AI.

## Features

- 🏥 **Medical Image Analysis**: Upload and analyze medical images with AI
- 📊 **Dashboard**: Comprehensive analytics and overview
- 📝 **Reports**: Generate and download detailed analysis reports
- 💬 **Medical Query**: AI-powered medical question answering
- 🔒 **Secure**: HIPAA-compliant with data encryption
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Pages

- **Login/Signup**: User authentication
- **Home**: Welcome page with feature overview
- **Dashboard**: Analytics and quick actions
- **Image Analysis**: Upload and analyze medical images
- **Medical Query**: Ask medical questions to AI
- **Reports**: View and download analysis reports
- **History**: View analysis history
- **Profile**: User profile management
- **Settings**: Application preferences
- **Help & FAQ**: Frequently asked questions
- **Contact**: Contact information and support
- **Privacy**: Privacy policy
- **Terms**: Terms of service

## Tech Stack

- **React 18**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Context API**: State management

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # API Configuration
   REACT_APP_API_BASE_URL=https://your-ngrok-url-here.ngrok-free.dev
   
   # Google OAuth Configuration
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   
   # Optional: App Name
   REACT_APP_NAME=Sanjaya Medical AI
   ```
   
   See `.env.example` (if available) or `GOOGLE_SIGNIN_SETUP.md` for detailed setup instructions.

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   ├── Layout.js
│   │   └── Notification.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Home.js
│   │   ├── Dashboard.js
│   │   ├── Analysis.js
│   │   ├── Query.js
│   │   ├── Reports.js
│   │   ├── History.js
│   │   ├── Profile.js
│   │   ├── Settings.js
│   │   ├── FAQ.js
│   │   ├── Contact.js
│   │   ├── Privacy.js
│   │   └── Terms.js
│   ├── context/
│   │   └── AppContext.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── package.json
├── tailwind.config.js
└── README.md
```

## Key Components

### AppContext
Centralized state management for:
- User authentication
- Current page navigation
- Dark mode toggle
- Analysis progress
- Notifications

### Layout
Main application layout including:
- Responsive sidebar navigation
- Header with search and user menu
- Notification system
- Dark mode support

### Pages
Each page is a separate component with its own functionality:
- **Login/Signup**: Authentication forms
- **Dashboard**: Statistics and quick actions
- **Analysis**: File upload and AI processing
- **Query**: Medical question interface
- **Reports**: Report management
- **History**: Analysis history
- **Profile**: User settings
- **Settings**: App preferences
- **FAQ**: Help and support
- **Contact**: Contact information
- **Privacy/Terms**: Legal pages

## Styling

The application uses Tailwind CSS for styling with:
- Custom animations (blob effects)
- Responsive design
- Dark mode support
- Gradient backgrounds
- Hover effects and transitions

## State Management

The app uses React Context API for state management:
- Global state for user authentication
- Page navigation state
- UI preferences (dark mode, sidebar)
- Analysis progress tracking
- Notification system

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (one-way operation)

## Environment Variables

All sensitive configuration is stored in environment variables. Required variables:

- `REACT_APP_API_BASE_URL`: Backend API URL (e.g., ngrok URL)
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth Client ID (for Google Sign-In)
- `REACT_APP_NAME`: Application name (optional)

⚠️ **Important**: Never commit `.env` file to version control. The `.env` file is already in `.gitignore`.

## Configuration

### API Configuration
The API base URL is configured via `REACT_APP_API_BASE_URL` environment variable in your `.env` file. This replaces the hardcoded URL in `src/config/api.js`.

### Google Sign-In
To enable Google Sign-In:
1. Get your Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Add it to your `.env` file as `REACT_APP_GOOGLE_CLIENT_ID`
3. See `GOOGLE_SIGNIN_SETUP.md` for detailed instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
