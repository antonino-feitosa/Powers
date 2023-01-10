
local game_meta = sol.main.get_metatable("game")


local keyToPower = {["z"] = 1, ["x"] = 2, ["c"] = 3, ["v"] = 4, ["b"] = 5}
local itemToPower = {["item_1"] = 1, ["item_2"] = 2, ["item_3"] = 3, ["item_4"] = 4, ["item_5"] = 5}


function game_meta:start_process_power(power)
  local game = self
  local map = game:get_map()
  if power and power >= 1 and power <= 5 and map and not game:is_suspended() then
    local hero = map:get_hero()
    hero:on_power_pressed(power)
    local item = game:get_item_assigned(power)
    if item and item.on_charging then item:on_charging(hero) end
  end
end

function game_meta:end_process_power(power)
  local game = self
  local map = game:get_map()
  if power and power >= 1 and power <= 5 and map and not game:is_suspended() then
    local hero = map:get_hero()
    hero:on_power_released(power)
    local item = game:get_item_assigned(power)
    if item then
      hero:start_item(item)
    end
  end
end

game_meta:register_event("on_started", function(game)
  game:set_command_keyboard_binding("attack", nil)
end)

game_meta:register_event("on_key_pressed", function(game, key)
  local map = game:get_map()
  if map and not game:is_suspended() then
    local power = keyToPower[key]
    game:start_process_power(power)
  end  
end)

game_meta:register_event("on_key_released", function(game, key)
  local map = game:get_map()
  if map and not game:is_suspended() then
    local power = keyToPower[key]
    game:end_process_power(power)
  end  
end)



local parent_simulate_command_pressed = game_meta.simulate_command_pressed
function game_meta:simulate_command_pressed(command)
  local power = itemToPower[command]
  if power then
     self:start_process_power(power)
  else
    parent_simulate_command_pressed(self, command)
  end
end

local parent_simulate_command_released = game_meta.simulate_command_released
function game_meta:simulate_command_released(command)
  local power = itemToPower[command]
  if power then
     self:end_process_power(power)
  else
    parent_simulate_command_released(self, command)
  end
end


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
