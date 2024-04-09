const fs = require('fs');
const path = require('path');

// Function to convert escaped characters in the string
function convertEscapedCharacters(input) {
    let result = input
        // Directly replace \n with actual newline ensuring it starts on a new line
        .replace(/\\n/g, '\n')
        // Replace \t with actual tab
        .replace(/\\t/g, '\t')

    return result;
}

// Function to read, convert, and write the file
function processFile(filePath) {
    fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        const convertedData = convertEscapedCharacters(data);
        const outputPath = path.join(path.dirname(filePath), path.basename(filePath));

        fs.writeFile(outputPath, convertedData, (err) => {
            if (err) {
                console.error('Error writing the converted file:', err);
                return;
            }

            console.log(`The file has been converted and saved as ${outputPath}`);
        });
    });
}

// Taking the filename from the command line arguments
const args = process.argv.slice(2); // The first two arguments are 'node' and the script name

if (args.length !== 1) {
    console.log('Usage: node convertFile.js <filename>');
    process.exit(1);
}

const filename = args[0];
processFile(filename);
