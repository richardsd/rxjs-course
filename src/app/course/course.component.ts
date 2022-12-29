import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Course} from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay, throttle, throttleTime
} from 'rxjs/operators';
import {merge, fromEvent, Observable, concat, interval} from 'rxjs';
import {Lesson} from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { RxJsLogginglevel, debug } from '../common/debug';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    courseId: string;

    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>;


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];

        this.course$ = createHttpObservable(`/api/courses/${this.courseId}`) as Observable<Course>;

    }

    ngAfterViewInit() {

        // const initialLessons$ = this.loadLessons();

        this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map((event) => event.target.value),
                // throttle(() => interval(500)),
                // throttleTime(500),
                debug(RxJsLogginglevel.TRACE, 'message'),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(), // ignore duplicate values (only accept distinct values)
                switchMap((searchTerm) => this.loadLessons(searchTerm)),
                debug(RxJsLogginglevel.DEBUG, 'results'),
            );

        // this.lessons$ = concat(initialLessons$, searchLessons$);

    }

    loadLessons(searchTerm: string = ''): Observable<Lesson[]> {
        return createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${searchTerm}`)
        .pipe(
            map(res => res['payload']),
        );
    }

}
