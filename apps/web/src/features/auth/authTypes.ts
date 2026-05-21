export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: 'demo-user' | 'coach' | 'admin';
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: DemoUser;
  token: string;
};
