# Social Sphere: A Microservices Social Media Platform

Welcome to Social Sphere, a robust and scalable social media platform built with a microservices architecture. This project demonstrates best practices in backend development, including distributed systems, API gateway pattern, event-driven communication, and robust data handling.

## Overview
Social Sphere is a comprehensive backend system designed to power a modern social media application. It features dedicated microservices for identity management, post creation, media handling, and real-time search, all orchestrated by an API Gateway and leveraging an event-driven architecture with RabbitMQ.

## Features
*   **Microservices Architecture**: Separate services for Identity, Posts, Media, and Search ensure modularity, scalability, and independent deployment.
*   **Authentication & Authorization**: Secure user registration, login, and token-based authentication (JWT) with refresh token management.
*   **Content Management**: Users can create, retrieve, and delete posts, including associated media.
*   **Media Uploads**: Seamless integration with Cloudinary for efficient and scalable image and video storage.
*   **Real-time Search**: Fast and efficient full-text search capabilities for posts, powered by event-driven indexing.
*   **API Gateway**: Centralized entry point for all client requests, handling routing, authentication, and rate limiting.
*   **Event-Driven Communication**: Asynchronous communication between services using RabbitMQ for loose coupling and enhanced resilience.
*   **Caching**: Utilizes Redis for caching frequently accessed data and implementing robust rate limiting, improving performance and protecting against abuse.
*   **Containerization**: Docker and Docker Compose for easy setup and deployment across different environments.
*   **Centralized Logging**: Structured logging across all services using Winston for better observability and debugging.

## Getting Started

To get the Social Sphere platform up and running on your local machine, follow these steps.

### Installation
▶️ **Clone the Repository**:
```bash
git clone https://github.com/teajhaney/social-media-microservice.git
cd social-media-microservice
```

▶️ **Create Environment Files**:
Each service requires its own `.env` file. Copy the provided example files:

```bash
cp api-gateway/.env.docker api-gateway/.env
cp identity-service/.env.docker identity-service/.env
cp media-service/.env.docker media-service/.env
cp post-service/.env.docker post-service/.env
cp search-service/.env.docker search-service/.env
```
💡 **Note**: For local development outside of Docker, you can use `.env.local` files for each service and copy them instead. Update the service URLs to `localhost` accordingly.

▶️ **Build and Run Services with Docker Compose**:
```bash
docker-compose up --build -d
```
This command will build the Docker images for all services and start them in detached mode.

### Environment Variables
All services require specific environment variables to function correctly. Ensure these are set in their respective `.env` files.

*   **API Gateway (`api-gateway/.env`)**
    *   `PORT=3000`
    *   `NODE_ENV=development`
    *   `IDENTITY_SERVICE_URL=http://identity-service:3001`
    *   `POST_SERVICE_URL=http://post-service:3002`
    *   `MEDIA_SERVICE_URL=http://media-service:3003`
    *   `SEARCH_SERVICE_URL=http://search-service:3004`
    *   `REDIS_URL=redis://redis:6379`
    *   `JWT_SECRET=12345` (Use a strong, complex secret in production)

