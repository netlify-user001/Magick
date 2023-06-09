// DOCUMENTED 
import Act from './action';
import {
  AddConnectionAction,
  RemoveConnectionAction,
} from './actions/connection';
import { AddNodeAction, DragNodeAction, RemoveNodeAction } from './actions/node';
import History from './history';

/**
 * Tracks node events and adds corresponding actions to history
 * @param {object} editor - The editor instance
 * @param {History} history - The history instance
 */
function trackNodes(editor, history) {
  editor.on('nodecreated', (node) => history.add(new AddNodeAction(editor, node)));
  editor.on('noderemoved', (node) =>history.add(new RemoveNodeAction(editor, node)));
  editor.on('nodetranslated', ({ node, prev }) => {
    if (history.last instanceof DragNodeAction && history.last.node === node) {
      history.last.update(node);
    } else {
      history.add(new DragNodeAction(editor, node, prev));
    }
  });
}

/**
 * Tracks connection events and adds corresponding actions to history
 * @param {object} editor - The editor instance
 * @param {History} history - The history instance
 */
function trackConnections(editor, history) {
  editor.on('connectioncreated', (c) => history.add(new AddConnectionAction(editor, c)));
  editor.on('connectionremoved', (c) => history.add(new RemoveConnectionAction(editor, c)));
}

/**
 * Installs the history plugin on the editor
 * @param {object} editor - The editor instance
 * @param {{keyboard: boolean}} options - Configuration options for the plugin
 */
function install(editor, {keyboard = true}) {
  editor.bind('undo');
  editor.bind('redo');
  editor.bind('addhistory');

  const history = new History();

  editor.on('undo', () => history.undo());
  editor.on('redo', () => history.redo());
  editor.on('addhistory', (action) => history.add(action));
  editor.on('clear', () => {
    history.clear();
  });

  if (keyboard) {
    document.addEventListener('keydown', (e) => {
      if (!e.ctrlKey) return;
      switch (e.code) {
        case 'KeyZ':
          editor.trigger('undo');
          break;
        case 'KeyY':
          editor.trigger('redo');
          break;
        default:
      }
    });
  }

  trackNodes(editor, history);
  trackConnections(editor, history);
}

export const Action = Act;

const defaultExport = {
  name: 'history',
  install,
};

export default defaultExport;