#!/usr/bin/env python3
import argparse
import csv
import json
import random
import string
import os
from datetime import datetime
from io import BytesIO, StringIO
import tempfile
import xml.etree.ElementTree as ET

from barcode import Code128
from barcode.writer import SVGWriter
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg


class BarcodeGenerator:
    def __init__(self, template_file='templates.json', csv_file='barcodes.csv'):
        self.template_file = template_file
        self.csv_file = csv_file
        self.existing_barcodes = self._load_existing_barcodes()
        self.templates = self._load_templates()

    def _load_existing_barcodes(self):
        """Load existing barcode values from CSV file."""
        existing = set()
        if os.path.exists(self.csv_file):
            with open(self.csv_file, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    existing.add(row['barcode'])
        return existing

    def _save_barcode_to_csv(self, barcode_value):
        """Save a new barcode value to the CSV file."""
        file_exists = os.path.exists(self.csv_file)
        with open(self.csv_file, 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['barcode'])
            if not file_exists:
                writer.writeheader()
            writer.writerow({'barcode': barcode_value})
        self.existing_barcodes.add(barcode_value)

    def _load_templates(self):
        """Load label templates from JSON file."""
        with open(self.template_file, 'r') as f:
            return json.load(f)

    def generate_unique_barcode(self, prefix, digits):
        """Generate a unique barcode value with given prefix and number of digits."""
        max_attempts = 10000
        for _ in range(max_attempts):
            number = ''.join(random.choices(string.digits, k=digits))
            barcode_value = f"{prefix}{number}"
            if barcode_value not in self.existing_barcodes:
                return barcode_value
        raise ValueError(f"Could not generate unique barcode after {max_attempts} attempts")

    def create_barcode_svg(self, value, width_points, height_points, use_full_width=True):
        """Create a barcode SVG with the specified dimensions."""
        # Create barcode with SVG writer
        writer = SVGWriter()
        
        # Configure writer settings (SVGWriter uses millimeters)
        # Convert points to mm: 1 point = 0.352778 mm
        height_mm = height_points * 0.352778
        width_mm = width_points * 0.352778
        
        # Fixed barcode height: 0.15 inches = 3.81 mm (reduced from 0.25)
        barcode_height_mm = 3.81
        writer.module_height = barcode_height_mm  # Fixed height of 0.15 inches
        writer.font_size = 6  # Even smaller font size for human readable text
        writer.text_distance = 0.5  # Very close distance between barcode and text in mm
        writer.quiet_zone = 0.5  # Very minimal quiet zone for maximum width in mm
        code = Code128(value, writer=writer)
        
        # Generate SVG to temporary file with unique name
        with tempfile.NamedTemporaryFile(mode='wb', suffix=f'_{value}.svg', delete=False) as tmp:
            # Write with explicit text parameter to ensure we control the text
            code.write(tmp, options={'text': value, 'write_text': True})
            tmp_path = tmp.name
        
        # Read and parse the SVG to modify it
        tree = ET.parse(tmp_path)
        root = tree.getroot()
        
        # Get the original SVG dimensions
        svg_width = float(root.get('width').replace('mm', ''))
        svg_height = float(root.get('height').replace('mm', ''))
        
        # Register namespace to handle SVG properly
        ET.register_namespace('', 'http://www.w3.org/2000/svg')
        
        if use_full_width:
            # Calculate how much to stretch horizontally for full width
            stretch_factor = (width_mm / svg_width)
            
            # Update SVG dimensions to full width
            root.set('width', f'{width_mm}mm')
            
            # Process all rect elements (barcode bars) - stretch them horizontally
            for rect in root.iter('{http://www.w3.org/2000/svg}rect'):
                if rect.get('style') and 'fill:black' in rect.get('style'):
                    # This is a barcode bar
                    x_str = rect.get('x', '0')
                    if 'mm' in x_str:
                        x = float(x_str.replace('mm', ''))
                        width = float(rect.get('width').replace('mm', ''))
                        
                        # Stretch the position and width
                        rect.set('x', f'{x * stretch_factor}mm')
                        rect.set('width', f'{width * stretch_factor}mm')
                        
                        # Force the height to our desired barcode height
                        rect.set('height', f'{barcode_height_mm}mm')
            
            # Center text in the full width
            text_x_pos = width_mm / 2
        else:
            # Keep original width for normal-width barcodes
            # Just fix the barcode height
            for rect in root.iter('{http://www.w3.org/2000/svg}rect'):
                if rect.get('style') and 'fill:black' in rect.get('style'):
                    # Force the height to our desired barcode height
                    rect.set('height', f'{barcode_height_mm}mm')
            
            # Keep text in original position (already centered)
            text_x_pos = svg_width / 2
        
        # Also update height to accommodate our smaller barcode and repositioned text
        new_svg_height = barcode_height_mm + 6  # barcode height + small space for text
        root.set('height', f'{new_svg_height}mm')
        
        # Process text elements - position and style them
        for text in root.iter('{http://www.w3.org/2000/svg}text'):
            # Get original position
            x_str = text.get('x', '')
            y_str = text.get('y', '')
            if 'mm' in x_str:
                # Center the text horizontally 
                text.set('x', f'{text_x_pos}mm')
                
                # Position text right under the barcode
                if 'mm' in y_str:
                    text_y = barcode_height_mm + 3.5  # Barcode height + small gap
                    text.set('y', f'{text_y}mm')
                
                # Replace font with Courier and make it smaller
                style = text.get('style', '')
                # Remove existing font-family and font-size
                style_parts = [p for p in style.split(';') if p and 'font-family' not in p and 'font-size' not in p]
                style_parts.append('font-family:Courier,Courier New,monospace')
                style_parts.append('font-size:5pt')  # Even smaller
                text.set('style', ';'.join(style_parts))
        
        # Save modified SVG
        with tempfile.NamedTemporaryFile(mode='wb', suffix=f'_modified_{value}.svg', delete=False) as tmp2:
            tree.write(tmp2, encoding='utf-8', xml_declaration=True)
            modified_path = tmp2.name
        
        # Convert modified SVG to ReportLab drawing
        drawing = svg2rlg(modified_path)
        
        # Clean up temp files
        os.unlink(tmp_path)
        os.unlink(modified_path)
        
        return drawing

    def generate_labels(self, template_name, prefix, digits, count, output_file=None, show_border=False, normal_width=False):
        """Generate a PDF with barcode labels."""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' not found")
        
        template = self.templates[template_name]
        
        # Convert dimensions to points (1 inch = 72 points)
        label_width = template['label']['width'] * 72
        label_height = template['label']['height'] * 72
        margin_top = template['margins']['top'] * 72
        margin_left = template['margins']['left'] * 72
        h_spacing = template['spacing']['horizontal'] * 72
        v_spacing = template['spacing']['vertical'] * 72
        
        # Barcode dimensions (50% of label height as specified)
        barcode_height = label_height * template['barcode']['height_ratio']
        barcode_width = label_width  # Use full label width
        
        # Create output filename if not provided
        if output_file is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"output/labels_{template_name}_{timestamp}.pdf"
        
        # Create PDF
        c = canvas.Canvas(output_file, pagesize=letter)
        page_width, page_height = letter
        
        # Generate barcodes and place them on labels
        labels_per_page = template['layout']['rows'] * template['layout']['columns']
        current_label = 0
        
        for i in range(count):
            # Generate unique barcode
            barcode_value = self.generate_unique_barcode(prefix, digits)
            self._save_barcode_to_csv(barcode_value)
            
            # Calculate position on page
            page_num = current_label // labels_per_page
            label_on_page = current_label % labels_per_page
            row = label_on_page // template['layout']['columns']
            col = label_on_page % template['layout']['columns']
            
            # Start new page if needed
            if label_on_page == 0 and page_num > 0:
                c.showPage()
            
            # Calculate label position
            x = margin_left + col * (label_width + h_spacing)
            y = page_height - margin_top - (row + 1) * label_height - row * v_spacing
            
            # Create barcode SVG drawing
            barcode_drawing = self.create_barcode_svg(
                barcode_value,
                barcode_width,
                barcode_height,
                use_full_width=not normal_width  # Invert normal_width to get use_full_width
            )
            
            if barcode_drawing:
                # Position barcode on label
                # Center horizontally
                drawing_x = x + (label_width - barcode_drawing.width) / 2
                # Position at top of label with some padding
                # SVG y-coordinate is from bottom, so we need to position near the top
                drawing_y = y + label_height - barcode_drawing.height - 5  # 5 points padding from top
                
                # Render SVG drawing to PDF canvas
                renderPDF.draw(barcode_drawing, c, drawing_x, drawing_y)
            
            # Draw border if requested
            if show_border:
                c.setStrokeColorRGB(0.5, 0.5, 0.5)  # Grey color
                c.setLineWidth(0.5)  # 0.5 point line width
                
                # Draw complete rectangle border for each label
                # This ensures all borders are visible
                c.rect(x, y, label_width, label_height, fill=0, stroke=1)
            
            current_label += 1
        
        # Save PDF
        c.save()
        
        return output_file, count


def main():
    parser = argparse.ArgumentParser(description='Generate barcode labels for printing')
    parser.add_argument('--template', type=str, default='avery5160',
                       help='Label template name (default: avery5160)')
    parser.add_argument('--prefix', type=str, default='A',
                       help='Prefix for barcode values (default: A)')
    parser.add_argument('--digits', type=int, default=4,
                       help='Number of digits in barcode (default: 4)')
    parser.add_argument('--count', type=int, default=30,
                       help='Number of labels to generate (default: 30)')
    parser.add_argument('--output', type=str, default=None,
                       help='Output PDF filename (default: auto-generated)')
    parser.add_argument('--list-templates', action='store_true',
                       help='List available templates')
    parser.add_argument('--border', action='store_true',
                       help='Add thin grey border around each label')
    parser.add_argument('--normal-width', action='store_true',
                       help='Use normal barcode width instead of full label width')
    
    args = parser.parse_args()
    
    generator = BarcodeGenerator()
    
    if args.list_templates:
        print("\nAvailable templates:")
        for name, template in generator.templates.items():
            print(f"  {name}: {template['name']} - {template['description']}")
        return
    
    try:
        output_file, count = generator.generate_labels(
            args.template,
            args.prefix,
            args.digits,
            args.count,
            args.output,
            args.border,
            args.normal_width
        )
        print(f"\nSuccessfully generated {count} labels")
        print(f"Output saved to: {output_file}")
        print(f"Barcode format: {args.prefix}{'X' * args.digits} (e.g., {args.prefix}{'1234'[:args.digits]})")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == '__main__':
    main()