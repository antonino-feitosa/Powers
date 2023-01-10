-- Lua script of custom entity hand.
-- This script is executed every time a custom entity with this model is created.

-- Feel free to modify the code below.
-- You can add more events and remove the ones you don't need.

-- See the Solarus Lua API documentation for the full specification
-- of types, events and methods:
-- http://www.solarus-games.org/doc/latest

local entity = ...
local game = entity:get_game()
local map = entity:get_map()
local hero = map:get_hero()

function entity:set_relative_position(hero)
  local x, y, layer = hero:get_position()
  local direction = hero:get_direction();
  entity:set_direction(direction)
  local dx, dy = 0, 0
  if direction == 0 then
     dx = 16
  elseif direction == 1 then
    dy = -24
  elseif direction == 2 then
    dx = -16
  elseif direction == 3 then
    dy = 16
  end
  entity:set_position(x + dx, y + dy, layer)
end

-- Event called when the custom entity is initialized.
function entity:on_created()

  -- Initialize the properties of your custom entity here,
  -- like the sprite, the size, and whether it can traverse other
  -- entities and be traversed by them.

  local sprite = entity:create_sprite("attack/hand")
  entity:set_relative_position(hero)
  

  entity:add_collision_test('sprite', function(hand, other)
    if other:get_type() == 'enemy' then
      other:hurt(other:get_touch_reaction())
    end
  end)

  hero:register_event("on_position_changed", function(hero, x, y, layer)
    entity:set_relative_position(hero)
  end)

end
