/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @include widgets/form/ComparisonComboBox.js
 * requires GeoExt/data/AttributeStore.js
 */

/** api: (define)
 *  module = gxp.form
 *  class = FilterField
 *  base_link = `Ext.form.CompositeField <http://extjs.com/deploy/dev/docs/?class=Ext.form.CompositeField>`_
 */
Ext.namespace("gxp.form");

/** api: constructor
 *  .. class:: FilterField(config)
 *   
 *      A form field representing a comparison filter.
 */
gxp.form.FilterField = Ext.extend(Ext.form.CompositeField, {
    
    /** api:config[lowerBoundaryTip]
     *  ``String`` tooltip for the lower boundary textfield (i18n)
     */
    lowerBoundaryTip: "lower boundary",
     
    /** api:config[upperBoundaryTip]
     *  ``String`` tooltip for the lower boundary textfield (i18n)
     */
    upperBoundaryTip: "upper boundary",
     
    /** api: config[caseInsensitiveMatch]
     *  ``Boolean``
     *  Should Comparison Filters for Strings do case insensitive matching?  Default is ``"false"``.
     */
    caseInsensitiveMatch: false,

    /**
     * Property: filter
     * {OpenLayers.Filter} Optional non-logical filter provided in the initial
     *     configuration.  To retreive the filter, use <getFilter> instead
     *     of accessing this property directly.
     */
    filter: null,
    
    /**
     * Property: attributes
     * {GeoExt.data.AttributeStore} A configured attributes store for use in
     *     the filter property combo.
     */
    attributes: null,

    /** api:config[comparisonComboConfig]
     *  ``Object`` Config object for comparison combobox.
     */

    /** api:config[attributesComboConfig]
     *  ``Object`` Config object for attributes combobox.
     */
    
    /**
     * Property: attributesComboConfig
     * {Object}
     */
    attributesComboConfig: null,
    
    valid: null,
    
    initComponent: function() {
        
        var me = this;
        
        this.combineErrors = false;
        
        if (!this.dateFormat) {
            this.dateFormat = Ext.form.DateField.prototype.format;
        }
        if (!this.timeFormat) {
            this.timeFormat = Ext.form.TimeField.prototype.format;
        }        
        if(!this.filter) {
            this.filter = this.createDefaultFilter();
        }
        // Maintain compatibility with QueryPanel, which relies on "remote"
        // mode and the filterBy filter applied in it's attributeStore's load
        // listener *after* the initial combo filtering.
        //TODO Assume that the AttributeStore is already loaded and always
        // create a new one without geometry fields.
        var mode = "remote", attributes = new GeoExt.data.AttributeStore();
        if (this.attributes) {
            if (this.attributes.getCount() != 0) {
                mode = "local";
                this.attributes.each(function(r) {
                    var match = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/.exec(r.get("type"));
                    match || attributes.add([r]);
                });
            } else {
                attributes = this.attributes;
            }
        }

        var defAttributesComboConfig = {
            xtype: "combo",
            store: attributes,
            editable: mode == "local",
            typeAhead: true,
            forceSelection: true,
            mode: mode,
            triggerAction: "all",
            ref: "property",
            allowBlank: this.allowBlank,
            displayField: "name",
            valueField: "name",
            value: this.filter.property,
            listeners: {
                select: function(combo, record) {

                    this.items.get(1).enable();
                    this.items.get(1).reset();
                    
                    this.filter.property = record.get("name");

                    for(var i = 2;i<this.items.length;i++){
                        this.items.items[i].reset();
                        this.items.items[i].disable();
                    }
                    
                    this.filter.value = null;
                    this.filter.upperBoundary = null;
                    this.filter.lowerBoundary = null;
                    
                    //Add VTYPE validation according to validators config
                    var feature = this.attributes.baseParams.TYPENAME.split(":")[1];
                    var fieldName = this.filter.property;
                    
                    for (var key in this.validators){
                    
                        if(this.validators.hasOwnProperty(feature)){
                        
                            for (var key in this.validators[feature]){
                            
                                if(this.validators[feature].hasOwnProperty(fieldName)){
                                
                                    var itemsTextValue = this.items.items[2].getId();
                                    var itemsTextLowerBoundary = this.items.items[7].getId();
                                    var itemsTextUpperBoundary = this.items.items[12].getId();
                                    
                                    var itemsTextValueCmp = Ext.getCmp(itemsTextValue);
                                    var itemsTextLowerBoundaryCmp = Ext.getCmp(itemsTextLowerBoundary);
                                    var itemsTextUpperBoundaryCmp = Ext.getCmp(itemsTextUpperBoundary);
                                    
                                    var text = this.validators[feature][fieldName].invalidText;
                                    var type = this.validators[feature][fieldName].type;
                                    var value = this.validators[feature][fieldName].value;
                                    
                                    var customValidationTextValueTest = new RegExp(value);
                                    var customValidationTextLowerBoundaryTest = new RegExp(value);
                                    var customValidationTextUpperBundaryTest = new RegExp(value);
                                    
                                    Ext.apply(Ext.form.VTypes, {                                    
                                        customValidationTextValue: function(v, field) {                                        
                                            var itemsTextValue = field.getId();
                                            var itemsTextValueCmp = Ext.getCmp(itemsTextValue);
                                            return itemsTextValueCmp.validationTest.test(v);
                                        },
                                        customValidationTextValueText: itemsTextValueCmp.validationText
                                   });

                                    Ext.apply(itemsTextValueCmp,{vtype: "customValidationTextValue", validationTest: customValidationTextValueTest, validationText: text});
                                    Ext.apply(itemsTextLowerBoundaryCmp,{vtype: "customValidationTextValue", validationTest: customValidationTextValueTest, validationText: text});
                                    Ext.apply(itemsTextUpperBoundaryCmp,{vtype: "customValidationTextValue", validationTest: customValidationTextValueTest, validationText: text});
                                    
                                }else{
                                
                                    Ext.apply(itemsTextValueCmp,{vtype: null});
                                    Ext.apply(itemsTextLowerBoundaryCmp,{vtype: null});
                                    Ext.apply(itemsTextUpperBoundaryCmp,{vtype: null});
                                    
                                }
                                
                            }
                            
                        }
                        
                    }
                    
                    //get type from record to update xtype    
                    var type = record.get("type");
                    this.fieldType = type.split(":").pop();    
                    
                    this.setFilterType(type,this.fieldType);
        
                    this.doLayout();
                    this.fireEvent("change", this.filter, this);
                },
                // workaround for select event not being fired when tab is hit
                // after field was autocompleted with forceSelection
                "blur": function(combo) {
                    var index = combo.store.findExact("name", combo.getValue());
                    if (index != -1) {
                        combo.fireEvent("select", combo, combo.store.getAt(index));
                    } else if (combo.startValue != null) {
                        combo.setValue(combo.startValue);
                    }
                },
                scope: this
            },
            width: 120
        };
        this.attributesComboConfig = this.attributesComboConfig || {};
        Ext.applyIf(this.attributesComboConfig, defAttributesComboConfig);

        this.items = this.createFilterItems("xsd:string");
        
        this.addEvents(
            /**
             * Event: change
             * Fires when the filter changes.
             *
             * Listener arguments:
             * filter - {OpenLayers.Filter} This filter.
             * this - {gxp.form.FilterField} (TODO change sequence of event parameters)
             */
            "change"
        ); 

        gxp.form.FilterField.superclass.initComponent.call(this);
    },

    /**
     * Method: validateValue
     * Performs validation checks on the filter field.
     *
     * Returns:
     * {Boolean} True if value is valid. 
     */
    validateValue: function(value, preventMark) {
        if (this.filter.type === OpenLayers.Filter.Comparison.BETWEEN) {
            return (this.filter.property !== null && this.filter.upperBoundary !== null &&
                this.filter.lowerBoundary !== null);
        } else {
            return (this.filter.property !== null &&
                this.filter.value !== null && this.filter.type !== null);
        }
    },
    
    /**
     * Method: createDefaultFilter
     * May be overridden to change the default filter.
     *
     * Returns:
     * {OpenLayers.Filter} By default, returns a comparison filter.
     */
    createDefaultFilter: function() {
        return new OpenLayers.Filter.Comparison({matchCase: !this.caseInsensitiveMatch});
    },
    
    /**
     * Method: createFilterItems
     * Creates a panel config containing filter parts.
     */
    createFilterItems: function(type) {
        var me = this;
        
        //controllare il tipo booleano, con l'operatore LIKE e ILIKE da errore
        var types = {
            "xsd:boolean": "boolean",
            "xsd:int": "int",
            "xsd:integer": "int",
            "xsd:short": "int",
            "xsd:long": "int",
            "xsd:date": "date",
            "xsd:string": "string",
            "xsd:float": "float",
            "xsd:double": "float"
        };     
        
        this.fieldType = type.split(":").pop();    
    
        var isBetween = this.filter.type === OpenLayers.Filter.Comparison.BETWEEN;

        var defaultItemsProp = {
            validateOnBlur: false,
            disabled: this.filter.type == null,
            hidden: true,
            ref: "value",
            value: this.filter.value,
            width: 50,
            grow: true,
            growMin: 50,
            anchor: "100%",
            allowBlank: this.allowBlank,
            listeners: {
                "change": function(field, value) {
                    this.filter.value = value;
                    this.fireEvent("change", this.filter, this);
                },
                scope: this
            }   
        };
        
        var lowerBoundaryDefaultItemsProp = {
            disabled: this.filter.type == null,
            hidden: !isBetween,
            value: this.filter.lowerBoundary,
            //tooltip: this.lowerBoundaryTip,
            grow: true,
            growMin: 30,
            ref: "lowerBoundary",
            anchor: "100%",
            allowBlank: this.allowBlank,
            listeners: {
                "change": function(field, value) {
                    this.filter.lowerBoundary = value;
                    this.fireEvent("change", this.filter, this);
                },
                "autosize": function(field, width) {
                    field.setWidth(width);
                    field.ownerCt.doLayout();
                },
                scope: this
            }
        };
        
        var upperBoundaryDefaultItemsProp = {
            disabled: this.filter.type == null,
            hidden: !isBetween,
            grow: true,
            growMin: 30,
            ref: "upperBoundary",
            value: this.filter.upperBoundary,
            allowBlank: this.allowBlank,
            listeners: {
                "change": function(field, value) {
                    this.filter.upperBoundary = value;
                    this.fireEvent("change", this.filter, this);
                },
                scope: this
            }
        };
                
        var itemsTextFieldDefault = Ext.applyIf({
            xtype: "textfield"
        },defaultItemsProp);
            
        var itemsNumberDoubleFieldDefault = Ext.applyIf({
            xtype: "numberfield",
            allowDecimals:true,
            decimalPrecision: 10
        },defaultItemsProp);
        
        var itemsNumberIntFieldDefault = Ext.applyIf({
            xtype: "numberfield",
            allowDecimals:false
        },defaultItemsProp);        

        var itemsDateFieldDefault = Ext.applyIf({
            xtype: "datefield",
            width: 70,
            allowBlank: false,
            format: this.dateFormat
        },defaultItemsProp);
        
        var itemsDateTimeFieldDefault = Ext.applyIf({
            xtype: "datefield",
            width: 70,
            allowBlank: false,
            format: 'c'
        },defaultItemsProp);        
            
        var itemsTextFieldLowerBoundary = Ext.apply({
                    xtype: "textfield"
                },lowerBoundaryDefaultItemsProp);

        var itemsTextFieldUpperBoundary = Ext.apply({
                    xtype: "textfield"
                },upperBoundaryDefaultItemsProp);

        var itemsNumberDoubleFieldLowerBoundary = Ext.apply({
                    xtype: "numberfield",
                    allowDecimals:true,
                    decimalPrecision: 10
                },lowerBoundaryDefaultItemsProp);

        var itemsNumberDoubleFieldUpperBoundary = Ext.apply({
                    xtype: "numberfield",
                    allowDecimals:true,
                    decimalPrecision: 10
                },upperBoundaryDefaultItemsProp);
                
        var itemsNumberIntFieldLowerBoundary = Ext.apply({
                    xtype: "numberfield",
                    allowDecimals:false
                },lowerBoundaryDefaultItemsProp);

        var itemsNumberIntFieldUpperBoundary = Ext.apply({
                    xtype: "numberfield",
                    allowDecimals:false
                },upperBoundaryDefaultItemsProp);                

        var itemsDateFieldLowerBoundary = Ext.apply({
                    xtype: "datefield",
                    width: 70,
                    allowBlank: false,
                    format: this.dateFormat
                },lowerBoundaryDefaultItemsProp);

        var itemsDateFieldUpperBoundary = Ext.apply({
                    xtype: "datefield",
                    width: 70,
                    allowBlank: false,
                    format: this.dateFormat
                },upperBoundaryDefaultItemsProp);
                
        var itemsDateTimeFieldLowerBoundary = Ext.apply({
                    xtype: "datefield",
                    width: 70,
                    allowBlank: false,
                    format: 'c'
                },lowerBoundaryDefaultItemsProp);

        var itemsDateTimeFieldUpperBoundary = Ext.apply({
                    xtype: "datefield",
                    width: 70,
                    allowBlank: false,
                    format: 'c'
                },upperBoundaryDefaultItemsProp);
                
        return [
            this.attributesComboConfig, Ext.applyIf({
                xtype: "gxp_comparisoncombo",
                ref: "type",
                disabled: this.filter.property == null,
                allowBlank: this.allowBlank,
                value: this.filter.type,
                listeners: {
                    select: function(combo, record) {
                        for(var i = 2;i<this.items.items.length;i++){
                            this.items.get(i).enable();
                        }                     
                        
                        this.setFilterType(record.get("value"),this.fieldType);
                        this.fireEvent("change", this.filter, this);
                    },
                    expand: function(combo) {
                        var store = combo.getStore();
                        store.clearFilter();
                        if(this.fieldType === "date" || this.fieldType === "dateTime" || this.fieldType === "time" || this.fieldType === "int" || this.fieldType === "double" || this.fieldType === "decimal" || this.fieldType === "integer" || this.fieldType === "long" || this.fieldType === "float" || this.fieldType === "short"){
                            store.filter([
                              {
                                fn   : function(record) {
                                    return (record.get('name') === "=") || (record.get('name') === "<>") || (record.get('name') === "<") || (record.get('name') === ">") || (record.get('name') === "<=") || (record.get('name') === ">=") || (record.get('name') === "between");
                                },
                                scope: this
                              }                      
                            ]);
                        }
                    },
                    scope: this
                }
            }, this.comparisonComboConfig),
            
                itemsTextFieldDefault, //(2)
                itemsDateFieldDefault, //(3)
                itemsDateTimeFieldDefault, //(4)
                //itemsBooleanFieldDefault, //()
                itemsNumberDoubleFieldDefault, //(5)
                itemsNumberIntFieldDefault, //(6)
                
                itemsTextFieldLowerBoundary, //(7)
                itemsDateFieldLowerBoundary, //(8)
                itemsDateTimeFieldLowerBoundary, //(9)                
                itemsNumberDoubleFieldLowerBoundary, //(10)
                itemsNumberIntFieldLowerBoundary, //(11)
                
                itemsTextFieldUpperBoundary, //(12)
                itemsDateFieldUpperBoundary, //(13)                
                itemsDateTimeFieldUpperBoundary, //(14)
                itemsNumberDoubleFieldUpperBoundary, //(15)
                itemsNumberIntFieldUpperBoundary //(16)
        ];
    },
    
    setFilterType: function(type,fieldType) {
        this.filter.type = type;
        
        // Ilike (ignore case)
        if(this.filter.type == "ilike"){
            this.filter.type = OpenLayers.Filter.Comparison.LIKE;
            this.filter.matchCase = false;
        }else{
            // default matches case. See OpenLayers.Filter.Comparison#matchCase
            this.filter.matchCase = true;
        }

        if (type === OpenLayers.Filter.Comparison.BETWEEN) {
            
            if(this.fieldType === "string"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==7 ||x==12){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }              
            }else if(this.fieldType === "date"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==8 ||x==13){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }             
            }else if(this.fieldType === "dateTime"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==9 ||x==14){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }             
            }else if(this.fieldType === "double" || this.fieldType === "decimal" || this.fieldType === "float"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==10 ||x==15){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }             
            }else if(this.fieldType === "int" || this.fieldType === "integer" || this.fieldType === "long" || this.fieldType === "short"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==11 ||x==16){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }             
            }else{
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==7 ||x==12){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }             
            }            
            
        } else {

            if(this.fieldType === "string"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==2){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }             
            }else if(this.fieldType === "date"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==3){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }                
            }else if(this.fieldType === "dateTime"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==4){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }                
            }else if(this.fieldType === "double" || this.fieldType === "decimal" || this.fieldType === "float"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==5){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }                
            }else if(this.fieldType === "int" || this.fieldType === "integer" || this.fieldType === "long" || this.fieldType === "short"){
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==6){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }                
            }else{
                for(var x = 2;x<this.items.items.length;x++){
                    if(x==2){
                        this.items.get(x).show();
                    }else{
                        this.items.get(x).hide();
                    }
                }                
            }          
 
        }
        this.doLayout();
    },

    /** api: method[setFilter]
     *  :arg filter: ``OpenLayers.Filter``` Change the filter object to be
     *  used.
     */
    setFilter: function(filter) {
        var previousType = this.filter.type;
        this.filter = filter;
        if (previousType !== filter.type) {
            this.setFilterType(filter.type);
        }
        this['property'].setValue(filter.property);
        this['type'].setValue(filter.type);
        if (filter.type === OpenLayers.Filter.Comparison.BETWEEN) {
            this['lowerBoundary'].setValue(filter.lowerBoundary);
            this['upperBoundary'].setValue(filter.upperBoundary);
        } else {
            this['value'].setValue(filter.value);
        }
        this.fireEvent("change", this.filter, this);
    }

});

Ext.reg('gxp_filterfield', gxp.form.FilterField);
