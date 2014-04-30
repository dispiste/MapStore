/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/**
 * @include widgets/form/ComparisonComboBox.js
 * @include data/WPSUniqueValuesReader.js
 * @include data/WPSUniqueValuesProxy.js
 * @include data/WPSUniqueValuesStore.js
 * @include widgets/form/WPSUniqueValuesCombo.js
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
    
    /**
     * Property: attributesComboConfig
     * {Object}
     */
    attributesComboConfig: null,
    
    /**
     * 
     */ 
    uniqueValuesStore : null,

    initComponent: function() {
                
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
            allowBlank: this.allowBlank,
            displayField: "name",
            valueField: "name",
            value: this.filter.property,
            listeners: {
                select: function(combo, record) {
                    this.items.get(1).enable();
                    this.filter.property = record.get("name");
                    if (this.attributes) {
                        this.loadUniqueValues(this.attributes.url, this.attributes.baseParams.TYPENAME, record.get("name"));
                    }
                    this.fireEvent("change", this.filter);
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

        this.items = this.createFilterItems();
        
        this.addEvents(
            /**
             * Event: change
             * Fires when the filter changes.
             *
             * Listener arguments:
             * filter - {OpenLayers.Filter} This filter.
             */
            "change"
        ); 

        gxp.form.FilterField.superclass.initComponent.call(this);
    },
    
    /**
     * Method: createDefaultFilter
     * May be overridden to change the default filter.
     *
     * Returns:
     * {OpenLayers.Filter} By default, returns a comarison filter.
     */
    createDefaultFilter: function() {
        return new OpenLayers.Filter.Comparison();
    },
    
    
    /**
     * Method: createFilterItems
     * Creates a panel config containing filter parts.
     */
    createFilterItems: function() {
        this.uniqueValuesStore = new gxp.data.WPSUniqueValuesStore({
                    pageSize: 10
                });
        return [
            this.attributesComboConfig, {
                xtype: "gxp_comparisoncombo",
                disabled: true,
                allowBlank: this.allowBlank,
                value: this.filter.type,
                listeners: {
                    select: function(combo, record) {
                        this.items.get(2).enable();
                        this.filter.type = record.get("value");
                        // Ilike (ignore case)
                        if(this.filter.type == "ilike"){
                            this.filter.type = OpenLayers.Filter.Comparison.LIKE;
                            this.filter.matchCase = false;
                        }else{
                            // default matches case. See OpenLayers.Filter.Comparison#matchCase
                            this.filter.matchCase = true;
                        }
                        this.fireEvent("change", this.filter);
                    },
                    scope: this
                }
            }, 
            {
                xtype: "gxp_wpsuniquevaluescb",
                mode: "remote", // required as the combo store shouldn't be loaded before a field name is selected
                store: this.uniqueValuesStore,
                disabled: true,
                value: this.filter.value,
                pageSize: 10,
                typeAhead: true,
                forceSelection: false,
                remoteSort: true,
                triggerAction: "all",
                allowBlank: this.allowBlank,
                displayField: "value",
                valueField: "value",
                listeners: {
                    select: function(combo, record) {
						this.filter.value = combo.getValue();
                        this.fireEvent("change", this.filter);
                    },
                    scope: this
                },
                width: 150,
                grow: true,
                growMin: 50,
                anchor: "100%"
            }
        ];
    },
    loadUniqueValues: function(url, layerName, fieldName) {
        if (url.indexOf('wfs?', url.length - 'wfs?'.length) !== -1) { // url ends with wfs
            var wpsUrl = url.substring(0, url.length-'wfs?'.length)+"wps";
            var params = {
                url: wpsUrl,
                inputs: {
                    layerName: layerName,
                    fieldName: fieldName
                },
                start: 0,
                limit: 10
            };
            this.uniqueValuesStore.setWPSParams(params);
            this.uniqueValuesStore.load();
        }
	}

});

Ext.reg('gxp_filterfield', gxp.form.FilterField);
