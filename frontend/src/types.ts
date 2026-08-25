export type User = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
};

export type Session = { token: string; user: User };

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  deletedAt: string | null;
};

export type VehicleInput = Omit<Vehicle, 'id' | 'deletedAt'>;
