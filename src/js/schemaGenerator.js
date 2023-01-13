/********************* SCHEMA GENERATOR *********************/
// We need this generator, to create schema based on settings, for events data fetching in right format for fullcalendar.

export function schemaGenerator(options) {

    function startFunction(item, app, startFieldId) {
        let startField = item.fields.find(field => field.field_id == startFieldId);
        if(startField) {
            return new Date(+startField.field_value);
        } else {
            return null;
        }
    }

    function endFunction(item, app, isDurationMode, startFieldId, endFieldId, durationFieldId) {
        if(isDurationMode) {
            let durationField = item.fields.find(field => field.field_id == durationFieldId);
            let startField = item.fields.find(field => field.field_id == startFieldId);
            if(durationField && startField) {
                return new Date(+startField.field_value + +durationField.field_value);
            } else {
                return null;
            }
        } else {
            let endField = item.fields.find(field => field.field_id == endFieldId);
            if(endField) {
                return new Date(+endField.field_value);
            } else {
                return null;
            }
        }
    }

    async function styleTextFunction (item, app, stylesAppId, stylesFieldId) {
        let stylesFieldModel = await gudhub.getField(stylesAppId, stylesFieldId);

        let textColor;

        stylesFieldModel.data_model.itemsStyles.forEach(style => {
            let filtered = gudhub.filter([item], style.filters_list);
            if(filtered.length > 0) {
                textColor = style.color;
            }
        });
        return textColor;
    }

    async function styleBackgroundFunction (item, app, stylesAppId, stylesFieldId) {
        let stylesFieldModel = await gudhub.getField(stylesAppId, stylesFieldId);

        let backgroundColor;

        stylesFieldModel.data_model.itemsStyles.forEach(style => {
            let filtered = gudhub.filter([item], style.filters_list);
            if(filtered.length > 0) {
                backgroundColor = style['background-color'];
            }
        });
        return backgroundColor;
    }

    const startMonth = Number(options.month) < 10 ? `0${options.month}` : `${options.month}`;
    const endMonth = Number(options.month) < 9 ? `0${options.month + 1}` : Number(options.month) !== 12 ? `${options.month + 1}` : '01';

    const startFilterDate = new Date(`${options.year}-${startMonth}-01`).getTime();
    const endFilterDate = new Date(`${Number(options.month) != 12 ? options.year : options.year + 1}-${endMonth}-01`).getTime() - 1;

    return {
        type: "array",
        id: 1,
        childs: [
            {
                type: "property",
                id: 7,
                property_name: "id",
                property_type: "variable",
                variable_type: "current_item"
            },
            {
                type: "property",
                id: 3,
                property_name: "title",
                property_type: "field_value",
                field_id: options.titleFieldId,
                interpretation: 1
            },
            {
                type: "property",
                id: 4,
                property_name: "start",
                property_type: "function",
                args: [options.startFieldId],
                function: startFunction
            },
            {
                type: "property",
                id: 5,
                property_name: "end",
                property_type: "function",
                args: [options.isDurationMode, options.startFieldId, options.endFieldId, options.durationFieldId],
                function: endFunction
            },
            {
                type: "property",
                id: 8,
                property_name: "textColor",
                property_type: "function",
                args: [options.stylesAppId, options.stylesFieldId],
                function: styleTextFunction
            },
            {
                type: "property",
                id: 10,
                property_name: "backgroundColor",
                property_type: "function",
                args: [options.stylesAppId, options.stylesFieldId],
                function: styleBackgroundFunction
            }
        ],
        property_name: "items",
        app_id: options.sourceAppId,
        filter: [
            {
                field_id: options.startFieldId,
                data_type: "date",
                valuesArray: `${startFilterDate}:${endFilterDate}`,
                search_type: "range",
                selected_search_option_variable: "Value"
            },
            ...options.filters
        ]
    }
}