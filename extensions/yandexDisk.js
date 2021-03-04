require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

// idk how to get token automatically, so sorry
const getOAuthToken = async () => {
  const tokenRequest = await fetch(`https://oauth.yandex.ru/authorize?response_type=token&client_id=${process.env.YANDEX_ID}`);
  const token = await tokenRequest.text();
  // console.log(token);
  return token;
};

const getUploadLink = async (filename, token) => {
  const requestLink = await fetch(`https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodeURI(filename)}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': ` OAuth ${token}`,
    },
  });
  const resultLink = await requestLink.json();
  // console.log(resultLink);
  return resultLink.href;
};

const uploadFile = async (filename, fileAdress) => {
  const link = await getUploadLink(filename, process.env.YANDEX_TOKEN);
  // console.log('link=', link);
  const file = fs.readFileSync(fileAdress);
  const zaliv = await fetch(link, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: file,
  });
  // const result = await zaliv.text(); // not used
  // console.log(result);
  if (zaliv.status === 201) {
    console.log('Файл загружен на Яндекс.Диск!');
  } else if (zaliv.status === 202) {
    console.log('Файл загружается на Яндекс.Диск, подождите немного!');
  } else {
    console.log('Something went wrong with Яндекс.Диск... Status:', zaliv.status);
  }
};

module.exports = { getOAuthToken, getUploadLink, uploadFile };
