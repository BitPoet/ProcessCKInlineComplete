# ProcessCKInlineComplete
ProcessWire module - Inline completion actions for CKEditor

## Status
Beta - needs testing

## Compatibility
Currently tested with PW3

## Installation
* Extract the module's zip file to site/modules (download zip from github through [this link](https://github.com/BitPoet/ProcessCKInlineComplete/archive/master.zip))
* Go to the admin and run Modules -> Refresh, then install "Autocomplete for CKEditor"
  ![Install Module](https://bitpoet.github.io/img/ProcessCKInlineComplete_install_1.png)
* Install any autocomplete action modules. This module ships with autocomplete actions for PW users and Hanna Code
  ![Install Actions](https://bitpoet.github.io/img/ProcessCKInlineComplete_install_2.png)
* Configure the CKEditor fields (e.g. body) in which you want to use autocompletion and check the boxes to use the actions you want
  ![Configure Fields](https://bitpoet.github.io/img/ProcessCKInlineComplete_user_action.png)
* Start editing a CKEditor field and type any of the opening characters for your activated autocomplete action(s)
  ![Activate Actions](https://bitpoet.github.io/img/ProcessCKInlineComplete_editing.gif)

## Customization
The module comes with a default (ugly) css to style the selection dialog. If you want to adapt the styling,
copy the ```ProcessCKInlineCompleteDefault.css``` in the module's directory to ```site/templates/styles``` and rename it to
```ProcessCKInlineComplete.css```

## Writing Custom Actions
You can write your own action modules. You need to make sure that
* their name starts with "InlineCompleteAction"
* they extend the ```InlineCompleteAction``` class
* they autoload for the correct Process modules
  ```
			"autoload"	=>	function() {
				$p = wire('page');
				if($p->template != "admin") return false;
				if($p->process === "ProcessPageEdit" || $p->process === "ProcessField" || $p->process === "ProcessCKInlineComplete") {
					return true;
				}
				return false;
			},
  ```
* they have dependencies on InlineCompleteAction and any third modules that are needed for their execution
* they call ```parent::init()``` if they implement their own init method
* they set defaults for any custom configuration fields in their init method
* implement their own executeFilter method that gets ```$input->post``` as its sole argument and returns an array of items (associative arrays). The text to filter for is passed in $post->filter.
* they implement ```___getActionSettings()```

There is documentation in the [InlineCompleteAction](./InlineCompleteAction.module) base class as well as the example implementations [InlineCompleteActionUsers](./InlineCompleteActionUsers.module) and [InlineCompleteActionHannaCode](./InlineCompleteActionHannaCode.module).

## Contributing
Feel free to submit issues or pull requests for any changes/improvements you'd like to see incorporated.

## License
See LICENSE for details
