import { Suspense, lazy, type ComponentType, type ReactElement } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingState } from '../components/states/LoadingState';
import { routes } from '../config/routes';

function lazyNamed<T extends ComponentType<object>>(loader: () => Promise<Record<string, T>>, exportName: string) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] };
  });
}

const LoginPage = lazyNamed(() => import('../features/auth/LoginPage'), 'LoginPage');
const DashboardPage = lazyNamed(() => import('../features/dashboard/DashboardPage'), 'DashboardPage');
const MealAnalysisPage = lazyNamed(() => import('../features/meal-analysis/MealAnalysisPage'), 'MealAnalysisPage');
const NutritionRecommendPage = lazyNamed(() => import('../features/nutrition/NutritionRecommendPage'), 'NutritionRecommendPage');
const ProfilePage = lazyNamed(() => import('../features/profile/ProfilePage'), 'ProfilePage');
const RecommendationDetailPage = lazyNamed(
  () => import('../features/recommendations/RecommendationDetailPage'),
  'RecommendationDetailPage'
);
const RecommendationHistoryPage = lazyNamed(
  () => import('../features/recommendations/RecommendationHistoryPage'),
  'RecommendationHistoryPage'
);
const SportRecommendPage = lazyNamed(() => import('../features/sport/SportRecommendPage'), 'SportRecommendPage');

function page(element: ReactElement) {
  return <Suspense fallback={<LoadingState label="Chargement de la page..." />}>{element}</Suspense>;
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to={routes.dashboard} replace />
    },
    {
      path: routes.login,
      element: page(<LoginPage />)
    },
    {
      element: <AppLayout />,
      children: [
        { path: routes.dashboard, element: page(<DashboardPage />) },
        { path: routes.mealAnalysis, element: page(<MealAnalysisPage />) },
        { path: routes.nutritionRecommend, element: page(<NutritionRecommendPage />) },
        { path: routes.sportRecommend, element: page(<SportRecommendPage />) },
        { path: routes.recommendations, element: page(<RecommendationHistoryPage />) },
        { path: '/recommendations/:id', element: page(<RecommendationDetailPage />) },
        { path: routes.profile, element: page(<ProfilePage />) }
      ]
    }
  ],
  {
    future: {
      v7_relativeSplatPath: true
    }
  }
);
