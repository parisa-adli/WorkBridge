# Freelancering App Frontend

This project is a **Freelancering App** built with **React** and **Vite**. It provides a platform for managing projects, proposals, and users, enabling collaboration between freelancers and project owners. Below is an overview of the tools, patterns, and features used in the project.

## Tools and Libraries

- **React**: Core library for building the user interface.
- **Vite**: Fast development server and build tool.
- **React Router**: For client-side routing and navigation.
- **React Query**: For server state management and data fetching.
- **React Hook Form**: For form handling and validation.
- **Tailwind CSS**: For styling with utility-first CSS.
- **React Icons**: For using a variety of icons.
- **React Hot Toast**: For displaying notifications.
- **TanStack Query Devtools**: For debugging React Query.

## Code Patterns and Architecture

- **Feature-Based Structure**: The `src/features` directory organizes the code by features such as `projects`, `proposals`, `freelancer`, and `admin`.
- **Custom Hooks**: Reusable hooks like `useProjects`, `useProposals`, and `useEditProject` encapsulate logic for data fetching and state management.
- **Context API**: Used for global state management, such as `DarkModeContext`.
- **Protected Routes**: Implemented using the `ProtectedRoute` component to restrict access based on user authentication and authorization.
- **Reusable UI Components**: Components like `Table`, `Modal`, `Sidebar`, and `Stat` are used across the app for consistency.
- **Dynamic Forms**: Forms like `CreateProjectForm` and `CreateProposal` are built with `React Hook Form` for validation and state management.
- **Responsive Design**: Tailwind CSS ensures the app is mobile-friendly and responsive.

## Features

- **Project Management**: Create, edit, delete, and toggle the status of projects.
- **Proposal Management**: Submit, view, and change the status of proposals.
- **User Management**: Admins can view and manage users.
- **Dashboard**: Displays statistics and summaries for admins, freelancers, and project owners.
- **Dark Mode**: Supports light and dark themes using the `DarkModeProvider`.

## Folder Structure

- `src/features`: Contains feature-specific components and logic.
- `src/ui`: Reusable UI components like `Table`, `Modal`, and `Loading`.
- `src/hooks`: Custom hooks for shared logic.
- `src/services`: API service functions for interacting with the backend.
- `public`: Static assets like fonts and images.

## Deployment

The app is optimized for production using Vite's build system and can be deployed to any static hosting service.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.
4. Build for production: `npm run build`.

This project demonstrates a clean and modular approach to building scalable React applications with modern tools and best practices.
