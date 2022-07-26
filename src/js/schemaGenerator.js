/********************* SCHEMA GENERATOR *********************/
// We need this generator, to create schema based on settings, for events data fetching in right format for fullcalendar.

export function schemaGenerator(options) {

    function startFunction(item, app, startFieldId) {
        let start = item.fields.find(field => field.field_id == startFieldId).field_value;
        return new Date(+start);
    }

    function endFunction(item, app, isDurationMode, startFieldId, endFieldId, durationFieldId) {
        if(isDurationMode) {
            let duration = item.fields.find(field => field.field_id == durationFieldId).field_value;
            let start = item.fields.find(field => field.field_id == startFieldId).field_value;
            return new Date(+start + +duration);
        } else {
            let end = item.fields.find(field => field.field_id == endFieldId).field_value;
            return new Date(+end);
        }
    }

    async function styleTextFunction (item, app, stylesAppId, stylesFieldId) {
        let stylesFieldModel = await gudhub.getField(stylesAppId, stylesFieldId);

        let textColor;

        stylesFieldModel.data_model.itemsStyles.forEach(style => {
            let filtered = gudhub.filter([item], style.filters_list);
            if(filtered.length > 0) {
                textColor = style.textColor;
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
                backgroundColor = style.backgroundColor;
            }
        });
        return backgroundColor;
    }

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
                field_id: options.titleFieldId
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
        filter: []
    }
}