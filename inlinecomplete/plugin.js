CKEDITOR.plugins.add("inlinecomplete", {
    init: function(editor) {
    	for(var i = 0, l = editor.config.inlinecomplete.actions.length; i < l; i++) {
    		new CKEDITOR.plugins.inlinecomplete(editor, editor.config.inlinecomplete.actions[i]);
    	}
    }
});

CKEDITOR.plugins.inlinecomplete = function(editor, config) {

	this.inlinecomplete = config;
	
	this.cur = null;
	this.listenInside = null;
	this.listenEvent = null;
	this.lastResultLength = 0;
	this.notFoundCalls = 0;
	
    this.ajaxObj = null;
    this.results = null;
    
    this.pickerListId = "inlinecomplete_" + config.name + "_" + config.action;
    
    this.typeAheadChar = config.typeAheadChar;
    this.typeAheadAfter = config.typeAheadAfter;
    
    this.basePath = function(str) {
 	   return str.substr(0, str.lastIndexOf('/') + 1);
	};
    
    // Initialize listeners
    this.listenForStartingSymbol = function() {
    	
    	// Activate change event on ckeditor field
        this.listenEvent = editor.on("change", function(a) {
        	
            CKEDITOR.tools.setTimeout(function() {
            	
                var sel = editor.getSelection();
                
                if (sel.getType() == CKEDITOR.SELECTION_TEXT) {
                	
                    for (var a = sel.getRanges(true), b = 0; b < a.length; b++) {
                    	
                    	// Set start of selection correctly if collapsed to really determine
                    	// the first char later
	                    if(a[b].collapsed && a[b].startOffset) {
	                    	a[b].setStart(a[b].startContainer, 0);
	                    }
	                    
	                    // Start inlinecomplete autocomplete if selection starts with the configured character
	                    if(a[b].cloneContents().$.textContent.substr(-1) == this.typeAheadChar)
	                    {
	                    	this.startListening(a[b]);
	                    }
	                    
	                }
	            
                } 
            
            }, 0, this);
        
        }, this);
    
    };
    
    // autocomplete initialization
    this.startListening = function(rng) {
        var c = rng.cloneContents().$.textContent;
        
        if (c.length <= 1 || c.substr(-2, 1).match(/\s/)) {
        	
            this.listenEvent.removeListener();
            this.cur = new CKEDITOR.dom.element("span");
            this.cur.setText(this.typeAheadChar);
            
            if (rng.endContainer instanceof CKEDITOR.dom.element) {
            	
                for (var b, f = rng.endContainer.getChildren(), c = f.count(); 0 <= c; c--) {
                    var e = f.getItem(c);
                    if (e instanceof CKEDITOR.dom.text &&
                        "[" == e.getText()) {
                        b = e;
                        break
                    }
                }
                
                if (!b) return;
                
            } else {
            	
            	b = rng.endContainer.split(rng.endOffset - 1);
            	
            }
            
            b.split(1);
            this.cur.replace(b);
            b = editor.createRange();
            b.moveToPosition(this.cur, CKEDITOR.POSITION_BEFORE_END);
            editor.getSelection().selectRanges([b]);
            
            this.lastResultLength = 0;
            this.notFoundCalls = 0;
            
            // Setup results list
            var pickId = this.pickerListId;
            this.results = $(
            	'<div id="' + pickId + '_wrap" class="' + this.inlinecomplete.action + ' pwinlinecomplete_wrap">' +
            		'<div id="' + pickId + '_label" class="pwinlinecomplete_label">' + this.inlinecomplete.ddLabel + '</div>' +
            		'<ul id="' + pickId + '" class="pwinlinecomplete"></ul>' +
            	'</div>'
            )/*.hide()*/;
            $(this.results).find('ul.pwinlinecomplete').append('<li><img src="' + this.basePath(CKEDITOR.skin.getPath( 'editor' )) + 'images/spinner.gif"></li>');
            
            if(this.inlinecomplete.dropdownWidth) this.results.css("min-width", '' +  this.inlinecomplete.dropdownWidth + 'px');
            if(this.inlinecomplete.dropdownHeight) this.results.css("min-height", '' +  this.inlinecomplete.dropdownHeight + 'px');
            
            $("body").append(this.results);
            
            this.showResults(rng);
            this.listenInside = editor.on("key", this.listenInsideEvent, this);
        }
    };
    
    // show results list
    // ToDo: Positioning is still off!!!
    this.showResults = function(rng) {
    	
    	if(rng && rng.getNextEditableNode() && rng.getNextEditableNode().getSize("height")) {
    		
    		var pos = this.getAbsolutePosition(this.cur.$);
    		
    		$(this.results).css({
    			left:			'' + (pos.left - 10) + 'px',
    			top:			'' + (pos.top + rng.getNextEditableNode().getSize("height") + 5) + 'px'
    		});
    		
    	}
    	
    	return;
    };
    
    // Since CKEditor uses an iframe, regular offset/position methods to
    // determine the position for the dropdown don't work. We need to
    // add the iframe's offset in that case.
	this.getAbsolutePosition = function(target) {

	    var target_body = $(target).parents('body');
	    if ($('body').get(0) === target_body.get(0)) {
		    return $(target).offset();
	    }
	    
	    // find the corresponding iframe container                                 
	    var iframe = $('iframe').filter(function() {
	        var iframe_body = $(this).contents().find('body');
	        return target_body.get(0) === iframe_body.get(0);
	    });

		var iframe_scrolltop = iframe.contents().find('html').scrollTop();
	    var left = $(iframe).offset().left + $(target).offset().left;
		var top = $(iframe).offset().top + $(target).offset().top - iframe_scrolltop;

		return {left: left, top: top};
	}
	
    // Keyboard control for selection list
    this.listenInsideEvent = function(a) {

        if(a.data.keyCode == 27) {
        	
        	this.cancelPicker();
        	this.closeResults();
        	
        } else if (a.data.keyCode == 40 || a.data.keyCode == 38) {
        	
            var c = this.results.find('ul#' + this.pickerListId).children("li[data-selected]");
            
            if(c.length) {
            	
            	c.removeAttr("data-selected");
            	
            	if(a.data.keyCode == 40) {
            		c.next().attr("data-selected", true);
            	} else {
            		c.prev().attr("data-selected", true);
            	}
            	
            } else {

            	if(a.data.keyCode == 40) {
            		this.results.find('ul#' + this.pickerListId).children(":first-child").attr("data-selected", true);
            	} else {
            		this.results.find('ul#' + this.pickerListId).children(":last-child").attr("data-selected", true);
            	}
            	
            }
            a.cancel();
            
        } else {
        	
        	if(a.data.keyCode == 13 || a.data.keyCode == 9) {
        		
        		c = this.results.find('ul#' + this.pickerListId).children("[data-selected]");
        		
        		if(c.length) {
        			
        			c.click();
        			a.cancel();
        			
        		} else {
        			
        			if(a.data.keyCode == 13) {
        				
        				this.cancelPicker();
        				this.closeResults();
        			
        			}
        		}
        		
        	} else {
        				
				if(a.data.keyCode == 8) {
					
					this.notFoundCalls = 0;
					
				}
					
				CKEDITOR.tools.setTimeout(function() {
	
		            if (this.cur.getText().length) {
		            	
		                for (var a = editor.getSelection().getRanges(), c = 0; c < a.length; c++) {
		                    if (!a[c].getCommonAncestor(true, true).equals(this.cur)) {
		                        this.cancelPicker();
		                        this.closeResults();
		                        return
		                    }
						}
						
		                var e = this.cur.getText().substr(this.typeAheadAfter.length).trim();
		                this.results.show();
		                this.showResults();

		                if (this.ajaxObj &&  this.ajaxObj.abort && typeof this.ajaxObj.abort === 'function') try {
		                    this.ajaxObj.abort()
		                } catch (g) {}

		                var thisObj = this;

		                this.ajaxObj = $.post(
	                		this.inlinecomplete.url,
	                		{
	                			filter:			e,
	                			action:			this.inlinecomplete.action,
	                			page:			this.inlinecomplete.page,
	                			field:			this.inlinecomplete.name
	                		},
							function(data) {
	                			if(data) {
	                				thisObj.lastResultLength = data.length;
	                				thisObj.results.find('ul#' + thisObj.pickerListId).removeClass('pwinlinecompleteloading');
	                				thisObj.results.find('ul#' + thisObj.pickerListId).empty();
	                				
	                				for(var i = 0, l = data.length; i < l; i++) {
	                					var row = data[i];
	                					
//	                					var resTpl = '<li title="{value}">{name}</li>';
//	                					var cols = ["name", "value"];
										var resTpl = thisObj.inlinecomplete.resultTpl;
										var cols = thisObj.inlinecomplete.returnColumns;
	                					
	                					for(var cl = cols.length, j = 0; j < cl; j++) {
	                						var re = new RegExp('\\{' + cols[j] + '\\}', 'g');
	                						resTpl = resTpl.replace(re, row[cols[j]]);
	                					}
	                					
	                					var $resRow = $(resTpl);
	                					$resRow.addClass('pwinlinecomplete-entry');
	                					
	                					for(var cl = cols.length, j = 0; j < cl; j++) {
											$resRow.attr('data-' + cols[j], row[cols[j]]);
										}

	                					thisObj.results.find('ul#' + thisObj.pickerListId).append($resRow);
	                				}
	                				
	               					thisObj.results.find('ul#' + thisObj.pickerListId).children().click($.proxy(thisObj.selectPickerResult, thisObj));
	               					
	                			} else {
	                				
	                				if(e.length > 0) {
	                					thisObj.notFoundCalls++;
	                					if(++this.notFoundCalls >= 3) {
	                						thisObj.cancelPicker();
	                						thisObj.closeResults();
	                					} else if(this.lastResultLength + 5 <= e.length) {
	                						thisObj.results.hide();
	                					}
	                				}
	                				
	                			}
	                		},
	                		'json'
	                	);
	                	
		            } else {
		            	
		            	this.closeResults();
		            	
		            }
		            
		        }, 50, this);
		        
			}
			
		}
		
	};
    
    // Insert link from selection
    this.selectPickerResult = function(a) {
    	
        a = $(a.currentTarget);
        
        var newEl;
 
        var tpl = this.inlinecomplete.insertTpl;
        tpl = tpl.replace(/\{([^}]+)}/g, function(allmatch, capture) {
        	return a.attr('data-' + capture);
        });
        
        if(this.inlinecomplete.isText) {
        	newEl = new CKEDITOR.dom.text(tpl);
        } else {
        	newEl = new CKEDITOR.dom.element($(tpl)[0]);
        }
        newEl.replace(this.cur);
        this.cur = newEl;

        editor.focus();
        a = editor.createRange();
        a.moveToElementEditEnd(this.cur);
        editor.getSelection().selectRanges([a]);
        this.closeResults()
        
    };
    
    this.cancelPicker = function() {
    	
        if(this.cur) this.cur.remove(true);
        
    };
    
    this.closeResults = function() {
    	
        this.cur = null;
        if(this.results) this.results.remove();
        if(this.listenInside) this.listenInside.removeListener();
        this.listenForStartingSymbol();
        
    };
    
    // Start up the engine
    this.listenForStartingSymbol();
    
};
