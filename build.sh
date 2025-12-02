#!/bin/bash

# Build script for Chrome Extension
# This script copies files from src/main to src/compressed, minifies them, and creates a versioned zip file

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src/main"
COMPRESSED_DIR="$SCRIPT_DIR/src/compressed"
VERSIONS_DIR="$SCRIPT_DIR/src/versions"
MANIFEST_PATH="$SRC_DIR/manifest.json"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required commands are available
check_dependencies() {
    local missing_deps=()

    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi

    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_error "Please install them and try again."
        exit 1
    fi
}

# Minify JavaScript file
minify_js() {
    local input_file="$1"
    local output_file="$2"

    if npx -y terser "$input_file" -o "$output_file" -c -m --comments false 2>/dev/null; then
        print_success "Minified JS: $(basename "$input_file")"
    else
        print_warning "Failed to minify $input_file, copying original"
        cp "$input_file" "$output_file"
    fi
}

# Minify CSS file
minify_css() {
    local input_file="$1"
    local output_file="$2"

    if npx -y csso-cli "$input_file" -o "$output_file" 2>/dev/null; then
        print_success "Minified CSS: $(basename "$input_file")"
    else
        print_warning "Failed to minify $input_file, copying original"
        cp "$input_file" "$output_file"
    fi
}

# Minify HTML file
minify_html() {
    local input_file="$1"
    local output_file="$2"

    if npx -y html-minifier-terser \
        --collapse-whitespace \
        --remove-comments \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-style-link-type-attributes \
        --use-short-doctype \
        --minify-css true \
        --minify-js true \
        "$input_file" -o "$output_file" 2>/dev/null; then
        print_success "Minified HTML: $(basename "$input_file")"
    else
        print_warning "Failed to minify $input_file, copying original"
        cp "$input_file" "$output_file"
    fi
}

# Minify JSON file
minify_json() {
    local input_file="$1"
    local output_file="$2"

    if command -v jq &> /dev/null; then
        jq -c . "$input_file" > "$output_file"
        print_success "Minified JSON: $(basename "$input_file")"
    else
        # Fallback: use node to minify JSON
        node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('$input_file', 'utf8'))))" > "$output_file"
        print_success "Minified JSON: $(basename "$input_file")"
    fi
}

# Copy file (for binary files and other non-minifiable files)
copy_file() {
    local input_file="$1"
    local output_file="$2"

    cp "$input_file" "$output_file"
    print_success "Copied: $(basename "$input_file")"
}

# Process a single file
process_file() {
    local input_file="$1"
    local relative_path="$2"
    local output_file="$COMPRESSED_DIR/$relative_path"

    # Create output directory if it doesn't exist
    mkdir -p "$(dirname "$output_file")"

    # Get file extension
    local ext="${input_file##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # Process based on file type
    case "$ext" in
        js)
            minify_js "$input_file" "$output_file"
            ;;
        css)
            minify_css "$input_file" "$output_file"
            ;;
        html)
            minify_html "$input_file" "$output_file"
            ;;
        json)
            minify_json "$input_file" "$output_file"
            ;;
        *)
            # Copy all other files (images, SVGs, etc.)
            copy_file "$input_file" "$output_file"
            ;;
    esac
}

# Process all files recursively
process_directory() {
    local dir="$1"

    while IFS= read -r -d '' file; do
        local relative_path="${file#$SRC_DIR/}"
        process_file "$file" "$relative_path"
    done < <(find "$dir" -type f -print0)
}

# Main build function
main() {
    echo ""
    print_status "🚀 Starting build process..."
    echo ""

    # Check dependencies
    print_status "Checking dependencies..."
    check_dependencies
    print_success "All dependencies are installed"
    echo ""

    # Check if manifest.json exists
    if [ ! -f "$MANIFEST_PATH" ]; then
        print_error "manifest.json not found at $MANIFEST_PATH"
        exit 1
    fi

    # Read version from manifest.json
    VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$MANIFEST_PATH', 'utf8')).version)")
    print_status "📦 Building version: $VERSION"
    echo ""

    # Clean up compressed directory if it exists
    if [ -d "$COMPRESSED_DIR" ]; then
        print_status "🧹 Cleaning up old compressed directory..."
        rm -rf "$COMPRESSED_DIR"
    fi

    # Create fresh compressed directory
    mkdir -p "$COMPRESSED_DIR"
    print_success "📁 Created compressed directory"
    echo ""

    # Process all files
    print_status "⚙️  Processing files..."
    echo ""
    process_directory "$SRC_DIR"
    echo ""

    # Create versions directory if it doesn't exist
    mkdir -p "$VERSIONS_DIR"

    # Create zip archive
    print_status "📦 Creating zip archive..."
    ZIP_FILE="$VERSIONS_DIR/$VERSION.zip"

    # Remove old zip if it exists
    [ -f "$ZIP_FILE" ] && rm "$ZIP_FILE"

    # Convert paths to Windows format for PowerShell
    WIN_COMPRESSED_DIR=$(wslpath -w "$COMPRESSED_DIR")
    WIN_ZIP_FILE=$(wslpath -w "$ZIP_FILE")

    # Create zip using PowerShell (available on WSL)
    if command -v powershell.exe &> /dev/null; then
        powershell.exe -Command "Compress-Archive -Path '$WIN_COMPRESSED_DIR\\*' -DestinationPath '$WIN_ZIP_FILE' -CompressionLevel Optimal" > /dev/null 2>&1
    else
        print_error "PowerShell not found. Please install zip utility or run on Windows."
        exit 1
    fi

    # Verify zip was created and get size
    if [ -f "$ZIP_FILE" ]; then
        if command -v du &> /dev/null; then
            ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
            print_success "Created $VERSION.zip ($ZIP_SIZE)"
        else
            print_success "Created $VERSION.zip"
        fi
    else
        print_error "Failed to create zip file"
        exit 1
    fi
    echo ""

    # Clean up compressed directory
    print_status "🧹 Cleaning up temporary files..."
    rm -rf "$COMPRESSED_DIR"
    print_success "Cleaned up temporary files"
    echo ""

    print_success "✅ Build completed successfully!"
    print_success "📦 Output: src/versions/$VERSION.zip"
    echo ""
}

# Run the script
main
