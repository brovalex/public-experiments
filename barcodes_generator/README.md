# Barcode Label Generator

A Python script for generating printable barcode labels in PDF format. Creates Code 128 barcodes optimized for scanning with phone cameras and Odoo web applications.

## Features

- **Vector-based barcodes**: High-quality Code 128 barcodes that scale perfectly for printing
- **Full-width design**: Barcodes stretch to fill the entire label width for maximum scanning area
- **Duplicate prevention**: Automatically tracks used barcode values to prevent duplicates
- **Template system**: Support for different label layouts (Avery 5160, 5163, etc.)
- **Customizable prefixes**: Configure letter prefixes and number of digits
- **Optional borders**: Add thin grey borders around labels for cutting guides
- **Phone camera optimized**: Code 128 format works excellently with mobile barcode scanners

## Requirements

- Python 3.7+
- Virtual environment (recommended)

## Installation

1. Clone or download this repository
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start

Generate 30 labels with prefix "A" and 4 digits:
```bash
python generate_labels.py --prefix A --digits 4 --count 30
```

## Usage

### Basic Command Format
```bash
python generate_labels.py [OPTIONS]
```

### Command Line Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--template` | string | `avery5160` | Label template name |
| `--prefix` | string | `A` | Letter prefix for barcode values |
| `--digits` | integer | `4` | Number of digits in barcode |
| `--count` | integer | `30` | Number of labels to generate |
| `--output` | string | auto-generated | Output PDF filename |
| `--border` | flag | disabled | Add thin grey border around each label |
| `--list-templates` | flag | disabled | List available templates and exit |

### Examples

**Note:** Make sure to activate the virtual environment before running any commands:
```
source .venv/bin/activate  # On Unix/macOS
```

**Basic usage:**
```bash
python generate_labels.py --prefix SKU --digits 5 --count 50
```
Generates 50 labels with format: SKU12345, SKU67890, etc.

**With borders for cutting guides:**
```bash
python generate_labels.py --prefix ITEM --digits 6 --count 100 --border
```

**Using different template:**
```bash
python generate_labels.py --template avery5163 --prefix P --digits 3 --count 20
```

**Custom output filename:**
```bash
python generate_labels.py --prefix INV --digits 4 --count 60 --output inventory_labels.pdf
```

**List available templates:**
```bash
python generate_labels.py --list-templates
```

## Templates

### Available Templates

- **avery5160**: 30 labels per sheet (3×10 layout), 1" × 2-5/8" labels
- **avery5163**: 10 labels per sheet (2×5 layout), 2" × 4" labels

### Template Configuration

Templates are defined in `templates.json`. Each template includes:
- Page dimensions and margins
- Label size and spacing
- Layout (rows and columns)
- Barcode positioning settings

## Barcode Management

### CSV Database
All generated barcode values are stored in `barcodes.csv` to prevent duplicates. The file format is:
```csv
barcode
A1234
A5678
SKU12345
```

### Managing Barcodes
- **View used barcodes**: Open `barcodes.csv` in any spreadsheet application
- **Remove old barcodes**: Delete rows from the CSV file
- **Add external barcodes**: Add values created outside the script to prevent conflicts

## Output

### File Location
Generated PDFs are saved in the `output/` directory with auto-generated filenames:
```
output/labels_avery5160_20231015_143022.pdf
```

### Label Layout
Each label contains:
- **Barcode**: Code 128 format, 0.15" height, full width
- **Human-readable text**: Courier monospace font, positioned directly under barcode
- **Text content**: Only the barcode value (e.g., "A1234"), no prefixes or suffixes

## Barcode Specifications

- **Format**: Code 128 (optimal for phone camera scanning)
- **Height**: 0.15 inches (3.81mm)
- **Width**: Full label width with minimal margins
- **Text**: 5pt Courier monospace font
- **Encoding**: Supports alphanumeric characters

## Troubleshooting

### Common Issues

**Virtual environment not activated:**
```bash
# Make sure you see (.venv) in your terminal prompt
source .venv/bin/activate
```

**Dependencies not installed:**
```bash
pip install -r requirements.txt
```

**Permission errors:**
- Ensure the `output/` directory exists and is writable
- Close any PDF files that might be open

**Barcode scanning issues:**
- Ensure sufficient lighting when scanning
- Code 128 format is widely supported by scanner apps
- Try different scanner apps if one doesn't work

### File Structure
```
barcodes_generator/
├── generate_labels.py      # Main script
├── templates.json          # Label template definitions
├── barcodes.csv           # Barcode database
├── requirements.txt       # Python dependencies
├── output/               # Generated PDF files
├── .venv/               # Virtual environment
└── README.md           # This file
```

## Customization

### Adding New Templates
Edit `templates.json` to add custom label sizes. Required fields:
- Page dimensions and margins
- Label dimensions and spacing
- Layout configuration

### Modifying Barcode Appearance
Edit the barcode settings in `create_barcode_svg()` method:
- `barcode_height_mm`: Height in millimeters
- `writer.font_size`: Text size
- `writer.text_distance`: Gap between barcode and text

## Technical Details

- **PDF Generation**: ReportLab library for vector graphics
- **Barcode Creation**: python-barcode library with SVG output
- **Font**: Courier monospace for human-readable text
- **Vector Graphics**: All elements are vector-based for perfect scaling

## License

This project is provided as-is for personal and commercial use.