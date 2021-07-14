const express = require('express')
const router = express.Router();
const nano = require('nano')('http://admin:admin@localhost:5984');
const multimedia = nano.db.use('multimedia');

router.get('/:docId/:attachId', async function(req, res){
  const {docId, attachId} = req.params
  let documentTag = `<h4>Resource can't be viewed!</h4>`
  try {
    const doc = await multimedia.get(docId);
    const attach = doc._attachments[attachId]
    const resourceURL = `/database/attachment/${docId}/${attachId}`
    const contentType = attach.content_type.toLowerCase();

    if(contentType.includes('pdf')){
      documentTag = `
        <object data="${resourceURL}" type="application/pdf" style="min-height:100vh;width:100%"></object>
      `
    } else if(contentType.includes('video')){
      documentTag = `
        <video controls="" autoplay="" name="media">
          <source src="${resourceURL}" type="${attach.content_type}">
        </video>
      `
    } else if(contentType.includes('ms')){
        res.redirect(resourceURL);
        return
    }
  } catch(e){

  }
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width">
      </head>
      <body>
        ${documentTag}
      </body>
    </html>
    `)
})

module.exports = router
