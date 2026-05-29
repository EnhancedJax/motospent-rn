import type { Observable } from '@nozbe/watermelondb/utils/rx';

export function subscribeObservable<T>(
  observable: Observable<T>,
  onValue: (value: T) => void,
): () => void {
  const subscription = observable.subscribe(onValue);
  return () => subscription.unsubscribe();
}
