// @flow
import { Block } from 'slate';

import Options from '../options';
import {
    getPreviousItem,
    getCurrentItem,
    getListForItem,
    isList,
    getItemDepth
} from '../utils';

/**
 * Increase the depth of the current item by putting it in a sub-list
 * of previous item.
 * For first items in a list, does nothing.
 */
function increaseItemDepth(opts, change) {
    debugger
    const previousItem = getPreviousItem(opts, change.value);
    const currentItem = getCurrentItem(opts, change.value);

    if (!previousItem) {
        return change;
    }

    if (!currentItem) {
        return change;
    }

    const depth = getItemDepth(opts, change.value);
    if (depth === 3) {
        return change;
    }

    // Move the item in the sublist of previous item
    return moveAsSubItem(opts, change, currentItem, previousItem.key);
}

/**
 * Move the given item to the sublist at the end of destination item,
 * creating a sublist if needed.
 */
function moveAsSubItem(
    opts,
    change,
    // The list item to add
    item,
    // The key of the destination node
    destKey
) {
    const destination = change.value.document.getDescendant(destKey);
    const lastIndex = destination.nodes.size;
    const lastChild = destination.nodes.last();

    // The potential existing last child list
    const existingList = isList(opts, lastChild) ? lastChild : null;

    if (existingList) {
        return change.moveNodeByKey(
            item.key,
            existingList.key,
            existingList.nodes.size // as last item
        );
    }
    const currentList = getListForItem(opts, change.value, destination);
    if (!currentList) {
        throw new Error('Destination is not in a list');
    }

    const newSublist = Block.create({
        object: 'block',
        type: currentList.type,
        data: currentList.data
    });

    change.insertNodeByKey(destKey, lastIndex, newSublist, {
        normalize: false
    });

    return change.moveNodeByKey(item.key, newSublist.key, 0);
}

export default increaseItemDepth;
