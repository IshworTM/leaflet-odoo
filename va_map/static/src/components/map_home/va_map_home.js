/** @odoo-module */

import { registry } from "@web/core/registry";
import { Component, useState } from "@odoo/owl";
import { MapContainer } from "../map_container/va_map_container";
import { MapSidebar } from "../map_sidebar/va_map_sidebar";
import { MapDetails } from "../map_details/va_map_details";
import { MapButton } from "../map_button/va_map_button";

class MapHome extends Component {
    setup() {
        this.state = useState({
            objects: [],
            selectedObject: null,
        })
        this.markers = null;
        this.map = null;
        this.locationData = null;
    }

    updatePropsData(newObjects, newMarkers, newMap, newLocData) {
        this.state.objects = newObjects;
        this.markers = newMarkers;
        this.map = newMap;
        this.locationData = newLocData;
    }
    
    getSelectedObject(newObj) {
        this.state.selectedObject = newObj;
    }

    handleCloseDetails(){
        this.state.selectedObject = null;
    }
}
MapHome.components = { MapContainer, MapSidebar, MapDetails, MapButton };
MapHome.template = "MapHomeTemplate";
registry.category("actions").add("MapAction", MapHome);
