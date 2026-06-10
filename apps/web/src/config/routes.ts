export const routes = {
  login: '/login',
  dashboard: '/dashboard',
  mealAnalysis: '/meal-analysis',
  nutritionRecommend: '/nutrition/recommend',
  sportRecommend: '/sport/recommend',
  recommendations: '/recommendations',
  recommendationDetail: (id: string) => `/recommendations/${id}`,
  profile: '/profile'
};
