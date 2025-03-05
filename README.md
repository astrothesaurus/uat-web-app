# uat-web-app

## Overview
UAT Web App is a Flask web application that includes the following features:
- **UAT Sorting Tool**: A tool for sorting and managing UAT data.
- **UAT Alphabetical Browser**: A browser for navigating UAT data alphabetically.
- **UAT Hierarchical Browser**: A browser for navigating UAT data hierarchically.
- **Search the UAT**: A search functionality for querying UAT data.

## Getting Started

### Prerequisites
- Python 3.9 or higher
- Node.js and npm
- Docker

### Installation

1. **Clone the repository to an app directory:**
    ```sh
    git clone https://github.com/astrothesaurus/uat-web-app.git /app
    ```

2. **Install Python dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

3. **Install JavaScript dependencies:**
    ```sh
    npm install
    ```
4. Create local static/setup.txt file (Use setup.txt.example as a template)

### Running the Application

**Using Docker:**
    ```sh
    docker compose up
    ```

### Running Unit Tests

1. **Python Unit Tests:**
    ```sh
    python -m unittest discover -s uat-web-app/tests
    ```

2. **JavaScript Unit Tests:**
    ```sh
    npm test
    ```
   
3**Playwright End-to-end Tests:**
    ```sh
    npm run test:playwright
    ```

## Project Structure
- `uat-web-app/`: Contains the source code for the Flask application.
  - `data_generator.py`: Script for generating data.
  - `utils.py`: Utility functions.
  - `tests/`: Contains the Python unit tests for the application.
  - `static/`: Contains the static files (CSS, JavaScript, images, UAT data).
  - `templates/`: Contains the HTML templates.
  - `__tests__/`: Contains JEST JavaScript tests.
- `package.json`: Contains the JavaScript dependencies and scripts.
- `tests/`: Contains the Playwright end-to-end tests for the application.
- `requirements.txt`: Contains the Python dependencies.
- `Dockerfile` and `docker-compose.yml`: Docker configuration files.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License
This project is licensed under the MIT License.