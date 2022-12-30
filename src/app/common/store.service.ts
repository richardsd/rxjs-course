import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";
import { map, tap } from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";

@Injectable({
  providedIn: 'root',
})
export class Store {

  private subject = new BehaviorSubject<Course[]>([]);

  courses$: Observable<Course[]> = this.subject.asObservable();

  init() {
    const http$ = createHttpObservable('/api/courses');
    http$
      .pipe(
        tap(() => console.log("HTTP request executed")),
        map(res => Object.values(res["payload"])),
      ).subscribe(
        courses => this.subject.next(courses)
      );
  }

  selectBeginnerCourses() {
    return this.filterByCategory('BEGINNER');
  }

  selectAdvancedCourses() {
    return this.filterByCategory('ADVANCED');
  }

  selectCourseById(courseId: number) {
    return this.courses$
      .pipe(
        map(courses => courses
          .find(course => course.id == courseId))
      );
  }

  filterByCategory(category: string) {
    return this.courses$
      .pipe(
        map(courses => courses
          .filter(course => course.category == category))
      );
  }

  saveCourse(courseId: number, changes: Partial<Course>): Observable<any> {
    // update in memory the course
    const courses = this.subject.getValue();
    const courseIndex = courses.findIndex(course => course.id === courseId);

    const newCourses = courses.slice(0);
    newCourses[courseIndex] = {
      ...courses[courseIndex],
      ...changes
    };
    this.subject.next(newCourses);

    // create an observable from the fetch promise response
    return fromPromise(fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: {
        'content-type': 'application/json',
      }
    }));

    // const http$ = createHttpObservable('/api/courses');
    // http$
    //   .pipe(
    //     tap(() => console.log("HTTP request executed")),
    //     map(res => Object.values(res["payload"])),
    //   ).subscribe(
    //     courses => this.subject.next(courses)
    //   );
  }

}