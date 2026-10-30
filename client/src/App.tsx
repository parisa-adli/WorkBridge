import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import CompleteProfile from "./pages/CompleteProfile";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import NotAccess from "./pages/NotAccess";
import OwnerDashboard from "./pages/OwnerDashboard";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import { DarkModeProvider } from "./context/DarkModeContext";
import { LanguageProvider } from "./context/LanguageContext";
import OwnerLayout from "./features/owner/OwnerLayout";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import Proposals from "./pages/Proposals";
import FreelancerLayout from "./features/freelancer/FreelancerLayout";
import SubmittedProjects from "./pages/SubmittedProjects";
import FreelancerProject from "./pages/FreelancerProject";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ProtectedRoute from "./ui/ProtectedRoute";
import AdminLayout from "./features/admin/AdminLayout";
import Categories from "./pages/Categories";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import AdminUserProfile from "./pages/AdminUserProfile";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function App() {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster position="top-center" />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route
              path="/owner"
              element={
                <ProtectedRoute>
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<Project />} />
            </Route>
            <Route
              path="/freelancer"
              element={
                <ProtectedRoute>
                  <FreelancerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FreelancerDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="proposals" element={<Proposals />} />
              <Route path="projects" element={<SubmittedProjects />} />
              <Route path="projects/:id" element={<FreelancerProject />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<AdminUserProfile />} />
              <Route path="categories" element={<Categories />} />
              <Route path="proposals" element={<Proposals />} />
              <Route path="projects" element={<SubmittedProjects />} />
              <Route path="projects/:id" element={<Project />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/not-access" element={<NotAccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </LanguageProvider>
    </DarkModeProvider>
  );
}

export default App;

// auth
// Task #1 : auth user via OTP : one-time-password
// 1. form -> getOTP -> input + button => phoneNumber => send OTP
// 2. form -> checkOTP -> request -> (otp, phoneNumber)

// request =>
// 1. axios (useState, useEffect)
// 2. useFetch (data, loading, error) : custom hook
// 3. react-query => redux alternative (remote states), fetch(get), mutate(post)

// folder structure project
// features => instead components folder
// project => (components, hooks, context, ...)
// proposal
// authentication
// category
// users
