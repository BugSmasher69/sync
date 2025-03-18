# README for the Clipboard Sync Desktop Application

This README provides an overview of the Clipboard Sync Desktop Application, built using Electron and React. 

## Project Structure

The project is organized into the following main directories:

- **desktop-app**: Contains the Electron application files.
  - **public**: Static files for the Electron app.
  - **src**: Source code for the Electron app, including main and renderer processes.
  - **package.json**: Configuration file for npm dependencies and scripts.
  - **electron.js**: Entry point for the Electron application.

- **web-app**: Contains the React web application files.
  - **public**: Static files for the web app.
  - **src**: Source code for the web app, including components and pages.
  - **package.json**: Configuration file for npm dependencies and scripts.

- **shared**: Contains shared code and utilities used by both applications.

- **server**: Contains the backend server code for handling API requests.

## Getting Started

To get started with the Clipboard Sync project, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd clipboard-sync
   ```

2. **Install dependencies**:
   - For the desktop application:
     ```
     cd desktop-app
     npm install
     ```
   - For the web application:
     ```
     cd ../web-app
     npm install
     ```
   - For the server:
     ```
     cd ../server
     npm install
     ```

3. **Run the applications**:
   - To start the Electron application:
     ```
     cd ../desktop-app
     npm start
     ```
   - To start the web application:
     ```
     cd ../web-app
     npm start
     ```

4. **Access the server**:
   - Start the server:
     ```
     cd ../server
     npm start
     ```

## Features

- Clipboard management for syncing clipboard data across devices.
- User authentication and management.
- Responsive design for the web application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.