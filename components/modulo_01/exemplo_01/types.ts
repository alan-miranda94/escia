export type Purchase = {
  id: number;
  name: string;
  category?: string;
  price: number;
  color: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  color: string;
  image: string;
};

export type User = {
  id: number;
  name: string;
  age: number;
  purchases: Purchase[];
};

export type RemovePurchasePayload = {
  userId: number;
  product: Purchase;
};

export type AddPurchasePayload = {
  userId: number;
  product: Product;
};

export type TrainingLog = {
  epoch: number;
  loss: number;
  accuracy: number;
};

export type ChartPoint = {
  x: number;
  y: number;
};

export type TFVisorDataPayload = {
  weights: Record<string, unknown> | unknown[] | null;
  catalog?: Product[];
  users?: User[];
};

export type RecommendationResult = {
  user: User;
  recommendations: Product[];
};

export type TrainingPayload = {
  users: User[];
  products: Product[];
};

export type RecommendPayload = {
  user: User;
};

export type WorkerState = {
  weights: Record<string, number> | null;
  catalog: Product[];
  users: User[];
};

export type UserViewProps = {
  users?: User[];
  selectedUserId?: number | null;
  onUserSelect?: (userId: number | null) => void;
  onPurchaseRemove?: (payload: RemovePurchasePayload) => void;
};

export type ProductCardProps = {
  product: string;
  name: string;
  category: string;
  price: string | number;
  color: string;
};

export type PastPurchaseProps = {
  product: string;
  name: string;
  price: string | number;
  color: string;
};

export type ModelTrainingViewProps = {
  users?: User[];
  isTraining?: boolean;
  canRunRecommendation?: boolean;
  onTrainModel?: () => void;
  onRunRecommendation?: () => void;
};
