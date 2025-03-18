# Clipboard Sync

A secure, end-to-end encrypted clipboard syncing system between mobile devices and Windows computers.

## Features

- **End-to-End Encryption**: All data is encrypted using AES-256 encryption
- **Real-Time Sync**: Instant clipboard updates using Supabase's real-time features
- **Modern UI**: macOS-inspired interface with transparency effects and smooth animations
- **Clipboard History**: Keep track of copied items with searchable history
- **Cross-Platform**: Works between mobile web app and Windows desktop

## Architecture

This project consists of two main applications:

1. **Desktop App (Electron)**: Windows application that monitors and manages the clipboard
2. **Web App (React)**: Mobile interface for sending content to the desktop

Both applications communicate through Supabase, a real-time database built on PostgreSQL.

## Getting Started

### Prerequisites

- Node.js v16 or higher
- Supabase account (free tier is sufficient)
- Windows 10/11 for desktop app

### Setting Up Supabase

1. Create a new Supabase project
2. Run the SQL script in `supabase/schema.sql` to set up the database schema
3. Enable Row Level Security (RLS) policies
4. Configure authentication (email, social logins, etc.)
5. Get your Supabase URL and anon key

### Desktop App Setup

1. Clone this repository
2. Navigate to the desktop-app directory
   ```
   cd clipboard-sync/desktop-app
   ```
3. Install dependencies
   ```
   npm install
   ```
4. Create a `.env` file with your Supabase credentials
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
5. Start the development server
   ```
   npm start
   ```

### Web App Setup

1. Navigate to the web-app directory
   ```
   cd clipboard-sync/web-app
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with your Supabase credentials
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_KEY=your_supabase_anon_key
   ```
4. Start the development server
   ```
   npm start
   ```
5. Access the web app on your mobile device

## Security Considerations

- Encryption keys are derived from user passwords and stored securely
- No data is stored on servers in plain text
- All data is encrypted before it leaves the device
- Users can revoke access to devices at any time
- Automatic purging of old entries (configurable retention period)

## Building for Production

### Desktop App

```bash
cd desktop-app
npm run pack
```

This will create an installer in the `dist` directory.

### Web App

```bash
cd web-app
npm run build
```

Deploy the contents of the `build` directory to your hosting provider.

## License

MIT
