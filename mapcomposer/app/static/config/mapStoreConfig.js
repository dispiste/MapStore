{
   "geoStoreBase": "http://84.33.199.62/geostore-gliders/rest/",
   "proxy":"/http_proxy/proxy/?url=",
   "defaultLanguage": "en",
   "gsSources":{ 
		"mapquest": {
			"ptype": "gxp_mapquestsource"
		}, 
		"osm": { 
			"ptype": "gxp_osmsource"
		},
		"google": {
			"ptype": "gxp_googlesource" 
		},
		"bing": {
			"ptype": "gxp_bingsource" 
		}, 
		"ol": { 
			"ptype": "gxp_olsource" 
		}
	},
	"map": {
		"projection": "EPSG:900913",
		"units": "m",
		"center": [1250000.000000, 5370000.000000],
		"zoom":5,
		"maxExtent": [
			-20037508.34, -20037508.34,
			20037508.34, 20037508.34
		],
		"layers": [
			{
				"source": "bing",
				"title": "Bing Aerial",
				"name": "Aerial",
				"group": "background"
			}, {
				"source": "osm",
				"title": "Open Street Map",
				"name": "mapnik",
				"group": "background"
			},{
				"source": "mapquest",
				"title": "MapQuest OpenStreetMap",
				"name": "osm",
				"group": "background"
			},{
				"source": "google",
				"title": "Google Roadmap",
				"name": "ROADMAP",
				"group": "background"
			},{
				"source": "google",
				"title": "Google Terrain",
				"name": "TERRAIN",
				"group": "background"
			},{
				"source": "google",
				"title": "Google Hybrid",
				"name": "HYBRID",
				"group": "background"
			}
		]
	},
    "customPanels":[
        {
            "xtype": "panel",
            "title": "Metadata Explorer",
            "iconCls": "csw-viewer",             
            "border": false,
            "id": "south",
            "region": "south",
            "layout": "fit",
            "split":true,
            "height": 330,
            "collapsed": true,
            "collapsible": true,
            "ctCls": "south-panel",
            "header": true
        }
    ],	
	"scaleOverlayUnits":{
        "bottomOutUnits":"nmi",    
        "bottomInUnits":"nmi",    
        "topInUnits":"m",    
        "topOutUnits":"km"
    },
	"customTools":[
		{
			"actions": ["-"], 
			"actionTarget": "paneltbar"
		}, {
			"ptype": "gxp_metadataexplorer",
			"id": "metadataexplorer",
            "outputTarget": "south",
            "saveState":true,
            "cswconfig": {
                "catalogs": [
                        {"name": "CSI Piemonte", "url": "http://www.ruparpiemonte.it/geocatalogorp/geonetworkrp/srv/it/csw", "description": "GeoPortale della Regione Piemonte"}
                    ],
                "dcProperty": "title",
                "initialBBox": {
                    "minx": 11.145,
                    "miny": 43.718,
                    "maxx": 11.348,
                    "maxy": 43.84
                },
                "cswVersion": "2.0.2",
                "filterVersion": "1.1.0",
                "start": 1,
                "limit": 10,
                "timeout": 60000
            }            
		}, {
			"ptype": "gxp_addlayer",
			"showCapabilitiesGrid": true,
			"id": "addlayer"
		}, {
			"ptype": "gxp_geolocationmenu",
			"outputTarget": "paneltbar",
			"index": 23
		}
	]
}