*   **Identity Service (`identity-service/.env`)**
    *   `PORT=3001`
    *   `NODE_ENV=development`
    *   `MONGODB_URI=mongodb://localhost:27017/identitydb` (Replace with your MongoDB connection string)
    *   `REDIS_URL=redis://redis:6379`
    *   `JWT_SECRET=12345` (Must match API Gateway's JWT_SECRET)
    *   `RABBITMQ_URL=amqp://teajhaney:yusfaith%4010@rabbitmq:5672`

*   **Post Service (`post-service/.env`)**
    *   `PORT=3002`
    *   `NODE_ENV=development`
    *   `MONGODB_URI=mongodb://localhost:27017/postdb` (Replace with your MongoDB connection string)
    *   `REDIS_URL=redis://redis:6379`
    *   `RABBITMQ_URL=amqp://teajhaney:yusfaith%4010@rabbitmq:5672`

*   **Media Service (`media-service/.env`)**
    *   `PORT=3003`
    *   `NODE_ENV=development`
    *   `MONGODB_URI=mongodb://localhost:27017/mediadb` (Replace with your MongoDB connection string)
    *   `REDIS_URL=redis://redis:6379`
    *   `CLOUDINARY_CLOUD_NAME=your_cloud_name`
    *   `CLOUDINARY_API_KEY=your_api_key`
    *   `CLOUDINARY_API_SECRET=your_api_secret`
    *   `RABBITMQ_URL=amqp://teajhaney:yusfaith%4010@rabbitmq:5672`

*   **Search Service (`search-service/.env`)**
    *   `PORT=3004`
    *   `NODE_ENV=development`
    *   `MONGODB_URI=mongodb://localhost:27017/searchdb` (Replace with your MongoDB connection string)
    *   `REDIS_URL=redis://redis:6379`
    *   `RABBITMQ_URL=amqp://teajhaney:yusfaith%4010@rabbitmq:5672`

## API Documentation

### Base URL
`http://localhost:3000/v1`

### Endpoints

#### POST /v1/auth/register
**Description**: Registers a new user account.
**Request**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User created succcessfully",
  "accessToken": "string",
  "refreshToken": "string"
}
```
**Errors**:
- `400 Bad Request`: Validation error (e.g., username/email too short, invalid email, password too short), User already exist.
- `500 Internal Server Error`: An unexpected server error occurred.

#### POST /v1/auth/login
**Description**: Authenticates a user and returns access and refresh tokens.
**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User logged in succcessfully",
  "accessToken": "string",
  "refreshToken": "string",
  "userId": "string"
}
```
**Errors**:
- `400 Bad Request`: Validation error, Invalid email or password.
- `500 Internal Server Error`: An unexpected server error occurred.

#### POST /v1/auth/refresh-token
**Description**: Refreshes an expired access token using a refresh token.
**Request**:
```json
{
  "refreshToken": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "string",
  "refreshToken": "string",
  "userId": "string"
}
```
**Errors**:
- `400 Bad Request`: Refresh token not found.
- `401 Unauthorized`: Refresh token invalid or expired, User not found.
- `500 Internal Server Error`: An unexpected server error occurred.

#### POST /v1/auth/logout
**Description**: Logs out a user by invalidating their refresh token.
**Request**:
```json
{
  "refreshToken": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
**Errors**:
- `400 Bad Request`: Refresh token not found.
- `500 Internal Server Error`: An unexpected server error occurred.

---

#### POST /v1/posts/create
**Description**: Creates a new post for the authenticated user.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header (handled by API Gateway).
**Request**:
```json
{
  "content": "string",
  "mediaIds": ["string", "..."] // Optional array of media IDs (e.g., from /v1/media/upload)
}
```
**Response**:
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "user": "string",
    "content": "string",
    "mediaIds": [],
    "_id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "__v": 0
  }
}
```
**Errors**:
- `400 Bad Request`: Validation error (e.g., content too short/long).
- `401 Unauthorized`: Authentication required! Please login to continue.
- `500 Internal Server Error`: An unexpected server error occurred.

