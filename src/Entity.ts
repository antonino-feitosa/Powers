
import { Viewer } from './View';
import { Point } from './Algorithms2D';

export interface Render { glyph: string, fg: string, bg: string };

export interface Entity { point:Point, viewer:Viewer, render:Render }

export interface Monster extends Entity { update: () => void; }
