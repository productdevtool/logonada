# Logonada - AI-Powered Logo Maker

This is a Next.js application built with Firebase Studio that allows users to create custom logos. It leverages AI to provide design suggestions and offers a flexible canvas for users to bring their brand identity to life.

## Features

- **Dynamic Canvas**: A fully interactive canvas where you can drag, drop, and resize logo elements.
- **Icon Library**: Search and select from a vast library of icons via the Iconfinder API.
- **Brand Customization**: Easily set and update your brand name.
- **Rich Typography**: Choose from a curated list of Google Fonts and adjust the font weight to perfectly match your brand's style.
- **Color Control**: Full control over the colors of your icon, text, and canvas background. Transparent backgrounds are supported for PNG exports.
- **Layout Options**: Switch between horizontal and vertical logo layouts to see what works best.
- **High-Quality Exports**: Download your final logo as a high-resolution PNG, JPG, or a scalable SVG.

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    This project uses the Iconfinder API to search for icons. You will need an API key.

    Create a `.env.local` file in the root of the project:
    ```bash
    touch .env.local
    ```

    Add your Iconfinder API key to the `.env.local` file:
    ```
    ICONFINDER_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    The application includes Genkit for AI features and Next.js for the frontend. You can run them concurrently.

    To start the Next.js frontend:
    ```bash
    npm run dev
    ```
    This will start the app on [http://localhost:9002](http://localhost:9002).

    To start the Genkit development server (for AI flows):
    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit server and watch for changes in your AI flow files.
