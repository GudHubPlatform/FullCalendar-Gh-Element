import './js/calendar.webcomponent.js';

/* DATA TYPE EXPORT */

export default class FullcalendarData {
    getTemplate() {
        return {
            constructor: 'action',
            name: 'Calendar',
            icon: 'calendar',
            type: 'calendar',
            model: {
                field_id: 0,
                field_name: 'Calendar',
                data_type: 'calendar',
                data_model: {
                    use_duration: false,
                    use_custom_range: false,
                    ranges: {
                        min: '',
                        max: ''
                    },
                    view_id: "",
                    table_settings: {
                        action: ""
                    },
                    filters_list: [],
                    source_app_id: "",
                    itemsStyles: [],
                    itemsConfig: {
                        displayFieldId: "",
                        startFieldId: "",
                        endDateFieldId: "",
                        durationFieldId: ""
                    },
                    interpretation: [{
                        src: 'form',
                        id: 'default',
                        settings: {
                            editable: 1,
                            show_field_name: 1,
                            show_field: 1
                        }
                    }, {
                        src: 'table',
                        id: 'icon',
                        settings: {
                            editable: 0,
                            show_field_name: 0,
                            show_field: 1
                        }
                    }]
                }
            }
        };
    }

    /*------------------------------- ACTION INTERPRETATION --------------------------------------*/

    getInterpretation(gudhub, value, appId, itemId, field_model) {

        return [
            {
                id: 'default',
                name: 'Default',
                content: () =>
                    '<full-calendar calendar-type="default" app-id="{{ appId }}" field-id="{{ fieldId }}" item-id="{{ itemId }}"></full-calendar>'
            },
            {
                id: 'classic',
                name: 'Classic',
                content: () =>
                    '<full-calendar calendar-type="dayGrid" app-id="{{ appId }}" field-id="{{ fieldId }}" item-id="{{ itemId }}"></full-calendar>'
            },
            {
                id: 'time',
                name: 'Time',
                content: () =>
                    '<full-calendar calendar-type="timeGrid" app-id="{{ appId }}" field-id="{{ fieldId }}" item-id="{{ itemId }}"></full-calendar>'
            },
            {
                id: 'list',
                name: 'List',
                content: () =>
                    '<full-calendar calendar-type="list" app-id="{{ appId }}" field-id="{{ fieldId }}" item-id="{{ itemId }}"></full-calendar>'
            },
            {
                id: 'icon',
                name: 'Icon',
                content: () =>
                    '<span gh-icon="date 0fb5ff 45px none"></span>'
            }
        ];
    }

