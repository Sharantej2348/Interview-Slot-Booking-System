# Interview Scheduler Platform

A production-ready interview scheduling platform supporting recruiters and candidates, featuring slot management, booking, waitlist promotion, calendar views, and conflict-safe scheduling.

Built for the Unplatforms interview assignment.

# Features

## Recruiter Features

* Create interview slots
* Reschedule slots with conflict prevention
* Automatic waitlist promotion
* View waitlist candidates
* Delete slots safely
* Calendar view with grouping and utilization
* Prevent destructive updates affecting bookings

---

## Candidate Features

* Browse slots in dashboard and calendar view
* Book interview slots
* Join and leave waitlist
* Automatic promotion from waitlist
* View waitlist position
* View upcoming bookings
* Local timezone display
* Duplicate booking prevention

---

# Tech Stack

Frontend

* React
* Tailwind CSS
* React Router
* Axios

Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication

Database

* PostgreSQL

---

# Setup Instructions

## Prerequisites

Install:

* Node.js v18+
* PostgreSQL
* Git

---

# Backend Setup

```
cd backend
npm install
```

Create `.env`

```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=interview_scheduler
DB_PASSWORD=YOUR_PASSWORD
DB_PORT=5432
JWT_SECRET=YOUR_SECRET_KEY
```

Run backend:

```
npm run dev
```

---

# Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

# Database Schema

Tables:

users

```
id UUID PRIMARY KEY
email TEXT
password TEXT
role TEXT
```

slots

```
id UUID PRIMARY KEY
interviewer_id UUID
role TEXT
start_time TIMESTAMP
end_time TIMESTAMP
capacity INT
booked_count INT
```

bookings

```
id UUID PRIMARY KEY
slot_id UUID
candidate_id UUID
```

waitlist

```
id UUID PRIMARY KEY
slot_id UUID
candidate_id UUID
created_at TIMESTAMP
```

---

# Architecture Decisions

* Transaction-safe slot booking
* Automatic waitlist promotion
* Conflict-safe rescheduling
* UTC time persistence
* Local timezone rendering
* JWT authentication
* Role-based authorization

---

# AI Tool Usage

ChatGPT was used for:

* Architecture guidance
* Code optimization
* UI improvements
* Best practices validation

All core implementation, debugging, and integration were performed manually.

---

# Extra Features Implemented

* Waitlist promotion automation
* Calendar view for recruiter and candidate
* Waitlist position tracking
* Conflict prevention
* Reschedule safety validation

---

# How to Test

## Recruiter Flow

Register recruiter
Create slots
Reschedule slots
View waitlist

## Candidate Flow

Register candidate
Book slots
Join waitlist
Leave waitlist
View calendar

---

# Folder Structure

```
backend/
frontend/
README.md
```

---

# Author

Sri Sharan Tej
