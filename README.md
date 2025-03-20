# ClipSync - Cross-Device Clipboard Synchronization

A secure, end-to-end encrypted clipboard synchronization tool that allows you to seamlessly share clipboard content between your devices.

## Features

- **End-to-End Encryption**: All clipboard data is encrypted before transmission
- **Real-time Synchronization**: Changes to your clipboard are instantly available on all connected devices
- **Multiple Content Types**: Support for text, links, and files
- **Cross-Platform**: Works on desktop (Windows) and mobile devices (via web app)
- **History Management**: Access and search your clipboard history
- **Secure Pairing**: Connect your devices using a secure pairing mechanism

## Project Structure

The project consists of three main components:

- **Electron App**: Desktop application for Windows
- **Web App**: React-based web application for mobile devices
- **Shared Library**: Common utilities and types used by both apps

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Supabase account for the backend

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/clipboard-sync.git
   cd clipboard-sync
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   - Create a `.env` file in the root directory
   - Add your Supabase URL and anon key:
     ```
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your-anon-key
     REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
     REACT_APP_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Build the shared library
   ```
   cd shared
   npm run build
   cd ..
   ```

### Development

Run both the Electron app and Web app in development mode:
```
npm run dev
```

Or run them separately:
```
npm run start:electron
npm run start:web
```

### Building for Production

Build all packages:
```
npm run build
```

Build the Electron app for distribution:
```
cd electron-app
npm run package
```

## Database Schema

ClipSync uses Supabase as its backend. Set up the following tables:

### clipboard_items

| Column        | Type      | Description                             |
|---------------|-----------|-----------------------------------------|
| id            | uuid      | Primary key                             |
| pair_id       | text      | The device pair ID                      |
| content       | text      | Encrypted clipboard content             |
| content_type  | text      | 'text', 'link', or 'file'               |
| source_device | text      | Device that originated the content      |
| file_name     | text      | Optional - name of file (if file type)  |
| file_size     | integer   | Optional - size of file in bytes        |
| file_mime_type| text      | Optional - MIME type of file            |
| created_at    | timestamp | Creation timestamp (default now())      |

## Security

- All clipboard data is end-to-end encrypted using AES-256
- Encryption keys are never sent to the server
- Pairing information should be kept secure

## License

This project is licensed under the MIT License - see the LICENSE file for details.
