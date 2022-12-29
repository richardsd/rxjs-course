import { Observable } from "rxjs";

export function createHttpObservable(url: string) {
  return new Observable(observer => { // previously Observable.create(); but it is now deprecated

    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url, { signal })
      .then((response) => {
        return response.json();
      })
      .then((body => {
        observer.next(body);
        observer.complete();
      }))
      .catch((error) => {
        observer.error(error);
      });

    // we are returning the unsubscribe / cancelation of the observable
    return () => controller.abort();
  });
}