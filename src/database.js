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

router.post('/add/', upload.single('VIDEO'), async function (req, res) {
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
  try{
    const response = await multimedia.insert({
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
  try{
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

module.exports = router
