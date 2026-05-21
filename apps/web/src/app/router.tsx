import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { routes } from '../config/routes';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MealAnalysisPage } from '../features/meal-analysis/MealAnalysisPage';
import { NutritionRecommendPage } from '../features/nutrition/NutritionRecommendPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { RecommendationDetailPage } from '../features/recommendations/RecommendationDetailPage';
import { RecommendationHistoryPage } from '../features/recommendations/RecommendationHistoryPage';
import { SportRecommendPage } from '../features/sport/SportRecommendPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={routes.dashboard} replace />
  },
  {
    path: routes.login,
    element: <LoginPage />
  },
  {
    element: <AppLayout />,
    children: [
      { path: routes.dashboard, element: <DashboardPage /> },
      { path: routes.mealAnalysis, element: <MealAnalysisPage /> },
      { path: routes.nutritionRecommend, element: <NutritionRecommendPage /> },
      { path: routes.sportRecommend, element: <SportRecommendPage /> },
      { path: routes.recommendations, element: <RecommendationHistoryPage /> },
      { path: '/recommendations/:id', element: <RecommendationDetailPage /> },
      { path: routes.profile, element: <ProfilePage /> }
    ]
  }
]);
