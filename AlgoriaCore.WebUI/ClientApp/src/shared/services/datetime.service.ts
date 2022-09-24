import { Injectable } from '@angular/core';
import * as moment from 'moment';
import 'moment-duration-format';
import 'moment-timezone';

@Injectable({ providedIn: 'root' })
export class DateTimeService {

    private _timeZone: string;

    setTimeZone(timeZone: string = null) {
        if (timeZone) {
            moment.tz.setDefault(timeZone);
            this._timeZone = timeZone;
        } else {
            moment.tz.setDefault();
            this._timeZone = moment.tz.guess();
        }
    }

    getTimeZone(): string {
        if (this._timeZone) {
            return this._timeZone;
        } else {
            this._timeZone = moment.tz.guess();
            return this._timeZone;
        }
    }

    getAvailableZones(): string[] {
        return moment.tz.names();
    }

    getDateTimeToSaveServer(dateTime: Date): moment.Moment {
        const aux = moment([
            dateTime.getFullYear(),
            dateTime.getMonth(),
            dateTime.getDate(),
            dateTime.getHours(),
            dateTime.getMinutes(),
            dateTime.getSeconds(),
            dateTime.getMilliseconds()
        ]);

        return moment(aux.utc().format('YYYY-MM-DDTHH:mm:ssZ'));
    }

    getDateTimeEndDayToSaveServer(dateTime: Date): moment.Moment {
        return this.getDateTimeToSaveServer(dateTime).add(1, 'day').subtract(1, 'ms');
    }

    getDateToSaveServer(date: Date): moment.Moment {
        return moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]);
    }

    getTimeToSaveServer(time: Date, format: string = null): moment.Duration {
        if (time) {
            const momentObject = this.getDateTimeToMoment(time);

            return moment.duration(momentObject.format(format ? format : 'HH:mm'));
        } else {
            return null;
        }
    }
    getDateTimeToDisplayLocal(momentValue: moment.Moment, format = 'DD/MM/YYYY HH:mm:ss'): string {
        return momentValue ? momentValue.local().format(format) : '';
    }

    getDateTimeToDisplay(momentValue: moment.Moment, format = 'DD/MM/YYYY HH:mm'): string {
        return momentValue ? momentValue.format(format) : '';
    }

    getDateToDisplay(momentValue: moment.Moment, format = 'DD/MM/YYYY'): string {
        return momentValue ? momentValue.utc().format(format) : '';
    }

    getTimeToDisplay(duration: moment.Duration, format = 'HH:mm'): string {
        return duration ? duration.format(format) : '';
    }

    getMomentValueInDate(momentValue: moment.Moment): Date {
        return new Date(
            momentValue.year(),
            momentValue.month(),
            momentValue.date(),
            momentValue.hours(),
            momentValue.minutes(),
            momentValue.seconds(),
            momentValue.milliseconds());
    }

    getMomentValueInDateOnly(momentValue: moment.Moment): Date {
        return new Date(
            momentValue.year(),
            momentValue.month(),
            momentValue.date());
    }

    getDateTimeToAssignInFormControl(momentValue: moment.Moment): Date {
        return momentValue ? this.getMomentValueInDate(momentValue) : null;
    }

    getDateToAssignInFormControl(momentValue: moment.Moment): Date {
        return momentValue ? new Date(momentValue.utc().format('YYYY-MM-DDT00:00')) : null;
    }

    getTimeToAssignInFormControl(duration: moment.Duration, format: string = null): Date {
        const momentToday = moment();

        momentToday.hours(duration.hours());
        momentToday.minutes(duration.minutes());
        momentToday.seconds(duration.seconds());
        momentToday.milliseconds(duration.milliseconds());

        return new Date(momentToday.format('YYYY-MM-DD') + 'T' + momentToday.format(format ? format : 'HH:mm:ss'));
    }

    getTimeToAssignInFormControlFromMoment(momentValue: moment.Moment, format: string = null): Date {
        return this.getMomentValueInDate(momentValue);
    }

    getCurrentDateTime(): moment.Moment {
        return moment(moment().utc().format('YYYY-MM-DDTHH:mm:ssZ'));
    }

    getCurrentDateTimeToDate(): Date {
        const momentValue = this.getCurrentDateTime();

        return this.getMomentValueInDate(momentValue);
    }

    getCurrentDateToDate(): Date {
        const momentValue = this.getCurrentDateTime();

        return this.getMomentValueInDateOnly(momentValue);
    }

    getDateTimeToMoment(dateTime: Date): moment.Moment {
        return moment([
            dateTime.getFullYear(),
            dateTime.getMonth(),
            dateTime.getDate(),
            dateTime.getHours(),
            dateTime.getMinutes(),
            dateTime.getSeconds(),
            dateTime.getMilliseconds()
        ]);
    }

    getDateToMoment(date: Date): moment.Moment {
        return moment([
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ]);
    }

    getTimeToDuration(time: Date, format: string = null): moment.Duration {
        return this.getTimeToSaveServer(time, format);
    }

    getDateTimeStringToDate(date: string): Date {
        return new Date(moment(date).format('YYYY-MM-DDT00:00'));
    }

    getDateTimeStringISOToFormat(dateTime: string, format: string = 'DD/MM/YYYY HH:mm'): string {
        const self = this;

        return self.getDateTimeToDisplay(moment(dateTime), format);
    }

    getDateStringISOToFormat(date: string, format: string = 'DD/MM/YYYY'): string {
        const self = this;

        return self.getDateToDisplay(moment(date), format);
    }

    getTimeStringISOToFormat(time: string, format: string = 'HH:mm'): string {
        const self = this;

        return self.getTimeToDisplay(moment.duration(time), format);
    }

    getUTCOffSet(): number {
        return this.getCurrentDateTime().utcOffset();
    }

    getDateTimeToMomentPlain(dateTime: Date): moment.Moment {
        return moment.utc([
            dateTime.getFullYear(),
            dateTime.getMonth(),
            dateTime.getDate(),
            dateTime.getHours(),
            dateTime.getMinutes(),
            dateTime.getSeconds(),
            dateTime.getMilliseconds()
        ]);
    }
}
