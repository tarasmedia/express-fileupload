const fetch = require('node-fetch');
const FormData = require('form-data');
const request = require('request');
const axios = require('axios').default;

const mailRuGetFiles = async (cookies, scrfToken) => {
  const requestDirTree = await fetch(`https://cloud.mail.ru/api/v2/folder?token=${scrfToken}&home=/`, {
    headers: {
      'X-CSRF-Token': scrfToken,
      'Cookie': cookies,
    },
  });
  const dirTree = await requestDirTree.text();
  console.log(dirTree);
};

const mailRuGetCSRFToken = async (cookies, ssdcToken) => {
  const tokenRequest = await axios.get('https://cloud.mail.ru/api/v2/tokens/csrf', {
    'headers': {
      'Cookie': cookies,
    },
    maxRedirects: 0,
  });
  mailRuGetFiles(cookies, tokenRequest.data.body.token);
};

const tryv2 = (cookies, redirectLink) => {
  axios.get(redirectLink, {
    'headers': {
      'Cookie': cookies,
    },
    maxRedirects: 0,
  }).then((ress) => console.log('=====', ress.data.request)).catch((err) => {
    // console.log('++++++EROR', err.request.res.headers['set-cookie']);
    const resultCookies = `; ${cookies}; ${err.request.res.headers['set-cookie'].join('; ')}`;
    return mailRuGetCSRFToken(resultCookies);
  });
};

const mailRuGetSDCToken = async (cookies) => {
  axios.get('https://auth.mail.ru/sdc?from=https://cloud.mail.ru/home', {
    'headers': {
      'Cookie': cookies,
    },
    maxRedirects: 0,
  })
    .then((thisParameter) => console.log(thisParameter))
    // eslint-disable-next-line arrow-body-style
    .catch((err) => {
      // console.log('++++++EROR', err.request.res.headers.location);
      return tryv2(cookies, err.request.res.headers.location);
    });
};

const mailRuAuth = async (Login, Password) => {
  /*
  const form = new FormData({ Login, Password });
  form.append('Password', 'gas01');
  form.append('Login', 'marina.gasolina@mail.ru');
  console.log(form);
*/
  const options = {
    'method': 'POST',
    'url': 'https://auth.mail.ru/cgi-bin/auth',
    'headers': {
    },
    formData: { Login, Password },
  };
  request(options, (error, response) => {
    if (error) throw new Error(error);
    if (response.headers.location.match(/fail/g)) {
      console.log('wrong username or password');
    } else {
      const resultCookie = response.headers['set-cookie'].join('; ');
      // console.log(resultCookie);
      mailRuGetSDCToken(resultCookie);
    }
  });


  /*
  axios.post('https://auth.mail.ru/cgi-bin/auth', form, {
    headers: form.getHeaders(),
  }).then((result) => {
    const reg = /((?<=\<title\>).*(?=<\/title>))/gmi;

    console.log(result.data.match(reg));
    console.log(result.headers);
  });
  */
/*
  const http = require('http');

  const request = http.request({
    method: 'post',
    host: 'auth.mail.ru',
    path: '/cgi-bin/auth',
    headers: form.getHeaders(),
  });

  form.pipe(request);

  request.on('response', (res) => {
    console.log(res.statusCode);
    console.log(res.headers);

  });
*/
};

mailRuAuth('marina.gasolina777@mail.ru', 'gas01777');

