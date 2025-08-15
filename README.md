# Frontend-Learn

## Docker Setup

This project includes Docker configuration for easy deployment and development.

### Prerequisites

- Docker installed on your machine
- Docker Compose (optional, but recommended)

### Building and Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t frontend-learn .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 frontend-learn
   ```

### Using Docker Compose

1. Build and start the application:
   ```bash
   docker-compose up --build
   ```

2. Access the application at http://localhost:3000

### Environment Variables

The application requires several environment variables for proper operation. These are included in the docker-compose.yml file:
- `NEXT_PUBLIC_API_URL`: The backend API URL
- `JWT_SECRET`: Secret for JWT token validation
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for frontend
- `NEXT_PUBLIC_STRIPE_PRICE_PLUS`: Stripe price ID for Plus plan
- `NEXT_PUBLIC_STRIPE_PRICE_PRO`: Stripe price ID for Pro plan

### Development vs Production

The Docker setup is configured for production by default. For development, you might want to use the standard Next.js development server with:
```bash
npm run dev
```
