# LoboLocate Backend

This repository contains the backend API for **LoboLocate**, a lost and found item tracking application. The backend is built with Node.js, Express, and MongoDB, providing users with the ability to report lost and found items, match potential lost/found pairs, view item history, and communicate through chat.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Models](#models)
- [Helper Functions](#helper-functions)
- [Error Handling](#error-handling)
- [License](#license)

## Features

- **User Authentication**: Signup and login functionality with password hashing.
- **Item Reporting**: Report items as "lost" or "found" with details such as item type, location, and distinguishing features.
- **Match Finding**: Automated matching of lost and found items based on item details and location.
- **History Tracking**: Retrieve a user's history of reported lost or found items.
- **Chat Functionality**: Communication between users on matched items.
  
## Prerequisites

- **Node.js** (v12 or later)
- **MongoDB** (local or MongoDB Atlas)
- **Git** for version control

## Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/LoboLocate.git
    cd LoboLocate/login_server
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Set Up MongoDB**:
    - Ensure MongoDB is running locally or use MongoDB Atlas. Update the MongoDB URI in the configuration step.

## Configuration

1. **Environment Variables**:
    - Create a `.env` file in the root of `login_server` with the following configuration:
      ```bash
      MONGODB_URI=your_mongodb_uri
      PORT=5000
      ```

2. **Start the Server**:
    ```bash
    npm start
    ```

3. **Access the API**:
    - The backend server runs at `http://localhost:5000` by default.

## API Endpoints

### User Routes

- **POST** `/api/user/signup`: Register a new user.
- **POST** `/api/user/signin`: Authenticate an existing user.
- **GET** `/api/user/:userId`: Retrieve user details by ID.

### Item Routes

- **POST** `/api/item/report`: Report a lost or found item.
- **GET** `/api/item/potentialMatches/:userId`: Retrieve potential matches for lost items.
- **GET** `/api/item/history/:userId`: Retrieve the history of reported items by user.
- **DELETE** `/api/item/delete/:itemId`: Delete a reported item by ID.
- **GET** `/api/item/chat/:itemId`: Retrieve chat history for a specific item.

## Models

### User Model

- **Name**: `User`
- **Fields**:
  - `name` (String): User’s name
  - `email` (String): User’s email address (unique)
  - `password` (String): Hashed password
  - `dateOfBirth` (Date): User’s date of birth

### LostAndFoundItem Model

- **Name**: `LostAndFoundItem`
- **Fields**:
  - `userId` (ObjectId): ID reference to the user who reported the item
  - `itemType` (String): Type of item lost/found
  - `dateLost` (Date): Date when the item was lost/found
  - `locationKnown` (Boolean): Indicates if the known location is provided
  - `knownLocation` (String): Specific location if known
  - `locations` (Array of Strings): Possible locations if exact location isn’t known (up to 3)
  - `distinguishingFeatures` (String): Notable features of the item
  - `longDescription` (String): Detailed description of the item
  - `status` (String): Status of the item ("lost" or "found")

### Chat Model

- **Name**: `Chat`
- **Fields**:
  - `senderId` (ObjectId): User ID of the message sender
  - `receiverId` (ObjectId): User ID of the message receiver
  - `itemId` (ObjectId): ID of the associated lost/found item
  - `message` (String): Message content
  - `timestamp` (Date): Timestamp of the message

## Helper Functions

- **calculateMatchScore**: Calculates a similarity score between lost and found items based on item type, location, and distinguishing features. A match score threshold of 0.6 is used to filter potential matches.

## Error Handling

Standardized error responses with appropriate status codes are used throughout the API. Errors include client-side validation errors (e.g., invalid fields) and server errors (e.g., MongoDB issues).
