# Social Scraper

## Description

**Social Scraper** is a console tool developed in **Node.js** that uses **Playwright** to perform web scraping on various social media platforms.

Currently, **Social Scraper** supports the following providers:
1. **X (Twitter)**

## Features

- **Multi-Platform Support**: Compatible with different social media platforms through specific providers.
- **Structured Storage**: Saves the results in JSON files, organized by provider name and date.
- **Session Management**: Handles active sessions for efficient scraping.

## Installation

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** 

### Installation Steps

1. **Clone the Repository**

    ```bash
    git clone https://github.com/code3743/social-scraper.git
    ```

2. **Navigate to the Project Directory**

    ```bash
    cd social-scraper
    ```

3. **Install Dependencies**

    ```bash
    npm install
    ```

## Usage

**Social Scraper** is a console-based tool. To run it, use the following command:

```bash
node app.js
```

### Results

The results are stored in the `/results` folder as JSON files in the format `providerName-date.json`. Each file contains an array of posts with the following structure:

- **id**: The post's identifier.
- **content**: The textual content of the post.
- **media**: An array of URLs for associated media.
- **metadata**: An object containing additional relevant information.

## Contribution

If you would like to contribute to **Social Scraper**, please follow these steps:

1. **Fork the Repository**
2. **Create a Branch for Your Feature or Bug Fix**

    ```bash
    git checkout -b feature/new-feature
    ```

3. **Make Your Changes and Commit Them**

    ```bash
    git commit -m "Description of changes"
    ```

4. **Push to Your Branch**

    ```bash
    git push origin feature/new-feature
    ```

5. **Open a Pull Request**

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
