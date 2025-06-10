# Anonymous Q&A Website (Built by Grok 3)

This project is an anonymous Q&A platform similar to ngl.link. It allows users to set a username, ask questions anonymously, and answer questions from others.

## Features
- **Frontend**: Simple HTML/CSS/JavaScript interface.
- **Backend**: Python with FastAPI for API endpoints.
- **Database**: SQLite for storing questions and answers.
- **Dockerized**: Easy setup and deployment with Docker.

## Setup and Installation

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Steps
1. Clone or download this repository.
2. Navigate to the project directory:
   ```bash
   cd anon_qa_website
   ```
3. Build and run the Docker container:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Backend API: `http://localhost:8000`
   - Frontend: Serve the `frontend/index.html` file through a static file server or open it directly in your browser after starting the backend.

## Usage
- Open the frontend in your browser.
- Enter a username to start asking questions.
- View questions specific to your username and answer others' questions anonymously.

## Project Structure
- `frontend/`: Contains HTML, CSS, and JavaScript for the user interface.
- `backend/`: Contains FastAPI application and SQLite database logic.
- `Dockerfile` and `docker-compose.yml`: For containerization and easy deployment.

## API Endpoints
- `POST /questions/`: Submit a new question.
- `GET /questions/`: Retrieve all questions.
- `GET /questions/{username}/`: Retrieve questions for a specific username.
- `POST /questions/{question_id}/answers/`: Submit an answer to a specific question.

## License
This project is open-source and available under the MIT License.
