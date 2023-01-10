
local enemy_meta = sol.main.get_metatable("enemy")

enemy_meta.get_touch_reaction = function(self)
  return 0
end
