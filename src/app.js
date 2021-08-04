
const express = require('express')
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const app = express()
const port = process.env.PORT || 4000


cloudinary.config({
  cloud_name: 'triplebottomline',
  api_key: '263365459388179',
  api_secret: 'SandSfCt0gRVtX5RMKUUlDuRmS8'
}); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/recordLink', (req, res) => {
  const {link} = req.body;
  recordLink(link, res)

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const recordLink = async (link, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  });
  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start('./video/simple.mp4'); // video must have .mp4 has an extension.
  await page.goto(link);

  setTimeout(async () => {
    cloudinary.uploader.upload('./video/simple.mp4',
        { resource_type: "video", 
        public_id: `peek/peekVideo/${new Date().getTime()}`,
        chunk_size: 6000000, },
    async (err, result) => {
        await recorder.stop();
        res.json({stats:'ok', url: result.url})
        await browser.close();
    }); 
  }, 3000)
}
