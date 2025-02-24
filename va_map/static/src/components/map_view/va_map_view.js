/** @odoo-module **/

import { Component, useRef, onMounted, useState, onWillUnmount, useEffect } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

const DEFAULT_TILE_LAYER = { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", name: "OpenStreetMap" }

export class MapView extends Component {
    setup() {
        this.mapRef = useRef("map");
        this.orm = useService("orm");
        this.state = useState({
            tileLayers: [],
            defaultTileObject: {},
        });
        this.map;
        this.objects = this.props.objects || [];
        this.markers = this.props.markers || {};

        onMounted(async () => {
            await this.initializeMap();
            this.updateZoomLevel();
            window.addEventListener('resize', this.updateZoomLevel.bind(this));
        });

        useEffect(() => {
            this.updateObjects();
        }, () => [this.props.objects]);

        onWillUnmount(() => {
            window.removeEventListener('resize', this.updateZoomLevel.bind(this));
        });
    }

    async initializeMap() {
        try {
            await this.fetchData();
            await this.renderMap();
        } catch (error) {
            this.handleError("Error while initializing the map: ", error);
        }
    }

    async fetchData() {
        await Promise.all([this.getObjectDetails(), this.loadTileLayers()]);
    }

    getMapZoomLevel() {
        const width = window.innerWidth;
        if (width <= 480) {
            const sidebar = document.getElementById("sidebar");
            if (sidebar.classList.contains("unhidden")) {
                sidebar.classList.replace("unhidden", "hidden");
            }
            return 4;
        }
        else if (width <= 768) return 5;
        else if (width <= 1200) return 6;
        else return 7;
    }

    async reverseGeocode(latitude, longitude) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status : ${response.status}`);
            else return await response.json();
        } catch (error) {
            this.handleError("Error while reverse geocoding: ", error);
            return {};
        }
    }

    async getObjectDetails() {
        try {
            const objData = await this.orm.call("va.map.object", "search_read", [], {});
            this.objects = (objData || []).map((obj, index) => ({
                id: obj.id,
                name: obj.name,
                category: obj.category,
                latitude: obj.latitude,
                longitude: obj.longitude,
            }));
        } catch (error) {
            this.handleError("Error retrieving object data: ", error);
        }
    }

    async loadTileLayers() {
        try {
            const tileData = await this.orm.call("va.map.list", "search_read", [], {});
            const allTileLayers = await Promise.all(tileData.map(async (tile) => {
                const isValid = await this.validateUrl(tile.url);
                if (isValid) {
                    return {
                        name: tile.name,
                        url: tile.url,
                        is_default: tile.is_default
                    };
                } else {
                    return null;
                }
            }));
            const { validTileLayers, inValidTileLayers } = allTileLayers.reduce(
                (acc, tile) => {
                    if (tile !== null) {
                        acc.validTileLayers.push(tile);
                    } else {
                        acc.inValidTileLayers.push(tile);
                    }
                    return acc;
                },
                { validTileLayers: [], inValidTileLayers: [] }
            );
            if (inValidTileLayers.length > 0) {
                console.warn(`Some of the tile layers have invalid URL, please update it or remove it.`);
            }
            this.state.defaultTileObject = validTileLayers.find(tile => tile.is_default) || DEFAULT_TILE_LAYER;
            if (validTileLayers.length > 0) {
                this.state.tileLayers = validTileLayers;
            } else {
                this.state.tileLayers = [];
                alert("No valid map tile layers found. Try adding new layers from the model if you wish to switch between them. OpenStreetMap (OSM) will be rendered as the default tile layer.");
            }
        } catch (error) {
            this.handleError("Error while fetching tile layers: ", error);
        }
    }

    async validateUrl(url) {
        return new Promise((resolve) => {
            const tileLayer = L.tileLayer(url);
            tileLayer.on('tileload', () => {
                resolve(true);
            });
            tileLayer.on('tileerror', () => {
                resolve(false);
            });
            const testMap = L.map(document.createElement('div'), {
                center: [0, 0],
                zoom: 3,
            });
            tileLayer.addTo(testMap);
        });
    }

    tileLayerSelector() {
        return this.state.tileLayers.reduce((layers, { name, url }) => {
            layers[name] = L.tileLayer(url, { attribution: `&copy; ${name}` });
            return layers;
        }, {});
    }

    getIcon(category) {
        const icons = {
            "pet": L.divIcon({
                html: '<i class="fa fa-paw fa-4x" style="color: yellow;"></i>',
                iconSize: 0
            }),
            "vehicle": L.divIcon({
                html: '<i class="fa fa-car fa-4x" style="color: brown;"></i>',
                iconSize: 0
            }),
            "machinery": L.divIcon({
                html: '<i class="fa fa-cogs fa-4x" style="color: black;"></i>',
                iconSize: 0
            }),
            "default": L.divIcon({
                html: '<i class="fa fa-map-marker fa-4x" style="color: blue;"></i>',
                iconSize: 0
            }),
        }
        return icons[category] || icons.default;
    }

    async renderMap() {
        if (typeof L == 'undefined') {
            this.handleError("Leaflet library not loaded correctly.");
            return;
        }

        const { defaultTileObject } = this.state;
        const tileLayers = this.tileLayerSelector();
        const zoomLevel = this.getMapZoomLevel();

        var defaultTileLayer = L.tileLayer(defaultTileObject.url, {
            maxZoom: 19,
            attribution: `&copy; ${defaultTileObject.name}`,
        });

        this.map = L.map(this.mapRef.el, {
            center: [28.394857, 84.124008],
            zoom: zoomLevel,
            maxBounds: L.latLngBounds(
                L.latLng(-90, -180),
                L.latLng(90, 180)
            ),
            maxBoundsViscosity: 1.0,
            minZoom: 3,
            maxZoom: 19,
            layers: [defaultTileLayer],
        });
        L.control.scale().addTo(this.map);
        L.control.layers(tileLayers).addTo(this.map)

        await this.updateObjects();
    }

    async updateObjects() {
        if (!this.map) return;

        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        await Promise.all(this.objects.map(async (obj) => {
            const locationData = await this.reverseGeocode(obj.latitude, obj.longitude);
            this.createMarker(this.map, obj.latitude, obj.longitude, obj.name, obj.category, locationData);
            this.props.updatePropsData(this.objects, this.markers, this.map, locationData, this.getMapZoomLevel());
        }));
    }

    createMarker(map, lat, lon, name, cat, locData) {
        const marker = L.marker([lat, lon], {
            title: name,
            icon: this.getIcon(cat),
        }).bindPopup(this.popupData(name, locData, lat, lon, cat)).addTo(map);

        if (!this.markers) {
            this.markers = {};
        }
        this.markers[name] = marker;
    }

    popupData(name, locData, lat, lon, cat) {
        return `
            <h2>Object Information:</h2>
            <div class="obj-info">
                <b>Object Name:</b> ${name}<br>
                <b>Category:</b> ${cat}<br>
                <b>Country:</b> ${locData.address?.country || "Unknown"}<br>
                <b>Latitude:</b> ${lat}<br>
                <b>Longitude:</b> ${lon}
            </div>`;
    }

    updateZoomLevel() {
        if (this.map) {
            const zoomLevel = this.getMapZoomLevel();
            this.map.setZoom(zoomLevel);
        }
    }

    handleError(message, err = null) {
        err ? console.error(message, err) : console.error(message);
    }
}

MapView.template = "MapViewTemplate";
MapView.props = {
    objects: { type: Array },
    markers: { type: Object },
    updatePropsData: { type: Function },
}