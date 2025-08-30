# Astronyvia Invoice Generator

A professional, modern invoice generator for your company website with beautiful UI and comprehensive functionality.

## Features

✨ **Professional Design**
- Modern, responsive interface
- Company branding integration
- Beautiful gradient backgrounds
- Professional typography

📝 **Complete Invoice Management**
- Company information setup
- Client details management
- Multiple service items
- Automatic calculations
- Tax rate support
- Notes and terms section

🖨️ **Multiple Output Options**
- Live preview
- PDF generation
- Print functionality
- Professional invoice layout

💾 **Smart Features**
- Auto-save form data
- Form validation
- Keyboard shortcuts
- Responsive design
- Auto-calculations

## Quick Start

1. **Open the application**
   - Simply open `index.html` in your web browser
   - No server setup required - works locally!

2. **Fill in company information**
   - Company name (pre-filled with "Astronyvia")
   - Website (pre-filled with "astronyvia.com")
   - Address, phone, and email

3. **Add client details**
   - Client name and contact information
   - Billing address

4. **Add services**
   - Click "Add Service" to add multiple items
   - Description, quantity, and rate
   - Automatic amount calculation

5. **Generate invoice**
   - Preview before generating
   - Download as PDF
   - Print directly

## File Structure

```
invoice/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── asset/              # Company assets
│   ├── Astronyvia removebg.png
│   └── Astronyvia .png
└── README.md           # This file
```

## Usage Guide

### Creating an Invoice

1. **Company Section**
   - Fill in your company details
   - All fields are optional except company name and website
   - Information is automatically saved

2. **Client Section**
   - Enter client name (required)
   - Add contact information and address
   - Client details are saved for future use

3. **Services Section**
   - Add service descriptions
   - Set quantities and rates
   - Amounts are calculated automatically
   - Add/remove services as needed

4. **Summary**
   - Subtotal is calculated automatically
   - Set tax rate if applicable
   - Total includes tax calculation

5. **Notes**
   - Add any additional terms or notes
   - Professional invoice footer

### Generating Output

- **Preview**: Click "Preview Invoice" to see the final result
- **PDF**: Click "Generate PDF" to download as PDF file
- **Print**: Click "Print Invoice" to print directly

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Preview invoice
- `Ctrl/Cmd + P`: Print invoice
- `Ctrl/Cmd + S`: Save form data

## Customization

### Company Branding
- Update company logo in the `asset/` folder
- Modify company colors in `styles.css`
- Change company name and details in the form

### Styling
- Colors are defined in CSS variables
- Fonts can be changed in the CSS
- Layout is fully responsive

### Functionality
- Add new fields in the HTML
- Modify calculations in JavaScript
- Customize PDF generation settings

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Dependencies

The application uses these external libraries (loaded via CDN):
- **Font Awesome**: Icons
- **Inter Font**: Typography
- **jsPDF**: PDF generation
- **html2canvas**: HTML to image conversion

## Technical Details

### PDF Generation
- Uses jsPDF library for PDF creation
- High-quality output with proper scaling
- Automatic page breaks for long invoices

### Data Persistence
- Form data is saved to localStorage
- Automatic saving on input changes
- Data persists between browser sessions

### Responsive Design
- Mobile-first approach
- Grid-based layouts
- Flexible form arrangements

## Troubleshooting

### Common Issues

1. **PDF not generating**
   - Ensure all required fields are filled
   - Check browser console for errors
   - Try refreshing the page

2. **Print not working**
   - Use the print button instead of browser print
   - Ensure invoice preview is visible
   - Check print settings

3. **Styling issues**
   - Clear browser cache
   - Check if CSS file is loaded
   - Verify file paths

### Performance Tips

- Close other browser tabs for large invoices
- Use modern browsers for best performance
- Clear browser cache if experiencing issues

## Support

For technical support or customization requests:
- Check the browser console for error messages
- Verify all files are in the correct locations
- Ensure proper file permissions

## License

This invoice generator is provided as-is for business use. Feel free to modify and customize for your needs.

---

**Astronyvia** - Professional Invoice Solutions
Website: astronyvia.com
