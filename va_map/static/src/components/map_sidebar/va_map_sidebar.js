/** @odoo-module **/

import { Component } from "@odoo/owl";

export class MapSidebar extends Component {
    showMarker(obj) {
        const marker = this.props.markers[obj.name];
        if (marker) {
            marker.openPopup();
            this.props.map.setView(marker.getLatLng(), 10);
            this.props.getSelectedObject(obj);
        }
    }
}

MapSidebar.template = "MapSidebarTemplate";
MapSidebar.props = {
    objects: { type: Array },
    markers: { type: Object },
    map: { type: Object, default: () => ({}) },
    getSelectedObject: { type: Function },
}
