
local map_meta = sol.main.get_metatable("map")


function map_meta:on_key_pressed(key)
  local map = self
  local game = map:get_game()
  if not game:is_suspended() then
    if key == 'b' then
      local hero = map:get_hero()
      hero:on_first_power_pressed()
      return true
    elseif key == 'n' then
      local hero = map:get_hero()
      hero:on_second_power_pressed()
      return true
    end
  end
end

function map_meta:on_key_released(key)
  local map = self
  local game = map:get_game()
  if not game:is_suspended() then
    if key == 'b' then
      local hero = map:get_hero()
      hero:on_first_power_released()
      return true
    elseif key == 'n' then
      local hero = map:get_hero()
      hero:on_second_power_released()
      return true
    end
  end
end
