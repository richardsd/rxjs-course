import { Component, OnInit } from '@angular/core';
import { Course } from "../model/course";
import { interval, noop, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delayWhen, finalize, map, retryWhen, shareReplay, tap } from 'rxjs/operators';
import { createHttpObservable } from '../common/util';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    beginnersCourses$: Observable<Course[]>;

    advancedCourses$: Observable<Course[]>;

    constructor() {

    }

    ngOnInit() {

        const http$ = createHttpObservable('/api/courses');

        // notice that we might change the order of the finalize/shareReplay, it depends on how we want to replay or act on observable complete (same for error handling)
        const courses$: Observable<Course[]> = http$
            .pipe(
                tap(() => console.log('http executed!')),
                map(res => Object.values(res['payload'])),
                // catchError((error) => {
                //     console.log('Error occurred', error);
                //     return throwError(error); // it will return an observable with the error
                // }),
                // finalize(() => {
                //     console.log('Finalize executed');
                // }),
                // catchError(() => of([])),  // return an alternative observable when the observable errored out 
                shareReplay<Course[]>(),
                retryWhen((errors) => errors.pipe(
                    delayWhen(() => timer(2000)), // wait for the whole stream to retry
                )),
            );

        this.beginnersCourses$ = courses$
            .pipe(
                map(courses => courses.filter((course: Course) => course.category === 'BEGINNER'))
            );

        this.advancedCourses$ = courses$
            .pipe(
                map(courses => courses.filter((course: Course) => course.category === 'ADVANCED'))
            )

        courses$.subscribe(
            (courses: Course[]) => console.log(courses),
            noop, //() => {},
            () => console.log('completed!')
        );

    }

}
