import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import Files from "./pages/Files";
import FolderView from "./pages/FolderView";
import FileUpload from "./pages/FileUpload";
import FileEdit from "./pages/FileEdit";
import FolderManager from "./pages/FolderManager";
import FolderForm from "./pages/FolderForm";
import Tasks from "./pages/Tasks";
import TaskForm from "./pages/TaskForm";
import Search from "./pages/Search";
import Trash from "./pages/Trash";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);
  // Arranca apagada: nunca se queda pegada. El loader inicial (verificación
  // de sesión) lo maneja ProtectedRoute.
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const prev = prevPath.current;
    prevPath.current = location.pathname;

    // Solo transiciones "pesadas": al entrar a la app desde el login.
    const heavy = prev === "/login" && location.pathname !== "/login";
    if (!heavy) return;

    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 650);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission="users:read">
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute permission="users:create">
              <Layout>
                <UserForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute permission="users:update">
              <Layout>
                <UserForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute permission="files:read">
              <Layout>
                <Files />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/carpetas"
          element={
            <ProtectedRoute permission="files:read">
              <Layout>
                <FolderManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/carpetas/new"
          element={
            <ProtectedRoute permission="files:upload">
              <Layout>
                <FolderForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/carpetas/:id/edit"
          element={
            <ProtectedRoute permission="files:upload">
              <Layout>
                <FolderForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/files/:folderId"
          element={
            <ProtectedRoute permission="files:read">
              <Layout>
                <FolderView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/files/:folderId/upload"
          element={
            <ProtectedRoute permission="files:upload">
              <Layout>
                <FileUpload />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/files/:folderId/:fileId/edit"
          element={
            <ProtectedRoute permission="files:upload">
              <Layout>
                <FileEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas"
          element={
            <ProtectedRoute permission="tasks:read">
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas/new"
          element={
            <ProtectedRoute permission="tasks:manage">
              <Layout>
                <TaskForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas/:id/edit"
          element={
            <ProtectedRoute permission="tasks:manage">
              <Layout>
                <TaskForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/buscar"
          element={
            <ProtectedRoute permission="files:read">
              <Layout>
                <Search />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/papelera"
          element={
            <ProtectedRoute permission="files:upload">
              <Layout>
                <Trash />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <LoadingScreen active={transitioning} />
    </>
  );
}
