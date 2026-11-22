var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function characterize(order, expectedInvoice, expectedCheckout) {
  var billed = pricing.computeTotals(order.items, order.coupon);
  var printed = invoice.computeInvoiceFigures(order);
  var { lines, taxable, ...checkoutFigures } = billed;

  assert.deepEqual(printed, expectedInvoice, 'printable invoice figures');
  assert.deepEqual(checkoutFigures, expectedCheckout, 'checkout figures');
}

test('#1001 uses the 5% and 12% HSN slabs', function () {
  // Order lines with HSN codes and no saved gstRate exercise HSN lookup.
  characterize({
    id: 1001,
    coupon: '',
    items: [
      { name: 'Rice', sku: 'RICE', price: 200, qty: 2, hsn: '1006' },
      { name: 'Ghee', sku: 'GHEE', price: 200, qty: 1, hsn: '0405' }
    ]
  }, {
    subtotal: 600, discount: 0, tax: 44, cgst: 22, sgst: 22, total: 644,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 2, price: 200, gstPercent: 5, line: 400, lineTax: 20 },
      { name: 'Ghee', sku: 'GHEE', hsn: '0405', qty: 1, price: 200, gstPercent: 12, line: 200, lineTax: 24 }
    ]
  }, {
    subtotal: 600, discount: 0, tax: 44, cgst: 22, sgst: 22, total: 644
  });
});

test('#1002 applies SAVE10 before GST', function () {
  characterize({
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { name: 'Tea', sku: 'TEA', price: 300, qty: 2, hsn: '0902', gstRate: 18 }
    ]
  }, {
    subtotal: 600, discount: 60, tax: 97.2, cgst: 48.6, sgst: 48.6, total: 637.2,
    rows: [
      { name: 'Tea', sku: 'TEA', hsn: '0902', qty: 2, price: 300, gstPercent: 18, line: 600, lineTax: 97.2 }
    ]
  }, {
    subtotal: 600, discount: 60, tax: 97.2, cgst: 48.6, sgst: 48.6, total: 637.2
  });
});

test('#1004 applies the ₹150 SAVE10 cap on ₹2,240', function () {
  characterize({
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { name: 'Coffee', sku: 'COFFEE', price: 560, qty: 4, hsn: '0901' }
    ]
  }, {
    subtotal: 2240, discount: 150, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2,
    rows: [
      { name: 'Coffee', sku: 'COFFEE', hsn: '0901', qty: 4, price: 560, gstPercent: 18, line: 2240, lineTax: 376.2 }
    ]
  }, {
    subtotal: 2240, discount: 150, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2
  });
});

test('#1008 matches checkout for 18% lines without a coupon', function () {
  characterize({
    id: 1008,
    coupon: '',
    items: [
      { name: 'Tea', sku: 'TEA', price: 100, qty: 2, hsn: '0902' },
      { name: 'Syrup', sku: 'SYRUP', price: 150, qty: 1, hsn: '2106', gstRate: 18 }
    ]
  }, {
    subtotal: 350, discount: 0, tax: 63, cgst: 31.5, sgst: 31.5, total: 413,
    rows: [
      { name: 'Tea', sku: 'TEA', hsn: '0902', qty: 2, price: 100, gstPercent: 18, line: 200, lineTax: 36 },
      { name: 'Syrup', sku: 'SYRUP', hsn: '2106', qty: 1, price: 150, gstPercent: 18, line: 150, lineTax: 27 }
    ]
  }, {
    subtotal: 350, discount: 0, tax: 63, cgst: 31.5, sgst: 31.5, total: 413
  });
});

test('invoice matches checkout GST by HSN after applying the capped SAVE10 discount', function () {
  characterize({
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut oil', sku: 'OIL', price: 560, qty: 2, hsn: '1508' },
      { name: 'Ghee', sku: 'GHEE', price: 1120, qty: 1, hsn: '0405' }
    ]
  }, {
    subtotal: 2240, discount: 150, tax: 177.65, cgst: 88.83, sgst: 88.82, total: 2267.65,
    rows: [
      { name: 'Groundnut oil', sku: 'OIL', hsn: '1508', qty: 2, price: 560, gstPercent: 5, line: 1120, lineTax: 52.25 },
      { name: 'Ghee', sku: 'GHEE', hsn: '0405', qty: 1, price: 1120, gstPercent: 12, line: 1120, lineTax: 125.4 }
    ]
  }, {
    subtotal: 2240, discount: 150, tax: 177.65, cgst: 88.83, sgst: 88.82, total: 2267.65
  });
});
