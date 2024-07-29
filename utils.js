const convertNumberToWords = (num) => {
    if (num === 0) return 'Zero';
  
    const belowTwenty = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const aboveThousand = ['Thousand', 'Million', 'Billion', 'Trillion'];
  
    const numberToWords = (n) => {
      if (n < 20) return belowTwenty[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + belowTwenty[n % 10] : '');
      if (n < 1000) return belowTwenty[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numberToWords(n % 100) : '');
      for (let i = 0, j = 1000; i < aboveThousand.length; i++, j *= 1000) {
        if (n < j * 1000) return numberToWords(Math.floor(n / j)) + ' ' + aboveThousand[i] + (n % j !== 0 ? ' ' + numberToWords(n % j) : '');
      }
    };
  
    return numberToWords(num);
  };
  
  module.exports = {
    convertNumberToWords,
  };
  