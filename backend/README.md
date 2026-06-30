# CivicPulse AI - Backend

## Overview

This folder contains the custom Node.js backend used by CivicPulse AI.

The backend acts as the communication layer between UiPath and the AI reasoning engine. It receives HTTP requests from UiPath, processes incident information, invokes AI services, and returns structured JSON responses that drive the Maestro workflow.

## Responsibilities

- Receive incident data from UiPath
- Process AI prompts
- Return structured JSON responses
- Expose REST APIs for UiPath HTTP Request activities
- Support incident analysis and report generation

## Technologies

- Node.js
- Express.js
- JavaScript
- REST APIs
- JSON
- OpenAI API

## Main Files

- `index.js` / `app.js` – Application entry point
- `server.js` – HTTP server
- `routes/` – API endpoints
- `prompts/` – AI prompts
- `package.json` – Project dependencies

## Notes

Configuration values such as API keys are stored in the `.env` file, which is intentionally excluded from this repository for security purposes.
