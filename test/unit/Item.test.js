const { assert } = require('chai');
const Item = require('../../lib/models/Item');
const { getErrors } = require('./helpers');

describe('Item model', () => {

    it('is a good, valid model', () => {
        const info = {
            itemName: 'walnut',
            itemStory: 'You pick up a walnut.'
        };

        const item = new Item(info);
        info._id = item._id;
        assert.deepEqual(item.toJSON(), info);
        assert.isUndefined(item.validateSync());
    });

    it('has required fields', () => {
        const invalidItem = new Item({});
        const errors = getErrors(invalidItem.validateSync(), 2);
        assert.strictEqual(errors.itemName.kind, 'required');
        assert.strictEqual(errors.itemStory.kind, 'required');
    });

});