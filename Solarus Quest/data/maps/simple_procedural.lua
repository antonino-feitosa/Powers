-- Lua script of map simple_procedutal.
-- This script is executed every time the hero enters this map.

-- Feel free to modify the code below.
-- You can add more events and remove the ones you don't need.

-- See the Solarus Lua API documentation:
-- http://www.solarus-games.org/doc/latest

local map = ...
local game = map:get_game()

-- Event called at initialization time, as soon as this map is loaded.
function map:on_started()

	local width, height = map:get_size()

	width = width - 32
	height = height - 24
	for dy= 0, height, 32 do
		for dx= 0, width, 32 do
			map:create_dynamic_tile({
				pattern = 'tiled',
				x= dx,
				y = dy,
				layer = 0,
				width = 32,
				height = 32,
			})
		end
	end



  -- You can initialize the movement and sprites of various
  -- map entities here.
end

-- Event called after the opening transition effect of the map,
-- that is, when the player takes control of the hero.
function map:on_opening_transition_finished()

end
