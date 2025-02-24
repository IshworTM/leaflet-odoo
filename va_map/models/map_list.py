from odoo import fields, models, api, _
from odoo.exceptions import ValidationError


class MapList(models.Model):
    _name = "va.map.list"
    _description = "A model that manages different map layers."

    name = fields.Char("Map Name", required=True)
    url = fields.Char("Map Link", required=True)
    is_default = fields.Boolean("Default Layer", default=False)

    @api.constrains("is_default")
    def check_default_layer(self):
        for tile in self:
            if tile.is_default:
                has_a_default_tile = self.search(
                    [("is_default", "=", True), ("id", "!=", tile.id)]
                )
                if has_a_default_tile:
                    raise ValidationError(
                        _(
                            f'The tile layer "{has_a_default_tile.name}" is already set as the default tile layer.\nPlease update it if you want this layer as the default tile layer.'
                        )
                    )