/*
const mailRuDeleteFolder = async (filename) => {
  const mailRuTest = await fetch('https://cloud.mail.ru/api/v2/file/remove?home=%2F12341234%2F123&api=2&build=cloudweb-11943-73-7-4.202103101935&x-page-id=6rJD1KyUWa&email=taras.bulbik%40mail.ru&x-email=taras.bulbik%40mail.ru', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'mrcu=65565EFA05D614D08CD31CF6C0B0; p=Sg8CADncLgAA; tmr_lvidTS=1593443798833; tmr_lvid=886a0562add99c4096f624e6fdb76904; searchuid=3135450111593187006; OTVET-8283=3; t=obLD1AAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAQAAAAcAAsFyAcA; s=dpr=1.25|rt=1; _ga=GA1.3.1935991454.1605206310; _ym_uid=1615028582526728406; _ym_d=1615028582; _gid=GA1.2.780999786.1615633104; _gid=GA1.3.780999786.1615633104; _ym_isad=1; _ce.s=v11.rlc~1615638126573; i=AQA8mkxgCgATAAiLLnQAAaMAAc8AAR8BASMBAUIBAWIBAY8BARoCATkCAeoCAWMDASgEAU0EAYMEAbIHAc0HAdAHAdEHAdIHAdMHAVsIAZ4IATwJAdMJAfEJAVwKAW4KAYQKAUQLARcOAYUaAYwaAfIbAVAcAY8cAZAcAXseAX0eAdYgAeQgAecgAe4gAfQgAfUgAfYgAU4CCM1EFAEBKwEBlAEBKgIB0wUB2wUB3wcBVQgBwQgBwggBwwgBxAgBxQgBxggBSQkBSwkBdAkBeQkBkQkBkwkB+AkBXQoBkwoBrwoB9goB9woBHAsBIAsBWwsBXAsBXQsBXwsBYAsBcgsBcwsBdAsBdgsBeAsBewsBfAsBhgsBhwsBkwsBlAsBswsB6gsB7QsB7gsBFAwBKgwBKwwBRgwBRwwBUQwBUgwBaAwBgAwBjgwBkQwBqwwBrAwBrgwBrwwBsQwBsgwBvAwBvgwBzwwBXwIIOhNjAAYSCAMTCAMUCAMYCAFYCAN4CAOACAWHCAOoCAG7CAI1CgE8CgJTCgNjCgJoCgKGCgK0CgS3CgKLAggHAm8AAfsAAZMCCH8qbQABdAABtwABuAABuQAB0AABbwEBAQIBAgIBAwIBBAIBBQIBDAIBDwIBEgIBFQIBagIBmwIB4wIBLQUBYAUBbgUBcQUBdQUBoAUBpQUBpgUBqQUBFgYBHgYBJgYBgQYBxwsByAsByQsBywsBzAsBZQ0BcQ0Bcw0BeA0BomMB3AQIBAEBAAHhBAkBAeIECgQBBMgHvQcIBAGCFQEpCQh2J3ICAdoCAewCAe0CAQQDAZgDAagDASMEASQEASUEAXcEAYkEAY0EAZMEAQMFAQ0HAS4HAUAHAa0HAbUHAbcHAbgHAbkHAekHAeoHAe0HAUkIAU8IAVcIAV8IAboIAcULAccLAcgLAckLAcsLAcwLAWUNAckNAQ==; Mpop=1615654084:0703725263554c011905000017031f051c054f6c5150445e05190401041d4558425642175b4d5d52585c145a545858194b44:taras.bulbik@mail.ru:; sdcs=SR2ADWctXjbJ1EHB; c=xuxMYAIAsHsTAAAUAAAAJM4y0QkAAIAA; b=CkkEAJC4tnQATfGUi6R4ykWZI+yjyBH2cTvAEQonAACAAAAA; _gat_gtag_UA_43037165_12=1; tmr_detect=1%7C1615654087337; _ga=GA1.1.1935991454.1605206310; _ga_6DLYPC3RWR=GS1.1.1615654087.12.1.1615654097.50; tmr_reqNum=110; VID=08QmcK0fWCo1::84515535:5674584-0-56744ea-410738c:CAASELyC4lY0DGTawBrnS5tcKiIacIhjS1NL8vTcwOJCIM1_WylhxnYzukImE8lST3oVQong_juepBQSevXmNvJ6nAaA4QYtS73AMTr6H9olrP32-mnzzt_yabpbEy2jxZADfUZZTSIYBQSmWGy9mRy9afwEGceADLVdUJVQNJt9bLH8nC4',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 YaBrowser/21.2.2.101 Yowser/2.5 Safari/537.36',
      'X-CSRF-Token': 'AG_sbxGEdmzXMiPHZ431tncO',
      'X-Requested-With': 'XMLHttpRequest',
    },

  });
  const result = await mailRuTest.text();
  console.log(result);
};
// mailRuDeleteFolder('%2F123123%2Ftest1');
*/
