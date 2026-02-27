import { events, workerEvents } from "./constants";
import type {
  AddPurchasePayload,
  RecommendationResult,
  RemovePurchasePayload,
  TFVisorDataPayload,
  TrainingLog,
  User,
} from "../types";

type Unsubscribe = () => void;
type Listener<T> = (payload: T) => void;

type ProgressPayload = {
  progress: number;
};

function onEvent<T>(eventName: string, callback: Listener<T>): Unsubscribe {
  const handler = (event: Event) => {
    callback((event as CustomEvent<T>).detail);
  };

  document.addEventListener(eventName, handler);

  return () => {
    document.removeEventListener(eventName, handler);
  };
}

function dispatchEventData<T>(eventName: string, data: T) {
  document.dispatchEvent(
    new CustomEvent<T>(eventName, {
      detail: data,
    })
  );
}

export function onTrainingComplete(
  callback: Listener<unknown>
): Unsubscribe {
  return onEvent(events.trainingComplete, callback);
}

export function dispatchTrainingComplete(data: unknown) {
  dispatchEventData(events.trainingComplete, data);
}

export function onRecommend(callback: Listener<User>): Unsubscribe {
  return onEvent(events.recommend, callback);
}

export function dispatchRecommend(data: User) {
  dispatchEventData(events.recommend, data);
}

export function onRecommendationsReady(
  callback: Listener<RecommendationResult>
): Unsubscribe {
  return onEvent(events.recommendationsReady, callback);
}

export function dispatchRecommendationsReady(data: RecommendationResult) {
  dispatchEventData(events.recommendationsReady, data);
}

export function onTrainModel(callback: Listener<User[]>): Unsubscribe {
  return onEvent(events.modelTrain, callback);
}

export function dispatchTrainModel(data: User[]) {
  dispatchEventData(events.modelTrain, data);
}

export function onTFVisLogs(callback: Listener<TrainingLog>): Unsubscribe {
  return onEvent(workerEvents.tfVisLogs, callback);
}

export function dispatchTFVisLogs(data: TrainingLog) {
  dispatchEventData(workerEvents.tfVisLogs, data);
}

export function onTFVisorData(
  callback: Listener<TFVisorDataPayload>
): Unsubscribe {
  return onEvent(workerEvents.tfVisData, callback);
}

export function dispatchTFVisorData(data: TFVisorDataPayload) {
  dispatchEventData(workerEvents.tfVisData, data);
}

export function onProgressUpdate(
  callback: Listener<ProgressPayload>
): Unsubscribe {
  return onEvent(events.modelProgressUpdate, callback);
}

export function dispatchProgressUpdate(progressData: ProgressPayload) {
  dispatchEventData(events.modelProgressUpdate, progressData);
}

export function onUserSelected(callback: Listener<User>): Unsubscribe {
  return onEvent(events.userSelected, callback);
}

export function dispatchUserSelected(data: User) {
  dispatchEventData(events.userSelected, data);
}

export function onUsersUpdated(
  callback: Listener<{ users: User[] }>
): Unsubscribe {
  return onEvent(events.usersUpdated, callback);
}

export function dispatchUsersUpdated(data: { users: User[] }) {
  dispatchEventData(events.usersUpdated, data);
}

export function onPurchaseAdded(
  callback: Listener<AddPurchasePayload>
): Unsubscribe {
  return onEvent(events.purchaseAdded, callback);
}

export function dispatchPurchaseAdded(data: AddPurchasePayload) {
  dispatchEventData(events.purchaseAdded, data);
}

export function onPurchaseRemoved(
  callback: Listener<RemovePurchasePayload>
): Unsubscribe {
  return onEvent(events.purchaseRemoved, callback);
}

export function dispatchPurchaseRemoved(data: RemovePurchasePayload) {
  dispatchEventData(events.purchaseRemoved, data);
}

const Events = {
  onTrainingComplete,
  dispatchTrainingComplete,
  onRecommend,
  dispatchRecommend,
  onRecommendationsReady,
  dispatchRecommendationsReady,
  onTrainModel,
  dispatchTrainModel,
  onTFVisLogs,
  dispatchTFVisLogs,
  onTFVisorData,
  dispatchTFVisorData,
  onProgressUpdate,
  dispatchProgressUpdate,
  onUserSelected,
  dispatchUserSelected,
  onUsersUpdated,
  dispatchUsersUpdated,
  onPurchaseAdded,
  dispatchPurchaseAdded,
  onPurchaseRemoved,
  dispatchPurchaseRemoved,
};

export default Events;
