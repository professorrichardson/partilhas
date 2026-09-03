import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/auth/AuthPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { CertificatesPage } from './pages/CertificatesPage'
import { CommunitiesPage } from './pages/CommunitiesPage'
import { CommunityDetailPage } from './pages/CommunityDetailPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { LessonPlanDetailPage } from './pages/LessonPlanDetailPage'
import { LessonPlansPage } from './pages/LessonPlansPage'
import { LibraryPage } from './pages/LibraryPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { TutorialDetailPage } from './pages/TutorialDetailPage'
import { TutorialsPage } from './pages/TutorialsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="/partilhas" element={<Navigate to="/" replace />} />
            <Route path="/partilhas/:postId" element={<PostDetailPage variant="partilha" />} />
            <Route path="/comunidades" element={<CommunitiesPage />} />
            <Route path="/comunidades/:identifier" element={<CommunityDetailPage />} />
            <Route path="/biblioteca" element={<LibraryPage />} />
            <Route path="/biblioteca/:postId" element={<PostDetailPage variant="biblioteca" />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/planos-de-aula" element={<LessonPlansPage />} />
            <Route path="/planos-de-aula/:lessonPlanId" element={<LessonPlanDetailPage />} />
            <Route path="/tutoriais" element={<TutorialsPage />} />
            <Route path="/tutoriais/:tutorialId" element={<TutorialDetailPage />} />
            <Route path="/certificados" element={<CertificatesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