    /*--------------------------  ACTION SETTINGS --------------------------------*/
    getSettings(scope) {
        return [
            {
                title: 'Options',
                type: 'general_setting',
                icon: 'menu',
                columns_list: [
                    [],
                    [
                        {
                            title: 'Main Settings',
                            type: 'header'
                        }, {
                            type: 'ghElement',
                            property: 'data_model.source_app_id',
                            data_model: function (fieldModel) {
                                return {
                                    field_name: 'Source App',
                                    name_space: 'source_app',
                                    data_type: 'app',
                                    data_model: {
                                        // app_id: scope.appId,
                                        current_app: false,
                                        interpretation: [{
                                            src: 'form',
                                            id: 'with_text',
                                            settings: {
                                                editable: 1,
                                                show_field_name: 1,
                                                show_field: 1
                                            }
                                        }]
                                    }
                                };
                            }
                        }, {
                            type: 'ghElement',
                            property: 'data_model.initialView',
                            data_model: function () {
                                return {
                                    data_model: {
                                        options: [
                                            {
                                                name: 'Day',
                                                value: 'Day'
                                            },
                                            {
                                                name: 'Week',
                                                value: 'Week'
                                            },
                                            {
                                                name: 'Month',
                                                value: 'Month'
                                            }
                                        ]
                                    },
                                    field_name: 'Initial view',
                                    name_space: 'initial_view',
                                    data_type: 'text_opt'
                                }
                            }
                        }, {
                            type: 'ghElement',
                            property: 'data_model.table_settings.action',
                            data_model: function () {
                                return {
                                    data_model: {
                                        options: [
                                            {
                                                name: 'Open item',
                                                value: 'open_item'
                                            }, {
                                                name: 'None',
                                                value: ''
                                            }
                                        ]
                                    },
                                    field_name: 'Item action',
                                    name_space: 'item_action',
                                    data_type: 'text_opt'
                                };
                            }
                        }, {
                            type: 'ghElement',
                            property: 'data_model.itemsConfig.displayFieldId',
                            onInit: function (settingScope) {
                                settingScope.$watch('fieldModel.data_model.source_app_id', function (newVal, oldVal) {
                                    settingScope.field_model.data_model.app_id = settingScope.fieldModel.data_model.source_app_id;
                                    if (!newVal) {
                                        settingScope.fieldModel.data_model.itemsConfig = {};
                                        settingScope.fieldModel.data_model.itemsStyles = [];
                                        settingScope.fieldModel.data_model.groups = [];
                                        settingScope.fieldModel.data_model.itselfFilterFieldId = null;
                                    }
                                });
                            },
                            data_model: function (fieldModel) {
                                return {
                                    data_model: {
                                        app_id: fieldModel.data_model.source_app_id
                                    },
                                    field_name: 'Event name',
                                    name_space: 'event_name',
                                    data_type: 'field'
                                };
                            }
                        }, {
                            type: 'ghElement',
                            property: 'data_model.itemsConfig.startFieldId',
                            onInit: function (settingScope) {
                                settingScope.$watch('fieldModel.data_model.source_app_id', function () {
                                    settingScope.field_model.data_model.app_id = settingScope.fieldModel.data_model.source_app_id;
                                });
                            },
                            data_model: function (fieldModel) {
                                return {
                                    data_model: {
                                        app_id: fieldModel.data_model.source_app_id
                                    },
                                    field_name: 'Start field',
                                    name_space: 'start_field',
                                    data_type: 'field'
                                };
                            }
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.use_duration',
                            data_model: function () {
                                return {
                                    field_name: 'Use Duration',
                                    name_space: 'use_duration',
                                    data_type: 'boolean'
                                };
                            }
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.itemsConfig.endDateFieldId',
                            showIf: '!data_model.use_duration',
                            onInit: function (settingScope) {
                                settingScope.$watch('fieldModel.data_model.source_app_id', function () {
                                    settingScope.field_model.data_model.app_id = settingScope.fieldModel.data_model.source_app_id;
                                });
                            },
                            data_model: function (fieldModel) {
                                return {
                                    data_model: {
                                        app_id: fieldModel.data_model.source_app_id
                                    },
                                    field_name: 'End Date',
                                    name_space: 'end_date',
                                    data_type: 'field'
                                };
                            }
                        }, {
                            type: 'ghElement',
                            property: 'data_model.itemsConfig.durationFieldId',
                            showIf: 'data_model.use_duration',
                            onInit: function (settingScope) {
                                settingScope.$watch('fieldModel.data_model.source_app_id', function () {
                                    settingScope.field_model.data_model.app_id = settingScope.fieldModel.data_model.source_app_id;
                                });
                            },
                            data_model: function (fieldModel) {
                                return {
                                    data_model: {
                                        app_id: fieldModel.data_model.source_app_id
                                    },
                                    field_name: 'Duration',
                                    name_space: 'duration',
                                    data_type: 'field'
                                };
                            }
                        },{
                            type: 'ghElement',
                            property: 'data_model.use_custom_range',
                            data_model: function () {
                                return {
                                    field_name: 'Custom Range',
                                    name_space: 'custom_range',
                                    data_type: 'boolean'
                                };
                            }
                        },
                        {
                            type: "ghElement",
                            showIf: 'data_model.use_custom_range',
                            property: "data_model.ranges.min",
                            data_model: function () {
                              return {
                                field_name: "Min Time (0-24)",
                                name_space: "min",
                                data_type: "number",
                              };
                            },
                        },
                        {
                            type: "ghElement",
                            showIf: 'data_model.use_custom_range',
                            property: "data_model.ranges.max",
                            data_model: function () {
                              return {
                                field_name: "Max Time (0-24)",
                                name_space: "max",
                                data_type: "number",
                              };
                            },
                        },
                        {
                            title: 'Time Format',
                            showIf: 'data_model.use_custom_range',
                            type: 'header'
                        },
                        {
                            type: 'ghElement',
                            showIf: 'data_model.use_custom_range',
                            property: 'data_model.hour_format',
                            data_model: function () {
                                return {
                                    data_model: {
                                        interpretation: [{
                                            src: 'form',
                                            settings: {
                                                show_field_name: 0
                                            }
                                        }],
                                        options: [{
                                            name: 'PM/AM',
                                            icon: '12_AM',
                                            color: '#d1d8dd',
                                            value: 'en-US'
                                        }, {
                                            name: '24 hours',
                                            icon: '24_00',
                                            color: '#d1d8dd',
                                            value: 'en-GB'
                                        }],
                                        show_field_name: false
                                    },
                                    data_type: 'radio_icon'
                                };
                            }
                        },
                        
                        {
                            title: 'View template',
                            type: 'header'
                        },
                        //------------------------------------
                        {
                            type: 'ghElement',
                            property: 'data_model.view_id',
                            onInit: function (settingScope) {
                                scope.$watch(function () {
                                    return scope.fieldModel.data_model.source_app_id;
                                }, function (newValue) {
                                    settingScope.field_model.data_model.app_id = newValue;
                                });
                            },
                            data_model: function (fieldModel) {
                                return {
                                    data_model: {
                                        app_id: fieldModel.data_model.source_app_id
                                    },
                                    field_name: 'View name',
                                    name_space: 'view_name',
                                    data_type: 'view_list'
                                };
                            }
                        },
                        {
                            title: 'Table Filter',
                            type: 'header'
                          },{
                            type: 'html',
            
                            onInit: function (settingScope) {
            
                              scope.$watch(function () {
                                return scope.fieldModel.data_model.source_app_id;
                              }, function(newValue) {
                                settingScope.field_model.recipient.source_app_id = newValue;
                              });
            
                            },
                            data_model: function (fieldModel) {
                              return {
                                recipient:{
                                  app_id: fieldModel.data_model.source_app_id
                                }
                              };
                            },
                            control:
                              '<gh-filter gh-filter-data-model="field_model" filter-list="fieldModel.data_model.filters_list" gh-mode="variable"></gh-filter>'
                          }
                    ], [
                        {
                          title: 'Items Styles Settings',
                          type: 'header'
                        },{
                          type: 'html',
                          data_model: function (fieldModel) {
                            return {
                              patterns: [{
                                property: 'color',
                                prop_name: 'Text color',
                                type: 'color',
                                display: true,
                                data_model:function(option){}
                              }, {
                                property: 'background-color',
                                prop_name: 'Background color',
                                type: 'color',
                                display: true,
                                data_model:function(option){}
                              }, {
                                  property: 'filters_list',
                                  prop_name: 'Conditions',
                                  type: 'filter_table',
                                  display: true,
                                  data_model:function(option, scope) {
                                    scope.appId = fieldModel.data_model.source_app_id;
            
                                    option.filters_list ? scope.filters_list = option.filters_list : scope.filters_list = option.filters_list = [];
            
                                  },
                                }
                              ]
                            };
                          },
                          control:
                            '<gh-option-table items="fieldModel.data_model.itemsStyles" pattern="field_model.patterns"></gh-option-table>'
                        }
                      ]
                ]
            }
        ];
    }
}