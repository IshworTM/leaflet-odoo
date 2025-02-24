{
    "name": "VA MAP",
    "version": "1.0",
    "description": "A module for rendering map.",
    "summary": "Integrate map into Odoo",
    "author": "Vitruvian Analytica",
    "website": "",
    "license": "LGPL-3",
    "category": "Tools",
    "depends": ["base", "web"],
    "data": [
        "security/ir.model.access.csv",
        "views/va_map_views.xml",
        "views/va_map_list_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "va_map/static/lib/leaflet/leaflet.css",
            "va_map/static/lib/leaflet/leaflet.js",
            "va_map/static/src/components/**/*.js",
            "va_map/static/src/components/**/*.xml",
            "va_map/static/src/components/**/*.scss",
        ]
    },
    "application": True,
    "installable": True,
    "auto_install": False,
}
