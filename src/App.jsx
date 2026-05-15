import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import PreScreenOverlay from './components/common/PreScreenOverlay';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Home / catalog
import Dashboard from './pages/home/Dashboard';
import Favourites from './pages/home/Favourites';
import Category from './pages/home/Category';
import Subcategory from './pages/home/Subcategory';
import FreeVideos from './pages/home/FreeVideos';
import MyVideos from './pages/home/MyVideos';
import VideoDetails from './pages/home/VideoDetails';
import CardDetails from './pages/home/CardDetails';
import PersonalisedCard from './pages/home/PersonalisedCard';
import PersonalisedVideo from './pages/home/PersonalisedVideo';

// Bytes
import Bytes from './pages/bytes/Bytes';
import ByteDetails from './pages/bytes/ByteDetails';

// Quiz
import Quiz from './pages/quiz/Quiz';
import QuizHistory from './pages/quiz/QuizHistory';
import QuizHistoryDetail from './pages/quiz/QuizHistoryDetail';
import QuizAnswerDistribution from './pages/quiz/QuizAnswerDistribution';
import Leaderboard from './pages/quiz/Leaderboard';

// Profile
import Profile from './pages/profile/Profile';
import Account from './pages/profile/Account';
import MyProfile from './pages/profile/MyProfile';
import ChangePassword from './pages/profile/ChangePassword';
import About from './pages/profile/About';
import Certificates from './pages/profile/Certificates';
import ReferAndEarn from './pages/profile/ReferAndEarn';
import Wallet from './pages/profile/Wallet';
import CardSubscriptions from './pages/profile/CardSubscriptions';
import CardSubscriptionsExplore from './pages/profile/CardSubscriptionsExplore';
import VideoSubscriptions from './pages/profile/VideoSubscriptions';
import CertificateView from './pages/profile/CertificateView';

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public — redirect to /dashboard if already signed in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected — bounce to /login if not signed in */}
      <Route element={<ProtectedRoute />}>
        {/* Home */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/category/:catKey" element={<Category />} />
        <Route path="/category/:catKey/subcategory/:subKey" element={<Subcategory />} />
        <Route path="/free-videos" element={<FreeVideos />} />
        <Route path="/my-videos" element={<MyVideos />} />
        <Route path="/video-details" element={<VideoDetails />} />
        <Route path="/card-details" element={<CardDetails />} />
        <Route path="/personalised-card" element={<PersonalisedCard />} />
        <Route path="/personalised-video" element={<PersonalisedVideo />} />

        {/* Bytes */}
        <Route path="/bytes" element={<Bytes />} />
        <Route path="/byte-details" element={<ByteDetails />} />

        {/* Quiz */}
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz-history" element={<QuizHistory />} />
        <Route path="/quiz-history-detail" element={<QuizHistoryDetail />} />
        <Route path="/quiz-answer-distribution" element={<QuizAnswerDistribution />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Account />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/certificate-view" element={<CertificateView />} />
        <Route path="/refer-and-earn" element={<ReferAndEarn />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/card-subscriptions" element={<CardSubscriptions />} />
        <Route path="/card-subscriptions-explore" element={<CardSubscriptionsExplore />} />
        <Route path="/video-subscriptions" element={<VideoSubscriptions />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <PreScreenOverlay />
    </>
  );
}
