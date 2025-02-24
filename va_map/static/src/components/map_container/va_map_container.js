/** @odoo-module **/

import { Component } from "@odoo/owl";
import { MapView } from "../map_view/va_map_view";

export class MapContainer extends Component { }

MapContainer.components = { MapView };
MapContainer.template = "MapContainerTemplate";
MapContainer.props = {
    objects: { type: Array },
    markers: { type: Object },
    updatePropsData: { type: Function },
}