#### GET /v1/posts/get
**Description**: Retrieves a paginated list of all posts.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header.
**Request Query Parameters**:
- `page`: `integer` (default: 1)
- `limit`: `integer` (default: 10)
**Response**:
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "result": {
    "totalPosts": 0,
    "totalPages": 0,
    "currentPage": 0,
    "limit": 0,
    "posts": [
      {
        "user": "string",
        "content": "string",
        "mediaIds": [],
        "_id": "string",
        "createdAt": "Date",
        "updatedAt": "Date",
        "__v": 0
      }
    ]
  }
}
```
**Errors**:
- `401 Unauthorized`: Authentication required! Please login to continue.
- `500 Internal Server Error`: An unexpected server error occurred.

#### GET /v1/posts/:postId
**Description**: Retrieves a single post by its ID.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header.
**Request Path Parameters**:
- `postId`: `string` (ID of the post)
**Response**:
```json
{
  "success": true,
  "message": "Post fetched successfully",
  "post": {
    "user": "string",
    "content": "string",
    "mediaIds": [],
    "_id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "__v": 0
  }
}
```
**Errors**:
- `401 Unauthorized`: Authentication required! Please login to continue.
- `404 Not Found`: Post not found.
- `500 Internal Server Error`: An unexpected server error occurred.

#### DELETE /v1/posts/delete/:postId
**Description**: Deletes a post by its ID. Only the post's owner can delete it.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header.
**Request Path Parameters**:
- `postId`: `string` (ID of the post to delete)
**Response**:
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "post": {
    "user": "string",
    "content": "string",
    "mediaIds": [],
    "_id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "__v": 0
  }
}
```
**Errors**:
- `401 Unauthorized`: Authentication required! Please login to continue.
- `404 Not Found`: Post not found (either non-existent or not owned by the user).
- `500 Internal Server Error`: An unexpected server error occurred.

---

#### POST /v1/media/upload
**Description**: Uploads a media file (image/video) to Cloudinary and records its metadata.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header.
**Request**: `multipart/form-data`
- `media`: `file` (The media file to upload. Max 5MB, must be an image type.)
**Response**:
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "publicId": "string",
    "originalName": "string",
    "mimeType": "string",
    "url": "string",
    "user": "string",
    "_id": "string",
    "createdAt": "Date",
    "updatedAt": "Date",
    "__v": 0
  }
}
```
**Errors**:
- `400 Bad Request`: No file uploaded, Multer Error while uploading media (e.g., file too large, not an image).
- `401 Unauthorized`: Authentication required! Please login to continue.
- `500 Internal Server Error`: Unknown Error occurred while uploading media, Error uploading media.

#### GET /v1/media/get
**Description**: Retrieves a list of all uploaded media.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header.
**Request**: None
**Response**:
```json
{
  "success": true,
  "message": "Media fetched successfully",
  "length": 0,
  "data": [
    {
      "publicId": "string",
      "originalName": "string",
      "mimeType": "string",
      "url": "string",
      "user": "string",
      "_id": "string",
      "createdAt": "Date",
      "updatedAt": "Date",
      "__v": 0
    }
  ]
}
```
**Errors**:
- `401 Unauthorized`: Authentication required! Please login to continue.
- `500 Internal Server Error`: An unexpected server error occurred.

---

#### GET /v1/search/posts
**Description**: Searches for posts based on a text query.
**Authorization**: Bearer Token required. Include `x-user-id` in proxy header.
**Request Query Parameters**:
- `query`: `string` (The search query string)
**Response**:
```json
{
  "success": true,
  "message": "post search successful",
  "length": 0,
  "data": [
    {
      "postId": "string",
      "userId": "string",
      "content": "string",
      "createdAt": "Date",
      "_id": "string",
      "updatedAt": "Date",
      "__v": 0,
      "score": 0.0 // Present if fetched with text score
    }
  ]
}
```
**Errors**:
- `400 Bad Request`: Query is empty.
- `401 Unauthorized`: Authentication required! Please login to continue.
- `500 Internal Server Error`: Error while searching post.

## Technologies Used

| Category         | Technology    | Description                                       |
| :--------------- | :------------ | :------------------------------------------------ |
| **Backend Core** | Node.js       | Asynchronous, event-driven JavaScript runtime.    |
|                  | Express.js    | Fast, unopinionated, minimalist web framework.    |
| **Database**     | MongoDB       | NoSQL database for flexible data storage.         |
|                  | Mongoose      | MongoDB object modeling for Node.js.              |
| **Caching**      | Redis         | In-memory data store for caching and rate limiting.|
|                  | ioredis       | High-performance Redis client for Node.js.        |
| **Messaging**    | RabbitMQ      | Robust message broker for inter-service communication.|
|                  | amqplib       | RabbitMQ client for Node.js.                      |
| **Authentication**| JWT          | JSON Web Tokens for secure API authentication.    |
|                  | Argon2        | Password hashing function for strong security.    |
| **API Gateway**  | express-http-proxy | Proxy middleware for microservice routing.      |
| **Security**     | Helmet.js     | Secures Express apps by setting various HTTP headers.|
|                  | express-rate-limit | Middleware for API rate limiting.               |
|                  | rate-limit-redis | Redis store for rate limiters.                  |
| **Validation**   | Joi           | Powerful schema description language and validator.|
| **Logging**      | Winston       | Versatile logging library for Node.js.            |
| **Media Storage**| Cloudinary    | Cloud-based image and video management.           |
|                  | Multer        | Node.js middleware for handling `multipart/form-data`.|
| **Containerization**| Docker     | Platform for developing, shipping, and running applications in containers.|
|                  | Docker Compose| Tool for defining and running multi-container Docker applications.|

## Usage

Once the services are running with Docker Compose, the API Gateway will be accessible on port `3000`. You can interact with the various microservices by sending HTTP requests to the API Gateway's base URL: `http://localhost:3000/v1`.

