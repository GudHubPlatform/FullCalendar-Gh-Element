import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import { schemaGenerator } from './schemaGenerator.js';

import './../scss/style.scss';

import '@fullcalendar/common/main.min.css';

/********************* FULLCALENDAR WEB COMPONENT CREATING *********************/

class Fullcalendar extends HTMLElement {
    constructor() {
        super();
        this.calendar;
        this.appId;
        this.fieldId;
        this.fieldModel;
        this.isDurationMode;
        this.calendarType;
    }

    /********************* OBSERVED ATTRIBUTES *********************/
    // Adding listeners to component's data attributes.

    static get observedAttributes() {
        return ['app-id'];
    }

    /********************* GET ATTRIBUTES *********************/
    // Getting attributes from component's data attributes.

    async getAttributes() {
        this.appId = this.getAttribute('app-id');
        this.fieldId = this.getAttribute('field-id');
        this.calendarType = this.getAttribute('calendar-type');

        this.fieldModel = await gudhub.getField(this.appId, this.fieldId);
        this.isDurationMode = this.fieldModel.data_model.use_duration && this.fieldModel.data_model.use_duration === 1 ? true : false;
    }

    /********************* ATTRIBUTE CHANGED CALLBACK *********************/
    // We init component only after attributes change.
    // We are doing it, instead of connedctedCallback to get right data.
    // Usgin connectedCallback we are always receiving not ready data like this - {{appId}}

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'app-id' && newValue.indexOf('{{') == -1) {
            setTimeout(async () => {
                await this.getAttributes();
                await this.init();
            }, 0);
        }
    }

    /********************* INIT *********************/
    // Firslty, create div inside component.
    // Then, we get events data.
    // Finally, we are configurating calendar component and render it.

    async init() {
        this.innerHTML = /* HTML */`<div class="calendar__wrapper"><div class="calendar__preloader active"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><path fill="#0893d2" d="M256,512c-34.6,0-68.1-6.8-99.6-20.1C125.9,479,98.5,460.5,75,437s-42-50.9-54.9-81.4C6.8,324.1,0,290.5,0,256   c0-9.9,8.1-18,18-18s18,8.1,18,18c0,29.7,5.8,58.5,17.3,85.6c11.1,26.2,26.9,49.8,47.1,70c20.2,20.2,43.8,36.1,69.9,47.1   c27.1,11.5,55.9,17.3,85.6,17.3s58.5-5.8,85.6-17.3c26.2-11.1,49.8-27,70-47.2c20.2-20.2,36.1-43.8,47.1-69.9   c11.5-27.1,17.3-55.9,17.3-85.6c0-29.7-5.8-58.5-17.3-85.6c-11.1-26.1-27.1-49.9-47.2-70c-20-20.1-43.8-36.1-69.9-47.1   C314.5,41.8,285.7,36,256,36c-9.9,0-18-8.1-18-18s8.1-18,18-18c34.6,0,68.1,6.8,99.6,20.1C386.2,33,413.5,51.5,437,75   s42,50.9,54.9,81.4c13.4,31.5,20.1,65.1,20.1,99.6c0,34.5-6.8,68.1-20.1,99.6C479,386.1,460.5,413.5,437,437s-50.9,42-81.4,54.9   C324.1,505.3,290.6,512,256,512z"/></g></svg></div><div class="calendar" style="width: 100%"></div></div>`;

        const calendarElement = this.querySelector('.calendar');

        let calendarViewOptions;
        let initialView;

        switch(this.calendarType) {
            case 'default':
                calendarViewOptions = 'dayGridMonth,timeGridWeek,timeGridDay,listDay';
                switch(this.fieldModel.data_model.initialView) {
                    case 'Month':
                        initialView = 'dayGridMonth';
                        break;
                    case 'Week':
                        initialView = 'timeGridWeek';
                        break;
                    case 'Day':
                        initialView = 'timeGridDay';
                        break;
                    default:
                        initialView = 'dayGridMonth';
                        break;
                }
                break;
            case 'dayGrid':
                calendarViewOptions = 'dayGridMonth,dayGridWeek,dayGridDay';
                initialView = this.fieldModel.data_model.initialView ? this.calendarType + this.fieldModel.data_model.initialView : 'dayGridMonth';
                break;
            case 'timeGrid':
                calendarViewOptions = 'timeGridWeek,timeGridDay';
                initialView = this.fieldModel.data_model.initialView && this.fieldModel.data_model.initialView !== 'Month' ? this.calendarType + this.fieldModel.data_model.initialView : 'timeGridWeek';
                break;
            case 'list':
                calendarViewOptions = 'listYear,listMonth,listWeek,listDay';
                initialView = this.fieldModel.data_model.initialView ? this.calendarType + this.fieldModel.data_model.initialView : 'listMonth';
                break;
        }

        this.calendar = new Calendar(calendarElement, {
            plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
            initialView,
            editable: true,
            eventResizableFromStart: true,
            eventDisplay: 'block',
            events: [],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: calendarViewOptions
            },
            dayMaxEvents: true,
            views: {
                listDay: { buttonText: 'List day' },
                listWeek: { buttonText: 'List week' },
                listMonth: { buttonText: 'Month' },
                listYear: { buttonText: 'Year' },
                dayGridDay: {buttonText: 'Day'},
                dayGridWeek: {buttonText: 'Week'},
                dayGridMonth: {buttonText: 'Month'},
                timeGridDay: {buttonText: 'Day'},
                timeGridWeek: {buttonText: 'Week'},
            },
            eventDrop: async (info) => {
                await this.changeDate(info);
            },
            eventResize: async (info) => {
                if(this.isDurationMode) {
                    await this.changeDuration(info);
                } else {
                    await this.changeDate(info);
                }
            },
            eventClick: (info) => {
                if(this.fieldModel.data_model.table_settings.action === 'open_item') {
                    let angularElement = angular.element(this.parentElement);
                    let scope = angularElement.scope();
                    let injector = angularElement.injector();
                    let location = injector.get('$location');
                    location.path(`/act/open_item/${info.event.id.split('.')[0]}/${this.fieldModel.data_model.view_id}/${info.event.id.split('.')[1]}`);
                    scope.$apply();
                }
            },
            datesSet: async (dateInfo) => {
                if(this.calendar.getEventSourceById(`${dateInfo.start.getUTCMonth() + 2}-${dateInfo.start.getUTCFullYear()}`) == null) {
                    const data = await this.getData(dateInfo.start.getUTCMonth() + 2, dateInfo.start.getUTCFullYear());
                    this.calendar.addEventSource(data);
                }
            }
        });

        setTimeout(() => {
            this.calendar.render();
            this.subscribeToPipeService();
        }, 0);

        let data = await this.getData(new Date().getUTCMonth() + 1, new Date().getUTCFullYear());
        
        this.calendar.addEventSource(data);

        this.querySelector('.calendar__preloader').classList.remove('active');

    }

    /********************* CHANGE DATE *********************/
    // Starts after user move event on calendar or resize it in non duration mode.
    // Here we just grab new date data from fullcalendar's event and save it using library's methods.

    async changeDate(info) {
        const newStartDate = new Date(info.event.start);
        const newStartDateInMiliseconds = newStartDate.getTime();
        await gudhub.setFieldValue(info.event.id.split('.')[0], info.event.id.split('.')[1], this.fieldModel.data_model.itemsConfig.startFieldId, newStartDateInMiliseconds);
        if (!this.isDurationMode) {
            const newEndDate = new Date(info.event.end);
            const newEndDateInMiliseconds = newEndDate.getTime();
            await gudhub.setFieldValue(info.event.id.split('.')[0], info.event.id.split('.')[1], this.fieldModel.data_model.itemsConfig.endDateFieldId, newEndDateInMiliseconds);
        }
    }

    /********************* CHANGE DURATION *********************/
    // Starts after user resize event in duration mode.
    // Here we just get new date info from fullcalendar's event and get delta between start and end date.
    // After that we just save this delta as new duration.

    async changeDuration(info) {
        const newStartDate = new Date(info.event.start);
        const newStartDateInMiliseconds = newStartDate.getTime();
        const newEndDate = new Date(info.event.end);
        const newEndDateInMiliseconds = newEndDate.getTime();
        const newDuration = newEndDateInMiliseconds - newStartDateInMiliseconds;
        await gudhub.setFieldValue(info.event.id.split('.')[0], info.event.id.split('.')[1], this.fieldModel.data_model.itemsConfig.durationFieldId, newDuration);
    }

    /********************* GET DATA *********************/
    // Getting events data from.

    async getData(month, year) {
        const schema = this.generateSchema(month, year);

        const response = await gudhub.jsonConstructor(schema);

        return {
            id: `${month}-${year}`,
            events: response.items
        }
    }

    /* SUBSCRIBE TO PIPE SERVICE */
    // Here we subscribe for update items event in pipe service to update calendar info dynamically

    subscribeToPipeService() {
        // Need to fix error on items changing on subscribe
        gudhub.on("gh_items_update", { app_id: this.fieldModel.data_model.source_app_id }, this.getCalendarEvents);
    }

    /* FETCH CALENDAR EVENTS */
    // Fetching data for calendar, preparing it, and passing to calendar

    async getCalendarEvents() {
        let updatedData = await this.getData();
        this.calendar.getEventSources().forEach(source => {
            source.remove();
        });
        this.calendar.addEventSource(updatedData);
    }

    /* UNSUBSCRIBE FROM PIPE SERVICE */
    // Unsubscribing from PipeService
    // Call at disconnectedCallback to increase performance

    unsubscribeFromPipe() {
        gudhub.destroy("gh_items_update", { app_id: this.fieldModel.data_model.source_app_id }, this.getCalendarEvents);
    }

    /********************* GENERATE SCHEMA *********************/
    // Here we call the data schema generator with right options.
    // We need this schema to get data in right format for fullcalendar.

    generateSchema(month, year) {
        const schemaOptions = {
            sourceAppId: this.fieldModel.data_model.source_app_id,
            titleFieldId: this.fieldModel.data_model.itemsConfig.displayFieldId,
            startFieldId: this.fieldModel.data_model.itemsConfig.startFieldId,
            isDurationMode: this.fieldModel.data_model.use_duration && this.fieldModel.data_model.use_duration === 1 ? true : false,
            stylesAppId: this.fieldModel.data_model.itemsStyles ? this.fieldModel.app_id : false,
            stylesFieldId: this.fieldModel.data_model.itemsStyles ? this.fieldModel.field_id : false,
            month,
            year
        }

        if (schemaOptions.isDurationMode === true) {
            schemaOptions.durationFieldId = this.fieldModel.data_model.itemsConfig.durationFieldId
        } else if (schemaOptions.isDurationMode === false) {
            schemaOptions.endFieldId = this.fieldModel.data_model.itemsConfig.endDateFieldId
        }

        return schemaGenerator(schemaOptions)
    }

    /* DISCONNECTED CALLBACK */
    // Call unsubscribe from PipeService method

    disconnectedCallback() {
        this.unsubscribeFromPipe();
        this.calendar.destroy();
    }
}

if (!window.customElements.get('full-calendar')) {
    window.customElements.define('full-calendar', Fullcalendar);
}