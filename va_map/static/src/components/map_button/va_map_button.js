/** @odoo-module **/

import { Component } from "@odoo/owl";

export class MapButton extends Component {
    toggleSidebar() {
        const sidebar = document.getElementById("map-sidebar");
        const button = document.getElementById("map-button");
        const parentElement = button.parentElement;
        if (sidebar.classList.contains("unhidden")) {
            sidebar.classList.replace("unhidden", "hidden");
            button.classList.replace("fa-angle-double-left", "fa-angle-double-right");
            parentElement.style.left = 0;
        } else {
            sidebar.classList.replace("hidden", "unhidden");
            button.classList.replace("fa-angle-double-right", "fa-angle-double-left");
            parentElement.style.left = `${parentElement.offsetLeft + 400}px`;
        }
    }
}
MapButton.template = "MapButtonTemplate";