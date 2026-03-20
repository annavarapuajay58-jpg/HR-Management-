const fs = require('fs');

try {
    const data = fs.readFileSync('server_output.log', 'utf16le');
    const lines = data.split('\n');
    let output = '';
    lines.forEach(line => {
        if (line.includes('Users_backup')) {
            output += line.trim() + '\n';
        }
    });
    fs.writeFileSync('parsed_sql.txt', output);
    console.log('Output written to parsed_sql.txt');
} catch (err) {
    console.error(err);
}
