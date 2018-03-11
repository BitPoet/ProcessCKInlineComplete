# ProcessCKInlineComplete
ProcessWire module - Inline completion actions for CKEditor

## Status
Alpha - needs extensive testing

## Compatibility
Currently tested with PW3

## Installation
* Extract the module's zip file to site/modules (download zip from github through [this link](https://github.com/BitPoet/ProcessCKInlineComplete/archive/master.zip))
* Go to the admin and run Modules -> Refresh, then install "Autocomplete for CKEditor"
* Install any autocomplete action modules. This module ships with autocomplete actions for PW users and Hanna Code
* Configure the CKEditor fields (e.g. body) in which you want to use autocompletion and check the boxes to use the actions you want
* Start editing a CKEditor field and type any of the opening characters for your activated autocomplete action(s)

## Customization
The module comes with a default (ugly) css to style the selection dialog. If you want to adapt the styling,
copy the ```ProcessCKInlineCompleteDefault.css``` in the module's directory to ```site/templates/styles``` and rename it to
```ProcessCKInlineComplete.css```

## Contributing
Feel free to submit issues or pull requests for any changes/improvements you'd like to see incorporated.

## License
See LICENSE for details
