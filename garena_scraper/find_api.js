const https = require('https');
const fs = require('fs');

function get(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', () => resolve(''));
    });
}

async function run() {
    console.log('Fetching main HTML...');
    const html = await get('https://shop.garena.my/app/10094/buy/0');
    fs.writeFileSync('shop.html', html);
    console.log('Saved to shop.html');
}
run();
