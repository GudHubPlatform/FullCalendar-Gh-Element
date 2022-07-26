import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { schemaGenerator } from './schemaGenerator.js';

import './../scss/style.scss';

import '@fullcalendar/common/main.min.css';
import '@fullcalendar/daygrid/main.min.css';

/********************* FULLCALENDAR WEB COMPONENT CREATING *********************/

class Fullcalendar extends HTMLElement {
    constructor() {
        super();
        this.calendar;
        this.appId;
        this.fieldId;
        this.fieldModel;
        this.isDurationMode;
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
        this.innerHTML = /* HTML */`<div class="calendar" style="width: 100%"></div>`;

        const calendarElement = this.querySelector('.calendar');

        const data = await this.getData();

        this.calendar = new Calendar(calendarElement, {
            plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
            initialView: this.fieldModel.data_model.initialView ? this.fieldModel.data_model.initialView : 'dayGridMonth',
            editable: true,
            allDay: true,
            eventResizableFromStart: true,
            events: data,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
                    window.location.pathname = `/act/open_item/${info.event.id.split('.')[0]}/${this.fieldModel.data_model.view_id}/${info.event.id.split('.')[1]}`
                }
            }
        });

        /* TODO: */
        // Need to find a way to fix this awful timeout
        // Without timeout calendar renders super small

        setTimeout(() => {
            this.calendar.render();
        }, 500);

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

    async getData() {
        const schema = this.generateSchema();

        const response = await gudhub.jsonConstructor(schema);

        return response.items;
    }

    /********************* GENERATE SCHEMA *********************/
    // Here we call the data schema generator with right options.
    // We need this schema to get data in right format for fullcalendar.

    generateSchema() {
        const schemaOptions = {
            sourceAppId: this.fieldModel.data_model.source_app_id,
            titleFieldId: this.fieldModel.data_model.itemsConfig.displayFieldId,
            startFieldId: this.fieldModel.data_model.itemsConfig.startFieldId,
            isDurationMode: this.fieldModel.data_model.use_duration && this.fieldModel.data_model.use_duration === 1 ? true : false,
            stylesAppId: this.fieldModel.data_model.itemsStyles ? this.fieldModel.app_id : false,
            stylesFieldId: this.fieldModel.data_model.itemsStyles ? this.fieldModel.field_id : false
        }

        if (schemaOptions.isDurationMode === true) {
            schemaOptions.durationFieldId = this.fieldModel.data_model.itemsConfig.durationFieldId
        } else if (schemaOptions.isDurationMode === false) {
            schemaOptions.endFieldId = this.fieldModel.data_model.itemsConfig.endDateFieldId
        }

        return schemaGenerator(schemaOptions)
    }
}

if (!window.customElements.get('full-calendar')) {
    window.customElements.define('full-calendar', Fullcalendar);
}