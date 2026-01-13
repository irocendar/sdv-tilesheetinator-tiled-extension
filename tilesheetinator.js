/*************
 *
 * Version: 1.1.0
 * License: MIT (see repo for details)
 *
 * Copyright (c) 2025-2026 irocendar
 *
 * https://github.com/irocendar/sdv-tilesheetinator-tiled-extension
 * https://www.nexusmods.com/stardewvalley/mods/40281
 *
 *************/


/**************
 * Config
 **************/

var scriptPath = __filename
var scriptDir = FileInfo.path(scriptPath)
var configPath = FileInfo.joinPaths(scriptDir, "tilesheetinator_config.json")
var config

if (File.exists(configPath)) {
    var configFile = new TextFile(configPath, TextFile.ReadOnly)
    try {
        config = JSON.parse(configFile.readAll())
    } catch (e) {
        if (e instanceof SyntaxError)
            tiled.alert("Invalid config syntax. Please check your config file at " + configPath + " or delete it and restart tiled to create a new one.", "Invalid Config Syntax")
        else tiled.alert("There was a problem reading your config file.", "Config File Error")
    } finally {
        configFile.close()
    }
} else {
    config = {
        MapsDirPath: "",
        ModPaths: []
    }
    var configFile = new TextFile(configPath, TextFile.WriteOnly)
    try {
        configFile.write(JSON.stringify(config, null, 4))
    } catch(e) {
        tiled.alert("There was a problem making your config file.", "Config File Error")
    } finally {
        configFile.commit()
    }
}

config.MapsDirPath = config.MapsDirPath || ""
config.ModPaths = config.ModPaths || []

/**************
 * Utils
 **************/

var workingDir = FileInfo.path(tiled.activeAsset ? tiled.activeAsset.fileName : "")
tiled.log(workingDir)
tiled.activeAssetChanged.connect(asset => {
    workingDir = FileInfo.path(asset.fileName)
})

function checkDirPath(alert=true) {
    if (config.MapsDirPath == "") {
        alert && tiled.alert("Please set the unpacked Maps folder location.", "No Maps Folder Set")
        return false
    }
    return true
}

function writeConfig() {
    var configFile = new TextFile(configPath, TextFile.WriteOnly)
    try {
        configFile.write(JSON.stringify(config, null, 4))
    } catch(e) {
        tiled.alert("There was a problem updating your config file.", "Config File Error")
    } finally {
        configFile.commit()
    }
}

var browseButtonStyle = "\
    QPushButton {\
        min-width: 5em;\
        max-width: 5em;\
    }"

/**************
 * loadAction
 **************/

function loadTilesets(asset, mainAsset=null) {

    if (!checkDirPath(false)) return

    function getOriginalFilename(ts) {
        return FileInfo.relativePath(workingDir, FileInfo.fromNativeSeparators(ts.imageFileName))
    }
    var ATAtilesets = asset.tilesets.filter(
        ts => getOriginalFilename(ts).startsWith("Content/")
    )
    if (ATAtilesets.length > 0) {
        if (tiled.confirm(
            `This map has tilesheets that use Arbitrary Tilesheet Access by Spiderbuttons, whose functionality is now part of SMAPI. Convert to SMAPI's syntax?

This will make actual changes to your map.`, 
            "Arbitrary Tilesheet Access Syntax Found"
        )) {
            asset.macro("Remove old ATA syntax", () => ATAtilesets.forEach(ts => {
                ts.imageFileName = FileInfo.joinPaths("..", getOriginalFilename(ts).substring(8))
            }))
            tiled.alert(
                `Updated tilesheets to use SMAPI's new syntax. You can now remove ATA from your mod's dependencies.
                
Please save your map.`
            )
        }
    }

    asset.tilesets.forEach(ts => {
        var img = new Image();
        origFn = FileInfo.fromNativeSeparators(ts.imageFileName)
        if (!img.load(origFn)) {
            origFn = FileInfo.relativePath(workingDir, origFn)
            var fn = origFn
            for (var mod of config.ModPaths) {
                if (origFn.startsWith(mod.prefix)) {
                    var path = FileInfo.joinPaths(mod.path, FileInfo.toNativeSeparators(fn.replace(mod.prefix, "")))
                    img = new Image()
                    if (img.load(path)) {
                        mainAsset && mainAsset.tilesets.includes(ts) || ts.loadFromImage(img, origFn)
                        return
                    }
                }
            }
            if (origFn.startsWith("Content/")) {
                fn = FileInfo.joinPaths("..", origFn.substring(7))
            }
            var path = FileInfo.toNativeSeparators(FileInfo.joinPaths(config.MapsDirPath, fn))
            mainAsset && mainAsset.tilesets.includes(ts) || ts.loadFromImage(new Image(path), origFn)
        }
    })
}

