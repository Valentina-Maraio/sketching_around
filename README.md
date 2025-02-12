# Sketching Around

Sketching Around is a collaborative whiteboard application that allows users to draw, modify shapes, and even transform their sketches using AI. It leverages the power of Tldraw for the interactive drawing canvas and OpenAI for AI-powered image transformations.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Sidebar Functionality](#sidebar-functionality)
- [PostgreSQL Integration (In Progress)](#postgresql-integration-in-progress) *(New section)*
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Collaborative Drawing:** Multiple users can draw on the same canvas simultaneously. (This feature is not explicitly shown in the provided code, but the architecture suggests it is intended.)
- **Shape Manipulation:** Users can select, move, resize, and modify existing shapes on the whiteboard.
- **AI-Powered Transformation:** Transform freehand drawings into polished images using OpenAI's image generation capabilities.
- **User Avatars:** Users are represented by avatars, making it easy to see who is contributing to the whiteboard.
- **Shape Persistence:** Drawings are saved and loaded, allowing users to return to their work later.
- **History Viewing:** View previous versions of the drawings.

## Technologies Used

- **Frontend:**
    - Next.js (React framework)
    - Tldraw (Interactive drawing library)
    - Shadcn UI (Component library)
    - Tailwind CSS (Styling)
    - React Query (Data fetching and caching)
    - TRPC (API layer)
- **Backend:**
    - Next.js API Routes (Serverless functions)
    - OpenAI API (Image generation)
- **Other:**
    - TypeScript (Type safety)
    - Zod (Schema validation)

## Installation

1. Clone the repository:

    ```bash
    git clone [https://github.com/your-username/sketching-around.git](https://www.google.com/search?q=https://github.com/your-username/sketching-around.git)  # Replace with your repo URL
    ```

2. Navigate to the project directory:

    ```bash
    cd sketching-around
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

    - Create a `.env.local` file in the root of your project.
    - Add your OpenAI API key:

    ```
    OPENAI_API_KEY=your_openai_api_key
    ```

5. Set up Prisma (if using a database - the current code uses an in-memory store):

    ```bash
    npx prisma generate
    ```

## Usage

1. Start the development server:

    ```bash
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Use the whiteboard to draw, modify shapes, and transform drawings with AI.

4. Navigate to the History page to view previous versions of the drawings.

## Architecture

The application follows a modern web architecture, separating concerns between the frontend and backend.

- **Frontend:** The frontend is built with Next.js and uses Tldraw for the interactive canvas. It communicates with the backend via TRPC for data fetching and mutations. Shadcn UI provides pre-built components for a consistent user interface.
- **Backend:** The backend consists of Next.js API routes that handle data persistence and integration with the OpenAI API. TRPC provides a type-safe layer for communication between the frontend and backend. The current implementation uses an in-memory store for drawings.
- **AI Integration:** The `/api/transform-drawing` route handles the AI-powered image transformation. It receives drawing data from the frontend, sends it to the OpenAI API for processing, and returns the generated image URL.

## API Endpoints

- **`/api/trpc`:** TRPC endpoint for all API requests related to drawing data.
- **`/api/transform-drawing`:** Endpoint for transforming drawings using the OpenAI API. Receives drawing data and returns an image URL.

## Sidebar Functionality

The sidebar provides navigation and controls for the application. Currently, some buttons, such as "History," are present for styling purposes but do not yet have full functionality or links associated with them. Future development will focus on implementing the intended behavior for these elements. The "History" button, for example, is intended to provide access to previous versions of the drawings.

## PostgreSQL Integration (In Progress)

We are in the process of integrating a PostgreSQL database for data persistence. This will allow for more robust and scalable management of drawings. The current implementation uses an in-memory store, which is subject to data loss in the event of server restarts.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes.
4. Submit a pull request.

## License

[MIT]

---