### Example Workflow:

1.  **Register a User**:
    Send a `POST` request to `http://localhost:3000/v1/auth/register` with your user details. You'll receive an `accessToken` and `refreshToken`.

2.  **Log In (if you have an account)**:
    Send a `POST` request to `http://localhost:3000/v1/auth/login` to get new tokens.

3.  **Create a Post**:
    Include your `accessToken` in the `Authorization: Bearer <token>` header. Send a `POST` request to `http://localhost:3000/v1/posts/create` with the post content.

4.  **Upload Media (e.g., an image for your post)**:
    Include your `accessToken` in the `Authorization` header. Send a `POST` request to `http://localhost:3000/v1/media/upload` with the `media` file in a `multipart/form-data` request. Store the returned `_id` to link it with posts.

5.  **Retrieve All Posts**:
    Include your `accessToken` in the `Authorization` header. Send a `GET` request to `http://localhost:3000/v1/posts/get`. You can add `?page=1&limit=5` for pagination.

6.  **Search for Posts**:
    Include your `accessToken` in the `Authorization` header. Send a `GET` request to `http://localhost:3000/v1/search/posts?query=your_search_term`.

## Contributing

We welcome contributions to the Social Sphere project! To contribute, please follow these guidelines:

⭐ **Fork the Repository**: Start by forking the `social-media-microservice` repository to your GitHub account.

🌿 **Create a New Branch**: For each new feature or bug fix, create a dedicated branch from `main`. Use descriptive names like `feature/add-media-deletion` or `fix/user-login-bug`.

🛠️ **Make Your Changes**: Implement your changes and ensure your code adheres to the existing coding style and best practices.

🧪 **Test Thoroughly**: Write and run tests to ensure your changes work as expected and do not introduce regressions.

📝 **Update Documentation**: If your changes impact existing features or add new ones, update the relevant sections of this `README.md` or any other documentation files.

⬆️ **Commit and Push**: Commit your changes with a clear and concise message, then push your branch to your forked repository.

➡️ **Open a Pull Request**: Finally, open a pull request to the `main` branch of the original repository. Provide a detailed description of your changes and why they are necessary.

Thank you for contributing to Social Sphere!

## License
This project is currently unlicensed.

## Author Info

*   **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourusername)
*   **Twitter**: [@YourTwitterHandle](https://twitter.com/yourusername)
*   **Portfolio**: [Your Portfolio Website](https://yourportfolio.com)

---

[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4-4EA94B.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-6.0-DC382D.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.9-FF6600.svg)](https://www.rabbitmq.com/)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-purple.svg)](https://microservices.io/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)