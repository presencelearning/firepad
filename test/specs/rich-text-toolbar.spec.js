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
});
