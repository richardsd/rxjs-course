import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Course } from "../model/course";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from 'moment';
import { fromEvent } from 'rxjs';
import { concatMap, distinctUntilChanged, exhaustMap, filter, mergeMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html',
    styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    course: Course;

    @ViewChild('saveButton', { static: true })
    saveButton: ElementRef;

    @ViewChild('searchInput', { static: true })
    searchInput: ElementRef;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        @Inject(MAT_DIALOG_DATA) course: Course) {

        this.course = course;

        this.form = fb.group({
            description: [course.description, Validators.required],
            category: [course.category, Validators.required],
            releasedAt: [moment(), Validators.required],
            longDescription: [course.longDescription, Validators.required]
        });

    }

    ngOnInit() {

        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                // for save we need to use concatMap to saves sequential
                concatMap(changes => this.saveCourse(changes)), // saves are going to be done sequentially, wait for an observable to complete before taking the other
                // mergeMap(changes => this.saveCourse(changes)), // saves are going to be done in parallel
            )
            .subscribe(console.log);
    }


    saveCourse(changes) {
        return fromPromise(fetch(`/api/courses/${this.course.id}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: {
                'content-type': 'application/json',
            }
        }));
    }

    ngAfterViewInit() {

        // don't know why the nativeElement is undefined here (bypassing it for now)
        // fromEvent(this.saveButton.nativeElement, 'click')
        // @ts-ignore
        fromEvent(this.saveButton._elementRef.nativeElement, 'click')
            .pipe(
                // prevents multiple clicks from triggering a save (ignores new clicks emitted by the stream, when the save is still ongoing)
                exhaustMap(() => this.saveCourse(this.form.value))
            )
            .subscribe();
    }



    close() {
        this.dialogRef.close();
    }

    save() { }

}
