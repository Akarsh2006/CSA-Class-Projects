# BuildFolio — 2024–28 CS-A Student Projects Showcase

<p align="center">
  <b>A modern, interactive platform showcasing projects, web apps, and innovations built by the Computer Science Section A (CS-A) Class of 2024–2028.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Animations-Framer%20Motion-0055FF?style=for-the-badge&logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

---

##  Overview

**BuildFolio** is a centralized hub designed to highlight the technical projects, prototypes, and open-source contributions created by the CS-A student cohort. Students can showcase their builds with rich multimedia previews, live demo links, source code repositories, and detailed tech stack breakdowns.

---

##  Key Features

- **Dynamic Hero Section:** Custom animated rotating headlines powered by Framer Motion.
- **Real-time Search & Filtering:** Filter projects instantly by category, tech stack tags, or key keywords.
- **Student & Project Profiles:** Rich project details including live website links, GitHub repositories, embedded YouTube demo videos, and contributor credits.
- **Interactive Likes:** Built-in project liking with optimistic UI rendering.
- **Live Comments Section:** Real-time discussion boards on project pages with optimistic updates and caching controls (`cache: 'no-store'`).
- **Authentication & Account Security:** Secure user authentication (Register, Login, Password Reset via SMTP Brevo email integration).
- **Vercel Analytics Integration:** Automated privacy-friendly visitor telemetry and page view tracking.
- **Responsive Design System:** Seamless experience tailored for mobile, tablet, and desktop viewports.

---

## Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Language** | JavaScript (ES6+ / React JSX) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Database** | [MongoDB](https://www.mongodb.com/) + Mongoose ODM |
| **Authentication & Mail** | JWT Tokens & [Brevo SMTP Relay](https://www.brevo.com/) |
| **Analytics** | [@vercel/analytics](https://vercel.com/analytics) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```text
projectsDisplay/
├── public/                # Static assets (images, icons)
├── src/
│   ├── app/               # Next.js App Router routes & pages
│   │   ├── api/           # Backend API routes (Auth, Projects, Comments, Likes)
│   │   ├── dashboard/     # User dashboard for project management
│   │   ├── login/         # Authentication pages
│   │   ├── project/[id]/  # Dynamic project detail views
│   │   ├── globals.css    # Global Tailwind CSS configuration
│   │   ├── icon.svg       # Custom app favicon
│   │   └── page.jsx       # Homepage with showcase catalog
│   ├── lib/               # Utility functions (dbConnect, auth helpers)
│   └── models/            # Mongoose schemas (User, Project)
├── .env.local             # Environment variables (git-ignored)
├── .npmrc                 # Legacy peer dependency configuration for Vercel builds
└── package.json           # Dependencies and scripts
