const nano = require('nano')('http://admin:admin@localhost:5984');
const multimedia = nano.db.use('multimedia');
const express = require('express')
const router = express.Router();
const fs = require('fs')
const path = require('path');
const util = require('util');
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const readFile = util.promisify(fs.readFile);

const supportKey = ["TÊN","THỂ LOẠI","KỊCH BẢN","ĐẠO DIỄN","BIÊN TẬP"]

router.post('/add/', upload.single('FILE'), async function (req, res) {
  try {
    const doc = req.body
    const docRes = await multimedia.insert(doc)

    if(req.file){
      const file = req.file
      const filePath = file.path
      const data = await readFile(filePath)
      if(docRes.ok){
        await multimedia.attachment.insert(
          docRes.id,
          file.filename,
          data,
          file.mimetype,
          {
            rev: docRes.rev
          }
        )
      }
      fs.unlink(filePath,function(){})
    }
    res.send(
      {
        status: true,
      }
    )
  } catch(e){
    console.log(e)
    res.send(
      {
        status: true,
      }
    )
  }
})

router.put('/edit/:id', async function (req, res) {
  try {
    const doc = await multimedia.get(req.params.id)
    const response = await multimedia.insert({
      ...doc,
      _id: req.params.id,
      ...req.body
    });
    res.send({
      status: response.ok
    })
  } catch(e){
    res.send({
      status: false
    })
  }

})


router.delete('/delete/:id', async function (req, res) {
  try {
    const response = await multimedia.destroy(req.params.id,req.body._rev);
    res.send({
      status: response.ok
    })
  } catch(e){
    res.send({
      status: false
    })
  }

})

router.get('/attachment/:docId/:attachId', async function (req, res){
  const {docId, attachId} = req.params
  const doc = await multimedia.get(docId);
  const attach = doc._attachments[attachId];
  try {
    if(attach) {
      console.log(attach)
      if(attach['content_type'].toLowerCase().includes('video')){
        if (req.headers.range) {
          const stream = await multimedia.attachment.getAsStream(docId, attachId, {Range: req.headers.range});
          stream.on('response', function(response) {
              const start = req.headers.range.replace(/bytes=/, "").split("-")[0];
              const end = response.headers['content-length'] - 1;
              const chunksize = (end-start)+1;
              const header = {
                 'ETag': response.headers.etag,
                 'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                 'Accept-Ranges': 'bytes',
                 'Content-Length': chunksize,
                 'Content-Type': response.headers['content-type'],
             }
             res.writeHead(206,head)
          });
          stream.pipe(res);
          stream.on('end', function() {
              res.end();
          });
          return
        }
      } else {
        const stream = await multimedia.attachment.getAsStream(docId, attachId);
        stream.on('response', function(response){
          const header = {
              'Content-Length': response.headers['content-length'],
              'Content-Type': response.headers['content-type'],
           }
           res.writeHead(200, head);
        })
        stream.pipe(res);
        stream.on('end', function() {
            res.end();
        });
      }
    } else {
      res.status(404).send("Resource not found!");
    }
  } catch (e){
    console.log(e)
    res.status(404).send("Resource not found!");
  }
})

module.exports = router