tiled.mapEditor.currentBrushChanged.connect(() => loadTilesets(tiled.mapEditor.currentBrush, tiled.activeAsset))

var loadAction = tiled.registerAction("load_stardew_tilesheets", () => loadTilesets(tiled.activeAsset))
loadAction.text = "Fix Stardew Tilesheets"
loadAction.shortcut = "Ctrl+."

/**************
 * dirAction
 **************/

var dirAction = tiled.registerAction("pick_stardew_maps_dir", () => {
    var dialog = new Dialog("Choose Unpacked Maps Folder")
    dialog.newRowMode = dialog.ManualRows
    var path = dialog.addTextInput()
    path.text = config.MapsDirPath

    var browseButton = dialog.addButton("Browse")
    browseButton.styleSheet = browseButtonStyle
    browseButton.clicked.connect(() => {
        path.text = tiled.promptDirectory(path.text) || path.text
    })
    
    dialog.addNewRow()    
    
    var rejectButton = dialog.addButton("Cancel")
    rejectButton.clicked.connect(() => {
        dialog.reject()
    })

    var acceptButton = dialog.addButton("Set")
    acceptButton.clicked.connect(() => {
        dialog.accept()
        config.MapsDirPath = path.text
        writeConfig()
    })
    
    dialog.show()
})

dirAction.text = "Choose Unpacked Maps Folder"
dirAction.shortcut = "Ctrl+Shift+."

/**************
 * addAction
 **************/

var addAction = tiled.registerAction("add_stardew_tilesheet", () => {
    if (!checkDirPath()) return

    var dialog = new Dialog("Add Tilesheet")
    dialog.newRowMode = dialog.ManualRows
    dialog.addHeading("Name:")
    var name = dialog.addTextInput()
    dialog.addHeading("Source:")
    var path = dialog.addTextInput()
    
    var browseButton = dialog.addButton("Browse")
    browseButton.styleSheet = browseButtonStyle
    browseButton.clicked.connect(() => {
        var tsImg = tiled.promptOpenFile(config.MapsDirPath, "Images (*.png *.jpg);;All Files (*)")
        path.text = tsImg
        name.text = FileInfo.baseName(tsImg)
    })
    
    dialog.addNewRow()
    
    var rejectButton = dialog.addButton("Cancel")
    rejectButton.clicked.connect(() => {
        dialog.reject()
    })

    var acceptButton = dialog.addButton("Add")
    acceptButton.clicked.connect(() => {
        dialog.accept()
        var ts = new Tileset(name.text)
        ts.tileHeight = 16
        ts.tileWidth = 16
        ts.tileSpacing = 0
        ts.margin = 0
        var rel = FileInfo.fromNativeSeparators(FileInfo.relativePath(config.MapsDirPath, path.text))
        rel = FileInfo.toNativeSeparators(rel)
        rel = FileInfo.joinPaths(FileInfo.path(rel), FileInfo.completeBaseName(rel))

        var img = new Image()
        if (!img.load(path.text)) {
            tiled.alert("Couldn't load image " + path.text + ".", "Failed Adding Tilesheet")
            return
        }
        ts.loadFromImage(img, rel)
        tiled.activeAsset.addTileset(ts)
    })

    dialog.show()
})

addAction.text = "Add Vanilla Stardew Tilesheet"
addAction.shortcut = "Ctrl+,"


/**************
 * modDirAction
 **************/

