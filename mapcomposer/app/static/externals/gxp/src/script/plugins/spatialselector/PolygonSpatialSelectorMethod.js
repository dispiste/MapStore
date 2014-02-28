/**
 *  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @include plugins/spatialselector/SpatialSelectorMethod.js
 */
 
/**
 * @author Alejandro Diaz
 */

/** api: (define)
 *  module = gxp.plugins.spatialselector
 *  class = PolygonSpatialSelectorMethod
 */

/** api: (extends)
 *  plugins/spatialselector/SpatialSelectorMethod.js
 */
Ext.namespace('gxp.plugins.spatialselector');

/** api: constructor
 *  .. class:: PolygonSpatialSelectorMethod(config)
 *
 *    Plugin for spatial selection based on simple polygon
 */
gxp.plugins.spatialselector.PolygonSpatialSelectorMethod = Ext.extend(gxp.plugins.spatialselector.SpatialSelectorMethod, {

	/* ptype = gxp_spatial_polygon_selector */
	ptype : 'gxp_spatial_polygon_selector',

	/** api: config[name]
	 *  ``String``
	 *  Name to show on the combo box of the spatial selected.
	 */
	name  : 'Polygon',

	/** api: config[label]
	 *  ``String``
	 *  Label to show on the combo box of the spatial selected.
	 */
	label : 'Polygon',

	// trigger action when activate the plugin
	activate: function(){
		gxp.plugins.spatialselector.PolygonSpatialSelectorMethod.superclass.activate.call(this);

		/**
		 * Create Polygon Selector
		 */
        this.drawings = new OpenLayers.Layer.Vector({},
			{
				displayInLayerSwitcher:false,
				styleMap : new OpenLayers.StyleMap({
					"default" : this.defaultStyle,
					"select" : this.selectStyle,
					"temporary" : this.temporaryStyle
				})
			}
		);

        this.drawings.events.on({
            "featureadded": function(event) {
				this.setCurrentGeometry(event.feature.geometry);
            },                                
            "beforefeatureadded": function(event) {
                this.drawings.destroyFeatures();
            },
            scope:this
        });                                 
    
    	this.target.mapPanel.map.addLayer(this.drawings);
        
        this.draw = this.getDrawControl();
        
		// disable pan while drawing
		// TODO: make it configurable
		this.draw.handler.stopDown = true;
		this.draw.handler.stopUp = true;

        this.target.mapPanel.map.addControl(this.draw);
        this.draw.activate();
	},

	// obtain draw control
	getDrawControl: function(){
		return new OpenLayers.Control.DrawFeature(
            this.drawings,
            OpenLayers.Handler.Polygon
        );
	},

	// trigger action when deactivate the plugin
	deactivate: function(){
		gxp.plugins.spatialselector.PolygonSpatialSelectorMethod.superclass.deactivate.call(this);
		if(this.draw){
			this.draw.deactivate();	
		}
		if (this.drawings) {
			this.target.mapPanel.map.removeLayer(this.drawings);
			this.drawings = null;
		}
	},

    // Reset method
    reset: function(){
		gxp.plugins.spatialselector.PolygonSpatialSelectorMethod.superclass.reset.call(this);
		if(this.drawings){
			this.drawings.removeAllFeatures();
		}
    }
});

Ext.preg(gxp.plugins.spatialselector.PolygonSpatialSelectorMethod.prototype.ptype, gxp.plugins.spatialselector.PolygonSpatialSelectorMethod);