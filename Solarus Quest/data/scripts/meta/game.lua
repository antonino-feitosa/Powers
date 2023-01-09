
local game_meta = sol.main.get_metatable("game")


local parent_get_item_assigned = game_meta.get_item_assigned
function game_meta:get_item_assigned(slot)
  if slot > 2 then
    local name = self:get_value('slot_' .. slot)
    if name then
      return self:get_item(name)
    else
      return nil
    end
  else
    return parent_get_item_assigned(self, slot)
  end
end


local parent_set_item_assigned = game_meta.set_item_assigned
function game_meta:set_item_assigned(slot, item)
  if slot > 2 then
    self:set_value('slot_' .. slot, item:get_name())
  else
    return parent_set_item_assigned(self, slot, item)
  end
end
