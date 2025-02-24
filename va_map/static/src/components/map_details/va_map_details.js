/** @odoo-module **/

import { Component } from "@odoo/owl";

export class MapDetails extends Component {
    close() {
        this.props.onClose();
    }
    formatKeys(key) {
        return key.replace(/_/g, ' ')
            .split(' ')
            .map(word => {
                if (word.toUpperCase() === 'ID') {
                    return word.toUpperCase()
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1)
                }
            }).join(' ');
    }
}

MapDetails.template = "MapDetailsTemplate";
MapDetails.props = {
    selectedObject: { type: Object, default: () => ({}) },
    locationData: { type: Object, default: () => ({}) },
    onClose: { type: Function },
}
