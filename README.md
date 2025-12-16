# Tilesheetinator - Stardew Tilesheet Extension for Tiled

Create Stardew Valley maps that work in-game without having to copy vanilla and modded tilesheets back-and-forth, rename files with a `.` in front of their name, edit maps only in the unpacked content folder or make symlink workarounds.

## Installation

Open the preferences menu in Tiled:

**Windows, Linux:** `Edit` > `Preferences` \
**Mac**: `Tiled` > `Preferences`

And select `Plugins` > `Open ...`. Save the extension inside the folder that opens.

Restart Tiled and check that the extension is now enabled by opening a map and making sure that there are now new options at the bottom of the `Map` menu.

## Instructions

### Set Vanilla Maps Folder
Click `Ctrl+Shift+.` or `Map` > `Choose Unpacked Maps Folder`. Once you set it, it will be saved in a config file in the same folder as the extension, so you only have to set it again if you need to move it or you deleted the config file.

### Fix Missing Tilesheets
Click `Ctrl+.` or `Map` > `Fix Stardew Tilesheets` to load missing tilesheets in. This won't affect the map permanently so it's perfectly safe to save after doing this.

Add Vanilla Tilesheet
Click `Ctrl+,` or `Map` > `Add Vanilla Stardew Tilesheet` to correctly add a new vanilla tilesheet manually. Remember that manually adding tilesheets will add them without any animations/preconfigured tile properties.

Adding tilesheets from outside the Maps folder will add them using [Arbitrary Tilesheet Access](https://www.nexusmods.com/stardewvalley/mods/30001) syntax.

### Manage Tilesheet Mods
Click `Ctrl+Shift+,` or `Map` > `Manage Stardew Tilesheet Mods` to open the tilesheet mod menu.

Add the folder _the actual tilesheet images are directly in_ using the browse button. If a mod has multiple recolour versions in separate folders, add whichever one you would like to see when editing the map.

Click the right arrow button next to any mod's line to add a tilesheet from that mod to the current map.

**Advanced:** 

If the asset names a mod uses have a prefix before the actual file name (like `Prefix<filename>`, `Prefix/<filename>`, or `Prefix_<filename>`), add that prefix to the prefix textbox. 

For example, if a tilesheet mod has files `tilesheet1.png` and `tilesheet2.png` and loads them to `Maps/ModId/tilesheet1` and `Maps/ModId/tilesheet2`, put `ModId/` in the prefix box.

## Where To Get Help

For help with this extension, go to [the official Stardew Valley discord server](https://discord.gg/stardewvalley)'s `#making-mods-general` channel or [the extension's Nexus Mods mod page](https://www.nexusmods.com/stardewvalley/mods/40281).

You can report bugs via issues in this repo but I recommend also letting me know via discord if you do.

## Permissions
This extension is licensed under MIT, but I would prefer that you ask first before translating, modifying and/or redistributing it unless I have left the community.
