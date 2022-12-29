import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

export enum RxJsLogginglevel {
  TRACE,
  INFO,
  DEBUG,
  ERROR,
}

let rxjsLogginglevel = RxJsLogginglevel.INFO;

export function setRxJsLogginglevel(level: RxJsLogginglevel) {
  rxjsLogginglevel = level
}

export const debug = (level: number, message) => (source: Observable<any>) => source
  .pipe(
    tap(val => {

      if (level >= rxjsLogginglevel) {
        console.log(message + ': ', val);
      }

    })
  );