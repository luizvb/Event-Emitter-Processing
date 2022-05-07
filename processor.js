const { EventEmitter } = require ('events')
const stock = require('./stock-list.json')
class OrderProcessor extends EventEmitter{

    _processingFailure(order, reason) {
        this.emit('PROCESSING_FAILED', {
            orderNumber: order.orderNumber,
            reason,
            itemId: 0
        });
    }

    _validations(order) {
        if (order.orderNumber === undefined) {
            this._processingFailure(order, 'OrderNumber is required');
            return false
        }
        if (!order.lineItems.length) {
            this._processingFailure(order, 'LINEITEMS_EMPTY');
            return false
        }
        for (let lineItem of order.lineItems) {
            const [data] = stock.filter((item) => item.id === lineItem.itemId)

            if (lineItem.quantity > data.stock) {
                this._processingFailure(order, 'INSUFFICIENT_STOCK');
                return false
            }
        }
        return true
    }

    placeOrder(order) {
        this.emit('PROCESSING_STARTED', order.orderNumber);
        if (!this._validations(order)) return

        this.emit('PROCESSING_SUCCESS', order.orderNumber);
    }
}

module.exports = OrderProcessor;