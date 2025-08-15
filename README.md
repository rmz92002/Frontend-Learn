# Frontend-Learn: A Next.js Learning Platform

This is a learning platform built with Next.js, designed to provide an interactive and engaging educational experience.

## Features

- **Interactive Components**: Includes various interactive components like multiple-choice quizzes, drag-and-drop exercises, and coding sandboxes.
- **Authentication**: User authentication is handled via NextAuth.js, with login and signup functionality.
- **Stripe Integration**: The platform is ready for monetization with Stripe integration for billing and subscriptions.
- **Custom UI Components**: A rich set of custom UI components built with Tailwind CSS and Shadcn UI.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://shadcn.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payments**: [Stripe](https://stripe.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v20 or later)
- pnpm

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/rmz92002/Frontend-Learn.git
    ```
2.  **Install dependencies**
    ```sh
    pnpm install
    ```
3.  **Run the development server**
    ```sh
    pnpm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment to Google Cloud

This project is configured for easy deployment to Google Cloud Run using Google Cloud Build.

### Prerequisites

- A Google Cloud Platform (GCP) project with the Cloud Build and Cloud Run APIs enabled.
- The [Google Cloud SDK](https://cloud.google.com/sdk/install) (`gcloud`) installed and authenticated.

### Deployment Steps

1.  **Set your GCP Project ID**
    Replace `[YOUR_PROJECT_ID]` with your actual GCP project ID.
    ```sh
    gcloud config set project [YOUR_PROJECT_ID]
    ```

2.  **Submit the build to Google Cloud Build**
    This command will build the Docker image, push it to Google Container Registry, and deploy it to Cloud Run, as defined in `cloudbuild.yaml`.
    ```sh
    gcloud builds submit --config cloudbuild.yaml .
    ```

3.  **Access your deployed application**
    After the deployment is complete, Google Cloud Run will provide a URL where you can access your live application.

## Project Structure

The project follows the standard Next.js `app` directory structure.

-   `app/`: Contains all the routes, pages, and layouts.
-   `components/`: Shared and reusable React components.
-   `lib/`: Utility functions and libraries.
-   `public/`: Static assets like images and fonts.
-   `styles/`: Global styles.

## Learn More

To learn more about the technologies used in this project, see the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [React Documentation](https://reactjs.org/docs/getting-started.html) - learn about React.
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.
-   [Shadcn UI Documentation](https://shadcn.dev/docs) - learn about Shadcn UI.
