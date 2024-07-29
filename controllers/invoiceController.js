const { createInvoice: generateInvoicePDF } = require('../services/invoiceService');

const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).send({ error: 'Failed to generate invoice PDF' });
  }
};

module.exports = {
  createInvoice,
};
