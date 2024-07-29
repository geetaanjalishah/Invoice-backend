const PDFDocument = require('pdfkit');
const { convertNumberToWords } = require('../utils');

const createInvoice = (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      let buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      const getField = (data, key, defaultValue = 'N/A') => data[key] || defaultValue;

      // Header
      doc.fontSize(12).text('Company Logo Placeholder', 50, 50);
      doc.fontSize(20).text('INVOICE', 50, 50, { align: 'right' });
      doc.moveDown(2);

      // Invoice Details
      doc.fontSize(12)
        .text('Invoice No:', 50, doc.y, { continued: true }).text(getField(invoiceData, 'invoiceDetails.invoiceNo'))
        .moveDown(0.5)
        .text('Order No:', 50, doc.y, { continued: true }).text(getField(invoiceData, 'orderDetails.orderNo'))
        .moveDown(0.5)
        .text('Invoice Date:', 50, doc.y, { continued: true }).text(getField(invoiceData, 'invoiceDetails.invoiceDate'))
        .moveDown(0.5)
        .text('Order Date:', 50, doc.y, { continued: true }).text(getField(invoiceData, 'orderDetails.orderDate'));

      doc.moveDown();

      // Create table function
      const drawTable = (title, data) => {
        doc.fontSize(12).text(title, { underline: true }).moveDown();
        const tableTop = doc.y;
        const itemHeight = 20;
        let y = tableTop;

        Object.keys(data).forEach((key, index) => {
          doc.text(key + ':', 50, y, { continued: true }).text(data[key])
            .moveDown(0.5);
          y = doc.y;
        });
      };

      // Seller Details Table
      const sellerData = {
        'Seller': getField(invoiceData, 'sellerDetails.name'),
        'Address': `${getField(invoiceData, 'sellerDetails.address')}, ${getField(invoiceData, 'sellerDetails.city')}, ${getField(invoiceData, 'sellerDetails.state')}, ${getField(invoiceData, 'sellerDetails.pincode')}`,
        'PAN No': getField(invoiceData, 'sellerDetails.pan'),
        'GST Registration No': getField(invoiceData, 'sellerDetails.gst'),
      };

      drawTable('Seller Details', sellerData);

      // Supply Details
      doc.moveDown();
      doc.text('Place of Supply:', 50, doc.y, { continued: true }).text(getField(invoiceData, 'placeOfSupply'));

      doc.moveDown();

      // Billing Details Table
      const billingData = {
        'Billing Name': getField(invoiceData, 'billingDetails.name'),
        'Billing Address': `${getField(invoiceData, 'billingDetails.address')}, ${getField(invoiceData, 'billingDetails.city')}, ${getField(invoiceData, 'billingDetails.state')}, ${getField(invoiceData, 'billingDetails.pincode')}`,
        'Billing State/UT Code': getField(invoiceData, 'billingDetails.stateCode'),
      };

      drawTable('Billing Details', billingData);

      // Shipping Details Table
      const shippingData = {
        'Shipping Name': getField(invoiceData, 'shippingDetails.name'),
        'Shipping Address': `${getField(invoiceData, 'shippingDetails.address')}, ${getField(invoiceData, 'shippingDetails.city')}, ${getField(invoiceData, 'shippingDetails.state')}, ${getField(invoiceData, 'shippingDetails.pincode')}`,
        'Shipping State/UT Code': getField(invoiceData, 'shippingDetails.stateCode'),
      };

      drawTable('Shipping Details', shippingData);

      // Place of Delivery
      doc.moveDown();
      doc.text('Place of Delivery:', 50, doc.y, { continued: true }).text(getField(invoiceData, 'placeOfDelivery'));

      doc.moveDown(2);

      // Items Table Header
      const tableTop = doc.y;
      const itemHeight = 20;
      let y = tableTop;

      doc.fontSize(10)
        .text('Description', 50, y, { width: 120, align: 'left' })
        .text('Unit Price', 170, y, { width: 70, align: 'right' })
        .text('Quantity', 240, y, { width: 70, align: 'right' })
        .text('Discount', 310, y, { width: 70, align: 'right' })
        .text('Net Amount', 380, y, { width: 70, align: 'right' })
        .text('Tax Rate', 450, y, { width: 70, align: 'right' })
        .text('Tax Amount', 520, y, { width: 70, align: 'right' })
        .text('Total Amount', 590, y, { width: 70, align: 'right' });

      doc.moveTo(50, y + 15)
        .lineTo(540, y + 15)
        .stroke();

      y += itemHeight;

      // Items Table Rows
      invoiceData.items.forEach(item => {
        const unitPrice = parseFloat(item.unitPrice);
        const quantity = parseFloat(item.quantity);
        const discount = parseFloat(item.discount);
        const netAmount = (unitPrice * quantity) - discount;
        const taxRate = parseFloat(item.taxRate);
        const taxAmount = netAmount * (taxRate / 100);
        const totalAmount = netAmount + taxAmount;

        doc.text(item.description || 'N/A', 50, y, { width: 120, align: 'left' })
          .text(unitPrice.toFixed(2), 170, y, { width: 70, align: 'right' })
          .text(quantity.toFixed(2), 240, y, { width: 70, align: 'right' })
          .text(discount.toFixed(2), 310, y, { width: 70, align: 'right' })
          .text(netAmount.toFixed(2), 380, y, { width: 70, align: 'right' })
          .text(`${taxRate}%`, 450, y, { width: 70, align: 'right' })
          .text(taxAmount.toFixed(2), 520, y, { width: 70, align: 'right' })
          .text(totalAmount.toFixed(2), 590, y, { width: 70, align: 'right' });

        doc.moveTo(50, y + 15)
          .lineTo(540, y + 15)
          .stroke();

        y += itemHeight;
      });

      // Total Amounts
      const totalAmount = invoiceData.items.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice);
        const quantity = parseFloat(item.quantity);
        const discount = parseFloat(item.discount);
        return acc + (unitPrice * quantity - discount);
      }, 0);

      const totalTax = invoiceData.items.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice);
        const quantity = parseFloat(item.quantity);
        const discount = parseFloat(item.discount);
        const netAmount = unitPrice * quantity - discount;
        return acc + (netAmount * (parseFloat(item.taxRate) / 100));
      }, 0);

      const totalInvoiceAmount = totalAmount + totalTax;

      y += 20;
      doc.fontSize(12)
        .text('Total:', 50, y, { continued: true }).text(totalInvoiceAmount.toFixed(2))
        .text('Amount in words:', 50, y + 20, { continued: true }).text(convertNumberToWords(totalInvoiceAmount) || 'N/A');

      // Placeholder for Signature
      y += 60;
      doc.text('For:', 50, y, { continued: true }).text('<Insert Your Company Name>')
        .moveDown(5)
        .text('Authorised Signatory', 50, y + 60);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createInvoice };
