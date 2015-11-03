import Keycodes from './keycodes';
export const DIRECTION = {
  FORWARD: 1,
  BACKWARD: -1
};
import assert from './assert';

export const MODIFIERS = {
  META: 1, // also called "command" on OS X
  CTRL: 2,
  SHIFT: 3
};

export const SPECIAL_KEYS = {
  BACKSPACE: Keycodes.BACKSPACE,
  TAB:       Keycodes.TAB,
  ENTER:     Keycodes.ENTER,
  ESC:       Keycodes.ESC,
  SPACE:     Keycodes.SPACE,
  PAGEUP:    Keycodes.PAGEUP,
  PAGEDOWN:  Keycodes.PAGEDOWN,
  END:       Keycodes.END,
  HOME:      Keycodes.HOME,
  LEFT:      Keycodes.LEFT,
  UP:        Keycodes.UP,
  RIGHT:     Keycodes.RIGHT,
  DOWN:      Keycodes.DOWN,
  INS:       Keycodes.INS,
  DEL:       Keycodes.DELETE
};

// heuristic for determining if `event` is a key event
function isKeyEvent(event) {
  return !!event.keyCode ||
    !!event.metaKey ||
    !!event.shiftKey ||
    !!event.ctrlKey;
}

/**
 * An abstraction around a KeyEvent
 * that key listeners in the editor can use
 * to determine what sort of key was pressed
 */
const Key = class Key {
  constructor(event) {
    this.keyCode = event.keyCode;
    this.event = event;
  }

  static fromEvent(event) {
    assert('Must pass a Key event to Key.fromEvent',
           event && isKeyEvent(event));
    return new Key(event);
  }

  isEscape() {
    return this.keyCode === Keycodes.ESC;
  }

  isDelete() {
    return this.keyCode === Keycodes.BACKSPACE ||
           this.keyCode === Keycodes.DELETE;
  }

  isForwardDelete() {
    return this.keyCode === Keycodes.DELETE;
  }

  isHorizontalArrow() {
    return this.keyCode === Keycodes.LEFT ||
      this.keyCode === Keycodes.RIGHT;
  }

  isLeftArrow() {
    return this.keyCode === Keycodes.LEFT;
  }

  isRightArrow() {
    return this.keyCode === Keycodes.RIGHT;
  }

  get direction() {
    switch (true) {
      case this.isDelete():
        return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
      case this.isHorizontalArrow():
        return this.isRightArrow() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
    }
  }

  isSpace() {
    return this.keyCode === Keycodes.SPACE;
  }

  isEnter() {
    return this.keyCode === Keycodes.ENTER;
  }

  isShift() {
    return this.shiftKey;
  }

  hasModifier(modifier) {
    switch (modifier) {
      case MODIFIERS.META:
        return this.metaKey;
      case MODIFIERS.CTRL:
        return this.ctrlKey;
      case MODIFIERS.SHIFT:
        return this.shiftKey;
      default:
        throw new Error(`Cannot check for unknown modifier ${modifier}`);
    }
  }

  hasAnyModifier() {
    return this.metaKey || this.ctrlKey || this.shiftKey;
  }

  get ctrlKey() {
    return this.event.ctrlKey;
  }

  get metaKey() {
    return this.event.metaKey;
  }

  get shiftKey() {
    return this.event.shiftKey;
  }

  isChar(string) {
    return this.keyCode === string.toUpperCase().charCodeAt(0);
  }

  /**
   * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Printable_keys_in_standard_position
   *   and http://stackoverflow.com/a/12467610/137784
   */
  isPrintable() {
    if (this.ctrlKey || this.metaKey) {
      return false;
    }

    const {keyCode:code} = this;

    return (
      (code >= Keycodes['0'] && code <= Keycodes['9']) ||         // number keys
      this.isSpace() ||
      this.isEnter() ||
      (code >= Keycodes.A && code <= Keycodes.Z) ||               // letter keys
      (code >= Keycodes.NUMPAD_0 && code <= Keycodes.NUMPAD_9) || // numpad keys
      (code >= Keycodes[';'] && code <= Keycodes['`']) ||         // punctuation
      (code >= Keycodes['['] && code <= Keycodes['"']) ||
      // FIXME the IME action seems to get lost when we issue an `editor.deleteSelection`
      // before it (in Chrome)
      code === Keycodes.IME
    );
  }
};

export default Key;
