# crossword-generator

Instead of duplicating the grid and trying to place and checking for an error...

Loop through the locations and place the characters, keeping track of which ones are new (ie don't include characters from other words)

Once it's placed check all cells around the word and make sure that any filled cells are part of a word that goes in the perpendicular direction (this will require saving this information as we populate the cells)

If the word is invalid !fails check above), simply clear all the cells for the new characters we kept track of