describe('RichTextToolbar ARIA', function() {
  var toolbar;
  var element;

  beforeEach(function() {
    toolbar = new firepad.RichTextToolbar();
    element = toolbar.element();
    document.body.appendChild(element);
  });

  afterEach(function() {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  function button(label) {
    return element.querySelector('[aria-label="' + label + '"]');
  }

  function keydown(target, keyCode) {
    var event = document.createEvent('Event');
    event.initEvent('keydown', true, true);
    event.keyCode = keyCode;
    target.dispatchEvent(event);
  }

  it('exposes aria-pressed false on Bold, Italic, Underline, and Strike', function() {
    ['Bold', 'Italic', 'Underline', 'Strike'].forEach(function(name) {
      expect(button(name).getAttribute('aria-pressed')).toBe('false');
    });
    expect(button('Undo').hasAttribute('aria-pressed')).toBe(false);
    expect(button('Left').hasAttribute('aria-pressed')).toBe(false);
  });

  it('sets aria-pressed from the same state as firepad-btn-highlight', function(done) {
    var editor = Object.create(firepad.RichTextCodeMirror.prototype);
    editor.codeMirror = { firepad: { toolbar: toolbar } };
    editor.currentAttributes_ = { b: true, i: false, u: true, s: false };
    editor.updateToolbarButnsState_();

    setTimeout(function() {
      expect(button('Bold').getAttribute('aria-pressed')).toBe('true');
      expect(button('Bold').className).toContain('firepad-btn-highlight');
      expect(button('Italic').getAttribute('aria-pressed')).toBe('false');
      expect(button('Italic').className).not.toContain('firepad-btn-highlight');
      expect(button('Underline').getAttribute('aria-pressed')).toBe('true');
      expect(button('Underline').className).toContain('firepad-btn-highlight');
      expect(button('Strike').getAttribute('aria-pressed')).toBe('false');
      expect(button('Strike').className).not.toContain('firepad-btn-highlight');
      done();
    }, 150);
  });

  it('exposes aria-expanded on Font, Size, and Color and clears it when the menu closes', function() {
    ['Font', 'Size', 'Color'].forEach(function(name) {
      var trigger = button(name);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      trigger.click();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      keydown(trigger, 13); // Enter
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      keydown(trigger, 27); // Esc
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      keydown(trigger, 40); // Down
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      trigger.querySelector('.firepad-dropdown-menu a').click();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Color dropdown names', function() {
    var NAMES = ['Black', 'Gray', 'Blue', 'Sky blue', 'Red', 'Yellow', 'Green', 'Purple', 'Pink'];

    function colorItems() {
      var menu = button('Color').querySelector('.firepad-dropdown-menu');
      return Array.prototype.slice.call(menu.children);
    }

    it('labels each colour by name instead of its hex value', function() {
      expect(colorItems().map(function(item) {
        return item.getAttribute('aria-label');
      })).toEqual(NAMES);
    });

    it('shows each colour name next to its swatch', function() {
      colorItems().forEach(function(item, i) {
        var swatch = item.querySelector('.firepad-color-dropdown-item');
        var name = item.querySelector('.firepad-color-dropdown-name');
        expect(swatch.getAttribute('aria-hidden')).toBe('true');
        expect(name.textContent).toBe(NAMES[i]);
      });
    });

    it('still applies the hex value when a named colour is chosen', function() {
      var chosen = [];
      toolbar.on('color', function(value) { chosen.push(value); });

      button('Color').click();
      colorItems()[3].click();

      expect(chosen).toEqual(['#85D4F7']);
    });

    it('keeps the value as the label for items without a name', function() {
      expect(button('Size').querySelector('.firepad-dropdown-menu a').getAttribute('aria-label')).toBe('9');
    });
  });
});