function addModTilesheet(mod) {
    if (!mod.path) {
        tiled.alert("Please set the mod folder before adding tilesheets.", "No Mod Folder Set")
        return
    }

    var dialog = new Dialog("Add Mod Tilesheet")
    dialog.newRowMode = dialog.ManualRows
    dialog.addHeading("Name:")
    var name = dialog.addTextInput()
    dialog.addHeading("Source:")
    var path = dialog.addTextInput()
    
    var browseButton = dialog.addButton("Browse")
    browseButton.styleSheet = browseButtonStyle
    browseButton.clicked.connect(() => {
        var tsImg = tiled.promptOpenFile(mod.path, "Images (*.png *.jpg);;All Files (*)")
        path.text = tsImg
        name.text = FileInfo.baseName(tsImg)
    })
    
    dialog.addNewRow()
    
    var rejectButton = dialog.addButton("Cancel")
    rejectButton.clicked.connect(() => {
        dialog.reject()
    })

    var acceptButton = dialog.addButton("Add")
    acceptButton.clicked.connect(() => {
        dialog.accept()
        var ts = new Tileset(name.text)
        ts.tileHeight = 16
        ts.tileWidth = 16
        ts.tileSpacing = 0
        ts.margin = 0
        var rel = FileInfo.fromNativeSeparators(FileInfo.relativePath(mod.path, path.text))
        if (rel.startsWith("../")) {
            tiled.alert("Cannot add tilesheet from outside the set folder.", "Invalid tilesheet location")
            return
        }
        rel = FileInfo.toNativeSeparators(rel)
        rel = FileInfo.joinPaths(mod.prefix, FileInfo.path(rel), FileInfo.completeBaseName(rel)).replace(/^\//, "")

        var img = new Image()
        if (!img.load(path.text)) {
            tiled.alert("Couldn't load image " + path.text + ".", "Failed Adding Tilesheet")
            return
        }
        ts.loadFromImage(img, rel)
        tiled.activeAsset.addTileset(ts)
    })

    dialog.show()
}

function modRow(dialog, prefix="", path="") {
    dialog.addNewRow()
    var obj = {}
    obj.prefixTextbox = dialog.addTextInput()
    obj.prefixTextbox.text = prefix
    obj.prefixTextbox.placeholderText = "Asset Prefix (leave blank if none)"
    obj.prefixTextbox.maximumWidth = 11.5*16

    obj.pathTextbox = dialog.addTextInput()
    obj.pathTextbox.text = path
    obj.browseButton = dialog.addButton("Browse")
    obj.browseButton.styleSheet = browseButtonStyle

    obj.browseButton.clicked.connect(() => {
        obj.pathTextbox.text = tiled.promptDirectory(obj.pathTextbox.text) || obj.pathTextbox.text
    })

    obj.loadButton = dialog.addButton(">")
    obj.loadButton.toolTip = "Add tilesheet from this folder"
    obj.removeButton = dialog.addButton("-")
    obj.removeButton.toolTip = "Remove folder from list"
    
    var buttonStylesheet = "\
    QPushButton {\
        min-width: 1.5em;\
        max-width: 1.5em;\
    }"
    obj.loadButton.styleSheet = buttonStylesheet
    obj.removeButton.styleSheet = buttonStylesheet

    obj.loadButton.clicked.connect(() => addModTilesheet({ path: obj.pathTextbox.text, prefix: obj.prefixTextbox.text }))
    
    obj.removeButton.clicked.connect(() => {
        obj.prefixTextbox.text = ""
        obj.pathTextbox.text = ""
    })

    dialog.rows.push(obj)
    return obj
}

var modDirAction = tiled.registerAction("manage_tilesheet_mod_dirs", () => {
    
    var dialog = new Dialog("Registered Folders")
    dialog.newRowMode = dialog.ManualRows
    dialog.minimumWidth = 50*16
    dialog.rows = []

    var plusButton = dialog.addButton("+")
    plusButton.toolTip = "Add row"

    config.ModPaths.forEach(mod => modRow(dialog, mod.prefix, mod.path))

    plusButton.clicked.connect(() => modRow(dialog))
    dialog.finished.connect(() => {
        config.ModPaths = dialog.rows.map(row => {
            return {
                path: row.pathTextbox.text,
                prefix: row.prefixTextbox.text
            }
        })
        writeConfig()
    })

    dialog.show()
})

modDirAction.text = "Manage Stardew Tilesheet Mods"
modDirAction.shortcut = "Ctrl+Shift+,"

tiled.extendMenu("Map", [
    { separator: true },
    { action: "load_stardew_tilesheets" },
    { action: "pick_stardew_maps_dir" },
    { action: "add_stardew_tilesheet" },
    { action: "manage_tilesheet_mod_dirs" },
])
