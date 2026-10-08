var firepad = firepad || { };

firepad.RichTextToolbar = (function(global) {
  var utils = firepad.utils;

  function RichTextToolbar(imageInsertionUI, showPrint) {
    this.imageInsertionUI = imageInsertionUI;
    this.showPrint = showPrint;
    this.element_ = this.makeElement_();
  }

  utils.makeEventEmitter(RichTextToolbar, ['bold', 'italic', 'underline', 'strike', 'font', 'font-size', 'color',
    'left', 'center', 'right', 'unordered-list', 'ordered-list', 'todo-list', 'indent-increase', 'indent-decrease',
                                           'undo', 'redo', 'insert-image', 'print']);

  RichTextToolbar.prototype.element = function() { return this.element_; };

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  var TOGGLE_BUTTONS_ = { bold: true, italic: true, underline: true, strike: true };

  RichTextToolbar.prototype.makeButton_ = function(eventName, iconName) {
    var self = this;
    iconName = iconName || eventName;
    var attrs = {
      'class': 'firepad-btn',
      'title': capitalize(eventName),
      'role': 'button',
      'aria-label': capitalize(eventName),
      'tabindex': '0'
    };
    // Only the formatting toggles have a pressed state. Other buttons are actions.
    if (TOGGLE_BUTTONS_[eventName]) {
      attrs['aria-pressed'] = 'false';
    }
    var btn = utils.elt('a', [utils.elt('span', '', { 'class': 'firepad-tb-' + iconName } )], attrs);
    utils.on(btn, 'click', utils.stopEventAnd(function() { self.trigger(eventName); }));
    utils.on(btn, 'keydown', function(e) {
      if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
        firepad.utils.stopEvent(e);
        self.trigger(eventName);
      }
    });
    return btn;
  }
  RichTextToolbar.prototype.makeTextButton_ = function(eventName, iconName) {
    var self = this;
    iconName = iconName || eventName;
    var btn = utils.elt('a', [utils.elt('span', iconName )], {
      'class': 'firepad-btn',
      'role': 'button',
      'aria-label': capitalize(eventName),
      'tabindex': '0'
    });
    utils.on(btn, 'click', utils.stopEventAnd(function() { self.trigger(eventName); }));
    utils.on(btn, 'keydown', function(e) {
      if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
        firepad.utils.stopEvent(e);
        self.trigger(eventName);
      }
    });
    return btn;
  }

  RichTextToolbar.prototype.makeElement_ = function() {
    var self = this;

    var font = this.makeFontDropdown_();
    var fontSize = this.makeFontSizeDropdown_();
    var color = this.makeColorDropdown_();

    var toolbarOptions = [
      utils.elt('div', [font], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [fontSize], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [color], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [self.makeButton_('bold'), self.makeButton_('italic'), self.makeButton_('underline'), self.makeButton_('strike', 'strikethrough')], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [self.makeButton_('unordered-list', 'list-2'), self.makeButton_('ordered-list', 'numbered-list')], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [self.makeButton_('indent-decrease'), self.makeButton_('indent-increase')], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [self.makeButton_('left', 'paragraph-left'), self.makeButton_('center', 'paragraph-center'), self.makeButton_('right', 'paragraph-right')], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [self.makeButton_('undo'), self.makeButton_('redo')], { 'class': 'firepad-btn-group'})
    ];
    if(this.showPrint) {
      toolbarOptions.push(utils.elt('div', [self.makeButton_('print')], { 'class': 'firepad-btn-group'}));
    }

    if (self.imageInsertionUI) {
      toolbarOptions.push(utils.elt('div', [self.makeButton_('insert-image')], { 'class': 'firepad-btn-group' }));
    }

    this.linesRemaining = utils.elt('div', '', { 'class': 'firepad-toolbar-linesremaining-label' });
    toolbarOptions.push(this.linesRemaining);

    var toolbarWrapper = utils.elt('div', toolbarOptions, { 'class': 'firepad-toolbar-wrapper' });
    var toolbar = utils.elt('div', null, { 'class': 'firepad-toolbar' });
    toolbar.appendChild(toolbarWrapper)

    return toolbar;
  };

  RichTextToolbar.prototype.updateLinesRemaining= function(count) {
    if (count < 10) {
      this.linesRemaining.innerHTML = 'Lines remaining: ' + count;
    } else {
      this.linesRemaining.innerHTML = '';
    }
  };

  RichTextToolbar.prototype.makeFontDropdown_ = function() {
    // NOTE: There must be matching .css styles in firepad.css.
    var fonts = ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Lucida Grande', 'Palatino', 'Print Practice', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'];

    var items = [];
    for(var i = 0; i < fonts.length; i++) {
      var content = utils.elt('span', fonts[i]);
      content.setAttribute('style', 'font-family:' + fonts[i]);
      items.push({ content: content, value: fonts[i] });
    }
    return this.makeDropdown_('Font', 'font', items);
  };

  RichTextToolbar.prototype.makeFontSizeDropdown_ = function() {
    // NOTE: There must be matching .css styles in firepad.css.
    var sizes = [9, 10, 12, 14, 18, 24, 32, 42];

    var items = [];
    for(var i = 0; i < sizes.length; i++) {
      var content = utils.elt('span', sizes[i].toString());
      content.setAttribute('style', 'font-size:' + sizes[i] + 'px; line-height:' + (sizes[i]-6) + 'px;');
      items.push({ content: content, value: sizes[i] });
    }
    return this.makeDropdown_('Size', 'font-size', items, 'px');
  };

  // Each colour has a name so it isn't conveyed by colour alone (WCAG 1.4.1):
  // the name is shown next to the swatch and used as the item's label.
  var COLORS_ = [
    { value: '#000000', name: 'Black' },
    { value: '#747678', name: 'Gray' },
    { value: '#4D8BBE', name: 'Blue' },
    { value: '#85D4F7', name: 'Sky blue' },
    { value: '#D0021B', name: 'Red' },
    { value: '#F9B417', name: 'Yellow' },
    { value: '#78A240', name: 'Green' },
    { value: '#B665A6', name: 'Purple' },
    { value: '#FF6C98', name: 'Pink' }
  ];

  RichTextToolbar.prototype.makeColorDropdown_ = function() {
    var items = [];
    for(var i = 0; i < COLORS_.length; i++) {
      var swatch = utils.elt('span', '', {
        'class': 'firepad-color-dropdown-item',
        'style': 'background-color:' + COLORS_[i].value,
        'aria-hidden': 'true'
      });
      var name = utils.elt('span', COLORS_[i].name, { 'class': 'firepad-color-dropdown-name' });
      var content = utils.elt('span', [swatch, name], { 'class': 'firepad-color-dropdown-option' });
      items.push({ content: content, value: COLORS_[i].value, label: COLORS_[i].name });
    }
    return this.makeDropdown_('Color', 'color', items);
  };

  RichTextToolbar.prototype.makeDropdown_ = function(title, eventName, items, value_suffix) {
    value_suffix = value_suffix || "";
    var self = this;
    var button = utils.elt('a', title + ' \u25be', {
      'class': 'firepad-btn firepad-dropdown',
      'role': 'button',
      'aria-label': title,
      'aria-expanded': 'false',
      'tabindex': '0'
    });
    var list = utils.elt('ul', [ ], { 'class': 'firepad-dropdown-menu' });
    button.appendChild(list);

    var isShown = false;
    function showDropdown() {
      if (!isShown) {
        list.style.display = 'block';
        button.setAttribute('aria-expanded', 'true');
        utils.on(document, 'click', hideDropdown, /*capture=*/true);
        isShown = true;
        // If triggered by keyboard, focus first item
        setTimeout(function() {
           if (list.firstChild) list.firstChild.focus();
        }, 10);
      }
    }

    var justDismissed = false;
    function hideDropdown() {
      if (isShown) {
        list.style.display = '';
        button.setAttribute('aria-expanded', 'false');
        utils.off(document, 'click', hideDropdown, /*capture=*/true);
        isShown = false;
      }
      // HACK so we can avoid re-showing the dropdown if you click on the dropdown header to dismiss it.
      justDismissed = true;
      setTimeout(function() { justDismissed = false; }, 0);
    }

    function addItem(content, value, label) {
      if (typeof content !== 'object') {
        content = document.createTextNode(String(content));
      }
      var element = utils.elt('a', [content], {
        'role': 'button',
        'aria-label': label || value,
        'tabindex': '-1'
      });

      utils.on(element, 'click', utils.stopEventAnd(function() {
        hideDropdown();
        self.trigger(eventName, value + value_suffix);
      }));

      utils.on(element, 'keydown', function(e) {
        if (e.keyCode === 27) { // Esc
          hideDropdown();
          button.focus();
          firepad.utils.stopEvent(e);
        } else if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
          hideDropdown();
          self.trigger(eventName, value + value_suffix);
          firepad.utils.stopEvent(e);
        } else if (e.keyCode === 40) { // Down
          firepad.utils.stopEvent(e);
          if (element.nextSibling) {
            element.nextSibling.focus();
          } else if (list.firstChild) {
            list.firstChild.focus();
          }
        } else if (e.keyCode === 38) { // Up
          firepad.utils.stopEvent(e);
          if (element.previousSibling) {
            element.previousSibling.focus();
          } else if (list.lastChild) {
            list.lastChild.focus();
          }
        }
      });

      list.appendChild(element);
    }

    for(var i = 0; i < items.length; i++) {
      var content = items[i].content, value = items[i].value;
      addItem(content, value, items[i].label);
    }

    utils.on(button, 'click', utils.stopEventAnd(function() {
      if (!justDismissed) {
        showDropdown();
      }
    }));

    utils.on(button, 'keydown', function(e) {
      if (e.keyCode === 27) { // Esc
        hideDropdown();
        firepad.utils.stopEvent(e);
      } else if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 40) { // Enter, Space, Down
        showDropdown();
        firepad.utils.stopEvent(e);
      }
    });

    return button;
  };

  return RichTextToolbar;
})();
