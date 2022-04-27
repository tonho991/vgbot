const fetch = require('node-fetch')
const fs = require('fs')

exports.getBase64 = getBase64 = async (url) => {
    const response = await fetch(url, { headers: { 'User-Agent': 'okhttp/4.5.0' } });
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const buffer = await response.buffer();
    const videoBase64 = `data:${response.headers.get('content-type')};base64,` + buffer.toString('base64');
    if (buffer)
        return videoBase64;
};

exports.getBuffer = getBuffer = async (url) => {
	const res = await fetch(url, {headers: {
	     'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 8.1.0; moto e5 play Build/OPGS28.54-53-8-20)',
	     'Referer': 'https://wikipedia.com/'
	}, method: 'GET' });
	
	const anu = fs.readFileSync('./src/error.png')
	if (!res.status === 200) return anu;
	const buff = await res.buffer();
	if (buff)
		return buff;
}

exports.fetchJson = fetchJson = (url, options) => new Promise(async (resolve, reject) => {
   
    fetch(url, options)
        .then(response => response.json())
        .then(json => {
            resolve(json)
        })
        .catch((err) => {
            resolve({"error": err});
        });
})


exports.fetchText = fetchText = (url, options) => new Promise(async (resolve, reject) => {
    fetch(url, options)
        .then(response => response.text())
        .then(text => {
            // console.log(text)
            resolve(text)
        })
        .catch((err) => {
            resolve({"error": err});
        })
})

//exports.getBase64 = getBase64;
