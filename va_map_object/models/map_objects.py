from odoo import fields, models


class MapObjects(models.Model):
    _name = "va.map.object"
    _description = "Map Objects"

    name = fields.Char(string="Object Name", required=True)
    latitude = fields.Float(string="Latitude")
    longitude = fields.Float(string="Longitude")
    category = fields.Selection(
        selection=[("pet", "Pet"), ("vehicle", "Vehicle"), ("machinery", "Machinery")],
        string="Category",
        required=True,
    )
